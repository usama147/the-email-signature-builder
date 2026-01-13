
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RowItem, TableProperties, ComponentType, ContainerItem } from '../types';
import { DragHandleIcon, TrashIcon } from './icons';
import { CanvasCell } from './CanvasCell';

interface CanvasRowProps {
  row: RowItem | ContainerItem; // This now also supports ContainerItem since it is structure-compatible
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
  const isContainer = row.type === ComponentType.Container;

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
    backgroundColor: row.backgroundColor || 'transparent',
  };

  const containerClasses = `relative group rounded-md transition-all duration-300 bg-[--surface] ${
    isSelected ? 'ring-2 ring-[--primary] ring-offset-2' : 'hover:outline-2 hover:outline-dashed hover:outline-[--border-color-heavy]'
  }`;

  const wrapperStyle = {
      ...rowStyles,
      backgroundColor: row.backgroundColor || (isSelected ? undefined : undefined)
  }
  
  const label = row.displayName || (isContainer ? 'Container' : 'Row');

  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      className={containerClasses}
    >
        <div
            onClick={(e) => {
                e.stopPropagation();
                setSelectedItemId(row.id);
            }}
            className={`absolute top-1 left-1 px-2 py-0 text-xs rounded-md cursor-pointer transition-colors z-20 ${
              isSelected ? 'bg-[--primary] text-[--primary-text]' : 'bg-[--surface-inset] text-[--text-color-secondary] group-hover:bg-[--primary] group-hover:text-[--primary-text] group-hover:opacity-80'
            }`}
        >
            {label}
        </div>
        <div className="absolute top-1/2 -left-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button {...attributes} {...listeners} className="cursor-grab p-1 text-[--text-color-light] hover:text-[--text-color]">
            <DragHandleIcon />
            </button>
        </div>
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={(e) => { e.stopPropagation(); deleteItem(row.id); }} className="p-1.5 bg-[--danger-surface] text-[--danger] rounded-full hover:bg-[--danger] hover:text-white">
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
                    tableProperties={tableProperties}
                />
            </div>
        );
        })}
    </div>
  );
}
