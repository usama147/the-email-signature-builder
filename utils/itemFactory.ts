
import { v4 as uuidv4 } from 'uuid';
import {
  ComponentType,
  TextItem,
  ImageItem,
  SocialsItem,
  IconsItem,
  SpacerItem,
  DividerItem,
  ButtonItem,
  RowItem,
  ContainerItem,
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

const defaultPadding = {
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
};

export function createNewItem(type: ComponentType, options: { maxWidth?: number, tableProperties?: TableProperties } = {}): SelectableItem {
  const base = { id: uuidv4() };
  
  const createCell = (width = 0, index = 1) => ({
    id: uuidv4(),
    type: 'cell' as 'cell',
    displayName: `Column ${index}`,
    items: [],
    width: width,
    height: undefined,
    vAlign: 'top' as 'top',
    hAlign: 'left' as 'left',
    direction: 'column' as 'column',
    alignItems: 'flex-start' as 'flex-start',
    justifyContent: 'flex-start' as 'flex-start',
    borders: { ...defaultBorders },
    paddingTop: undefined,
    paddingRight: undefined,
    paddingBottom: undefined,
    paddingLeft: undefined,
    backgroundColor: '',
  });

  switch (type) {
    case ComponentType.Text:
      return {
        ...base,
        type: ComponentType.Text,
        displayName: 'Text Block',
        content: 'Your Name | Your Title',
        fontSize: 14,
        fontWeight: 'normal',
        lineHeight: 1.4,
        color: '#333333',
        link: '',
        fontFamily: 'Arial',
        conditionalFormats: [],
        ...defaultPadding,
      } as TextItem;
    case ComponentType.Image:
      return {
        ...base,
        type: ComponentType.Image,
        displayName: 'Image',
        src: 'https://picsum.photos/120/80',
        alt: 'Company Logo',
        width: 120,
        link: '',
        ...defaultPadding,
      } as ImageItem;
    case ComponentType.Socials:
      return {
        ...base,
        type: ComponentType.Socials,
        displayName: 'Social Icons',
        links: [
          { id: uuidv4(), network: 'linkedin', url: 'https://linkedin.com', text: '', iconType: 'prebuilt', width: 24, height: 24, spacingLeft: 0, spacingRight: 0, spacingBottom: 0, verticalOffset: 0 },
          { id: uuidv4(), network: 'twitter', url: 'https://twitter.com', text: '', iconType: 'prebuilt', width: 24, height: 24, spacingLeft: 0, spacingRight: 0, spacingBottom: 0, verticalOffset: 0 },
        ],
        iconColor: '#555555',
        layout: 'horizontal',
        gap: 10,
        labelFontFamily: 'Arial',
        labelFontSize: 12,
        labelFontWeight: 'normal',
        labelColor: '#333333',
        labelGap: 8,
        ...defaultPadding,
      } as SocialsItem;
    case ComponentType.Icons:
      return {
        ...base,
        type: ComponentType.Icons,
        displayName: 'Contact Icons',
        links: [
          { id: uuidv4(), icon: 'phone', url: '', text: '', iconType: 'prebuilt', width: 16, height: 16, spacingLeft: 0, spacingRight: 0, spacingBottom: 0, verticalOffset: 0 },
          { id: uuidv4(), icon: 'email', url: '', text: '', iconType: 'prebuilt', width: 16, height: 16, spacingLeft: 0, spacingRight: 0, spacingBottom: 0, verticalOffset: 0 },
        ],
        iconColor: '#555555',
        layout: 'horizontal',
        gap: 10,
        labelFontFamily: 'Arial',
        labelFontSize: 12,
        labelFontWeight: 'normal',
        labelColor: '#333333',
        labelGap: 8,
        ...defaultPadding,
      } as IconsItem;
    case ComponentType.Spacer:
      return {
        ...base,
        type: ComponentType.Spacer,
        displayName: 'Spacer',
        height: 10,
        ...defaultPadding,
      } as SpacerItem;
    case ComponentType.Divider:
        return {
            ...base,
            type: ComponentType.Divider,
            displayName: 'Divider',
            height: 1,
            width: 100,
            widthUnit: '%',
            color: '#cccccc',
            ...defaultPadding,
        } as DividerItem;
    case ComponentType.Button:
        return {
            ...base,
            type: ComponentType.Button,
            displayName: 'Button',
            text: 'Book a Meeting',
            link: 'https://example.com',
            backgroundColor: '#007bff',
            textColor: '#ffffff',
            fontSize: 14,
            fontWeight: 'bold',
            borderRadius: 5,
            fontFamily: 'Arial',
            ...defaultPadding,
        } as ButtonItem;
    case ComponentType.Container:
        return {
            ...base,
            type: ComponentType.Container,
            displayName: 'Container',
            cells: [createCell(0, 1)], // 0 width means auto/100%
            borders: { ...defaultBorders },
            paddingTop: 0,
            paddingBottom: 0,
            backgroundColor: '',
        } as ContainerItem;
    case ComponentType.Row:
        const numCells = 2;
        const gapSize = options.tableProperties?.cellSpacing || 0;
        const gaps = numCells > 1 ? (numCells - 1) * gapSize : 0;
        const availableWidth = (options.maxWidth || 0) - gaps;
        const cellWidth = availableWidth > 0 ? Math.floor(availableWidth / numCells) : 0;
        return {
            ...base,
            type: ComponentType.Row,
            displayName: 'Row',
            cells: [createCell(cellWidth, 1), createCell(cellWidth, 2)],
            borders: { ...defaultBorders },
            paddingTop: 0,
            paddingBottom: 0,
            backgroundColor: '',
        } as RowItem;
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
}
