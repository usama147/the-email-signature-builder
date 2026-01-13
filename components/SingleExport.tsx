import React, { useState, useCallback, useRef } from 'react';
import { CustomFont } from '../types';
import { Preview } from './Preview';
import { generateSignatureHtml } from '../utils/htmlGenerator';
import { parseHtmlToState } from '../utils/htmlParser';
import { BuilderState } from '../BulkCreatorPage';

interface SingleExportProps {
    builderState: BuilderState;
    setBuilderState: (updater: React.SetStateAction<BuilderState>) => void;
    customFonts: CustomFont[];
    setCustomFonts: (updater: React.SetStateAction<CustomFont[]>) => void;
    onGoBack: () => void;
    onRestart: () => void;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

export function SingleExport({ builderState, setBuilderState, customFonts, setCustomFonts, onGoBack, onRestart }: SingleExportProps) {
    const { rows, maxWidth, tableProperties } = builderState;
    const [fileName, setFileName] = useState('my-signature');
    const [htmlError, setHtmlError] = useState<string | null>(null);
    const [isEditable, setIsEditable] = useState(false);

    const debouncedUpdate = useCallback(
        debounce((html: string) => {
            try {
                if (!html.trim()) {
                    setBuilderState(prev => ({...prev, rows: []}));
                    setHtmlError(null);
                    return;
                }
                const { builderState: newState, customFonts: parsedFonts } = parseHtmlToState(html);
                setBuilderState(current => ({
                    ...current,
                    ...newState
                }));
                
                if (parsedFonts.length > 0) {
                    setCustomFonts((currentFonts: CustomFont[]) => {
                        const newFonts = [...currentFonts];
                        parsedFonts.forEach(parsedFont => {
                            if (!newFonts.some(f => f.rawCss && f.rawCss === parsedFont.rawCss)) {
                                newFonts.push(parsedFont);
                            }
                        });
                        return newFonts;
                    });
                }

                setHtmlError(null);
            } catch (e: any) {
                console.error("HTML parsing failed:", e);
                setHtmlError(e.message || "Failed to parse HTML. The structure might be invalid.");
            }
        }, 500),
        [setBuilderState, setCustomFonts]
    );

    const handleHtmlUpdate = (html: string) => {
        debouncedUpdate(html);
    };

    const handleDownload = () => {
        const signatureHtml = generateSignatureHtml(rows, maxWidth, tableProperties, customFonts, isEditable);
        const blob = new Blob([signatureHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const sanitizedFileName = (fileName.trim() || 'signature')
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        a.download = `${sanitizedFileName}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-[--surface] p-4 rounded-lg shadow-[--shadow-1] space-y-4 border border-[--border-color] transition-all duration-300" data-glass>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Your Signature is Ready!</h2>
                        <p className="text-[--text-color-secondary]">Preview your signature, copy the code, or download it as a file.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={onGoBack} className="btn">
                            Back to Design
                        </button>
                        <button onClick={onRestart} className="btn btn-primary">
                            Start Over
                        </button>
                    </div>
                </div>
                <div className="border-t border-[--border-color] pt-4 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <label htmlFor="fileName" className="block text-sm font-medium text-[--text-color-secondary] mb-1">
                            File Name & Options
                        </label>
                        <input
                            type="text"
                            id="fileName"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="input-field block w-full sm:w-64 px-3 py-2 sm:text-sm"
                            placeholder="my-signature"
                        />
                         <div className="mt-2">
                            <label className="flex items-center text-sm text-[--text-color-secondary]">
                                <input
                                    type="checkbox"
                                    checked={isEditable}
                                    onChange={(e) => setIsEditable(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-[--primary] focus:ring-[--primary] mr-2"
                                />
                                Create editable HTML file
                            </label>
                            <p className="text-xs text-[--text-color-light] mt-1 ml-6">Generates an HTML file where you can directly edit text content in your browser. Note: Links will not be clickable in this mode.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleDownload}
                        disabled={!fileName.trim()}
                        className="btn btn-success"
                    >
                        Download (.html)
                    </button>
                </div>
            </div>
            
            <Preview 
                items={rows}
                maxWidth={maxWidth}
                tableProperties={tableProperties}
                customFonts={customFonts}
                onHtmlUpdate={handleHtmlUpdate}
            />
            {htmlError && (
                <div className="mt-2 p-3 bg-[--danger-surface] border border-[--danger] text-[--danger-text] rounded-md text-sm">
                    <strong>HTML Error:</strong> {htmlError}
                </div>
            )}
        </div>
    )
}