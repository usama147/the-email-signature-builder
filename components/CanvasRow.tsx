
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RowItem, TableProperties } from '../types';
import { DragHandleIcon, TrashIcon } from './icons';
import { CanvasCell } from './CanvasCell';

interface CanvasRowProps {
  row: RowItem;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  deleteItem: (id: string) => void;
  tableProperties: TableProperties;
}

export const CanvasRow: React.FC<CanvasRowProps> = ({ row, selectedItemId, setSelectedItemId, deleteItem, tableProperties }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });

  const isSelected = selectedItemId === row.id;

  const rowStyles: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
    display: 'inline-flex',
    minWidth: '100%',
    gap: `${tableProperties.cellSpacing}px`,
    borderTop: `${row.borders.borderTop}px solid ${row.borders.borderColor}`,
    borderRight: `${row.borders.borderRight}px solid ${row.borders.borderColor}`,
    borderBottom: `${row.borders.borderBottom}px solid ${row.borders.borderColor}`,
    borderLeft: `${row.borders.borderLeft}px solid ${row.borders.borderColor}`,
    borderRadius: `${row.borders.borderRadius}px`,
    paddingTop: `${row.paddingTop || 0}px`,
    paddingBottom: `${row.paddingBottom || 0}px`,
  };

  const containerClasses = `relative group rounded-md transition-all bg-white ${
    isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:outline-2 hover:outline-dashed hover:outline-slate-400'
  }`;

  return (
    <div
      ref={setNodeRef}
      style={rowStyles}
      className={containerClasses}
    >
        <div
            onClick={(e) => {
                e.stopPropagation();
                setSelectedItemId(row.id);
            }}
            className={`absolute top-1 left-1 px-2 py-0 text-xs rounded-md cursor-pointer transition-colors z-20 ${
              isSelected ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-700 group-hover:bg-blue-400 group-hover:text-white'
            }`}
        >
            Row
        </div>
        <div className="absolute top-1/2 -left-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button {...attributes} {...listeners} className="cursor-grab p-1 text-slate-500 hover:text-slate-800">
            <DragHandleIcon />
            </button>
        </div>
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={(e) => { e.stopPropagation(); deleteItem(row.id); }} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-500 hover:text-white">
            <TrashIcon />
            </button>
        </div>

        {row.cells.map((cell) => {
        const cellStyle: React.CSSProperties = {};
        if (cell.width > 0) {
            cellStyle.flex = `0 0 ${cell.width}px`;
        } else {
            cellStyle.flex = `1 1 0%`;
        }
        return (
            <div key={cell.id} style={cellStyle}>
                <CanvasCell
                cell={cell}
                selectedItemId={selectedItemId}
                setSelectedItemId={setSelectedItemId}
                deleteItem={deleteItem}
                />
            </div>
        );
        })}
    </div>
  );
}
