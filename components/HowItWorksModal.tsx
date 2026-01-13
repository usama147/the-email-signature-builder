import React, { useState, useEffect } from 'react';
import { useAnimateModal } from '../hooks/useAnimateModal';
import { Theme } from '../App';

export function HowItWorksModal({ onClose, theme }: { onClose: () => void, theme: Theme }) {
    const { isClosing, modalAnimationClass, backdropAnimationClass, handleClose } = useAnimateModal(onClose, theme);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClose]);

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4 modal-backdrop-blur ${backdropAnimationClass}`}>
            <div className={`bg-[--surface] rounded-lg shadow-[--shadow-2] w-full max-w-3xl max-h-[90vh] flex flex-col border border-[--border-color] ${modalAnimationClass}`} data-glass>
                <div className="flex justify-between items-center p-4 border-b border-[--border-color]">
                    <h2 className="text-xl font-bold text-[--text-color]">How It Works</h2>
                    <button onClick={handleClose} className="text-2xl font-bold text-[--text-color-light] hover:text-[--text-color] transition-colors">{'\u00D7'}</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6 text-[--text-color-secondary]">
                    <p className="text-base">This tool helps you create and generate personalized email signatures for your entire team in three simple steps.</p>

                    <div className="space-y-4 p-4 bg-[--surface-secondary] rounded-lg border border-[--border-color]">
                        <h3 className="text-lg font-bold text-[--text-color]">1. Upload Your Data</h3>
                        <p>Start by preparing a CSV file with your team's information. It's crucial to format it correctly:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2 text-[--text-color-secondary]">
                            <li>The very first row of your CSV file <strong>must be the header row</strong>. These headers (e.g., "Name", "Title", "PhoneNumber") will be used for mapping data to your signature.</li>
                            <li>Every subsequent row should represent one person's data.</li>
                            <li>Ensure all URLs (for images, websites, social links) include <code>https://</code>.</li>
                        </ul>
                        <p className="font-semibold mt-2">Example of a valid CSV format:</p>
                        <pre className="bg-[--surface-inset] p-3 rounded-md text-sm overflow-x-auto text-[--text-color-secondary]">
                            <code>
{`Name,Title,Email,Phone,LinkedInURL,LogoUrl
John Doe,CEO,john.doe@example.com,+1-234-567-8901,https://linkedin.com/in/johndoe,https://example.com/logo.png
Jane Smith,CTO,jane.smith@example.com,+1-234-567-8902,https://linkedin.com/in/janesmith,https://example.com/logo.png`}
                            </code>
                        </pre>
                    </div>

                    <div className="space-y-4 p-4 bg-[--surface-secondary] rounded-lg border border-[--border-color]">
                        <h3 className="text-lg font-bold text-[--text-color]">2. Design & Map Your Template</h3>
                        <p>Use the intuitive drag-and-drop editor to build your signature template:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2 text-[--text-color-secondary]">
                            <li>Drag components like "Text", "Image", and "Social Icons" from the sidebar onto the canvas.</li>
                            <li>Click on any component on the canvas to open the <strong>Properties Panel</strong> on the right.</li>
                            <li>In the Properties Panel, you can customize styles like font size, colors, and dimensions.</li>
                            <li>Most importantly, you can <strong>map component fields to your CSV headers</strong>. For example, select a Text component, and in the "Content" section, choose the "Name" header from the dropdown. The live preview will update to show the data from the first row of your CSV.</li>
                        </ul>
                    </div>

                    <div className="space-y-4 p-4 bg-[--surface-secondary] rounded-lg border border-[--border-color]">
                        <h3 className="text-lg font-bold text-[--text-color]">3. Generate & Download</h3>
                        <p>Once you're happy with your design, click the "Generate Signatures" button. You'll be taken to a final review page where you can:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2 text-[--text-color-secondary]">
                            <li>Review a compatibility report to see how your signature might look in different email clients.</li>
                            <li>Preview the generated signature for each person in your CSV file.</li>
                            <li>Copy individual HTML codes or download all signatures at once in a convenient <strong>.zip file</strong>.</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-md text-[--text-color]">Saving and Loading Templates</h4>
                        <p className="text-[--text-color-secondary]">You can save your designs as templates using the "Save as Template" button. These are stored in your browser's local storage, meaning they are available whenever you return to the app on the same device and browser.</p>
                    </div>
                </div>
                <div className="p-4 border-t border-[--border-color] bg-[--surface-secondary] flex justify-end">
                    <button onClick={handleClose} className="btn btn-primary">
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}