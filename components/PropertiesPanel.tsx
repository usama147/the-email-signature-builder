
import React from 'react';
import {
  SignatureItem,
  ComponentType,
  SocialNetwork,
  SocialLink,
  TextItem,
  ImageItem,
  SocialsItem,
  SpacerItem,
  DividerItem,
  ButtonItem,
  SelectableItem,
  RowItem,
  Cell,
  BorderProperties,
  CustomFont,
  TableProperties,
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
  setSavedColors: (colors: string[]) => void;
  customFonts: CustomFont[];
  setCustomFonts: (fonts: CustomFont[]) => void;
  onOpenWysiwyg: (item: TextItem) => void;
  mode: CreationMode;
  tableProperties: TableProperties;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-slate-600 mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
);

const socialNetworks: SocialNetwork[] = ['linkedin', 'twitter', 'github', 'facebook', 'instagram', 'website'];

const defaultBorders: BorderProperties = {
    borderTop: 0,
    borderRight: 0,
    borderBottom: 0,
    borderLeft: 0,
    borderColor: '#000000',
    borderRadius: 0,
};

const RowProperties: React.FC<{ item: RowItem; updateItem: (id: string, updates: Partial<RowItem>) => void; maxWidth: number; savedColors: string[]; setSavedColors: (colors: string[]) => void; tableProperties: TableProperties; }> = ({ item, updateItem, maxWidth, savedColors, setSavedColors, tableProperties }) => {
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
            <div>
                <Label>Number of Cells (Columns)</Label>
                <Input type="number" value={item.cells.length} onChange={handleCellCountChange} min="1" max="10" />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Row Padding Top (px)</Label>
                    <Input 
                        type="number" 
                        value={item.paddingTop} 
                        onChange={(e) => updateItem(item.id, { paddingTop: parseInt(e.target.value, 10) || 0 })}
                    />
                </div>
                <div>
                    <Label>Row Padding Bottom (px)</Label>
                    <Input 
                        type="number" 
                        value={item.paddingBottom} 
                        onChange={(e) => updateItem(item.id, { paddingBottom: parseInt(e.target.value, 10) || 0 })}
                    />
                </div>
            </div>
            <div>
                <h3 className="text-md font-semibold text-slate-700 mt-4 mb-2 border-t pt-4">Row Borders</h3>
                <p className="text-xs text-slate-500 mb-2">Applies a border around the entire row container. Cell borders can be styled individually.</p>
                <BorderEditor value={item.borders} onChange={handleBorderChange} savedColors={savedColors} setSavedColors={setSavedColors} />
            </div>
        </div>
    );
};

const CellProperties: React.FC<{ item: Cell; updateItem: (id: string, updates: Partial<Cell>) => void; savedColors: string[]; setSavedColors: (colors: string[]) => void; }> = ({ item, updateItem, savedColors, setSavedColors }) => {
    return (
        <div className="space-y-4">
            <div>
                <Label>Cell Width (px)</Label>
                <Input type="number" value={item.width} onChange={(e) => updateItem(item.id, { width: parseInt(e.target.value, 10) || 0 })} placeholder="auto" />
                <p className="text-xs text-slate-500 mt-1">Set to 0 for automatic width.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Vertical Align</Label>
                    <Select value={item.vAlign} onChange={(e) => updateItem(item.id, { vAlign: e.target.value as Cell['vAlign'] })}>
                        <option value="top">Top</option>
                        <option value="middle">Middle</option>
                        <option value="bottom">Bottom</option>
                    </Select>
                </div>
                 <div>
                    <Label>Horizontal Align</Label>
                    <Select value={item.hAlign} onChange={(e) => updateItem(item.id, { hAlign: e.target.value as Cell['hAlign'] })}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </Select>
                </div>
            </div>
             <div>
                <h3 className="text-md font-semibold text-slate-700 mt-4 mb-2 border-t pt-4">Cell Padding</h3>
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
                <h3 className="text-md font-semibold text-slate-700 mt-4 mb-2 border-t pt-4">Cell Borders</h3>
                <BorderEditor value={item.borders} onChange={(borders) => updateItem(item.id, { borders })} savedColors={savedColors} setSavedColors={setSavedColors} />
            </div>
        </div>
    );
}

