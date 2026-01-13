
import React, { useState, useEffect } from 'react';
import { CustomFont } from '../types';
import { searchGoogleFonts } from '../utils/googleFonts';
import { SpinnerIcon } from './icons';


const webSafeFonts = [
    'Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'Tahoma', 'Trebuchet MS'
];

const popularGoogleFonts = [
    'Lato',
    'Open Sans',
    'Roboto',
    'Montserrat',
    'Poppins',
    'Oswald',
    'Raleway',
    'Merriweather',
    'Nunito',
    'Playfair Display'
];

interface FontPickerProps {
    label: string;
    value: string;
    onChange: (font: string) => void;
    customFonts: CustomFont[];
    setCustomFonts: (updater: React.SetStateAction<CustomFont[]>) => void;
}


export function FontPicker({ label, value, onChange, customFonts, setCustomFonts }: FontPickerProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    
    // State for Direct URL form
    const [newFontName, setNewFontName] = useState('');
    const [newFontUrl, setNewFontUrl] = useState('');
    
    // State for Google Fonts search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const fontPreviewStyleId = 'google-font-search-previews';

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsLoading(true);
            searchGoogleFonts(searchQuery).then(results => {
                setSearchResults(results);
                setIsLoading(false);
            });
        }, 500);

        return () => clearTimeout(debounce);
    }, [searchQuery]);

    // This effect manages a single <style> tag to load previews for search results
    useEffect(() => {
        let styleTag = document.getElementById(fontPreviewStyleId) as HTMLStyleElement;
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = fontPreviewStyleId;
            document.head.appendChild(styleTag);
        }

        if (searchResults.length > 0) {
            // Request all weights (100-900) for previews to ensure accurate representation
            const fontImports = searchResults
                .map(font => `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`)
                .map(url => `@import url('${url}');`)
                .join('\n');
            styleTag.innerHTML = fontImports;
        }
    }, [searchResults]);


    const handleAddDirectFont = () => {
        if (newFontName && newFontUrl) {
            setCustomFonts(current => {
                if (current.some(f => f.name === newFontName)) return current;
                const newFont: CustomFont = { name: newFontName, url: newFontUrl, source: 'url' };
                return [...current, newFont];
            });
            setNewFontName('');
            setNewFontUrl('');
        }
    };

    const handleAddGoogleFont = (fontName: string) => {
        setCustomFonts(current => {
            if (current.some(f => f.name === fontName)) return current;
            // Include all weights in the URL
            const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
            const newFont: CustomFont = { name: fontName, url: fontUrl, source: 'google' };
            return [...current, newFont];
        });
    }

    const handleRemoveFont = (fontName: string) => {
        setCustomFonts(current => current.filter(f => f.name !== fontName));
    }
    
    const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFont = e.target.value;
        
        // If it's a popular Google Font, automatically add it to customFonts if missing
        // or update it if it's missing the weight definitions
        if (popularGoogleFonts.includes(selectedFont)) {
             const fontUrl = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/\s/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
             
             setCustomFonts(prev => {
                 const existingIndex = prev.findIndex(f => f.name === selectedFont);
                 if (existingIndex > -1) {
                     // If the font exists but has a different URL (likely missing weights), update it
                     if (prev[existingIndex].url !== fontUrl && prev[existingIndex].source === 'google') {
                         const newFonts = [...prev];
                         newFonts[existingIndex] = { ...newFonts[existingIndex], url: fontUrl };
                         return newFonts;
                     }
                     return prev;
                 } else {
                     return [...prev, { name: selectedFont, url: fontUrl, source: 'google' }];
                 }
             });
        }
        
        onChange(selectedFont);
    }

    return (
        <div>
            <label className="block text-sm font-medium text-[--text-color-secondary] mb-1">{label}</label>
            <select
                value={value}
                onChange={handleFontChange}
                className="block w-full px-3 py-2 bg-[--surface] border border-[--border-color] rounded-md shadow-[--shadow-inset] focus:outline-none focus:ring-[--primary] focus:border-[--primary] sm:text-sm transition-all duration-300"
                style={{ fontFamily: value }}
            >
                <optgroup label="Web Safe Fonts">
                    {webSafeFonts.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
                </optgroup>
                <optgroup label="Popular Google Fonts">
                    {popularGoogleFonts.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
                </optgroup>
                {customFonts.length > 0 && (
                    <optgroup label="Custom Fonts">
                        {customFonts.map(font => <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>{font.name}</option>)}
                    </optgroup>
                )}
            </select>
            <div className="mt-2">
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-xs text-[--primary] hover:underline"
                >
                    {showAddForm ? 'Cancel' : 'Manage Custom Fonts'}
                </button>
            </div>
            {showAddForm && (
                <div className="mt-3 p-3 bg-[--surface-secondary] border border-[--border-color] rounded-md space-y-4 transition-all duration-300">
                    {/* Your Added Fonts */}
                    {customFonts.length > 0 && (
                         <div>
                            <h4 className="text-xs font-semibold text-[--text-color-light] mb-2">Your Fonts</h4>
                            <div className="space-y-1">
                                {customFonts.map(font => (
                                    <div key={font.name} className="flex justify-between items-center text-sm bg-[--surface] p-1.5 rounded border border-[--border-color]">
                                        <span style={{ fontFamily: font.name }}>{font.name}</span>
                                        <button onClick={() => handleRemoveFont(font.name)} className="text-[--danger] hover:text-[--danger-hover] font-bold px-1 text-lg leading-none">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Search Google Fonts */}
                    <div>
                        <h4 className="text-xs font-semibold text-[--text-color-light] pt-2 border-t border-[--border-color] mt-4">Search Google Fonts</h4>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="e.g., Lato, Merriweather..."
                                className="block w-full text-sm mt-1 px-2 py-1.5 border border-[--border-color] rounded-md bg-[--surface] shadow-[--shadow-inset]"
                            />
                             {isLoading && <div className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5"><SpinnerIcon /></div>}
                        </div>
                        {searchResults.length > 0 && (
                            <ul className="mt-2 max-h-32 overflow-y-auto space-y-1 pr-1">
                                {searchResults.map(font => {
                                    const isAdded = customFonts.some(f => f.name === font);
                                    return (
                                     <li key={font} className="flex justify-between items-center text-sm bg-[--surface] p-1.5 rounded border border-[--border-color]">
                                        <span style={{ fontFamily: font }}>{font}</span>
                                        <button 
                                            onClick={() => handleAddGoogleFont(font)} 
                                            className="text-xs px-2 py-0.5 rounded bg-[--primary]/20 text-[--primary] hover:bg-[--primary] hover:text-[--primary-text] disabled:bg-[--surface-inset] disabled:text-[--text-color-light] transition-all duration-200"
                                            disabled={isAdded}
                                        >
                                            {isAdded ? 'Added' : 'Add'}
                                        </button>
                                    </li>
                                )})}
                            </ul>
                        )}
                    </div>
                    
                    {/* Add by URL */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-[--text-color-light] pt-2 border-t border-[--border-color] mt-4">Add Font by URL</h4>
                        <input
                            type="text"
                            value={newFontName}
                            onChange={(e) => setNewFontName(e.target.value)}
                            placeholder="Font Name (e.g., Futura Round)"
                            className="block w-full text-sm px-2 py-1.5 border border-[--border-color] rounded-md bg-[--surface] shadow-[--shadow-inset]"
                        />
                        <input
                            type="text"
                            value={newFontUrl}
                            onChange={(e) => setNewFontUrl(e.target.value)}
                            placeholder="Font File URL (.ttf, .woff, etc.)"
                            className="block w-full text-sm px-2 py-1.5 border border-[--border-color] rounded-md bg-[--surface] shadow-[--shadow-inset]"
                        />
                        <button
                            onClick={handleAddDirectFont}
                            className="w-full text-center py-1 px-2 border rounded-md text-xs font-medium text-[--secondary-text] bg-[--secondary] hover:bg-[--secondary-hover] shadow-[--shadow-1] active:shadow-[--shadow-inset]"
                        >
                            Add from URL
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
