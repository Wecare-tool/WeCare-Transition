
import React from 'react';
import { ThemeToggleIcon, SearchIcon, PlusIcon } from './Icons';

interface HeaderProps {
  onSignOut: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewTaskClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignOut, isDarkMode, toggleTheme, searchQuery, setSearchQuery, onNewTaskClick }) => {
  return (
    <header className="flex h-20 flex-shrink-0 items-center justify-between bg-transparent px-6 md:px-8 border-b border-wecare-border dark:border-wecare-dark-border">
      <div className="flex items-center gap-4">
        <img src="https://i.imgur.com/tD07Yrv.png" alt="WeCare Logo" className="h-10 w-10"/>
        <h1 className="text-2xl text-wecare-text-primary dark:text-wecare-dark-text-primary">
          WeCare Transition
        </h1>
      </div>
      <div className="flex items-center gap-4">
         <div className="relative text-wecare-text-secondary dark:text-wecare-dark-text-secondary focus-within:text-wecare-text-primary dark:focus-within:text-wecare-dark-text-primary">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon />
            </span>
            <input
                type="text"
                placeholder="Search by Task Name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-xs pl-10 pr-4 py-2 rounded-lg bg-wecare-surface dark:bg-wecare-dark-surface-solid border border-wecare-border dark:border-wecare-dark-border focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent focus:border-transparent transition-colors text-sm"
                aria-label="Search tasks"
            />
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-wecare-text-secondary dark:text-wecare-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/10 hover:text-wecare-text-primary dark:hover:text-wecare-dark-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent"
          aria-label="Toggle theme"
        >
          <ThemeToggleIcon isDarkMode={isDarkMode} />
        </button>

        <button
          onClick={onNewTaskClick}
          className="flex items-center gap-2 bg-wecare-primary dark:bg-wecare-accent hover:bg-wecare-primary-hover dark:hover:bg-wecare-accent-hover text-white dark:text-wecare-accent-text font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
        >
          <PlusIcon />
          New Task
        </button>

        <button
          onClick={onSignOut}
          className="bg-wecare-surface hover:bg-wecare-border dark:bg-wecare-dark-surface-solid dark:hover:bg-wecare-dark-surface text-wecare-text-primary dark:text-wecare-dark-text-primary font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm border border-wecare-border dark:border-wecare-dark-border"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
