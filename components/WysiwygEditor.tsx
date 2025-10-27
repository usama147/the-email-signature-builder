import React, { useRef, useState, useEffect, useCallback } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, ListUlIcon, ListOlIcon, LinkIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, TextColorIcon } from './icons';

interface WysiwygEditorProps {
    initialContent: string;
    onSave: (newContent: string) => void;
    onClose: () => void;
}

export function WysiwygEditor({ initialContent, onSave, onClose }: WysiwygEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

    // Set content imperatively on mount to avoid React re-renders wiping user input.
    // This is the fix for the "can't type" bug.
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = initialContent;
        }
        // We only want this to run once when the component mounts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateToolbarState = useCallback(() => {
        const formats: Record<string, boolean> = {};
        const commands: (keyof typeof formats)[] = [
            'bold', 'italic', 'underline', 'strikethrough',
            'insertUnorderedList', 'insertOrderedList',
            'justifyLeft', 'justifyCenter', 'justifyRight'
        ];
        commands.forEach(command => {
            formats[command] = document.queryCommandState(command);
        });
        setActiveFormats(formats);
    }, []);

    useEffect(() => {
        const editor = editorRef.current;
        const handleSelectionChange = () => {
            if (editor && document.getSelection() && editor.contains(document.getSelection()?.anchorNode)) {
                updateToolbarState();
            }
        };

        // Add event listeners to update toolbar on selection change or interaction
        document.addEventListener('selectionchange', handleSelectionChange);
        editor?.addEventListener('keyup', handleSelectionChange);
        editor?.addEventListener('mouseup', handleSelectionChange);
        editor?.addEventListener('focus', handleSelectionChange); // Update on focus as well

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            editor?.removeEventListener('keyup', handleSelectionChange);
            editor?.removeEventListener('mouseup', handleSelectionChange);
            editor?.removeEventListener('focus', handleSelectionChange);
        };
    }, [updateToolbarState]);

    const applyFormat = (command: string, value: string | null = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        updateToolbarState();
    };
    
    const applyLink = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            alert('Please select the text you want to link.');
            return;
        }
        const url = prompt('Enter the URL:', 'https://');
        if (url) {
            applyFormat('createLink', url);
        }
    };

    const handleSave = () => {
        if (editorRef.current) {
            onSave(editorRef.current.innerHTML);
        }
    };

    const ToolbarButton: React.FC<{ command: string, children: React.ReactNode, onClick?: () => void }> = ({ command, children, onClick }) => (
        <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={onClick || (() => applyFormat(command))}
            className={`p-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-slate-200 ${activeFormats[command] ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
            title={command.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-bg-animate" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] modal-panel-animate">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">Edit Content</h3>
                    <button onClick={onClose} className="text-2xl font-bold text-slate-500 hover:text-slate-800 transition-colors">&times;</button>
                </div>

                <div className="p-2 border-b flex flex-wrap items-center gap-1 bg-slate-50">
                    <ToolbarButton command="bold"><BoldIcon /></ToolbarButton>
                    <ToolbarButton command="italic"><ItalicIcon /></ToolbarButton>
                    <ToolbarButton command="underline"><UnderlineIcon /></ToolbarButton>
                    <ToolbarButton command="strikethrough"><StrikethroughIcon /></ToolbarButton>

                    <div className="h-6 w-px bg-slate-300 mx-2"></div>

                    <ToolbarButton command="insertUnorderedList"><ListUlIcon /></ToolbarButton>
                    <ToolbarButton command="insertOrderedList"><ListOlIcon /></ToolbarButton>
                    <ToolbarButton command="link" onClick={applyLink}><LinkIcon /></ToolbarButton>
                    
                    <div className="h-6 w-px bg-slate-300 mx-2"></div>
                    
                    <ToolbarButton command="justifyLeft"><AlignLeftIcon /></ToolbarButton>
                    <ToolbarButton command="justifyCenter"><AlignCenterIcon /></ToolbarButton>
                    <ToolbarButton command="justifyRight"><AlignRightIcon /></ToolbarButton>

                    <div className="h-6 w-px bg-slate-300 mx-2"></div>
                    
                    <label title="Text Color" className="p-2 rounded-md hover:bg-slate-200 cursor-pointer relative transition-colors duration-200">
                        <input type="color" className="w-full h-full opacity-0 absolute inset-0 cursor-pointer" onChange={(e) => applyFormat('foreColor', e.target.value)} />
                        <TextColorIcon />
                    </label>
                </div>

                <div
                    ref={editorRef}
                    contentEditable="true"
                    suppressContentEditableWarning={true}
                    className="p-4 flex-grow overflow-y-auto focus:outline-none prose max-w-none min-h-[240px]"
                />

                <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-colors duration-200 ease-in-out hover:bg-slate-300">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md transition-colors duration-200 ease-in-out hover:bg-blue-700">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}