import React, { useState } from 'react';

interface SaveTemplateModalProps {
    onSave: (name: string) => void;
    onClose: () => void;
}

export function SaveTemplateModal({ onSave, onClose }: SaveTemplateModalProps) {
    const [name, setName] = useState('');

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        } else {
            alert('Please enter a name for your template.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-bg-animate">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md modal-panel-animate">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">Save Template</h3>
                    <button onClick={onClose} className="text-2xl font-bold text-slate-500 hover:text-slate-800 transition-colors">{'\u00D7'}</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="templateName" className="block text-sm font-medium text-slate-700 mb-1">
                            Template Name
                        </label>
                        <input
                            type="text"
                            id="templateName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Sales Team Q4"
                        />
                    </div>
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-colors duration-200 ease-in-out hover:bg-slate-300">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md transition-colors duration-200 ease-in-out hover:bg-blue-700">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}