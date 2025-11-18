

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { STAGES, DEPARTMENTS_CONFIG } from './constants';
import DashboardOverview from './pages/DashboardOverview';
import StageDetail from './pages/PhaseDetail';
import DepartmentDetail from './pages/DepartmentDetail';
import Placeholder from './pages/Placeholder';
import LoadingSpinner from './components/LoadingSpinner';
import TaskDetailModal from './components/TaskDetailModal';
import NewTaskModal from './components/NewTaskModal';
import StageProgress from './pages/StageProgress';
import DepartmentProgress from './pages/DepartmentProgress';
import IssuesPage from './pages/IssuesPage';
import type { NavItem, Department, Stage, Task, Discussion, ProjectMember } from './types';
import { 
  GOOGLE_SHEET_SPREADSHEET_ID, 
  GOOGLE_SHEET_TASKS_TABLE_NAME,
  GOOGLE_SHEET_DISCUSSIONS_TABLE_NAME,
  GOOGLE_SHEET_PROJECT_MEMBERS_TABLE_NAME,
  GOOGLE_CLIENT_ID,
  GOOGLE_API_SCOPES,
  GOOGLE_API_DISCOVERY_DOCS
} from './constants';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

function parseDiscussions(rows: string[][]): Discussion[] {
    if (!rows || rows.length < 2) return [];
    const discussions: Discussion[] = [];
    for (let i = 1; i < rows.length; i++) {
        const [taskId, timestamp, author, content, type, locale_vn, locale_us] = rows[i];
        if (taskId && content) {
            discussions.push({
                taskId: taskId.trim(),
                timestamp: timestamp || new Date().toISOString(),
                author: author || 'Unknown User',
                content: content.trim(),
                type: type?.toLowerCase() === 'issue' ? 'issue' : 'discussion',
                rowIndex: i + 1,
                locale_vn: locale_vn || '',
                locale_us: locale_us || '',
            });
        }
    }
    return discussions;
}

function parseProjectMembers(rows: string[][]): ProjectMember[] {
    if (!rows || rows.length < 2) return [];
    const members: ProjectMember[] = [];
    for (let i = 1; i < rows.length; i++) {
        const [name, department] = rows[i];
        if (name && name.trim()) {
            members.push({
                name: name.trim(),
                department: department?.trim() || 'N/A',
            });
        }
    }
    return members.sort((a, b) => a.name.localeCompare(b.name));
}

function parseSheetData(taskRows: string[][], discussionRows: string[][]): Department[] {
    const discussions = parseDiscussions(discussionRows);
    const discussionsMap = new Map<string, Discussion[]>();
    discussions.forEach(d => {
        const key = d.taskId;
        if (!discussionsMap.has(key)) {
            discussionsMap.set(key, []);
        }
        discussionsMap.get(key)!.push(d);
    });
    
    const departmentsMap: Map<string, Department> = new Map();
    DEPARTMENTS_CONFIG.forEach(config => {
        departmentsMap.set(config.name, {
            ...config,
            tasksByStage: [],
        });
    });

    if (!taskRows || taskRows.length < 2) {
        console.warn("Sheet data is empty or only contains a header.");
        return Array.from(departmentsMap.values());
    }

    for (let i = 1; i < taskRows.length; i++) {
        const [
            stageName,      // A
            departmentName, // B
            taskId,         // C
            taskName,       // D
            description,    // E
            pic,            // F
            deliverables,   // G
            status,         // H
            progressStr,    // I
            startDate,      // J
            endDate,        // K
            duration        // L
        ] = taskRows[i];
        
        if (!stageName || !departmentName || !taskId || !taskName) continue;

        const stageMatch = stageName.match(/Stage (\d+)/);
        if (!stageMatch) continue;
        const stageId = parseInt(stageMatch[1], 10);

        const trimmedDeptName = departmentName.trim();
        const deptConfig = DEPARTMENTS_CONFIG.find(d => d.name.toLowerCase() === trimmedDeptName.toLowerCase());

        if (!deptConfig) {
            console.warn(`Department not found in config: "${trimmedDeptName}"`);
            continue;
        }
        
        const department = departmentsMap.get(deptConfig.name);
        if (!department) continue; 

        let stageTasks = department.tasksByStage.find(s => s.stageId === stageId);
        if (!stageTasks) {
            stageTasks = { stageId: stageId, tasks: [] };
            department.tasksByStage.push(stageTasks);
        }

        const progress = parseInt(String(progressStr).replace('%', ''), 10) || 0;

        const task: Task = {
            id: taskId.trim(),
            pic: taskName ? taskName.trim() : '',
            description: pic ? pic.trim() : 'N/A',
            status: status ? status.trim() : 'N/A',
            progress: isNaN(progress) ? 0 : progress,
            startDate: startDate || 'N/A',
            endDate: endDate || 'N/A',
            duration: duration || 'N/A',
            notes: description || '',
            dependencies: deliverables || '',
            discussions: discussionsMap.get(taskId.trim())?.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || [],
            stageName,
            departmentName: department.name,
            rowIndex: i + 1,
        };

        stageTasks.tasks.push(task);
    }
    
    const departmentsData = Array.from(departmentsMap.values());
    departmentsData.forEach(dept => {
        dept.tasksByStage.forEach(stage => {
            stage.tasks.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));
        });
        dept.tasksByStage.sort((a, b) => a.stageId - b.stageId);
    });
    return departmentsData;
}

