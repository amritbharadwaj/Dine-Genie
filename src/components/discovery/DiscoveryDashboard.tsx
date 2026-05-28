import { promptSuggestions, trendingTopics } from '../../data/mockRestaurantData';
import { useChat } from '../../context/ChatContext';
import { PromptPill } from './PromptPill';
import { TrendingGrid } from './TrendingGrid';

export function DiscoveryDashboard() {
  const { sendMessage } = useChat();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-1 pb-4 pt-2">
      <header className="space-y-3 text-center animate-fade-up">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-cyber-lime animate-pulse-glow" />
          Hong Kong · Culinary AI
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-gradient-lime">What</span>
          <span className="text-white"> shall we eat?</span>
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-white/45">
          Your ultra-smart dining concierge — from Michelin stars to Chungking Mansions gems.
        </p>
      </header>

      <section className="space-y-3">
        <p className="px-1 text-xs font-medium uppercase tracking-wider text-white/35">
          Try asking
        </p>
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((suggestion, index) => (
            <PromptPill
              key={suggestion.id}
              label={suggestion.label}
              index={index}
              onClick={() => void sendMessage(suggestion.query)}
            />
          ))}
        </div>
      </section>

      <TrendingGrid
        topics={trendingTopics}
        onTopicClick={(query) => void sendMessage(query)}
      />
    </div>
  );
}
