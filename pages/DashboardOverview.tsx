import React from 'react';
import ProjectBoard from '../components/ProjectBoard';
import type { Stage, Department, Task } from '../types';

interface DashboardOverviewProps {
  stages: Stage[];
  departments: Department[];
  onTaskClick: (task: Task) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stages, departments, onTaskClick }) => {
  return (
    <ProjectBoard stages={stages} departments={departments} onTaskClick={onTaskClick} />
  );
};

export default DashboardOverview;
