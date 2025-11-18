import React from 'react';
import TaskCard from '../components/TaskCard';
import type { Department, Stage, Task } from '../types';

interface DepartmentDetailProps {
  department: Department;
  stages: Stage[];
  onTaskClick: (task: Task) => void;
}

const DepartmentDetail: React.FC<DepartmentDetailProps> = ({ department, stages, onTaskClick }) => {
  return (
    <div className="space-y-6">
      {stages.map(stage => {
        const stageTasks = department.tasksByStage.find(s => s.stageId === stage.id)?.tasks || [];
        if (stageTasks.length === 0) return null;

        return (
          <div key={stage.id} className="bg-wecare-surface-elevated dark:bg-wecare-dark-surface p-4 rounded-xl shadow-sm border border-wecare-border dark:border-wecare-dark-border">
            <h3 className="font-bold text-lg text-wecare-text-primary dark:text-wecare-dark-text-primary mb-1">{stage.title}</h3>
            <p className="text-xs text-wecare-text-secondary dark:text-wecare-dark-text-secondary mb-4">{stage.duration} ({stage.dates})</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stageTasks.map(task => (
                <TaskCard
                    key={task.id}
                    task={task}
                    color={department.color}
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

export default DepartmentDetail;
