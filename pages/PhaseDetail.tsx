import React from 'react';
import TaskCard from '../components/TaskCard';
import type { Stage, Department, Task } from '../types';

interface StageDetailProps {
  stage: Stage;
  departments: Department[];
  onTaskClick: (task: Task) => void;
}

const StageDetail: React.FC<StageDetailProps> = ({ stage, departments, onTaskClick }) => {
  return (
    <div className="space-y-6">
      {departments.map(dept => {
        const stageTasks = dept.tasksByStage.find(s => s.stageId === stage.id)?.tasks || [];
        if (stageTasks.length === 0) return null;

        return (
          <div key={dept.name} className="bg-wecare-surface-elevated dark:bg-wecare-dark-surface p-4 rounded-xl shadow-sm border border-wecare-border dark:border-wecare-dark-border">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6">{dept.icon}</span>
              <h4 className="font-semibold text-wecare-text-primary dark:text-wecare-dark-text-primary text-lg">{dept.name}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stageTasks.map(task => (
                <TaskCard
                    key={task.id}
                    task={task}
                    color={dept.color}
                    onTaskClick={onTaskClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StageDetail;
