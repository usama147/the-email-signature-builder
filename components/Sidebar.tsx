
import React from 'react';
import { SidebarItem } from './SidebarItem';
import { SIDEBAR_COMPONENTS } from '../constants';

export function Sidebar() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4 border-b pb-2">Components</h2>
      <div className="space-y-2">
        {SIDEBAR_COMPONENTS.map((component) => (
          <div key={component.type}>
            <SidebarItem component={component} />
          </div>
        ))}
      </div>
    </div>
  );
}