function generateSitemap(stages: Stage[], departments: Department[]): NavItem[] {
  return [
    {
        id: 'dashboard',
        title: 'Dashboard',
        children: [
            { id: 'overview', title: 'Overview', path: 'dashboard/overview' },
            { id: 'stage-progress', title: 'Stage Progress', path: 'dashboard/stage-progress' },
            { id: 'department-progress', title: 'Department Progress', path: 'dashboard/department-progress' },
            { id: 'all-issues', title: 'All Issues', path: 'dashboard/all-issues' },
        ],
    },
    {
        id: 'stage',
        title: 'Stage',
        children: [
            ...stages.map(stage => ({
                id: stage.id.toString(),
                title: `Stage ${stage.id} - ${stage.title.split(':')[1].trim()}`,
                path: `stage/${stage.id}`
            }))
        ],
    },
    {
        id: 'department',
        title: 'Department',
        children: [
            ...departments.map(dept => ({
                id: dept.name,
                title: dept.name,
                path: `department/${dept.name}`
            }))
        ],
    },
  ];
}

const LoginScreen: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => (
    <div className="flex items-center justify-center min-h-screen bg-wecare-surface dark:bg-wecare-dark-bg p-4">
      <div className="text-center bg-wecare-surface-elevated dark:bg-wecare-dark-surface-solid p-8 rounded-2xl shadow-lg max-w-md w-full border border-wecare-border dark:border-wecare-dark-border">
        <img src="https://i.imgur.com/tD07Yrv.png" alt="WeCare Logo" className="h-16 mx-auto mb-4" />
        <h1 className="text-3xl text-wecare-text-primary dark:text-wecare-dark-text-primary mb-2">WeCare Transition</h1>
        <p className="text-wecare-text-secondary dark:text-wecare-dark-text-secondary mb-6">Please sign in to access the project dashboard.</p>
        <button 
          onClick={onSignIn} 
          className="bg-wecare-primary dark:bg-wecare-accent hover:bg-wecare-primary-hover dark:hover:bg-wecare-accent-hover text-white dark:text-wecare-accent-text font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-standard flex items-center justify-center w-full focus:outline-none focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent"
          aria-label="Sign in with Google"
        >
          <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574	l6.19,5.238C39.99,34.556,44,29.865,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
          Sign In with Google
        </button>
        <p className="text-xs text-wecare-text-secondary dark:text-wecare-dark-text-secondary mt-4">This app requires read and write access to Google Sheets.</p>
      </div>
    </div>
  );

