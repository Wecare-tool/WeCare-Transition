
import React, { useState, useEffect } from 'react';
import type { Task, Stage, Department, ProjectMember } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'discussions' | 'rowIndex'> & { stageId: number }) => void;
  stages: Stage[];
  departmentsConfig: Omit<Department, 'tasksByStage'>[];
  projectMembers: ProjectMember[];
}

type NewTaskData = {
    pic: string;
    departmentName: string;
    stageId: number | string;
    description: string;
    notes: string;
    status: string;
    startDate: string;
    endDate: string;
    dependencies: string;
    progress: number;
    duration: string;
};

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const formatDateForSheet = (dateStr: string): string => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '';
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
};

const FormLabel: React.FC<{ htmlFor: string; children: React.ReactNode; isRequired?: boolean }> = ({ htmlFor, children, isRequired }) => (
    <label htmlFor={htmlFor} className="text-xs font-semibold text-wecare-text-secondary dark:text-wecare-dark-text-secondary uppercase tracking-wider">
        {children} {isRequired && <span className="text-wecare-danger">*</span>}
    </label>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`mt-1 w-full bg-wecare-surface dark:bg-wecare-dark-bg border border-wecare-border dark:border-wecare-dark-border rounded-lg px-3 py-2 text-wecare-text-primary dark:text-wecare-dark-text-primary focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent focus:border-transparent ${props.className}`} />
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} rows={props.rows || 3} className={`mt-1 w-full bg-wecare-surface dark:bg-wecare-dark-bg border border-wecare-border dark:border-wecare-dark-border rounded-lg px-3 py-2 text-wecare-text-primary dark:text-wecare-dark-text-primary focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent focus:border-transparent resize-y ${props.className}`} />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`mt-1 w-full bg-wecare-surface dark:bg-wecare-dark-bg border border-wecare-border dark:border-wecare-dark-border rounded-lg px-3 py-2 text-wecare-text-primary dark:text-wecare-dark-text-primary focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent focus:border-transparent ${props.className}`} />
);

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSave, stages, departmentsConfig, projectMembers }) => {
    
    const getInitialState = (): NewTaskData => ({
        pic: '',
        departmentName: '',
        stageId: '',
        description: '', // This is PIC
        notes: '',       // This is Description
        status: 'Not Started',
        startDate: '',
        endDate: '',
        dependencies: '',
        progress: 0,
        duration: '',
    });

    const [taskData, setTaskData] = useState<NewTaskData>(getInitialState());
    const [errors, setErrors] = useState<Partial<Record<keyof NewTaskData, string>>>({});

    useEffect(() => {
        if (isOpen) {
            setTaskData(getInitialState());
            setErrors({});
        }
    }, [isOpen]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof NewTaskData, string>> = {};
        if (!taskData.pic.trim()) newErrors.pic = "Task name is required.";
        if (!taskData.departmentName) newErrors.departmentName = "Department is required.";
        if (!taskData.stageId) newErrors.stageId = "Stage is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTaskData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof NewTaskData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        // FIX: Type `f` as `any` to prevent it from being inferred as `unknown` and handle potentially null clipboard data.
        const imageFile = Array.from(e.clipboardData?.files ?? []).find((f: any) => f.type.startsWith('image/'));
        if (!imageFile) return;
    
        e.preventDefault();
    
        const textarea = e.currentTarget;
        const { name, value: currentValue } = textarea;
        const cursorPosition = textarea.selectionStart;
        
        const placeholder = '\n![Uploading image...]()\n';
        const textWithPlaceholder = 
            currentValue.substring(0, cursorPosition) + 
            placeholder + 
            currentValue.substring(cursorPosition);
        
        setTaskData(prev => ({...prev, [name]: textWithPlaceholder}));
    
        try {
            const base64 = await fileToBase64(imageFile);
            const markdown = `\n![pasted-image](${base64})\n`;
            const finalValue = textWithPlaceholder.replace(placeholder, markdown);
            setTaskData(prev => ({...prev, [name]: finalValue}));
        } catch (error) {
            console.error("Failed to handle image paste:", error);
            const valueWithError = textWithPlaceholder.replace(placeholder, '\n[Image upload failed]\n');
            setTaskData(prev => ({...prev, [name]: valueWithError}));
        }
    };

    const handleSave = () => {
        if (validate()) {
            onSave({
                ...taskData,
                stageId: Number(taskData.stageId),
                startDate: formatDateForSheet(taskData.startDate),
                endDate: formatDateForSheet(taskData.endDate),
            });
        }
    };
    
    if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-title"
    >
      <div 
        className="relative bg-wecare-surface-elevated dark:bg-wecare-dark-surface-solid rounded-2xl shadow-lg w-full max-w-2xl border-t-4 border-wecare-primary dark:border-wecare-accent flex flex-col border border-wecare-border dark:border-wecare-dark-border"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-6 border-b border-wecare-border dark:border-wecare-dark-border">
            <h2 id="new-task-title" className="text-2xl font-bold text-wecare-text-primary dark:text-wecare-dark-text-primary">Create New Task</h2>
        </header>

        <div className="flex-grow p-6 overflow-y-auto space-y-6">
            <div>
                <FormLabel htmlFor="pic" isRequired>Task Name</FormLabel>
                <FormInput id="pic" name="pic" value={taskData.pic} onChange={handleChange} placeholder="e.g., Finalize Q4 budget report" />
                {errors.pic && <p className="text-wecare-danger text-sm mt-1">{errors.pic}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <FormLabel htmlFor="departmentName" isRequired>Department</FormLabel>
                    <FormSelect id="departmentName" name="departmentName" value={taskData.departmentName} onChange={handleChange}>
                        <option value="">-- Select Department --</option>
                        {departmentsConfig.map(dept => <option key={dept.name} value={dept.name}>{dept.name}</option>)}
                    </FormSelect>
                    {errors.departmentName && <p className="text-wecare-danger text-sm mt-1">{errors.departmentName}</p>}
                </div>
                <div>
                    <FormLabel htmlFor="stageId" isRequired>Stage</FormLabel>
                    <FormSelect id="stageId" name="stageId" value={taskData.stageId} onChange={handleChange}>
                        <option value="">-- Select Stage --</option>
                        {stages.map(stage => <option key={stage.id} value={stage.id}>{stage.title}</option>)}
                    </FormSelect>
                    {errors.stageId && <p className="text-wecare-danger text-sm mt-1">{errors.stageId}</p>}
                </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <FormLabel htmlFor="description">Person in Charge (PIC)</FormLabel>
                    <FormSelect id="description" name="description" value={taskData.description} onChange={handleChange}>
                        <option value="">-- Select PIC --</option>
                        {projectMembers.map(member => <option key={member.name} value={member.name}>{member.name}</option>)}
                    </FormSelect>
                </div>
                <div>
                    <FormLabel htmlFor="status">Status</FormLabel>
                    <div className="mt-1 w-full bg-wecare-surface dark:bg-wecare-dark-bg/50 border border-wecare-border dark:border-wecare-dark-border rounded-lg px-3 py-2 text-wecare-text-secondary dark:text-wecare-dark-text-secondary select-none">
                      Not Started
                    </div>
                </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <FormLabel htmlFor="startDate">Start Date</FormLabel>
                    <div className="relative mt-1">
                        <FormInput id="startDate" name="startDate" type="date" value={taskData.startDate} onChange={handleChange} className="mt-0" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                </div>
                <div>
                    <FormLabel htmlFor="endDate">End Date</FormLabel>
                     <div className="relative mt-1">
                        <FormInput id="endDate" name="endDate" type="date" value={taskData.endDate} onChange={handleChange} className="mt-0" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <FormLabel htmlFor="notes">Description</FormLabel>
                <FormTextarea id="notes" name="notes" value={taskData.notes} onChange={handleChange} onPaste={handleTextareaPaste} placeholder="Add more details about the task..."/>
            </div>
        </div>

        <footer className="flex-shrink-0 p-6 border-t border-wecare-border dark:border-wecare-dark-border flex justify-end gap-3">
            <button onClick={onClose} type="button" className="px-4 py-2 rounded-lg text-sm font-semibold text-wecare-text-secondary dark:text-wecare-dark-text-secondary bg-wecare-surface-elevated hover:bg-wecare-border dark:bg-wecare-dark-surface-solid dark:hover:bg-wecare-dark-surface transition-colors border border-wecare-border dark:border-wecare-dark-border">Cancel</button>
            <button onClick={handleSave} type="button" className="px-4 py-2 rounded-lg text-sm font-semibold text-white dark:text-wecare-accent-text bg-wecare-primary dark:bg-wecare-accent hover:bg-wecare-primary-hover dark:hover:bg-wecare-accent-hover transition-colors">Create Task</button>
        </footer>

        <button onClick={onClose} className="absolute top-4 right-4 text-wecare-text-secondary dark:text-wecare-dark-text-secondary hover:text-wecare-text-primary dark:hover:text-wecare-dark-text-primary transition-colors" aria-label="Close new task form">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default NewTaskModal;