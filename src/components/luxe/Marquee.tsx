const ITEMS = [
  'Handcrafted in small batches',
  'Free standard delivery',
  'Sized & engraved for you',
  'Gift-ready packaging',
  '30-day returns on unworn pieces',
  'Secure checkout',
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="lx-marquee" aria-label="Our promises">
      <div className="lx-marquee-track" aria-hidden="true">
        {row.map((t, i) => (<span key={i}>{t}</span>))}
        {row.map((t, i) => (<span key={`b${i}`}>{t}</span>))}
      </div>
      <ul className="lx-sr">{ITEMS.map((t) => (<li key={t}>{t}</li>))}</ul>
    </div>
  );
}
