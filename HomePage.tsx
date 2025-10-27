import React, { useState } from 'react';
import { HowItWorksModal } from './components/HowItWorksModal';

interface HomePageProps {
  onNavigateToCreate: () => void;
}

export function HomePage({ onNavigateToCreate }: HomePageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Design and Generate Professional Email Signatures
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto mb-6">
          Our tool simplifies creating consistent, professional email signatures for your entire team. Just follow these simple steps:
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto mb-8">
          <div className="bg-slate-50 p-6 rounded-lg border transition-all duration-300 ease-in-out hover:shadow-lg hover:border-blue-300 hover:-translate-y-1">
            <div className="flex items-center mb-3">
              <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-4">1</div>
              <h3 className="text-xl font-semibold">Upload Data</h3>
            </div>
            <p className="text-slate-500">
              Start by uploading a CSV file containing your team's information (names, titles, phone numbers, etc.).
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg border transition-all duration-300 ease-in-out hover:shadow-lg hover:border-blue-300 hover:-translate-y-1">
            <div className="flex items-center mb-3">
              <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-4">2</div>
              <h3 className="text-xl font-semibold">Design & Map</h3>
            </div>
            <p className="text-slate-500">
              Use the drag-and-drop editor to design a signature template. Map the components to the columns in your CSV file.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg border transition-all duration-300 ease-in-out hover:shadow-lg hover:border-blue-300 hover:-translate-y-1">
            <div className="flex items-center mb-3">
              <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-4">3</div>
              <h3 className="text-xl font-semibold">Generate</h3>
            </div>
            <p className="text-slate-500">
              Preview the signatures for each person and copy the generated HTML code with a single click.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={onNavigateToCreate}
            className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-md shadow-lg transition-all duration-200 ease-in-out hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start New Signature Process
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 bg-slate-200 text-slate-800 font-bold text-lg rounded-md transition-all duration-200 ease-in-out hover:bg-slate-300 transform hover:-translate-y-0.5"
          >
            How does this work?
          </button>
        </div>
      </div>
      {isModalOpen && <HowItWorksModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}