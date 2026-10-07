import { motion } from 'motion/react';
import { unsplashUrl } from '../lib/catalogue';

const LOOKS = [
  {
    image: 'photo-1515562141207-7a88fb7ce338',
    title: 'Everyday Radiance',
    collectionHref: '/#necklaces',
    span: 'lg:col-span-2 lg:row-span-2',
    aspect: 'aspect-[4/5] lg:aspect-auto',
  },
  {
    image: 'photo-1599643477877-530eb83abc8e',
    title: 'Stacked Rings',
    collectionHref: '/#rings',
    span: '',
    aspect: 'aspect-[4/5]',
  },
  {
    image: 'photo-1535632066927-ab7c9ab60908',
    title: 'Statement Earrings',
    collectionHref: '/#earrings',
    span: '',
    aspect: 'aspect-[4/5]',
  },
  {
    image: 'photo-1611085583191-a3b181a88401',
    title: 'For the Aisle',
    collectionHref: '/#bridal',
    span: 'lg:col-span-2',
    aspect: 'aspect-[16/9] lg:aspect-[16/7]',
  },
];

export default function LookbookSection() {
  return (
    <section id="lookbook" aria-labelledby="lookbook-heading" className="py-24 bg-white scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-widest mb-2 block">Shop the Look</span>
          <h2 id="lookbook-heading" className="text-4xl md:text-5xl font-serif font-medium text-gray-900">
            The Lookbook
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-6">
          {LOOKS.map((look, index) => (
            <motion.a
              key={look.title}
              href={look.collectionHref}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
              className={`group relative block overflow-hidden rounded-sm ${look.span} ${look.aspect}`}
            >
              <img
                src={unsplashUrl(look.image, 960)}
                srcSet={[480, 768, 1200, 1600].map((w) => `${unsplashUrl(look.image, w)} ${w}w`).join(', ')}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="inline-block text-white text-sm font-serif tracking-wide border-b border-white/60 pb-1 group-hover:border-white transition-colors">
                  {look.title}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
