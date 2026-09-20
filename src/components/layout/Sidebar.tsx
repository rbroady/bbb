'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Compass, KanbanSquare, Settings, PlusCircle } from 'lucide-react';

const primaryNav = [
  { label: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
  { label: 'Discover', href: '/', icon: Compass },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/pipeline') return pathname.startsWith('/pipeline');
    if (href === '/') return pathname === '/' || pathname.startsWith('/company');
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[232px] h-full bg-bg-app border-r border-border-subtle flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Logo */}
      <Link href="/pipeline" onClick={onClose} className="px-5 pt-6 pb-4 block hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-2.5">
          <Image src="/bbbicon.png" alt="BBB" width={36} height={36} className="flex-shrink-0" />
          <span className="font-sans text-[32px] font-bold text-text-primary leading-none tracking-tight">
            BBB
          </span>
        </div>
        <p className="text-[11px] text-text-tertiary mt-1">Acquisition sourcing</p>
      </Link>

      <div className="mx-4 h-px bg-border-subtle mb-2" />

      {/* Primary nav */}
      <nav className="px-2">
        {primaryNav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`
              flex items-center gap-2.5 px-3 py-2 rounded-md mb-0.5 text-[13px] font-medium
              transition-colors duration-100
              ${isActive(href)
                ? 'bg-bg-active text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }
            `}
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Add company — separated with a small gap */}
      <div className="mx-4 h-px bg-border-subtle mt-3 mb-2" />
      <nav className="px-2 flex-1">
        <Link
          href="/add-company"
          onClick={onClose}
          className={`
            flex items-center gap-2.5 px-3 py-2 rounded-md mb-0.5 text-[13px] font-medium
            transition-colors duration-100
            ${isActive('/add-company')
              ? 'bg-bg-active text-text-primary'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }
          `}
        >
          <PlusCircle size={15} className="flex-shrink-0" />
          Add company
        </Link>
      </nav>

      {/* Settings at bottom */}
      <div className="mx-4 h-px bg-border-subtle mb-2" />
      <nav className="px-2 mb-2">
        <Link
          href="/settings"
          onClick={onClose}
          className={`
            flex items-center gap-2.5 px-3 py-2 rounded-md mb-0.5 text-[13px] font-medium
            transition-colors duration-100
            ${isActive('/settings')
              ? 'bg-bg-active text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-hover'
            }
          `}
        >
          <Settings size={15} className="flex-shrink-0" />
          Settings
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4">
        <div className="text-[11px] text-text-disabled leading-relaxed">
          <p className="font-medium text-text-tertiary mb-0.5">Buy Box</p>
          <p>HVAC · Plumbing · Pest</p>
          <p>OR / WA / ID</p>
          <p>$500K – $3M</p>
        </div>
      </div>
    </aside>
  );
}
