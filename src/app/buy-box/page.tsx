'use client';
import { BuyBoxEditor } from '@/components/features/BuyBoxEditor';

export default function BuyBoxPage() {
  return (
    <div className="px-8 py-8 max-w-[820px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-text-primary">Buy Box</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">Your acquisition thesis. Changes affect scoring across the app.</p>
      </div>
      <BuyBoxEditor />
    </div>
  );
}
