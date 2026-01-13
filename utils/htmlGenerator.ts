
import { RowItem, SignatureItem, ComponentType, TextItem, ImageItem, SocialsItem, IconsItem, IconLink, SpacerItem, DividerItem, ButtonItem, SocialLink, TableProperties, Cell, CustomFont, ConditionalFormat, ContainerItem } from '../types';
import { socialIconToHtml, contactIconToHtml } from './socialIconToHtml';
import { getFontStack } from './fontUtils';

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
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    return `tel:${cleanedNumber}`;
}

const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function applyConditionalFormats(htmlContent: string, formats: ConditionalFormat[]): string {
    if (!formats || formats.length === 0) {
        return htmlContent;
    }
    let processedHtml = htmlContent;

    formats.forEach(({ textToMatch, format, scopeWord }) => {
        if (!textToMatch) return;
        const tag = format === 'bold' ? 'b' : 'sup';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = processedHtml;

        const walk = (node: Node) => {
            if (node.nodeType === 3) {
                const textNode = node as Text;
                let text = textNode.textContent || '';
                let shouldReplace = false;
                if (scopeWord) {
                    if (text.includes(scopeWord)) {
                        const newHtml = text.replace(new RegExp(escapeRegExp(scopeWord), 'g'), (wordMatch) => {
                            return wordMatch.replace(new RegExp(escapeRegExp(textToMatch), 'g'), `<${tag}>${textToMatch}</${tag}>`);
                        });
                        if (newHtml !== text) {
                            text = newHtml;
                            shouldReplace = true;
                        }
                    }
                } else {
                    if (text.includes(textToMatch)) {
                        text = text.replace(new RegExp(escapeRegExp(textToMatch), 'g'), `<${tag}>${textToMatch}</${tag}>`);
                        shouldReplace = true;
                    }
                }
                if (shouldReplace) {
                    const fragment = document.createRange().createContextualFragment(text);
                    if (textNode.parentNode) {
                        textNode.parentNode.replaceChild(fragment, textNode);
                    }
                }
            } else if (node.nodeType === 1) {
                const tagName = (node as Element).tagName.toLowerCase();
                if (tagName !== 'b' && tagName !== 'sup') {
                    Array.from(node.childNodes).forEach(walk);
                }
            }
        };
        walk(tempDiv);
        processedHtml = tempDiv.innerHTML;
    });
    return processedHtml;
}

