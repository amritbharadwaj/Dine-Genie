export interface CatalogEntry {
  name: string;
  aliases: string[];
  district: string;
  cuisine: string;
  bestDish: string;
  openRiceScore: number;
  michelin?: string;
}

export const RESTAURANT_CATALOG: CatalogEntry[] = [
  {
    name: 'Caprice',
    aliases: ['caprice four seasons'],
    district: 'Central',
    cuisine: 'French Fine Dining',
    bestDish: 'Comté Cheese Soufflé',
    openRiceScore: 4.6,
    michelin: '3 Stars',
  },
  {
    name: 'Yardbird',
    aliases: ['yardbird hong kong'],
    district: 'Central',
    cuisine: 'Japanese Yakitori',
    bestDish: 'Chicken Oyster on Skewer',
    openRiceScore: 4.5,
  },
  {
    name: 'Tim Ho Wan',
    aliases: ['tim ho wan sham shui po'],
    district: 'Sham Shui Po',
    cuisine: 'Dim Sum',
    bestDish: 'Baked BBQ Pork Buns',
    openRiceScore: 4.1,
    michelin: '1 Star',
  },
  {
    name: 'New Delhi Club',
    aliases: ['new delhi club chungking'],
    district: 'Tsim Sha Tsui',
    cuisine: 'Indian / Pakistani',
    bestDish: 'Hyderabadi Dum Biryani',
    openRiceScore: 4.3,
  },
  {
    name: 'Samsen',
    aliases: ['samsen wan chai', 'samsen thai'],
    district: 'Wan Chai',
    cuisine: 'Thai',
    bestDish: 'Boat Noodle Soup',
    openRiceScore: 4.4,
  },
  {
    name: 'Belon',
    aliases: ['belon wyndham'],
    district: 'Central',
    cuisine: 'Modern French',
    bestDish: 'Escargot with Garlic & Parsley',
    openRiceScore: 4.5,
    michelin: '1 Star',
  },
  {
    name: 'Tung Po Kitchen',
    aliases: ['tung po north point'],
    district: 'North Point',
    cuisine: 'Dai Pai Dong',
    bestDish: 'Typhoon Shelter Crab',
    openRiceScore: 4.2,
  },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function matchOpenRiceEntry(placeName: string): CatalogEntry | null {
  const normalizedPlace = normalize(placeName);
  if (!normalizedPlace) return null;

  for (const entry of RESTAURANT_CATALOG) {
    const candidates = [entry.name, ...entry.aliases].map(normalize);
    for (const candidate of candidates) {
      if (
        normalizedPlace.includes(candidate) ||
        candidate.includes(normalizedPlace) ||
        normalizedPlace.split(' ').slice(0, 2).join(' ') === candidate.split(' ').slice(0, 2).join(' ')
      ) {
        return entry;
      }
    }
  }

  return null;
}
