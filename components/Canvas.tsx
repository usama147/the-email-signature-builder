
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { RowItem, TableProperties } from '../types';
import { CanvasRow } from './CanvasRow';

interface CanvasProps {
  rows: RowItem[];
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  deleteItem: (id:string) => void;
  tableProperties: TableProperties;
  maxWidth: number;
}

export function Canvas({ rows, selectedItemId, setSelectedItemId, deleteItem, tableProperties, maxWidth }: CanvasProps) {
  const { setNodeRef } = useDroppable({
    id: 'root',
  });

  const rowIds = React.useMemo(() => rows.map(r => r.id), [rows]);

  return (
    <div 
        ref={setNodeRef} 
        className={`min-h-full h-full space-y-4 p-2`}
        style={{ width: `${maxWidth}px`}}
    >
       <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
        {rows.length > 0 ? (
            rows.map((row) => (
                <CanvasRow
                    key={row.id}
                    row={row}
                    selectedItemId={selectedItemId}
                    setSelectedItemId={setSelectedItemId}
                    deleteItem={deleteItem}
                    tableProperties={tableProperties}
                />
            ))
        ) : (
            <div className="flex items-center justify-center h-full text-[--text-color-light] p-10 text-center">
                <p>Drag a 'Row' component from the sidebar to get started.</p>
            </div>
        )}
       </SortableContext>
    </div>
  );
}