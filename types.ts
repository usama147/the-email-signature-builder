export enum ComponentType {
  Text = 'text',
  Image = 'image',
  Socials = 'socials',
  Spacer = 'spacer',
  Divider = 'divider',
  Button = 'button',
  Row = 'row',
}

// A new "type" for a cell to make it selectable
export type CellType = 'cell';

export interface BaseSignatureItem {
  id: string;
  type: ComponentType;
}

export interface BorderProperties {
  borderTop: number;
  borderRight: number;
  borderBottom: number;
  borderLeft: number;
  borderColor: string;
  borderRadius: number;
}

export interface TextItem extends BaseSignatureItem {
  type: ComponentType.Text;
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  link: string;
  fontFamily: string;
  contentMapping?: string;
  linkMapping?: string;
  formatLinkAsTel?: boolean;
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
  width: number;
  height: number;
  urlMapping?: string;
  iconType: 'prebuilt' | 'custom';
  customIconUrl?: string;
  customIconUrlMapping?: string;
  formatLinkAsTel?: boolean;
}
export interface SocialsItem extends BaseSignatureItem {
  type: ComponentType.Socials;
  links: SocialLink[];
  iconColor: string;
}

export interface SpacerItem extends BaseSignatureItem {
  type: ComponentType.Spacer;
  height: number;
}

export interface DividerItem extends BaseSignatureItem {
  type: ComponentType.Divider;
  height: number;
  color: string;
}

export interface ButtonItem extends BaseSignatureItem {
    type: ComponentType.Button;
    text: string;
    link: string;
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    borderRadius: number;
    fontFamily: string;
    textMapping?: string;
    linkMapping?: string;
    formatLinkAsTel?: boolean;
}

// "Content" items that can be placed inside a Cell
export type SignatureItem = TextItem | ImageItem | SocialsItem | SpacerItem | DividerItem | ButtonItem;

export interface Cell {
  id: string;
  type: CellType;
  items: SignatureItem[];
  width: number; // in px. 0 = auto
  vAlign: 'top' | 'middle' | 'bottom';
  hAlign: 'left' | 'center' | 'right';
  borders: BorderProperties;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

export interface RowItem extends BaseSignatureItem {
  type: ComponentType.Row;
  cells: Cell[];
  borders: BorderProperties;
  paddingTop: number;
  paddingBottom: number;
}

// Union of all possible item types that can be selected
export type SelectableItem = RowItem | SignatureItem | Cell;

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