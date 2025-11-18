import React, { useState, useEffect, useRef } from 'react';
import type { Task, Discussion, ProjectMember } from '../types';
import { COLOR_MAP } from '../constants';

declare global {
    const marked: any;
    const DOMPurify: {
        sanitize(dirty: string): string;
    };
    const EasyMDE: any;
}

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  departmentColor: string;
  onSave: (updatedTask: Task) => void;
  onAddDiscussion: (taskId: string, content: string, type: 'discussion' | 'issue') => Promise<void>;
  onUpdateDiscussion: (discussion: Discussion) => Promise<void>;
  onDeleteDiscussion: (discussion: Discussion) => Promise<void>;
  currentUser: { name: string; picture: string } | null;
  projectMembers: ProjectMember[];
}

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

// Helpers to convert date formats between the sheet (MM/DD/YYYY) and the date input (YYYY-MM-DD)
const formatDateForInput = (dateStr: string): string => {
    if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return '';
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const formatDateForSheet = (dateStr: string): string => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
};


const FormLabel: React.FC<{ htmlFor: string; children: React.ReactNode; }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="text-xs font-semibold text-wecare-text-secondary dark:text-wecare-dark-text-secondary uppercase tracking-wider">{children}</label>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`mt-1 w-full bg-wecare-surface dark:bg-wecare-dark-bg border border-wecare-border dark:border-wecare-dark-border rounded-lg px-3 py-2 text-wecare-text-primary dark:text-wecare-dark-text-primary focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent focus:border-transparent ${props.className}`} />
);

const FormTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
    <textarea {...props} ref={ref} rows={props.rows || 3} className={`w-full bg-wecare-surface dark:bg-wecare-dark-bg border border-wecare-border dark:border-wecare-dark-border rounded-lg px-3 py-2 text-wecare-text-primary dark:text-wecare-dark-text-primary focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent focus:border-transparent resize-y ${props.className}`} />
));

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`mt-1 w-full bg-wecare-surface dark:bg-wecare-dark-bg border border-wecare-border dark:border-wecare-dark-border rounded-lg px-3 py-2 text-wecare-text-primary dark:text-wecare-dark-text-primary focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent focus:border-transparent ${props.className}`} />
);

