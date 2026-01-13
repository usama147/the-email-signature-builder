
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Cell, SignatureItem, RowItem, TableProperties, ComponentType } from '../types';
import { TextComponent, ImageComponent, SocialsComponent, IconsComponent, SpacerComponent, DividerComponent, ButtonComponent } from './signature-components';
import { DragHandleIcon, TrashIcon } from './icons';
import { CanvasRow } from './CanvasRow';

// Circular dependency possible if not handled carefuly. CanvasRow imports CanvasCell.
// To avoid runtime issues, CanvasRow should be passed down or imported dynamically if needed, 
// but React components usually handle cyclic imports fine if exported correctly.

// We need to pass down the props required for CanvasRow
interface RecursionProps {
    selectedItemId: string | null;
    setSelectedItemId: (id: string | null) => void;
    deleteItem: (id: string) => void;
    tableProperties?: TableProperties; // Make optional as it might be passed implicitly or we need context
}

interface ComponentWrapperProps extends RecursionProps {
  item: SignatureItem;
  isSelected: boolean;
  onDelete: () => void;
  onClick: () => void;
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({ item, isSelected, onDelete, onClick, ...recursionProps }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const isFullWidthComponent = item.type === ComponentType.Spacer || item.type === ComponentType.Divider || item.type === ComponentType.Row || item.type === ComponentType.Container;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    alignSelf: isFullWidthComponent ? 'stretch' : 'auto',
    paddingTop: item.paddingTop ?? 0,
    paddingRight: item.paddingRight ?? 0,
    paddingBottom: item.paddingBottom ?? 0,
    paddingLeft: item.paddingLeft ?? 0,
  };

  const renderComponent = () => {
    switch (item.type) {
      case 'text': return <TextComponent {...item} />;
      case 'image': return <ImageComponent {...item} />;
      case 'socials': return <SocialsComponent {...item} />;
      case 'icons': return <IconsComponent {...item} />;
      case 'spacer': return <SpacerComponent {...item} />;
      case 'divider': return <DividerComponent {...item} />;
      case 'button': return <ButtonComponent {...item} />;
      case 'row': 
      case 'container':
        return (
            <CanvasRow 
                row={item as RowItem} 
                selectedItemId={recursionProps.selectedItemId}
                setSelectedItemId={recursionProps.setSelectedItemId}
                deleteItem={recursionProps.deleteItem}
                tableProperties={recursionProps.tableProperties || { border: 0, cellSpacing: 0 }} 
            />
        );
      default: return <div>Unknown component</div>;
    }
  };

  const containerClasses = `relative group border-2 rounded-md transition-all min-h-[24px] ${
    isSelected ? 'border-[--primary] bg-[--primary]/10' : 'border-transparent hover:border-[--primary]/50 hover:bg-[--primary]/5'
  } ${isFullWidthComponent ? 'w-full' : ''}`;

  return (
    <div ref={setNodeRef} style={style} className={containerClasses} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Label on Hover/Select */}
      <div
        className={`absolute -top-3 left-2 px-1.5 py-0.5 text-[10px] leading-tight rounded-sm z-20 pointer-events-none transition-opacity ${
          isSelected ? 'bg-[--primary] text-[--primary-text] opacity-100' : 'bg-[--surface-inset] text-[--text-color-secondary] opacity-0 group-hover:opacity-100'
        }`}
      >
        {item.displayName || item.type}
      </div>

      <div className="absolute top-1/2 -left-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button {...attributes} {...listeners} className="cursor-grab p-1 text-[--text-color-light] hover:text-[--text-color]">
          <DragHandleIcon />
        </button>
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-[--danger-surface] text-[--danger] rounded-full hover:bg-[--danger] hover:text-white">
          <TrashIcon />
        </button>
      </div>
      {renderComponent()}
    </div>
  );
}


interface CanvasCellProps {
  cell: Cell;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  deleteItem: (id: string) => void;
  tableProperties?: TableProperties; // Optional to support passing down
}

