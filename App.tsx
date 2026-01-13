import React, { useState, useEffect } from 'react';
import { HomePage } from './HomePage';
import { BulkCreatorPage, CreationMode } from './BulkCreatorPage';
import { SettingsIcon } from './components/icons';
import { SettingsModal } from './components/SettingsModal';

type Page = 'home' | 'create';
export type Theme = 'default' | 'neomorphism' | 'glassmorphism' | 'liquid-glass';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [mode, setMode] = useState<CreationMode>('bulk');
  const [theme, setTheme] = useState<Theme>('liquid-glass'); // Default set to liquid-glass
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    const validThemes: Theme[] = ['default', 'neomorphism', 'glassmorphism', 'liquid-glass'];
    if (savedTheme && validThemes.includes(savedTheme as Theme)) {
      setTheme(savedTheme as Theme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const navigateToCreate = (creationMode: CreationMode) => {
    setMode(creationMode);
    setPage('create');
  };

  const navigateToHome = () => {
    setPage('home');
  };

  return (
    <div className="min-h-screen bg-transparent text-[--text-color] font-sans">
      <header className="bg-[--surface] shadow-[--shadow-1] border-b border-[--border-color] transition-all duration-300" data-glass>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-[--text-color] hover:text-[--primary] cursor-pointer transition-colors duration-300" onClick={navigateToHome}>
              The Email Signature Builder
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="btn btn-icon rounded-full border-none bg-transparent hover:bg-[--surface-secondary]"
                title="Change Appearance"
              >
                <SettingsIcon />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {page === 'home' && <HomePage onNavigateToCreate={navigateToCreate} theme={theme} />}
        {page === 'create' && <BulkCreatorPage mode={mode} onNavigateHome={navigateToHome} theme={theme} />}
      </main>
      
      {isSettingsOpen && (
        <SettingsModal
          currentTheme={theme}
          onThemeChange={setTheme}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;