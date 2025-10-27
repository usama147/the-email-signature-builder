import React from 'react';
import { TextItem, ImageItem, SocialsItem, SpacerItem, DividerItem, ButtonItem } from '../../types';
import { SocialIcon } from '../icons';

export const TextComponent: React.FC<TextItem> = (item) => {
  const style: React.CSSProperties = {
    fontSize: `${item.fontSize}px`,
    fontWeight: item.fontWeight,
    color: item.color,
    margin: 0,
    padding: 0,
    lineHeight: '1.4',
    wordBreak: 'break-word',
    display: 'inline-block',
    fontFamily: item.fontFamily,
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

export const SocialsComponent: React.FC<SocialsItem> = (item) => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
    {item.links.map((link) => {
      const url = link.urlMapping ? `{{${link.urlMapping}}}` : link.url;
      
      const renderIcon = () => {
        if (link.iconType === 'custom') {
            const customIconUrl = link.customIconUrlMapping ? `{{${link.customIconUrlMapping}}}` : link.customIconUrl;
            return <img src={customIconUrl} width={link.width} height={link.height} alt="Custom Social Icon" />
        }
        return <SocialIcon network={link.network} width={link.width} height={link.height} color={item.iconColor} />;
      };

      return (
          <a key={link.id} href={url} target="_blank" rel="noopener noreferrer">
            {renderIcon()}
          </a>
      )
    })}
  </div>
);

export const SpacerComponent: React.FC<SpacerItem> = (item) => (
  <div style={{ width: '100%', height: `${item.height}px`, lineHeight: `${item.height}px`, fontSize: '1px' }}>&nbsp;</div>
);

export const DividerComponent: React.FC<DividerItem> = (item) => (
    <div style={{ width: '100%', height: `${item.height}px`, backgroundColor: item.color, lineHeight: `${item.height}px`, fontSize: '1px' }}></div>
);

export const ButtonComponent: React.FC<ButtonItem> = (item) => {
    const style: React.CSSProperties = {
        backgroundColor: item.backgroundColor,
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
        fontFamily: item.fontFamily,
    };
    const text = item.textMapping ? `{{${item.textMapping}}}` : item.text;
    const link = item.linkMapping ? `{{${item.linkMapping}}}` : item.link;

    return <a href={link} target="_blank" rel="noopener noreferrer" style={style}>{text}</a>
}