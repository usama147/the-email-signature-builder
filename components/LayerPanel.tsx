
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RowItem, Cell, SignatureItem, ComponentType } from '../types';
import { findContainerId, insertItem, removeItem, updateItem } from '../utils/itemUtils';
import { DragHandleIcon } from './icons';

interface LayerPanelProps {
  rows: RowItem[];
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  updateItem: (id: string, updates: any) => void;
  setRows: (newRows: RowItem[]) => void;
}

const SortableLayerItem = ({ id, children, depth = 0, isSelected, onClick, onToggle, isExpanded, hasChildren }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    paddingLeft: `${depth * 12 + 8}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center py-2 pr-2 border-b border-[--border-color] text-sm group ${isSelected ? 'bg-[--primary]/10 text-[--primary]' : 'hover:bg-[--surface-secondary] text-[--text-color-secondary]'}`}
      onClick={onClick}
    >
      <div className="mr-1 flex items-center justify-center w-4">
          {hasChildren && (
            <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="text-[--text-color-light] hover:text-[--text-color]"
            >
                {isExpanded ? '▼' : '▶'}
            </button>
          )}
      </div>
      <span className="flex-grow truncate select-none font-medium">
        {children}
      </span>
      <div className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 text-[--text-color-light] hover:text-[--text-color]" {...attributes} {...listeners}>
        <DragHandleIcon />
      </div>
    </div>
  );
};

export function LayerPanel({ rows, selectedItemId, setSelectedItemId, updateItem, setRows }: LayerPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNameClick = (id: string, currentName: string) => {
      setSelectedItemId(id);
  };
  
  const handleDoubleClick = (id: string, currentName: string) => {
      setEditingId(id);
      setEditName(currentName);
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditName(e.target.value);
  }

  const handleNameBlur = () => {
      if (editingId) {
          updateItem(editingId, { displayName: editName });
          setEditingId(null);
      }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleNameBlur();
      }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
        // Find containers
        const activeContainerId = findContainerId(rows, active.id as string);
        const overContainerId = findContainerId(rows, over.id as string);

        if (!activeContainerId || !overContainerId) return;

        // If moving within the same container (reordering siblings)
        if (activeContainerId === overContainerId) {
             const updateRecursively = (items: any[]): any[] => {
                 // Check if this level contains the items
                 const activeIndex = items.findIndex(i => i.id === active.id);
                 const overIndex = items.findIndex(i => i.id === over.id);

                 if (activeIndex !== -1 && overIndex !== -1) {
                     return arrayMove(items, activeIndex, overIndex);
                 }

                 // Recurse
                 return items.map(item => {
                     if (item.type === 'row' || item.type === 'container') {
                         return { ...item, cells: updateRecursively(item.cells) };
                     }
                     if (item.type === 'cell') {
                         return { ...item, items: updateRecursively(item.items) };
                     }
                     return item;
                 });
             }
             
             // Root level rows check
             const rootActiveIndex = rows.findIndex(r => r.id === active.id);
             const rootOverIndex = rows.findIndex(r => r.id === over.id);
             
             if (rootActiveIndex !== -1 && rootOverIndex !== -1) {
                 setRows(arrayMove(rows, rootActiveIndex, rootOverIndex));
             } else {
                 setRows(updateRecursively(rows));
             }
        } 
        // Moving between containers (e.g. Item from Cell A to Cell B)
        // For simplicity in this Layer Panel version, we'll implement simple reordering 
        // and only allow moving if it's strictly supported by generic dnd logic
        // But the robust logic is in SignatureBuilder. 
        // Let's reuse logic: remove then insert.
        else {
             const [treeWithoutItem, movedItem] = removeItem(rows, active.id as string);
             if (movedItem) {
                 // Insert into new location
                 // If overId is a container/cell, we append?
                 // Usually dnd-kit gives over.id as the item we hovered over.
                 // So we insert relative to that item.
                 const newTree = insertItem(treeWithoutItem, movedItem, over.id as string);
                 setRows(newTree);
             }
        }
    }
  };

  const renderItem = (item: any, depth = 0) => {
    const hasChildren = (item.type === 'row' || item.type === 'container' || item.type === 'cell') && (item.cells?.length > 0 || item.items?.length > 0);
    const isExpanded = expandedItems[item.id] || false; // Default collapsed
    
    // Default expanded state for rows? Maybe
    if (expandedItems[item.id] === undefined && (item.type === 'row' || item.type === 'container')) {
        // expandedItems[item.id] = true; // Side effect in render is bad, use useEffect or default state init
    }

    return (
        <React.Fragment key={item.id}>
            <SortableLayerItem
                id={item.id}
                depth={depth}
                isSelected={selectedItemId === item.id}
                onClick={() => handleNameClick(item.id, item.displayName)}
                onToggle={() => toggleExpand(item.id)}
                isExpanded={isExpanded}
                hasChildren={hasChildren}
            >
                {editingId === item.id ? (
                    <input 
                        value={editName} 
                        onChange={handleNameChange} 
                        onBlur={handleNameBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="bg-transparent border-b border-[--primary] outline-none w-full"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span onDoubleClick={() => handleDoubleClick(item.id, item.displayName || item.type)}>
                        {item.displayName || item.type}
                    </span>
                )}
            </SortableLayerItem>
            {hasChildren && isExpanded && (
                <SortableContext items={(item.cells || item.items || []).map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                    {(item.cells || item.items || []).map((child: any) => renderItem(child, depth + 1))}
                </SortableContext>
            )}
        </React.Fragment>
    );
  };

  return (
    <div className="bg-[--surface] rounded-lg shadow-[--shadow-2] p-2 border border-[--border-color] h-full overflow-y-auto" data-glass>
      <h3 className="text-sm font-semibold text-[--text-color] mb-2 px-2">Layers</h3>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-0">
                {rows.map(row => renderItem(row, 0))}
            </div>
        </SortableContext>
      </DndContext>
      {rows.length === 0 && <p className="text-xs text-[--text-color-light] p-2 text-center">No components yet.</p>}
    </div>
  );
}
