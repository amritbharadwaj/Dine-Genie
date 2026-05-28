import { Crown, Swords } from 'lucide-react';
import type { DishComparison } from '../../types';
import { RestaurantCard } from './RestaurantCard';

interface DishShowdownProps {
  comparison: DishComparison;
}

function ScoreBar({ score, isWinner }: { score: number; isWinner: boolean }) {
  const percentage = (score / 10) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">Score</span>
        <span
          className={[
            'font-semibold tabular-nums',
            isWinner ? 'text-cyber-lime' : 'text-white/70',
          ].join(' ')}
        >
          {score.toFixed(1)}/10
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={[
            'h-full rounded-full transition-all duration-700',
            isWinner
              ? 'bg-gradient-to-r from-cyber-lime/60 to-cyber-lime'
              : 'bg-gradient-to-r from-white/20 to-white/40',
          ].join(' ')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function DishShowdown({ comparison }: DishShowdownProps) {
  const { dishName, restaurantA, restaurantB, winnerId } = comparison;
  const aWins = winnerId === restaurantA.restaurant.id;
  const bWins = winnerId === restaurantB.restaurant.id;

  return (
    <section className="animate-scale-in overflow-hidden rounded-2xl border border-white/10 bg-charcoal-light/40 backdrop-blur-md">
      <header className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric-violet/15 ring-1 ring-electric-violet/25">
          <Swords className="h-4 w-4 text-electric-violet" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">
            Dish Showdown
          </p>
          <h3 className="text-base font-semibold text-white">{dishName}</h3>
        </div>
      </header>

      <div className="grid gap-4 p-4 md:grid-cols-2">
        {[restaurantA, restaurantB].map((entry, idx) => {
          const isWinner = idx === 0 ? aWins : bWins;
          return (
            <div
              key={entry.restaurant.id}
              className={[
                'relative space-y-3 rounded-xl p-1 transition-all duration-300',
                isWinner ? 'ring-1 ring-cyber-lime/30' : '',
              ].join(' ')}
            >
              {isWinner && (
                <div className="absolute -top-1 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-cyber-lime/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyber-lime ring-1 ring-cyber-lime/30">
                  <Crown className="h-3 w-3" />
                  Winner
                </div>
              )}
              <RestaurantCard restaurant={entry.restaurant} compact />
              <ScoreBar score={entry.score} isWinner={isWinner} />
              <p className="px-1 text-sm leading-relaxed text-white/55">{entry.verdict}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
