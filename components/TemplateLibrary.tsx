import React, { useState } from 'react';
import JSZip from 'jszip';
import { SignatureTemplate } from '../types';
import { TrashIcon, DownloadIcon } from './icons';

interface TemplateLibraryProps {
    presets: SignatureTemplate[];
    userTemplates: SignatureTemplate[];
    onLoad: (template: SignatureTemplate) => void;
    onDelete: (templateId: string) => void;
    onClose: () => void;
}

const TemplateCard: React.FC<{
    template: SignatureTemplate,
    onLoad: () => void,
    onDelete?: () => void,
}> = ({ template, onLoad, onDelete }) => {
    // Create a dummy preview for the template card
    const previewHtml = `<div style="font-family: Arial, sans-serif; font-size: 10px; color: #333; line-height: 1.4; text-align: left; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px; background: #f8fafc; height: 80px; overflow: hidden;">
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
        <div className="group relative bg-white rounded-lg shadow border transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            <div className="p-3">
                 <h4 className="font-semibold text-slate-700 truncate">{template.name}</h4>
                 <button 
                    onClick={onLoad} 
                    className="w-full mt-2 text-center py-1.5 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 transition-colors duration-200 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Load
                </button>
            </div>
            {onDelete && (
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleDownload}
                        title="Download Template"
                        className="p-1.5 bg-blue-100 text-blue-600 rounded-full transition-all duration-200 ease-in-out hover:bg-blue-500 hover:text-white transform hover:scale-110"
                    >
                        <DownloadIcon />
                    </button>
                    <button
                        onClick={onDelete}
                        title="Delete Template"
                        className="p-1.5 bg-red-100 text-red-600 rounded-full transition-all duration-200 ease-in-out hover:bg-red-500 hover:text-white transform hover:scale-110"
                    >
                        <TrashIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

export function TemplateLibrary({ presets, userTemplates, onLoad, onDelete, onClose }: TemplateLibraryProps) {
    const [isZipping, setIsZipping] = useState(false);

    const handleDownloadAll = async () => {
        if (userTemplates.length === 0) return;

        setIsZipping(true);
        const zip = new JSZip();

        try {
            const templatesJson = JSON.stringify(userTemplates, null, 2);
            zip.file('email-signature-templates.json', templatesJson);

            const zipBlob = await zip.generateAsync({ type: 'blob' });

            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'email-signature-templates.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to generate zip file of templates", error);
            alert("There was an error creating the zip file. Please try again.");
        } finally {
            setIsZipping(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-bg-animate">
            <div className="bg-slate-100 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-panel-animate">
                <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold">Template Library</h2>
                    <button onClick={onClose} className="text-2xl font-bold text-slate-500 hover:text-slate-800 transition-colors">{'\u00D7'}</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Pre-designed Templates</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {presets.map(template => (
                                <TemplateCard key={template.id} template={template} onLoad={() => onLoad(template)} />
                            ))}
                        </div>
                    </section>

                    <section className="mt-8 pt-6 border-t">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Your Saved Templates</h3>
                            {userTemplates.length > 0 && (
                                <button
                                    onClick={handleDownloadAll}
                                    disabled={isZipping}
                                    className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md transition-colors duration-200 ease-in-out hover:bg-green-700 disabled:bg-slate-400"
                                >
                                    {isZipping ? 'Downloading...' : 'Download All (.zip)'}
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mb-4 -mt-2">
                           Your templates are saved in your browser's local storage. They will not be available on other devices or browsers. Use the download button to back them up.
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
                            <div className="text-center py-8 bg-white rounded-md border">
                                <p className="text-slate-500">You haven't saved any templates yet.</p>
                                <p className="text-slate-400 text-sm">Click "Save as Template" in the builder to add one.</p>
                            </div>
                         )}
                    </section>
                </div>
                 <div className="p-4 border-t bg-white rounded-b-lg text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-colors duration-200 ease-in-out hover:bg-slate-300">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}