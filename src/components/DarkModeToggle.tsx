import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 sm:px-4 py-2 rounded-lg shadow-sm transition-colors border border-gray-200 dark:border-gray-600 whitespace-nowrap"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <>
          <Sun className="w-4 h-4" />
          <span className="hidden sm:inline">Light</span>
          <span className="sm:hidden">L</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          <span className="hidden sm:inline">Dark</span>
          <span className="sm:hidden">D</span>
        </>
      )}
    </button>
  );
}
