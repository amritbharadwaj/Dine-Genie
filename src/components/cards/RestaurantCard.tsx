import { Award, MapPin, Star, Train } from 'lucide-react';
import type { Restaurant } from '../../types';
import { Button } from '../ui/Button';

interface RestaurantCardProps {
  restaurant: Restaurant;
  compact?: boolean;
}

function PriceBadge({ range }: { range: Restaurant['priceRange'] }) {
  return (
    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium tracking-wide text-cyber-lime/90 ring-1 ring-cyber-lime/20">
      {range}
    </span>
  );
}

export function RestaurantCard({ restaurant, compact = false }: RestaurantCardProps) {
  return (
    <article
      className={[
        'group relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-charcoal-light/60 backdrop-blur-md',
        'transition-all duration-500 hover:border-white/20 hover:shadow-[0_8px_40px_rgb(0_0_0/0.4)]',
        compact ? 'p-4' : 'p-5',
        'animate-scale-in',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-electric-violet/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-60" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-cyber-lime/5 blur-2xl" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-lg font-semibold tracking-tight text-white">
              {restaurant.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {restaurant.district}
              </span>
              <span className="text-white/20">·</span>
              <span className="inline-flex items-center gap-1">
                <Train className="h-3 w-3" />
                {restaurant.mtrStation} MTR
              </span>
            </div>
          </div>
          <PriceBadge range={restaurant.priceRange} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/70 ring-1 ring-white/10">
            {restaurant.cuisine}
          </span>
          {restaurant.michelin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300 ring-1 ring-amber-400/20">
              <Award className="h-3 w-3" />
              {restaurant.michelin}
            </span>
          )}
          {restaurant.openRiceScore && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-400/10 px-2.5 py-1 text-xs text-orange-300 ring-1 ring-orange-400/20">
              OpenRice {restaurant.openRiceScore}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-cyber-lime/15 bg-cyber-lime/[0.06] px-3 py-2.5 glow-lime">
          <Star className="h-4 w-4 shrink-0 fill-cyber-lime text-cyber-lime" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-cyber-lime/70">
              Best Dish
            </p>
            <p className="truncate text-sm font-medium text-white">{restaurant.bestDish}</p>
          </div>
          <span className="ml-auto shrink-0 text-sm font-semibold text-white/80">
            {restaurant.rating}
          </span>
        </div>

        {!compact && (
          <>
            <p className="text-sm leading-relaxed text-white/60">{restaurant.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-lg bg-white/[0.03] px-2 py-1 text-[11px] text-white/45 ring-1 ring-white/[0.06]"
                >
                  {h}
                </span>
              ))}
            </div>
            <Button variant="lime" size="sm" className="w-full sm:w-auto">
              View on OpenRice
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