const TextProperties: React.FC<{
    item: TextItem;
    handleUpdate: (updates: Partial<TextItem>) => void;
    csvHeaders: string[];
    savedColors: string[];
    setSavedColors: (colors: string[]) => void;
    customFonts: CustomFont[];
    setCustomFonts: (fonts: CustomFont[]) => void;
    onOpenWysiwyg: (item: TextItem) => void;
    mode: CreationMode;
}> = ({ item, handleUpdate, csvHeaders, savedColors, setSavedColors, customFonts, setCustomFonts, onOpenWysiwyg, mode }) => {
    return (
        <>
            <div>
                <Label>Content</Label>
                <div className={`grid grid-cols-1 ${mode === 'bulk' ? 'sm:grid-cols-2' : ''} gap-2 items-center`}>
                    <div className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm min-h-[40px] text-sm overflow-hidden text-ellipsis">
                        {item.contentMapping && mode === 'bulk'
                            ? <span className="text-slate-500">{`{{${item.contentMapping}}}`}</span>
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
                        onClick={() => onOpenWysiwyg(item)}
                        className="text-sm text-blue-600 hover:underline mt-2"
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
                <Label>Font Size</Label>
                <Input type="number" value={item.fontSize} onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value, 10) })} />
              </div>
              <div>
                <Label>Font Weight</Label>
                <Select value={item.fontWeight} onChange={(e) => handleUpdate({ fontWeight: e.target.value as 'normal' | 'bold' })}>
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </Select>
              </div>
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
        </>
    );
};


export function PropertiesPanel({ item, updateItem, csvHeaders, maxWidth, savedColors, setSavedColors, customFonts, setCustomFonts, onOpenWysiwyg, mode, tableProperties }: PropertiesPanelProps) {
  if (!item) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 h-full max-h-[calc(100vh-4rem)] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Properties</h2>
        <div className="flex items-center justify-center h-48 text-slate-400 text-center">
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
        return <CellProperties item={item as Cell} updateItem={updateItem as (id: string, updates: Partial<Cell>) => void} savedColors={savedColors} setSavedColors={setSavedColors} />;
    }

    switch (item.type) {
      case ComponentType.Row:
        return <RowProperties item={item} updateItem={updateItem as (id: string, updates: Partial<RowItem>) => void} maxWidth={maxWidth} savedColors={savedColors} setSavedColors={setSavedColors} tableProperties={tableProperties} />;
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
              onFormatAsTelChange={formatLinkAsTel => handleUpdate({ formatLinkAsTel })}
              mode={mode}
            />
            <div>
              <Label>Width (px)</Label>
              <Input type="number" value={imageItem.width} onChange={(e) => handleUpdate({ width: parseInt(e.target.value, 10) })} />
            </div>
          </>
        );
      }
      case ComponentType.Socials: {
        const socialsItem = item as SocialsItem;
        const addLink = () => {
            const newLink: SocialLink = { id: uuidv4(), network: 'website', url: '', width: 24, height: 24, iconType: 'prebuilt' };
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
                <Label>Icon Color</Label>
                 <ColorPicker
                    value={socialsItem.iconColor}
                    onChange={iconColor => handleUpdate({ iconColor })}
                    savedColors={savedColors}
                    setSavedColors={setSavedColors}
                />
            </div>
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-700 mt-4 mb-2 border-t pt-4">Social Links</h3>
                {socialsItem.links.map(link => (
                    <div key={link.id} className="p-3 border rounded-md bg-slate-50 space-y-3">
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
                            <button onClick={() => removeLink(link.id)} className="text-red-500 hover:text-red-700 p-2 shrink-0 -mt-1 -mr-1">
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
                        <DataMapper
                            label="Link URL"
                            value={link.url}
                            mapping={link.urlMapping}
                            headers={csvHeaders}
                            onValueChange={url => updateLink(link.id, { url })}
                            onMappingChange={urlMapping => updateLink(link.id, { urlMapping })}
                            isLink={true}
                            formatAsTel={link.formatLinkAsTel}
                            onFormatAsTelChange={formatLinkAsTel => updateLink(link.id, { formatLinkAsTel })}
                            mode={mode}
                        />
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
                    </div>
                ))}
            </div>
            <button onClick={addLink} className="w-full mt-2 text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Add Link
            </button>
          </>
        );
      }
      case ComponentType.Spacer: {
        const spacerItem = item as SpacerItem;
        return (
            <div>
              <Label>Height (px)</Label>
              <Input type="number" value={spacerItem.height} onChange={(e) => handleUpdate({ height: parseInt(e.target.value, 10) })} />
            </div>
        );
      }
      case ComponentType.Divider: {
          const dividerItem = item as DividerItem;
          return (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Height (px)</Label>
                    <Input type="number" value={dividerItem.height} onChange={(e) => handleUpdate({ height: parseInt(e.target.value, 10) })} />
                </div>
                <div>
                    <Label>Color</Label>
                    <ColorPicker
                        value={dividerItem.color}
                        onChange={color => handleUpdate({ color })}
                        savedColors={savedColors}
                        setSavedColors={setSavedColors}
                    />
                </div>
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
                onFormatAsTelChange={formatLinkAsTel => handleUpdate({ formatLinkAsTel })}
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
                    <Select value={buttonItem.fontWeight} onChange={(e) => handleUpdate({ fontWeight: e.target.value as 'normal' | 'bold' })}>
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
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
          </>
        )
      }
      default:
        return <p>This component has no properties to edit.</p>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 border-b pb-2 capitalize">{item.type} Properties</h2>
      <div className="space-y-4">
        {renderProperties()}
      </div>
    </div>
  );
}
