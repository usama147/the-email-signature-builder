import React, { useState, useEffect, useMemo } from 'react';
import { SignatureBuilder } from './SignatureBuilder';
import { BuilderState } from '../BulkCreatorPage';
import { parseHtmlToState } from '../utils/htmlParser';
import { CustomFont, SignatureTemplate } from '../types';
import { generateSignatureHtml } from '../utils/htmlGenerator';
import { SpinnerIcon } from './icons';
import { Theme } from '../App';

interface SingleSignatureEditorProps {
    initialHtml: string;
    onSave: (newHtml: string) => void;
    onCancel: () => void;
    savedColors: string[];
    setSavedColors: (updater: React.SetStateAction<string[]>) => void;
    customFonts: CustomFont[];
    setCustomFonts: (updater: React.SetStateAction<CustomFont[]>) => void;
    theme: Theme;
}

export function SingleSignatureEditor({
    initialHtml,
    onSave,
    onCancel,
    savedColors,
    setSavedColors,
    customFonts,
    setCustomFonts: setParentCustomFonts,
    theme,
}: SingleSignatureEditorProps) {
    const [builderState, setBuilderState] = useState<BuilderState | null>(null);
    const [localCustomFonts, setLocalCustomFonts] = useState<CustomFont[]>(customFonts);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const { builderState: parsedState, customFonts: parsedFonts } = parseHtmlToState(initialHtml);
            setBuilderState(parsedState);
            
            if (parsedFonts.length > 0) {
                setLocalCustomFonts(current => {
                    const newFonts = [...current];
                    parsedFonts.forEach(pf => {
                        if (!newFonts.some(f => f.rawCss && f.rawCss === pf.rawCss)) {
                            newFonts.push(pf);
                        }
                    });
                    return newFonts;
                });
            }
        } catch (e: any) {
            console.error("Failed to parse signature for editing:", e);
            setError(e.message || "Could not load this signature into the editor. It may have an incompatible structure.");
        }
    }, [initialHtml]);

    const handleSave = () => {
        if (builderState) {
            setParentCustomFonts(localCustomFonts);
            const newHtml = generateSignatureHtml(
                builderState.rows,
                builderState.maxWidth,
                builderState.tableProperties,
                localCustomFonts
            );
            onSave(newHtml);
        }
    };
    
    // Create a type-safe wrapper for setBuilderState to prevent passing null
    const setBuilderStateWrapper = (updater: React.SetStateAction<BuilderState>) => {
        setBuilderState(currentState => {
            if (currentState === null) return null; // Should not happen, but safe guard
            return typeof updater === 'function' ? updater(currentState) : updater;
        });
    };
    
    const dummyHistoryFuncs = useMemo(() => ({
        undo: () => {},
        redo: () => {},
        canUndo: false,
        canRedo: false,
    }), []);

    if (error) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-red-600">Editing Error</h2>
                <p className="text-slate-600 mt-2">{error}</p>
                <button 
                    onClick={onCancel} 
                    className="mt-6 px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-all hover:bg-slate-300"
                >
                    Back to Results
                </button>
            </div>
        )
    }

    if (!builderState) {
        return (
            <div className="flex justify-center items-center p-10">
                <SpinnerIcon />
                <span className="ml-2 text-slate-500">Loading Editor...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <SignatureBuilder
                mode="single"
                csvHeaders={[]}
                csvData={[]}
                builderState={builderState}
                setBuilderState={setBuilderStateWrapper}
                {...dummyHistoryFuncs}
                savedColors={savedColors}
                setSavedColors={setSavedColors}
                customFonts={localCustomFonts}
                setCustomFonts={setLocalCustomFonts}
                savedTemplates={[]}
                onSaveTemplate={() => {}}
                onDeleteTemplate={() => {}}
                onLoadTemplate={() => {}}
                onImportTemplates={() => {}}
                onComplete={handleSave}
                actionButtonText="Save Changes"
                theme={theme}
            />
        </div>
    );
}