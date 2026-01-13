
import React, { useState } from 'react';
import { HowItWorksModal } from './components/HowItWorksModal';
import { CreationMode } from './BulkCreatorPage';
import { Theme } from './App';

interface HomePageProps {
  onNavigateToCreate: (mode: CreationMode) => void;
  theme: Theme;
}

export function HomePage({ onNavigateToCreate, theme }: HomePageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-[--surface] rounded-lg shadow-[--shadow-2] p-8 text-center border border-[--border-color] transition-all duration-300" data-glass>
        <h2 className="text-3xl font-bold text-[--text-color] mb-2">
          The Email Signature Builder
        </h2>
        <p className="text-[--text-color-secondary] max-w-2xl mx-auto mb-8">
          Choose your path: create personalized signatures for your entire team with a CSV, or design a single signature from scratch.
        </p>

        <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto mb-10">
            <div 
                onClick={() => onNavigateToCreate('bulk')}
                className="bg-[--surface-secondary] p-6 rounded-lg border border-[--border-color] cursor-pointer transition-all duration-300 ease-in-out shadow-[--shadow-1] hover:shadow-[--shadow-2] hover:border-[--accent-color] hover:-translate-y-1 liquid-hover"
                data-glass
            >
                <h3 className="text-2xl font-bold text-[--text-color] mb-2">Create in Bulk</h3>
                <p className="text-[--text-color-light] mb-4">
                    Upload a CSV file with your team's data to generate hundreds of personalized email signatures at once. Perfect for organizations.
                </p>
                <span className="font-semibold text-[--accent-color] hover:text-[--accent-color-hover] transition-colors duration-300">Continue with CSV &rarr;</span>
            </div>
             <div 
                onClick={() => onNavigateToCreate('single')}
                className="bg-[--surface-secondary] p-6 rounded-lg border border-[--border-color] cursor-pointer transition-all duration-300 ease-in-out shadow-[--shadow-1] hover:shadow-[--shadow-2] hover:border-[--accent-color] hover:-translate-y-1 liquid-hover"
                data-glass
            >
                <h3 className="text-2xl font-bold text-[--text-color] mb-2">Build From Scratch</h3>
                <p className="text-[--text-color-light] mb-4">
                    Design a single, static signature. Manually enter all your information directly into the editor. Ideal for individuals.
                </p>
                 <span className="font-semibold text-[--accent-color] hover:text-[--accent-color-hover] transition-colors duration-300">Start Designing &rarr;</span>
            </div>
        </div>

        <button
            onClick={() => setIsModalOpen(true)}
            className="btn"
        >
            How does this work?
        </button>
      </div>
      {isModalOpen && <HowItWorksModal onClose={() => setIsModalOpen(false)} theme={theme} />}
    </>
  );
}