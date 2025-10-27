import { RowItem, SignatureItem, ComponentType, TextItem, ImageItem, SocialsItem, SpacerItem, DividerItem, ButtonItem, SocialLink, TableProperties, Cell, CustomFont } from '../types';
import { socialIconToHtml } from './socialIconToHtml';

const encodeHtmlEntities = (text: string): string => {
    const entities: {[key: string]: string} = {
        '¢': '&cent;', '£': '&pound;', '¥': '&yen;', '€': '&euro;', '©': '&copy;', '®': '&reg;',
        'ä': '&auml;', 'ö': '&ouml;', 'ü': '&uuml;', 'Ä': '&Auml;', 'Ö': '&Ouml;', 'Ü': '&Uuml;', 'ß': '&szlig;',
        'à': '&agrave;', 'á': '&aacute;', 'â': '&acirc;', 'ã': '&atilde;', 'å': '&aring;', 'æ': '&aelig;',
        'ç': '&ccedil;', 'è': '&egrave;', 'é': '&eacute;', 'ê': '&ecirc;', 'ë': '&euml;', 'ì': '&igrave;',
        'í': '&iacute;', 'î': '&icirc;', 'ï': '&iuml;', 'ð': '&eth;', 'ñ': '&ntilde;', 'ò': '&ograve;',
        'ó': '&oacute;', 'ô': '&ocirc;', 'õ': '&otilde;', 'ø': '&oslash;', 'ù': '&ugrave;', 'ú': '&uacute;',
        'û': '&ucirc;', 'ý': '&yacute;', 'þ': '&thorn;', 'ÿ': '&yuml;',
    };
    return text.replace(/[¢£¥€©®äöüÄÖÜßàáâãåæçèéêëìíîïðñòóôõøùúûýþÿ]/g, char => entities[char]);
};

const formatTelLink = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    // Keep the plus sign and all digits, remove everything else like spaces, dashes, or parentheses.
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    return `tel:${cleanedNumber}`;
}


function generateComponentHtml(item: SignatureItem): string {
  switch (item.type) {
    case ComponentType.Text: {
      const { content, fontSize, fontWeight, color, link, fontFamily, formatLinkAsTel } = item as TextItem;
      const style = `font-family: '${fontFamily}', Arial, sans-serif; font-size: ${fontSize}px; font-weight: ${fontWeight}; color: ${color}; margin: 0; padding: 0; line-height: 1.4; word-break: break-word;`;
      
      const isHtml = /<[a-z][\s\S]*>/i.test(content);
      const htmlContent = isHtml ? content : encodeHtmlEntities(content).replace(/\n/g, '<br />');

      if (link) {
          const finalLink = formatLinkAsTel ? formatTelLink(link) : link;
          const linkStyle = `text-decoration: none; ${style}`;
          return `<a href="${finalLink}" target="_blank" style="${linkStyle}">${htmlContent}</a>`;
      }
      return `<div style="${style}">${htmlContent}</div>`;
    }
    case ComponentType.Image: {
      const { src, alt, width, link, formatLinkAsTel } = item as ImageItem;
      const imgSrc = src || `https://via.placeholder.com/${width}`;
      const imgTag = `<img src="${imgSrc}" alt="${encodeHtmlEntities(alt)}" width="${width}" border="0" style="display: block; border: 0; max-width: 100%;" />`;
      if (link) {
        const finalLink = formatLinkAsTel ? formatTelLink(link) : link;
        return `<a href="${finalLink}" target="_blank">${imgTag}</a>`;
      }
      return imgTag;
    }
    case ComponentType.Socials: {
      const { links, iconColor } = item as SocialsItem;
      const iconsHtml = links
        .map((link) => {
            const finalLink = link.formatLinkAsTel ? formatTelLink(link.url) : link.url;
            const linkStart = `<a href="${finalLink}" target="_blank" style="text-decoration: none; display: inline-block;">`;
            const linkEnd = `</a>`;
            let iconHtml: string;
            if (link.iconType === 'custom' && link.customIconUrl) {
                iconHtml = `<img src="${link.customIconUrl}" width="${link.width}" height="${link.height}" alt="${link.network} icon" border="0" style="display: block; border: 0;" />`;
            } else {
                iconHtml = socialIconToHtml(link.network, link.width, link.height, iconColor);
            }
            return `${linkStart}${iconHtml}${linkEnd}`;
        })
        .join('&nbsp;&nbsp;');
      return `<div>${iconsHtml}</div>`;
    }
    case ComponentType.Spacer: {
      const { height } = item as SpacerItem;
      return `<div style="height: ${height}px; line-height: ${height}px; font-size: ${height}px;">&nbsp;</div>`;
    }
    case ComponentType.Divider: {
        const { height, color } = item as DividerItem;
        return `<div style="width: 100%; height: ${height}px; background-color: ${color}; line-height: ${height}px; font-size: 1px;"></div>`;
    }
    case ComponentType.Button: {
        const { text, link, backgroundColor, textColor, fontSize, fontWeight, borderRadius, fontFamily, formatLinkAsTel } = item as ButtonItem;
        const style = `background-color: ${backgroundColor}; color: ${textColor}; font-family: '${fontFamily}', Arial, sans-serif; font-size: ${fontSize}px; font-weight: ${fontWeight}; border-radius: ${borderRadius}px; text-decoration: none; display: inline-block; padding: 8px 16px; border: none; text-align: center;`;
        const finalLink = formatLinkAsTel ? formatTelLink(link) : link;
        return `<a href="${finalLink}" target="_blank" style="${style}">${encodeHtmlEntities(text)}</a>`;
    }
    default:
      return '';
  }
}

