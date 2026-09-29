// TEMPLATE CONTENT — NEEDS LEGAL REVIEW. The Privacy Policy, Terms, Shipping & Returns, Size Guide and FAQ
// below are generic starting points written for this demo store. They are not legal advice and must be reviewed
// and adapted (business name, address, governing law, real policies) before the store trades.
import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import IllustrativeBadge from '../components/IllustrativeBadge';
import { RING_SIZES } from '../lib/catalogue';

export const INFO_PAGES = ['privacy', 'terms', 'shipping-returns', 'size-guide', 'faq'] as const;
export type InfoSlug = (typeof INFO_PAGES)[number];

// UK ring sizes with approximate inside diameter and circumference (mm), and US equivalents.
const RING_TABLE: Record<string, [number, number, string]> = {
  H: [15.2, 47.8, '4'], I: [15.6, 49.0, '4½'], J: [16.0, 50.3, '5'], K: [16.4, 51.5, '5½'], L: [16.8, 52.8, '6'],
  M: [17.2, 54.0, '6½'], N: [17.6, 55.3, '7'], O: [18.0, 56.6, '7½'], P: [18.4, 57.8, '8'], Q: [18.8, 59.1, '8½'],
  R: [19.2, 60.3, '9'], S: [19.6, 61.6, '9½'], T: [20.0, 62.8, '10'],
};

const FAQ: [string, string][] = [
  ['What are your pieces made from?', 'Our beads are glass, crystal and natural stone, strung on coated wire. Metal findings are gold- or silver-plated brass unless a listing says otherwise.'],
  ['How long does delivery take?', 'Standard delivery takes 5–7 working days and express 1–2 working days within Nigeria. International times vary by destination.'],
  ['Can I return an item?', 'Yes, within 30 days of delivery if it is unworn and in its original packaging. Engraved or resized rings cannot be returned unless faulty.'],
  ['How do I find my ring size?', 'Use the chart on our Size Guide page, or measure a ring that already fits and compare its inside diameter.'],
  ['How should I care for my jewellery?', 'Keep pieces dry, away from perfume and lotion, and store them separately in the pouch provided.'],
  ['Do you offer gift wrapping?', 'Every order is packed in a gift box. Add a note at checkout and we will include it with the order.'],
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-serif mb-3">{title}</h2>
      <div className="space-y-3 text-gray-800 leading-relaxed">{children}</div>
    </section>
  );
}

const PAGES: Record<InfoSlug, { title: string; body: ReactNode }> = {
  privacy: {
    title: 'Privacy Policy',
    body: (
      <>
        <Section title="What we collect">
          <p>When you order, we collect your name, email address and delivery details. When you subscribe to our newsletter, we collect your email address.</p>
          <p>Your cart, wishlist, currency choice and checkout contact details are saved in your browser (local storage) so they are there when you come back. Card details are never stored.</p>
        </Section>
        <Section title="How we use it">
          <p>To process and deliver your order, to contact you about it, and (only if you subscribed) to send you news and offers. You can unsubscribe at any time.</p>
        </Section>
        <Section title="Who we share it with">
          <p>Only the service providers needed to run the store (hosting, database, delivery partners and payment providers). We do not sell your data.</p>
        </Section>
        <Section title="Your rights">
          <p>You can ask to see, correct or delete the personal data we hold about you by contacting us.</p>
        </Section>
      </>
    ),
  },
  terms: {
    title: 'Terms of Service',
    body: (
      <>
        <Section title="Orders">
          <p>Placing an order is an offer to buy. We confirm acceptance by email. We may cancel an order if an item is unavailable or a price was shown in error, and will refund any payment in full.</p>
        </Section>
        <Section title="Prices">
          <p>Prices are set in US dollars; naira prices are converted at an approximate rate and may differ slightly at payment.</p>
        </Section>
        <Section title="Product images">
          <p>Handmade pieces vary slightly; colours can look different on different screens.</p>
        </Section>
        <Section title="Liability">
          <p>Nothing in these terms limits rights you have under consumer protection law.</p>
        </Section>
      </>
    ),
  },
  'shipping-returns': {
    title: 'Shipping & Returns',
    body: (
      <>
        <Section title="Shipping">
          <p>Standard delivery (5–7 working days) is free. Express delivery (1–2 working days) costs $15. Orders placed before 12:00 on a working day are dispatched the same day.</p>
        </Section>
        <Section title="Returns">
          <p>Return unworn items in their original packaging within 30 days of delivery for a refund to your original payment method. Refunds are issued within 5 working days of receiving the return.</p>
          <p>Engraved and resized rings are made for you and cannot be returned unless faulty.</p>
        </Section>
        <Section title="Faulty items">
          <p>If something arrives damaged, contact us within 7 days with a photo and we will repair, replace or refund it.</p>
        </Section>
      </>
    ),
  },
  'size-guide': {
    title: 'Size Guide',
    body: (
      <>
        <Section title="Rings">
          <p>Measure the inside diameter of a ring that fits the intended finger, or wrap a strip of paper around the finger and measure the circumference. Match it to the nearest size below; if between sizes, choose the larger.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 bg-white">
              <caption className="sr-only">Ring size conversion</caption>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="text-left px-4 py-2">UK</th>
                  <th scope="col" className="text-left px-4 py-2">US</th>
                  <th scope="col" className="text-left px-4 py-2">Diameter (mm)</th>
                  <th scope="col" className="text-left px-4 py-2">Circumference (mm)</th>
                </tr>
              </thead>
              <tbody>
                {RING_SIZES.map((s) => (
                  <tr key={s} className="border-t border-gray-100">
                    <th scope="row" className="text-left px-4 py-2 font-medium">{s}</th>
                    <td className="px-4 py-2">{RING_TABLE[s][2]}</td>
                    <td className="px-4 py-2">{RING_TABLE[s][0]}</td>
                    <td className="px-4 py-2">{RING_TABLE[s][1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Bracelets">
          <p>Measure around your wrist bone and add 1–2 cm for a comfortable fit. Our bracelets come in S (16 cm), M (18 cm) and L (20 cm).</p>
        </Section>
        <Section title="Necklaces">
          <p>40 cm sits at the base of the neck, 45 cm on the collarbone and 50 cm just below it.</p>
        </Section>
      </>
    ),
  },
  faq: {
    title: 'Frequently Asked Questions',
    body: (
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group py-4">
            <summary className="cursor-pointer list-none flex justify-between items-center gap-4 font-medium text-gray-900">
              {q}
              <span aria-hidden="true" className="text-xl transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-gray-800 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    ),
  },
};

export default function InfoPage({ slug }: { slug: InfoSlug }) {
  const page = PAGES[slug];
  useEffect(() => {
    document.title = `${page.title} | Shin Orne`;
  }, [page.title]);

  return (
    <div className="font-sans text-gray-900 antialiased bg-[#F9F7F2] min-h-screen">
      <Header solid />
      <main className="pt-32 pb-24">
        <article className="container mx-auto px-6 max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-700 mb-6">
            <Link to="/" className="underline">Home</Link> <span aria-hidden="true">/</span> {page.title}
          </nav>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">{page.title}</h1>
          <p className="mb-10 text-gray-700 flex flex-wrap items-center gap-2">
            <IllustrativeBadge label="Template" /> Generic template text for this demo store, pending legal review.
          </p>
          {page.body}
        </article>
      </main>
      <Footer />
    </div>
  );
}
