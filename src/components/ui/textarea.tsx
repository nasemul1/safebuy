import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-zinc-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-3 py-2.5 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 border rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none ${
            error ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-zinc-200 hover:border-zinc-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
