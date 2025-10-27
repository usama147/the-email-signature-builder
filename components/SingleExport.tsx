
import React, { useState } from 'react';
import { RowItem, TableProperties, CustomFont } from '../types';
import { Preview } from './Preview';
import { generateSignatureHtml } from '../utils/htmlGenerator';

interface BuilderState {
  rows: RowItem[];
  maxWidth: number;
  tableProperties: TableProperties;
}

interface SingleExportProps {
    builderState: BuilderState;
    customFonts: CustomFont[];
    onGoBack: () => void;
    onRestart: () => void;
}

export function SingleExport({ builderState, customFonts, onGoBack, onRestart }: SingleExportProps) {
    const { rows, maxWidth, tableProperties } = builderState;
    const [fileName, setFileName] = useState('my-signature');

    const handleDownload = () => {
        const signatureHtml = generateSignatureHtml(rows, maxWidth, tableProperties, customFonts);
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
            <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Your Signature is Ready!</h2>
                        <p className="text-slate-600">Preview your signature, copy the code, or download it as a file.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={onGoBack} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-slate-300 hover:-translate-y-0.5">
                            Back to Design
                        </button>
                        <button onClick={onRestart} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-blue-700 hover:-translate-y-0.5">
                            Start Over
                        </button>
                    </div>
                </div>
                <div className="border-t pt-4 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <label htmlFor="fileName" className="block text-sm font-medium text-slate-700 mb-1">
                            File Name
                        </label>
                        <input
                            type="text"
                            id="fileName"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="block w-full sm:w-64 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="my-signature"
                        />
                    </div>
                    <button 
                        onClick={handleDownload}
                        disabled={!fileName.trim()}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-green-700 hover:-translate-y-0.5 disabled:bg-slate-400 disabled:transform-none"
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
            />
        </div>
    )
}
