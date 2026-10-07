import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className={`press relative inline-flex h-10 w-[72px] items-center rounded-full border transition-colors duration-300 ${
        isDark ? 'border-[#D4AF37]/40 bg-black/40' : 'border-[#D4AF37]/40 bg-white/60'
      } ${className}`}
    >
      <span
        className={`absolute top-1 left-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-white shadow-md transition-transform duration-300 ${
          isDark ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {isDark ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
      </span>
    </button>
  );
}
