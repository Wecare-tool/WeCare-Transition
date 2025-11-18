import React, { useMemo } from 'react';
import ProgressCard from '../components/ProgressCard';
import ActiveTaskCard from '../components/ActiveTaskCard';
import type { Department, Task } from '../types';

interface DepartmentProgressProps {
  departments: Department[];
  onTaskClick: (task: Task) => void;
}

const DepartmentProgress: React.FC<DepartmentProgressProps> = ({ departments, onTaskClick }) => {
  const departmentProgressData = useMemo(() => {
    return departments.map(dept => {
      let totalTasks = 0;
      let totalProgress = 0;
      let completedTasks = 0;
      let inProgressTasksCount = 0;
      const activeTasks: Task[] = [];

      dept.tasksByStage.forEach(stage => {
        stage.tasks.forEach(task => {
          totalTasks++;
          totalProgress += task.progress;
          if (task.status === 'Completed') {
            completedTasks++;
          } else if (task.status === 'In Progress' || task.status === 'Started') {
            inProgressTasksCount++;
            activeTasks.push(task);
          }
        });
      });

      const averageProgress = totalTasks > 0 ? totalProgress / totalTasks : 0;

      return {
        name: dept.name,
        color: dept.color,
        icon: dept.icon,
        progress: averageProgress,
        stats: [
          { label: "Total Tasks", value: totalTasks },
          { label: "Completed", value: completedTasks },
          { label: "In Progress", value: inProgressTasksCount },
        ],
        activeTasks: activeTasks.sort((a,b) => a.endDate.localeCompare(b.endDate)),
      };
    });
  }, [departments]);

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {departmentProgressData.map(data => (
            <ProgressCard
              key={data.name}
              title={data.name}
              progress={data.progress}
              stats={data.stats}
              color={data.color}
              icon={data.icon}
            />
          ))}
        </div>
        <div className="space-y-8">
        {departmentProgressData.filter(d => d.activeTasks.length > 0).map(deptData => (
          <div key={`active-dept-${deptData.name}`}>
            <h2 className="text-2xl text-wecare-text-primary dark:text-wecare-dark-text-primary mb-4 border-b border-wecare-border dark:border-wecare-dark-border pb-2">
              Active Tasks in: {deptData.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {deptData.activeTasks.map(task => (
                <ActiveTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentProgress;
