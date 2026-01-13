
import { SignatureTemplate, ComponentType } from './types';
import { v4 as uuidv4 } from 'uuid';

const createCell = (items: any[], width = 0) => ({
    id: uuidv4(),
    type: 'cell' as 'cell',
    items,
    width,
    vAlign: 'middle' as 'middle',
    hAlign: 'left' as 'left',
    direction: 'column' as 'column',
    borders: { borderTop: 0, borderRight: 0, borderBottom: 0, borderLeft: 0, borderColor: '#000000', borderRadius: 0 },
});

const createText = (content: string, mapping: string, fontSize = 14, fontWeight = 'normal', color = '#333333', lineHeight = 1.4) => ({
    id: uuidv4(),
    type: ComponentType.Text,
    content,
    contentMapping: mapping,
    fontSize,
    fontWeight,
    color,
    link: '',
    fontFamily: 'Arial',
    lineHeight,
});

const createImage = (mapping: string, width = 100) => ({
    id: uuidv4(),
    type: ComponentType.Image,
    src: '',
    srcMapping: mapping,
    alt: 'Company Logo',
    width,
    link: '',
});

export const presets: SignatureTemplate[] = [
    {
        id: 'preset-classic',
        name: 'Classic Professional',
        maxWidth: 550,
        tableProperties: { border: 0, cellSpacing: 0 },
        rows: [
            {
                id: uuidv4(),
                type: ComponentType.Row,
                cells: [
                    createCell([
                        createImage('LogoUrl', 100)
                    ], 120),
                    createCell([
                        createText('{{Name}}', 'Name', 16, 'bold'),
                        createText('{{Title}}', 'Title', 14, 'normal', '#555555'),
                        { id: uuidv4(), type: ComponentType.Spacer, height: 10 },
                        createText('P: {{Phone}}', 'Phone'),
                        createText('E: {{Email}}', 'Email'),
                    ], 0),
                ],
                borders: { borderTop: 0, borderRight: 0, borderBottom: 2, borderLeft: 0, borderColor: '#007bff', borderRadius: 0 },
                paddingTop: 10,
                paddingBottom: 10,
            },
            {
                id: uuidv4(),
                type: ComponentType.Row,
                cells: [
                    createCell([
                        {
                            id: uuidv4(),
                            type: ComponentType.Socials,
                            links: [
                                { id: uuidv4(), network: 'linkedin', url: '', urlMapping: 'LinkedInURL', iconType: 'prebuilt', width: 24, height: 24 },
                                { id: uuidv4(), network: 'twitter', url: '', urlMapping: 'TwitterURL', iconType: 'prebuilt', width: 24, height: 24 },
                            ],
                            iconColor: '#333333',
                        }
                    ], 0)
                ],
                borders: { borderTop: 0, borderRight: 0, borderBottom: 0, borderLeft: 0, borderColor: '#000000', borderRadius: 0 },
                paddingTop: 10,
                paddingBottom: 10,
            }
        ],
    },
    {
        id: 'preset-modern',
        name: 'Modern Minimalist',
        maxWidth: 480,
        tableProperties: { border: 0, cellSpacing: 10 },
        rows: [
            {
                id: uuidv4(),
                type: ComponentType.Row,
                cells: [
                     createCell([
                        createText('{{Name}}', 'Name', 18, 'bold', '#1a202c'),
                        createText('{{Title}}', 'Title', 14, 'normal', '#4a5568'),
                    ], 0),
                    createCell([
                        createImage('LogoUrl', 80)
                    ], 100),
                ],
                borders: { borderTop: 0, borderRight: 0, borderBottom: 0, borderLeft: 0, borderColor: '#000000', borderRadius: 0 },
                paddingTop: 0,
                paddingBottom: 0,
            },
            {
                id: uuidv4(),
                type: ComponentType.Row,
                cells: [
                    createCell([
                        { id: uuidv4(), type: ComponentType.Divider, height: 1, color: '#e2e8f0' }
                    ], 0)
                ],
                borders: { borderTop: 0, borderRight: 0, borderBottom: 0, borderLeft: 0, borderColor: '#000000', borderRadius: 0 },
                paddingTop: 0,
                paddingBottom: 0,
            },
            {
                id: uuidv4(),
                type: ComponentType.Row,
                cells: [
                     createCell([
                        createText('<b>P:</b> {{Phone}}', 'Phone', 12, 'normal', '#4a5568'),
                        createText('<b>E:</b> {{Email}}', 'Email', 12, 'normal', '#4a5568'),
                        createText('<b>W:</b> example.com', 'WebsiteURL', 12, 'normal', '#4a5568'),
                    ], 0)
                ],
                borders: { borderTop: 0, borderRight: 0, borderBottom: 0, borderLeft: 0, borderColor: '#000000', borderRadius: 0 },
                paddingTop: 0,
                paddingBottom: 0,
            }
        ],
    }
];