const DiscussionItem: React.FC<{
    discussion: Discussion;
    onUpdate: (discussion: Discussion) => void;
    onDelete: (discussion: Discussion) => void;
    currentUser: { name: string; picture: string } | null;
}> = ({ discussion, onUpdate, onDelete, currentUser }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(discussion.content);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuRef]);

    const handleSaveEdit = () => {
        if (editedContent.trim()) {
            onUpdate({ ...discussion, content: editedContent.trim() });
            setIsEditing(false);
            setMenuOpen(false);
        }
    };

    const handleToggleType = () => {
        const newType = discussion.type === 'issue' ? 'discussion' : 'issue';
        onUpdate({ ...discussion, type: newType });
        setMenuOpen(false);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            onDelete(discussion);
        }
        setMenuOpen(false);
    };

    const createMarkup = (content: string) => {
        if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
            return { __html: content.replace(/\n/g, '<br />') };
        }
        const rawMarkup = marked.parse(content, { gfm: true, breaks: true });
        const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);
        return { __html: sanitizedMarkup };
    };

    const isAuthor = currentUser?.name === discussion.author;
    const isIssue = discussion.type === 'issue';

    return (
        <div className={`group flex items-start gap-3 p-3 rounded-lg transition-colors ${isIssue ? 'bg-wecare-danger/10' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-wecare-border dark:bg-wecare-dark-border flex-shrink-0 flex items-center justify-center font-bold text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
                {discussion.author.charAt(0)}
            </div>
            <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-wecare-text-primary dark:text-wecare-dark-text-primary">{discussion.author}</p>
                    <p className="text-xs text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
                        {new Date(discussion.timestamp).toLocaleString()}
                    </p>
                    {isIssue && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-wecare-danger/20 text-wecare-danger">Issue</span>}
                </div>
                {isEditing ? (
                    <div className="mt-2">
                        <FormTextarea value={editedContent} onChange={e => setEditedContent(e.target.value)} rows={4} className="mt-1" />
                        <div className="flex gap-2 mt-2 justify-end">
                            <button onClick={() => { setIsEditing(false); setMenuOpen(false); }} className="px-3 py-1 rounded-md text-sm font-semibold bg-wecare-surface hover:bg-wecare-border dark:bg-wecare-dark-surface dark:hover:bg-wecare-dark-border transition-colors">Cancel</button>
                            <button onClick={handleSaveEdit} className="px-3 py-1 rounded-md text-sm font-semibold text-white dark:text-wecare-accent-text bg-wecare-primary dark:bg-wecare-accent hover:bg-wecare-primary-hover dark:hover:bg-wecare-accent-hover transition-colors">Save</button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="prose text-sm max-w-none mt-1 text-wecare-text-primary dark:text-wecare-dark-text-primary"
                        dangerouslySetInnerHTML={createMarkup(discussion.content)}
                    />
                )}
            </div>
            <div className="relative flex-shrink-0" ref={menuRef}>
                <button 
                    onClick={() => setMenuOpen(!menuOpen)} 
                    className={`p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-wecare-text-secondary dark:text-wecare-dark-text-secondary transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                    aria-label="Discussion options"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>
                {menuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-wecare-surface-elevated dark:bg-wecare-dark-surface-solid rounded-lg shadow-lg border border-wecare-border dark:border-wecare-dark-border z-10 py-1">
                        {isAuthor && <button onClick={() => { setIsEditing(true); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm text-wecare-primary dark:text-wecare-accent hover:bg-wecare-primary/10 dark:hover:bg-wecare-accent/10 transition-colors">Edit</button>}
                        <button onClick={handleToggleType} className="w-full text-left px-3 py-1.5 text-sm text-wecare-text-secondary dark:text-wecare-dark-text-secondary hover:text-wecare-text-primary dark:hover:text-wecare-dark-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors">{isIssue ? 'Mark as Discussion' : 'Mark as Issue'}</button>
                        {isAuthor && <button onClick={handleDelete} className="w-full text-left px-3 py-1.5 text-sm text-wecare-danger hover:bg-wecare-danger/10 transition-colors">Delete</button>}
                    </div>
                )}
            </div>
        </div>
    );
};


const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, departmentColor, onSave, onAddDiscussion, onUpdateDiscussion, onDeleteDiscussion, currentUser, projectMembers }) => {
    const colorClasses = COLOR_MAP[departmentColor] || COLOR_MAP['gray'];
    
    const [editableTask, setEditableTask] = useState<Task>({ ...task });
    const [validationError, setValidationError] = useState<string | null>(null);
    const [newDiscussion, setNewDiscussion] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    
    const discussionTextareaRef = useRef<HTMLTextAreaElement>(null);
    const easyMdeInstance = useRef<any>(null);

    useEffect(() => {
        setEditableTask({ ...task });
    }, [task]);
    
    useEffect(() => {
        if (discussionTextareaRef.current && !easyMdeInstance.current && typeof EasyMDE !== 'undefined') {
            const mde = new EasyMDE({
                element: discussionTextareaRef.current,
                minHeight: '120px',
                placeholder: 'Add an issue or start a discussion... (Markdown supported)',
                spellChecker: false,
                status: false,
                toolbar: [
                    'bold', 'italic', 'strikethrough', '|', 
                    'heading-2', 'heading-3', '|', 
                    'quote', 'unordered-list', 'ordered-list', '|',
                    'link', 'code', '|', 
                    'preview'
                ],
            });
            mde.codemirror.on('change', () => {
                setNewDiscussion(mde.value());
            });
            mde.codemirror.on('paste', async (cm: any, event: ClipboardEvent) => {
                // FIX: Type `f` as `any` to prevent it from being inferred as `unknown` and handle potentially null clipboard data.
                const imageFile = Array.from(event.clipboardData?.files ?? []).find((f: any) => f.type.startsWith('image/'));
                if (!imageFile) return;

                event.preventDefault();
                
                const doc = cm.getDoc();
                const cursor = doc.getCursor();
                const placeholder = '\n![Uploading image...]()\n';
                
                doc.replaceRange(placeholder, cursor);
                
                try {
                    const base64 = await fileToBase64(imageFile);
                    const markdown = `\n![pasted-image](${base64})\n`;
                    
                    const currentContent = doc.getValue();
                    const newContent = currentContent.replace(placeholder, markdown);
                    const newCursorIndex = currentContent.indexOf(placeholder) + markdown.length;
                    
                    doc.setValue(newContent);
                    doc.setCursor(doc.posFromIndex(newCursorIndex));
                    
                } catch (error) {
                    console.error("Failed to handle image paste in editor:", error);
                    const currentContent = doc.getValue();
                    const newContent = currentContent.replace(placeholder, '\n[Image upload failed]\n');
                    doc.setValue(newContent);
                }
            });
            easyMdeInstance.current = mde;
        }

        return () => {
            if (easyMdeInstance.current) {
                easyMdeInstance.current.toTextArea();
                easyMdeInstance.current = null;
            }
        };
    }, []); // Run only once on mount

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setValidationError(null);
        const { name, value } = e.target;
        // FIX: Cast e.target to any to access the 'type' property, avoiding 'unknown' type error.
        const type = (e.target as any).type;

        if (name === 'status' && value === 'Completed') {
            setEditableTask(prev => ({ ...prev, status: value, progress: 100 }));
            return;
        }

        if (type === 'date') {
            setEditableTask(prev => ({ ...prev, [name]: formatDateForSheet(value) }));
        } else {
            setEditableTask(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleProgressChange = (progress: number) => {
        if (!isNaN(progress) && progress >= 0 && progress <= 100) {
            setEditableTask(prev => ({ ...prev, progress }));
        }
    };

    const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const imageFile = Array.from(e.clipboardData.files).find(f => f.type.startsWith('image/'));
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
        
        setEditableTask(prev => ({...prev, [name]: textWithPlaceholder}));
    
        try {
            const base64 = await fileToBase64(imageFile);
            const markdown = `\n![pasted-image](${base64})\n`;
            const finalValue = textWithPlaceholder.replace(placeholder, markdown);
            setEditableTask(prev => ({...prev, [name]: finalValue}));
        } catch (error) {
            console.error("Failed to handle image paste:", error);
            const valueWithError = textWithPlaceholder.replace(placeholder, '\n[Image upload failed]\n');
            setEditableTask(prev => ({...prev, [name]: valueWithError}));
        }
    };

    const handleSave = () => {
        if (editableTask.status === 'Completed' && !editableTask.dependencies.trim()) {
            setValidationError('Deliverables are required when task status is "Completed".');
            return;
        }
        setValidationError(null);
        onSave(editableTask);
    };

    const handlePostDiscussion = async (type: 'discussion' | 'issue') => {
        if (!newDiscussion.trim()) return;
        setIsPosting(true);
        await onAddDiscussion(task.id, newDiscussion, type);
        setNewDiscussion('');
        if (easyMdeInstance.current) {
            easyMdeInstance.current.value('');
        }
        setIsPosting(false);
    };

  return (
    <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-title"
    >
      <div 
        className={`relative bg-wecare-surface-elevated dark:bg-wecare-dark-surface-solid rounded-2xl shadow-lg w-[80vw] max-w-[1400px] h-[90vh] border-t-4 ${colorClasses} flex flex-col border border-wecare-border dark:border-wecare-dark-border`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-grow p-6 md:p-8 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 h-full">
                {/* Left Column: Task Details */}
                <div className="flex-[2] flex flex-col">
                    <div className="flex-grow overflow-y-auto pr-4">
                        <div className="space-y-6">
                            <header>
                                <p className={`text-sm font-bold ${colorClasses} mb-1`}>{task.id} - {task.departmentName}</p>
                                <div>
                                    <FormLabel htmlFor="pic">Task Name</FormLabel>
                                    <input 
                                        id="pic"
                                        name="pic"
                                        value={editableTask.pic}
                                        onChange={handleChange}
                                        className="text-2xl font-bold p-0 border-0 bg-transparent focus:ring-0 w-full text-wecare-text-primary dark:text-wecare-dark-text-primary"
                                    />
                                </div>
                            </header>
                            <div>
                                <FormLabel htmlFor="progress">Progress</FormLabel>
                                <div className="flex items-center gap-4 mt-2">
                                    <input
                                        id="progress"
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={editableTask.progress}
                                        onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
                                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-wecare-border dark:bg-wecare-dark-bg accent-wecare-primary dark:accent-wecare-accent`}
                                    />
                                    <div className="flex items-center gap-2">
                                    <FormInput
                                            type="number"
                                            min="0"
                                            max="100"
                                            name="progress"
                                            value={editableTask.progress}
                                            onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
                                            className="w-20 text-center font-mono font-semibold"
                                        />
                                        <span className="font-mono font-semibold text-wecare-text-secondary dark:text-wecare-dark-text-secondary">%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-wecare-border dark:border-wecare-dark-border pt-6">
                                <div>
                                    <FormLabel htmlFor="description">Person in Charge (PIC)</FormLabel>
                                    <FormSelect id="description" name="description" value={editableTask.description || ''} onChange={handleChange}>
                                        <option value="">-- Select a Person --</option>
                                        {projectMembers.map(member => (
                                            <option key={member.name} value={member.name}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </FormSelect>
                                </div>
                                <div>
                                    <FormLabel htmlFor="status">Status</FormLabel>
                                    <FormSelect id="status" name="status" value={editableTask.status} onChange={handleChange}>
                                        <option>Not Started</option>
                                        <option>Started</option>
                                        <option>In Progress</option>
                                        <option>Blocked</option>
                                        <option>Completed</option>
                                    </FormSelect>
                                </div>
                                <div>
                                    <FormLabel htmlFor="startDate">Start Date</FormLabel>
                                    <div className="relative mt-1">
                                        <input id="startDate" name="startDate" type="date" value={formatDateForInput(editableTask.startDate)} onChange={handleChange} className="w-full bg-wecare-surface dark:bg-wecare-dark-bg border border-wecare-border dark:border-wecare-dark-border rounded-lg px-3 py-2 text-wecare-text-primary dark:text-wecare-dark-text-primary focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent focus:border-transparent"/>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <FormLabel htmlFor="endDate">End Date</FormLabel>
                                    <div className="relative mt-1">
                                        <input id="endDate" name="endDate" type="date" value={formatDateForInput(editableTask.endDate)} onChange={handleChange} className="w-full bg-wecare-surface dark:bg-wecare-dark-bg border border-wecare-border dark:border-wecare-dark-border rounded-lg px-3 py-2 text-wecare-text-primary dark:text-wecare-dark-text-primary focus:ring-2 focus:ring-wecare-primary dark:focus:ring-wecare-accent focus:border-transparent"/>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-wecare-text-secondary dark:text-wecare-dark-text-secondary">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 border-t border-wecare-border dark:border-wecare-dark-border pt-6">
                                <div>
                                    <FormLabel htmlFor="notes">Description</FormLabel>
                                    <FormTextarea className="mt-1" id="notes" name="notes" value={editableTask.notes} onChange={handleChange} onPaste={handleTextareaPaste} />
                                </div>
                                <div>
                                    <FormLabel htmlFor="dependencies">Deliverables</FormLabel>
                                    <FormTextarea className="mt-1" id="dependencies" name="dependencies" value={editableTask.dependencies} onChange={handleChange} onPaste={handleTextareaPaste} />
                                    {validationError && <p className="text-wecare-danger text-sm mt-1">{validationError}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer className="flex-shrink-0 pt-4 border-t border-wecare-border dark:border-wecare-dark-border flex justify-end gap-3">
                        <button onClick={onClose} type="button" className="px-4 py-2 rounded-lg text-sm font-semibold text-wecare-text-secondary dark:text-wecare-dark-text-secondary bg-wecare-surface-elevated hover:bg-wecare-border dark:bg-wecare-dark-surface-solid dark:hover:bg-wecare-dark-surface transition-colors border border-wecare-border dark:border-wecare-dark-border">Cancel</button>
                        <button onClick={handleSave} type="button" className="px-4 py-2 rounded-lg text-sm font-semibold text-white dark:text-wecare-accent-text bg-wecare-primary dark:bg-wecare-accent hover:bg-wecare-primary-hover dark:hover:bg-wecare-accent-hover transition-colors">Save Changes</button>
                    </footer>
                </div>

                {/* Right Column: Discussions */}
                <div className="flex-[3] flex flex-col min-h-0 border-l border-wecare-border dark:border-wecare-dark-border pl-8 -ml-4">
                    <div className="flex-shrink-0">
                        <h3 className="text-xs font-semibold text-wecare-text-secondary dark:text-wecare-dark-text-secondary uppercase tracking-wider">Discussions & Issues</h3>
                    </div>
                    <div className="flex-grow my-4 space-y-2 overflow-y-auto pr-2 -mr-2">
                         {editableTask.discussions && editableTask.discussions.length > 0 ? (
                            editableTask.discussions.map((d) => (
                               <DiscussionItem 
                                    key={`${d.rowIndex}-${d.content.length}`} 
                                    discussion={d}
                                    onUpdate={onUpdateDiscussion}
                                    onDelete={onDeleteDiscussion}
                                    currentUser={currentUser}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-center py-8 text-wecare-text-secondary dark:text-wecare-dark-text-secondary italic">No discussions yet.</p>
                        )}
                    </div>
                    <div className="flex-shrink-0 border-t border-wecare-border dark:border-wecare-dark-border pt-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-wecare-border dark:bg-wecare-dark-border flex-shrink-0 flex items-center justify-center font-bold text-wecare-text-primary dark:text-wecare-dark-text-primary">
                                {currentUser?.name.charAt(0)}
                            </div>
                            <div className="flex-grow">
                                <FormTextarea
                                    ref={discussionTextareaRef}
                                    id="new-discussion"
                                    value={newDiscussion}
                                    onChange={(e) => setNewDiscussion(e.target.value)}
                                    disabled={isPosting}
                                />
                                <div className="flex justify-end items-center gap-3 mt-2">
                                    <button onClick={() => handlePostDiscussion('issue')} disabled={isPosting || !newDiscussion.trim()} className="px-4 py-2 rounded-lg text-sm font-semibold text-wecare-warning hover:bg-wecare-warning/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-wecare-warning">
                                        {isPosting ? 'Logging...' : 'Log Issue'}
                                    </button>
                                    <button onClick={() => handlePostDiscussion('discussion')} disabled={isPosting || !newDiscussion.trim()} className="px-4 py-2 rounded-lg text-sm font-semibold text-white dark:text-wecare-accent-text bg-wecare-primary dark:bg-wecare-accent hover:bg-wecare-primary-hover dark:hover:bg-wecare-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isPosting ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-wecare-text-secondary dark:text-wecare-dark-text-secondary hover:text-wecare-text-primary dark:hover:text-wecare-dark-text-primary transition-colors" aria-label="Close task details">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default TaskDetailModal;