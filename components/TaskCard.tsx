import React, { useMemo } from 'react';
import type { Task } from '../types';
import { COLOR_MAP, PROGRESS_COLOR_MAP } from '../constants';

interface TaskCardProps {
  task: Task;
  color: string;
  onTaskClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, color, onTaskClick }) => {
  const colorClasses = COLOR_MAP[color] || COLOR_MAP['gray'];
  const progressColorClass = PROGRESS_COLOR_MAP[color] || PROGRESS_COLOR_MAP['gray'];

  const isOverdue = useMemo(() => {
    if (task.status === 'Completed' || !task.endDate || task.endDate === 'N/A') {
        return false;
    }
    const parts = task.endDate.split('/');
    if (parts.length !== 3) return false;
    
    // new Date(year, monthIndex, day)
    const endDate = new Date(parseInt(parts[2], 10), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return endDate < today;
  }, [task.endDate, task.status]);


  return (
    <div
      onClick={() => onTaskClick(task)}
      className={`relative p-3 rounded-xl shadow-sm transition-all duration-300 ease-standard transform hover:shadow-lg hover:-translate-y-1 dark:hover:shadow-glow-accent bg-wecare-surface-elevated dark:bg-wecare-dark-surface/80 dark:backdrop-blur-sm border ${colorClasses} border-l-4 text-left w-full cursor-pointer overflow-hidden pb-4`}
      aria-label={`View details for task ${task.id}: ${task.pic.split('\n')[0]}`}
    >
        <div className="flex justify-between items-start gap-2">
            <p className="text-sm font-medium text-wecare-text-primary dark:text-wecare-dark-text-primary leading-tight pr-2" title={task.pic}>
                {task.pic}
            </p>
            <div className="font-mono font-bold text-xs flex-shrink-0">
                <span className={`${colorClasses} py-1 px-2 rounded-md font-semibold bg-black/5 dark:bg-wecare-dark-bg/50`}>
                    {task.progress}%
                </span>
            </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-2 text-xs">
            {isOverdue && (
                <span className="px-2 py-0.5 font-semibold rounded-full bg-wecare-warning/20 text-wecare-warning border border-wecare-warning/30">
                    Overdue
                </span>
            )}
            <span className="px-2 py-0.5 font-medium rounded-full bg-wecare-surface dark:bg-wecare-dark-surface-solid text-wecare-text-secondary dark:text-wecare-dark-text-secondary border border-wecare-border dark:border-wecare-dark-border">
                {task.status}
            </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-wecare-dark-bg/50">
            <div className={`h-1 rounded-r-full ${progressColorClass}`} style={{ width: `${task.progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
        </div>
    </div>
  );
};

export default TaskCard;