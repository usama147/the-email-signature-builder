
import React, { useState } from 'react';
import { HowItWorksModal } from './components/HowItWorksModal';
import { CreationMode } from './BulkCreatorPage';

interface HomePageProps {
  onNavigateToCreate: (mode: CreationMode) => void;
}

export function HomePage({ onNavigateToCreate }: HomePageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          The Email Signature Builder
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto mb-8">
          Choose your path: create personalized signatures for your entire team with a CSV, or design a single signature from scratch.
        </p>

        <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto mb-10">
            <div 
                onClick={() => onNavigateToCreate('bulk')}
                className="bg-slate-50 p-6 rounded-lg border-2 border-transparent cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:border-blue-500 hover:-translate-y-1"
            >
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Create in Bulk</h3>
                <p className="text-slate-500 mb-4">
                    Upload a CSV file with your team's data to generate hundreds of personalized email signatures at once. Perfect for organizations.
                </p>
                <span className="font-semibold text-blue-600">Continue with CSV &rarr;</span>
            </div>
             <div 
                onClick={() => onNavigateToCreate('single')}
                className="bg-slate-50 p-6 rounded-lg border-2 border-transparent cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:border-blue-500 hover:-translate-y-1"
            >
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Build From Scratch</h3>
                <p className="text-slate-500 mb-4">
                    Design a single, static signature. Manually enter all your information directly into the editor. Ideal for individuals.
                </p>
                 <span className="font-semibold text-blue-600">Start Designing &rarr;</span>
            </div>
        </div>

        <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md transition-all duration-200 ease-in-out hover:bg-slate-300 transform hover:-translate-y-0.5"
        >
            How does this work?
        </button>
      </div>
      {isModalOpen && <HowItWorksModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
