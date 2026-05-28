import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';
import { handleChatRequest } from './lib/geminiChat';
import { classifyPlacesError, handlePlaceReviewsRequest } from './lib/googlePlaces';

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer | string) => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function statusForPlacesError(error?: string, errorCode?: ReturnType<typeof classifyPlacesError>): number {
  if (errorCode === 'missing_key' || error?.includes('not configured')) return 503;
  if (errorCode === 'permission_denied') return 403;
  if (errorCode === 'not_found') return 404;
  if (errorCode === 'ssl_error') return 502;
  return 500;
}

function applyEnvKeys(server: ViteDevServer) {
  const env = loadEnv(server.config.mode, process.cwd(), '');
  if (env.GOOGLE_PLACES_API_KEY) process.env.GOOGLE_PLACES_API_KEY = env.GOOGLE_PLACES_API_KEY;
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  if (env.GOOGLE_AI_API_KEY) process.env.GOOGLE_AI_API_KEY = env.GOOGLE_AI_API_KEY;
}

export function apiDevPlugin(): Plugin {
  return {
    name: 'hk-dine-agent-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url !== '/api/places/reviews' && url !== '/api/chat') {
          next();
          return;
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          sendJson(res, 405, { ok: false, error: 'Method not allowed' });
          return;
        }

        try {
          applyEnvKeys(server);
          const rawBody = await readRequestBody(req);
          const body = rawBody ? JSON.parse(rawBody) : {};

          if (url === '/api/places/reviews') {
            const result = await handlePlaceReviewsRequest(body);
            if (!result.ok) {
              sendJson(res, statusForPlacesError(result.error, result.errorCode), result);
              return;
            }
            sendJson(res, 200, result);
            return;
          }

          const result = await handleChatRequest(body);
          if (!result.ok) {
            const status = result.error?.includes('not configured') ? 503 : 500;
            sendJson(res, status, result);
            return;
          }
          sendJson(res, 200, result);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Internal server error';
          sendJson(res, 500, {
            ok: false,
            error: message,
            errorCode: classifyPlacesError(message),
          });
        }
      });
    },
  };
}
