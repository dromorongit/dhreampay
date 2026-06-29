'use client';

interface SourceSelectorProps {
  value: 'bank' | 'visa';
  onChange: (value: 'bank' | 'visa') => void;
}

export function SourceSelector({ value, onChange }: SourceSelectorProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange('bank')}
        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
          value === 'bank'
            ? 'bg-[#1e3a5f] text-white border-b-4 border-[#d4a017]'
            : 'bg-white text-[#1e3a5f] border border-[#1e3a5f]'
        }`}
      >
        BANK
      </button>
      <button
        type="button"
        onClick={() => onChange('visa')}
        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
          value === 'visa'
            ? 'bg-[#1e3a5f] text-white border-b-4 border-[#d4a017]'
            : 'bg-white text-[#1e3a5f] border border-[#1e3a5f]'
        }`}
      >
        VISA
      </button>
    </div>
  );
}