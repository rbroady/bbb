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

  const iconBtn = (href?: string) => [
    'flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-100',
    isActive(href)
      ? 'bg-bg-active text-text-primary'
      : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
  ].join(' ');

  return (
    <aside className="h-full flex flex-shrink-0 bg-bg-app border-r border-border-subtle overflow-hidden">

      {/* ── Left strip (always visible, never changes) ── */}
      <div className="w-[48px] flex-shrink-0 flex flex-col items-center border-r border-border-subtle">
        <Link href="/dashboard" onClick={onClose} className="mt-4 mb-3 hover:opacity-80 transition-opacity">
          <Image src="/bbbicon.png" alt="BBB" width={28} height={28} className="rounded-[7px]" />
        </Link>

        <div className="flex-1" />

        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-md text-text-disabled hover:text-text-tertiary hover:bg-bg-hover transition-colors mb-3"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <PanelLeft size={15} />
        </button>

        <div className="mb-4 flex flex-col items-center gap-1">
          <Image src="/avatar.jpg" alt="Profile" width={28} height={28} className="rounded-full object-cover" />
          <span className="text-[8px] font-semibold uppercase tracking-widest text-text-disabled leading-none">Profile</span>
        </div>
      </div>

      {/* ── Right panel — wide when expanded, icon-only column when collapsed ── */}
      <div className={[
        'flex flex-col overflow-hidden transition-[width] duration-200',
        expanded ? 'w-[210px]' : 'w-[48px]',
      ].join(' ')}>

        {expanded ? (
          /* ── Expanded: labels + section headers ── */
          <>
            <div className="pt-[18px] pb-3 px-4 flex-shrink-0 min-w-[210px]">
              <span className="font-sans text-[14px] font-semibold text-text-primary tracking-wide">BBB</span>
            </div>

            <div className="flex-1 overflow-y-auto min-w-[210px]">
              <nav className="px-3 pb-2">
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
                          <div key={item.label}
                            className="flex items-center gap-2 px-2 py-[7px] rounded-md mb-0.5 text-[12px] font-medium text-text-disabled opacity-50 cursor-default select-none">
                            <Icon size={14} className="flex-shrink-0" />
                            <span>{item.label}</span>
                          </div>
                        );
                      }
                      return (
                        <Link key={item.href} href={item.href} onClick={onClose}
                          className={[
                            'flex items-center gap-2 px-2 py-[7px] rounded-md mb-0.5 text-[12px] font-medium transition-colors duration-100',
                            active ? 'bg-bg-active text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
                          ].join(' ')}>
                          <Icon size={14} className="flex-shrink-0" />
                          <span className="whitespace-nowrap">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex-shrink-0 min-w-[210px]">
              <div className="mx-3 h-px bg-border-subtle" />
              <div className="px-3 py-2">
                <Link href="/settings" onClick={onClose}
                  className={[
                    'flex items-center gap-2 px-2 py-[7px] rounded-md text-[12px] font-medium transition-colors duration-100 w-full',
                    pathname.startsWith('/settings') ? 'bg-bg-active text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
                  ].join(' ')}>
                  <Settings size={14} className="flex-shrink-0" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* ── Collapsed: icon-only column ── */
          <>
            {/* "B" avatar — matches height of expanded BBB header so nav icons stay on the same plane */}
            <div className="flex items-center justify-center pt-[18px] pb-3 flex-shrink-0 min-w-[48px]">
              <div className="w-7 h-7 rounded-full bg-bg-subtle border border-border-default flex items-center justify-center">
                <span className="text-[11px] font-bold text-text-secondary leading-none">B</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col items-center pb-2 min-w-[48px]">
              {NAV_GROUPS.map((group, gi) => (
                <div key={group.label} className="w-full flex flex-col items-center">
                  {gi > 0 && <div className="w-5 h-px bg-border-subtle my-2" />}
                  {group.items.map(item => {
                    const Icon = item.icon;
                    if (item.disabled || !item.href) {
                      return (
                        <div key={item.label} title={item.label}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-text-disabled opacity-40 cursor-default mb-0.5">
                          <Icon size={15} />
                        </div>
                      );
                    }
                    return (
                      <Link key={item.href} href={item.href} onClick={onClose} title={item.label}
                        className={`${iconBtn(item.href)} mb-0.5`}>
                        <Icon size={15} />
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex-shrink-0 min-w-[48px]">
              <div className="mx-3 h-px bg-border-subtle" />
              <div className="flex justify-center py-2">
                <Link href="/settings" onClick={onClose} title="Settings"
                  className={iconBtn('/settings')}>
                  <Settings size={15} />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

    </aside>
  );
}
