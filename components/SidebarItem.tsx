
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { SidebarComponent } from '../types';

interface SidebarItemProps {
  component: SidebarComponent;
}

export function SidebarItem({ component }: SidebarItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: component.type,
    data: {
      isSidebarItem: true,
      type: component.type,
    },
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-[--surface-tertiary] p-3 rounded-md border border-[--border-color] cursor-grab transition-all duration-200 ease-in-out hover:bg-[--border-color] hover:border-[--border-color-heavy] shadow-[--shadow-1] hover:shadow-[--shadow-2] hover:scale-105 active:cursor-grabbing active:shadow-[--shadow-inset] active:scale-95 liquid-hover"
      data-glass
    >
      <p className="text-center font-medium text-sm text-[--text-color-secondary]">{component.label}</p>
    </div>
  );
}