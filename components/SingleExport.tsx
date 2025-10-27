
import React from 'react';
import { RowItem, TableProperties, CustomFont } from '../types';
import { Preview } from './Preview';

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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Your Signature is Ready!</h2>
                    <p className="text-slate-600">Preview your signature and copy the HTML code below.</p>
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
            
            <Preview 
                items={rows}
                maxWidth={maxWidth}
                tableProperties={tableProperties}
                customFonts={customFonts}
            />
        </div>
    )
}
