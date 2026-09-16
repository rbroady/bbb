'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { calculateBoringBizScore } from '@/lib/scoring';
import { Company, CompanyStatus, PipelineStage } from '@/types';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

const INDUSTRIES = [
  'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Landscaping', 'Pest Control',
  'Cleaning', 'Restoration', 'Equipment Services', 'Specialty Contracting',
  'Waste Services', 'Commercial Services', 'Niche B2B Services', 'Tree Service',
  'Pool Service', 'Irrigation', 'Auto Repair', 'Painting', 'Moving', 'Other',
];

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const STATUSES: CompanyStatus[] = ['Off-market','For sale','Watching','Contacted','Analyzing','LOI','Passed'];
const PIPELINE_STAGES: PipelineStage[] = ['Watching','Contacted','Initial Conversation','Analyzing','Due Diligence','LOI','Under Contract','Passed'];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-bg-hover transition-colors"
      >
        <span className="text-[13px] font-semibold text-text-primary">{title}</span>
        {open ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-text-secondary mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-text-tertiary mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full h-10 md:h-8 px-3 text-[13px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-primary';
const selectCls = inputCls + ' appearance-none cursor-pointer';
const textareaCls = 'w-full px-3 py-2 text-[13px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-primary resize-none leading-relaxed';

type FormData = {
  name: string;
  industry: string;
  city: string;
  state: string;
  website: string;
  yearsOperating: number;
  revenue: number;
  ebitda: number;
  sde: number;
  grossMargin: number;
  employees: number;
  recurringRevenue: number;
  customerConcentration: number;
  capex: number;
  workingCapital: number;
  ownerName: string;
  ownerTenure: number;
  founderOwned: boolean;
  googleRating: number;
  reviewCount: number;
  commonPraise: string;
  commonComplaints: string;
  websiteQuality: 1 | 2 | 3 | 4 | 5;
  hasOnlineBooking: boolean;
  hasCRM: boolean;
  hasActiveSEO: boolean;
  hasSocialMedia: boolean;
  hasPaidAds: boolean;
  competitionLevel: 'Low' | 'Medium' | 'High';
  localCompetitors: number;
  status: CompanyStatus;
  pipelineStage: PipelineStage | '';
  askingPrice: number | '';
  valuationEstimate: number;
  editorialSummary: string;
  sellerSignals: string;
  signals: string;
  acquisitionRisks: string;
  marketingOpportunities: string;
  aiOpportunities: string;
  nextSteps: string;
  notes: string;
};

const defaults: FormData = {
  name: '', industry: '', city: '', state: '', website: '',
  yearsOperating: 0, revenue: 0, ebitda: 0, sde: 0, grossMargin: 0,
  employees: 0, recurringRevenue: 0, customerConcentration: 0, capex: 0, workingCapital: 0,
  ownerName: '', ownerTenure: 0, founderOwned: false,
  googleRating: 0, reviewCount: 0, commonPraise: '', commonComplaints: '',
  websiteQuality: 2, hasOnlineBooking: false, hasCRM: false, hasActiveSEO: false, hasSocialMedia: false, hasPaidAds: false,
  competitionLevel: 'Medium', localCompetitors: 0,
  status: 'Watching', pipelineStage: '', askingPrice: '', valuationEstimate: 0,
  editorialSummary: '', sellerSignals: '', signals: '', acquisitionRisks: '',
  marketingOpportunities: '', aiOpportunities: '', nextSteps: '', notes: '',
};

function parseLines(s: string): string[] {
  return s.split('\n').map(l => l.trim()).filter(Boolean);
}

function parseRisks(s: string): Array<{ label: string; severity: 'Low' | 'Medium' | 'High' }> {
  return s.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const lower = l.toLowerCase();
    const severity: 'Low' | 'Medium' | 'High' =
      lower.startsWith('high') ? 'High' :
      lower.startsWith('low') ? 'Low' : 'Medium';
    const label = l.replace(/^(high|medium|low)[:\s-]*/i, '').trim();
    return { label: label || l, severity };
  });
}

