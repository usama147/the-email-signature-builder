import React, { useState, useEffect, useCallback } from 'react';
import { Theme } from '../App';
import { useAnimateModal } from '../hooks/useAnimateModal';

interface SettingsModalProps {
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
    onClose: () => void;
}

const themes: { id: Theme, name: string, previewClass: string }[] = [
    { id: 'default', name: 'Standard', previewClass: 'bg-slate-100 border-slate-300' },
    { id: 'neomorphism', name: 'Soft UI', previewClass: 'bg-[#e0e5ec] border-transparent' },
    { id: 'glassmorphism', name: 'Glassmorphism', previewClass: 'bg-gradient-to-br from-indigo-500 to-blue-400 border-white/20' },
    { id: 'liquid-glass', name: 'Liquid Glass (v26)', previewClass: 'bg-gradient-to-br from-blue-900 via-indigo-950 to-purple-900 border-white/10' }
];

export function SettingsModal({ currentTheme, onThemeChange, onClose }: SettingsModalProps) {
    const { isClosing, modalAnimationClass, backdropAnimationClass, handleClose } = useAnimateModal(onClose, currentTheme);

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


    return (
        <div className={`fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4 modal-backdrop-blur ${backdropAnimationClass}`}>
            <div className={`bg-[--surface] rounded-[--radius] shadow-[--shadow-2] w-full max-w-lg border border-[--border-color] ${modalAnimationClass}`} data-glass>
                <div className="flex justify-between items-center p-6 border-b border-[--border-color]">
                    <h3 className="text-xl font-bold">Appearance</h3>
                    <button onClick={handleClose} className="text-2xl font-bold text-[--text-color-light] hover:text-[--text-color] transition-colors">{'\u00D7'}</button>
                </div>
                <div className="p-6">
                    <p className="text-[--text-color-secondary] mb-6 text-sm">Choose a visual theme that fits your workflow. Preference is synced with your local workspace.</p>
                    <div className="grid grid-cols-2 gap-6">
                        {themes.map(theme => (
                            <div 
                                key={theme.id} 
                                onClick={() => onThemeChange(theme.id)}
                                className={`cursor-pointer rounded-[--radius] p-3 border-2 transition-all duration-300 ${currentTheme === theme.id ? 'border-[--primary] scale-[1.02] shadow-lg' : 'border-transparent hover:border-[--border-color] hover:bg-[--surface-secondary]'}`}
                            >
                                <div className={`h-24 w-full rounded-lg flex items-center justify-center overflow-hidden relative shadow-inner ${theme.previewClass}`}>
                                    {theme.id === 'liquid-glass' && (
                                        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_50%_50%,rgba(0,122,255,0.4),transparent)] animate-pulse"></div>
                                    )}
                                    <div className={`w-14 h-8 rounded-md flex items-center justify-center ${theme.id === 'default' ? 'bg-white shadow-sm' : theme.id === 'neomorphism' ? 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8c1d1,-3px_-3px_6px_#ffffff]' : 'bg-white/20 backdrop-blur-md border border-white/30'}`}>
                                        <div className="w-6 h-1 rounded-full bg-[--primary] opacity-60"></div>
                                    </div>
                                </div>
                                <p className="text-center font-semibold text-sm mt-3">{theme.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="p-6 border-t border-[--border-color] bg-[--surface-secondary] flex justify-end gap-3 rounded-b-[--radius]">
                    <button onClick={handleClose} className="btn btn-primary px-8">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}