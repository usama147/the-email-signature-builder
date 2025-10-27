
import React, { useState } from 'react';
import { HomePage } from './HomePage';
import { BulkCreatorPage } from './BulkCreatorPage';

type Page = 'home' | 'create';

function App() {
  const [page, setPage] = useState<Page>('home');

  const navigateTo = (newPage: Page) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-700 hover:text-blue-600 cursor-pointer" onClick={() => navigateTo('home')}>
              The Email Signature Builder
            </h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {page === 'home' && <HomePage onNavigateToCreate={() => navigateTo('create')} />}
        {page === 'create' && <BulkCreatorPage />}
      </main>
    </div>
  );
}

export default App;