import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    savedColors: string[];
    setSavedColors: (colors: string[]) => void;
}

export function ColorPicker({ value, onChange, savedColors, setSavedColors }: ColorPickerProps) {
    const [displayColorPicker, setDisplayColorPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const handleSaveColor = () => {
        if (!savedColors.includes(value) && savedColors.length < 10) { // Limit to 10 swatches
            setSavedColors([...savedColors, value]);
        }
    };

    const handleRemoveColor = (colorToRemove: string) => {
        setSavedColors(savedColors.filter(c => c !== colorToRemove));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setDisplayColorPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={pickerRef}>
            <div className="flex items-center border border-slate-300 rounded-md shadow-sm">
                <div
                    className="w-8 h-9 rounded-l-md cursor-pointer border-r border-slate-300"
                    style={{ backgroundColor: value }}
                    onClick={() => setDisplayColorPicker(!displayColorPicker)}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            {displayColorPicker && (
                <div className="absolute z-10 mt-2 p-4 bg-white shadow-lg rounded-md border w-64">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-16 cursor-pointer"
                    />
                    <div className="mt-4">
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">Saved Colors</h4>
                        <div className="flex flex-wrap gap-2">
                            {savedColors.map(color => (
                                <div key={color} className="relative group">
                                    <div
                                        className="w-6 h-6 rounded-full cursor-pointer border"
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            onChange(color);
                                            setDisplayColorPicker(false);
                                        }}
                                    />
                                    <button 
                                        onClick={() => handleRemoveColor(color)}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                                    >&times;</button>
                                </div>
                            ))}
                        </div>
                         <button
                            onClick={handleSaveColor}
                            className="w-full mt-3 text-center py-1 px-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                            disabled={savedColors.includes(value) || savedColors.length >= 10}
                        >
                            Save Current Color
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}