'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, KanbanSquare, Compass, PlusCircle, Settings,
  ChevronLeft, ChevronRight, MapPin, Clock, TrendingDown, ShoppingBag,
  EyeOff, Users,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  disabled?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Home',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Analyze',
    items: [
      { label: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
      { label: 'Discover', href: '/discover', icon: Compass },
    ],
  },
  {
    label: 'Assistants',
    items: [
      { label: 'Local Business Hunter', href: '/agents/local-hunter', icon: MapPin },
      { label: 'Aging Owner Hunter', href: '/agents/aging-owner', icon: Clock },
      { label: 'Good Biz / Bad Marketing', href: '/agents/bad-marketing', icon: TrendingDown },
      { label: 'Marketplace Hunter', href: '/agents/marketplace', icon: ShoppingBag },
      { label: 'Off-Market Hunter', href: '/agents/off-market', icon: EyeOff },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Members', icon: Users, disabled: true },
    ],
  },
];

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export function Sidebar({ expanded, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/discover') return pathname === '/discover' || pathname.startsWith('/company');
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={[
        'h-full bg-bg-app border-r border-border-subtle flex flex-col flex-shrink-0 overflow-hidden transition-[width] duration-200',
        expanded ? 'w-[220px]' : 'w-[52px]',
      ].join(' ')}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        onClick={onClose}
        className={[
          'flex items-center gap-2.5 hover:opacity-80 transition-opacity pt-5 pb-3 flex-shrink-0',
          expanded ? 'px-4' : 'justify-center px-0',
        ].join(' ')}
      >
        <Image src="/bbbicon.png" alt="BBB" width={28} height={28} className="flex-shrink-0 rounded-[7px]" />
        {expanded && (
          <span className="font-sans text-[14px] font-semibold text-text-primary leading-none tracking-wide">BBB</span>
        )}
      </Link>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <nav className={expanded ? 'px-3 pb-2' : 'px-1.5 pb-2'}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
              {/* Section label — only when expanded */}
              {expanded && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-disabled px-2 mb-1">
                  {group.label}
                </p>
              )}
              {/* Section divider — only when collapsed */}
              {!expanded && gi > 0 && (
                <div className="mx-1 h-px bg-border-subtle mb-2 mt-1" />
              )}

              {group.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);

                if (item.disabled || !item.href) {
                  return (
                    <div
                      key={item.label}
                      className={[
                        'flex items-center py-2 rounded-md mb-0.5 text-[13px] font-medium select-none',
                        expanded ? 'gap-2.5 px-2 w-full' : 'justify-center w-8 mx-auto',
                        'text-text-disabled cursor-default opacity-50',
                      ].join(' ')}
                      title={!expanded ? item.label : undefined}
                    >
                      <Icon size={15} className="flex-shrink-0" />
                      {expanded && <span>{item.label}</span>}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={!expanded ? item.label : undefined}
                    className={[
                      'flex items-center py-2 rounded-md mb-0.5 text-[13px] font-medium transition-colors duration-100',
                      expanded ? 'gap-2.5 px-2 w-full' : 'justify-center w-8 mx-auto',
                      active
                        ? 'bg-bg-active text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
                    ].join(' ')}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    {expanded && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom: Add company + Settings */}
      <div className="flex-shrink-0">
        <div className="mx-3 h-px bg-border-subtle" />
        <nav className={expanded ? 'px-3 py-2' : 'px-1.5 py-2'}>
          {[
            { label: 'Add company', href: '/add-company', icon: PlusCircle },
            { label: 'Settings', href: '/settings', icon: Settings },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              title={!expanded ? label : undefined}
              className={[
                'flex items-center py-2 rounded-md mb-0.5 text-[13px] font-medium transition-colors duration-100',
                expanded ? 'gap-2.5 px-2 w-full' : 'justify-center w-8 mx-auto',
                pathname.startsWith(href)
                  ? 'bg-bg-active text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-hover',
              ].join(' ')}
            >
              <Icon size={15} className="flex-shrink-0" />
              {expanded && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={[
            'flex items-center py-3 w-full text-text-disabled hover:text-text-tertiary transition-colors',
            expanded ? 'justify-end px-4' : 'justify-center px-0',
          ].join(' ')}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>
      </div>
    </aside>
  );
}
