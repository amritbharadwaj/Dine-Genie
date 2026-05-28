export function ThinkingIndicator() {
  return (
    <div className="flex w-full animate-fade-up justify-start">
      <div className="max-w-[min(100%,42rem)] space-y-3">
        <div className="mb-1 flex items-center gap-2 px-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-electric-violet/20 ring-1 ring-electric-violet/30">
            <span className="text-[10px] font-bold text-electric-violet">DA</span>
          </div>
          <span className="text-xs font-medium text-white/40">DineAgent is thinking</span>
        </div>

        <div className="glass-panel glow-violet inline-flex items-center gap-3 rounded-2xl rounded-bl-md px-5 py-4">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-electric-violet"
                style={{
                  animation: 'pulse-glow 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <div className="relative h-4 w-32 overflow-hidden rounded-full bg-white/5">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-violet/40 to-transparent"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.8s linear infinite',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
