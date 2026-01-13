
import { ComponentType, SidebarComponent } from './types';

export const SIDEBAR_COMPONENTS: SidebarComponent[] = [
  { type: ComponentType.Row, label: 'Row (Columns)' },
  { type: ComponentType.Container, label: 'Container (Nested)' },
  { type: ComponentType.Text, label: 'Text' },
  { type: ComponentType.Image, label: 'Image' },
  { type: ComponentType.Socials, label: 'Social Icons' },
  { type: ComponentType.Icons, label: 'Contact Icons' },
  { type: ComponentType.Spacer, label: 'Spacer' },
  { type: ComponentType.Divider, label: 'Divider' },
  { type: ComponentType.Button, label: 'Button' },
];
