import type { Title } from "../app/data/dataset";
import { closeEngineSession, openEngineAppSession } from "./enigma";

interface FieldMap {
  title: string;
  platform: string;
  contentType: string;
  genre: string;
  country: string;
  releaseYear: string;
  ageRating: string;
  runtime: string;
  director: string;
  imdb: string;
  rt: string;
}

export interface QlikFilterOptions {
  platforms: string[];
  genres: string[];
  countries: string[];
  ageRatings: string[];
  releaseYears: number[];
}

export interface QlikDashboardData {
  titles: Title[];
  options: QlikFilterOptions;
}

function normalizeFieldName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function quoteFieldName(fieldName: string): string {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(fieldName)) {
    return fieldName;
  }
  return `[${fieldName.replace(/]/g, "]]" )}]`;
}

function pickField(available: string[], candidates: string[], label: string): string {
  const normalized = new Map<string, string>();
  for (const field of available) {
    normalized.set(normalizeFieldName(field), field);
  }

  for (const candidate of candidates) {
    const found = normalized.get(normalizeFieldName(candidate));
    if (found) {
      return found;
    }
  }

  throw new Error(`Missing required Qlik field for ${label}. Available fields: ${available.join(", ")}`);
}

async function getAvailableFields(app: any): Promise<string[]> {
  const listObject = await app.createSessionObject({
    qInfo: { qType: "FieldList" },
    qFieldListDef: {
      qShowSystem: false,
      qShowHidden: false,
      qShowDerivedFields: true,
      qShowSemantic: true,
    },
  });

  const layout = await listObject.getLayout();
  const items = (layout?.qFieldList?.qItems ?? []) as Array<{ qName?: string }>;
  return items.map((item) => item.qName).filter((name): name is string => Boolean(name));
}

function resolveFieldMap(availableFields: string[]): FieldMap {
  return {
    title: pickField(availableFields, ["Title", "Show Title", "Movie Title", "Name"], "Title"),
    platform: pickField(availableFields, ["Platform", "OTT Platform", "Service", "Provider"], "Platform"),
    contentType: pickField(availableFields, ["Type", "Content Type", "Show Type"], "Content Type"),
    genre: pickField(availableFields, ["Genre", "Genres", "Category"], "Genre"),
    country: pickField(availableFields, ["Country", "Origin Country"], "Country"),
    releaseYear: pickField(availableFields, ["Release Year", "Year", "ReleaseYear"], "Release Year"),
    ageRating: pickField(availableFields, ["Age Rating", "Rating", "Maturity Rating", "Certificate"], "Age Rating"),
    runtime: pickField(availableFields, ["Runtime", "Duration", "Runtime Minutes"], "Runtime"),
    director: pickField(availableFields, ["Director", "Directors"], "Director"),
    imdb: pickField(availableFields, ["IMDb Rating", "IMDB Rating", "IMDb", "IMDB", "IMDb Score"], "IMDb Rating"),
    rt: pickField(availableFields, ["Rotten Tomatoes", "RT", "Rotten Tomatoes Rating", "Tomatometer"], "Rotten Tomatoes"),
  };
}

function parseNumericCell(cell: any): number {
  if (typeof cell?.qNum === "number" && Number.isFinite(cell.qNum)) {
    return cell.qNum;
  }
  const parsed = Number(String(cell?.qText ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

async function fetchListValues(app: any, fieldName: string): Promise<string[]> {
  const listObject = await app.createSessionObject({
    qInfo: { qType: "FilterList" },
    qListObjectDef: {
      qDef: {
        qFieldDefs: [quoteFieldName(fieldName)],
      },
      qInitialDataFetch: [{ qTop: 0, qLeft: 0, qWidth: 1, qHeight: 5000 }],
    },
  });

  const layout = await listObject.getLayout();
  const matrix = layout?.qListObject?.qDataPages?.[0]?.qMatrix ?? [];
  const values = matrix
    .map((row: any[]) => row[0]?.qText)
    .filter((value: unknown): value is string => Boolean(value) && value !== "-");
  return uniqueSorted(values);
}

export async function fetchQlikDashboardData(): Promise<QlikDashboardData> {
  const engineSession = await openEngineAppSession();

  try {
    const availableFields = await getAvailableFields(engineSession.app);
    const fields = resolveFieldMap(availableFields);
    const columnFields = [
      fields.title,
      fields.platform,
      fields.contentType,
      fields.genre,
      fields.country,
      fields.releaseYear,
      fields.ageRating,
      fields.runtime,
      fields.director,
      fields.imdb,
      fields.rt,
    ];

    const cubeObject = await engineSession.app.createSessionObject({
      qInfo: { qType: "OttTitlesCube" },
      qHyperCubeDef: {
        qDimensions: columnFields.map((field) => ({
          qDef: {
            qFieldDefs: [quoteFieldName(field)],
          },
        })),
        qMeasures: [],
        qInitialDataFetch: [{ qTop: 0, qLeft: 0, qWidth: columnFields.length, qHeight: 1000 }],
      },
    });

    const layout = await cubeObject.getLayout();
    const totalRows = layout?.qHyperCube?.qSize?.qcy ?? 0;
    const pages: any[] = [...(layout?.qHyperCube?.qDataPages ?? [])];

    for (let top = pages.length > 0 ? 1000 : 0; top < totalRows; top += 1000) {
      const fetchedPages = await cubeObject.getHyperCubeData("/qHyperCubeDef", [
        { qTop: top, qLeft: 0, qWidth: columnFields.length, qHeight: 1000 },
      ]);
      pages.push(...fetchedPages);
    }

    const matrixRows = pages.flatMap((page) => page.qMatrix ?? []);
    const titles: Title[] = matrixRows.map((row, index) => ({
      id: index,
      title: row[0]?.qText ?? "Unknown",
      platform: row[1]?.qText ?? "Unknown",
      type: row[2]?.qText ?? "Unknown",
      genre: row[3]?.qText ?? "Unknown",
      country: row[4]?.qText ?? "Unknown",
      releaseYear: Math.round(parseNumericCell(row[5])),
      ageRating: row[6]?.qText ?? "NR",
      runtime: Math.round(parseNumericCell(row[7])),
      director: row[8]?.qText ?? "Unknown",
      imdb: Number(parseNumericCell(row[9]).toFixed(1)),
      rt: Math.round(parseNumericCell(row[10])),
    }));

    const [platforms, genres, countries, ageRatings, releaseYearValues] = await Promise.all([
      fetchListValues(engineSession.app, fields.platform),
      fetchListValues(engineSession.app, fields.genre),
      fetchListValues(engineSession.app, fields.country),
      fetchListValues(engineSession.app, fields.ageRating),
      fetchListValues(engineSession.app, fields.releaseYear),
    ]);

    const releaseYears = releaseYearValues
      .map((value) => Number(value.replace(/[^0-9.-]/g, "")))
      .filter((value) => Number.isFinite(value))
      .map((value) => Math.round(value))
      .sort((a, b) => a - b);

    return {
      titles,
      options: {
        platforms,
        genres,
        countries,
        ageRatings,
        releaseYears,
      },
    };
  } finally {
    await closeEngineSession(engineSession);
  }
}