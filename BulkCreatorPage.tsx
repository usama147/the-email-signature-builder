
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { SignatureBuilder } from './components/SignatureBuilder';
import { GenerationResult } from './components/GenerationResult';
import { RowItem, TableProperties, CustomFont, SignatureTemplate } from './types';
import { generateBulkSignatureHtml, generateSignatureHtml } from './utils/htmlGenerator';
import { checkCompatibility } from './utils/compatibilityChecker';
import { CompatibilityReport } from './components/CompatibilityReport';
import { v4 as uuidv4 } from 'uuid';

type CsvData = Record<string, string>[];
type Step = 'upload' | 'design' | 'check' | 'generate';

interface BuilderState {
  rows: RowItem[];
  maxWidth: number;
  tableProperties: TableProperties;
}

export function BulkCreatorPage() {
  const [step, setStep] = useState<Step>('upload');
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

    // Avoid pushing to history if state is unchanged from the current history pointer
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
      if (storedColors) setSavedColors(JSON.parse(storedColors));
      const storedFonts = localStorage.getItem('customFonts');
      if (storedFonts) setCustomFonts(JSON.parse(storedFonts));
      const storedTemplates = localStorage.getItem('savedTemplates');
      if (storedTemplates) setSavedTemplates(JSON.parse(storedTemplates));
    } catch (err) {
      console.error("Failed to load data from localStorage", err);
    }
  }, []);

  const handleSetSavedColors = (colors: string[]) => {
    setSavedColors(colors);
    localStorage.setItem('savedColors', JSON.stringify(colors));
  };

  const handleSetCustomFonts = (fonts: CustomFont[]) => {
    setCustomFonts(fonts);
    localStorage.setItem('customFonts', JSON.stringify(fonts));
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
    // This will create a new history entry for the loaded template
    setBuilderState(newState);
    setTemplateLoadedMessage(`Template "${template.name}" has been loaded.`);
    window.scrollTo(0, 0);
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
          setGenerationCount(results.data.length); // Default to all
        },
      });
    }
  };

  const goToDesign = () => {
    if (csvData.length > 0 && processName) {
      setStep('design');
    } else {
      alert('Please enter a process name and upload a valid CSV file.');
    }
  };

  const goToPreGenerationCheck = () => {
    setStep('check');
  };

  const goToGenerate = () => {
      const dataToProcess = generationCount > 0 && generationCount <= csvData.length 
        ? csvData.slice(0, generationCount) 
        : csvData;
      const results = generateBulkSignatureHtml(builderState.rows, dataToProcess, builderState.maxWidth, builderState.tableProperties, customFonts);
      setGeneratedSignatures(results);
      setStep('generate');
  }

  const handleRestart = () => {
    setStep('upload');
    setProcessName('');
    setCsvHeaders([]);
    setCsvData([]);
    setBuilderState(initialBuilderState);
    setHistory([initialBuilderState]);
    setHistoryIndex(0);
    setGeneratedSignatures([]);
    setGenerationCount(0);
    setTemplateLoadedMessage('');
  };

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Step 1: Upload Your Data</h2>
              
              {templateLoadedMessage && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                      <p className="font-bold">Success</p>
                      <p>{templateLoadedMessage}</p>
                  </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Process Name</label>
                  <input
                    type="text"
                    value={processName}
                    onChange={(e) => setProcessName(e.target.value)}
                    placeholder="e.g., Q4 Sales Team Signatures"
                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Upload CSV</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                  />
                </div>

                {csvData.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Number of Signatures to Generate</label>
                    <input
                      type="number"
                      value={generationCount}
                      onChange={(e) => setGenerationCount(parseInt(e.target.value, 10))}
                      max={csvData.length}
                      min="1"
                      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1">Total records found: {csvData.length}</p>
                  </div>
                )}

                {csvHeaders.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-md border">
                    <h4 className="font-semibold mb-2">Detected CSV Fields:</h4>
                    <div className="flex flex-wrap gap-2">
                      {csvHeaders.map(header => <span key={header} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{header}</span>)}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 text-center">
                <button onClick={goToDesign} disabled={!processName || csvData.length === 0} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-blue-700 hover:-translate-y-0.5 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none">
                  Next: Design Signature
                </button>
              </div>
            </div>
            
            {savedTemplates.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-xl font-bold mb-4 text-center">Or Start from a Saved Template</h3>
                  <div className="space-y-3">
                      {savedTemplates.map(template => (
                          <div key={template.id} className="flex justify-between items-center p-3 border rounded-md bg-slate-50 transition-all duration-200 ease-in-out hover:bg-slate-100 hover:border-slate-300">
                              <span className="font-medium">{template.name}</span>
                              <button onClick={() => handleLoadTemplate(template)} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-md transition-colors duration-200 hover:bg-blue-200">
                                  Use this template
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
            )}
          </div>
        );
      case 'design':
        return <SignatureBuilder 
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
                 onComplete={goToPreGenerationCheck} 
                 />;
      case 'check': {
        const templateHtml = generateSignatureHtml(builderState.rows, builderState.maxWidth, builderState.tableProperties, customFonts);
        const compatibilityResults = checkCompatibility(templateHtml);
        return (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-2 text-center">Step 3: Compatibility Check</h2>
                <p className="text-slate-500 text-center mb-6">We've scanned your design for common issues in email clients. Review the report below before generating your signatures.</p>
                <CompatibilityReport results={compatibilityResults} />
                <div className="mt-8 flex flex-wrap justify-between items-center gap-4">
                    <button onClick={() => setStep('design')} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-slate-300 hover:-translate-y-0.5">
                        Back to Design
                    </button>
                    <button onClick={goToGenerate} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-green-700 hover:-translate-y-0.5">
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
                    onRestart={handleRestart}
                    onGoBack={() => setStep('design')}
                    />
        }
    }
  };

  return <div>{renderStep()}</div>;
}