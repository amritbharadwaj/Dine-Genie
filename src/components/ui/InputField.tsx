import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  trailing?: ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ icon, trailing, className = '', ...props }, ref) => {
    return (
      <div
        className={[
          'group relative flex items-center gap-3 rounded-2xl border border-white/10',
          'bg-charcoal/80 backdrop-blur-xl px-4 py-3',
          'transition-all duration-300 focus-within:border-cyber-lime/30 focus-within:shadow-[0_0_32px_rgb(184_255_60/0.08)]',
          className,
        ].join(' ')}
      >
        {icon && (
          <span className="shrink-0 text-white/40 transition-colors group-focus-within:text-cyber-lime/70">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
          {...props}
        />
        {trailing}
      </div>
    );
  },
);

InputField.displayName = 'InputField';
