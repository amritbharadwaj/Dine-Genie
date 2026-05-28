import type { DishComparison, PromptSuggestion, Restaurant, TrendingTopic } from '../types';

export const restaurants: Record<string, Restaurant> = {
  caprice: {
    id: 'caprice',
    name: 'Caprice',
    district: 'Central',
    mtrStation: 'Central',
    priceRange: '$$$$',
    cuisine: 'French Fine Dining',
    bestDish: 'Comté Cheese Soufflé',
    rating: 4.8,
    michelin: '3 Stars',
    openRiceScore: 4.6,
    description:
      'Iconic French fine dining at Four Seasons, commanding Victoria Harbour views with impeccable service and a legendary cheese trolley.',
    highlights: ['Harbour views', 'World-class cheese selection', 'Impeccable service'],
    googleSearchQuery: 'Caprice restaurant Four Seasons Hong Kong Central',
  },
  yardbird: {
    id: 'yardbird',
    name: 'Yardbird',
    district: 'Central',
    mtrStation: 'Central',
    priceRange: '$$$',
    cuisine: 'Japanese Yakitori',
    bestDish: 'Chicken Oyster on Skewer',
    rating: 4.7,
    openRiceScore: 4.5,
    description:
      'Elevated yakitori omakase experience in a sleek, dark interior. Every part of the bird is masterfully grilled over binchotan charcoal.',
    highlights: ['Binchotan grilling', 'Omakase-style progression', 'Late-night vibes'],
    googleSearchQuery: 'Yardbird Hong Kong yakitori Central',
  },
  'chungking-biryani': {
    id: 'chungking-biryani',
    name: 'New Delhi Club',
    district: 'Tsim Sha Tsui',
    mtrStation: 'Tsim Sha Tsui',
    priceRange: '$$',
    cuisine: 'Indian / Pakistani',
    bestDish: 'Hyderabadi Dum Biryani',
    rating: 4.5,
    openRiceScore: 4.3,
    description:
      'A Chungking Mansions institution serving fragrant, slow-cooked biryani with authentic spices. Cash-only, no-frills, maximum flavour.',
    highlights: ['Authentic Hyderabadi style', 'Generous portions', 'Chungking Mansions gem'],
    googleSearchQuery: 'New Delhi Club Chungking Mansions Hong Kong biryani',
  },
  'tung-po': {
    id: 'tung-po',
    name: 'Tung Po Kitchen',
    district: 'North Point',
    mtrStation: 'North Point',
    priceRange: '$$',
    cuisine: 'Dai Pai Dong / Cantonese',
    bestDish: 'Typhoon Shelter Crab',
    rating: 4.4,
    openRiceScore: 4.2,
    description:
      'Legendary dai pai dong energy inside a municipal building. Communal tables, cold beer, and unapologetically bold Cantonese flavours.',
    highlights: ['Dai pai dong atmosphere', 'Typhoon shelter crab', 'Local favourite'],
  },
  'tim-ho-wan': {
    id: 'tim-ho-wan',
    name: 'Tim Ho Wan',
    district: 'Sham Shui Po',
    mtrStation: 'Sham Shui Po',
    priceRange: '$',
    cuisine: 'Dim Sum',
    bestDish: 'Baked BBQ Pork Buns',
    rating: 4.3,
    michelin: '1 Star (original)',
    openRiceScore: 4.1,
    description:
      'The world\'s cheapest Michelin-starred dim sum. Queue early for their legendary char siu bao with a crispy, sweet glaze.',
    highlights: ['Michelin-star value', 'Iconic char siu bao', 'Cash-friendly prices'],
    googleSearchQuery: 'Tim Ho Wan Sham Shui Po Hong Kong dim sum',
  },
  'mamafina': {
    id: 'mamafina',
    name: 'Mama Fina',
    district: 'Mong Kok',
    mtrStation: 'Mong Kok',
    priceRange: '$$',
    cuisine: 'Hotpot',
    bestDish: 'Spicy Sichuan Broth with Beef Tripe',
    rating: 4.4,
    openRiceScore: 4.0,
    description:
      'Late-night hotpot haven in the heart of Mong Kok. Packed after midnight with groups sharing bubbling spicy broths.',
    highlights: ['Open past 2am', 'Spicy Sichuan broth', 'Lively atmosphere'],
  },
  'samsen': {
    id: 'samsen',
    name: 'Samsen',
    district: 'Wan Chai',
    mtrStation: 'Wan Chai',
    priceRange: '$$',
    cuisine: 'Thai',
    bestDish: 'Boat Noodle Soup',
    rating: 4.6,
    openRiceScore: 4.4,
    description:
      'Bangkok street food transported to HK. Rich, dark boat noodle broth with intense umami — always a queue, always worth it.',
    highlights: ['Authentic boat noodles', 'Rich broth', 'Wan Chai staple'],
  },
  'belon': {
    id: 'belon',
    name: 'Belon',
    district: 'Central',
    mtrStation: 'Central',
    priceRange: '$$$$',
    cuisine: 'Modern French',
    bestDish: 'Escargot with Garlic & Parsley',
    rating: 4.7,
    michelin: '1 Star',
    openRiceScore: 4.5,
    description:
      'A refined yet relaxed French bistro on Wyndham Street. Escargots are a must, and the natural wine list is exceptional.',
    highlights: ['Natural wine focus', 'Classic French bistro', 'Wyndham Street gem'],
  },
};

