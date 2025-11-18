
import React, { useState } from 'react';
import type { NavItem } from '../types';
import { DashboardIcon, StageIcon, DepartmentIcon, IssueIcon } from './Icons';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  sitemap: NavItem[];
}

const SECTION_ICONS: { [key: string]: React.ReactNode } = {
  dashboard: <DashboardIcon />,
  stage: <StageIcon />,
  department: <DepartmentIcon />,
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, sitemap }) => {
  const [openSections, setOpenSections] = useState<string[]>(['dashboard', 'issues', 'stage', 'department']);

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
    if (!item.path) return null;
    const isActive = activeView === item.path;
    return (
      <li className="relative">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveView(item.path!);
          }}
          className={`block py-2.5 px-4 text-sm rounded-lg transition-all duration-200 ease-standard ${
            isActive
              ? 'bg-wecare-primary/10 text-wecare-primary dark:bg-wecare-accent/10 dark:text-wecare-accent font-semibold'
              : 'text-wecare-text-secondary dark:text-wecare-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-wecare-text-primary dark:hover:text-wecare-dark-text-primary'
          }`}
        >
          {item.title}
        </a>
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-wecare-primary dark:bg-wecare-accent rounded-r-full shadow-md dark:shadow-glow-accent"></div>}
      </li>
    );
  };

  return (
    <aside className="hidden w-72 flex-shrink-0 bg-wecare-surface-elevated dark:bg-wecare-dark-sidebar p-6 lg:block border-r border-wecare-border dark:border-wecare-dark-border">
      <nav className="space-y-6">
        {sitemap.map(section => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex justify-between items-center text-left py-2 px-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                 <span className="text-wecare-text-secondary dark:text-wecare-dark-text-secondary">{SECTION_ICONS[section.id]}</span>
                 <span className="font-bold text-sm text-wecare-text-secondary dark:text-wecare-dark-text-secondary uppercase tracking-wider">{section.title}</span>
              </div>
              <svg
                className={`w-4 h-4 text-wecare-text-secondary dark:text-wecare-dark-text-secondary transition-transform ${
                  openSections.includes(section.id) ? 'rotate-90' : ''
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {openSections.includes(section.id) && (
              <ul className="mt-2 space-y-1.5 pl-4 border-l border-wecare-border dark:border-wecare-dark-border ml-4">
                {section.children?.map(item => (
                  <NavLink key={item.path} item={item} />
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;