export function CanvasCell({ cell, selectedItemId, setSelectedItemId, deleteItem, tableProperties }: CanvasCellProps) {
  const { setNodeRef } = useDroppable({
    id: cell.id,
  });

  const itemIds = React.useMemo(() => cell.items.map(i => i.id), [cell.items]);
  const isSelected = selectedItemId === cell.id;
  
  const paddingTop = cell.paddingTop ?? 0;
  const paddingRight = cell.paddingRight ?? 0;
  const paddingBottom = cell.paddingBottom ?? 0;
  const paddingLeft = cell.paddingLeft ?? 0;

  const isRowDirection = cell.direction === 'row';

  const styles: React.CSSProperties = {
      display: 'flex',
      flexDirection: isRowDirection ? 'row' : 'column',
      gap: '0px',
      justifyContent: cell.justifyContent || 'flex-start', // Use new justifyContent property
      alignItems: cell.alignItems || 'flex-start',

      borderTop: `${cell.borders.borderTop}px solid ${cell.borders.borderColor}`,
      borderRight: `${cell.borders.borderRight}px solid ${cell.borders.borderColor}`,
      borderBottom: `${cell.borders.borderBottom}px solid ${cell.borders.borderColor}`,
      borderLeft: `${cell.borders.borderLeft}px solid ${cell.borders.borderColor}`,
      borderRadius: `${cell.borders.borderRadius}px`,
      padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
      backgroundColor: cell.backgroundColor || 'transparent',
      height: cell.height ? `${cell.height}px` : 'auto',
      flexWrap: 'wrap', 
      minHeight: cell.items.length === 0 ? '50px' : 'auto', // Visual height for empty cells
  };
  
  // Legacy mapping (fallback) if justifyContent isn't set but alignment logic is needed based on old hAlign/vAlign logic
  // However, we now prefer using justifyContent directly.
  // The 'justifyContent' prop controls distribution on main axis.
  // 'alignItems' controls alignment on cross axis.
  
  // Just in case we need to map old properties:
  if (!cell.justifyContent) {
      if (isRowDirection) {
           styles.justifyContent = cell.hAlign === 'center' ? 'center' : cell.hAlign === 'right' ? 'flex-end' : 'flex-start';
      } else {
           styles.justifyContent = cell.vAlign === 'middle' ? 'center' : cell.vAlign === 'bottom' ? 'flex-end' : 'flex-start';
      }
  }

  // Cross axis default logic if not explicitly set
  if (!cell.alignItems) {
      if (isRowDirection) {
          styles.alignItems = cell.vAlign === 'middle' ? 'center' : cell.vAlign === 'bottom' ? 'flex-end' : 'flex-start';
      } else {
          styles.alignItems = cell.hAlign === 'center' ? 'center' : cell.hAlign === 'right' ? 'flex-end' : 'flex-start';
      }
  }


  const containerClasses = `relative group rounded-md border-2 transition-colors ${
    isSelected ? 'border-[--primary] bg-[--primary]/10' : cell.items.length === 0 ? 'border-dashed border-[--border-color-heavy] bg-[--surface-tertiary] hover:border-[--primary] hover:bg-[--surface-inset]' : 'border-dashed border-transparent hover:border-[--border-color] hover:bg-[--surface-secondary]/20'
  }`;

  const wrapperStyle = {
      ...styles,
      backgroundColor: cell.backgroundColor || (isSelected ? undefined : undefined)
  }

  const sortingStrategy = isRowDirection ? horizontalListSortingStrategy : verticalListSortingStrategy;

  return (
    <div
      ref={setNodeRef}
      className={containerClasses}
      style={wrapperStyle}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedItemId(cell.id);
        }}
        className={`absolute -top-[1px] left-1/2 -translate-x-1/2 px-2 py-0 text-xs rounded-b-md cursor-pointer transition-colors z-20 ${
          isSelected ? 'bg-[--primary] text-[--primary-text]' : 'bg-[--surface-inset] text-[--text-color-secondary] group-hover:bg-[--primary] group-hover:text-[--primary-text] group-hover:opacity-80'
        }`}
      >
        {cell.displayName || 'Cell'}
      </div>

      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={(e) => { e.stopPropagation(); deleteItem(cell.id); }} className="p-1.5 bg-[--danger-surface] text-[--danger] rounded-full hover:bg-[--danger] hover:text-white">
              <TrashIcon />
          </button>
      </div>
      <SortableContext items={itemIds} strategy={sortingStrategy}>
        {cell.items.length > 0 ? (
        cell.items.map((item) => (
            <ComponentWrapper 
                key={item.id} 
                item={item}
                isSelected={selectedItemId === item.id}
                onDelete={() => deleteItem(item.id)}
                onClick={() => setSelectedItemId(item.id)}
                selectedItemId={selectedItemId}
                setSelectedItemId={setSelectedItemId}
                deleteItem={deleteItem}
                tableProperties={tableProperties}
            />
        ))
        ) : (
        <div 
            className="flex-grow flex items-center justify-center text-[--text-color-light] text-center text-xs p-2 select-none cursor-pointer w-full h-full min-h-[50px]"
            onClick={(e) => { e.stopPropagation(); setSelectedItemId(cell.id); }}
        >
            Drag & Drop Components
        </div>
        )}
      </SortableContext>
    </div>
  );
}
