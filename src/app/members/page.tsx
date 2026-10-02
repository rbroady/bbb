'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Search, ChevronDown } from 'lucide-react';

type Permission = 'Admin' | 'Member';
type JobRole = 'Business Development' | 'Project Management' | 'Creative + Marketing';
type Status = 'Active' | 'Invited' | 'Pending';

interface Member {
  id: string;
  name: string;
  email: string;
  permission: Permission;
  roles: JobRole[];
  status: Status;
  isYou?: boolean;
  avatar?: string;
  initials: string;
}

const MEMBERS: Member[] = [
  {
    id: 'robert',
    name: 'Robert Broadbent',
    email: 'rrbroadbent@gmail.com',
    permission: 'Admin',
    roles: ['Creative + Marketing'],
    status: 'Active',
    isYou: true,
    avatar: '/avatar.jpg',
    initials: 'RB',
  },
  {
    id: 'pat',
    name: 'Pat Rice',
    email: 'patjrice@gmail.com',
    permission: 'Admin',
    roles: ['Project Management'],
    status: 'Pending',
    avatar: '/avatar-pat.jpg',
    initials: 'PR',
  },
  {
    id: 'matt',
    name: 'Matt Wilhelmsen',
    email: 'matt@mattwil.com',
    permission: 'Member',
    roles: ['Business Development'],
    status: 'Pending',
    avatar: '/avatar-matt.jpg',
    initials: 'MW',
  },
  {
    id: 'pete',
    name: 'Pete Shockley',
    email: 'prshockley@gmail.com',
    permission: 'Member',
    roles: ['Business Development'],
    status: 'Pending',
    avatar: '/avatar-pete.jpg',
    initials: 'PS',
  },
];

const ROLE_COLORS: Record<JobRole, string> = {
  'Business Development': 'bg-[#1e3a2f] text-[#4ade80] border border-[#2a5040]',
  'Project Management': 'bg-[#1e2d3a] text-[#60a5fa] border border-[#1e3a52]',
  'Creative + Marketing': 'bg-[#2d1e3a] text-[#c084fc] border border-[#3d1e52]',
};

const STATUS_CONFIG: Record<Status, { dot: string; label: string; sub?: string }> = {
  Active: { dot: 'bg-positive', label: 'Active' },
  Invited: { dot: 'bg-warning', label: 'Invited', sub: 'not joined yet' },
  Pending: { dot: 'bg-text-disabled', label: 'Pending', sub: 'not joined yet' },
};

function Avatar({ member }: { member: Member }) {
  if (member.avatar) {
    return (
      <Image
        src={member.avatar}
        alt={member.name}
        width={32}
        height={32}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-bg-subtle border border-border-default flex items-center justify-center flex-shrink-0">
      <span className="text-[11px] font-semibold text-text-secondary leading-none">{member.initials}</span>
    </div>
  );
}

function FilterDropdown({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none h-7 pl-2.5 pr-7 text-[12px] bg-bg-surface border border-border-default rounded-lg text-text-secondary focus:outline-none focus:border-accent cursor-pointer"
      >
        {options.map(o => (
          <option key={o} value={o}>{label}: {o}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
    </div>
  );
}

export default function MembersPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MEMBERS.filter(m => {
    if (statusFilter !== 'All' && m.status !== statusFilter) return false;
    if (roleFilter !== 'All' && !m.roles.includes(roleFilter as JobRole)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[960px]">
      <div className="mb-5">
        <h1 className="font-serif text-[22px] font-normal text-text-primary">Members</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">{MEMBERS.length} members in your workspace.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <FilterDropdown
          label="Status" value={statusFilter}
          options={['All', 'Active', 'Invited', 'Pending']}
          onChange={setStatusFilter}
        />
        <FilterDropdown
          label="Job role" value={roleFilter}
          options={['All', 'Business Development', 'Project Management', 'Creative + Marketing']}
          onChange={setRoleFilter}
        />
        <div className="ml-auto relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="h-7 pl-8 pr-3 text-[12px] bg-bg-surface border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-primary placeholder:text-text-disabled w-[220px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_140px_200px_180px] border-b border-border-subtle px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-text-disabled flex items-center gap-1">
            Member <ChevronDown size={11} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-text-disabled flex items-center gap-1">
            Permission <ChevronDown size={11} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-text-disabled">Job Roles</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-text-disabled">Status</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-text-tertiary">No members match your filters.</div>
        ) : (
          filtered.map(member => {
            const sc = STATUS_CONFIG[member.status];
            return (
              <div
                key={member.id}
                className="grid grid-cols-[1fr_140px_200px_180px] px-4 py-3 border-b border-border-subtle last:border-0 hover:bg-bg-hover transition-colors items-center"
              >
                {/* Member */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar member={member} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-medium text-text-primary truncate">{member.name}</span>
                      {member.isYou && (
                        <span className="text-[10px] text-text-disabled">(you)</span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-tertiary truncate block">{member.email}</span>
                  </div>
                </div>

                {/* Permission */}
                <div>
                  {member.permission === 'Admin' ? (
                    <span className="text-[12px] font-semibold text-text-primary">Admin</span>
                  ) : (
                    <span className="text-[12px] text-text-secondary">Member</span>
                  )}
                </div>

                {/* Job Roles */}
                <div className="flex flex-wrap gap-1.5">
                  {member.roles.map(role => (
                    <span
                      key={role}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${ROLE_COLORS[role]}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                  <span className="text-[12px] text-text-primary">{sc.label}</span>
                  {sc.sub && (
                    <span className="text-[11px] text-text-tertiary">({sc.sub})</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invite */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[12px] text-text-tertiary">{filtered.length} of {MEMBERS.length} members shown</p>
        <button className="text-[12px] px-3 py-1.5 rounded-lg bg-accent text-text-inverse hover:bg-accent-hover transition-colors font-medium">
          Invite member
        </button>
      </div>
    </div>
  );
}
