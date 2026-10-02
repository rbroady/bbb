'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, KanbanSquare, Compass, PlusCircle, Settings,
  MapPin, Clock, TrendingDown, ShoppingBag, EyeOff, Users, PanelLeft,
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
      { label: 'Add Company', href: '/add-company', icon: PlusCircle },
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
    <aside className="h-full flex flex-shrink-0 bg-bg-app border-r border-border-subtle overflow-hidden">

      {/* ── Left strip (always visible) ── */}
      <div className="w-[48px] flex flex-col items-center flex-shrink-0 border-r border-border-subtle">
        {/* App icon */}
        <Link
          href="/dashboard"
          onClick={onClose}
          className="mt-4 mb-2 hover:opacity-80 transition-opacity"
        >
          <Image src="/bbbicon.png" alt="BBB" width={28} height={28} className="rounded-[7px]" />
        </Link>

        {/* Toggle — vertically centered in remaining space */}
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={onToggle}
            className="text-text-disabled hover:text-text-tertiary transition-colors p-1.5 rounded-md hover:bg-bg-hover"
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <PanelLeft size={16} />
          </button>
        </div>

        {/* Profile */}
        <div className="mb-4 flex flex-col items-center gap-1">
          <Image
            src="/avatar.jpg"
            alt="Profile"
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
          <span className="text-[8px] font-semibold uppercase tracking-widest text-text-disabled leading-none">
            Profile
          </span>
        </div>
      </div>

      {/* ── Right panel (collapsible) ── */}
      <div
        className={[
          'flex flex-col overflow-hidden transition-[width] duration-200',
          expanded ? 'w-[172px]' : 'w-0',
        ].join(' ')}
      >
        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-[172px]">
          <nav className="px-3 pt-3 pb-2">
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-disabled px-2 mb-1">
                  {group.label}
                </p>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  if (item.disabled || !item.href) {
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-md mb-0.5 text-[13px] font-medium text-text-disabled opacity-50 cursor-default select-none"
                      >
                        <Icon size={15} className="flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={[
                        'flex items-center gap-2.5 px-2 py-2 rounded-md mb-0.5 text-[13px] font-medium transition-colors duration-100',
                        active
                          ? 'bg-bg-active text-text-primary'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
                      ].join(' ')}
                    >
                      <Icon size={15} className="flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Settings — pinned to bottom */}
        <div className="flex-shrink-0 min-w-[172px]">
          <div className="mx-3 h-px bg-border-subtle" />
          <div className="px-3 py-2">
            <Link
              href="/settings"
              onClick={onClose}
              className={[
                'flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] font-medium transition-colors duration-100 w-full',
                pathname.startsWith('/settings')
                  ? 'bg-bg-active text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
              ].join(' ')}
            >
              <Settings size={15} className="flex-shrink-0" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

    </aside>
  );
}
