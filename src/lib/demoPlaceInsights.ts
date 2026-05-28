import type { PlaceInsights } from '../types';

const DEMO_INSIGHTS: Record<string, PlaceInsights> = {
  caprice: {
    placeId: 'demo-caprice',
    name: 'Caprice',
    address: 'Four Seasons Hotel, 8 Finance St, Central, Hong Kong',
    googleRating: 4.6,
    totalReviews: 842,
    googleMapsUri: 'https://maps.google.com',
    priceLevel: '$$$$',
    reviews: [
      {
        author: 'Sarah L.',
        rating: 5,
        relativeTime: '2 weeks ago',
        text: 'The Comté soufflé was absolutely incredible — light as air. Service was flawless and the harbour views at lunch are unmatched.',
      },
      {
        author: 'James W.',
        rating: 5,
        relativeTime: '1 month ago',
        text: 'Best fine dining experience in HK. Try the cheese trolley — world class selection. Worth every dollar for a special occasion.',
      },
      {
        author: 'Michelle T.',
        rating: 4,
        relativeTime: '3 months ago',
        text: 'Excellent food but book early. The lobster bisque was outstanding. Dress code is enforced.',
      },
    ],
    insights: {
      summary:
        'Caprice holds a 4.6/5 Google rating from 842 reviews. Diners frequently praise the cheese soufflé and harbour views. Standout mentions include Comté soufflé, cheese trolley, and lobster bisque.',
      topPraised: ['amazing soufflé', 'flawless service', 'harbour views'],
      commonConcerns: ['book early', 'dress code enforced'],
      mentionedDishes: ['Comté soufflé', 'cheese trolley', 'lobster bisque'],
    },
  },
  yardbird: {
    placeId: 'demo-yardbird',
    name: 'Yardbird',
    address: '154-158 Wing Lok St, Sheung Wan, Hong Kong',
    googleRating: 4.5,
    totalReviews: 1247,
    googleMapsUri: 'https://maps.google.com',
    priceLevel: '$$$',
    reviews: [
      {
        author: 'David K.',
        rating: 5,
        relativeTime: '1 week ago',
        text: 'The chicken oyster skewer is a must try — single best bite in the city. Counter seating lets you watch the magic happen.',
      },
      {
        author: 'Anna C.',
        rating: 5,
        relativeTime: '3 weeks ago',
        text: 'Best yakitori in Hong Kong. Try the full omakase progression. The thigh meat was perfectly charred.',
      },
    ],
    insights: {
      summary:
        'Yardbird holds a 4.5/5 Google rating from 1,247 reviews. Diners rave about the chicken oyster skewer and binchotan grilling.',
      topPraised: ['must try chicken oyster', 'best yakitori', 'perfectly charred'],
      commonConcerns: ['long wait without reservation'],
      mentionedDishes: ['chicken oyster skewer', 'omakase progression', 'thigh meat'],
    },
  },
};

export function getDemoPlaceInsights(restaurantName: string): PlaceInsights | null {
  const key = restaurantName.toLowerCase();
  if (key.includes('caprice')) return DEMO_INSIGHTS.caprice;
  if (key.includes('yardbird')) return DEMO_INSIGHTS.yardbird;
  if (key.includes('tim ho wan')) return {
    ...DEMO_INSIGHTS.caprice,
    placeId: 'demo-tim-ho-wan',
    name: 'Tim Ho Wan',
    address: 'Shop 12A, 2-20 Kwong Wa St, Sham Shui Po',
    googleRating: 4.2,
    totalReviews: 3421,
    priceLevel: '$',
    insights: {
      summary: 'Tim Ho Wan holds a 4.2/5 Google rating. Diners love the char siu bao but warn about long queues on weekends.',
      topPraised: ['best char siu bao', 'great value'],
      commonConcerns: ['long queue', 'crowded'],
      mentionedDishes: ['baked BBQ pork buns', 'char siu bao', 'har gow'],
    },
  };
  return null;
}
