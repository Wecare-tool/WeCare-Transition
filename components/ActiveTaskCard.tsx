import React from 'react';
import type { Task } from '../types';
import { UserIcon, CalendarIcon, ZapIcon } from './Icons';

interface ActiveTaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
}

const priorityMap: { [key: string]: { label: string, style: { light: string, dark: string } } } = {
    'Blocked': { label: 'High', style: { light: 'bg-red-100 text-red-600', dark: 'dark:bg-red-500/10 dark:text-red-400'} },
    'In Progress': { label: 'Medium', style: { light: 'bg-yellow-100 text-yellow-600', dark: 'dark:bg-yellow-500/10 dark:text-yellow-400'} },
    'Started': { label: 'Medium', style: { light: 'bg-yellow-100 text-yellow-600', dark: 'dark:bg-yellow-500/10 dark:text-yellow-400'} },
    'Not Started': { label: 'Low', style: { light: 'bg-gray-100 text-gray-500', dark: 'dark:bg-gray-500/10 dark:text-gray-400'} },
    'Completed': { label: 'Completed', style: { light: 'bg-green-100 text-green-600', dark: 'dark:bg-green-500/10 dark:text-green-400'} },
};

const ActiveTaskCard: React.FC<ActiveTaskCardProps> = ({ task, onTaskClick }) => {
  
  const priority = priorityMap[task.status] || priorityMap['Not Started'];
  
  return (
    <div className="bg-wecare-surface-elevated dark:bg-wecare-dark-surface-solid border border-wecare-border dark:border-wecare-dark-border rounded-xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg dark:hover:shadow-glow-accent hover:border-wecare-primary/50 dark:hover:border-wecare-accent/50 hover:-translate-y-1">
      <div>
        <h3 className="text-lg font-bold text-wecare-text-primary dark:text-wecare-dark-text-primary mb-2 line-clamp-2">{task.pic}</h3>
        <p className="text-sm text-wecare-text-secondary dark:text-wecare-dark-text-secondary mb-6 line-clamp-3 h-[60px]">{task.notes || 'No description provided.'}</p>
        
        <div className="space-y-4 text-sm mb-6 border-t border-wecare-border dark:border-wecare-dark-border pt-4">
          <div className="flex items-center gap-3 text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
            <UserIcon />
            <span className="w-20">PIC:</span>
            <span className="font-medium text-wecare-text-primary dark:text-wecare-dark-text-primary">{task.description}</span>
          </div>
          <div className="flex items-center gap-3 text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
            <CalendarIcon />
            <span className="w-20">End Date:</span>
            <span className="font-medium text-wecare-text-primary dark:text-wecare-dark-text-primary">{task.endDate}</span>
          </div>
          <div className="flex items-center gap-3 text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
            <ZapIcon />
            <span className="w-20">Priority:</span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${priority.style.light} ${priority.style.dark}`}>{priority.label}</span>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-end">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-wecare-text-secondary dark:text-wecare-dark-text-secondary">Progress</span>
          <span className="font-semibold text-wecare-text-primary dark:text-wecare-dark-text-primary">{task.progress}%</span>
        </div>
        <div className="w-full bg-black/10 dark:bg-wecare-dark-bg rounded-full h-2">
          <div className="bg-wecare-primary dark:bg-wecare-accent h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
        </div>

        <button 
          onClick={() => onTaskClick(task)}
          className="w-full text-right mt-6 text-wecare-primary dark:text-wecare-accent font-semibold hover:opacity-80 transition-opacity flex items-center justify-end gap-2"
        >
          View Details 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ActiveTaskCard;
