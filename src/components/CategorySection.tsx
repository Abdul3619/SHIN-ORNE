import { motion } from 'motion/react';

const categories = [
  {
    id: 1,
    name: 'Necklaces',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
    link: '#necklaces',
  },
  {
    id: 2,
    name: 'Bracelets',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
    link: '#bracelets',
  },
  {
    id: 3,
    name: 'Earrings',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    link: '#earrings',
  },
  {
    id: 4,
    name: 'Bead Sets',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80&w=800',
    link: '#beads',
  },
];

export default function CategorySection() {
  return (
    <section id="collections" className="py-24 bg-white scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2 block">
            Discover
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900">
            Our Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <motion.a
              key={category.id}
              href={category.link}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="group relative block overflow-hidden aspect-[3/4] rounded-sm shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="absolute inset-0 bg-gray-200">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <h3 className="text-2xl font-serif text-white font-medium tracking-wide mb-2">
                  {category.name}
                </h3>
                <span className="inline-block text-white/80 text-xs uppercase tracking-widest border-b border-transparent group-hover:border-white transition-all duration-300 pb-1">
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
