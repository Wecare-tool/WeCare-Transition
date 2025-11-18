import React from 'react';

export interface ProjectMember {
  name: string;
  department: string;
}

export interface Discussion {
  taskId: string;
  timestamp: string;
  author: string;
  content: string;
  type: 'discussion' | 'issue';
  rowIndex: number;
  locale_vn?: string;
  locale_us?: string;
}

export interface Task {
  id: string;
  description: string;
  pic: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  duration: string;
  notes: string;
  dependencies: string;
  discussions?: Discussion[];
  stageName?: string;
  departmentName?: string;
  rowIndex: number;
}

export interface Stage {
  id: number;
  title: string;
  duration: string;
  dates: string;
}

export interface Department {
  name: string;
  color: string;
  icon: React.ReactNode;
  tasksByStage: {
    stageId: number;
    tasks: Task[];
  }[];
}

export interface NavItem {
  id: string;
  title:string;
  path?: string;
  children?: NavItem[];
}