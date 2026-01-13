import React, { useState, useEffect, useRef } from 'react';
import { SignatureTemplate } from '../types';
import { TrashIcon, DownloadIcon, UploadIcon } from './icons';
import { useAnimateModal } from '../hooks/useAnimateModal';
import { Theme } from '../App';

interface TemplateLibraryProps {
    presets: SignatureTemplate[];
    userTemplates: SignatureTemplate[];
    onLoad: (template: SignatureTemplate) => void;
    onDelete: (templateId: string) => void;
    onImport: (templates: SignatureTemplate[]) => void;
    onClose: () => void;
    theme: Theme;
}

const TemplateCard: React.FC<{
    template: SignatureTemplate,
    onLoad: () => void,
    onDelete?: () => void,
}> = ({ template, onLoad, onDelete }) => {
    // Create a dummy preview for the template card
    const previewHtml = `<div style="font-family: Arial, sans-serif; font-size: 10px; color: var(--text-color); line-height: 1.4; text-align: left; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--surface-secondary); height: 80px; overflow: hidden;">
        <b style="font-size: 12px;">${template.name}</b>
        <p style="margin: 2px 0;">Max Width: ${template.maxWidth}px</p>
        <p style="margin: 2px 0;">Contains ${template.rows.length} rows.</p>
    </div>`;

    const handleDownload = () => {
        const jsonString = JSON.stringify(template, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = (template.name || 'template').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.json';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="group relative bg-[--surface] rounded-lg shadow-[--shadow-1] border border-[--border-color] transition-all duration-300 ease-in-out hover:shadow-[--shadow-2] hover:-translate-y-1 liquid-hover" data-glass>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            <div className="p-3">
                 <h4 className="font-semibold text-[--text-color] truncate">{template.name}</h4>
                 <button 
                    onClick={onLoad} 
                    className="btn btn-primary btn-sm w-full mt-2"
                >
                    Load
                </button>
            </div>
            {onDelete && (
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleDownload}
                        title="Download Template"
                        className="p-1.5 bg-[--primary]/20 text-[--primary] rounded-full transition-all duration-200 ease-in-out hover:bg-[--primary] hover:text-[--primary-text] transform hover:scale-110"
                    >
                        <DownloadIcon />
                    </button>
                    <button
                        onClick={onDelete}
                        title="Delete Template"
                        className="p-1.5 bg-[--danger-surface] text-[--danger] rounded-full transition-all duration-200 ease-in-out hover:bg-[--danger] hover:text-white transform hover:scale-110"
                    >
                        <TrashIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

export function TemplateLibrary({ presets, userTemplates, onLoad, onDelete, onImport, onClose, theme }: TemplateLibraryProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const { isClosing, modalAnimationClass, backdropAnimationClass, handleClose } = useAnimateModal(onClose, theme);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClose]);

    const handleExportAll = async () => {
        if (userTemplates.length === 0) return;

        setIsDownloading(true);
        try {
            const jsonString = JSON.stringify(userTemplates, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'email-signature-templates.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to generate JSON file of templates", error);
            alert("There was an error creating the JSON file. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);
                
                // Allow importing a single template object or an array of them
                const templatesToImport = Array.isArray(parsed) ? parsed : [parsed];
                onImport(templatesToImport);

            } catch (error) {
                console.error('Error parsing template file:', error);
                alert('Could not read the template file. Please make sure it is a valid JSON file.');
            } finally {
                 // Reset file input so user can select the same file again
                if (event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4 modal-backdrop-blur ${backdropAnimationClass}`}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            <div className={`bg-[--background] rounded-lg shadow-[--shadow-2] w-full max-w-4xl max-h-[90vh] flex flex-col border border-[--border-color] transition-all duration-300 ${modalAnimationClass}`} data-glass>
                <div className="flex justify-between items-center p-4 border-b border-[--border-color] bg-[--surface] rounded-t-lg" data-glass>
                    <h2 className="text-xl font-bold">Template Library</h2>
                    <button onClick={handleClose} className="text-2xl font-bold text-[--text-color-light] hover:text-[--text-color] transition-colors">{'\u00D7'}</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <section>
                        <h3 className="text-lg font-semibold text-[--text-color] mb-4">Pre-designed Templates</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {presets.map(template => (
                                <TemplateCard key={template.id} template={template} onLoad={() => onLoad(template)} />
                            ))}
                        </div>
                    </section>

                    <section className="mt-8 pt-6 border-t border-[--border-color]">
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                            <h3 className="text-lg font-semibold text-[--text-color]">Your Saved Templates</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleImportClick}
                                    className="btn btn-primary btn-sm flex items-center gap-2"
                                >
                                    <UploadIcon />
                                    Import
                                </button>
                                {userTemplates.length > 0 && (
                                    <button
                                        onClick={handleExportAll}
                                        disabled={isDownloading}
                                        className="btn btn-success btn-sm flex items-center gap-2"
                                    >
                                        <DownloadIcon />
                                        {isDownloading ? 'Exporting...' : 'Export All'}
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-[--text-color-light] mb-4 -mt-2">
                           Your templates are saved in your browser's local storage. They will not be available on other devices or browsers. Use the import/export buttons to back them up or move them.
                        </p>
                         {userTemplates.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userTemplates.map(template => (
                                    <TemplateCard 
                                        key={template.id} 
                                        template={template} 
                                        onLoad={() => onLoad(template)}
                                        onDelete={() => onDelete(template.id)}
                                    />
                                ))}
                            </div>
                         ) : (
                            <div className="text-center py-8 bg-[--surface] rounded-md border border-[--border-color]">
                                <p className="text-[--text-color-light]">You haven't saved any templates yet.</p>
                                <p className="text-[--text-color-light] opacity-70 text-sm">Click "Save as Template" in the builder to add one.</p>
                            </div>
                         )}
                    </section>
                </div>
                 <div className="p-4 border-t border-[--border-color] bg-[--surface] rounded-b-lg text-right" data-glass>
                    <button onClick={handleClose} className="btn">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}