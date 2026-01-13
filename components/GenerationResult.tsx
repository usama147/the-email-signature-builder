import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { SingleSignatureEditor } from './SingleSignatureEditor';
import { CustomFont } from '../types';
import { BuilderState } from '../BulkCreatorPage';
import { generateBulkSignatureHtml } from '../utils/htmlGenerator';
import { Theme } from '../App';

interface GenerationResultProps {
  processName: string;
  csvData: Record<string, string>[];
  generatedSignatures: string[];
  onRestart: () => void;
  onGoBack: () => void;
  savedColors: string[];
  setSavedColors: (updater: React.SetStateAction<string[]>) => void;
  customFonts: CustomFont[];
  setCustomFonts: (updater: React.SetStateAction<CustomFont[]>) => void;
  builderState: BuilderState;
  theme: Theme;
}

interface ResultCardProps {
  name: string;
  signatureHtml: string;
  index: number;
  onEdit: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ name, signatureHtml, index, onEdit }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(signatureHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-[--surface] rounded-lg shadow-[--shadow-1] border border-[--border-color] p-4 transition-all duration-300 ease-in-out hover:shadow-[--shadow-2] hover:border-[--primary] flex flex-col liquid-hover" data-glass>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-[--text-color] truncate pr-2">{name || `Row ${index + 1}`}</h4>
        <div className="flex items-center gap-2">
           <button
            onClick={onEdit}
            className="btn btn-sm"
          >
            Edit
          </button>
          <button
            onClick={handleCopy}
            className="btn btn-primary btn-sm"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div
        className="p-4 border border-[--border-color] rounded-md bg-[--surface-secondary] overflow-x-auto flex-grow"
        dangerouslySetInnerHTML={{ __html: signatureHtml }}
      />
    </div>
  );
}

export function GenerationResult({ 
    processName, 
    csvData, 
    generatedSignatures, 
    onRestart, 
    onGoBack,
    savedColors,
    setSavedColors,
    customFonts,
    setCustomFonts,
    builderState,
    theme
}: GenerationResultProps) {
  const [signatures, setSignatures] = useState<string[]>(generatedSignatures);
  const [editingSignature, setEditingSignature] = useState<{ index: number; html: string } | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  
  useEffect(() => {
    setSignatures(generatedSignatures);
  }, [generatedSignatures]);

  const handleDownloadAll = async () => {
    setIsZipping(true);
    const zip = new JSZip();

    const signaturesToZip = isEditable
        ? generateBulkSignatureHtml(
            builderState.rows,
            csvData,
            builderState.maxWidth,
            builderState.tableProperties,
            customFonts,
            true
          )
        : signatures;
    
    signaturesToZip.forEach((html, index) => {
        const dataRow = csvData[index];
        const name = dataRow?.name || dataRow?.Name || dataRow?.fullName || `signature-${index + 1}`;
        const filename = name.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.html';
        
        zip.file(filename, html);
    });
    
    try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        const zipFilename = (processName || 'signatures').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.zip';
        a.download = zipFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch(error) {
        console.error("Failed to generate zip file", error);
        alert("There was an error creating the zip file. Please try again.");
    } finally {
        setIsZipping(false);
    }
  };
  
  const handleSaveEdit = (index: number, newHtml: string) => {
    const updatedSignatures = [...signatures];
    updatedSignatures[index] = newHtml;
    setSignatures(updatedSignatures);
    setEditingSignature(null); // Close the editor
  };
  
  if (editingSignature !== null) {
      return (
        <SingleSignatureEditor
            initialHtml={editingSignature.html}
            onSave={(newHtml) => handleSaveEdit(editingSignature.index, newHtml)}
            onCancel={() => setEditingSignature(null)}
            savedColors={savedColors}
            setSavedColors={setSavedColors}
            customFonts={customFonts}
            setCustomFonts={setCustomFonts}
            theme={theme}
        />
      )
  }

  return (
    <div className="space-y-6">
      <div className="bg-[--surface] p-4 rounded-lg shadow-[--shadow-1] flex flex-wrap items-center justify-between gap-4 border border-[--border-color] transition-all duration-300" data-glass>
        <div>
          <h2 className="text-2xl font-bold">Generation Complete</h2>
          <p className="text-[--text-color-secondary]">Generated {signatures.length} signatures for "{processName}".</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <button onClick={onGoBack} className="btn">
                Back to Design
            </button>
            <div className="flex items-center gap-2 border-l border-[--border-color] pl-2">
                <button onClick={handleDownloadAll} disabled={isZipping} className="btn btn-success">
                    {isZipping ? 'Zipping...' : 'Download All (.zip)'}
                </button>
                <label className="flex items-center text-sm text-[--text-color-secondary]" title="Make text content in the downloaded HTML files directly editable in a browser.">
                    <input
                        type="checkbox"
                        checked={isEditable}
                        onChange={(e) => setIsEditable(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[--primary] focus:ring-[--primary] mr-2"
                    />
                    Make editable
                </label>
            </div>
            <button onClick={onRestart} className="btn btn-primary">
                Start New Process
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {signatures.map((html, index) => (
          <ResultCard 
            key={index}
            name={csvData[index]?.name || csvData[index]?.Name || csvData[index]?.fullName}
            signatureHtml={html}
            index={index}
            onEdit={() => setEditingSignature({ index, html })}
          />
        ))}
      </div>
    </div>
  );
}