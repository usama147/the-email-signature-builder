import React, { useState, useEffect } from 'react';
import { CustomFont } from '../types';
import { searchGoogleFonts } from '../utils/googleFonts';
import { SpinnerIcon } from './icons';


const webSafeFonts = [
    'Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'Tahoma', 'Trebuchet MS'
];

interface FontPickerProps {
    label: string;
    value: string;
    onChange: (font: string) => void;
    customFonts: CustomFont[];
    setCustomFonts: (fonts: CustomFont[]) => void;
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
            const fontImports = searchResults
                .map(font => `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, '+')}&display=swap`)
                .map(url => `@import url('${url}');`)
                .join('\n');
            styleTag.innerHTML = fontImports;
        }
    }, [searchResults]);


    const handleAddDirectFont = () => {
        if (newFontName && newFontUrl && !customFonts.some(f => f.name === newFontName)) {
            const newFont: CustomFont = { name: newFontName, url: newFontUrl, source: 'url' };
            setCustomFonts([...customFonts, newFont]);
            setNewFontName('');
            setNewFontUrl('');
        }
    };

    const handleAddGoogleFont = (fontName: string) => {
        if (!customFonts.some(f => f.name === fontName)) {
            const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s/g, '+')}&display=swap`;
            const newFont: CustomFont = { name: fontName, url: fontUrl, source: 'google' };
            setCustomFonts([...customFonts, newFont]);
        }
    }

    const handleRemoveFont = (fontName: string) => {
        setCustomFonts(customFonts.filter(f => f.name !== fontName));
    }

    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                style={{ fontFamily: value }}
            >
                <optgroup label="Web Safe Fonts">
                    {webSafeFonts.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
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
                    className="text-xs text-blue-600 hover:underline"
                >
                    {showAddForm ? 'Cancel' : 'Manage Custom Fonts'}
                </button>
            </div>
            {showAddForm && (
                <div className="mt-3 p-3 bg-slate-50 border rounded-md space-y-4">
                    {/* Your Added Fonts */}
                    {customFonts.length > 0 && (
                         <div>
                            <h4 className="text-xs font-semibold text-slate-500 mb-2">Your Fonts</h4>
                            <div className="space-y-1">
                                {customFonts.map(font => (
                                    <div key={font.name} className="flex justify-between items-center text-sm bg-white p-1.5 rounded border">
                                        <span style={{ fontFamily: font.name }}>{font.name}</span>
                                        <button onClick={() => handleRemoveFont(font.name)} className="text-red-500 hover:text-red-700 font-bold px-1 text-lg leading-none">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Search Google Fonts */}
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 pt-2 border-t mt-4">Search Google Fonts</h4>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="e.g., Lato, Merriweather..."
                                className="block w-full text-sm mt-1 px-2 py-1.5 border-slate-300 rounded-md"
                            />
                             {isLoading && <div className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5"><SpinnerIcon /></div>}
                        </div>
                        {searchResults.length > 0 && (
                            <ul className="mt-2 max-h-32 overflow-y-auto space-y-1 pr-1">
                                {searchResults.map(font => {
                                    const isAdded = customFonts.some(f => f.name === font);
                                    return (
                                     <li key={font} className="flex justify-between items-center text-sm bg-white p-1.5 rounded border">
                                        <span style={{ fontFamily: font }}>{font}</span>
                                        <button 
                                            onClick={() => handleAddGoogleFont(font)} 
                                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-0.5 bg-blue-100 rounded disabled:bg-slate-100 disabled:text-slate-400"
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
                        <h4 className="text-xs font-semibold text-slate-500 pt-2 border-t mt-4">Add Font by URL</h4>
                        <input
                            type="text"
                            value={newFontName}
                            onChange={(e) => setNewFontName(e.target.value)}
                            placeholder="Font Name (e.g., Futura Round)"
                            className="block w-full text-sm px-2 py-1.5 border-slate-300 rounded-md"
                        />
                        <input
                            type="text"
                            value={newFontUrl}
                            onChange={(e) => setNewFontUrl(e.target.value)}
                            placeholder="Font File URL (.ttf, .woff, etc.)"
                            className="block w-full text-sm px-2 py-1.5 border-slate-300 rounded-md"
                        />
                        <button
                            onClick={handleAddDirectFont}
                            className="w-full text-center py-1 px-2 border rounded-md text-xs font-medium text-white bg-slate-600 hover:bg-slate-700"
                        >
                            Add from URL
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}