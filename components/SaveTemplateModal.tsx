import React, { useState, useEffect } from 'react';
import { useAnimateModal } from '../hooks/useAnimateModal';
import { Theme } from '../App';

interface SaveTemplateModalProps {
    onSave: (name: string) => void;
    onClose: () => void;
    theme: Theme;
}

export function SaveTemplateModal({ onSave, onClose, theme }: SaveTemplateModalProps) {
    const [name, setName] = useState('');
    const { isClosing, modalAnimationClass, backdropAnimationClass, handleClose } = useAnimateModal(onClose, theme);

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

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        } else {
            alert('Please enter a name for your template.');
        }
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4 modal-backdrop-blur ${backdropAnimationClass}`}>
            <div className={`bg-[--surface] rounded-lg shadow-[--shadow-2] w-full max-w-md border border-[--border-color] ${modalAnimationClass}`} data-glass>
                <div className="flex justify-between items-center p-4 border-b border-[--border-color]">
                    <h3 className="text-lg font-semibold">Save Template</h3>
                    <button onClick={handleClose} className="text-2xl font-bold text-[--text-color-light] hover:text-[--text-color] transition-colors">{'\u00D7'}</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="templateName" className="block text-sm font-medium text-[--text-color-secondary] mb-1">
                            Template Name
                        </label>
                        <input
                            type="text"
                            id="templateName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field block w-full px-3 py-2"
                            placeholder="e.g., Sales Team Q4"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-[--border-color] bg-[--surface-secondary] flex justify-end gap-3">
                    <button onClick={handleClose} className="btn">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="btn btn-primary">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}