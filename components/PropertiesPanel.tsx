import React from 'react';
import {
  SignatureItem,
  ComponentType,
  SocialNetwork,
  SocialLink,
  TextItem,
  ImageItem,
  SocialsItem,
  IconsItem,
  IconLink,
  ContactIconType,
  SpacerItem,
  DividerItem,
  ButtonItem,
  SelectableItem,
  RowItem,
  ContainerItem,
  Cell,
  BorderProperties,
  CustomFont,
  TableProperties,
  ConditionalFormat,
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { DataMapper } from './DataMapper';
import { BorderEditor } from './BorderEditor';
import { PaddingEditor } from './PaddingEditor';
import { ColorPicker } from './ColorPicker';
import { FontPicker } from './FontPicker';
import { CreationMode } from '../BulkCreatorPage';

interface PropertiesPanelProps {
  item: SelectableItem | null;
  updateItem: (id: string, updates: Partial<SelectableItem>) => void;
  csvHeaders: string[];
  maxWidth: number;
  savedColors: string[];
  setSavedColors: (updater: React.SetStateAction<string[]>) => void;
  customFonts: CustomFont[];
  setCustomFonts: (updater: React.SetStateAction<CustomFont[]>) => void;
  onOpenWysiwyg: (initial: string, onSave: (s: string) => void) => void;
  mode: CreationMode;
  tableProperties: TableProperties;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-[--text-color-secondary] mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`input-field block w-full px-3 py-2 sm:text-sm ${props.className || ''}`} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`select-field block w-full px-3 py-2 sm:text-sm ${props.className || ''}`} />
);

const socialNetworks: SocialNetwork[] = ['linkedin', 'twitter', 'github', 'facebook', 'instagram', 'website'];
const contactIcons: ContactIconType[] = ['phone', 'mobile', 'email', 'website', 'location', 'calendar', 'user'];

const defaultBorders: BorderProperties = {
    borderTop: 0,
    borderRight: 0,
    borderBottom: 0,
    borderLeft: 0,
    borderColor: '#000000',
    borderRadius: 0,
};

const fontWeightOptions = [
    { value: '100', label: '100 - Thin' },
    { value: '200', label: '200 - Extra Light' },
    { value: '300', label: '300 - Light' },
    { value: 'normal', label: '400 - Normal' },
    { value: '500', label: '500 - Medium' },
    { value: '600', label: '600 - Semi Bold' },
    { value: 'bold', label: '700 - Bold' },
    { value: '800', label: '800 - Extra Bold' },
    { value: '900', label: '900 - Black' },
];

const CommonPaddingSection: React.FC<{ item: SignatureItem, updateItem: (updates: Partial<SignatureItem>) => void }> = ({ item, updateItem }) => {
    return (
        <div>
            <h3 className="text-md font-semibold text-[--text-color] mt-4 mb-2 border-t border-[--border-color] pt-4">Padding / Spacing</h3>
            <PaddingEditor
                value={{
                    paddingTop: item.paddingTop,
                    paddingRight: item.paddingRight,
                    paddingBottom: item.paddingBottom,
                    paddingLeft: item.paddingLeft,
                }}
                onChange={(paddings) => updateItem({ ...paddings })}
            />
        </div>
    );
};

