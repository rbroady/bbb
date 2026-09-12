'use client';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-canvas">
      {/* Sidebar — fixed overlay on mobile, static on desktop */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30
          lg:static lg:z-auto lg:flex-shrink-0
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-text-primary/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 overflow-auto w-full">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 h-12 border-b border-border-subtle bg-bg-app">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1 rounded-md hover:bg-bg-hover transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} className="text-text-secondary" />
          </button>
          <span className="font-sans text-[20px] font-bold text-text-primary leading-none">BBB</span>
        </div>
        {children}
      </main>
    </div>
  );
}