export default function AddCompanyPage() {
  const router = useRouter();
  const { addManualCompany, buyBox } = useAppStore();
  const [form, setForm] = useState<FormData>(defaults);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormData, value: FormData[keyof FormData]) =>
    setForm(f => ({ ...f, [field]: value }));

  const num = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(field, parseFloat(e.target.value) || 0);

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.industry) e.industry = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state) e.state = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Build partial company for scoring
    const partial: Company = {
      id: slugify(form.name),
      name: form.name.trim(),
      industry: form.industry,
      city: form.city.trim(),
      state: form.state,
      yearsOperating: form.yearsOperating,
      revenue: form.revenue,
      ebitda: form.ebitda,
      sde: form.sde || form.ebitda,
      grossMargin: form.grossMargin,
      employees: form.employees,
      googleRating: form.googleRating,
      reviewCount: form.reviewCount,
      ownerName: form.ownerName,
      ownerTenure: form.ownerTenure,
      founderOwned: form.founderOwned,
      status: form.status,
      pipelineStage: form.pipelineStage || undefined,
      websiteQuality: form.websiteQuality,
      hasOnlineBooking: form.hasOnlineBooking,
      hasCRM: form.hasCRM,
      hasActiveSEO: form.hasActiveSEO,
      hasSocialMedia: form.hasSocialMedia,
      hasPaidAds: form.hasPaidAds,
      askingPrice: form.askingPrice === '' ? null : Number(form.askingPrice),
      valuationEstimate: form.valuationEstimate || (form.ebitda * 3.5),
      sellerSignals: parseLines(form.sellerSignals),
      signals: parseLines(form.signals),
      editorialSummary: form.editorialSummary.trim() || `${form.name} — manually added.`,
      commonPraise: parseLines(form.commonPraise),
      commonComplaints: parseLines(form.commonComplaints),
      competitionLevel: form.competitionLevel,
      localCompetitors: form.localCompetitors,
      recurringRevenue: form.recurringRevenue,
      customerConcentration: form.customerConcentration,
      marketingOpportunities: parseLines(form.marketingOpportunities),
      aiOpportunities: parseLines(form.aiOpportunities),
      acquisitionRisks: parseRisks(form.acquisitionRisks),
      nextSteps: parseLines(form.nextSteps),
      lastResearched: new Date().toISOString(),
      capex: form.capex,
      workingCapital: form.workingCapital,
      // placeholder scores — overwritten below
      boringBizScore: 0,
      businessQualityScore: 0,
      sophisticationScore: 0,
      acquisitionFitScore: 0,
      untappedUpsideScore: 0,
    };

    const score = calculateBoringBizScore(partial, buyBox);
    partial.boringBizScore = score.total;
    partial.businessQualityScore = score.businessQuality;
    partial.acquisitionFitScore = score.acquisitionFit;
    partial.untappedUpsideScore = score.untappedUpside;
    // sophistication is inverse of upside component — approximate
    partial.sophisticationScore = Math.round((1 - score.untappedUpside / 35) * 30);

    addManualCompany(partial);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="px-4 md:px-8 py-12 max-w-[560px]">
        <div className="bg-positive-soft border border-positive/20 rounded-[10px] p-6 text-center">
          <p className="font-serif text-[22px] text-text-primary mb-2">Company added.</p>
          <p className="text-[13px] text-text-secondary mb-5">It&apos;s now in Targets and scored against your Buy Box.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push('/targets')}
              className="h-9 px-4 text-[13px] font-medium bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
            >
              View in Targets
            </button>
            <button
              onClick={() => { setForm(defaults); setSubmitted(false); }}
              className="h-9 px-4 text-[13px] font-medium border border-border-default rounded-lg hover:bg-bg-hover transition-colors text-text-secondary"
            >
              Add another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[720px]">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary mb-5 transition-colors"
      >
        <ArrowLeft size={13} /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-text-primary">Add company</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">
          Manually enter a business to track and score against your Buy Box.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* Business Info */}
        <Section title="Business info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company name *" >
              <input className={`${inputCls} ${errors.name ? 'border-negative' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Cascade Heating & Cooling" />
              {errors.name && <p className="text-[11px] text-negative mt-1">{errors.name}</p>}
            </Field>
            <Field label="Industry *">
              <select className={`${selectCls} ${errors.industry ? 'border-negative' : ''}`} value={form.industry} onChange={e => set('industry', e.target.value)}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.industry && <p className="text-[11px] text-negative mt-1">{errors.industry}</p>}
            </Field>
            <Field label="City *">
              <input className={`${inputCls} ${errors.city ? 'border-negative' : ''}`} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Portland" />
              {errors.city && <p className="text-[11px] text-negative mt-1">{errors.city}</p>}
            </Field>
            <Field label="State *">
              <select className={`${selectCls} ${errors.state ? 'border-negative' : ''}`} value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-[11px] text-negative mt-1">{errors.state}</p>}
            </Field>
            <Field label="Website">
              <input className={inputCls} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://example.com" type="url" />
            </Field>
            <Field label="Years operating">
              <input className={inputCls} type="number" min={0} value={form.yearsOperating || ''} onChange={num('yearsOperating')} placeholder="0" />
            </Field>
          </div>
        </Section>

        {/* Financials */}
        <Section title="Financials">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Annual revenue" hint="Best estimate">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">$</span>
                <input className={`${inputCls} pl-6`} type="number" min={0} step={10000} value={form.revenue || ''} onChange={num('revenue')} placeholder="0" />
              </div>
            </Field>
            <Field label="EBITDA" hint="Earnings before interest, taxes, depreciation & amortization">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">$</span>
                <input className={`${inputCls} pl-6`} type="number" min={0} step={5000} value={form.ebitda || ''} onChange={num('ebitda')} placeholder="0" />
              </div>
            </Field>
            <Field label="SDE" hint="Seller's discretionary earnings (leave blank to use EBITDA)">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">$</span>
                <input className={`${inputCls} pl-6`} type="number" min={0} step={5000} value={form.sde || ''} onChange={num('sde')} placeholder="0" />
              </div>
            </Field>
            <Field label="Gross margin %">
              <div className="relative">
                <input className={`${inputCls} pr-6`} type="number" min={0} max={100} step={1} value={form.grossMargin || ''} onChange={num('grossMargin')} placeholder="0" />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">%</span>
              </div>
            </Field>
            <Field label="Employees">
              <input className={inputCls} type="number" min={0} value={form.employees || ''} onChange={num('employees')} placeholder="0" />
            </Field>
            <Field label="Recurring revenue %">
              <div className="relative">
                <input className={`${inputCls} pr-6`} type="number" min={0} max={100} value={form.recurringRevenue || ''} onChange={num('recurringRevenue')} placeholder="0" />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">%</span>
              </div>
            </Field>
            <Field label="Customer concentration %" hint="Largest customer as % of revenue">
              <div className="relative">
                <input className={`${inputCls} pr-6`} type="number" min={0} max={100} value={form.customerConcentration || ''} onChange={num('customerConcentration')} placeholder="0" />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">%</span>
              </div>
            </Field>
            <Field label="CapEx (annual)">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">$</span>
                <input className={`${inputCls} pl-6`} type="number" min={0} step={5000} value={form.capex || ''} onChange={num('capex')} placeholder="0" />
              </div>
            </Field>
          </div>
        </Section>

        {/* Ownership */}
        <Section title="Ownership">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Owner name">
              <input className={inputCls} value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="e.g. Dan Mercer" />
            </Field>
            <Field label="Owner tenure (years)">
              <input className={inputCls} type="number" min={0} value={form.ownerTenure || ''} onChange={num('ownerTenure')} placeholder="0" />
            </Field>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.founderOwned}
                  onChange={e => set('founderOwned', e.target.checked)}
                  className="w-4 h-4 rounded accent-accent"
                />
                <span className="text-[13px] text-text-primary">Founder-owned</span>
              </label>
            </div>
          </div>
        </Section>

        {/* Reputation */}
        <Section title="Reputation">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Google rating">
              <input className={inputCls} type="number" min={0} max={5} step={0.1} value={form.googleRating || ''} onChange={num('googleRating')} placeholder="4.8" />
            </Field>
            <Field label="Review count">
              <input className={inputCls} type="number" min={0} value={form.reviewCount || ''} onChange={num('reviewCount')} placeholder="0" />
            </Field>
            <Field label="Common praise" hint="One item per line">
              <textarea className={textareaCls} rows={3} value={form.commonPraise} onChange={e => set('commonPraise', e.target.value)} placeholder={"Reliable service\nFair pricing\nFast response"} />
            </Field>
            <Field label="Common complaints" hint="One item per line">
              <textarea className={textareaCls} rows={3} value={form.commonComplaints} onChange={e => set('commonComplaints', e.target.value)} placeholder={"Slow scheduling\nLimited online communication"} />
            </Field>
          </div>
        </Section>

        {/* Digital Presence */}
        <Section title="Digital presence">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Website quality" hint="1 = very poor, 5 = excellent">
              <select className={selectCls} value={form.websiteQuality} onChange={e => set('websiteQuality', parseInt(e.target.value) as 1|2|3|4|5)}>
                <option value={1}>1 — Very poor / no website</option>
                <option value={2}>2 — Outdated / basic</option>
                <option value={3}>3 — Functional but dated</option>
                <option value={4}>4 — Modern and professional</option>
                <option value={5}>5 — Excellent</option>
              </select>
            </Field>
            <Field label="Competition level">
              <select className={selectCls} value={form.competitionLevel} onChange={e => set('competitionLevel', e.target.value as 'Low'|'Medium'|'High')}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </Field>
            <Field label="Nearby competitors">
              <input className={inputCls} type="number" min={0} value={form.localCompetitors || ''} onChange={num('localCompetitors')} placeholder="0" />
            </Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {([
              ['hasOnlineBooking', 'Online booking'],
              ['hasCRM', 'CRM in use'],
              ['hasActiveSEO', 'Active SEO'],
              ['hasSocialMedia', 'Social media presence'],
              ['hasPaidAds', 'Running paid ads'],
            ] as [keyof FormData, string][]).map(([field, label]) => (
              <label key={field} className="flex items-center gap-2.5 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={form[field] as boolean}
                  onChange={e => set(field, e.target.checked)}
                  className="w-4 h-4 rounded accent-accent"
                />
                <span className="text-[13px] text-text-primary">{label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Deal */}
        <Section title="Deal details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Status">
              <select className={selectCls} value={form.status} onChange={e => set('status', e.target.value as CompanyStatus)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Pipeline stage" hint="Optional — adds to Pipeline board">
              <select className={selectCls} value={form.pipelineStage} onChange={e => set('pipelineStage', e.target.value as PipelineStage | '')}>
                <option value="">Not in pipeline</option>
                {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Asking price" hint="Leave blank if not listed for sale">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">$</span>
                <input className={`${inputCls} pl-6`} type="number" min={0} step={10000} value={form.askingPrice === '' ? '' : form.askingPrice} onChange={e => set('askingPrice', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)} placeholder="optional" />
              </div>
            </Field>
            <Field label="Estimated valuation" hint="Your estimate if not listed">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">$</span>
                <input className={`${inputCls} pl-6`} type="number" min={0} step={10000} value={form.valuationEstimate || ''} onChange={num('valuationEstimate')} placeholder="0" />
              </div>
            </Field>
          </div>
        </Section>

        {/* Notes & Signals */}
        <Section title="Notes & signals" defaultOpen={false}>
          <div className="space-y-4">
            <Field label="Why this business is interesting" hint="Your editorial take">
              <textarea className={textareaCls} rows={3} value={form.editorialSummary} onChange={e => set('editorialSummary', e.target.value)} placeholder="Strong reputation, weak digital presence. Classic good business / bad marketing opportunity." />
            </Field>
            <Field label="Key signals" hint="One per line — e.g. 'Strong reputation', 'No online booking'">
              <textarea className={textareaCls} rows={3} value={form.signals} onChange={e => set('signals', e.target.value)} placeholder={"Strong reputation\nOutdated website\nNo online booking"} />
            </Field>
            <Field label="Seller signals" hint="One per line — e.g. 'Aging owner', 'No successor'">
              <textarea className={textareaCls} rows={3} value={form.sellerSignals} onChange={e => set('sellerSignals', e.target.value)} placeholder={"Long ownership\nNo digital presence growth\nPossible retirement"} />
            </Field>
            <Field label="Acquisition risks" hint="Prefix with High / Medium / Low. One per line.">
              <textarea className={textareaCls} rows={3} value={form.acquisitionRisks} onChange={e => set('acquisitionRisks', e.target.value)} placeholder={"Medium: Owner handles all sales relationships\nLow: Fleet may need replacement"} />
            </Field>
            <Field label="Marketing opportunities" hint="One per line">
              <textarea className={textareaCls} rows={3} value={form.marketingOpportunities} onChange={e => set('marketingOpportunities', e.target.value)} placeholder={"Launch online booking\nImprove Google Business Profile\nStart paid search"} />
            </Field>
            <Field label="AI & automation opportunities" hint="One per line">
              <textarea className={textareaCls} rows={3} value={form.aiOpportunities} onChange={e => set('aiOpportunities', e.target.value)} placeholder={"AI phone answering\nAutomated follow-up sequences\nDigital quoting system"} />
            </Field>
            <Field label="Next steps" hint="One per line">
              <textarea className={textareaCls} rows={3} value={form.nextSteps} onChange={e => set('nextSteps', e.target.value)} placeholder={"Verify revenue range\nContact owner\nConfirm owner involvement"} />
            </Field>
          </div>
        </Section>

        {/* Submit */}
        <div className="flex items-center gap-3 pb-12">
          <button
            type="submit"
            className="h-10 px-5 text-[13px] font-medium bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
          >
            Add to Targets
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 px-5 text-[13px] font-medium border border-border-default rounded-lg hover:bg-bg-hover transition-colors text-text-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
