'use client';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex min-h-screen bg-bg-canvas">
      {/* Desktop sidebar — sticky, two-column */}
      <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:flex-shrink-0">
        <Sidebar expanded={expanded} onToggle={() => setExpanded(v => !v)} />
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar overlay */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 lg:hidden
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar expanded={true} onToggle={() => {}} onClose={() => setSidebarOpen(false)} />
      </aside>

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
          <a href="/dashboard" className="font-sans text-[18px] font-semibold text-text-primary leading-none">BBB</a>
        </div>
        {children}
      </main>
    </div>
  );
}
