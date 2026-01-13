
export enum ComponentType {
  Text = 'text',
  Image = 'image',
  Socials = 'socials',
  Icons = 'icons',
  Spacer = 'spacer',
  Divider = 'divider',
  Button = 'button',
  Row = 'row',
  Container = 'container',
}

// A new "type" for a cell to make it selectable
export type CellType = 'cell';

export interface BaseSignatureItem {
  id: string;
  type: ComponentType;
  displayName?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

export interface BorderProperties {
  borderTop: number;
  borderRight: number;
  borderBottom: number;
  borderLeft: number;
  borderColor: string;
  borderRadius: number;
}

export interface ConditionalFormat {
  id: string;
  textToMatch: string;
  format: 'bold' | 'superscript';
  scopeWord?: string;
}

export interface TextItem extends BaseSignatureItem {
  type: ComponentType.Text;
  content: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  color: string;
  link: string;
  fontFamily: string;
  contentMapping?: string;
  linkMapping?: string;
  formatLinkAsTel?: boolean;
  conditionalFormats?: ConditionalFormat[];
}

export interface ImageItem extends BaseSignatureItem {
  type: ComponentType.Image;
  src: string;
  alt: string;
  width: number;
  link: string;
  srcMapping?: string;
  linkMapping?: string;
  formatLinkAsTel?: boolean;
}

export type SocialNetwork = 'linkedin' | 'twitter' | 'github' | 'facebook' | 'instagram' | 'website';

export interface SocialLink {
  id: string;
  network: SocialNetwork;
  url: string;
  text?: string;
  width: number;
  height: number;
  urlMapping?: string;
  iconType: 'prebuilt' | 'custom';
  customIconUrl?: string;
  customIconUrlMapping?: string;
  formatLinkAsTel?: boolean;
  spacingLeft?: number;
  spacingRight?: number;
  spacingBottom?: number;
  verticalOffset?: number;
}
export interface SocialsItem extends BaseSignatureItem {
  type: ComponentType.Socials;
  links: SocialLink[];
  iconColor: string;
  layout: 'horizontal' | 'vertical';
  gap?: number; // Space between items
  // Global text styles for labels
  labelFontFamily?: string;
  labelFontSize?: number;
  labelFontWeight?: string;
  labelColor?: string;
  labelGap?: number;
}

export type ContactIconType = 'phone' | 'mobile' | 'email' | 'website' | 'location' | 'calendar' | 'user';

export interface IconLink {
  id: string;
  icon: ContactIconType;
  url: string;
  text?: string;
  width: number;
  height: number;
  urlMapping?: string;
  iconType: 'prebuilt' | 'custom';
  customIconUrl?: string;
  customIconUrlMapping?: string;
  formatLinkAsTel?: boolean;
  spacingLeft?: number;
  spacingRight?: number;
  spacingBottom?: number;
  verticalOffset?: number;
}

export interface IconsItem extends BaseSignatureItem {
  type: ComponentType.Icons;
  links: IconLink[];
  iconColor: string;
  layout: 'horizontal' | 'vertical';
  gap?: number; // Space between items
  labelFontFamily?: string;
  labelFontSize?: number;
  labelFontWeight?: string;
  labelColor?: string;
  labelGap?: number;
}

export interface SpacerItem extends BaseSignatureItem {
  type: ComponentType.Spacer;
  height: number;
}

export interface DividerItem extends BaseSignatureItem {
  type: ComponentType.Divider;
  height: number;
  width: number;
  widthUnit: '%' | 'px';
  color: string;
}

export interface ButtonItem extends BaseSignatureItem {
    type: ComponentType.Button;
    text: string;
    link: string;
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: string;
    borderRadius: number;
    fontFamily: string;
    textMapping?: string;
    linkMapping?: string;
    formatLinkAsTel?: boolean;
}

export interface Cell {
  id: string;
  type: CellType;
  displayName?: string;
  items: SignatureItem[];
  width: number; // in px. 0 = auto
  height?: number; // in px. undefined or 0 = auto
  vAlign: 'top' | 'middle' | 'bottom';
  hAlign: 'left' | 'center' | 'right';
  direction: 'row' | 'column';
  alignItems?: 'flex-start' | 'center' | 'flex-end'; // Alignment of items on the cross axis
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'; // Alignment of items on the main axis
  borders: BorderProperties;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  backgroundColor?: string;
}

export interface RowItem extends BaseSignatureItem {
  type: ComponentType.Row;
  cells: Cell[];
  borders: BorderProperties;
  paddingTop: number;
  paddingBottom: number;
  backgroundColor?: string;
}

export interface ContainerItem extends BaseSignatureItem {
    type: ComponentType.Container;
    cells: Cell[]; // Container acts as a 1-cell row
    borders: BorderProperties;
    paddingTop: number;
    paddingBottom: number;
    backgroundColor?: string;
}

// "Content" items that can be placed inside a Cell
export type SignatureItem = TextItem | ImageItem | SocialsItem | IconsItem | SpacerItem | DividerItem | ButtonItem | RowItem | ContainerItem;

// Union of all possible item types that can be selected
export type SelectableItem = RowItem | ContainerItem | SignatureItem | Cell;

export type SidebarComponent = {
  type: ComponentType;
  label: string;
};

export interface TableProperties {
  border: number;
  cellSpacing: number;
}

export interface CustomFont {
    name: string;
    url: string;
    source: 'url' | 'google';
    rawCss?: string;
}

export interface SignatureTemplate {
    id: string;
    name: string;
    rows: RowItem[];
    maxWidth: number;
    tableProperties: TableProperties;
}


// Types for the new Compatibility Checker
export enum CompatibilityStatus {
    Good = 'good',
    Warning = 'warning',
    Poor = 'poor',
}

export interface CompatibilityResult {
    id: string;
    title: string;
    message: string;
    status: CompatibilityStatus;
}
