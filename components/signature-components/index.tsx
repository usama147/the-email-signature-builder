
import React from 'react';
import { TextItem, ImageItem, SocialsItem, IconsItem, SpacerItem, DividerItem, ButtonItem } from '../../types';
import { SocialIcon, ContactIcon } from '../icons';
import { getFontStack } from '../../utils/fontUtils';

export const TextComponent: React.FC<TextItem> = (item) => {
  const fontStack = getFontStack(item.fontFamily);
  const style: React.CSSProperties = {
    fontSize: `${item.fontSize}px`,
    fontWeight: item.fontWeight,
    color: item.color,
    margin: 0,
    padding: 0,
    lineHeight: item.lineHeight,
    wordBreak: 'break-word',
    display: 'inline-block',
    fontFamily: fontStack,
  };
  
  const content = item.contentMapping ? `{{${item.contentMapping}}}` : item.content;
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  const htmlContent = isHtml ? content : content.replace(/\n/g, '<br />');

  const link = item.linkMapping ? `{{${item.linkMapping}}}` : item.link;
  
  const innerContent = <div style={style} dangerouslySetInnerHTML={{ __html: htmlContent }}></div>;

  if (link) {
      return (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ ...style, textDecoration: 'none' }}>
           {innerContent}
        </a>
      );
  }

  return innerContent;
};

export const ImageComponent: React.FC<ImageItem> = (item) => {
  const src = item.srcMapping ? `{{${item.srcMapping}}}` : (item.src || 'https://picsum.photos/100');
  const link = item.linkMapping ? `{{${item.linkMapping}}}` : item.link;
  const image = <img src={src} alt={item.alt} width={item.width} style={{ display: 'block', maxWidth: '100%' }} />;
  if (link) {
    return <a href={link} target="_blank" rel="noopener noreferrer">{image}</a>;
  }
  return image;
};

export const SocialsComponent: React.FC<SocialsItem> = (item) => {
    const isVertical = item.layout === 'vertical';
    const fontStack = getFontStack(item.labelFontFamily || 'Arial');
    const labelStyle: React.CSSProperties = {
        fontFamily: fontStack,
        fontSize: `${item.labelFontSize || 12}px`,
        fontWeight: item.labelFontWeight || 'normal',
        color: item.labelColor || '#333333',
        marginLeft: `${item.labelGap !== undefined ? item.labelGap : 8}px`,
        lineHeight: 1.2
    };

    return (
    <div style={{ 
        display: 'flex', 
        flexDirection: isVertical ? 'column' : 'row', 
        flexWrap: 'wrap', 
        alignItems: 'center',
        gap: `${item.gap ?? 10}px` 
    }}>
        {item.links.map((link) => {
        const url = link.urlMapping ? `{{${link.urlMapping}}}` : link.url;
        
        const renderIcon = () => {
            if (link.iconType === 'custom') {
                const customIconUrl = link.customIconUrlMapping ? `{{${link.customIconUrlMapping}}}` : link.customIconUrl;
                return <img src={customIconUrl} width={link.width} height={link.height} alt="Custom Social Icon" />
            }
            return <SocialIcon network={link.network} width={link.width} height={link.height} color={item.iconColor} />;
        };
        
        const linkStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            top: `${link.verticalOffset || 0}px`,
            textDecoration: 'none',
        };

        return (
            <a key={link.id} href={url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                {renderIcon()}
                {link.text && (
                    <div style={labelStyle} dangerouslySetInnerHTML={{ __html: link.text }}></div>
                )}
            </a>
        )
        })}
    </div>
    );
};

export const IconsComponent: React.FC<IconsItem> = (item) => {
    const isVertical = item.layout === 'vertical';
    const fontStack = getFontStack(item.labelFontFamily || 'Arial');
    const labelStyle: React.CSSProperties = {
        fontFamily: fontStack,
        fontSize: `${item.labelFontSize || 12}px`,
        fontWeight: item.labelFontWeight || 'normal',
        color: item.labelColor || '#333333',
        marginLeft: `${item.labelGap !== undefined ? item.labelGap : 8}px`,
        lineHeight: 1.2
    };

    return (
    <div style={{ 
        display: 'flex', 
        flexDirection: isVertical ? 'column' : 'row', 
        flexWrap: 'wrap', 
        alignItems: 'center',
        gap: `${item.gap ?? 10}px`
    }}>
        {item.links.map((link) => {
        const url = link.urlMapping ? `{{${link.urlMapping}}}` : link.url;
        
        const renderIcon = () => {
            if (link.iconType === 'custom') {
                const customIconUrl = link.customIconUrlMapping ? `{{${link.customIconUrlMapping}}}` : link.customIconUrl;
                return <img src={customIconUrl} width={link.width} height={link.height} alt="Custom Icon" />
            }
            return <ContactIcon icon={link.icon} width={link.width} height={link.height} color={item.iconColor} />;
        };
        
        const linkStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            top: `${link.verticalOffset || 0}px`,
            textDecoration: 'none',
        };

        return (
            <a key={link.id} href={url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                {renderIcon()}
                {link.text && (
                    <div style={labelStyle} dangerouslySetInnerHTML={{ __html: link.text }}></div>
                )}
            </a>
        )
        })}
    </div>
    );
};

export const SpacerComponent: React.FC<SpacerItem> = (item) => (
  <div style={{ width: '100%', height: `${item.height}px`, lineHeight: `${item.height}px`, fontSize: '1px' }}>&nbsp;</div>
);

export const DividerComponent: React.FC<DividerItem> = (item) => (
    <table cellPadding="0" cellSpacing="0" style={{ width: `${item.width}${item.widthUnit}`, borderCollapse: 'collapse' }}>
        <tbody>
            <tr>
                <td style={{ background: item.color, height: `${item.height}px`, lineHeight: `${item.height}px`, fontSize: '1px' }}>&nbsp;</td>
            </tr>
        </tbody>
    </table>
);

export const ButtonComponent: React.FC<ButtonItem> = (item) => {
    const fontStack = getFontStack(item.fontFamily);
    const style: React.CSSProperties = {
        background: item.backgroundColor, // Use 'background' to support gradients
        color: item.textColor,
        fontSize: `${item.fontSize}px`,
        fontWeight: item.fontWeight,
        borderRadius: `${item.borderRadius}px`,
        padding: '8px 16px',
        textDecoration: 'none',
        display: 'inline-block',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'center',
        fontFamily: fontStack,
    };
    const text = item.textMapping ? `{{${item.textMapping}}}` : item.text;
    const link = item.linkMapping ? `{{${item.linkMapping}}}` : item.link;

    return <a href={link} target="_blank" rel="noopener noreferrer" style={style}>{text}</a>
}