export const promptSuggestions: PromptSuggestion[] = [
  {
    id: 'tung-chung',
    label: 'Best food in Tung Chung 🏝️',
    query: 'What are the best restaurants in Tung Chung?',
  },
  {
    id: 'dim-sum',
    label: 'Best Dim Sum in Sham Shui Po 🥟',
    query: 'Where can I find the best dim sum in Sham Shui Po?',
  },
  {
    id: 'hotpot',
    label: 'Late night hotpot in Mong Kok 🔥',
    query: 'Where should I go for late night hotpot in Mong Kok?',
  },
  {
    id: 'caprice',
    label: 'How is the food at Caprice?',
    query: 'How is the food at Caprice?',
  },
  {
    id: 'yardbird',
    label: 'Best dish at Yardbird 🍢',
    query: 'Which dish is the absolute best at Yardbird?',
  },
  {
    id: 'biryani',
    label: 'Authentic Biryani in Chungking Mansions 🍛',
    query: 'Where can I find the best authentic Biryani in Chungking Mansions?',
  },
  {
    id: 'showdown',
    label: 'Biryani showdown: Place A vs B ⚔️',
    query: 'Which place has better Biryani: New Delhi Club or Karahi King?',
  },
];

export const trendingTopics: TrendingTopic[] = [
  {
    id: 't1',
    title: 'Hidden gem cha chaan tengs in Kennedy Town',
    queryCount: 2847,
    emoji: '☕',
    category: 'Local Eats',
  },
  {
    id: 't2',
    title: 'Best omakase under $800 HKD',
    queryCount: 1923,
    emoji: '🍣',
    category: 'Budget Fine Dining',
  },
  {
    id: 't3',
    title: 'Michelin-star lunch deals this week',
    queryCount: 1654,
    emoji: '⭐',
    category: 'Michelin',
  },
  {
    id: 't4',
    title: 'Where locals actually eat in Causeway Bay',
    queryCount: 1432,
    emoji: '📍',
    category: 'District Guide',
  },
  {
    id: 't5',
    title: 'Best egg tarts — Tai Cheong vs others',
    queryCount: 1289,
    emoji: '🥧',
    category: 'Dessert Wars',
  },
  {
    id: 't6',
    title: 'Rainy day comfort food in HK',
    queryCount: 987,
    emoji: '🌧️',
    category: 'Mood Dining',
  },
];

export const biryaniShowdown: DishComparison = {
  dishName: 'Hyderabadi Biryani',
  restaurantA: {
    restaurant: restaurants['chungking-biryani'],
    score: 9.2,
    verdict:
      'Deeply aromatic with perfectly layered rice and tender mutton. The spice blend is complex and authentic — a true Chungking Mansions experience.',
  },
  restaurantB: {
    restaurant: {
      ...restaurants['chungking-biryani'],
      id: 'karahi-king',
      name: 'Karahi King',
      bestDish: 'Chicken Biryani',
      rating: 4.2,
      openRiceScore: 4.0,
      description:
        'Popular Pakistani spot in Chungking Mansions known for karahi curries and generous biryani portions.',
      highlights: ['Generous portions', 'Milder spice profile', 'Great for groups'],
    },
    score: 8.4,
    verdict:
      'Solid, crowd-pleasing biryani with milder spices. Better for groups or those new to South Asian cuisine, but lacks the depth of New Delhi Club.',
  },
  winnerId: 'chungking-biryani',
};

export function getRestaurantByName(name: string): Restaurant | undefined {
  const normalized = name.toLowerCase().trim();
  const entries = Object.values(restaurants);

  const exact = entries.find((r) => r.name.toLowerCase() === normalized);
  if (exact) return exact;

  return entries.find((r) => {
    const restaurantName = r.name.toLowerCase();
    if (normalized.length < 4) return false;
    return (
      restaurantName.includes(normalized) ||
      (normalized.includes(restaurantName) && restaurantName.length > 6)
    );
  });
}
