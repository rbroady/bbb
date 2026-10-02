'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Compass, KanbanSquare, Settings, PlusCircle, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';

const primaryNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
  { label: 'Discover', href: '/discover', icon: Compass },
];

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export function Sidebar({ expanded, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/pipeline') return pathname.startsWith('/pipeline');
    if (href === '/discover') return pathname === '/discover' || pathname.startsWith('/company');
    return pathname.startsWith(href);
  };

  const navClass = (href: string, muted = false) => [
    'flex items-center py-2 rounded-md mb-0.5 text-[13px] font-medium transition-colors duration-100',
    expanded ? 'gap-2.5 px-3 w-full' : 'justify-center w-9 mx-auto',
    isActive(href)
      ? 'bg-bg-active text-text-primary'
      : muted
        ? 'text-text-tertiary hover:text-text-secondary hover:bg-bg-hover'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
  ].join(' ');

  return (
    <aside
      className={[
        'h-full bg-bg-app border-r border-border-subtle flex flex-col flex-shrink-0 overflow-hidden transition-[width] duration-200',
        expanded ? 'w-[232px]' : 'w-[52px]',
      ].join(' ')}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        onClick={onClose}
        className={[
          'flex items-center gap-2.5 hover:opacity-80 transition-opacity pt-5 pb-3',
          expanded ? 'px-4' : 'justify-center px-0',
        ].join(' ')}
      >
        <Image
          src="/bbbicon.png"
          alt="BBB"
          width={28}
          height={28}
          className="flex-shrink-0 rounded-[7px]"
        />
        {expanded && (
          <span className="font-sans text-[14px] font-semibold text-text-primary leading-none tracking-wide">
            BBB
          </span>
        )}
      </Link>

      <div className="mx-3 h-px bg-border-subtle mb-2" />

      {/* Primary nav */}
      <nav className={expanded ? 'px-2' : 'px-1'}>
        {primaryNav.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} onClick={onClose} className={navClass(href)}>
            <Icon size={15} className="flex-shrink-0" />
            {expanded && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Add company */}
      <div className="mx-3 h-px bg-border-subtle mt-3 mb-2" />
      <nav className={`${expanded ? 'px-2' : 'px-1'} flex-1`}>
        <Link href="/add-company" onClick={onClose} className={navClass('/add-company')}>
          <PlusCircle size={15} className="flex-shrink-0" />
          {expanded && <span>Add company</span>}
        </Link>
      </nav>

      {/* Settings */}
      <div className="mx-3 h-px bg-border-subtle mb-2" />
      <nav className={expanded ? 'px-2 mb-1' : 'px-1 mb-1'}>
        <Link href="/settings" onClick={onClose} className={navClass('/settings', true)}>
          <Settings size={15} className="flex-shrink-0" />
          {expanded && <span>Settings</span>}
        </Link>
      </nav>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className={[
          'flex items-center py-3 text-text-disabled hover:text-text-tertiary transition-colors',
          expanded ? 'justify-end px-4' : 'justify-center px-0',
        ].join(' ')}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {expanded ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
      </button>
    </aside>
  );
}
