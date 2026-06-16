import { formatPrice } from '@/lib/utils';
import type { Lang } from '@/lib/i18n';

interface Props {
  amount: string | number;
  currency: string;
  perPerson: string;
  fromLabel?: string;
  lang: Lang;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceTag({
  amount,
  currency,
  perPerson,
  fromLabel,
  lang,
  size = 'md',
}: Props) {
  const big = size === 'lg';
  const sm = size === 'sm';
  return (
    <div className="flex items-baseline gap-1">
      {fromLabel && (
        <span className="text-body-sm text-muted">{fromLabel}</span>
      )}
      <span
        className={
          big
            ? 'text-display-md text-ink'
            : sm
              ? 'text-title-md text-ink'
              : 'text-display-sm text-ink'
        }
      >
        {formatPrice(amount, currency, lang)}
      </span>
      <span className="text-body-sm text-muted">{perPerson}</span>
    </div>
  );
}
