
import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  CollisionDetection,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { Preview } from './Preview';
import { SidebarItem } from './SidebarItem';
import { ComponentType, RowItem, SignatureItem, SelectableItem, TableProperties, CustomFont, SignatureTemplate, TextItem } from '../types';
import { SIDEBAR_COMPONENTS } from '../constants';
import { createNewItem } from '../utils/itemFactory';
import { findItem, removeItem, insertItem, findContainerId, updateItem } from '../utils/itemUtils';
import { TemplateLibrary } from './TemplateLibrary';
import { presets } from '../presets';
import { WysiwygEditor } from './WysiwygEditor';
import { SaveTemplateModal } from './SaveTemplateModal';
import { UndoIcon, RedoIcon } from './icons';
import { CreationMode } from '../BulkCreatorPage';

interface BuilderState {
  rows: RowItem[];
  maxWidth: number;
  tableProperties: TableProperties;
}
interface SignatureBuilderProps {
  mode: CreationMode;
  csvHeaders: string[];
  csvData: Record<string, string>[];
  builderState: BuilderState;
  setBuilderState: (updater: React.SetStateAction<BuilderState>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  savedColors: string[];
  setSavedColors: (colors: string[]) => void;
  customFonts: CustomFont[];
  setCustomFonts: (fonts: CustomFont[]) => void;
  savedTemplates: SignatureTemplate[];
  onSaveTemplate: (name: string) => void;
  onDeleteTemplate: (id: string) => void;
  onLoadTemplate: (template: SignatureTemplate) => void;
  onComplete: () => void;
  actionButtonText: string;
}

export function SignatureBuilder({ 
  mode,
  csvHeaders, 
  csvData, 
  builderState,
  setBuilderState,
  undo,
  redo,
  canUndo,
  canRedo,
  savedColors,
  setSavedColors,
  customFonts,
  setCustomFonts,
  savedTemplates,
  onSaveTemplate,
  onDeleteTemplate,
  onLoadTemplate,
  onComplete,
  actionButtonText
}: SignatureBuilderProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [editingTextItem, setEditingTextItem] = useState<TextItem | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const { rows, maxWidth, tableProperties } = builderState;

  useEffect(() => {
    // Inject custom font stylesheets into the document head for live preview
    const fontFaceStyleId = 'custom-fonts-style-fontface';
    let fontFaceStyleTag = document.getElementById(fontFaceStyleId) as HTMLStyleElement;
    if (!fontFaceStyleTag) {
        fontFaceStyleTag = document.createElement('style');
        fontFaceStyleTag.id = fontFaceStyleId;
        document.head.appendChild(fontFaceStyleTag);
    }
    const fontFaces = customFonts
        .filter(font => font.source === 'url')
        .map(font => `@font-face { font-family: '${font.name}'; src: url('${font.url}'); }`)
        .join('\n');
    fontFaceStyleTag.innerHTML = fontFaces;
    
    customFonts.filter(font => font.source === 'google').forEach(font => {
        const linkId = `google-font-${font.name.replace(/\s+/g, '-')}`;
        if (!document.getElementById(linkId)) {
            const linkTag = document.createElement('link');
            linkTag.id = linkId;
            linkTag.rel = 'stylesheet';
            linkTag.href = font.url;
            document.head.appendChild(linkTag);
        }
    });

  }, [customFonts]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      // Press and hold for 250ms to start a drag
      // This allows for scrolling on touch devices
      activationConstraint: {
          delay: 250,
          tolerance: 5,
      },
    })
  );

  const handleMaxWidthChange = (newWidth: number) => {
    setBuilderState(current => {
      const previousWidth = current.maxWidth;
      let newRows = current.rows;
      if (previousWidth !== newWidth && newWidth > 0 && previousWidth > 0) {
        newRows = current.rows.map(row => {
            const gapSize = current.tableProperties.cellSpacing || 0;
            const gaps = row.cells.length > 1 ? (row.cells.length - 1) * gapSize : 0;
            
            const previousAvailableWidth = previousWidth - gaps;
            const newAvailableWidth = newWidth - gaps;

            if (previousAvailableWidth <= 0 || newAvailableWidth <= 0) {
                return row; // Can't scale, return original row
            }

            const scaleFactor = newAvailableWidth / previousAvailableWidth;

            return {
                ...row,
                cells: row.cells.map(cell => ({
                  ...cell,
                  // Only scale cells with an explicit width. 'auto' (width=0) cells will be handled by flexbox.
                  width: cell.width > 0 ? Math.round(cell.width * scaleFactor) : 0,
                })),
            };
        });
      }
      return {
        ...current,
        maxWidth: newWidth,
        rows: newRows
      };
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    const isSidebarItem = !!active.data.current?.isSidebarItem;

    if (isSidebarItem) {
        const type = active.id as ComponentType;
        const newItem = createNewItem(type, { maxWidth, tableProperties });
        setBuilderState(prev => ({...prev, rows: insertItem(prev.rows, newItem, overId)}));
        setSelectedItemId(newItem.id);
    } else {
        const activeContainerId = findContainerId(rows, activeId);
        const overContainerId = findContainerId(rows, overId);

        if (!activeContainerId || !overContainerId) return;

        if (activeContainerId === 'root' && overContainerId === 'root') {
            const activeIndex = rows.findIndex(r => r.id === activeId);
            const overIndex = rows.findIndex(r => r.id === overId);
            setBuilderState(prev => ({...prev, rows: arrayMove(prev.rows, activeIndex, overIndex)}));
        } 
        else {
            const [treeWithoutItem, movedItem] = removeItem(rows, activeId);
            if (movedItem) {
                const newTree = insertItem(treeWithoutItem, movedItem, overId);
                setBuilderState(prev => ({...prev, rows: newTree}));
            }
        }
    }
  };
  
  const handleUpdateItem = (id: string, updates: Partial<SelectableItem>) => {
    setBuilderState(prev => ({...prev, rows: updateItem(prev.rows, id, updates)}));
  };

  const handleDeleteItem = (id: string) => {
    setBuilderState(prev => ({...prev, rows: removeItem(prev.rows, id)[0] as RowItem[]}));
    if (selectedItemId === id) setSelectedItemId(null);
  };
  
  const handleConfirmSave = (name: string) => {
      onSaveTemplate(name);
      setIsSaveModalOpen(false);
      alert(`Template "${name}" saved!`);
  };

  const selectedItem = findItem(rows, selectedItemId || '');
  const activeItem = findItem(rows, activeId || '');
  const isSidebarComponent = SIDEBAR_COMPONENTS.some(c => c.type === activeId);
  
  const collisionDetectionStrategy: CollisionDetection = React.useCallback(
    (args) => {
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) return pointerCollisions;
      return rectIntersection(args);
    },
    []
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-bold">{mode === 'bulk' ? 'Step 2: Design Signature Template' : 'Design Your Signature'}</h2>
            <div className="flex-grow"></div>
            <div className="flex flex-wrap items-center gap-2">
                <button onClick={undo} disabled={!canUndo} title="Undo" className="px-3 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-slate-300 hover:-translate-y-0.5 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none">
                    <UndoIcon />
                </button>
                <button onClick={redo} disabled={!canRedo} title="Redo" className="px-3 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-slate-300 hover:-translate-y-0.5 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none">
                    <RedoIcon />
                </button>
                <div className="h-8 w-px bg-slate-300 mx-1"></div>
                <button onClick={() => setIsTemplateLibraryOpen(true)} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-slate-300 hover:-translate-y-0.5">
                    Load Template
                </button>
                 <button onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-blue-700 hover:-translate-y-0.5">
                    Save as Template
                </button>
                <button onClick={onComplete} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:bg-green-700 hover:-translate-y-0.5">
                    {actionButtonText}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-2">
            <Sidebar />
            </div>
            <div className="lg:col-span-6">
              <div className="bg-white rounded-lg shadow-lg p-4 min-h-[400px] flex flex-col">
                  <div className="flex flex-wrap justify-between items-center mb-4 border-b pb-2 gap-4">
                      <h2 className="text-lg font-semibold">Canvas</h2>
                      <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                             <label className="text-sm font-medium">Border:</label>
                             <input type="number" value={tableProperties.border} onChange={e => setBuilderState(p => ({...p, tableProperties: {...p.tableProperties, border: Number(e.target.value)}}))} className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" min="0" />
                          </div>
                          <div className="flex items-center gap-2">
                             <label className="text-sm font-medium">Spacing:</label>
                             <input type="number" value={tableProperties.cellSpacing} onChange={e => setBuilderState(p => ({...p, tableProperties: {...p.tableProperties, cellSpacing: Number(e.target.value)}}))} className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" min="0" />
                          </div>
                          <div className="flex items-center gap-2">
                              <label className="text-sm font-medium">Max Width:</label>
                              <input type="number" value={maxWidth} onChange={e => handleMaxWidthChange(Number(e.target.value))} className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                              <span>px</span>
                          </div>
                      </div>
                  </div>
                  <div className="overflow-x-auto -mx-4 px-4 flex-grow">
                    <div className="rounded-md bg-slate-50 border h-full">
                      <Canvas
                        rows={rows}
                        selectedItemId={selectedItemId}
                        setSelectedItemId={setSelectedItemId}
                        deleteItem={handleDeleteItem}
                        tableProperties={tableProperties}
                        maxWidth={maxWidth}
                      />
                    </div>
                  </div>
              </div>
              <div className="mt-8">
                  <Preview items={rows} maxWidth={maxWidth} tableProperties={tableProperties} customFonts={customFonts} data={csvHeaders.length > 0 ? csvData[0] : undefined} />
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-8">
                <PropertiesPanel
                    item={selectedItem}
                    updateItem={handleUpdateItem}
                    csvHeaders={csvHeaders}
                    maxWidth={maxWidth}
                    savedColors={savedColors}
                    setSavedColors={setSavedColors}
                    customFonts={customFonts}
                    setCustomFonts={setCustomFonts}
                    onOpenWysiwyg={setEditingTextItem}
                    mode={mode}
                    tableProperties={tableProperties}
                />
              </div>
            </div>
        </div>
      </div>
       <DragOverlay>
        {activeId ? (
            isSidebarComponent ? 
              <SidebarItem component={{ type: activeId as ComponentType, label: SIDEBAR_COMPONENTS.find(c => c.type === activeId)?.label || '' }} /> :
            activeItem?.type === 'row' ?
              <p>Moving Row...</p> :
            activeItem ?
             <div className="bg-white p-2 shadow-lg rounded-md">Component</div> :
            null
        ) : null}
      </DragOverlay>

      {isTemplateLibraryOpen && (
        <TemplateLibrary
            presets={presets}
            userTemplates={savedTemplates}
            onLoad={(template) => {
                onLoadTemplate(template);
                setIsTemplateLibraryOpen(false);
            }}
            onDelete={onDeleteTemplate}
            onClose={() => setIsTemplateLibraryOpen(false)}
        />
      )}
      
      {isSaveModalOpen && (
        <SaveTemplateModal
          onSave={handleConfirmSave}
          onClose={() => setIsSaveModalOpen(false)}
        />
      )}

      {editingTextItem && (
        <WysiwygEditor
            initialContent={editingTextItem.content}
            onSave={(newContent) => {
                handleUpdateItem(editingTextItem.id, { content: newContent });
                setEditingTextItem(null);
            }}
            onClose={() => setEditingTextItem(null)}
        />
      )}
    </DndContext>
  );
}
