import { TrendingUp } from 'lucide-react';
import type { TrendingTopic } from '../../types';

interface TrendingGridProps {
  topics: TrendingTopic[];
  onTopicClick: (query: string) => void;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function TrendingGrid({ topics, onTopicClick }: TrendingGridProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <TrendingUp className="h-4 w-4 text-electric-violet" />
        <h2 className="text-sm font-semibold text-white/80">Trending right now</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((topic, index) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onTopicClick(topic.title)}
            className={[
              'group relative overflow-hidden rounded-2xl border border-white/10 bg-charcoal/50 p-4 text-left',
              'backdrop-blur-sm transition-all duration-300',
              'hover:border-white/20 hover:bg-charcoal-light/60 hover:shadow-[0_4px_24px_rgb(0_0_0/0.3)]',
              'active:scale-[0.98] animate-fade-up',
            ].join(' ')}
            style={{ animationDelay: `${300 + index * 80}ms` }}
          >
            <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-electric-violet/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                {topic.emoji}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <span className="inline-block rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
                  {topic.category}
                </span>
                <p className="text-sm font-medium leading-snug text-white/85 group-hover:text-white">
                  {topic.title}
                </p>
                <p className="text-[11px] text-white/35">
                  {formatCount(topic.queryCount)} foodies asking
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
