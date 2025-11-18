
import React, { useMemo } from 'react';
import type { Department, Task } from '../types';
import IssueCard from '../components/IssueCard';

interface IssuesPageProps {
  departments: Department[];
  onTaskClick: (task: Task) => void;
}

const IssuesPage: React.FC<IssuesPageProps> = ({ departments, onTaskClick }) => {
  const tasksWithIssues = useMemo(() => {
    const allTasks: Task[] = [];
    departments.forEach(dept => {
      dept.tasksByStage.forEach(stage => {
        allTasks.push(...stage.tasks);
      });
    });

    return allTasks.filter(task => 
      task.discussions && task.discussions.some(d => d.type === 'issue')
    );
  }, [departments]);

  if (tasksWithIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-wecare-surface-elevated dark:bg-wecare-dark-surface-solid rounded-xl p-8 border border-dashed border-wecare-border dark:border-wecare-dark-border">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-wecare-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-wecare-text-primary dark:text-wecare-dark-text-primary mt-4">All Clear!</h2>
        <p className="text-wecare-text-secondary dark:text-wecare-dark-text-secondary mt-1">There are currently no open issues across the project.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tasksWithIssues.map(task => (
        <IssueCard 
          key={`${task.id}-${task.departmentName}`} 
          task={task} 
          onTaskClick={onTaskClick} 
        />
      ))}
    </div>
  );
};

export default IssuesPage;
