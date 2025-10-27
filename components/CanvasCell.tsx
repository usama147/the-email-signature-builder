import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Cell, SignatureItem, RowItem, TableProperties, ComponentType } from '../types';
import { TextComponent, ImageComponent, SocialsComponent, SpacerComponent, DividerComponent, ButtonComponent } from './signature-components';
import { DragHandleIcon, TrashIcon } from './icons';

interface ComponentWrapperProps {
  item: SignatureItem;
  isSelected: boolean;
  onDelete: () => void;
  onClick: () => void;
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({ item, isSelected, onDelete, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const isFullWidthComponent = item.type === ComponentType.Spacer || item.type === ComponentType.Divider;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    alignSelf: isFullWidthComponent ? 'stretch' : 'auto',
  };

  const renderComponent = () => {
    switch (item.type) {
      case 'text': return <TextComponent {...item} />;
      case 'image': return <ImageComponent {...item} />;
      case 'socials': return <SocialsComponent {...item} />;
      // FIX: Changed `SpacerItem` to `SpacerComponent` to correctly render the spacer. `SpacerItem` is a type, not a component.
      case 'spacer': return <SpacerComponent {...item} />;
      case 'divider': return <DividerComponent {...item} />;
      case 'button': return <ButtonComponent {...item} />;
      default: return <div>Unknown component</div>;
    }
  };

  const containerClasses = `relative group border-2 p-2 rounded-md transition-all ${
    isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-blue-200'
  } ${isFullWidthComponent ? 'w-full' : ''}`;

  return (
    <div ref={setNodeRef} style={style} className={containerClasses} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <div className="absolute top-1/2 -left-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button {...attributes} {...listeners} className="cursor-grab p-1 text-slate-500 hover:text-slate-800">
          <DragHandleIcon />
        </button>
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-500 hover:text-white">
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
}

export function CanvasCell({ cell, selectedItemId, setSelectedItemId, deleteItem }: CanvasCellProps) {
  const { setNodeRef } = useDroppable({
    id: cell.id,
  });

  const itemIds = React.useMemo(() => cell.items.map(i => i.id), [cell.items]);
  const isSelected = selectedItemId === cell.id;
  
  const paddingTop = cell.paddingTop ?? 0;
  const paddingRight = cell.paddingRight ?? 0;
  const paddingBottom = cell.paddingBottom ?? 0;
  const paddingLeft = cell.paddingLeft ?? 0;

  const styles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      justifyContent: cell.vAlign === 'middle' ? 'center' : cell.vAlign === 'bottom' ? 'flex-end' : 'flex-start',
      alignItems: cell.hAlign === 'center' ? 'center' : cell.hAlign === 'right' ? 'flex-end' : 'flex-start',
      borderTop: `${cell.borders.borderTop}px solid ${cell.borders.borderColor}`,
      borderRight: `${cell.borders.borderRight}px solid ${cell.borders.borderColor}`,
      borderBottom: `${cell.borders.borderBottom}px solid ${cell.borders.borderColor}`,
      borderLeft: `${cell.borders.borderLeft}px solid ${cell.borders.borderColor}`,
      borderRadius: `${cell.borders.borderRadius}px`,
      padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
  };

  const containerClasses = `relative group min-h-[60px] rounded-md border-2 transition-colors ${
    isSelected ? 'border-blue-500 bg-blue-50' : 'border-dashed border-slate-300 bg-slate-100 hover:border-blue-400'
  }`;

  return (
    <div
      ref={setNodeRef}
      className={containerClasses}
      style={styles}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedItemId(cell.id);
        }}
        className={`absolute -top-[1px] left-1/2 -translate-x-1/2 px-2 py-0 text-xs rounded-b-md cursor-pointer transition-colors z-20 ${
          isSelected ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-700 group-hover:bg-blue-400 group-hover:text-white'
        }`}
      >
        Cell
      </div>

      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={(e) => { e.stopPropagation(); deleteItem(cell.id); }} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-500 hover:text-white">
              <TrashIcon />
          </button>
      </div>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {cell.items.length > 0 ? (
        cell.items.map((item) => (
            <ComponentWrapper 
                key={item.id} 
                item={item}
                isSelected={selectedItemId === item.id}
                onDelete={() => deleteItem(item.id)}
                onClick={() => setSelectedItemId(item.id)}
            />
        ))
        ) : (
        <div 
            className="flex-grow flex items-center justify-center min-h-[40px] text-slate-400 text-center text-xs p-2 select-none cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setSelectedItemId(cell.id); }}
        >
            Drop components here
        </div>
        )}
      </SortableContext>
    </div>
  );
}