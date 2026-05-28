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
    primaryType: 'restaurant',
    cuisineHint: 'French Fine Dining',
    openRice: {
      score: 4.6,
      bestDish: 'Comté Cheese Soufflé',
      cuisine: 'French Fine Dining',
      michelin: '3 Stars',
    },
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
        'Caprice — **4.6/5** on Google (842 reviews) · OpenRice **4.6/5**. Standout pick: **Comté Cheese Soufflé**',
      aggregateSummary:
        '**Caprice** is a verified **food establishment** (French Fine Dining). Google diners rate it **4.6/5** from **842** reviews. OpenRice scores it **4.6/5** — a trusted local benchmark for HK dining. Best pick across reviews: **Comté Cheese Soufflé**. Diners especially praise warm, attentive service and strong atmosphere & vibe.',
      bestPicks: [
        'Must-try: Comté Cheese Soufflé',
        'Cuisine: French Fine Dining',
        'Price range: $$$$',
        '3 Stars',
      ],
      topPraised: ['Warm, attentive service', 'Strong atmosphere & vibe'],
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
    primaryType: 'restaurant',
    cuisineHint: 'Japanese Yakitori',
    openRice: {
      score: 4.5,
      bestDish: 'Chicken Oyster on Skewer',
      cuisine: 'Japanese Yakitori',
    },
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
        'Yardbird — **4.5/5** on Google (1,247 reviews) · OpenRice **4.5/5**. Standout pick: **Chicken Oyster on Skewer**',
      aggregateSummary:
        '**Yardbird** is a verified **food establishment** (Japanese Yakitori). Google diners rate it **4.5/5** from **1,247** reviews. OpenRice scores it **4.5/5** — a trusted local benchmark for HK dining. Best pick across reviews: **Chicken Oyster on Skewer**. Diners especially praise fresh, flavour-forward cooking.',
      bestPicks: [
        'Must-try: Chicken Oyster on Skewer',
        'Cuisine: Japanese Yakitori',
        'Price range: $$$',
        'Recent Google reviewers rate it highly',
      ],
      topPraised: ['Fresh, flavour-forward cooking'],
      commonConcerns: ['long wait without reservation'],
      mentionedDishes: ['chicken oyster skewer', 'omakase progression', 'thigh meat'],
    },
  },
};

export function getDemoPlaceInsights(restaurantName: string): PlaceInsights | null {
  const key = restaurantName.toLowerCase();
  if (key.includes('caprice')) return DEMO_INSIGHTS.caprice;
  if (key.includes('yardbird')) return DEMO_INSIGHTS.yardbird;
  if (key.includes('tim ho wan')) {
    return {
      ...DEMO_INSIGHTS.caprice,
      placeId: 'demo-tim-ho-wan',
      name: 'Tim Ho Wan',
      address: 'Shop 12A, 2-20 Kwong Wa St, Sham Shui Po',
      googleRating: 4.2,
      totalReviews: 3421,
      priceLevel: '$',
      cuisineHint: 'Dim Sum',
      openRice: {
        score: 4.1,
        bestDish: 'Baked BBQ Pork Buns',
        cuisine: 'Dim Sum',
        michelin: '1 Star',
      },
      insights: {
        summary:
          'Tim Ho Wan — **4.2/5** on Google (3,421 reviews) · OpenRice **4.1/5**. Standout pick: **Baked BBQ Pork Buns**',
        aggregateSummary:
          '**Tim Ho Wan** is a verified **food establishment** (Dim Sum). Google diners rate it **4.2/5** from **3,421** reviews. OpenRice scores it **4.1/5** — a trusted local benchmark for HK dining. Best pick across reviews: **Baked BBQ Pork Buns**. Worth noting: long queue; crowded.',
        bestPicks: [
          'Must-try: Baked BBQ Pork Buns',
          'Cuisine: Dim Sum',
          'Price range: $',
          '1 Star',
        ],
        topPraised: ['Good value for money', 'Worth the wait'],
        commonConcerns: ['long queue', 'crowded'],
        mentionedDishes: ['baked BBQ pork buns', 'char siu bao', 'har gow'],
      },
    };
  }
  return null;
}
