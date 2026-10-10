import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button type="button" className="lx-theme" onClick={toggleTheme} aria-pressed={dark} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
      <i>{dark ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}</i>
    </button>
  );
}