// Helper to parse background values (solid vs gradient) for Outlook compatibility
function getBackgroundProps(value: string | undefined): { style: string; bgcolorAttr: string } {
    if (!value) return { style: '', bgcolorAttr: '' };
    
    if (value.includes('gradient')) {
        // Extract start color for fallback
        // Matches first hex code or color name in the gradient string roughly
        const colorMatch = value.match(/#[0-9a-fA-F]{3,6}|rgba?\(.*?\)|[a-z]+/);
        const fallback = colorMatch ? colorMatch[0] : '#ffffff';
        return {
            style: `background: ${value};`,
            bgcolorAttr: `bgcolor="${fallback}"`
        };
    }
    
    return {
        style: `background-color: ${value};`,
        bgcolorAttr: `bgcolor="${value}"`
    };
}


// Forward declaration needed if strict
// function generateRowHtml(...) 

function generateComponentHtml(item: SignatureItem, isEditable = false): string {
  const editableAttr = isEditable ? ' contenteditable="true" spellcheck="false"' : '';
  switch (item.type) {
    case ComponentType.Row:
    case ComponentType.Container:
        // Recursive call for nested rows/containers
        return generateRowHtml(item as RowItem, isEditable);
    case ComponentType.Text: {
      const { content, fontSize, fontWeight, color, link, fontFamily, formatLinkAsTel, conditionalFormats, lineHeight } = item as TextItem;
      const fontStack = getFontStack(fontFamily);
      const style = `font-family: ${fontStack}; font-size: ${fontSize}px; font-weight: ${fontWeight}; color: ${color}; margin: 0; padding: 0; line-height: ${lineHeight}; word-break: break-word;`;
      
      const isHtml = /<[a-z][\s\S]*>/i.test(content);
      let htmlContent = isHtml ? content : encodeHtmlEntities(content).replace(/\n/g, '<br />');

      if (conditionalFormats && conditionalFormats.length > 0) {
          htmlContent = applyConditionalFormats(htmlContent, conditionalFormats);
      }

      if (link) {
          const finalLink = formatLinkAsTel ? formatTelLink(link) : link;
          const linkStyle = `text-decoration: none; ${style}`;
          const telAttr = (isEditable && formatLinkAsTel) ? ' data-editable-tel="true"' : '';
          return `<a href="${finalLink}" target="_blank" style="${linkStyle}"${telAttr}${editableAttr}>${htmlContent}</a>`;
      }
      return `<div style="${style}"${editableAttr}>${htmlContent}</div>`;
    }
    case ComponentType.Image: {
      const { src, alt, width, link, formatLinkAsTel } = item as ImageItem;
      const imgSrc = src || `https://via.placeholder.com/${width}`;
      const imgTag = `<img src="${imgSrc}" alt="${encodeHtmlEntities(alt)}" width="${width}" border="0" style="display: block; border: 0; max-width: 100%;" />`;
      if (link) {
        if (isEditable && formatLinkAsTel) {
            return imgTag;
        }
        const finalLink = formatLinkAsTel ? formatTelLink(link) : link;
        return `<a href="${finalLink}" target="_blank">${imgTag}</a>`;
      }
      return imgTag;
    }
    case ComponentType.Socials: {
      const { links, iconColor, layout, labelFontFamily, labelFontSize, labelFontWeight, labelColor, labelGap, gap: parentGap } = item as SocialsItem;
      const fontStack = getFontStack(labelFontFamily || 'Arial');
      const labelStyle = `font-family: ${fontStack}; font-size: ${labelFontSize || 12}px; font-weight: ${labelFontWeight || 'normal'}; color: ${labelColor || '#333333'}; line-height: 1.2;`;
      const isVertical = layout === 'vertical';
      const gapValue = parentGap !== undefined ? parentGap : 8;
      const labelGapValue = labelGap !== undefined ? labelGap : 8;

      const iconsHtml = links.map((link, index) => {
          const commonStyles: string[] = [];
          if (isVertical) {
              commonStyles.push('display: block;');
              // Apply gap unless it's the last item
              const marginBottom = (link.spacingBottom || 0) || (index < links.length - 1 ? gapValue : 0);
              if (marginBottom > 0) {
                  commonStyles.push(`margin-bottom: ${marginBottom}px;`);
              }
          } else {
              commonStyles.push('display: inline-block;');
              const marginLeft = link.spacingLeft || 0;
              if (marginLeft > 0) {
                  commonStyles.push(`margin-left: ${marginLeft}px;`);
              }
              // Apply gap unless it's the last item
              const marginRight = (link.spacingRight || 0) || (index < links.length - 1 ? gapValue : 0);
              if (marginRight > 0) {
                  commonStyles.push(`margin-right: ${marginRight}px;`);
              }
          }
          if (link.verticalOffset !== 0 && link.verticalOffset !== undefined) {
               commonStyles.push('position: relative;');
               commonStyles.push(`top: ${link.verticalOffset}px;`);
          }
          let iconHtml: string;
          if (link.iconType === 'custom' && link.customIconUrl) {
              iconHtml = `<img src="${link.customIconUrl}" width="${link.width}" height="${link.height}" alt="${link.network} icon" border="0" style="display: block; border: 0;" />`;
          } else {
              iconHtml = socialIconToHtml(link.network, link.width, link.height, iconColor);
          }
          
          const finalLink = link.formatLinkAsTel ? formatTelLink(link.url) : link.url;
          
          if (link.text) {
               const textStyle = `${labelStyle} padding-left: ${labelGapValue}px; text-decoration: none;`;
               const tableStyles = `display: inline-table; vertical-align: middle; ${commonStyles.join(' ')}`;
               const linkStart = `<a href="${finalLink}" target="_blank" style="text-decoration: none;">`;
               const linkEnd = `</a>`;
               
               return `
                <table cellpadding="0" cellspacing="0" border="0" style="${tableStyles}">
                    <tr>
                        <td valign="middle" style="line-height: 0;">${linkStart}${iconHtml}${linkEnd}</td>
                        <td valign="middle" style="${textStyle}">${linkStart}${link.text}${linkEnd}</td>
                    </tr>
                </table>
               `;
          } else {
              const linkStyles = ['text-decoration: none;', ...commonStyles];
              return `<a href="${finalLink}" target="_blank" style="${linkStyles.join(' ')}">${iconHtml}</a>`;
          }
      }).join('');
      return `<div>${iconsHtml}</div>`;
    }
    case ComponentType.Icons: {
      const { links, iconColor, layout, labelFontFamily, labelFontSize, labelFontWeight, labelColor, labelGap, gap: parentGap } = item as IconsItem;
      const fontStack = getFontStack(labelFontFamily || 'Arial');
      const labelStyle = `font-family: ${fontStack}; font-size: ${labelFontSize || 12}px; font-weight: ${labelFontWeight || 'normal'}; color: ${labelColor || '#333333'}; line-height: 1.2;`;
      const isVertical = layout === 'vertical';
      const gapValue = parentGap !== undefined ? parentGap : 8;
      const labelGapValue = labelGap !== undefined ? labelGap : 8;

      const iconsHtml = links.map((link, index) => {
          const commonStyles: string[] = [];
          if (isVertical) {
              commonStyles.push('display: block;');
              // Apply gap unless it's the last item
              const marginBottom = (link.spacingBottom || 0) || (index < links.length - 1 ? gapValue : 0);
              if (marginBottom > 0) {
                  commonStyles.push(`margin-bottom: ${marginBottom}px;`);
              }
          } else {
              commonStyles.push('display: inline-block;');
              const marginLeft = link.spacingLeft || 0;
              if (marginLeft > 0) {
                  commonStyles.push(`margin-left: ${marginLeft}px;`);
              }
              // Apply gap unless it's the last item
              const marginRight = (link.spacingRight || 0) || (index < links.length - 1 ? gapValue : 0);
              if (marginRight > 0) {
                  commonStyles.push(`margin-right: ${marginRight}px;`);
              }
          }
          if (link.verticalOffset !== 0 && link.verticalOffset !== undefined) {
               commonStyles.push('position: relative;');
               commonStyles.push(`top: ${link.verticalOffset}px;`);
          }
          let iconHtml: string;
          if (link.iconType === 'custom' && link.customIconUrl) {
              iconHtml = `<img src="${link.customIconUrl}" width="${link.width}" height="${link.height}" alt="contact icon" border="0" style="display: block; border: 0;" />`;
          } else {
              iconHtml = contactIconToHtml(link.icon, link.width, link.height, iconColor);
          }
          
          const finalLink = link.formatLinkAsTel ? formatTelLink(link.url) : link.url;
          
          if (link.text) {
               const textStyle = `${labelStyle} padding-left: ${labelGapValue}px; text-decoration: none;`;
               const tableStyles = `display: inline-table; vertical-align: middle; ${commonStyles.join(' ')}`;
               const linkStart = `<a href="${finalLink}" target="_blank" style="text-decoration: none;">`;
               const linkEnd = `</a>`;
               
               return `
                <table cellpadding="0" cellspacing="0" border="0" style="${tableStyles}">
                    <tr>
                        <td valign="middle" style="line-height: 0;">${linkStart}${iconHtml}${linkEnd}</td>
                        <td valign="middle" style="${textStyle}">${linkStart}${link.text}${linkEnd}</td>
                    </tr>
                </table>
               `;
          } else {
              const linkStyles = ['text-decoration: none;', ...commonStyles];
              return `<a href="${finalLink}" target="_blank" style="${linkStyles.join(' ')}">${iconHtml}</a>`;
          }
      }).join('');
      return `<div>${iconsHtml}</div>`;
    }
    case ComponentType.Spacer: {
      const { height } = item as SpacerItem;
      return `<div style="height: ${height}px; line-height: ${height}px; font-size: ${height}px;">&nbsp;</div>`;
    }
    case ComponentType.Divider: {
        const { height, color, width, widthUnit } = item as DividerItem;
        const { style, bgcolorAttr } = getBackgroundProps(color);
        return `
            <table cellpadding="0" cellspacing="0" border="0" width="${width}${widthUnit}" style="width: ${width}${widthUnit};">
                <tr>
                    <td ${bgcolorAttr} height="${height}" style="${style} height: ${height}px; line-height: ${height}px; font-size: 1px;">&nbsp;</td>
                </tr>
            </table>
        `;
    }
    case ComponentType.Button: {
        const { text, link, backgroundColor, textColor, fontSize, fontWeight, borderRadius, fontFamily, formatLinkAsTel } = item as ButtonItem;
        const fontStack = getFontStack(fontFamily);
        const finalLink = formatLinkAsTel ? formatTelLink(link) : link;
        
        const { style: bgStyle, bgcolorAttr } = getBackgroundProps(backgroundColor);

        const buttonTable = `
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                <tr>
                    <td ${bgcolorAttr} style="${bgStyle} border-radius: ${borderRadius}px; padding: 8px 16px; text-align: center;">
                        <a href="${finalLink}" target="_blank" style="color: ${textColor}; font-family: ${fontStack}; font-size: ${fontSize}px; font-weight: ${fontWeight}; text-decoration: none; display: inline-block; border: none; cursor: pointer;">
                            ${encodeHtmlEntities(text)}
                        </a>
                    </td>
                </tr>
            </table>
        `;
        return buttonTable;
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

    if (cell.height && cell.height > 0) {
        styles.push(`height: ${cell.height}px;`);
    }

    if (cell.backgroundColor) {
        const { style } = getBackgroundProps(cell.backgroundColor);
        styles.push(style);
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

function generateRowHtml(row: RowItem, isEditable: boolean): string {
    const cellsHtml = row.cells.map(cell => {
        const isColumnLayout = cell.direction !== 'row'; // default column
        const alignItems = cell.alignItems || 'flex-start';
        const justifyContent = cell.justifyContent || 'flex-start';
        
        const innerItemsHtml = cell.items.map(item => {
            let align = 'left';
            let valign = 'top';

            if (isColumnLayout) {
                if (justifyContent === 'center') valign = 'middle';
                if (justifyContent === 'flex-end') valign = 'bottom';
                if (alignItems === 'center') align = 'center';
                if (alignItems === 'flex-end') align = 'right';
            } else {
                if (justifyContent === 'center') align = 'center';
                if (justifyContent === 'flex-end') align = 'right';
                if (alignItems === 'center') valign = 'middle';
                if (alignItems === 'flex-end') valign = 'bottom';
            }

            if (item.type === ComponentType.Spacer || item.type === ComponentType.Divider) {
                align = 'left';
            }

            const pt = item.paddingTop || 0;
            const pr = item.paddingRight || 0;
            const pb = item.paddingBottom || 0;
            const pl = item.paddingLeft || 0;
            const paddingStyle = `padding: ${pt}px ${pr}px ${pb}px ${pl}px;`;
            const content = generateComponentHtml(item, isEditable);

            if (isColumnLayout) {
                return `<tr><td align="${align}" valign="${valign}" style="${paddingStyle} line-height: 1.4;">${content}</td></tr>`;
            } else {
                return `<td valign="${valign}" align="${align}" style="${paddingStyle} line-height: 1.4;">${content}</td>`;
            }
        }).join('');
        
        let innerComponentTable: string;
        
        const justifyStyle = justifyContent.startsWith('space') ? `justify-content: ${justifyContent}; display: flex;` : '';
        const width100 = justifyContent.startsWith('space') ? 'width="100%"' : '';
        const widthStyle = justifyContent.startsWith('space') ? 'width: 100%;' : '';
        
        if (isColumnLayout) {
             innerComponentTable = `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;"><tbody>${innerItemsHtml}</tbody></table>`;
        } else {
             innerComponentTable = `<table cellpadding="0" cellspacing="0" border="0" ${width100} style="border-collapse: collapse; ${justifyStyle} ${widthStyle}"><tbody><tr>${innerItemsHtml}</tr></tbody></table>`;
        }
        
        const widthAttr = cell.width > 0 ? `width="${cell.width}"` : '';
        const heightAttr = (cell.height && cell.height > 0) ? `height="${cell.height}"` : '';
        const cellStyles = generateCellStyles(cell);
        const { bgcolorAttr } = getBackgroundProps(cell.backgroundColor);

        return `<td ${widthAttr} ${heightAttr} valign="${cell.vAlign}" ${bgcolorAttr} style="${cellStyles}">${innerComponentTable}</td>`;
    }).join('');

    const rowBorderStyle: string[] = [];
    const { borders } = row;
    if (borders.borderTop > 0) rowBorderStyle.push(`border-top: ${borders.borderTop}px solid ${borders.borderColor};`);
    if (borders.borderRight > 0) rowBorderStyle.push(`border-right: ${borders.borderRight}px solid ${borders.borderColor};`);
    if (borders.borderBottom > 0) rowBorderStyle.push(`border-bottom: ${borders.borderBottom}px solid ${borders.borderColor};`);
    if (borders.borderLeft > 0) rowBorderStyle.push(`border-left: ${borders.borderLeft}px solid ${borders.borderColor};`);
    if (borders.borderRadius > 0) rowBorderStyle.push(`border-radius: ${borders.borderRadius}px;`);
    
    if (row.backgroundColor) {
        const { style } = getBackgroundProps(row.backgroundColor);
        rowBorderStyle.push(style);
    }
    
    const { bgcolorAttr: rowBgcolorAttr } = getBackgroundProps(row.backgroundColor);
    
    // Define rowPaddingStyle and rowTable to fix "Cannot find name" errors.
    const pt = row.paddingTop || 0;
    const pb = row.paddingBottom || 0;
    const rowPaddingStyle = `padding: ${pt}px 0 ${pb}px 0; ${rowBorderStyle.join(' ')}`;
    const rowTable = `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; width: 100%;"><tbody><tr>${cellsHtml}</tr></tbody></table>`;

    return `<tr><td ${rowBgcolorAttr} style="${rowPaddingStyle}">${rowTable}</td></tr>`;
}


export function generateSignatureHtml(rows: RowItem[], maxWidth: number, tableProperties: TableProperties, customFonts: CustomFont[] = [], isEditable = false): string {
    const googleFontImports = customFonts
      .filter(f => f.source === 'google')
      .map(font => `@import url('${font.url}');`)
      .join('\n');
    const fontFaces = customFonts
      .filter(f => f.source === 'url')
      .map(font => {
          if (font.rawCss) return font.rawCss;
          return `@font-face { font-family: '${font.name}'; src: url('${font.url}'); }`;
      })
      .join('\n');

    const fontStyleBlock = (googleFontImports || fontFaces) 
        ? `<style type="text/css">\n@media screen {\n${googleFontImports}\n${fontFaces}\n}\n</style>` 
        : '';

    const editableBlock = isEditable ? `
<style type="text/css">
  [contenteditable="true"]:focus { outline: none; }
  a[contenteditable="true"] { pointer-events: none; cursor: text; }
</style>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    var phoneLinks = document.querySelectorAll('a[data-editable-tel="true"]');
    phoneLinks.forEach(function(link) {
      link.addEventListener('input', function(e) {
        var newText = e.target.textContent || '';
        var cleanedNumber = newText.replace(/[^\\d+]/g, '');
        if (cleanedNumber) {
          e.target.href = 'tel:' + cleanedNumber;
        }
      });
    });
  });
</script>
    `.trim() : '';
    
    const tableRowsHtml = rows.map(row => generateRowHtml(row, isEditable)).join('');

    const maxWidthStyle = maxWidth > 0 ? `max-width: ${maxWidth}px; width: 100%;` : 'width: auto;';
    const mainTableBorderStyle = tableProperties.border > 0 ? `border: ${tableProperties.border}px solid #000;` : 'border: 0;';
    
    return `
${editableBlock}
${fontStyleBlock}
<table cellpadding="0" cellspacing="${tableProperties.cellSpacing}" border="0" style="border-collapse: collapse; ${maxWidthStyle} ${mainTableBorderStyle}">
  <tbody>
    ${tableRowsHtml}
  </tbody>
</table>
  `.trim();
}

export function resolveMappings(rows: RowItem[], data: Record<string, string>): RowItem[] {
    const clonedRows: RowItem[] = JSON.parse(JSON.stringify(rows));

    const resolveValue = (value: any, mappingKey: string, data: Record<string, string>) => {
        if (value[mappingKey] && data[value[mappingKey]]) {
            return data[value[mappingKey]];
        }
        return null;
    }
    
    const traverseItems = (items: SignatureItem[]) => {
        for (const item of items) {
             if (item.type === ComponentType.Row || item.type === ComponentType.Container) {
                 const row = item as RowItem;
                 for (const cell of row.cells) {
                     traverseItems(cell.items);
                 }
             } else {
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
                    case ComponentType.Icons:
                        item.links.forEach((link: IconLink) => {
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
    
    for (const row of clonedRows) {
        for (const cell of row.cells) {
            traverseItems(cell.items);
        }
    }

    return clonedRows;
}

export function generateBulkSignatureHtml(templateRows: RowItem[], csvData: Record<string, string>[], maxWidth: number, tableProperties: TableProperties, customFonts: CustomFont[], isEditable = false): string[] {
    return csvData.map(dataRow => {
        const resolvedRows = resolveMappings(templateRows, dataRow);
        return generateSignatureHtml(resolvedRows, maxWidth, tableProperties, customFonts, isEditable);
    });
}
