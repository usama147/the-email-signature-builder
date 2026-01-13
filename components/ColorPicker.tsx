import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    savedColors: string[];
    setSavedColors: (updater: React.SetStateAction<string[]>) => void;
    allowGradient?: boolean;
}

export function ColorPicker({ value, onChange, savedColors, setSavedColors, allowGradient = false }: ColorPickerProps) {
    const [displayColorPicker, setDisplayColorPicker] = useState(false);
    const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');
    const pickerRef = useRef<HTMLDivElement>(null);
    
    // Gradient State
    const [gradientStart, setGradientStart] = useState('#ffffff');
    const [gradientEnd, setGradientEnd] = useState('#000000');
    const [gradientAngle, setGradientAngle] = useState(180);

    useEffect(() => {
        // Attempt to parse existing gradient if value is a gradient string
        if (value && value.includes('linear-gradient')) {
            setActiveTab('gradient');
            const match = value.match(/linear-gradient\((.*?)deg,\s*(.*?),\s*(.*?)\)/);
            if (match) {
                setGradientAngle(parseInt(match[1]));
                setGradientStart(match[2].trim());
                setGradientEnd(match[3].trim());
            }
        }
    }, [value, displayColorPicker]);

    const handleSaveColor = () => {
        if (!savedColors.includes(value) && savedColors.length < 10) { // Limit to 10 swatches
            setSavedColors(current => [...current, value]);
        }
    };

    const handleRemoveColor = (colorToRemove: string) => {
        setSavedColors(current => current.filter(c => c !== colorToRemove));
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
    
    const updateGradient = (start: string, end: string, angle: number) => {
        const gradientString = `linear-gradient(${angle}deg, ${start}, ${end})`;
        onChange(gradientString);
    };

    return (
        <div className="relative" ref={pickerRef}>
            <div className="flex items-center border border-[--border-color] rounded-md shadow-[--shadow-inset] transition-all duration-300">
                <div
                    className="w-8 h-9 rounded-l-md cursor-pointer border-r border-[--border-color]"
                    style={{ background: value }}
                    onClick={() => setDisplayColorPicker(!displayColorPicker)}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[--surface] rounded-r-md focus:outline-none focus:ring-1 focus:ring-[--primary] focus:border-[--primary] sm:text-sm transition-all duration-300"
                />
            </div>
            {displayColorPicker && (
                <div className="absolute z-[100] mt-2 p-4 bg-[--surface] shadow-[--shadow-2] rounded-lg border border-[--border-color] w-64 glass-popup" data-glass>
                    
                    {allowGradient && (
                        <div className="flex mb-4 border-b border-[--border-color]">
                            <button 
                                className={`flex-1 pb-2 text-sm font-medium ${activeTab === 'solid' ? 'text-[--primary] border-b-2 border-[--primary]' : 'text-[--text-color-light]'}`}
                                onClick={() => setActiveTab('solid')}
                            >
                                Solid
                            </button>
                            <button 
                                className={`flex-1 pb-2 text-sm font-medium ${activeTab === 'gradient' ? 'text-[--primary] border-b-2 border-[--primary]' : 'text-[--text-color-light]'}`}
                                onClick={() => setActiveTab('gradient')}
                            >
                                Gradient
                            </button>
                        </div>
                    )}

                    {activeTab === 'solid' ? (
                        <>
                            <input
                                type="color"
                                value={value.includes('gradient') ? '#ffffff' : value}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-full h-16 cursor-pointer rounded-md overflow-hidden border border-[--border-color]"
                            />
                            <div className="mt-4">
                                <h4 className="text-xs font-semibold text-[--text-color-light] mb-2">Saved Colors</h4>
                                <div className="flex flex-wrap gap-2">
                                    {savedColors.map(color => (
                                        <div key={color} className="relative group">
                                            <div
                                                className="w-6 h-6 rounded-full cursor-pointer border border-[--border-color] shadow-sm"
                                                style={{ background: color }}
                                                onClick={() => {
                                                    onChange(color);
                                                    if (color.includes('gradient')) setActiveTab('gradient');
                                                }}
                                            />
                                            <button 
                                                onClick={() => handleRemoveColor(color)}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-[--danger] text-white text-[8px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md"
                                            >&times;</button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSaveColor}
                                    className="w-full mt-3 text-center py-1.5 px-2 border border-transparent rounded-md shadow-sm text-xs font-semibold text-[--primary-text] bg-[--primary] hover:bg-[--primary-hover] disabled:opacity-50 transition-all active:scale-95"
                                    disabled={savedColors.includes(value) || savedColors.length >= 10}
                                >
                                    Save Color
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-[--text-color-secondary] mb-1">Start Color</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="color" 
                                        value={gradientStart} 
                                        onChange={(e) => {
                                            setGradientStart(e.target.value);
                                            updateGradient(e.target.value, gradientEnd, gradientAngle);
                                        }}
                                        className="h-8 w-8 cursor-pointer rounded overflow-hidden"
                                    />
                                    <input 
                                        type="text" 
                                        value={gradientStart}
                                        onChange={(e) => {
                                            setGradientStart(e.target.value);
                                            updateGradient(e.target.value, gradientEnd, gradientAngle);
                                        }}
                                        className="input-field flex-1 h-8 text-xs px-2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[--text-color-secondary] mb-1">End Color</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="color" 
                                        value={gradientEnd} 
                                        onChange={(e) => {
                                            setGradientEnd(e.target.value);
                                            updateGradient(gradientStart, e.target.value, gradientAngle);
                                        }}
                                        className="h-8 w-8 cursor-pointer rounded overflow-hidden"
                                    />
                                    <input 
                                        type="text" 
                                        value={gradientEnd}
                                        onChange={(e) => {
                                            setGradientEnd(e.target.value);
                                            updateGradient(gradientStart, e.target.value, gradientAngle);
                                        }}
                                        className="input-field flex-1 h-8 text-xs px-2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[--text-color-secondary] mb-1">Direction</label>
                                <div className="flex gap-2">
                                    <button onClick={() => { setGradientAngle(180); updateGradient(gradientStart, gradientEnd, 180); }} className={`flex-1 py-1 text-xs border rounded transition-colors ${gradientAngle === 180 ? 'bg-[--primary] text-white border-transparent' : 'bg-[--surface-secondary] border-[--border-color]'}`}>↓</button>
                                    <button onClick={() => { setGradientAngle(0); updateGradient(gradientStart, gradientEnd, 0); }} className={`flex-1 py-1 text-xs border rounded transition-colors ${gradientAngle === 0 ? 'bg-[--primary] text-white border-transparent' : 'bg-[--surface-secondary] border-[--border-color]'}`}>↑</button>
                                    <button onClick={() => { setGradientAngle(90); updateGradient(gradientStart, gradientEnd, 90); }} className={`flex-1 py-1 text-xs border rounded transition-colors ${gradientAngle === 90 ? 'bg-[--primary] text-white border-transparent' : 'bg-[--surface-secondary] border-[--border-color]'}`}>→</button>
                                    <button onClick={() => { setGradientAngle(135); updateGradient(gradientStart, gradientEnd, 135); }} className={`flex-1 py-1 text-xs border rounded transition-colors ${gradientAngle === 135 ? 'bg-[--primary] text-white border-transparent' : 'bg-[--surface-secondary] border-[--border-color]'}`}>↘</button>
                                </div>
                            </div>
                            <div className="pt-2">
                                 <button
                                    onClick={handleSaveColor}
                                    className="w-full text-center py-2 px-2 border border-transparent rounded-md shadow-sm text-xs font-bold text-[--primary-text] bg-[--primary] hover:bg-[--primary-hover] transition-all active:scale-95"
                                    disabled={savedColors.includes(value) || savedColors.length >= 10}
                                >
                                    Save Gradient
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}