import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { GlobalCommandPalette } from './components/GlobalCommandPalette';

// Views
import { OverviewView } from './views/OverviewView';
import { KillChainView } from './views/KillChainView';
import { ASMView } from './views/ASMView';
import { FleetView } from './views/FleetView';
import { RulesView } from './views/RulesView';
import { SandboxView } from './views/SandboxView';
import { LogExplorerView } from './views/LogExplorerView';
import { ExceptionsView } from './views/ExceptionsView';
import { ThreatIntelView } from './views/ThreatIntelView';
import { SitesView } from './views/SitesView';
import { AuditTrailView } from './views/AuditTrailView';

import { Shield, Sparkles, User, Info, Terminal } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, currentUser } = useApp();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'kill-chain':
        return <KillChainView />;
      case 'asm':
        return <ASMView />;
      case 'fleet':
        return <FleetView />;
      case 'rules':
        return <RulesView />;
      case 'sandbox':
        return <SandboxView />;
      case 'logs':
        return <LogExplorerView />;
      case 'exceptions':
        return <ExceptionsView />;
      case 'threat-intel':
        return <ThreatIntelView />;
      case 'sites':
        return <SitesView />;
      case 'audit':
        return <AuditTrailView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navbar */}
      <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-6">
          {/* Active Persona Banner (Contextual Awareness for PRD Personas) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-slate-800/80 shadow-md">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl ${currentUser.avatar_color} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}>
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Active Role: {currentUser.role_title}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    PRD Persona: {currentUser.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {currentUser.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                Permissions: {currentUser.permissions.slice(0, 3).join(', ')}...
              </span>
            </div>
          </div>

          {/* Active View */}
          {renderActiveView()}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <GlobalCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
