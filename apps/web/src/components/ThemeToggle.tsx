// Third-party imports
import { useEffect } from 'react';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

// Local imports
import { useProfileState } from '../states/useUserProfileState';

export const ThemeToggle = () => {
  const {
    profile, setTheme
  } = useProfileState();

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (profile?.theme === 'SYSTEM') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [profile?.theme]);

  const currentTheme = profile?.theme || 'SYSTEM';

  return (
    <div className="flex items-center space-x-2" role="radiogroup" aria-label="Theme selection">
      <button
        onClick={() => setTheme('LIGHT')}
        className={`p-2 rounded-lg ${
          currentTheme === 'LIGHT'
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Light mode"
        aria-label="Light mode"
        aria-checked={currentTheme === 'LIGHT'}
        role="radio"
        id="theme-light"
        name="theme"
      >
        <SunIcon className="w-5 h-5" aria-hidden="true" />
        <span className="sr-only">Light mode</span>
      </button>
      <button
        onClick={() => setTheme('DARK')}
        className={`p-2 rounded-lg ${
          currentTheme === 'DARK'
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Dark mode"
        aria-label="Dark mode"
        aria-checked={currentTheme === 'DARK'}
        role="radio"
        id="theme-dark"
        name="theme"
      >
        <MoonIcon className="w-5 h-5" aria-hidden="true" />
        <span className="sr-only">Dark mode</span>
      </button>
      <button
        onClick={() => setTheme('SYSTEM')}
        className={`p-2 rounded-lg ${
          currentTheme === 'SYSTEM'
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="System theme"
        aria-label="System theme"
        aria-checked={currentTheme === 'SYSTEM'}
        role="radio"
        id="theme-system"
        name="theme"
      >
        <ComputerDesktopIcon className="w-5 h-5" aria-hidden="true" />
        <span className="sr-only">System theme</span>
      </button>
    </div>
  );
};