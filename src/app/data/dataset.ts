export type Platform = 'Netflix' | 'Prime Video' | 'Disney+' | 'Hulu';
export type ContentType = 'Movie' | 'TV Show';

export interface Title {
  id: number;
  title: string;
  platform: Platform;
  type: ContentType;
  genre: string;
  country: string;
  releaseYear: number;
  ageRating: string;
  runtime: number;
  director: string;
  imdb: number;
  rt: number;
}

type R = [string, Platform, ContentType, string, string, number, string, number, string, number, number];

const raw: R[] = [
  // ── Netflix ──────────────────────────────────────────────────────────────────
  ['Stranger Things','Netflix','TV Show','Sci-Fi','United States',2016,'TV-14',51,'Matt Duffer',8.7,93],
  ['Wednesday','Netflix','TV Show','Horror','United States',2022,'TV-14',50,'Tim Burton',8.1,72],
  ['Squid Game','Netflix','TV Show','Thriller','South Korea',2021,'TV-MA',32,'Hwang Dong-hyuk',8.0,95],
  ['Bridgerton','Netflix','TV Show','Romance','United Kingdom',2020,'TV-MA',63,'Chris Van Dusen',7.3,82],
  ['Ozark','Netflix','TV Show','Crime','United States',2017,'TV-MA',60,'Jason Bateman',8.4,84],
  ['The Crown','Netflix','TV Show','Drama','United Kingdom',2016,'TV-MA',58,'Peter Morgan',8.6,88],
  ['Money Heist','Netflix','TV Show','Crime','Spain',2017,'TV-MA',45,'Álex Pina',8.2,58],
  ['Dark','Netflix','TV Show','Sci-Fi','Germany',2017,'TV-MA',60,'Baran bo Odar',8.7,95],
  ['Narcos','Netflix','TV Show','Crime','United States',2015,'TV-MA',49,'Chris Brancato',8.8,89],
  ['Cobra Kai','Netflix','TV Show','Action','United States',2018,'TV-14',30,'Josh Heald',8.5,87],
  ['Lupin','Netflix','TV Show','Crime','France',2021,'TV-14',45,'Louis Leterrier',7.5,97],
  ['Emily in Paris','Netflix','TV Show','Comedy','United States',2020,'TV-MA',30,'Darren Star',7.1,63],
  ['The Witcher','Netflix','TV Show','Fantasy','United States',2019,'TV-MA',60,'Lauren Schmidt',8.2,68],
  ['Mindhunter','Netflix','TV Show','Crime','United States',2017,'TV-MA',54,'David Fincher',8.6,97],
  ['Unorthodox','Netflix','TV Show','Drama','Germany',2020,'TV-MA',52,'Maria Schrader',7.9,98],
  ['Sex Education','Netflix','TV Show','Comedy','United Kingdom',2019,'TV-MA',45,'Ben Taylor',8.3,97],
  ['The Umbrella Academy','Netflix','TV Show','Action','United States',2019,'TV-14',60,'Steve Blackman',7.9,77],
  ['All of Us Are Dead','Netflix','TV Show','Horror','South Korea',2022,'TV-MA',60,'Lee Jae-kyoo',7.4,86],
  ['Hellbound','Netflix','TV Show','Horror','South Korea',2021,'TV-MA',60,'Yeon Sang-ho',6.9,71],
  ['Extraordinary Attorney Woo','Netflix','TV Show','Drama','South Korea',2022,'TV-14',60,'Yu In-shik',8.3,95],
  ['Reply 1988','Netflix','TV Show','Drama','South Korea',2015,'TV-PG',90,'Shin Won-ho',9.3,99],
  ['Sacred Games','Netflix','TV Show','Crime','India',2018,'TV-MA',50,'Vikramaditya Motwane',8.6,97],
  ['Delhi Crime','Netflix','TV Show','Crime','India',2019,'TV-MA',45,'Richie Mehta',8.6,100],
  ['Kota Factory','Netflix','TV Show','Drama','India',2019,'TV-14',40,'Raghav Subbu',9.0,96],
  ['Barbarians','Netflix','TV Show','History','Germany',2020,'TV-MA',42,'Andreas Heckmann',7.3,91],
  ['Elite','Netflix','TV Show','Thriller','Spain',2018,'TV-MA',45,'Ramón Salazar',7.5,85],
  ['Fauda','Netflix','TV Show','Thriller','Israel',2015,'TV-MA',60,'Lior Raz',8.2,95],
  ['Bird Box','Netflix','Movie','Horror','United States',2018,'R',124,'Susanne Bier',6.6,64],
  ['Roma','Netflix','Movie','Drama','Mexico',2018,'R',135,'Alfonso Cuarón',7.7,96],
  ['The Irishman','Netflix','Movie','Crime','United States',2019,'R',209,'Martin Scorsese',7.8,98],
  ['Marriage Story','Netflix','Movie','Drama','United States',2019,'R',137,'Noah Baumbach',7.9,95],
  ['Mank','Netflix','Movie','Drama','United States',2020,'R',131,'David Fincher',6.8,74],
  ["Don't Look Up",'Netflix','Movie','Comedy','United States',2021,'R',138,'Adam McKay',7.2,55],
  ['The Power of the Dog','Netflix','Movie','Drama','New Zealand',2021,'R',126,'Jane Campion',6.8,89],
  ['Extraction','Netflix','Movie','Action','United States',2020,'R',116,'Sam Hargrave',6.7,67],
  ['Enola Holmes','Netflix','Movie','Action','United Kingdom',2020,'PG-13',123,'Harry Bradbeer',6.6,91],
  ['The Gray Man','Netflix','Movie','Action','United States',2022,'PG-13',122,'Anthony Russo',6.5,45],
  ['Knives Out','Netflix','Movie','Thriller','United States',2019,'PG-13',130,'Rian Johnson',7.9,97],
  ['Get Out','Netflix','Movie','Horror','United States',2017,'R',104,'Jordan Peele',7.7,98],
  ['Okja','Netflix','Movie','Drama','South Korea',2017,'TV-14',120,'Bong Joon-ho',7.3,87],
  ['Klaus','Netflix','Movie','Animation','Spain',2019,'PG',97,'Sergio Pablos',8.2,94],
  ['Over the Moon','Netflix','Movie','Animation','United States',2020,'PG',100,'Glen Keane',7.0,81],
  ['The Platform','Netflix','Movie','Thriller','Spain',2019,'TV-MA',94,'Galder Gaztelu-Urrutia',7.0,82],
  ['Army of the Dead','Netflix','Movie','Horror','United States',2021,'R',148,'Zack Snyder',5.7,68],
  ['The Old Guard','Netflix','Movie','Action','United States',2020,'R',125,'Gina Prince-Bythewood',6.6,81],
  // ── Prime Video ──────────────────────────────────────────────────────────────
  ['The Boys','Prime Video','TV Show','Action','United States',2019,'TV-MA',60,'Eric Kripke',8.7,84],
  ['Invincible','Prime Video','TV Show','Animation','United States',2021,'TV-MA',45,'Robert Kirkman',8.7,97],
  ['Reacher','Prime Video','TV Show','Action','United States',2022,'TV-MA',60,'Nick Santora',7.9,91],
  ['The Marvelous Mrs. Maisel','Prime Video','TV Show','Comedy','United States',2017,'TV-MA',57,'Amy Sherman-Palladino',8.7,98],
  ['The Expanse','Prime Video','TV Show','Sci-Fi','United States',2015,'TV-14',43,'Mark Fergus',8.5,98],
  ['Jack Ryan','Prime Video','TV Show','Thriller','United States',2018,'TV-MA',60,'Carlton Cuse',8.0,83],
  ['Fleabag','Prime Video','TV Show','Comedy','United Kingdom',2016,'TV-MA',30,'Phoebe Waller-Bridge',8.7,100],
  ['Good Omens','Prime Video','TV Show','Comedy','United Kingdom',2019,'TV-MA',55,'Douglas Mackinnon',8.0,72],
  ['Rings of Power','Prime Video','TV Show','Fantasy','United States',2022,'TV-14',70,'JD Payne',6.9,85],
  ['Outer Range','Prime Video','TV Show','Thriller','United States',2022,'TV-14',60,'Brian Watkins',7.6,67],
  ['The Terminal List','Prime Video','TV Show','Action','United States',2022,'TV-MA',60,'Daniel Shattuck',8.1,39],
  ['Carnival Row','Prime Video','TV Show','Fantasy','United States',2019,'TV-MA',60,'René Echevarria',7.8,63],
  ['Paper Girls','Prime Video','TV Show','Sci-Fi','United States',2022,'TV-14',30,'Stephany Folsom',7.2,92],
  ['The Man in the High Castle','Prime Video','TV Show','Sci-Fi','United States',2015,'TV-MA',60,'Frank Spotnitz',7.9,80],
  ['Homecoming','Prime Video','TV Show','Thriller','United States',2018,'TV-MA',30,'Sam Esmail',7.5,98],
  ['Undone','Prime Video','TV Show','Drama','United States',2019,'TV-MA',22,'Hisko Hulsing',8.1,99],
  ['The Wheel of Time','Prime Video','TV Show','Fantasy','United States',2021,'TV-14',60,'Rafe Judkins',7.1,85],
  ['The Legend of Vox Machina','Prime Video','TV Show','Animation','United States',2022,'TV-MA',24,'Matthew Colby',8.3,94],
  ['Panchayat','Prime Video','TV Show','Comedy','India',2020,'TV-PG',30,'Deepak Kumar Mishra',8.9,96],
  ['Mirzapur','Prime Video','TV Show','Crime','India',2018,'TV-MA',45,'Gurmmeet Singh',8.4,90],
  ['Scam 1992','Prime Video','TV Show','Drama','India',2020,'TV-14',45,'Hansal Mehta',9.3,97],
  ['Made in Heaven','Prime Video','TV Show','Drama','India',2019,'TV-MA',55,'Zoya Akhtar',8.5,98],
  ['Breathe','Prime Video','TV Show','Thriller','India',2018,'TV-14',40,'Mayank Sharma',8.0,89],
  ['A Very English Scandal','Prime Video','TV Show','Drama','United Kingdom',2018,'TV-MA',57,'Stephen Frears',7.7,98],
  ['The Rig','Prime Video','TV Show','Thriller','United Kingdom',2023,'TV-MA',50,'John Strickland',7.2,84],
  ['Manchester by the Sea','Prime Video','Movie','Drama','United States',2016,'R',137,'Kenneth Lonergan',7.9,96],
  ['The Big Sick','Prime Video','Movie','Comedy','United States',2017,'R',120,'Michael Showalter',7.5,97],
  ['Sound of Metal','Prime Video','Movie','Drama','United States',2019,'R',120,'Darius Marder',7.8,98],
  ['One Night in Miami','Prime Video','Movie','Drama','United States',2020,'PG-13',110,'Regina King',7.2,91],
  ['Being the Ricardos','Prime Video','Movie','Drama','United States',2021,'R',131,'Aaron Sorkin',6.6,68],
  ['Thirteen Lives','Prime Video','Movie','Drama','United States',2022,'PG-13',143,'Ron Howard',7.7,88],
  ['The Northman','Prime Video','Movie','Action','United States',2022,'R',137,'Robert Eggers',7.1,89],
  ['Samaritan','Prime Video','Movie','Action','United States',2022,'PG-13',101,'Julius Avery',5.8,42],
  ['Catherine Called Birdy','Prime Video','Movie','Comedy','United Kingdom',2022,'PG-13',108,'Lena Dunham',6.8,86],
  ['Nope','Prime Video','Movie','Horror','United States',2022,'R',130,'Jordan Peele',7.0,82],
  ['Ambulance','Prime Video','Movie','Action','United States',2022,'R',136,'Michael Bay',6.3,68],
  ['My Policeman','Prime Video','Movie','Drama','United Kingdom',2022,'R',113,'Michael Grandage',6.4,55],
  ['Tender Bar','Prime Video','Movie','Drama','United States',2021,'R',104,'George Clooney',6.2,61],
  // ── Disney+ ──────────────────────────────────────────────────────────────────
  ['The Mandalorian','Disney+','TV Show','Sci-Fi','United States',2019,'TV-14',40,'Jon Favreau',8.6,93],
  ['WandaVision','Disney+','TV Show','Action','United States',2021,'TV-PG',30,'Matt Shakman',7.9,91],
  ['Loki','Disney+','TV Show','Action','United States',2021,'TV-14',50,'Kate Herron',7.9,88],
  ['Hawkeye','Disney+','TV Show','Action','United States',2021,'TV-14',48,'Rhys Thomas',7.5,92],
  ['Moon Knight','Disney+','TV Show','Action','United States',2022,'TV-14',44,'Mohamed Diab',7.4,85],
  ['Andor','Disney+','TV Show','Sci-Fi','United Kingdom',2022,'TV-14',42,'Tony Gilroy',8.3,96],
  ['Obi-Wan Kenobi','Disney+','TV Show','Sci-Fi','United States',2022,'TV-14',35,'Deborah Chow',7.3,82],
  ['The Book of Boba Fett','Disney+','TV Show','Sci-Fi','United States',2021,'TV-14',40,'Robert Rodriguez',7.2,72],
  ['Ms. Marvel','Disney+','TV Show','Action','United States',2022,'TV-PG',42,'Adil El Arbi',7.3,97],
  ['She-Hulk','Disney+','TV Show','Comedy','United States',2022,'TV-PG',34,'Kat Coiro',5.2,82],
  ['Secret Invasion','Disney+','TV Show','Thriller','United States',2023,'TV-14',45,'Ali Selim',6.1,58],
  ['Willow','Disney+','TV Show','Fantasy','United Kingdom',2022,'TV-14',48,'Jon M. Chu',7.0,87],
  ['Star Wars Visions','Disney+','TV Show','Animation','Japan',2021,'TV-PG',15,'Various',7.8,100],
  ['National Parks','Disney+','TV Show','Documentary','United States',2020,'TV-G',60,'Ken Burns',9.1,99],
  ['The Beatles Get Back','Disney+','TV Show','Documentary','United Kingdom',2021,'PG',470,'Peter Jackson',8.0,97],
  ['Assembled','Disney+','TV Show','Documentary','United States',2021,'TV-PG',45,'Various',7.5,90],
  ['Soul','Disney+','Movie','Animation','United States',2020,'PG',101,'Pete Docter',8.1,95],
  ['Raya and the Last Dragon','Disney+','Movie','Animation','United States',2021,'PG',107,'Don Hall',7.4,95],
  ['Encanto','Disney+','Movie','Animation','United States',2021,'PG',99,'Byron Howard',7.2,91],
  ['Turning Red','Disney+','Movie','Animation','Canada',2022,'PG',100,'Domee Shi',7.0,95],
  ['Lightyear','Disney+','Movie','Animation','United States',2022,'PG',100,'Angus MacLane',5.6,74],
  ['Doctor Strange MOM','Disney+','Movie','Action','United States',2022,'PG-13',126,'Sam Raimi',6.9,74],
  ['Thor Love and Thunder','Disney+','Movie','Action','United States',2022,'PG-13',119,'Taika Waititi',6.3,64],
  ['Black Panther Wakanda','Disney+','Movie','Action','United States',2022,'PG-13',161,'Ryan Coogler',6.8,84],
  ['Prey','Disney+','Movie','Action','United States',2022,'R',99,'Dan Trachtenberg',7.1,92],
  ['Strange World','Disney+','Movie','Animation','United States',2022,'PG',102,'Don Hall',5.7,73],
  ['Shang-Chi','Disney+','Movie','Action','United States',2021,'PG-13',132,'Destin Daniel Cretton',7.4,91],
  ['Jungle Cruise','Disney+','Movie','Action','United States',2021,'PG-13',127,'Jaume Collet-Serra',6.6,63],
  ['Free Guy','Disney+','Movie','Comedy','United States',2021,'PG-13',115,'Shawn Levy',7.1,81],
  ['The Last Duel','Disney+','Movie','History','United States',2021,'R',152,'Ridley Scott',7.4,84],
  // ── Hulu ─────────────────────────────────────────────────────────────────────
  ['The Bear','Hulu','TV Show','Drama','United States',2022,'TV-MA',30,'Christopher Storer',8.7,98],
  ['Only Murders in the Building','Hulu','TV Show','Comedy','United States',2021,'TV-14',35,'John Hoffman',8.1,99],
  ['What We Do in the Shadows','Hulu','TV Show','Comedy','United States',2019,'TV-MA',30,'Jemaine Clement',8.6,97],
  ["The Handmaid's Tale",'Hulu','TV Show','Drama','United States',2017,'TV-MA',60,'Bruce Miller',8.4,82],
  ['Reservation Dogs','Hulu','TV Show','Comedy','United States',2021,'TV-MA',30,'Sterlin Harjo',8.2,100],
  ['Little Fires Everywhere','Hulu','TV Show','Drama','United States',2020,'TV-MA',60,'Liz Tigelaar',7.6,86],
  ['The Great','Hulu','TV Show','Comedy','United States',2020,'TV-MA',55,'Tony McNamara',8.0,87],
  ['Dopesick','Hulu','TV Show','Drama','United States',2021,'TV-MA',60,'Danny Strong',8.4,98],
  ['Nine Perfect Strangers','Hulu','TV Show','Thriller','United States',2021,'TV-MA',55,'Jonathan Levine',6.8,55],
  ['Ramy','Hulu','TV Show','Comedy','United States',2019,'TV-MA',30,'Ramy Youssef',8.1,98],
  ['Castle Rock','Hulu','TV Show','Horror','United States',2018,'TV-MA',60,'Sam Shaw',7.6,74],
  ['The Dropout','Hulu','TV Show','Drama','United States',2022,'TV-MA',50,'Liz Meriwether',7.7,92],
  ['Pam & Tommy','Hulu','TV Show','Drama','United States',2022,'TV-MA',45,'Craig Gillespie',7.3,88],
  ['Under the Banner of Heaven','Hulu','TV Show','Crime','United States',2022,'TV-MA',55,'Dustin Lance Black',7.7,90],
  ['The Patient','Hulu','TV Show','Thriller','United States',2022,'TV-MA',30,'Joel Fields',8.1,96],
  ['Candy','Hulu','TV Show','Crime','United States',2022,'TV-MA',50,'Michael Uppendahl',7.3,84],
  ['High Fidelity','Hulu','TV Show','Comedy','United States',2020,'TV-MA',30,'Zoë Kravitz',7.2,96],
  ['Sasquatch','Hulu','TV Show','Documentary','United States',2021,'TV-MA',40,'Joshua Rofé',7.4,100],
  ['Hillary','Hulu','TV Show','Documentary','United States',2020,'TV-14',90,'Nanette Burstein',7.4,89],
  ['Framing Britney','Hulu','TV Show','Documentary','United States',2021,'TV-14',75,'Samantha Stark',7.5,87],
  ['Palm Springs','Hulu','Movie','Comedy','United States',2020,'R',90,'Max Barbakow',7.4,93],
  ['Run','Hulu','Movie','Thriller','United States',2020,'PG-13',89,'Aneesh Chaganty',6.8,90],
  ['Fresh','Hulu','Movie','Horror','United States',2022,'R',114,'Mimi Cave',6.8,83],
  ['Fire Island','Hulu','Movie','Comedy','United States',2022,'R',105,'Andrew Ahn',7.0,95],
  ['Am I OK?','Hulu','Movie','Comedy','United States',2022,'R',85,'Tig Notaro',6.2,82],
  ['Mike','Hulu','TV Show','Drama','United States',2022,'TV-MA',50,'Craig Gillespie',6.5,75],
  ['Catch-22','Hulu','TV Show','Drama','United States',2019,'TV-MA',47,'George Clooney',7.6,73],
];

export const titles: Title[] = raw.map(
  ([title, platform, type, genre, country, releaseYear, ageRating, runtime, director, imdb, rt], id) => ({
    id, title, platform, type, genre, country, releaseYear, ageRating, runtime, director, imdb, rt,
  })
);

export const ALL_PLATFORMS: Platform[] = ['Netflix', 'Prime Video', 'Disney+', 'Hulu'];
export const ALL_GENRES = ['Action', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'History', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];
export const ALL_RATINGS = ['G', 'PG', 'PG-13', 'R', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'];
export const KNOWN_COUNTRIES = ['United States', 'India', 'United Kingdom', 'Canada', 'France', 'Germany', 'Japan', 'South Korea'];
export const PLATFORM_COLORS: Record<string, string> = {
  Netflix: '#E50914',
  'Prime Video': '#00A8E0',
  'Disney+': '#1A78C2',
  Hulu: '#1CE783',
};
