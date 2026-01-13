
import React from 'react';
import { CreationMode } from '../BulkCreatorPage';

interface DataMapperProps {
  label: string;
  value: string;
  mapping?: string;
  headers: string[];
  onValueChange: (value: string) => void;
  onMappingChange: (mapping?: string) => void;
  placeholder?: string;
  isLink?: boolean;
  formatAsTel?: boolean;
  onFormatAsTelChange?: (value: boolean) => void;
  mode: CreationMode;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-[--text-color-secondary] mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`input-field block w-full px-3 py-2 sm:text-sm disabled:opacity-50 ${props.className || ''}`} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`select-field block w-full px-3 py-2 sm:text-sm ${props.className || ''}`} />
);

export function DataMapper({ 
    label, 
    value, 
    mapping, 
    headers, 
    onValueChange, 
    onMappingChange, 
    placeholder,
    isLink = false,
    formatAsTel = false,
    onFormatAsTelChange,
    mode
}: DataMapperProps) {
  const isMapped = !!mapping;

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    onMappingChange(selectedValue ? selectedValue : undefined);
  };

  if (mode === 'single') {
    return (
      <div>
        <Label>{label}</Label>
        <Input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input
          type="text"
          value={isMapped ? `{{${mapping}}}` : value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={isMapped}
          placeholder={placeholder}
        />
        <Select value={mapping || ''} onChange={handleSelectChange}>
          <option value="">-- No Mapping --</option>
          {headers.map(header => (
            <option key={header} value={header}>{header}</option>
          ))}
        </Select>
      </div>
      {isLink && isMapped && onFormatAsTelChange && (
        <div className="mt-2">
            <label className="flex items-center text-sm text-[--text-color-secondary]">
                <input
                    type="checkbox"
                    checked={formatAsTel}
                    onChange={(e) => onFormatAsTelChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[--primary] focus:ring-[--primary] mr-2"
                />
                Format link as a phone number (tel:)
            </label>
        </div>
      )}
    </div>
  );
}