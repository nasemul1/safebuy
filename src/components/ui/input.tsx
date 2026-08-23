import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-zinc-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-10 px-3 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 border rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent ${
            error ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-zinc-200 hover:border-zinc-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
