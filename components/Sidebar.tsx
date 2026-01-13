
import React, { useState } from 'react';
import { SidebarItem } from './SidebarItem';
import { SIDEBAR_COMPONENTS } from '../constants';
import { LayerPanel } from './LayerPanel';
import { RowItem } from '../types';

interface SidebarProps {
    rows: RowItem[];
    selectedItemId: string | null;
    setSelectedItemId: (id: string | null) => void;
    updateItem: (id: string, updates: any) => void;
    setRows: (newRows: RowItem[]) => void;
}

export function Sidebar({ rows, selectedItemId, setSelectedItemId, updateItem, setRows }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'components' | 'layers'>('components');

  return (
    <div className="bg-[--surface] rounded-lg shadow-[--shadow-2] border border-[--border-color] flex flex-col h-full max-h-[calc(100vh-8rem)] transition-all duration-300" data-glass>
      <div className="flex border-b border-[--border-color]">
          <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'components' ? 'text-[--primary] border-b-2 border-[--primary]' : 'text-[--text-color-secondary] hover:bg-[--surface-secondary]'}`}
            onClick={() => setActiveTab('components')}
          >
              Add
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'layers' ? 'text-[--primary] border-b-2 border-[--primary]' : 'text-[--text-color-secondary] hover:bg-[--surface-secondary]'}`}
            onClick={() => setActiveTab('layers')}
          >
              Layers
          </button>
      </div>

      <div className="p-4 overflow-y-auto flex-grow">
        {activeTab === 'components' ? (
            <>
                <h2 className="text-sm font-semibold mb-4 text-[--text-color-secondary] uppercase tracking-wider">Components</h2>
                <div className="space-y-2">
                    {SIDEBAR_COMPONENTS.map((component) => (
                    <div key={component.type}>
                        <SidebarItem component={component} />
                    </div>
                    ))}
                </div>
            </>
        ) : (
            <LayerPanel 
                rows={rows} 
                selectedItemId={selectedItemId} 
                setSelectedItemId={setSelectedItemId} 
                updateItem={updateItem}
                setRows={setRows}
            />
        )}
      </div>
    </div>
  );
}
