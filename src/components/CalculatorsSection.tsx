'use client';

import { CalculatorSection } from '@/components/CalculatorSection';
import { DcaCalculatorSection } from '@/components/DcaCalculatorSection';

type CalculatorsSectionProps = {
  btcPrice: number;
};

export function CalculatorsSection({ btcPrice }: CalculatorsSectionProps) {
  return (
    <section className="calculators-section section-divider">
      <div className="calculators-grid">
        <CalculatorSection btcPrice={btcPrice} />
        <DcaCalculatorSection btcPrice={btcPrice} />
      </div>
    </section>
  );
}