const RowProperties: React.FC<{ item: RowItem | ContainerItem; updateItem: (id: string, updates: Partial<RowItem | ContainerItem>) => void; maxWidth: number; savedColors: string[]; setSavedColors: (updater: React.SetStateAction<string[]>) => void; tableProperties: TableProperties; showCellsControl?: boolean; label: string; }> = ({ item, updateItem, maxWidth, savedColors, setSavedColors, tableProperties, showCellsControl = true, label }) => {
    const handleCellCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCount = parseInt(e.target.value, 10) || 1;
        const currentCount = item.cells.length;

        if (newCount > 0 && newCount <= 10) { // Limit to 10 cells
            let newCells: Cell[];
            if (newCount > currentCount) {
                const cellsToAdd: Cell[] = Array.from({ length: newCount - currentCount }, () => ({
                    id: uuidv4(),
                    type: 'cell',
                    items: [],
                    width: 0,
                    vAlign: 'top',
                    hAlign: 'left',
                    direction: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    borders: { ...defaultBorders },
                    paddingTop: undefined,
                    paddingRight: undefined,
                    paddingBottom: undefined,
                    paddingLeft: undefined,
                }));
                newCells = [...item.cells, ...cellsToAdd];
            } else {
                const cellsToRemove = currentCount - newCount;
                let tempCells = [...item.cells];
                for (let i = 0; i < cellsToRemove; i++) {
                    let lastEmptyCellIndex = -1;
                    for (let j = tempCells.length - 1; j >= 0; j--) {
                        if (tempCells[j].items.length === 0) {
                            lastEmptyCellIndex = j;
                            break;
                        }
                    }

                    if (lastEmptyCellIndex !== -1) {
                        tempCells.splice(lastEmptyCellIndex, 1);
                    } else {
                        tempCells.pop();
                    }
                }
                newCells = tempCells;
            }
            
            const gapSize = tableProperties.cellSpacing || 0;
            const gaps = newCount > 1 ? (newCount - 1) * gapSize : 0;
            const availableWidth = maxWidth - gaps;
            const equalWidth = newCount > 0 && availableWidth > 0 ? Math.floor(availableWidth / newCount) : 0;
            const finalCells = newCells.map(cell => ({ ...cell, width: equalWidth }));

            updateItem(item.id, { cells: finalCells });
        }
    };

    const handleBorderChange = (newBorders: BorderProperties) => {
        updateItem(item.id, { borders: newBorders });
    };

    return (
        <div className="space-y-4">
            {showCellsControl && (
                <div>
                    <Label>Number of Cells (Columns)</Label>
                    <Input type="number" value={item.cells.length} onChange={handleCellCountChange} min="1" max="10" />
                </div>
            )}
            <div>
                <Label>Background Color</Label>
                <ColorPicker
                    value={item.backgroundColor || ''}
                    onChange={backgroundColor => updateItem(item.id, { backgroundColor })}
                    savedColors={savedColors}
                    setSavedColors={setSavedColors}
                    allowGradient={true}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>{label} Padding Top (px)</Label>
                    <Input 
                        type="number" 
                        value={item.paddingTop} 
                        onChange={(e) => updateItem(item.id, { paddingTop: parseInt(e.target.value, 10) || 0 })}
                    />
                </div>
                <div>
                    <Label>{label} Padding Bottom (px)</Label>
                    <Input 
                        type="number" 
                        value={item.paddingBottom} 
                        onChange={(e) => updateItem(item.id, { paddingBottom: parseInt(e.target.value, 10) || 0 })}
                    />
                </div>
            </div>
            <div>
                <h3 className="text-md font-semibold text-[--text-color] mt-4 mb-2 border-t border-[--border-color] pt-4">{label} Borders</h3>
                <p className="text-xs text-[--text-color-light] mb-2">Applies a border around the entire {label.toLowerCase()}. Cell borders can be styled individually.</p>
                <BorderEditor value={item.borders} onChange={handleBorderChange} savedColors={savedColors} setSavedColors={setSavedColors} />
            </div>
        </div>
    );
};

const CellPropertiesEditor: React.FC<{ item: Cell; updateItem: (id: string, updates: Partial<Cell>) => void; savedColors: string[]; setSavedColors: (updater: React.SetStateAction<string[]>) => void; }> = ({ item, updateItem, savedColors, setSavedColors }) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Width (px)</Label>
                    <Input type="number" value={item.width} onChange={(e) => updateItem(item.id, { width: parseInt(e.target.value, 10) || 0 })} placeholder="auto" />
                    <p className="text-xs text-[--text-color-light] mt-1">Set to 0 for auto.</p>
                </div>
                <div>
                    <Label>Height (px)</Label>
                    <Input type="number" value={item.height || ''} onChange={(e) => updateItem(item.id, { height: parseInt(e.target.value, 10) || 0 })} placeholder="auto" />
                     <p className="text-xs text-[--text-color-light] mt-1">Leave blank for auto.</p>
                </div>
            </div>
             <div>
                <Label>Background Color</Label>
                <ColorPicker
                    value={item.backgroundColor || ''}
                    onChange={backgroundColor => updateItem(item.id, { backgroundColor })}
                    savedColors={savedColors}
                    setSavedColors={setSavedColors}
                    allowGradient={true}
                />
            </div>
            
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <Label>Layout Direction</Label>
                    <Select value={item.direction || 'column'} onChange={(e) => updateItem(item.id, { direction: e.target.value as 'row' | 'column' })}>
                        <option value="column">Vertical (Stack)</option>
                        <option value="row">Horizontal (Row)</option>
                    </Select>
                </div>
                 <div>
                    <Label>Align Items (Cross Axis)</Label>
                    <Select value={item.alignItems || 'flex-start'} onChange={(e) => updateItem(item.id, { alignItems: e.target.value as any })}>
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                    </Select>
                </div>
            </div>

            <div>
                <Label>Justify Content (Main Axis)</Label>
                <Select value={item.justifyContent || 'flex-start'} onChange={(e) => updateItem(item.id, { justifyContent: e.target.value as any })}>
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                    <option value="space-between">Space Between</option>
                    <option value="space-around">Space Around</option>
                    <option value="space-evenly">Space Evenly</option>
                </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Vertical Align (Self)</Label>
                    <Select value={item.vAlign} onChange={(e) => updateItem(item.id, { vAlign: e.target.value as Cell['vAlign'] })}>
                        <option value="top">Top</option>
                        <option value="middle">Middle</option>
                        <option value="bottom">Bottom</option>
                    </Select>
                </div>
                 <div>
                    <Label>Horizontal Align (Text)</Label>
                    <Select value={item.hAlign} onChange={(e) => updateItem(item.id, { hAlign: e.target.value as Cell['hAlign'] })}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </Select>
                </div>
            </div>
             <div>
                <h3 className="text-md font-semibold text-[--text-color] mt-4 mb-2 border-t border-[--border-color] pt-4">Padding</h3>
                <PaddingEditor
                    value={{
                        paddingTop: item.paddingTop,
                        paddingRight: item.paddingRight,
                        paddingBottom: item.paddingBottom,
                        paddingLeft: item.paddingLeft,
                    }}
                    onChange={(paddings) => updateItem(item.id, { ...paddings })}
                />
            </div>
             <div>
                <h3 className="text-md font-semibold text-[--text-color] mt-4 mb-2 border-t border-[--border-color] pt-4">Borders</h3>
                <BorderEditor value={item.borders} onChange={(borders) => updateItem(item.id, { borders })} savedColors={savedColors} setSavedColors={setSavedColors} />
            </div>
        </div>
    );
}

