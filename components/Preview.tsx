
import React, { useState, useMemo, useEffect } from 'react';
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
  onHtmlUpdate?: (html: string) => void;
}

export function Preview({ items, maxWidth, tableProperties, customFonts, data, onHtmlUpdate }: PreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'compatibility'>('preview');
  const [copied, setCopied] = useState(false);
  
  const generatedHtml = useMemo(() => {
    const itemsToRender = data ? resolveMappings(items, data) : items;
    return generateSignatureHtml(itemsToRender, maxWidth, tableProperties, customFonts)
  }, [items, maxWidth, tableProperties, data, customFonts]);

  const [editableHtml, setEditableHtml] = useState(generatedHtml);
  
  useEffect(() => {
    setEditableHtml(generatedHtml);
  }, [generatedHtml]);

  const compatibilityResults = useMemo(() => {
    // Check compatibility of the user-edited HTML for accuracy
    return checkCompatibility(editableHtml);
  }, [editableHtml]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(editableHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleHtmlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = event.target.value;
    setEditableHtml(newHtml);
    if (onHtmlUpdate) {
        onHtmlUpdate(newHtml);
    }
  };

  const title = data ? "Live Preview (using first row of data)" : "Live Preview";

  return (
    <div className="bg-[--surface] rounded-lg shadow-[--shadow-2] border border-[--border-color] transition-all duration-300" data-glass>
      <div className="border-b border-[--border-color]">
        <nav className="-mb-px flex space-x-4 px-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`${
              activeTab === 'preview'
                ? 'border-[--primary] text-[--primary]'
                : 'border-transparent text-[--text-color-light] hover:text-[--text-color-secondary] hover:border-[--border-color-heavy]'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300`}
          >
            {title}
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`${
              activeTab === 'html'
                ? 'border-[--primary] text-[--primary]'
                : 'border-transparent text-[--text-color-light] hover:text-[--text-color-secondary] hover:border-[--border-color-heavy]'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300`}
          >
            HTML Code
          </button>
          <button
            onClick={() => setActiveTab('compatibility')}
            className={`${
              activeTab === 'compatibility'
                ? 'border-[--primary] text-[--primary]'
                : 'border-transparent text-[--text-color-light] hover:text-[--text-color-secondary] hover:border-[--border-color-heavy]'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300`}
          >
            Compatibility
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'preview' && (
          <div
            className="p-4 border border-[--border-color] rounded-md bg-[--surface-secondary]"
            dangerouslySetInnerHTML={{ __html: editableHtml }}
          />
        )}
        {activeTab === 'html' && (
          <div className="relative">
             <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-3 py-1 bg-[--primary] text-[--primary-text] text-xs font-semibold rounded-md hover:bg-[--primary-hover] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--primary] z-10"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <textarea
              className="w-full h-64 p-3 font-mono text-sm bg-slate-900 text-slate-100 rounded-md border border-slate-700 focus:ring-[--primary] focus:border-[--primary]"
              value={editableHtml}
              onChange={handleHtmlChange}
              spellCheck="false"
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