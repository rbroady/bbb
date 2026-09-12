'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Target,
  Bot,
  SlidersHorizontal,
  Calculator,
  KanbanSquare,
} from 'lucide-react';

const nav = [
  { label: 'The Hunt', href: '/', icon: Search },
  { label: 'Targets', href: '/targets', icon: Target },
  { label: 'Agents', href: '/agents', icon: Bot },
  { label: 'Buy Box', href: '/buy-box', icon: SlidersHorizontal },
  { label: 'Deal Analyzer', href: '/deal-analyzer', icon: Calculator },
  { label: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[232px] min-h-screen bg-bg-app border-r border-border-subtle flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <span className="font-sans text-[32px] font-bold text-text-primary leading-none tracking-tight">
          BBB
        </span>
        <p className="text-[11px] text-text-tertiary mt-1">Acquisition sourcing</p>
      </div>

      <div className="mx-4 h-px bg-border-subtle mb-2" />

      {/* Nav */}
      <nav className="px-2 flex-1">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
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

      {/* Footer */}
      <div className="px-4 py-4 mt-auto">
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
