import React from 'react';
import TaskCard from './TaskCard';
import type { Stage, Department, Task } from '../types';

interface ProjectBoardProps {
  stages: Stage[];
  departments: Department[];
  onTaskClick: (task: Task) => void;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({ stages, departments, onTaskClick }) => {
  return (
    <div className="w-full">
      <div className="grid gap-4 min-w-[1200px]" style={{ gridTemplateColumns: `220px repeat(${stages.length}, 1fr)` }}>
        {/* Header Row: Stage Titles */}
        <div className="sticky top-0 z-10"></div>
        {stages.map((stage) => (
          <div key={stage.id} className="p-3 bg-wecare-surface-elevated dark:bg-wecare-dark-surface/80 dark:backdrop-blur-sm text-wecare-primary dark:text-wecare-accent rounded-xl text-center shadow-md border border-wecare-border dark:border-wecare-dark-border">
            <h3 className="font-bold text-base">{stage.title}</h3>
            <p className="text-xs opacity-80">{stage.duration}</p>
            <p className="text-xs font-mono">{stage.dates}</p>
          </div>
        ))}

        {/* Department Rows */}
        {departments.map((dept) => (
          <React.Fragment key={dept.name}>
            <div className="p-4 bg-wecare-surface-elevated dark:bg-wecare-dark-surface-solid rounded-xl flex items-center gap-3 shadow-sm sticky left-0 z-10 border border-wecare-border dark:border-wecare-dark-border">
              <span className="w-6 h-6 flex-shrink-0">{dept.icon}</span>
              <h4 className="font-semibold text-wecare-text-primary dark:text-wecare-dark-text-primary">{dept.name}</h4>
            </div>
            
            {stages.map((stage) => {
              const stageTasks = dept.tasksByStage.find(
                (s) => s.stageId === stage.id
              );
              return (
                <div
                  key={`${dept.name}-${stage.id}`}
                  className="p-2 bg-wecare-surface dark:bg-wecare-dark-surface/50 rounded-xl min-h-[150px] space-y-2 border border-wecare-border dark:border-wecare-dark-border"
                >
                  {stageTasks?.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      color={dept.color}
                      onTaskClick={onTaskClick}
                    />
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProjectBoard;