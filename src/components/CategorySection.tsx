import { motion } from 'motion/react';
import { COLLECTIONS, unsplashUrl } from '../lib/catalogue';

export default function CategorySection() {
  return (
    <section id="collections" aria-labelledby="collections-heading" className="py-24 bg-white scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-widest mb-2 block">Discover</span>
          <h2 id="collections-heading" className="text-4xl md:text-5xl font-serif font-medium text-gray-900">
            Our Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {COLLECTIONS.map((collection, index) => (
            <motion.a
              key={collection.slug}
              href={`/#${collection.slug}`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
              className="group relative block overflow-hidden aspect-[3/4] rounded-sm shadow-sm hover:shadow-lg transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              <div className="absolute inset-0 bg-gray-200">
                <img
                  src={unsplashUrl(collection.image, 640)}
                  srcSet={[400, 640, 960].map((w) => `${unsplashUrl(collection.image, w)} ${w}w`).join(', ')}
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-colors duration-300" />
              <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                <h3 className="text-2xl font-serif text-white font-medium tracking-wide mb-2">{collection.name}</h3>
                <span className="inline-block text-white text-xs uppercase tracking-widest border-b border-transparent group-hover:border-white transition-all duration-300 pb-1">
                  Shop Now
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
