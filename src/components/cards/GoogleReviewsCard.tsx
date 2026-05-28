import { ExternalLink, MessageSquareQuote, Star } from 'lucide-react';
import type { PlaceInsights } from '../../types';
import { Button } from '../ui/Button';

interface GoogleReviewsCardProps {
  insights: PlaceInsights;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={[
            'h-3.5 w-3.5',
            i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-white/15',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

export function GoogleReviewsCard({ insights }: GoogleReviewsCardProps) {
  const { reviews, insights: analysis, googleRating, totalReviews, googleMapsUri } = insights;

  return (
    <section className="animate-scale-in w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-charcoal-light/40 backdrop-blur-md">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 ring-1 ring-amber-400/20">
            <MessageSquareQuote className="h-4 w-4 text-amber-300" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">
              Google Reviews
            </p>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white">{googleRating.toFixed(1)}</span>
              <StarRating rating={googleRating} />
              <span className="text-xs text-white/40">({totalReviews.toLocaleString()})</span>
            </div>
          </div>
        </div>
        {googleMapsUri && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 rounded-full"
            onClick={() => window.open(googleMapsUri, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Maps</span>
          </Button>
        )}
      </header>

      <div className="space-y-4 p-4">
        <p className="break-words rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-white/70">
          {analysis.summary.replace(/\*\*/g, '')}
        </p>

        {(analysis.mentionedDishes.length > 0 || analysis.topPraised.length > 0) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.mentionedDishes.length > 0 && (
              <div className="rounded-xl border border-cyber-lime/10 bg-cyber-lime/[0.04] p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-cyber-lime/70">
                  Mentioned dishes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.mentionedDishes.map((dish) => (
                    <span
                      key={dish}
                      className="rounded-lg bg-cyber-lime/10 px-2 py-1 text-[11px] text-cyber-lime/90 ring-1 ring-cyber-lime/15"
                    >
                      {dish}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analysis.topPraised.length > 0 && (
              <div className="rounded-xl border border-electric-violet/10 bg-electric-violet/[0.04] p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-electric-violet/70">
                  What diners praise
                </p>
                <ul className="space-y-1 text-xs text-white/60">
                  {analysis.topPraised.map((item) => (
                    <li key={item} className="leading-relaxed">
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {reviews.length > 0 && (
          <div className="space-y-2">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Recent reviews
            </p>
            <div className="space-y-2">
              {reviews.slice(0, 3).map((review, index) => (
                <article
                  key={`${review.author}-${index}`}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/10"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {review.photoUri ? (
                        <img
                          src={review.photoUri}
                          alt=""
                          className="h-6 w-6 rounded-full ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[10px] font-medium text-white/50">
                          {review.author.charAt(0)}
                        </div>
                      )}
                      <span className="truncate text-xs font-medium text-white/70">
                        {review.author}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StarRating rating={review.rating} />
                      {review.relativeTime && (
                        <span className="text-[10px] text-white/30">{review.relativeTime}</span>
                      )}
                    </div>
                  </div>
                  <p className="line-clamp-3 break-words text-sm leading-relaxed text-white/55">{review.text}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
