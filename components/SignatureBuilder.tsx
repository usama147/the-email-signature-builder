import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  closestCorners,
  getFirstCollision,
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
import { parseHtmlToState } from '../utils/htmlParser';
import { BuilderState } from '../BulkCreatorPage';
import { Theme } from '../App';

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
  setSavedColors: (updater: React.SetStateAction<string[]>) => void;
  customFonts: CustomFont[];
  setCustomFonts: (updater: React.SetStateAction<CustomFont[]>) => void;
  savedTemplates: SignatureTemplate[];
  onSaveTemplate: (name: string) => void;
  onDeleteTemplate: (id: string) => void;
  onLoadTemplate: (template: SignatureTemplate) => void;
  onImportTemplates: (templates: SignatureTemplate[]) => void;
  onComplete: () => void;
  actionButtonText: string;
  theme: Theme;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
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
  onImportTemplates,
  onComplete,
  actionButtonText,
  theme
}: SignatureBuilderProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  
  // Generic WYSIWYG state
  const [wysiwygState, setWysiwygState] = useState<{
      content: string;
      onSave: (newContent: string) => void;
  } | null>(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [htmlError, setHtmlError] = useState<string | null>(null);

  const { rows, maxWidth, tableProperties } = builderState;

    const debouncedUpdate = useCallback(
        debounce((html: string) => {
            try {
                if (!html.trim()) {
                    setBuilderState(prev => ({...prev, rows: []}));
                    setHtmlError(null);
                    return;
                }
                const { builderState: newState, customFonts: parsedFonts } = parseHtmlToState(html);
                setBuilderState(current => ({
                    ...current,
                    ...newState
                }));

                if (parsedFonts.length > 0) {
                    setCustomFonts((currentFonts: CustomFont[]) => {
                        const newFonts = [...currentFonts];
                        parsedFonts.forEach(parsedFont => {
                            // Add if a font with the same raw CSS doesn't already exist
                            if (!newFonts.some(f => f.rawCss && f.rawCss === parsedFont.rawCss)) {
                                newFonts.push(parsedFont);
                            }
                        });
                        return newFonts;
                    });
                }

                setHtmlError(null);
            } catch (e: any) {
                console.error("HTML parsing failed:", e);
                setHtmlError(e.message || "Failed to parse HTML. The structure might be invalid.");
            }
        }, 500),
        [setBuilderState, setCustomFonts]
    );

  const handleHtmlUpdate = (html: string) => {
    debouncedUpdate(html);
  };


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
        .map(font => {
            if (font.rawCss) {
                return font.rawCss;
            }
            return `@font-face { font-family: '${font.name}'; src: url('${font.url}'); }`;
        })
        .join('\n');
    fontFaceStyleTag.innerHTML = fontFaces;
    
    customFonts.filter(font => font.source === 'google').forEach(font => {
        const linkId = `google-font-${font.name.replace(/\s+/g, '-')}`;
        let linkTag = document.getElementById(linkId) as HTMLLinkElement;
        
        if (!linkTag) {
            linkTag = document.createElement('link');
            linkTag.id = linkId;
            linkTag.rel = 'stylesheet';
            document.head.appendChild(linkTag);
        }
        
        // Update the href if it has changed (e.g. weights added)
        if (linkTag.href !== font.url) {
            linkTag.href = font.url;
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
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Check if dragging from sidebar
    const isSidebarItem = !!active.data.current?.isSidebarItem;

    if (isSidebarItem) {
        const type = active.id as ComponentType;
        const newItem = createNewItem(type, { maxWidth, tableProperties });
        
        setBuilderState(prev => ({...prev, rows: insertItem(prev.rows, newItem, overId)}));
        setSelectedItemId(newItem.id);
    } else {
        // Reordering existing items in Canvas
        if (active.id === over.id) return;

        const activeContainerId = findContainerId(rows, activeId);
        const overContainerId = findContainerId(rows, overId);

        if (!activeContainerId || !overContainerId) return;

        // 1. Reordering within the SAME container
        if (activeContainerId === overContainerId) {
            if (activeContainerId === 'root') {
                const oldIndex = rows.findIndex(r => r.id === activeId);
                const newIndex = rows.findIndex(r => r.id === overId);
                setBuilderState(prev => ({...prev, rows: arrayMove(prev.rows, oldIndex, newIndex)}));
            } else {
                // It's inside a cell or container
                setBuilderState(prev => {
                    // Deep update helper to find the container and reorder its items
                    const updateRecursively = (currentRows: RowItem[]): RowItem[] => {
                        return currentRows.map(row => {
                            if (row.id === activeContainerId) {
                                return row;
                            }
                            
                            const newCells = row.cells.map(cell => {
                                if (cell.id === activeContainerId) {
                                    const oldIndex = cell.items.findIndex(i => i.id === activeId);
                                    let newIndex = cell.items.findIndex(i => i.id === overId);
                                    
                                    // Handle drop on empty space of the same cell
                                    if (newIndex === -1 && overId === cell.id) {
                                        newIndex = cell.items.length - 1;
                                    }

                                    if (oldIndex !== -1 && newIndex !== -1) {
                                        return { ...cell, items: arrayMove(cell.items, oldIndex, newIndex) };
                                    }
                                }
                                
                                // Recurse
                                const newItems = cell.items.map(i => {
                                    if (i.type === ComponentType.Row || i.type === ComponentType.Container) {
                                        const updatedNested = updateRecursively([i as RowItem]);
                                        return updatedNested[0];
                                    }
                                    return i;
                                });
                                
                                return { ...cell, items: newItems };
                            });
                            
                            return { ...row, cells: newCells };
                        });
                    };
                    return { ...prev, rows: updateRecursively(prev.rows) };
                });
            }
        } 
        // 2. Moving between DIFFERENT containers
        else {
            const [treeWithoutItem, movedItem] = removeItem(rows, activeId);
            if (movedItem) {
                // Insert into new location
                const newTree = insertItem(treeWithoutItem, movedItem, overId);
                setBuilderState(prev => ({...prev, rows: newTree}));
            }
        }
    }
  };
  
  const handleUpdateItem = (id: string, updates: Partial<SelectableItem>) => {
    setBuilderState(prev => ({...prev, rows: updateItem(prev.rows, id, updates)}));
  };

  const handleSetRows = (newRows: RowItem[]) => {
      setBuilderState(prev => ({...prev, rows: newRows}));
  }

  const handleDeleteItem = (id: string) => {
    setBuilderState(prev => ({...prev, rows: removeItem(prev.rows, id)[0] as RowItem[]}));
    if (selectedItemId === id) setSelectedItemId(null);
  };
  
  const handleConfirmSave = (name: string) => {
      onSaveTemplate(name);
      setIsSaveModalOpen(false);
      alert(`Template "${name}" saved!`);
  };

  const handleOpenWysiwyg = (initialContent: string, onSave: (content: string) => void) => {
      setWysiwygState({ content: initialContent, onSave });
  };

  const selectedItem = findItem(rows, selectedItemId || '');
  const activeItem = findItem(rows, activeId || '');
  const isSidebarComponent = SIDEBAR_COMPONENTS.some(c => c.type === activeId);
  
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // First, try pointerWithin to handle small targets better
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) {
        return pointerCollisions;
      }
      // Fallback to rectIntersection
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
      <div className="space-y-6">
        <div className="bg-[--surface] p-6 rounded-[--radius] shadow-[--shadow-1] flex flex-wrap items-center justify-between gap-6 border border-[--border-color] transition-all duration-300" data-glass>
            <h2 className="text-xl font-black">{mode === 'bulk' ? 'Design Signature Template' : 'Design Your Signature'}</h2>
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={undo} disabled={!canUndo} title="Undo" className="btn btn-icon btn-secondary">
                      <UndoIcon />
                  </button>
                  <button onClick={redo} disabled={!canRedo} title="Redo" className="btn btn-icon btn-secondary">
                      <RedoIcon />
                  </button>
                </div>
                <div className="h-8 w-px bg-[--border-color] mx-2"></div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => setIsTemplateLibraryOpen(true)} className="btn btn-secondary">
                      Load Template
                  </button>
                   <button onClick={() => setIsSaveModalOpen(true)} className="btn btn-secondary">
                      Save as Template
                  </button>
                  <button onClick={onComplete} className="btn btn-primary">
                      {actionButtonText}
                  </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-2">
                <Sidebar 
                    rows={rows} 
                    selectedItemId={selectedItemId} 
                    setSelectedItemId={setSelectedItemId} 
                    updateItem={handleUpdateItem}
                    setRows={handleSetRows}
                />
            </div>
            <div className="lg:col-span-6">
              <div className="bg-[--surface] rounded-[--radius] shadow-[--shadow-2] p-6 min-h-[400px] flex flex-col border border-[--border-color] transition-all duration-300" data-glass>
                  <div className="flex flex-wrap justify-between items-center mb-6 border-b border-[--border-color] pb-4 gap-4">
                      <h2 className="text-lg font-bold">Canvas</h2>
                      <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                             <label className="text-sm font-semibold opacity-70">Border:</label>
                             <input type="number" value={tableProperties.border} onChange={e => setBuilderState(p => ({...p, tableProperties: {...p.tableProperties, border: Number(e.target.value)}}))} className="input-field w-16 px-2 py-1" min="0" />
                          </div>
                          <div className="flex items-center gap-2">
                             <label className="text-sm font-semibold opacity-70">Spacing:</label>
                             <input type="number" value={tableProperties.cellSpacing} onChange={e => setBuilderState(p => ({...p, tableProperties: {...p.tableProperties, cellSpacing: Number(e.target.value)}}))} className="input-field w-16 px-2 py-1" min="0" />
                          </div>
                          <div className="flex items-center gap-2">
                              <label className="text-sm font-semibold opacity-70">Max Width:</label>
                              <input type="number" value={maxWidth} onChange={e => handleMaxWidthChange(Number(e.target.value))} className="input-field w-20 px-2 py-1" />
                              <span className="text-sm opacity-50 font-bold">px</span>
                          </div>
                      </div>
                  </div>
                  <div className="overflow-x-auto -mx-4 px-4 flex-grow">
                    <div className="rounded-[--radius] bg-[--surface-secondary] border border-[--border-color] h-full transition-all duration-300 p-2">
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
                  <Preview items={rows} maxWidth={maxWidth} tableProperties={tableProperties} customFonts={customFonts} data={csvHeaders.length > 0 ? csvData[0] : undefined} onHtmlUpdate={handleHtmlUpdate} />
                   {htmlError && (
                    <div className="mt-4 p-4 bg-[--danger-surface] border border-[--danger] text-[--danger-text] rounded-[--radius] text-sm">
                        <strong className="block mb-1">HTML Error:</strong> {htmlError}
                    </div>
                   )}
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-28">
                <PropertiesPanel
                    item={selectedItem}
                    updateItem={handleUpdateItem}
                    csvHeaders={csvHeaders}
                    maxWidth={maxWidth}
                    savedColors={savedColors}
                    setSavedColors={setSavedColors}
                    customFonts={customFonts}
                    setCustomFonts={setCustomFonts}
                    onOpenWysiwyg={handleOpenWysiwyg}
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
            activeItem?.type === 'row' || activeItem?.type === 'container' ?
              <div className="bg-[--surface] p-4 shadow-[--shadow-2] rounded-[--radius] border border-[--border-color] font-bold text-[--primary]">{activeItem.displayName || (activeItem?.type === 'row' ? 'Row' : 'Container')}</div> :
            activeItem ?
             <div className="bg-[--surface] p-4 shadow-[--shadow-2] rounded-[--radius] border border-[--border-color] font-bold text-[--primary]">{activeItem.displayName || 'Component'}</div> :
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
            onImport={onImportTemplates}
            onClose={() => setIsTemplateLibraryOpen(false)}
            theme={theme}
        />
      )}
      
      {isSaveModalOpen && (
        <SaveTemplateModal
          onSave={handleConfirmSave}
          onClose={() => setIsSaveModalOpen(false)}
          theme={theme}
        />
      )}

      {wysiwygState && (
        <WysiwygEditor
            initialContent={wysiwygState.content}
            onSave={(newContent) => {
                wysiwygState.onSave(newContent);
                setWysiwygState(null);
            }}
            onClose={() => setWysiwygState(null)}
            theme={theme}
        />
      )}
    </DndContext>
  );
}