function generateCellStyles(cell: Cell): string {
    const styles: string[] = [];
    const { borders } = cell;

    if (cell.width > 0) {
        styles.push(`width: ${cell.width}px;`);
    }

    if (borders.borderTop > 0) styles.push(`border-top: ${borders.borderTop}px solid ${borders.borderColor};`);
    if (borders.borderRight > 0) styles.push(`border-right: ${borders.borderRight}px solid ${borders.borderColor};`);
    if (borders.borderBottom > 0) styles.push(`border-bottom: ${borders.borderBottom}px solid ${borders.borderColor};`);
    if (borders.borderLeft > 0) styles.push(`border-left: ${borders.borderLeft}px solid ${borders.borderColor};`);

    if (borders.borderRadius > 0) {
        styles.push(`border-radius: ${borders.borderRadius}px;`);
    }
    
    const paddingTop = cell.paddingTop ?? 0;
    const paddingRight = cell.paddingRight ?? 0;
    const paddingBottom = cell.paddingBottom ?? 0;
    const paddingLeft = cell.paddingLeft ?? 0;
    
    if (paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0) {
        styles.push(`padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;`);
    }
    
    return styles.join(' ');
}


export function generateSignatureHtml(rows: RowItem[], maxWidth: number, tableProperties: TableProperties, customFonts: CustomFont[] = []): string {
    const googleFontImports = customFonts
      .filter(f => f.source === 'google')
      .map(font => `@import url('${font.url}');`)
      .join('\n');
      
    const fontFaces = customFonts
      .filter(f => f.source === 'url')
      .map(font => `@font-face { font-family: '${font.name}'; src: url('${font.url}'); }`)
      .join('\n');

    const fontStyleBlock = (googleFontImports || fontFaces) 
        ? `<style type="text/css">\n${googleFontImports}\n${fontFaces}\n</style>` 
        : '';
    
    const tableRowsHtml = rows.map(row => {
        const cellsHtml = row.cells.map(cell => {
            const innerItemsHtml = cell.items.map(item => {
                // Full-width components should not be affected by horizontal alignment
                const align = (item.type === ComponentType.Spacer || item.type === ComponentType.Divider) ? 'left' : cell.hAlign;
                return `<tr><td align="${align}" style="padding: 0; line-height: 1.4;">${generateComponentHtml(item)}</td></tr>`;
            }).join('');
            
            const innerComponentTable = `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;"><tbody>${innerItemsHtml}</tbody></table>`;
            
            const widthAttr = cell.width > 0 ? `width="${cell.width}"` : '';
            const cellStyles = generateCellStyles(cell);

            // Apply valign to the outer cell, but remove hAlign as it's now handled by the inner table cells
            return `<td ${widthAttr} valign="${cell.vAlign}" style="${cellStyles}">${innerComponentTable}</td>`;
        }).join('');

        const rowBorderStyle: string[] = [];
        const { borders } = row;
        if (borders.borderTop > 0) rowBorderStyle.push(`border-top: ${borders.borderTop}px solid ${borders.borderColor};`);
        if (borders.borderRight > 0) rowBorderStyle.push(`border-right: ${borders.borderRight}px solid ${borders.borderColor};`);
        if (borders.borderBottom > 0) rowBorderStyle.push(`border-bottom: ${borders.borderBottom}px solid ${borders.borderColor};`);
        if (borders.borderLeft > 0) rowBorderStyle.push(`border-left: ${borders.borderLeft}px solid ${borders.borderColor};`);
        if (borders.borderRadius > 0) rowBorderStyle.push(`border-radius: ${borders.borderRadius}px;`);
        
        const rowTable = `
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; ${rowBorderStyle.join(' ')}">
                <tbody>
                    <tr>
                        ${cellsHtml}
                    </tr>
                </tbody>
            </table>
        `;
        
        const rowPaddingStyle = `padding-top: ${row.paddingTop || 0}px; padding-bottom: ${row.paddingBottom || 0}px;`;
        return `<tr><td style="${rowPaddingStyle}">${rowTable}</td></tr>`;
    }).join('');

    const maxWidthStyle = maxWidth > 0 ? `max-width: ${maxWidth}px; width: 100%;` : 'width: auto;';
    const mainTableBorderStyle = tableProperties.border > 0 ? `border: ${tableProperties.border}px solid #000;` : 'border: 0;';
    
    return `
${fontStyleBlock}
<table cellpadding="0" cellspacing="${tableProperties.cellSpacing}" border="0" style="border-collapse: collapse; ${maxWidthStyle} ${mainTableBorderStyle}">
  <tbody>
    ${tableRowsHtml}
  </tbody>
</table>
  `.trim();
}

