
import React from 'react';
import type { Stage, Department } from './types';
import { AccountingIcon, ProcurementIcon, SalesIcon, WarehouseIcon, TechnologyIcon } from './components/Icons';

export const GOOGLE_SHEET_SPREADSHEET_ID = '1YHdDnAR48ie3uZXYoLsCeY1P1Nq8irwn-6MdguvVwJU';
export const GOOGLE_SHEET_TASKS_TABLE_NAME = 'Tasks';
export const GOOGLE_SHEET_DISCUSSIONS_TABLE_NAME = 'Discussions';
export const GOOGLE_SHEET_PROJECT_MEMBERS_TABLE_NAME = 'Project member';


export const GOOGLE_CLIENT_ID = '573735243623-11unib276cfu8aeq2b8cfmsi5mhtg1q2.apps.googleusercontent.com';
export const GOOGLE_API_SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile';
export const GOOGLE_API_DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];


export const STAGES: Stage[] = [
  {
    id: 1,
    title: "Stage 1: Market Study & Setup",
    duration: "3 weeks",
    dates: "11/03 - 11/21",
  },
  {
    id: 2,
    title: "Stage 2: Implementation & Piloting",
    duration: "3 weeks",
    dates: "11/24 - 12/12",
  },
  {
    id: 3,
    title: "Stage 3: Roll-out",
    duration: "6 weeks",
    dates: "12/14 - 1/23",
  },
  {
    id: 4,
    title: "Stage 4: Stabilization & Optimization",
    duration: "4 weeks",
    dates: "1/26 - 2/20",
  },
];

export const DEPARTMENTS_CONFIG: (Omit<Department, 'tasksByStage'> & { abbr: string })[] = [
  {
    name: "Finance & Accounting",
    color: "dept-finance",
    icon: <AccountingIcon />,
    abbr: 'FIN'
  },
  {
    name: "Procurement",
    color: "dept-procurement",
    icon: <ProcurementIcon />,
    abbr: 'PRO'
  },
  {
    name: "Sales",
    color: "dept-sales",
    icon: <SalesIcon />,
    abbr: 'SAL'
  },
  {
    name: "Warehouse",
    color: "dept-warehouse",
    icon: <WarehouseIcon />,
    abbr: 'WAR'
  },
  {
    name: "Technology",
    color: "dept-technology",
    icon: <TechnologyIcon />,
    abbr: 'TEC'
  },
];

export const COLOR_MAP: { [key: string]: string } = {
  "dept-finance": "border-dept-finance text-dept-finance",
  "dept-procurement": "border-dept-procurement text-dept-procurement",
  "dept-sales": "border-dept-sales text-dept-sales",
  "dept-warehouse": "border-dept-warehouse text-dept-warehouse",
  "dept-technology": "border-dept-technology text-dept-technology",
  gray: "border-wecare-text-secondary dark:border-wecare-dark-border text-wecare-text-secondary dark:text-wecare-dark-text-secondary",
};

export const PROGRESS_COLOR_MAP: { [key: string]: string } = {
  "dept-finance": "bg-dept-finance",
  "dept-procurement": "bg-dept-procurement",
  "dept-sales": "bg-dept-sales",
  "dept-warehouse": "bg-dept-warehouse",
  "dept-technology": "bg-dept-technology",
  gray: "bg-wecare-text-secondary dark:bg-wecare-dark-text-secondary",
};
