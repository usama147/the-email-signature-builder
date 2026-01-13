import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { SignatureBuilder } from './components/SignatureBuilder';
import { GenerationResult } from './components/GenerationResult';
import { RowItem, TableProperties, CustomFont, SignatureTemplate } from './types';
import { generateBulkSignatureHtml, generateSignatureHtml } from './utils/htmlGenerator';
import { checkCompatibility } from './utils/compatibilityChecker';
import { CompatibilityReport } from './components/CompatibilityReport';
import { v4 as uuidv4 } from 'uuid';
import { SingleExport } from './components/SingleExport';
import { Theme } from './App';

export type CreationMode = 'bulk' | 'single';
type CsvData = Record<string, string>[];
type Step = 'upload' | 'design' | 'check' | 'generate' | 'export';

export interface BuilderState {
  rows: RowItem[];
  maxWidth: number;
  tableProperties: TableProperties;
}

interface BulkCreatorPageProps {
    mode: CreationMode;
    onNavigateHome: () => void;
    theme: Theme;
}

export function BulkCreatorPage({ mode, onNavigateHome, theme }: BulkCreatorPageProps) {
  const [step, setStep] = useState<Step>(mode === 'bulk' ? 'upload' : 'design');
  const [processName, setProcessName] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<CsvData>([]);
  
  const initialBuilderState: BuilderState = {
    rows: [],
    maxWidth: 600,
    tableProperties: { border: 0, cellSpacing: 0 },
  };
  const [builderState, setBuilderStateInternal] = useState<BuilderState>(initialBuilderState);
  const [history, setHistory] = useState<BuilderState[]>([initialBuilderState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [generatedSignatures, setGeneratedSignatures] = useState<string[]>([]);
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SignatureTemplate[]>([]);
  const [templateLoadedMessage, setTemplateLoadedMessage] = useState('');

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const setBuilderState = (newState: React.SetStateAction<BuilderState>) => {
    const resolvedState = typeof newState === 'function' ? newState(builderState) : newState;
    
    setBuilderStateInternal(resolvedState);

    if (JSON.stringify(resolvedState) === JSON.stringify(history[historyIndex])) {
        return;
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(resolvedState);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (canUndo) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setBuilderStateInternal(history[newIndex]);
    }
  };

  const redo = () => {
      if (canRedo) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setBuilderStateInternal(history[newIndex]);
      }
  };

  useEffect(() => {
    try {
      const storedColors = localStorage.getItem('savedColors');
      if (storedColors) {
          const parsed = JSON.parse(storedColors);
          if (Array.isArray(parsed)) setSavedColors(parsed);
      }
      const storedFonts = localStorage.getItem('customFonts');
      if (storedFonts) {
          const parsed = JSON.parse(storedFonts);
          if (Array.isArray(parsed)) setCustomFonts(parsed);
      }
      const storedTemplates = localStorage.getItem('savedTemplates');
      if (storedTemplates) {
          const parsed = JSON.parse(storedTemplates);
          if(Array.isArray(parsed)) setSavedTemplates(parsed);
      }
    } catch (err) {
      console.error("Failed to load data from localStorage", err);
    }
  }, []);

  const handleSetSavedColors = (updater: React.SetStateAction<string[]>) => {
    setSavedColors(currentColors => {
        const newColors = typeof updater === 'function' ? updater(currentColors) : updater;
        localStorage.setItem('savedColors', JSON.stringify(newColors));
        return newColors;
    });
  };

  const handleSetCustomFonts = (updater: React.SetStateAction<CustomFont[]>) => {
    setCustomFonts(currentFonts => {
        const newFonts = typeof updater === 'function' ? updater(currentFonts) : updater;
        localStorage.setItem('customFonts', JSON.stringify(newFonts));
        return newFonts;
    });
  };

  const handleSaveTemplate = (name: string) => {
    const newTemplate: SignatureTemplate = {
        id: uuidv4(),
        name,
        rows: builderState.rows,
        maxWidth: builderState.maxWidth,
        tableProperties: builderState.tableProperties,
    };
    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('savedTemplates', JSON.stringify(updatedTemplates));
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('savedTemplates', JSON.stringify(updatedTemplates));
  };

  const handleLoadTemplate = (template: SignatureTemplate) => {
    const newState = {
      rows: template.rows,
      maxWidth: template.maxWidth,
      tableProperties: template.tableProperties,
    };
    setBuilderState(newState);
    setTemplateLoadedMessage(`Template "${template.name}" has been loaded.`);
    window.scrollTo(0, 0);
  };
  
  const handleImportTemplates = (importedTemplates: SignatureTemplate[]) => {
    const newTemplates = [...savedTemplates];
    let importedCount = 0;
    
    for (const importedTemplate of importedTemplates) {
        // Basic validation of the template structure
        if (
            importedTemplate.id && 
            typeof importedTemplate.id === 'string' &&
            importedTemplate.name &&
            typeof importedTemplate.name === 'string' &&
            Array.isArray(importedTemplate.rows) &&
            typeof importedTemplate.maxWidth === 'number' &&
            typeof importedTemplate.tableProperties === 'object'
        ) {
            // Avoid duplicates by ID
            if (!newTemplates.some(t => t.id === importedTemplate.id)) {
                newTemplates.push(importedTemplate);
                importedCount++;
            }
        }
    }

    if (importedCount > 0) {
        setSavedTemplates(newTemplates);
        localStorage.setItem('savedTemplates', JSON.stringify(newTemplates));
        alert(`Successfully imported ${importedCount} new template(s).`);
    } else {
        alert('No new templates were imported. They might already exist or the file may be invalid.');
    }
  };


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields) {
            setCsvHeaders(results.meta.fields);
          }
          setCsvData(results.data);
          setGenerationCount(results.data.length);
        },
      });
    }
  };

  const handleDesignComplete = () => {
    if (mode === 'bulk') {
        setStep('check');
    } else {
        setStep('export');
    }
  };

  const goToGenerate = () => {
      const dataToProcess = generationCount > 0 && generationCount <= csvData.length 
        ? csvData.slice(0, generationCount) 
        : csvData;
      const results = generateBulkSignatureHtml(builderState.rows, dataToProcess, builderState.maxWidth, builderState.tableProperties, customFonts);
      setGeneratedSignatures(results);
      setStep('generate');
  }

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-[--surface] rounded-lg shadow-[--shadow-2] p-8 border border-[--border-color] transition-all duration-300" data-glass>
              <h2 className="text-2xl font-bold mb-6 text-center text-[--text-color]">Step 1: Upload Your Data</h2>
              
              {templateLoadedMessage && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                      <p className="font-bold">Success</p>
                      <p>{templateLoadedMessage}</p>
                  </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[--text-color-secondary] mb-1">Process Name</label>
                  <input
                    type="text"
                    value={processName}
                    onChange={(e) => setProcessName(e.target.value)}
                    placeholder="e.g., Q4 Sales Team Signatures"
                    className="input-field block w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--text-color-secondary] mb-1">Upload CSV</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-[--text-color-light] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[--primary] file:text-[--primary-text] file:opacity-80 hover:file:opacity-100 transition-all duration-200"
                  />
                </div>

                {csvData.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-[--text-color-secondary] mb-1">Number of Signatures to Generate</label>
                    <input
                      type="number"
                      value={generationCount}
                      onChange={(e) => setGenerationCount(parseInt(e.target.value, 10))}
                      max={csvData.length}
                      min="1"
                      className="input-field block w-full px-3 py-2"
                    />
                    <p className="text-xs text-[--text-color-light] mt-1">Total records found: {csvData.length}</p>
                  </div>
                )}

                {csvHeaders.length > 0 && (
                  <div className="p-4 bg-[--surface-secondary] rounded-md border border-[--border-color] transition-all duration-300">
                    <h4 className="font-semibold mb-2 text-[--text-color-secondary]">Detected CSV Fields:</h4>
                    <div className="flex flex-wrap gap-2">
                      {csvHeaders.map(header => <span key={header} className="bg-[--primary] bg-opacity-10 text-[--primary] text-xs font-medium px-2.5 py-0.5 rounded-full">{header}</span>)}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 text-center">
                <button onClick={() => setStep('design')} disabled={!processName || csvData.length === 0} className="btn btn-primary">
                  Next: Design Signature
                </button>
              </div>
            </div>
          </div>
        );
      case 'design':
        return <SignatureBuilder 
                 mode={mode}
                 csvHeaders={csvHeaders}
                 csvData={csvData}
                 builderState={builderState}
                 setBuilderState={setBuilderState}
                 undo={undo}
                 redo={redo}
                 canUndo={canUndo}
                 canRedo={canRedo}
                 savedColors={savedColors}
                 setSavedColors={handleSetSavedColors}
                 customFonts={customFonts}
                 setCustomFonts={handleSetCustomFonts}
                 savedTemplates={savedTemplates}
                 onSaveTemplate={handleSaveTemplate}
                 onDeleteTemplate={handleDeleteTemplate}
                 onLoadTemplate={handleLoadTemplate}
                 onImportTemplates={handleImportTemplates}
                 onComplete={handleDesignComplete} 
                 actionButtonText={mode === 'bulk' ? 'Generate Signatures' : 'Export Signature'}
                 theme={theme}
                 />;
      case 'check': {
        const templateHtml = generateSignatureHtml(builderState.rows, builderState.maxWidth, builderState.tableProperties, customFonts);
        const compatibilityResults = checkCompatibility(templateHtml);
        return (
            <div className="bg-[--surface] rounded-lg shadow-[--shadow-2] p-8 max-w-4xl mx-auto border border-[--border-color] transition-all duration-300" data-glass>
                <h2 className="text-2xl font-bold mb-2 text-center">Step 3: Compatibility Check</h2>
                <p className="text-[--text-color-light] text-center mb-6">We've scanned your design for common issues in email clients. Review the report below before generating your signatures.</p>
                <CompatibilityReport results={compatibilityResults} />
                <div className="mt-8 flex flex-wrap justify-between items-center gap-4">
                    <button onClick={() => setStep('design')} className="btn">
                        Back to Design
                    </button>
                    <button onClick={goToGenerate} className="btn btn-success">
                        Generate Signatures
                    </button>
                </div>
            </div>
        );
      }
      case 'generate': {
          const dataForResults = generationCount > 0 && generationCount <= csvData.length
            ? csvData.slice(0, generationCount)
            : csvData;
          return <GenerationResult
                    processName={processName}
                    csvData={dataForResults}
                    generatedSignatures={generatedSignatures}
                    onRestart={onNavigateHome}
                    onGoBack={() => setStep('design')}
                    savedColors={savedColors}
                    setSavedColors={handleSetSavedColors}
                    customFonts={customFonts}
                    setCustomFonts={handleSetCustomFonts}
                    builderState={builderState}
                    theme={theme}
                    />
        }
    case 'export':
        return <SingleExport
                builderState={builderState}
                setBuilderState={setBuilderState}
                customFonts={customFonts}
                setCustomFonts={setCustomFonts}
                onGoBack={() => setStep('design')}
                onRestart={onNavigateHome}
                />
    }
  };

  return <div>{renderStep()}</div>;
}