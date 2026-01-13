import React from 'react';

interface PaddingValues {
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
}

interface PaddingEditorProps {
    value: PaddingValues;
    onChange: (newValue: PaddingValues) => void;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-medium text-[--text-color-secondary] mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="block w-full px-2 py-1 bg-[--surface] border border-[--border-color] rounded-md shadow-[--shadow-inset] placeholder-[--text-color-light] focus:outline-none focus:ring-[--primary] focus:border-[--primary] sm:text-sm transition-all duration-300" />
);

export function PaddingEditor({ value, onChange }: PaddingEditorProps) {
    const handleChange = (field: keyof PaddingValues, val: string) => {
        const numValue = val ? parseInt(val, 10) : undefined;
        onChange({ ...value, [field]: numValue });
    };

    return (
        <div className="p-3 bg-[--surface-secondary] rounded-md border border-[--border-color] space-y-3 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                 <div>
                    <Label>Top (px)</Label>
                    <Input type="number" min="0" value={value.paddingTop ?? ''} onChange={e => handleChange('paddingTop', e.target.value)} placeholder="auto" />
                </div>
                <div>
                    <Label>Right (px)</Label>
                    <Input type="number" min="0" value={value.paddingRight ?? ''} onChange={e => handleChange('paddingRight', e.target.value)} placeholder="auto" />
                </div>
                <div>
                    <Label>Bottom (px)</Label>
                    <Input type="number" min="0" value={value.paddingBottom ?? ''} onChange={e => handleChange('paddingBottom', e.target.value)} placeholder="auto" />
                </div>
                 <div>
                    <Label>Left (px)</Label>
                    <Input type="number" min="0" value={value.paddingLeft ?? ''} onChange={e => handleChange('paddingLeft', e.target.value)} placeholder="auto" />
                </div>
            </div>
            <p className="text-xs text-[--text-color-light]">Leave fields blank to inherit from row or global settings.</p>
        </div>
    );
}