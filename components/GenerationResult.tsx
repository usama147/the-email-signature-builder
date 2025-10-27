
import React, { useState } from 'react';
import JSZip from 'jszip';

interface GenerationResultProps {
  processName: string;
  csvData: Record<string, string>[];
  generatedSignatures: string[];
  onRestart: () => void;
  onGoBack: () => void;
}

interface ResultCardProps {
  name: string;
  signatureHtml: string;
  index: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ name, signatureHtml, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(signatureHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border p-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:border-blue-400">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-slate-700">{name || `Row ${index + 1}`}</h4>
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-md transition-colors duration-200 ease-in-out hover:bg-blue-600"
        >
          {copied ? 'Copied!' : 'Copy HTML'}
        </button>
      </div>
      <div
        className="p-4 border rounded-md bg-slate-50 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: signatureHtml }}
      />
    </div>
  );
}

export function GenerationResult({ processName, csvData, generatedSignatures, onRestart, onGoBack }: GenerationResultProps) {
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadAll = async () => {
    setIsZipping(true);
    const zip = new JSZip();
    
    generatedSignatures.forEach((html, index) => {
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Generation Complete</h2>
          <p className="text-slate-600">Generated {generatedSignatures.length} signatures for "{processName}".</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <button onClick={onGoBack} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-slate-300 hover:-translate-y-0.5">
                Back to Design
            </button>
            <button onClick={handleDownloadAll} disabled={isZipping} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-green-700 hover:-translate-y-0.5 disabled:bg-slate-400 disabled:transform-none">
                {isZipping ? 'Zipping...' : 'Download All (.zip)'}
            </button>
            <button onClick={onRestart} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-blue-700 hover:-translate-y-0.5">
                Start New Process
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedSignatures.map((html, index) => (
          <ResultCard 
            key={index}
            name={csvData[index]?.name || csvData[index]?.Name || csvData[index]?.fullName}
            signatureHtml={html}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}