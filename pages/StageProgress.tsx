import React, { useMemo } from 'react';
import ProgressCard from '../components/ProgressCard';
import ActiveTaskCard from '../components/ActiveTaskCard';
import type { Stage, Department, Task } from '../types';
import { StageIcon } from '../components/Icons';

interface StageProgressProps {
  stages: Stage[];
  departments: Department[];
  onTaskClick: (task: Task) => void;
}

const StageProgress: React.FC<StageProgressProps> = ({ stages, departments, onTaskClick }) => {
  const stageProgressData = useMemo(() => {
    return stages.map(stage => {
      let totalTasks = 0;
      let totalProgress = 0;
      let completedTasks = 0;
      let inProgressTasksCount = 0;
      const activeTasks: Task[] = [];

      departments.forEach(dept => {
        const stageData = dept.tasksByStage.find(s => s.stageId === stage.id);
        if (stageData) {
          stageData.tasks.forEach(task => {
            totalTasks++;
            totalProgress += task.progress;
            if (task.status === 'Completed') {
              completedTasks++;
            } else if (task.status === 'In Progress' || task.status === 'Started') {
              inProgressTasksCount++;
              activeTasks.push(task);
            }
          });
        }
      });

      const averageProgress = totalTasks > 0 ? totalProgress / totalTasks : 0;

      return {
        id: stage.id,
        title: stage.title,
        progress: averageProgress,
        stats: [
          { label: "Total Tasks", value: totalTasks },
          { label: "Completed", value: completedTasks },
          { label: "In Progress", value: inProgressTasksCount },
        ],
        activeTasks: activeTasks.sort((a,b) => a.endDate.localeCompare(b.endDate)),
      };
    });
  }, [stages, departments]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stageProgressData.map(data => (
          <ProgressCard
            key={data.id}
            title={data.title}
            progress={data.progress}
            stats={data.stats}
            color="dept-sales"
            icon={<StageIcon />}
          />
        ))}
      </div>
      
      <div className="space-y-8">
        {stageProgressData.filter(s => s.activeTasks.length > 0).map(stageData => (
          <div key={`active-stage-${stageData.id}`}>
            <h2 className="text-2xl text-wecare-text-primary dark:text-wecare-dark-text-primary mb-4 border-b border-wecare-border dark:border-wecare-dark-border pb-2">
              Active Tasks in: {stageData.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {stageData.activeTasks.map(task => (
                <ActiveTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StageProgress;
