
import { v4 as uuidv4 } from 'uuid';
import {
  ComponentType,
  TextItem,
  ImageItem,
  SocialsItem,
  SpacerItem,
  DividerItem,
  ButtonItem,
  RowItem,
  SelectableItem,
  BorderProperties,
  TableProperties,
} from '../types';

const defaultBorders: BorderProperties = {
  borderTop: 0,
  borderRight: 0,
  borderBottom: 0,
  borderLeft: 0,
  borderColor: '#000000',
  borderRadius: 0,
};

export function createNewItem(type: ComponentType, options: { maxWidth?: number, tableProperties?: TableProperties } = {}): SelectableItem {
  const base = { id: uuidv4() };
  switch (type) {
    case ComponentType.Text:
      return {
        ...base,
        type: ComponentType.Text,
        content: 'Your Name | Your Title',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#333333',
        link: '',
        fontFamily: 'Arial',
      } as TextItem;
    case ComponentType.Image:
      return {
        ...base,
        type: ComponentType.Image,
        src: 'https://picsum.photos/120/80',
        alt: 'Company Logo',
        width: 120,
        link: '',
      } as ImageItem;
    case ComponentType.Socials:
      return {
        ...base,
        type: ComponentType.Socials,
        links: [
          { id: uuidv4(), network: 'linkedin', url: 'https://linkedin.com', iconType: 'prebuilt', width: 24, height: 24 },
          { id: uuidv4(), network: 'twitter', url: 'https://twitter.com', iconType: 'prebuilt', width: 24, height: 24 },
        ],
        iconColor: '#555555',
      } as SocialsItem;
    case ComponentType.Spacer:
      return {
        ...base,
        type: ComponentType.Spacer,
        height: 10,
      } as SpacerItem;
    case ComponentType.Divider:
        return {
            ...base,
            type: ComponentType.Divider,
            height: 1,
            color: '#cccccc'
        } as DividerItem;
    case ComponentType.Button:
        return {
            ...base,
            type: ComponentType.Button,
            text: 'Book a Meeting',
            link: 'https://example.com',
            backgroundColor: '#007bff',
            textColor: '#ffffff',
            fontSize: 14,
            fontWeight: 'bold',
            borderRadius: 5,
            fontFamily: 'Arial',
        } as ButtonItem;
    case ComponentType.Row:
        const numCells = 2;
        const gapSize = options.tableProperties?.cellSpacing || 0;
        const gaps = numCells > 1 ? (numCells - 1) * gapSize : 0;
        const availableWidth = (options.maxWidth || 0) - gaps;
        const cellWidth = availableWidth > 0 ? Math.floor(availableWidth / numCells) : 0;
        const createCell = () => ({
            id: uuidv4(),
            type: 'cell' as 'cell',
            items: [],
            width: cellWidth,
            vAlign: 'top' as 'top',
            hAlign: 'left' as 'left',
            borders: { ...defaultBorders },
            paddingTop: undefined,
            paddingRight: undefined,
            paddingBottom: undefined,
            paddingLeft: undefined,
        });
        return {
            ...base,
            type: ComponentType.Row,
            cells: [createCell(), createCell()],
            borders: { ...defaultBorders },
            paddingTop: 0,
            paddingBottom: 0,
        } as RowItem;
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
}