const PageHeader: React.FC<{ breadcrumbs: NavItem[] }> = ({ breadcrumbs }) => {
  const title = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].title : "Dashboard";
  
  if (breadcrumbs.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-6">
      <nav className="text-sm text-wecare-text-secondary dark:text-wecare-dark-text-secondary" aria-label="Breadcrumb">
        <ol className="list-none p-0 inline-flex items-center">
          <li className="flex items-center">
            <span>Home</span>
          </li>
          {breadcrumbs.slice(1).map((crumb, index) => (
            <li key={index} className="flex items-center">
              <svg className="h-5 w-5 text-wecare-text-secondary dark:text-wecare-dark-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className={index === breadcrumbs.length - 2 ? "font-semibold text-wecare-text-primary dark:text-wecare-dark-text-primary" : ""}>
                {crumb.title}
              </span>
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="text-3xl mt-1 text-wecare-text-primary dark:text-wecare-dark-text-primary">
        {title}
      </h1>
    </div>
  );
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('dashboard/overview');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sitemap, setSitemap] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; picture: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

  const translateContent = useCallback(async (text: string): Promise<{ vn: string; us: string }> => {
      try {
          const model = 'gemini-2.5-flash';
          const vnPrompt = `Translate the following text to Vietnamese. Only return the translated text. Text: "${text}"`;
          const usPrompt = `Translate the following text to US English. Only return the translated text. Text: "${text}"`;

          const [vnResponse, usResponse] = await Promise.all([
              ai.models.generateContent({ model, contents: vnPrompt }),
              ai.models.generateContent({ model, contents: usPrompt }),
          ]);

          return { 
              vn: vnResponse.text.trim(), 
              us: usResponse.text.trim()
          };
      } catch (error) {
          console.error("AI translation failed:", error);
          return { vn: '', us: '' };
      }
  }, [ai]);


  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const checkApis = setInterval(() => {
        if (typeof window.gapi !== 'undefined' && !gapiReady) {
            window.gapi.load('client', async () => {
                await window.gapi.client.init({ discoveryDocs: GOOGLE_API_DISCOVERY_DOCS });
                setGapiReady(true);
            });
        }
        if (typeof window.google !== 'undefined' && !gisReady) {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: GOOGLE_API_SCOPES,
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        setAccessToken(tokenResponse.access_token);
                        window.gapi.client.setToken(tokenResponse);
                    } else {
                        setError('Failed to get access token from Google.');
                    }
                },
            });
            setTokenClient(client);
            setGisReady(true);
        }
        if (gapiReady && gisReady) {
            clearInterval(checkApis);
            setLoading(false);
        }
    }, 100);
    return () => clearInterval(checkApis);
  }, [gapiReady, gisReady]);

    const fetchSheetData = useCallback(async () => {
        if (!accessToken || !gapiReady) return;

        setLoading(true);
        setError(null);
        
        try {
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!userResponse.ok) throw new Error('Failed to fetch user info');
            const profile = await userResponse.json();
            setUserProfile(profile);

            const [tasksResponse, discussionsResponse, membersResponse] = await Promise.all([
                window.gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: GOOGLE_SHEET_SPREADSHEET_ID,
                    range: `${GOOGLE_SHEET_TASKS_TABLE_NAME}!A:L`,
                }),
                window.gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: GOOGLE_SHEET_SPREADSHEET_ID,
                    range: `${GOOGLE_SHEET_DISCUSSIONS_TABLE_NAME}!A:G`,
                }),
                window.gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: GOOGLE_SHEET_SPREADSHEET_ID,
                    range: `${GOOGLE_SHEET_PROJECT_MEMBERS_TABLE_NAME}!A:B`,
                }),
            ]);

            const taskRows = tasksResponse.result.values || [];
            const discussionRows = discussionsResponse.result.values || [];
            const memberRows = membersResponse.result.values || [];

            const parsedTaskData = parseSheetData(taskRows, discussionRows);
            const parsedMembers = parseProjectMembers(memberRows);

            setDepartments(parsedTaskData);
            setProjectMembers(parsedMembers);
            setSitemap(generateSitemap(STAGES, parsedTaskData));

            if (!taskRows || taskRows.length < 2) {
                setError("Connected to Google Sheets, but no task data was found.");
            }
        } catch (err: any) {
            console.error("Failed to fetch data:", err);
            setError(`Failed to load project data: ${err.result?.error?.message || err.message}.`);
            if (err.status === 401 || err.status === 403) {
                handleSignOut();
            }
        } finally {
            setLoading(false);
        }
    }, [accessToken, gapiReady]);

    useEffect(() => {
        fetchSheetData();
    }, [fetchSheetData]);
  
  const handleSignIn = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken({});
    } else {
      setError("Google authentication is not ready. Please try again in a moment.");
    }
  };

  const handleSignOut = () => {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        setAccessToken(null);
        setUserProfile(null);
        window.gapi.client.setToken(null);
      });
    }
  };

    const handleUpdateTask = async (updatedTask: Task) => {
        if (!updatedTask) return;

        const originalDepartments = departments;

        // Optimistic UI update
        const updatedDepartments = departments.map(dept => {
             if (dept.name !== updatedTask.departmentName) return dept;
             return {
                ...dept,
                tasksByStage: dept.tasksByStage.map(stage => ({
                    ...stage,
                    tasks: stage.tasks.map(task => 
                        task.id === updatedTask.id && task.departmentName === updatedTask.departmentName
                        ? updatedTask 
                        : task
                    )
                }))
             };
        });
        setDepartments(updatedDepartments);
        setSelectedTask(null); // Close modal after saving

        try {
            const values = [[
                updatedTask.pic,            // D: Task Name
                updatedTask.notes,          // E: Description (used as notes in our app)
                updatedTask.description,    // F: PIC (used as description in our app)
                updatedTask.dependencies,   // G: Deliverables (used as dependencies in our app)
                updatedTask.status,         // H: Status
                `${updatedTask.progress}%`, // I: Progress
                updatedTask.startDate,      // J: Start Date
                updatedTask.endDate,        // K: End Date
            ]];

            const range = `${GOOGLE_SHEET_TASKS_TABLE_NAME}!D${updatedTask.rowIndex}:K${updatedTask.rowIndex}`;
            
            await window.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: GOOGLE_SHEET_SPREADSHEET_ID,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: { values },
            });
        } catch (err: any) {
            console.error("Failed to update task in Google Sheet:", err);
            setError(`Failed to save changes: ${err.result?.error?.message || err.message}. Reverting changes.`);
            // Revert UI on failure
            setDepartments(originalDepartments);
            setSelectedTask(updatedTask); // Re-open modal with unsaved data
        }
    };
    
    const handleAddDiscussion = async (taskId: string, content: string, type: 'discussion' | 'issue') => {
        if (!content.trim() || !userProfile) return;

        const originalDepartments = departments;
        const contentToSave = content.trim();

        const { vn, us } = await translateContent(contentToSave);

        const newDiscussion: Discussion = {
            taskId,
            timestamp: new Date().toISOString(),
            author: userProfile.name,
            content: contentToSave,
            type,
            locale_vn: vn,
            locale_us: us,
            rowIndex: -1 // Temporary index
        };

        const updatedDepartments = departments.map(dept => ({
            ...dept,
            tasksByStage: dept.tasksByStage.map(stage => ({
                ...stage,
                tasks: stage.tasks.map(task => 
                    task.id === taskId
                    ? { ...task, discussions: [...(task.discussions || []), newDiscussion] }
                    : task
                )
            }))
        }));
        setDepartments(updatedDepartments);
        
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(prev => prev ? ({ ...prev, discussions: [...(prev.discussions || []), newDiscussion] }) : null);
        }
        
        try {
            const capitalizedType = newDiscussion.type.charAt(0).toUpperCase() + newDiscussion.type.slice(1);
            const values = [[ 
                newDiscussion.taskId, 
                newDiscussion.timestamp, 
                newDiscussion.author, 
                newDiscussion.content, 
                capitalizedType,
                newDiscussion.locale_vn,
                newDiscussion.locale_us,
            ]];
            await window.gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: GOOGLE_SHEET_SPREADSHEET_ID,
                range: GOOGLE_SHEET_DISCUSSIONS_TABLE_NAME,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: { values },
            });
            await fetchSheetData();
        } catch (err: any) {
            console.error("Failed to add discussion:", err);
            setError(`Failed to add discussion: ${err.result?.error?.message || err.message}. Please try again.`);
            setDepartments(originalDepartments);
        }
    };

    const handleUpdateDiscussion = async (updatedDiscussion: Discussion) => {
        const originalDepartments = departments;

        const task = departments
            .flatMap(d => d.tasksByStage)
            .flatMap(s => s.tasks)
            .find(t => t.id === updatedDiscussion.taskId);
        
        const originalDiscussion = task?.discussions?.find(d => d.rowIndex === updatedDiscussion.rowIndex);
        
        const contentChanged = originalDiscussion ? originalDiscussion.content !== updatedDiscussion.content : false;
        
        let discussionToSave = { ...updatedDiscussion };

        if (contentChanged) {
            const { vn, us } = await translateContent(updatedDiscussion.content);
            discussionToSave.locale_vn = vn;
            discussionToSave.locale_us = us;
        } else if (originalDiscussion) {
            discussionToSave.locale_vn = originalDiscussion.locale_vn;
            discussionToSave.locale_us = originalDiscussion.locale_us;
        }
        
        const updatedDepartments = departments.map(dept => ({
            ...dept,
            tasksByStage: dept.tasksByStage.map(stage => ({
                ...stage,
                tasks: stage.tasks.map(task => 
                    task.id === discussionToSave.taskId
                    ? { ...task, discussions: task.discussions?.map(d => d.rowIndex === discussionToSave.rowIndex ? discussionToSave : d).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) }
                    : task
                )
            }))
        }));
        setDepartments(updatedDepartments);

        if (selectedTask && selectedTask.id === discussionToSave.taskId) {
            setSelectedTask(prev => prev ? ({ ...prev, discussions: prev.discussions?.map(d => d.rowIndex === discussionToSave.rowIndex ? discussionToSave : d).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) }) : null);
        }

        try {
            const capitalizedType = discussionToSave.type.charAt(0).toUpperCase() + discussionToSave.type.slice(1);
            const values = [[
                discussionToSave.taskId,
                discussionToSave.timestamp,
                discussionToSave.author,
                discussionToSave.content,
                capitalizedType,
                discussionToSave.locale_vn,
                discussionToSave.locale_us,
            ]];
            const range = `${GOOGLE_SHEET_DISCUSSIONS_TABLE_NAME}!A${discussionToSave.rowIndex}:G${discussionToSave.rowIndex}`;
            await window.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: GOOGLE_SHEET_SPREADSHEET_ID,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: { values },
            });
        } catch (err: any) {
            console.error("Failed to update discussion:", err);
            setError(`Failed to update discussion: ${err.result?.error?.message || err.message}. Reverting changes.`);
            setDepartments(originalDepartments);
        }
    };

    const handleDeleteDiscussion = async (discussionToDelete: Discussion) => {
        const originalDepartments = departments;

        const updatedDepartments = departments.map(dept => ({
            ...dept,
            tasksByStage: dept.tasksByStage.map(stage => ({
                ...stage,
                tasks: stage.tasks.map(task =>
                    task.id === discussionToDelete.taskId
                    ? { ...task, discussions: task.discussions?.filter(d => d.rowIndex !== discussionToDelete.rowIndex) }
                    : task
                )
            }))
        }));
        setDepartments(updatedDepartments);
        
        if (selectedTask && selectedTask.id === discussionToDelete.taskId) {
            setSelectedTask(prev => prev ? ({ ...prev, discussions: prev.discussions?.filter(d => d.rowIndex !== discussionToDelete.rowIndex) }) : null);
        }

        try {
            const range = `${GOOGLE_SHEET_DISCUSSIONS_TABLE_NAME}!A${discussionToDelete.rowIndex}:E${discussionToDelete.rowIndex}`;
            await window.gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: GOOGLE_SHEET_SPREADSHEET_ID,
                range: range,
            });
        } catch (err: any) {
            console.error("Failed to delete discussion:", err);
            setError(`Failed to delete discussion: ${err.result?.error?.message || err.message}. Reverting changes.`);
            setDepartments(originalDepartments);
        }
    };

  const getDepartmentAbbr = (departmentName: string): string => {
    const dept = DEPARTMENTS_CONFIG.find(d => d.name === departmentName);
    return dept ? dept.abbr : 'GEN';
  };

  const generateNewTaskId = (departmentName: string, stageId: number): string => {
      const deptAbbr = getDepartmentAbbr(departmentName);
      const prefix = `${deptAbbr}-${stageId}-`;

      let maxNum = 0;
      departments.forEach(dept => {
          if (dept.name === departmentName) {
              const stage = dept.tasksByStage.find(s => s.stageId === stageId);
              if (stage) {
                  stage.tasks.forEach(task => {
                      if (task.id.startsWith(prefix)) {
                          const numPart = task.id.substring(prefix.length);
                          const num = parseInt(numPart, 10);
                          if (!isNaN(num) && num > maxNum) {
                              maxNum = num;
                          }
                      }
                  });
              }
          }
      });
      return `${prefix}${maxNum + 1}`;
  };

    const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'discussions' | 'rowIndex'> & { stageId: number }) => {
        setIsNewTaskModalOpen(false);
        setLoading(true);

        try {
            const { stageId, ...rest } = newTaskData;
            const stage = STAGES.find(s => s.id === stageId);
            if (!stage) throw new Error("Invalid stage selected.");

            const taskId = generateNewTaskId(rest.departmentName!, stageId);
            
            const values = [[
                stage.title,
                rest.departmentName,
                taskId,
                rest.pic,
                rest.notes,
                rest.description,
                rest.dependencies,
                rest.status,
                `${rest.progress || 0}%`,
                rest.startDate,
                rest.endDate,
                rest.duration,
            ]];

            await window.gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: GOOGLE_SHEET_SPREADSHEET_ID,
                range: GOOGLE_SHEET_TASKS_TABLE_NAME,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: { values },
            });
            await fetchSheetData();
        } catch (err: any) {
            console.error("Failed to add task:", err);
            setError(`Failed to add task: ${err.result?.error?.message || err.message}. Please try again.`);
            setLoading(false);
        }
    };

  const breadcrumbs = useMemo(() => {
    if (!activeView) return [];
    const crumbs: NavItem[] = [];
    const activeSection = sitemap.find(section => activeView.startsWith(section.id));
    if (activeSection) {
        crumbs.push({ id: activeSection.id, title: activeSection.title });
        const activeChild = activeSection.children?.find(child => child.path === activeView);
        if (activeChild) {
            crumbs.push(activeChild);
        }
    }
    return crumbs;
  }, [activeView, sitemap]);

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) {
        return departments;
    }

    const lowercasedQuery = searchQuery.toLowerCase();

    return departments.map(dept => ({
        ...dept,
        tasksByStage: dept.tasksByStage.map(stage => ({
            ...stage,
            tasks: stage.tasks.filter(task => 
                task.pic.toLowerCase().includes(lowercasedQuery) ||
                task.id.toLowerCase().includes(lowercasedQuery)
            )
        })).filter(stage => stage.tasks.length > 0)
    })).filter(dept => dept.tasksByStage.some(s => s.tasks.length > 0));

  }, [departments, searchQuery]);

  const renderContent = () => {
    if (loading && !accessToken) return <div />;
    if (loading && departments.length === 0) return <LoadingSpinner />;
    if (error) {
        return (
            <div className="flex items-center justify-center h-full p-4">
                <div className="text-center bg-wecare-surface-elevated dark:bg-wecare-dark-surface-solid p-8 rounded-2xl shadow-lg max-w-lg w-full border border-wecare-danger">
                    <h2 className="text-2xl text-wecare-danger mb-2">An Error Occurred</h2>
                    <p className="text-wecare-text-secondary dark:text-wecare-dark-text-secondary">{error}</p>
                    <button 
                      onClick={accessToken ? () => window.location.reload() : handleSignIn} 
                      className="mt-6 bg-wecare-primary dark:bg-wecare-accent hover:bg-wecare-primary-hover dark:hover:bg-wecare-accent-hover text-white dark:text-wecare-accent-text font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {accessToken ? 'Retry' : 'Sign In Again'}
                    </button>
                </div>
            </div>
        );
    }

    const [type, id] = activeView.split('/');
    switch (type) {
      case 'dashboard':
        if (id === 'overview') {
            return <DashboardOverview stages={STAGES} departments={filteredDepartments} onTaskClick={setSelectedTask} />;
        }
        if (id === 'stage-progress') {
            return <StageProgress stages={STAGES} departments={departments} onTaskClick={setSelectedTask} />;
        }
        if (id === 'department-progress') {
            return <DepartmentProgress departments={departments} onTaskClick={setSelectedTask} />;
        }
        if (id === 'all-issues') {
            return <IssuesPage departments={filteredDepartments} onTaskClick={setSelectedTask} />;
        }
        return <Placeholder title="Dashboard" />;
      case 'stage':
        const stage = STAGES.find(s => s.id.toString() === id);
        return stage ? <StageDetail stage={stage} departments={filteredDepartments} onTaskClick={setSelectedTask} /> : <Placeholder title="Stage Not Found" />;
      case 'department':
        const department = filteredDepartments.find(d => d.name === id);
        return department ? <DepartmentDetail department={department} stages={STAGES} onTaskClick={setSelectedTask} /> : <Placeholder title="Department Not Found" />;
      default:
        return <DashboardOverview stages={STAGES} departments={filteredDepartments} onTaskClick={setSelectedTask} />;
    }
  };

  if (!accessToken) {
    return <LoginScreen onSignIn={handleSignIn} />;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header 
        onSignOut={handleSignOut} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onNewTaskClick={() => setIsNewTaskModalOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar sitemap={sitemap} activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <PageHeader breadcrumbs={breadcrumbs} />
          {renderContent()}
        </main>
      </div>
      {selectedTask && (
        <TaskDetailModal 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)}
            onSave={handleUpdateTask}
            onAddDiscussion={handleAddDiscussion}
            onUpdateDiscussion={handleUpdateDiscussion}
            onDeleteDiscussion={handleDeleteDiscussion}
            currentUser={userProfile}
            projectMembers={projectMembers}
            departmentColor={departments.find(d => d.name === selectedTask.departmentName)?.color || 'gray'}
        />
      )}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleAddTask}
        stages={STAGES}
        departmentsConfig={DEPARTMENTS_CONFIG}
        projectMembers={projectMembers}
      />
    </div>
  );
};

export default App;