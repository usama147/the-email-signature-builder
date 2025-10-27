
import React, { useState } from 'react';
import { HomePage } from './HomePage';
import { BulkCreatorPage, CreationMode } from './BulkCreatorPage';

type Page = 'home' | 'create';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [mode, setMode] = useState<CreationMode>('bulk');

  const navigateToCreate = (creationMode: CreationMode) => {
    setMode(creationMode);
    setPage('create');
  };

  const navigateToHome = () => {
    setPage('home');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-700 hover:text-blue-600 cursor-pointer" onClick={navigateToHome}>
              The Email Signature Builder
            </h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {page === 'home' && <HomePage onNavigateToCreate={navigateToCreate} />}
        {page === 'create' && <BulkCreatorPage mode={mode} onNavigateHome={navigateToHome} />}
      </main>
    </div>
  );
}

export default App;
