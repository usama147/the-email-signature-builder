import React, { useState, useMemo } from 'react';
import { RowItem, TableProperties, CustomFont } from '../types';
import { generateSignatureHtml, resolveMappings } from '../utils/htmlGenerator';
import { checkCompatibility } from '../utils/compatibilityChecker';
import { CompatibilityReport } from './CompatibilityReport';

interface PreviewProps {
  items: RowItem[];
  maxWidth: number;
  tableProperties: TableProperties;
  customFonts: CustomFont[];
  data?: Record<string, string>;
}

export function Preview({ items, maxWidth, tableProperties, customFonts, data }: PreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'compatibility'>('preview');
  const [copied, setCopied] = useState(false);

  const htmlOutput = useMemo(() => {
    const itemsToRender = data ? resolveMappings(items, data) : items;
    return generateSignatureHtml(itemsToRender, maxWidth, tableProperties, customFonts)
  }, [items, maxWidth, tableProperties, data, customFonts]);

  const compatibilityResults = useMemo(() => {
    // Pass the generated HTML to the checker for a deep analysis.
    return checkCompatibility(htmlOutput);
  }, [htmlOutput]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(htmlOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const title = data ? "Live Preview (using first row of data)" : "Live Preview";

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-4 px-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {title}
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`${
              activeTab === 'html'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            HTML Code
          </button>
          <button
            onClick={() => setActiveTab('compatibility')}
            className={`${
              activeTab === 'compatibility'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Compatibility
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'preview' && (
          <div
            className="p-4 border rounded-md bg-slate-50"
            dangerouslySetInnerHTML={{ __html: htmlOutput }}
          />
        )}
        {activeTab === 'html' && (
          <div className="relative">
             <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <textarea
              readOnly
              className="w-full h-64 p-3 font-mono text-sm bg-slate-900 text-slate-100 rounded-md border border-slate-700 focus:ring-blue-500 focus:border-blue-500"
              value={htmlOutput}
            />
          </div>
        )}
        {activeTab === 'compatibility' && (
            <CompatibilityReport results={compatibilityResults} />
        )}
      </div>
    </div>
  );
}