const ContainerProperties: React.FC<{ item: ContainerItem; updateItem: (id: string, updates: Partial<SelectableItem>) => void; savedColors: string[]; setSavedColors: (updater: React.SetStateAction<string[]>) => void; }> = ({ item, updateItem, savedColors, setSavedColors }) => {
    const cell = item.cells[0];
    if (!cell) return <div>Invalid Container Configuration</div>;

    return (
        <CellPropertiesEditor 
            item={cell} 
            updateItem={updateItem as any} 
            savedColors={savedColors} 
            setSavedColors={setSavedColors} 
        />
    );
};

const ConditionalFormattingEditor: React.FC<{
  formats: ConditionalFormat[];
  onChange: (newFormats: ConditionalFormat[]) => void;
}> = ({ formats, onChange }) => {
  const handleAddFormat = () => {
    const newFormat: ConditionalFormat = {
      id: uuidv4(),
      textToMatch: '',
      scopeWord: '',
      format: 'bold',
    };
    onChange([...formats, newFormat]);
  };

  const handleUpdateFormat = (id: string, updates: Partial<ConditionalFormat>) => {
    onChange(formats.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleRemoveFormat = (id: string) => {
    onChange(formats.filter(f => f.id !== id));
  };

  return (
    <div>
      <h3 className="text-md font-semibold text-[--text-color] mt-4 mb-2 border-t border-[--border-color] pt-4">Conditional Formatting</h3>
      <p className="text-xs text-[--text-color-light] mb-2">Apply styling to specific text. This is applied after data mapping.</p>
      <div className="space-y-2">
        {formats.map(format => (
          <div key={format.id} className="p-2 border border-[--border-color] rounded-md bg-[--surface-secondary] space-y-2">
            <div className="flex items-center gap-2 text-sm">
                <span className="shrink-0">In word</span>
                <Input
                    type="text"
                    placeholder="Entire text (optional)"
                    title="If empty, the rule applies to the whole text block. Otherwise, it only applies inside this specific word."
                    value={format.scopeWord || ''}
                    onChange={e => handleUpdateFormat(format.id, { scopeWord: e.target.value })}
                    className="flex-1"
                />
            </div>
            <div className="flex items-center gap-2 text-sm">
                <span className="shrink-0">format</span>
                <Input
                    type="text"
                    placeholder="Text to format"
                    value={format.textToMatch}
                    onChange={e => handleUpdateFormat(format.id, { textToMatch: e.target.value })}
                    className="flex-1"
                />
                 <span className="shrink-0">as</span>
                <Select
                    value={format.format}
                    onChange={e => handleUpdateFormat(format.id, { format: e.target.value as 'bold' | 'superscript' })}
                >
                    <option value="bold">Bold</option>
                    <option value="superscript">Superscript</option>
                </Select>
                <button
                    onClick={() => handleRemoveFormat(format.id)}
                    className="text-[--danger] hover:text-[--danger-hover] p-1 shrink-0 text-lg font-bold leading-none"
                    aria-label="Remove formatting rule"
                >
                    {'\u00D7'}
                </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleAddFormat} className="w-full mt-2 text-sm text-[--primary] hover:underline">
        + Add Formatting Rule
      </button>
    </div>
  );
};


const TextProperties: React.FC<{
    item: TextItem;
    handleUpdate: (updates: Partial<TextItem>) => void;
    csvHeaders: string[];
    savedColors: string[];
    setSavedColors: (updater: React.SetStateAction<string[]>) => void;
    customFonts: CustomFont[];
    setCustomFonts: (updater: React.SetStateAction<CustomFont[]>) => void;
    onOpenWysiwyg: (initial: string, onSave: (s: string) => void) => void;
    mode: CreationMode;
}> = ({ item, handleUpdate, csvHeaders, savedColors, setSavedColors, customFonts, setCustomFonts, onOpenWysiwyg, mode }) => {
    return (
        <>
            <div>
                <Label>Content</Label>
                <div className={`grid grid-cols-1 ${mode === 'bulk' ? 'sm:grid-cols-2' : ''} gap-2 items-center`}>
                    <div className="block w-full px-3 py-2 bg-[--surface] border border-[--border-color] rounded-md shadow-[--shadow-inset] min-h-[40px] text-sm overflow-hidden text-ellipsis">
                        {item.contentMapping && mode === 'bulk'
                            ? <span className="text-[--text-color-light]">{`{{${item.contentMapping}}}`}</span>
                            : <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
                        }
                    </div>
                    {mode === 'bulk' && (
                        <Select value={item.contentMapping || ''} onChange={e => handleUpdate({ contentMapping: e.target.value || undefined })}>
                            <option value="">-- No Mapping --</option>
                            {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </Select>
                    )}
                </div>
                {(!item.contentMapping || mode === 'single') && (
                    <button 
                        onClick={() => onOpenWysiwyg(item.content, (c) => handleUpdate({ content: c }))}
                        className="text-sm text-[--primary] hover:underline mt-2"
                    >
                        Edit with Rich Text Editor
                    </button>
                )}
            </div>
            
            <DataMapper
              label="Link URL (optional)"
              value={item.link}
              mapping={item.linkMapping}
              headers={csvHeaders}
              onValueChange={link => handleUpdate({ link })}
              onMappingChange={linkMapping => handleUpdate({ linkMapping })}
              placeholder="https://example.com"
              isLink={true}
              formatAsTel={item.formatLinkAsTel}
              onFormatAsTelChange={formatLinkAsTel => handleUpdate({ formatLinkAsTel })}
              mode={mode}
            />
            <FontPicker
                label="Font Family"
                value={item.fontFamily}
                onChange={fontFamily => handleUpdate({ fontFamily })}
                customFonts={customFonts}
                setCustomFonts={setCustomFonts}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Font Size (px)</Label>
                <Input type="number" value={item.fontSize} onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value, 10) })} />
              </div>
              <div>
                <Label>Line Height</Label>
                <Input 
                    type="number" 
                    value={item.lineHeight} 
                    step="0.1"
                    onChange={(e) => handleUpdate({ lineHeight: parseFloat(e.target.value) || 1.4 })} 
                />
              </div>
            </div>
            <div>
                <Label>Font Weight</Label>
                <Select value={item.fontWeight} onChange={(e) => handleUpdate({ fontWeight: e.target.value })}>
                  {fontWeightOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>
            <div>
              <Label>Color</Label>
              <ColorPicker
                value={item.color}
                onChange={color => handleUpdate({ color })}
                savedColors={savedColors}
                setSavedColors={setSavedColors}
              />
            </div>
            <ConditionalFormattingEditor
                formats={item.conditionalFormats || []}
                onChange={conditionalFormats => handleUpdate({ conditionalFormats })}
            />
            <CommonPaddingSection item={item} updateItem={handleUpdate} />
        </>
    );
};


export function PropertiesPanel({ item, updateItem, csvHeaders, maxWidth, savedColors, setSavedColors, customFonts, setCustomFonts, onOpenWysiwyg, mode, tableProperties }: PropertiesPanelProps) {
  if (!item) {
    return (
      <div className="bg-[--surface] rounded-lg shadow-[--shadow-2] p-4 h-full max-h-[calc(100vh-4rem)] overflow-y-auto border border-[--border-color] transition-all duration-300" data-glass>
        <h2 className="text-lg font-semibold mb-4 border-b border-[--border-color] pb-2">Properties</h2>
        <div className="flex items-center justify-center h-48 text-[--text-color-light] text-center">
          <p>Select a component on the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }
  
  const handleUpdate = (updates: Partial<SignatureItem>) => {
    updateItem(item.id, updates);
  };

  const renderProperties = () => {
    if (item.type === 'cell') {
        return <CellPropertiesEditor item={item as Cell} updateItem={updateItem as (id: string, updates: Partial<Cell>) => void} savedColors={savedColors} setSavedColors={setSavedColors} />;
    }

    switch (item.type) {
      case ComponentType.Row:
        return <RowProperties item={item} updateItem={updateItem as (id: string, updates: Partial<RowItem>) => void} maxWidth={maxWidth} savedColors={savedColors} setSavedColors={setSavedColors} tableProperties={tableProperties} label="Row" />;
      case ComponentType.Container:
        return <ContainerProperties item={item as ContainerItem} updateItem={updateItem} savedColors={savedColors} setSavedColors={setSavedColors} />;
      case ComponentType.Text: {
        return <TextProperties 
                    item={item as TextItem}
                    handleUpdate={handleUpdate as (updates: Partial<TextItem>) => void}
                    csvHeaders={csvHeaders}
                    savedColors={savedColors}
                    setSavedColors={setSavedColors}
                    customFonts={customFonts}
                    setCustomFonts={setCustomFonts}
                    onOpenWysiwyg={onOpenWysiwyg}
                    mode={mode}
                />
      }
      case ComponentType.Image: {
        const imageItem = item as ImageItem;
        return (
          <>
            <DataMapper
              label="Image URL"
              value={imageItem.src}
              mapping={imageItem.srcMapping}
              headers={csvHeaders}
              onValueChange={src => handleUpdate({ src })}
              onMappingChange={srcMapping => handleUpdate({ srcMapping })}
              placeholder="https://..."
              mode={mode}
            />
             <div>
              <Label>Alt Text</Label>
              <Input type="text" value={imageItem.alt} onChange={(e) => handleUpdate({ alt: e.target.value })} />
            </div>
            <DataMapper
              label="Link URL (optional)"
              value={imageItem.link}
              mapping={imageItem.linkMapping}
              headers={csvHeaders}
              onValueChange={link => handleUpdate({ link })}
              onMappingChange={linkMapping => handleUpdate({ linkMapping })}
              placeholder="https://example.com"
              isLink={true}
              formatAsTel={imageItem.formatLinkAsTel}
              onFormatAsTelChange={formatLinkAsTel => handleUpdate({ formatLinkAsTel } as Partial<SignatureItem>)}
              mode={mode}
            />
            <div>
              <Label>Width (px)</Label>
              <Input type="number" value={imageItem.width} onChange={(e) => handleUpdate({ width: parseInt(e.target.value, 10) })} />
            </div>
            <CommonPaddingSection item={imageItem} updateItem={handleUpdate} />
          </>
        );
      }
      case ComponentType.Socials: {
        const socialsItem = item as SocialsItem;
        const addLink = () => {
            const newLink: SocialLink = { id: uuidv4(), network: 'website', url: '', text: '', width: 24, height: 24, iconType: 'prebuilt', spacingLeft: 0, spacingRight: 0, spacingBottom: 0, verticalOffset: 0 };
            handleUpdate({ links: [...socialsItem.links, newLink] });
        };
        const updateLink = (linkId: string, updates: Partial<SocialLink>) => {
            const updatedLinks = socialsItem.links.map(l => l.id === linkId ? {...l, ...updates} : l);
            handleUpdate({ links: updatedLinks });
        }
        const removeLink = (linkId: string) => {
            handleUpdate({ links: socialsItem.links.filter(l => l.id !== linkId) });
        }

        return (
          <>
            <div>
                <Label>Layout</Label>
                <Select value={socialsItem.layout || 'horizontal'} onChange={(e) => handleUpdate({ layout: e.target.value as 'horizontal' | 'vertical' })}>
                    <option value="horizontal">Horizontal (Inline)</option>
                    <option value="vertical">Vertical (Stacked)</option>
                </Select>
            </div>
            
            <div className="mt-2">
                 <Label>Icon Gap (px)</Label>
                 <Input 
                    type="number" 
                    value={socialsItem.gap ?? 10}
                    onChange={(e) => handleUpdate({ gap: parseInt(e.target.value, 10) || 0 })}
                    title="Sets the gap between all icons."
                />
            </div>
            
            <div className="mt-2">
                <Label>Icon Color</Label>
                 <ColorPicker
                    value={socialsItem.iconColor}
                    onChange={iconColor => handleUpdate({ iconColor })}
                    savedColors={savedColors}
                    setSavedColors={setSavedColors}
                />
            </div>

            <div>
                 <h3 className="text-md font-semibold text-[--text-color] mt-4 mb-2 border-t border-[--border-color] pt-4">Label Styles</h3>
                 <FontPicker
                    label="Font Family"
                    value={socialsItem.labelFontFamily || 'Arial'}
                    onChange={labelFontFamily => handleUpdate({ labelFontFamily })}
                    customFonts={customFonts}
                    setCustomFonts={setCustomFonts}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                        <Label>Font Size (px)</Label>
                        <Input type="number" value={socialsItem.labelFontSize || 12} onChange={(e) => handleUpdate({ labelFontSize: parseInt(e.target.value, 10) })} />
                    </div>
                    <div>
                         <Label>Font Weight</Label>
                        <Select value={socialsItem.labelFontWeight || 'normal'} onChange={(e) => handleUpdate({ labelFontWeight: e.target.value })}>
                          {fontWeightOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Select>
                    </div>
                </div>
                 <div className="mt-2">
                    <Label>Label Color</Label>
                    <ColorPicker
                        value={socialsItem.labelColor || '#333333'}
                        onChange={labelColor => handleUpdate({ labelColor })}
                        savedColors={savedColors}
                        setSavedColors={setSavedColors}
                    />
                </div>
                 <div className="mt-2">
                     <Label>Icon-Label Gap (px)</Label>
                     <Input
                        type="number"
                        value={socialsItem.labelGap || 8}
                        onChange={(e) => handleUpdate({ labelGap: parseInt(e.target.value, 10) || 0 })}
                    />
                 </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-md font-semibold text-[--text-color] mt-4 mb-2 border-t border-[--border-color] pt-4">Social Links</h3>
                {socialsItem.links.map(link => (
                    <div key={link.id} className="p-3 border border-[--border-color] rounded-md bg-[--surface-secondary] space-y-3">
                        <div className="flex items-start gap-2">
                            <div className="flex-grow">
                                <Label>Icon Type</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center text-sm">
                                        <input type="radio" name={`icon-type-${link.id}`} value="prebuilt" checked={link.iconType === 'prebuilt'} onChange={() => updateLink(link.id, { iconType: 'prebuilt' })} className="mr-1"/>
                                        Pre-built
                                    </label>
                                    <label className="flex items-center text-sm">
                                        <input type="radio" name={`icon-type-${link.id}`} value="custom" checked={link.iconType === 'custom'} onChange={() => updateLink(link.id, { iconType: 'custom' })} className="mr-1"/>
                                        Custom
                                    </label>
                                </div>
                            </div>
                            <button onClick={() => removeLink(link.id)} className="text-[--danger] hover:text-[--danger-hover] p-2 shrink-0 -mt-1 -mr-1">
                              {'\u00D7'}
                            </button>
                        </div>

                        {link.iconType === 'prebuilt' ? (
                            <Select value={link.network} onChange={(e) => updateLink(link.id, { network: e.target.value as SocialNetwork })} className="capitalize">
                                {socialNetworks.map(n => <option key={n} value={n}>{n}</option>)}
                            </Select>
                        ) : (
                            <DataMapper
                                label="Custom Icon URL"
                                value={link.customIconUrl || ''}
                                mapping={link.customIconUrlMapping}
                                headers={csvHeaders}
                                onValueChange={customIconUrl => updateLink(link.id, { customIconUrl })}
                                onMappingChange={customIconUrlMapping => updateLink(link.id, { customIconUrlMapping })}
                                mode={mode}
                            />
                        )}
                        
                        <div>
                            <Label>Label Text</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-[--surface] border border-[--border-color] rounded-md px-3 py-2 text-sm text-[--text-color-secondary] truncate min-h-[38px]">
                                    {link.text ? (
                                        <span dangerouslySetInnerHTML={{ __html: link.text }}></span>
                                    ) : (
                                        <span className="opacity-50">No label</span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => onOpenWysiwyg(link.text || '', (c) => updateLink(link.id, { text: c }))}
                                    className="btn btn-sm btn-secondary"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>

                        <DataMapper
                            label="Link URL"
                            value={link.url}
                            mapping={link.urlMapping}
                            headers={csvHeaders}
                            onValueChange={url => updateLink(link.id, { url })}
                            onMappingChange={urlMapping => updateLink(link.id, { urlMapping })}
                            isLink={true}
                            formatAsTel={link.formatLinkAsTel}
                            /* Renamed parameter to 'val' to fix 'Cannot find name' errors */
                            onFormatAsTelChange={val => updateLink(link.id, { formatLinkAsTel: val })}
                            mode={mode}
                        />
                        
                        {link.iconType === 'prebuilt' ? (
                            <div>
                                <Label>Icon Size (px)</Label>
                                <Input 
                                    type="number" 
                                    value={link.width} // width and height are the same
                                    onChange={e => {
                                        const size = parseInt(e.target.value, 10) || 0;
                                        updateLink(link.id, { width: size, height: size });
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label>Width (px)</Label>
                                    <Input type="number" value={link.width} onChange={e => updateLink(link.id, { width: parseInt(e.target.value, 10) || 0 })} />
                                </div>
                                 <div>
                                    <Label>Height (px)</Label>
                                    <Input type="number" value={link.height} onChange={e => updateLink(link.id, { height: parseInt(e.target.value, 10) || 0 })} />
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <Label>Vertical Offset (px)</Label>
                                <Input type="number" value={link.verticalOffset ?? 0} onChange={e => updateLink(link.id, { verticalOffset: parseInt(e.target.value, 10) })} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={addLink} className="btn btn-primary w-full mt-2 text-center">
                Add Link
            </button>
            <CommonPaddingSection item={socialsItem} updateItem={handleUpdate} />
          </>
        );
      }
      case ComponentType.Icons: {
        const iconsItem = item as IconsItem;
        const addLink = () => {
            const newLink: IconLink = { id: uuidv4(), icon: 'website', url: '', text: '', width: 16, height: 16, iconType: 'prebuilt', spacingLeft: 0, spacingRight: 0, spacingBottom: 0, verticalOffset: 0 };
            handleUpdate({ links: [...iconsItem.links, newLink] });
        };
        const updateLink = (linkId: string, updates: Partial<IconLink>) => {
            const updatedLinks = iconsItem.links.map(l => l.id === linkId ? {...l, ...updates} : l);
            handleUpdate({ links: updatedLinks });
        }
        const removeLink = (linkId: string) => {
            handleUpdate({ links: iconsItem.links.filter(l => l.id !== linkId) });
        }

        return (
          <>
            <div>
                <Label>Layout</Label>
                <Select value={iconsItem.layout || 'horizontal'} onChange={(e) => handleUpdate({ layout: e.target.value as 'horizontal' | 'vertical' })}>
                    <option value="horizontal">Horizontal (Inline)</option>
                    <option value="vertical">Vertical (Stacked)</option>
                </Select>
            </div>
            
            <div className="mt-2">
                 <Label>Icon Gap (px)</Label>
                 <Input 
                    type="number" 
                    value={iconsItem.gap ?? 10}
                    onChange={(e) => handleUpdate({ gap: parseInt(e.target.value, 10) || 0 })}
                    title="Sets the gap between all icons."
                />
            </div>
            
            <div className="mt-2">
                <Label>Icon Color</Label>
                 <ColorPicker
                    value={iconsItem.iconColor}
                    onChange={iconColor => handleUpdate({ iconColor })}
                    savedColors={savedColors}
                    setSavedColors={setSavedColors}
                />
            </div>

            <div>
                 <h3 className="text-md font-semibold text-[--text-color] mt-4 mb-2 border-t border-[--border-color] pt-4">Label Styles</h3>
                 <FontPicker
                    label="Font Family"
                    value={iconsItem.labelFontFamily || 'Arial'}
                    onChange={labelFontFamily => handleUpdate({ labelFontFamily })}
                    customFonts={customFonts}
                    setCustomFonts={setCustomFonts}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                        <Label>Font Size (px)</Label>
                        <Input type="number" value={iconsItem.labelFontSize || 12} onChange={(e) => handleUpdate({ labelFontSize: parseInt(e.target.value, 10) })} />
                    </div>
                    <div>
                         <Label>Font Weight</Label>
                        <Select value={iconsItem.labelFontWeight || 'normal'} onChange={(e) => handleUpdate({ labelFontWeight: e.target.value })}>
                          {fontWeightOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Select>
                    </div>
                </div>
                 <div className="mt-2">
                    <Label>Label Color</Label>
                    <ColorPicker
                        value={iconsItem.labelColor || '#333333'}
                        onChange={labelColor => handleUpdate({ labelColor })}
                        savedColors={savedColors}
                        setSavedColors={setSavedColors}
                    />
                </div>
                 <div className="mt-2">
                     <Label>Icon-Label Gap (px)</Label>
                     <Input
                        type="number"
                        value={iconsItem.labelGap || 8}
                        onChange={(e) => handleUpdate({ labelGap: parseInt(e.target.value, 10) || 0 })}
                    />
                 </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-md font-semibold text-[--text-color] mt-4 mb-2 border-t border-[--border-color] pt-4">Icons</h3>
                {iconsItem.links.map(link => (
                    <div key={link.id} className="p-3 border border-[--border-color] rounded-md bg-[--surface-secondary] space-y-3">
                        <div className="flex items-start gap-2">
                            <div className="flex-grow">
                                <Label>Icon Type</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center text-sm">
                                        <input type="radio" name={`icon-type-${link.id}`} value="prebuilt" checked={link.iconType === 'prebuilt'} onChange={() => updateLink(link.id, { iconType: 'prebuilt' })} className="mr-1"/>
                                        Pre-built
                                    </label>
                                    <label className="flex items-center text-sm">
                                        <input type="radio" name={`icon-type-${link.id}`} value="custom" checked={link.iconType === 'custom'} onChange={() => updateLink(link.id, { iconType: 'custom' })} className="mr-1"/>
                                        Custom
                                    </label>
                                </div>
                            </div>
                            <button onClick={() => removeLink(link.id)} className="text-[--danger] hover:text-[--danger-hover] p-2 shrink-0 -mt-1 -mr-1">
                              {'\u00D7'}
                            </button>
                        </div>

                        {link.iconType === 'prebuilt' ? (
                            <Select value={link.icon} onChange={(e) => updateLink(link.id, { icon: e.target.value as ContactIconType })} className="capitalize">
                                {contactIcons.map(n => <option key={n} value={n}>{n}</option>)}
                            </Select>
                        ) : (
                            <DataMapper
                                label="Custom Icon URL"
                                value={link.customIconUrl || ''}
                                mapping={link.customIconUrlMapping}
                                headers={csvHeaders}
                                onValueChange={customIconUrl => updateLink(link.id, { customIconUrl })}
                                onMappingChange={customIconUrlMapping => updateLink(link.id, { customIconUrlMapping })}
                                mode={mode}
                            />
                        )}
                        
                        <div>
                            <Label>Label Text</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-[--surface] border border-[--border-color] rounded-md px-3 py-2 text-sm text-[--text-color-secondary] truncate min-h-[38px]">
                                    {link.text ? (
                                        <span dangerouslySetInnerHTML={{ __html: link.text }}></span>
                                    ) : (
                                        <span className="opacity-50">No label</span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => onOpenWysiwyg(link.text || '', (c) => updateLink(link.id, { text: c }))}
                                    className="btn btn-sm btn-secondary"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>

                        <DataMapper
                            label="Link URL"
                            value={link.url}
                            mapping={link.urlMapping}
                            headers={csvHeaders}
                            onValueChange={url => updateLink(link.id, { url })}
                            onMappingChange={urlMapping => updateLink(link.id, { urlMapping })}
                            isLink={true}
                            formatAsTel={link.formatLinkAsTel}
                            /* Renamed parameter to 'val' to fix 'Cannot find name' errors */
                            onFormatAsTelChange={val => updateLink(link.id, { formatLinkAsTel: val })}
                            mode={mode}
                        />
                        
                        <div>
                            <Label>Icon Width (px)</Label>
                            <Input type="number" value={link.width} onChange={e => updateLink(link.id, { width: parseInt(e.target.value, 10) || 0 })} />
                        </div>
                        <div>
                            <Label>Icon Height (px)</Label>
                            <Input type="number" value={link.height} onChange={e => updateLink(link.id, { height: parseInt(e.target.value, 10) || 0 })} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <Label>Vertical Offset (px)</Label>
                                <Input type="number" value={link.verticalOffset ?? 0} onChange={e => updateLink(link.id, { verticalOffset: parseInt(e.target.value, 10) })} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={addLink} className="btn btn-primary w-full mt-2 text-center">
                Add Icon
            </button>
            <CommonPaddingSection item={iconsItem} updateItem={handleUpdate} />
          </>
        );
      }
      case ComponentType.Spacer: {
        const spacerItem = item as SpacerItem;
        return (
            <div>
              <Label>Height (px)</Label>
              <Input type="number" value={spacerItem.height} onChange={(e) => handleUpdate({ height: parseInt(e.target.value, 10) })} />
              <CommonPaddingSection item={spacerItem} updateItem={handleUpdate} />
            </div>
        );
      }
      case ComponentType.Divider: {
          const dividerItem = item as DividerItem;
          return (
             <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Width</Label>
                        <div className="flex">
                            <Input 
                                type="number" 
                                value={dividerItem.width} 
                                onChange={(e) => handleUpdate({ width: parseInt(e.target.value, 10) || 0 })} 
                                className="rounded-r-none border-r-0 w-2/3"
                            />
                            <select
                                value={dividerItem.widthUnit}
                                onChange={(e) => handleUpdate({ widthUnit: e.target.value as '%' | 'px' })}
                                className="select-field rounded-l-none w-1/3 min-w-[60px]"
                            >
                                <option value="%">%</option>
                                <option value="px">px</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <Label>Height (px)</Label>
                        <Input type="number" value={dividerItem.height} onChange={(e) => handleUpdate({ height: parseInt(e.target.value, 10) })} />
                    </div>
                </div>
                <div>
                    <Label>Color</Label>
                    <ColorPicker
                        value={dividerItem.color}
                        onChange={color => handleUpdate({ color })}
                        savedColors={savedColors}
                        setSavedColors={setSavedColors}
                        allowGradient={true}
                    />
                </div>
                <CommonPaddingSection item={dividerItem} updateItem={handleUpdate} />
            </div>
          );
      }
      case ComponentType.Button: {
        const buttonItem = item as ButtonItem;
        return (
          <>
            <DataMapper
                label="Button Text"
                value={buttonItem.text}
                mapping={buttonItem.textMapping}
                headers={csvHeaders}
                onValueChange={text => handleUpdate({ text })}
                onMappingChange={textMapping => handleUpdate({ textMapping })}
                mode={mode}
            />
            <DataMapper
                label="Link URL"
                value={buttonItem.link}
                mapping={buttonItem.linkMapping}
                headers={csvHeaders}
                onValueChange={link => handleUpdate({ link })}
                onMappingChange={linkMapping => handleUpdate({ linkMapping })}
                placeholder="https://example.com"
                isLink={true}
                formatAsTel={buttonItem.formatLinkAsTel}
                onFormatAsTelChange={formatLinkAsTel => handleUpdate({ formatLinkAsTel: formatLinkAsTel } as Partial<SignatureItem>)}
                mode={mode}
            />
            <FontPicker
                label="Font Family"
                value={buttonItem.fontFamily}
                onChange={fontFamily => handleUpdate({ fontFamily })}
                customFonts={customFonts}
                setCustomFonts={setCustomFonts}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Font Size</Label>
                    <Input type="number" value={buttonItem.fontSize} onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value, 10) })} />
                </div>
                <div>
                    <Label>Font Weight</Label>
                    <Select value={buttonItem.fontWeight} onChange={(e) => handleUpdate({ fontWeight: e.target.value })}>
                      {fontWeightOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <Label>Background Color</Label>
                    <ColorPicker
                        value={buttonItem.backgroundColor}
                        onChange={backgroundColor => handleUpdate({ backgroundColor })}
                        savedColors={savedColors}
                        setSavedColors={setSavedColors}
                        allowGradient={true}
                    />
                </div>
                 <div>
                    <Label>Text Color</Label>
                    <ColorPicker
                        value={buttonItem.textColor}
                        onChange={textColor => handleUpdate({ textColor })}
                        savedColors={savedColors}
                        setSavedColors={setSavedColors}
                    />
                </div>
            </div>
             <div>
                <Label>Border Radius (px)</Label>
                <Input type="number" value={buttonItem.borderRadius} onChange={(e) => handleUpdate({ borderRadius: parseInt(e.target.value, 10) })} />
            </div>
            <CommonPaddingSection item={buttonItem} updateItem={handleUpdate} />
          </>
        )
      }
      default:
        return <p>This component has no properties to edit.</p>;
    }
  };

  return (
    <div className="bg-[--surface] rounded-lg shadow-[--shadow-2] p-4 max-h-[calc(100vh-4rem)] overflow-y-auto border border-[--border-color] transition-all duration-300" data-glass>
      <h2 className="text-lg font-semibold mb-4 border-b border-[--border-color] pb-2 capitalize">{item.type} Properties</h2>
      <div className="space-y-4">
        {renderProperties()}
      </div>
    </div>
  );
}
