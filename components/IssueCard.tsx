
import React from 'react';
import type { Task, Discussion } from '../types';
import { COLOR_MAP } from '../constants';
import { DEPARTMENTS_CONFIG } from '../constants';

interface IssueCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
}

const IssueItem: React.FC<{ discussion: Discussion }> = ({ discussion }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-wecare-surface dark:bg-wecare-dark-surface border border-wecare-border dark:border-wecare-dark-border">
        <div className="w-8 h-8 rounded-full bg-wecare-border dark:bg-wecare-dark-border/50 flex-shrink-0 flex items-center justify-center font-bold text-wecare-text-secondary dark:text-wecare-dark-text-secondary text-sm">
            {discussion.author.charAt(0)}
        </div>
        <div className="flex-grow">
            <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-wecare-text-primary dark:text-wecare-dark-text-primary">{discussion.author}</p>
                <p className="text-xs text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
                    {new Date(discussion.timestamp).toLocaleString()}
                </p>
            </div>
            <p className="text-sm text-wecare-text-primary dark:text-wecare-dark-text-primary whitespace-pre-wrap mt-1">{discussion.content}</p>
        </div>
    </div>
);

const IssueCard: React.FC<IssueCardProps> = ({ task, onTaskClick }) => {
    const department = DEPARTMENTS_CONFIG.find(d => d.name === task.departmentName);
    const color = department?.color || 'gray';
    const colorClasses = COLOR_MAP[color] || COLOR_MAP['gray'];

    const issues = task.discussions?.filter(d => d.type === 'issue') || [];

    return (
        <div 
            className="bg-wecare-surface-elevated dark:bg-wecare-dark-surface/80 dark:backdrop-blur-sm p-5 rounded-2xl shadow-md border border-wecare-border dark:border-wecare-dark-border"
        >
            <div 
                className="flex justify-between items-start gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-3 -m-3 rounded-lg transition-colors"
                onClick={() => onTaskClick(task)}
                aria-label={`View details for task with issues: ${task.pic}`}
            >
                <div>
                    <p className="text-sm font-semibold text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
                        <span className={`font-bold ${colorClasses}`}>{task.departmentName}</span> &bull; {task.stageName}
                    </p>
                    <h3 className="text-lg font-bold text-wecare-text-primary dark:text-wecare-dark-text-primary mt-1">{task.id}: {task.pic}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-3 py-1 font-medium rounded-full bg-wecare-surface dark:bg-wecare-dark-surface-solid text-wecare-text-secondary dark:text-wecare-dark-text-secondary border border-wecare-border dark:border-wecare-dark-border text-xs">
                        {task.status}
                    </span>
                    <span className="text-wecare-danger font-bold text-sm flex items-center gap-1.5 bg-wecare-danger/10 px-3 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {issues.length} Issue{issues.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>
            <div className="mt-4 pl-3 border-l-2 border-wecare-danger/50 space-y-3">
                {issues.map((issue, index) => (
                    <IssueItem key={`${issue.rowIndex}-${index}`} discussion={issue} />
                ))}
            </div>
        </div>
    );
};

export default IssueCard;
