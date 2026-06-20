import { Database, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function Header() {
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 font-mono font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Database className="w-5 h-5 text-blue-600" />
        <span>dataset explorer</span>
      </button>

      <button
        onClick={toggle}
        aria-label="Toggle dark mode"
        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </header>
  );
}
