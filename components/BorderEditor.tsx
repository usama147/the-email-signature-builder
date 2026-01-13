import React from 'react';
import { BorderProperties } from '../types';
import { ColorPicker } from './ColorPicker';

interface BorderEditorProps {
    value: BorderProperties;
    onChange: (newValue: BorderProperties) => void;
    savedColors: string[];
    setSavedColors: (colors: string[]) => void;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-medium text-[--text-color-secondary] mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="block w-full px-2 py-1 bg-[--surface] border border-[--border-color] rounded-md shadow-[--shadow-inset] placeholder-[--text-color-light] focus:outline-none focus:ring-[--primary] focus:border-[--primary] sm:text-sm transition-all duration-300" />
);

export function BorderEditor({ value, onChange, savedColors, setSavedColors }: BorderEditorProps) {
    const handleChange = (field: keyof BorderProperties, val: string | number) => {
        onChange({ ...value, [field]: val });
    };

    return (
        <div className="p-3 bg-[--surface-secondary] rounded-md border border-[--border-color] space-y-3 transition-all duration-300">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                 <div>
                    <Label>Top (px)</Label>
                    <Input type="number" min="0" value={value.borderTop} onChange={e => handleChange('borderTop', parseInt(e.target.value, 10) || 0)} />
                </div>
                <div>
                    <Label>Right (px)</Label>
                    <Input type="number" min="0" value={value.borderRight} onChange={e => handleChange('borderRight', parseInt(e.target.value, 10) || 0)} />
                </div>
                <div>
                    <Label>Bottom (px)</Label>
                    <Input type="number" min="0" value={value.borderBottom} onChange={e => handleChange('borderBottom', parseInt(e.target.value, 10) || 0)} />
                </div>
                 <div>
                    <Label>Left (px)</Label>
                    <Input type="number" min="0" value={value.borderLeft} onChange={e => handleChange('borderLeft', parseInt(e.target.value, 10) || 0)} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                    <Label>Border Color</Label>
                    <ColorPicker
                        value={value.borderColor}
                        onChange={color => handleChange('borderColor', color)}
                        savedColors={savedColors}
                        setSavedColors={setSavedColors}
                    />
                </div>
                <div>
                    <Label>Radius (px)</Label>
                    <Input type="number" min="0" value={value.borderRadius} onChange={e => handleChange('borderRadius', parseInt(e.target.value, 10) || 0)} />
                </div>
            </div>
        </div>
    );
}