export function resolveMappings(rows: RowItem[], data: Record<string, string>): RowItem[] {
    // A bit of a hacky deep clone, but effective for this structure
    const clonedRows: RowItem[] = JSON.parse(JSON.stringify(rows));

    const resolveValue = (value: any, mappingKey: string, data: Record<string, string>) => {
        if (value[mappingKey] && data[value[mappingKey]]) {
            return data[value[mappingKey]];
        }
        return null;
    }
    
    for (const row of clonedRows) {
        for (const cell of row.cells) {
            for (const item of cell.items) {
                 switch (item.type) {
                    case ComponentType.Text:
                        item.content = resolveValue(item, 'contentMapping', data) ?? item.content;
                        item.link = resolveValue(item, 'linkMapping', data) ?? item.link;
                        break;
                    case ComponentType.Image:
                        item.src = resolveValue(item, 'srcMapping', data) ?? item.src;
                        item.link = resolveValue(item, 'linkMapping', data) ?? item.link;
                        break;
                    case ComponentType.Button:
                        item.text = resolveValue(item, 'textMapping', data) ?? item.text;
                        item.link = resolveValue(item, 'linkMapping', data) ?? item.link;
                        break;
                    case ComponentType.Socials:
                        item.links.forEach((link: SocialLink) => {
                            link.url = resolveValue(link, 'urlMapping', data) ?? link.url;
                            if (link.iconType === 'custom') {
                                link.customIconUrl = resolveValue(link, 'customIconUrlMapping', data) ?? link.customIconUrl;
                            }
                        });
                        break;
                }
            }
        }
    }

    return clonedRows;
}

export function generateBulkSignatureHtml(templateRows: RowItem[], csvData: Record<string, string>[], maxWidth: number, tableProperties: TableProperties, customFonts: CustomFont[]): string[] {
    return csvData.map(dataRow => {
        const resolvedRows = resolveMappings(templateRows, dataRow);
        return generateSignatureHtml(resolvedRows, maxWidth, tableProperties, customFonts);
    });
}