
import { v4 as uuidv4 } from 'uuid';
import { RowItem, Cell, SignatureItem, ComponentType, TableProperties, TextItem, ImageItem, SocialsItem, SpacerItem, DividerItem, ButtonItem, SocialLink, BorderProperties, SocialNetwork, CustomFont } from '../types';
import { BuilderState } from '../BulkCreatorPage';

export class HtmlParsingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "HtmlParsingError";
    }
}

const px = (value: string | null | undefined): number => (value ? parseInt(value, 10) || 0 : 0);

function parseBorders(styles: CSSStyleDeclaration): BorderProperties {
    return {
        borderTop: px(styles.borderTopWidth),
        borderRight: px(styles.borderRightWidth),
        borderBottom: px(styles.borderBottomWidth),
        borderLeft: px(styles.borderLeftWidth),
        borderColor: styles.borderTopColor || styles.borderColor || '#000000',
        borderRadius: px(styles.borderRadius),
    };
}

function parsePadding(styles: CSSStyleDeclaration) {
    return {
        paddingTop: px(styles.paddingTop),
        paddingRight: px(styles.paddingRight),
        paddingBottom: px(styles.paddingBottom),
        paddingLeft: px(styles.paddingLeft),
    };
}

function parseFont(styles: CSSStyleDeclaration) {
    return {
        fontFamily: styles.fontFamily?.split(',')[0].replace(/'|"/g, '').trim() || 'Arial',
        fontSize: px(styles.fontSize),
        fontWeight: styles.fontWeight || 'normal', // Use exact string or default to normal
        lineHeight: parseFloat(styles.lineHeight) || 1.4,
        color: styles.color || '#000000',
    }
}

// Extract row parsing logic to be reusable
function parseRow(rowTable: HTMLTableElement, rowWrapperStyles: CSSStyleDeclaration): RowItem {
    const rowTableStyles = rowTable.style;

    const newRow: RowItem = {
        id: uuidv4(),
        type: ComponentType.Row,
        displayName: 'Row',
        cells: [],
        borders: parseBorders(rowTableStyles),
        paddingTop: px(rowWrapperStyles.paddingTop),
        paddingBottom: px(rowWrapperStyles.paddingBottom),
        backgroundColor: rowTableStyles.background || rowTableStyles.backgroundImage || rowTableStyles.backgroundColor || '',
    };

    const cellTds = Array.from(rowTable.querySelectorAll(':scope > tbody > tr > td'));
    cellTds.forEach((cellTd, index) => {
        const cellStyles = (cellTd as HTMLElement).style;
        
        const newCell: Cell = {
            id: uuidv4(),
            type: 'cell',
            displayName: `Column ${index + 1}`,
            items: [],
            width: px(cellTd.getAttribute('width') || cellStyles.width),
            height: px(cellTd.getAttribute('height') || cellStyles.height) || undefined,
            vAlign: (cellTd.getAttribute('valign') as Cell['vAlign']) || 'top',
            hAlign: 'left',
            direction: 'column', // default, detecting row direction needs check on inner structure
            alignItems: 'flex-start', // default
            justifyContent: 'flex-start', // default
            borders: parseBorders(cellStyles),
            ...parsePadding(cellStyles),
            backgroundColor: cellStyles.background || cellStyles.backgroundImage || cellStyles.backgroundColor || '',
        };

        const componentTable = cellTd.querySelector('table');
        // If there's no inner table, or it doesn't have rows, it's an empty cell
        if (!componentTable || !componentTable.querySelector('tbody')) {
             newRow.cells.push(newCell);
             return;
        }

        const componentTrs = Array.from(componentTable.querySelectorAll(':scope > tbody > tr'));
        
        // Detect layout direction:
        // If 1 TR and multiple TDs -> Horizontal ('row')
        // If multiple TRs -> Vertical ('column')
        if (componentTrs.length === 1 && componentTrs[0].querySelectorAll(':scope > td').length > 1) {
            newCell.direction = 'row';
            const tds = Array.from(componentTrs[0].querySelectorAll(':scope > td'));
            tds.forEach(compTd => {
                 const component = parseComponent(compTd as HTMLTableCellElement);
                 if (component) newCell.items.push(component);
            });
            // Try to detect justifyContent for row
            if (componentTable.style.justifyContent) {
                 newCell.justifyContent = componentTable.style.justifyContent as any;
            }
        } else {
            newCell.direction = 'column';
            let commonHAlign: Cell['hAlign'] | null = null;
            componentTrs.forEach(compTr => {
                const compTd = compTr.firstElementChild as HTMLTableCellElement;
                if (!compTd) return;
                
                const component = parseComponent(compTd);
                if (component) {
                    newCell.items.push(component);
                    const align = compTd.getAttribute('align') as Cell['hAlign'];
                    if (align && !commonHAlign) {
                         commonHAlign = align;
                    }
                }
            });
            newCell.hAlign = commonHAlign || 'left';
            
            // Map commonHAlign back to alignItems/justifyContent if possible
            if (commonHAlign === 'center') newCell.alignItems = 'center';
            if (commonHAlign === 'right') newCell.alignItems = 'flex-end';
        }
        
        newRow.cells.push(newCell);
    });
    return newRow;
}


function parseComponent(element: HTMLTableCellElement): SignatureItem | null {
    const wrapperStyles = element.style;
    const commonPadding = parsePadding(wrapperStyles);
    
    // Check if this TD contains a Nested Row (Table)
    const nestedTable = element.querySelector('table');
    if (nestedTable) {
        const isDivider = nestedTable.querySelector('td[bgcolor]') && !nestedTable.textContent?.trim();
        const isSocials = !!nestedTable.querySelector('a > img') || !!nestedTable.querySelector('svg'); 
        
        if (!isDivider && !isSocials) {
            try {
                return parseRow(nestedTable, wrapperStyles);
            } catch (e) {
                // Fallback
            }
        }
    }

    const content = element.firstElementChild as HTMLElement;
    if (!content) return null;

    const inlineStyles = content.style;
    const hasVisibleText = content.textContent?.trim() !== '';

    if (hasVisibleText) {
        if (content.tagName === 'A' && (inlineStyles.backgroundColor || inlineStyles.background)) {
            const link = content as HTMLAnchorElement;
            return {
                id: uuidv4(),
                type: ComponentType.Button,
                displayName: 'Button',
                text: link.innerText,
                link: link.href.startsWith('tel:') ? link.href.substring(4) : link.href,
                formatLinkAsTel: link.href.startsWith('tel:'),
                backgroundColor: inlineStyles.background || inlineStyles.backgroundImage || inlineStyles.backgroundColor,
                textColor: inlineStyles.color,
                ...parseFont(inlineStyles),
                borderRadius: px(inlineStyles.borderRadius),
                ...commonPadding,
            } as ButtonItem;
        }

        if (content.tagName === 'DIV' || content.tagName === 'A') {
            const linkElement = content.closest('a');
            return {
                id: uuidv4(),
                type: ComponentType.Text,
                displayName: 'Text Block',
                content: content.innerHTML,
                link: linkElement ? (linkElement.href.startsWith('tel:') ? linkElement.href.substring(4) : linkElement.href) : '',
                formatLinkAsTel: !!(linkElement?.href.startsWith('tel:')),
                ...parseFont(inlineStyles),
                ...commonPadding,
            } as TextItem;
        }
    }

    if (content.tagName === 'DIV' && content.querySelector('a > img')) {
        const links: SocialLink[] = [];
        const socialLinks = content.querySelectorAll('a');
        let isSocialBar = false;
        let isVertical = false;
        let detectedLabelGap: number | undefined = undefined;
        
        socialLinks.forEach(a => {
            const socialImg = a.querySelector('img');
            if (socialImg) {
                isSocialBar = true;
                const linkStyles = (a as HTMLElement).style;
                let labelText = '';
                // Try to find text label next to icon (inside same A or sibling?)
                // Current generator structure: A -> (Table -> TR -> TD(Icon), TD(Text)) OR A -> Icon
                // If text is present, it's typically inside a span or div
                const textContainer = a.querySelector('span') || a.querySelector('div');
                if (textContainer) {
                    labelText = textContainer.innerHTML; // Capture HTML for WYSIWYG
                    const containerStyles = textContainer.style;
                    if (containerStyles.paddingLeft) {
                         detectedLabelGap = px(containerStyles.paddingLeft);
                    }
                } else if (a.innerText.trim()) {
                    // Fallback if no container but text exists
                     labelText = a.innerText.trim();
                }

                if (linkStyles.display === 'block' || linkStyles.marginBottom) {
                    isVertical = true;
                }

                links.push({
                    id: uuidv4(),
                    url: a.href,
                    formatLinkAsTel: a.href.startsWith('tel:'),
                    iconType: 'custom',
                    customIconUrl: socialImg.src,
                    width: px(socialImg.getAttribute('width')),
                    height: px(socialImg.getAttribute('height')),
                    network: 'website',
                    text: labelText,
                    spacingLeft: px(linkStyles.marginLeft),
                    spacingRight: px(linkStyles.marginRight),
                    spacingBottom: px(linkStyles.marginBottom),
                    verticalOffset: px(linkStyles.top),
                });
            }
        });

        if (isSocialBar) {
            return {
                id: uuidv4(),
                type: ComponentType.Socials,
                displayName: 'Social Icons',
                links,
                iconColor: '#555555',
                layout: isVertical ? 'vertical' : 'horizontal',
                labelGap: detectedLabelGap,
                ...commonPadding,
            } as SocialsItem;
        }
    }
    
    const img = (content.querySelector('img') || (content.tagName === 'IMG' ? content : null)) as HTMLImageElement | null;
    if (img) {
        const link = content.tagName === 'A' ? (content as HTMLAnchorElement) : null;
        return {
            id: uuidv4(),
            type: ComponentType.Image,
            displayName: 'Image',
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
            width: px(img.getAttribute('width') || img.style.width),
            link: link ? (link.href.startsWith('tel:') ? link.href.substring(4) : link.href) : '',
            formatLinkAsTel: !!(link?.href.startsWith('tel:')),
            ...commonPadding,
        } as ImageItem;
    }

    if (content.tagName === 'DIV' && (inlineStyles.backgroundColor || inlineStyles.background) && px(inlineStyles.height) > 0) {
        const widthStr = inlineStyles.width || '100%';
        const width = parseFloat(widthStr) || 100;
        const widthUnit = widthStr.includes('px') ? 'px' : '%';
        
        return {
            id: uuidv4(),
            type: ComponentType.Divider,
            displayName: 'Divider',
            height: px(inlineStyles.height),
            width,
            widthUnit,
            color: inlineStyles.background || inlineStyles.backgroundImage || inlineStyles.backgroundColor,
            ...commonPadding,
        } as DividerItem;
    }
    
    // Check for Table divider (Outlook fix structure)
    if (content.tagName === 'TABLE') {
        const td = content.querySelector('td') as HTMLTableCellElement | null;
        if (td && (td.style.backgroundColor || td.style.background) && px(td.style.height) > 0) {
            const widthStr = (content as HTMLTableElement).style.width || '100%';
            const width = parseFloat(widthStr) || 100;
            const widthUnit = widthStr.includes('px') ? 'px' : '%';
            return {
                id: uuidv4(),
                type: ComponentType.Divider,
                displayName: 'Divider',
                height: px(td.style.height),
                width,
                widthUnit,
                color: td.style.background || td.style.backgroundImage || td.style.backgroundColor,
                ...commonPadding,
            } as DividerItem;
        }
    }
    
    if (content.tagName === 'DIV' && px(inlineStyles.height) > 0) {
        return {
            id: uuidv4(),
            type: ComponentType.Spacer,
            displayName: 'Spacer',
            height: px(inlineStyles.height),
            ...commonPadding,
        } as SpacerItem;
    }

    return null;
}

export function parseHtmlToState(html: string): { builderState: BuilderState, customFonts: CustomFont[] } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const customFonts: CustomFont[] = [];

    // Extract fonts
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach(style => {
        const css = style.innerHTML;
        
        // Check for imports
        const importMatches = css.match(/@import url\(['"](.+?)['"]\);/g);
        if (importMatches) {
            importMatches.forEach(match => {
                const urlMatch = match.match(/@import url\(['"](.+?)['"]\);/);
                if (urlMatch && urlMatch[1]) {
                    const url = urlMatch[1];
                    let name = 'Unknown';
                    if (url.includes('family=')) {
                         const nameMatch = url.match(/family=([^&:]+)/);
                         if (nameMatch) {
                             name = nameMatch[1].replace(/\+/g, ' ');
                         }
                    }
                    customFonts.push({ name, url, source: 'google' });
                }
            });
        }
        
        // Check for font-face
        const fontFaceRegex = /@font-face\s*{[^}]+}/g;
        const fontFaces = css.match(fontFaceRegex);
        if (fontFaces) {
             fontFaces.forEach(block => {
                 const familyMatch = block.match(/font-family:\s*['"]?([^;'"]+)['"]?/);
                 const srcMatch = block.match(/src:\s*url\(['"]?([^)'"]+)['"]?\)/);
                 if (familyMatch && srcMatch) {
                     customFonts.push({
                         name: familyMatch[1],
                         url: srcMatch[1],
                         source: 'url',
                         rawCss: block
                     });
                 }
             });
        }
    });

    const mainTable = (doc.querySelector('body > table') || doc.querySelector('table')) as HTMLTableElement | null;
    if (!mainTable) {
        throw new HtmlParsingError("No table found in signature HTML.");
    }

    const mainTableStyles = mainTable.style;
    
    // Extract max width
    let maxWidth = 600; // default
    if (mainTableStyles.maxWidth) {
        maxWidth = parseInt(mainTableStyles.maxWidth, 10) || 600;
    } else if (mainTable.width) {
         maxWidth = parseInt(mainTable.width, 10) || 600;
    }

    // Extract table properties
    const tableProperties: TableProperties = {
        border: 0,
        cellSpacing: parseInt(mainTable.getAttribute('cellspacing') || '0', 10) || 0
    };
    
    if (mainTableStyles.borderWidth) {
        tableProperties.border = parseInt(mainTableStyles.borderWidth, 10) || 0;
    } else if (mainTable.getAttribute('border')) {
        tableProperties.border = parseInt(mainTable.getAttribute('border') || '0', 10) || 0;
    }

    const rows: RowItem[] = [];
    const mainTrs = Array.from(mainTable.querySelectorAll(':scope > tbody > tr'));

    mainTrs.forEach(tr => {
        const wrappingTd = tr.querySelector(':scope > td') as HTMLTableCellElement | null;
        if (!wrappingTd) return;
        
        const rowTable = wrappingTd.querySelector(':scope > table');
        if (rowTable) {
            const rowItem = parseRow(rowTable as HTMLTableElement, wrappingTd.style);
            
            // Re-attach background color logic if it was on the wrapper TD
            if (!rowItem.backgroundColor && wrappingTd.getAttribute('bgcolor')) {
                rowItem.backgroundColor = wrappingTd.getAttribute('bgcolor') || '';
            }
            if (!rowItem.backgroundColor && wrappingTd.style.backgroundColor) {
                 rowItem.backgroundColor = wrappingTd.style.backgroundColor;
            }

            rows.push(rowItem);
        }
    });

    return {
        builderState: {
            rows,
            maxWidth,
            tableProperties
        },
        customFonts
    };
}
