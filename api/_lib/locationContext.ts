export interface HkDistrict {
  id: string;
  name: string;
  aliases: string[];
  mtrStation?: string;
}

export interface QueryContext {
  raw: string;
  district: HkDistrict | null;
  mentionsChungkingMansions: boolean;
  mentionsTungChung: boolean;
  mentionsBiryani: boolean;
  mentionsShowdown: boolean;
  mentionsHotpot: boolean;
  mentionsDimSum: boolean;
  restaurantHint: string | null;
}

export const HK_DISTRICTS: HkDistrict[] = [
  { id: 'tung-chung', name: 'Tung Chung', aliases: ['tung chung', 'tungchung'], mtrStation: 'Tung Chung' },
  { id: 'central', name: 'Central', aliases: ['central', 'cbd'], mtrStation: 'Central' },
  { id: 'tsim-sha-tsui', name: 'Tsim Sha Tsui', aliases: ['tsim sha tsui', 'tst'], mtrStation: 'Tsim Sha Tsui' },
  { id: 'mong-kok', name: 'Mong Kok', aliases: ['mong kok', 'mongkok', 'mk'], mtrStation: 'Mong Kok' },
  { id: 'sham-shui-po', name: 'Sham Shui Po', aliases: ['sham shui po', 'ssp'], mtrStation: 'Sham Shui Po' },
  { id: 'north-point', name: 'North Point', aliases: ['north point'], mtrStation: 'North Point' },
  { id: 'wan-chai', name: 'Wan Chai', aliases: ['wan chai'], mtrStation: 'Wan Chai' },
  { id: 'causeway-bay', name: 'Causeway Bay', aliases: ['causeway bay', 'cwb'], mtrStation: 'Causeway Bay' },
  { id: 'kennedy-town', name: 'Kennedy Town', aliases: ['kennedy town'], mtrStation: 'Kennedy Town' },
  { id: 'chungking-mansions', name: 'Chungking Mansions', aliases: ['chungking mansions', 'chung king mansions', 'chungking', 'ckm'], mtrStation: 'Tsim Sha Tsui' },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function containsPhrase(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

export function extractQueryContext(content: string): QueryContext {
  const raw = content.trim();
  const q = normalize(raw);

  const mentionsTungChung = HK_DISTRICTS.some(
    (d) => d.id === 'tung-chung' && d.aliases.some((alias) => containsPhrase(q, alias)),
  );

  const mentionsChungkingMansions =
    !mentionsTungChung &&
    HK_DISTRICTS.some(
      (d) => d.id === 'chungking-mansions' && d.aliases.some((alias) => containsPhrase(q, alias)),
    );

  let district: HkDistrict | null = null;

  if (mentionsTungChung) {
    district = HK_DISTRICTS.find((d) => d.id === 'tung-chung') ?? null;
  } else if (mentionsChungkingMansions) {
    district = HK_DISTRICTS.find((d) => d.id === 'chungking-mansions') ?? null;
  } else {
    for (const d of HK_DISTRICTS) {
      if (d.id === 'chungking-mansions') continue;
      if (d.aliases.some((alias) => containsPhrase(q, alias))) {
        district = d;
        break;
      }
    }
  }

  return {
    raw,
    district,
    mentionsChungkingMansions,
    mentionsTungChung,
    mentionsBiryani: containsPhrase(q, 'biryani') || containsPhrase(q, 'biriyani'),
    mentionsShowdown: containsPhrase(q, 'showdown') || (containsPhrase(q, 'better') && containsPhrase(q, 'biryani')),
    mentionsHotpot: containsPhrase(q, 'hotpot') || containsPhrase(q, 'hot pot'),
    mentionsDimSum: containsPhrase(q, 'dim sum') || containsPhrase(q, 'dimsum'),
    restaurantHint: extractRestaurantHint(q),
  };
}

function extractRestaurantHint(q: string): string | null {
  const known = ['caprice', 'yardbird', 'tim ho wan', 'belon', 'samsen', 'tung po', 'new delhi club', 'mama fina'];
  return known.find((name) => containsPhrase(q, name)) ?? null;
}

export function buildDistrictSearchQuery(
  ctx: QueryContext,
  pinnedDistrict?: string | null,
): string {
  const districtName = ctx.district?.name ?? pinnedDistrict ?? 'Hong Kong';
  const parts = [ctx.raw, districtName, 'Hong Kong', 'restaurant'].filter(Boolean);
  return parts.join(' ');
}

export function buildRestaurantSearchQuery(
  restaurantName: string,
  district?: string,
  customQuery?: string,
  pinnedDistrict?: string | null,
): string {
  if (customQuery) return customQuery;

  const location = district ?? pinnedDistrict ?? 'Hong Kong';
  return `${restaurantName} ${location} Hong Kong restaurant`;
}
