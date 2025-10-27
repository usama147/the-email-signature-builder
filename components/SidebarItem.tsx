
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
      className="bg-slate-100 p-3 rounded-md border border-slate-200 cursor-grab transition-all duration-200 ease-in-out hover:bg-slate-200 hover:border-slate-300 hover:shadow-md hover:scale-105 active:cursor-grabbing"
    >
      <p className="text-center font-medium text-sm text-slate-700">{component.label}</p>
    </div>
  );
}