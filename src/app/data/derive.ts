import { titles, Title, PLATFORM_COLORS, KNOWN_COUNTRIES } from './dataset';

export interface Filters {
  platforms: string[];        // active platforms (empty = all)
  contentType: 'all' | 'Movie' | 'TV Show';
  genres: string[];           // active genres  (empty = all)
  countries: string[];        // active countries (empty = all)
  releaseYearFrom: number;
  releaseYearTo: number;
  ageRatings: string[];       // active ratings (empty = all)
}

export const DEFAULT_FILTERS: Filters = {
  platforms: ['Netflix', 'Prime Video', 'Disney+', 'Hulu'],
  contentType: 'all',
  genres: [],
  countries: [],
  releaseYearFrom: 2008,
  releaseYearTo: 2024,
  ageRatings: [],
};

export function filterTitles(f: Filters): Title[] {
  return titles.filter((t) => {
    if (f.platforms.length && !f.platforms.includes(t.platform)) return false;
    if (f.contentType !== 'all' && t.type !== f.contentType) return false;
    if (f.genres.length && !f.genres.includes(t.genre)) return false;
    if (f.countries.length && !f.countries.includes(t.country)) return false;
    if (t.releaseYear < f.releaseYearFrom || t.releaseYear > f.releaseYearTo) return false;
    if (f.ageRatings.length && !f.ageRatings.includes(t.ageRating)) return false;
    return true;
  });
}

const GENRE_COLORS: Record<string, string> = {
  Drama: '#2563EB', Comedy: '#10B981', Action: '#E50914', Documentary: '#F59E0B',
  Thriller: '#8B5CF6', Horror: '#EF4444', Romance: '#EC4899', 'Sci-Fi': '#06B6D4',
  Animation: '#84CC16', Crime: '#F97316', Fantasy: '#A855F7', History: '#14B8A6',
};

const COUNTRY_COLORS = ['#2563EB','#F59E0B','#10B981','#E50914','#8B5CF6','#06B6D4','#EC4899','#EF4444','#F97316'];
const DIR_COLORS = ['#2563EB','#10B981','#E50914','#8B5CF6','#F59E0B','#06B6D4','#EC4899','#F97316','#84CC16','#A855F7'];

export function deriveChartData(filtered: Title[]) {
  const totalMovies = filtered.filter((t) => t.type === 'Movie').length;
  const totalTVShows = filtered.filter((t) => t.type === 'TV Show').length;

  // ── Growth Trend ─────────────────────────────────────────────────────────────
  const years = ['2015','2016','2017','2018','2019','2020','2021','2022','2023'];
  const growthData = years.map((yr) => {
    const y = parseInt(yr);
    const obj: Record<string, number | string> = { year: yr };
    ['Netflix','Prime Video','Disney+','Hulu'].forEach((p) => {
      const key = p === 'Prime Video' ? 'Prime' : p;
      obj[key] = filtered.filter((t) => t.platform === p && t.releaseYear <= y).length;
    });
    return obj;
  });

  // ── Platform Distribution ─────────────────────────────────────────────────────
  const platformData = ['Netflix','Prime Video','Disney+','Hulu']
    .map((p) => ({ platform: p, titles: filtered.filter((t) => t.platform === p).length, color: PLATFORM_COLORS[p] }))
    .filter((d) => d.titles > 0)
    .sort((a, b) => b.titles - a.titles);

  // ── Content Type ──────────────────────────────────────────────────────────────
  const contentTypeData = [
    { name: 'Movies', value: totalMovies, color: '#2563EB' },
    { name: 'TV Shows', value: totalTVShows, color: '#8B5CF6' },
  ].filter((d) => d.value > 0);

  // ── Genre ─────────────────────────────────────────────────────────────────────
  const genreCounts: Record<string, number> = {};
  filtered.forEach((t) => { genreCounts[t.genre] = (genreCounts[t.genre] || 0) + 1; });
  const genreData = Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count, color: GENRE_COLORS[genre] ?? '#64748B' }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── Country ───────────────────────────────────────────────────────────────────
  const countryCounts: Record<string, number> = {};
  filtered.forEach((t) => {
    const c = KNOWN_COUNTRIES.includes(t.country) ? t.country : 'Other';
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });
  const countryData = Object.entries(countryCounts)
    .map(([country, count], i) => ({ country, count, color: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // ── Treemap ───────────────────────────────────────────────────────────────────
  const treemapData = Object.entries(genreCounts)
    .map(([name, size]) => ({ name, size, fill: GENRE_COLORS[name] ?? '#64748B' }))
    .sort((a, b) => b.size - a.size);

  // ── Scatter ───────────────────────────────────────────────────────────────────
  const scatterData = filtered
    .filter((t) => t.imdb > 0 && t.rt > 0)
    .slice(0, 50)
    .map((t) => ({ title: t.title, imdb: t.imdb, rt: t.rt, platform: t.platform, size: Math.round(t.imdb * 80) }));

  // ── Runtime Histogram ─────────────────────────────────────────────────────────
  const buckets = [
    { range: '< 30m', min: 0, max: 29 },
    { range: '30–60m', min: 30, max: 60 },
    { range: '61–90m', min: 61, max: 90 },
    { range: '91–120m', min: 91, max: 120 },
    { range: '121–150m', min: 121, max: 150 },
    { range: '151–180m', min: 151, max: 180 },
    { range: '> 180m', min: 181, max: 9999 },
  ];
  const runtimeData = buckets.map((b) => ({
    range: b.range,
    count: filtered.filter((t) => t.runtime >= b.min && t.runtime <= b.max).length,
  }));

  // ── Top Directors ─────────────────────────────────────────────────────────────
  const dirCounts: Record<string, number> = {};
  filtered.forEach((t) => { dirCounts[t.director] = (dirCounts[t.director] || 0) + 1; });
  const directorsData = Object.entries(dirCounts)
    .filter(([d]) => d !== 'Various')
    .map(([director, count], i) => ({ director, titles: count, color: DIR_COLORS[i % DIR_COLORS.length] }))
    .sort((a, b) => b.titles - a.titles)
    .slice(0, 10);

  return {
    kpi: { totalTitles: filtered.length, totalMovies, totalTVShows, totalPlatforms: new Set(filtered.map((t) => t.platform)).size },
    growthData,
    platformData,
    contentTypeData,
    genreData,
    countryData,
    treemapData,
    scatterData,
    runtimeData,
    directorsData,
  };
}

export type ChartData = ReturnType<typeof deriveChartData>;
