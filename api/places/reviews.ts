import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePlaceReviewsRequest } from '../../lib/googlePlaces';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const result = await handlePlaceReviewsRequest(req.body);

  if (!result.ok) {
    const status = result.errorCode === 'missing_key' ? 503
      : result.errorCode === 'permission_denied' ? 403
      : result.errorCode === 'not_found' ? 404
      : 500;
    return res.status(status).json(result);
  }

  return res.status(200).json(result);
}
