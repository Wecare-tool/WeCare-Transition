import React from 'react';
import ProgressBar from './ProgressBar';
import { PROGRESS_COLOR_MAP, COLOR_MAP } from '../constants';
import { TotalTasksIcon, CompletedTasksIcon, InProgressTasksIcon } from './Icons';

interface ProgressCardProps {
  title: string;
  progress: number;
  stats: { label: string; value: string | number }[];
  color: string;
  icon?: React.ReactNode;
}

const statIcons: { [key: string]: React.ReactNode } = {
  "Total Tasks": <TotalTasksIcon />,
  "Completed": <CompletedTasksIcon />,
  "In Progress": <InProgressTasksIcon />,
};


const ProgressCard: React.FC<ProgressCardProps> = ({ title, progress, stats, color, icon }) => {
  const progressColorClass = PROGRESS_COLOR_MAP[color] || PROGRESS_COLOR_MAP['gray'];
  const textColorClass = (COLOR_MAP[color] || COLOR_MAP['gray']).split(' ').filter(c => c.startsWith('text-')).join(' ');

  return (
    <div className="bg-wecare-surface-elevated dark:bg-wecare-dark-surface/80 dark:backdrop-blur-sm p-6 rounded-2xl shadow-md border border-wecare-border dark:border-wecare-dark-border flex flex-col gap-5 transition-all duration-300 hover:shadow-lg dark:hover:shadow-glow-accent hover:-translate-y-1">
      <div className="flex items-center gap-3">
        {icon && <span className="w-8 h-8 flex-shrink-0 text-wecare-primary dark:text-wecare-accent">{icon}</span>}
        <h3 className="text-lg font-bold text-wecare-text-primary dark:text-wecare-dark-text-primary truncate">{title}</h3>
      </div>
      
      <div className="flex-grow flex flex-col justify-center gap-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-wecare-text-secondary dark:text-wecare-dark-text-secondary">Overall Progress</span>
        </div>
        <div className='flex items-center gap-4'>
            <ProgressBar progress={progress} colorClass={progressColorClass} />
            <span className={`font-bold text-2xl ${textColorClass} font-mono`}>
                {progress.toFixed(0)}%
            </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-wecare-border dark:border-wecare-dark-border pt-5">
        {stats.map(stat => (
          <div key={stat.label} className="flex items-center gap-3">
             <div className="text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
               {statIcons[stat.label]}
             </div>
             <div>
              <p className="text-xl font-bold text-wecare-text-primary dark:text-wecare-dark-text-primary">{stat.value}</p>
              <p className="text-xs text-wecare-text-secondary dark:text-wecare-dark-text-secondary">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressCard;