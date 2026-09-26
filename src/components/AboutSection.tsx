import { motion } from 'motion/react';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="aspect-[4/5] relative overflow-hidden rounded-sm">
              <img
                src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800"
                alt="Artisan crafting jewelry"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#F9F7F2] -z-10 hidden lg:block" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2"
          >
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4 block">
              Our Story
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 mb-8 leading-tight">
              Crafting Radiant <br />
              <span className="italic text-gray-600">Auras</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6 font-light">
              At <span className="font-serif font-medium text-gray-900">Shin Orne</span>, we believe that jewelry is more than just an accessory—it's an extension of your inner light. Founded by the visionaries at <span className="font-serif font-medium text-gray-900">Charm Aura</span>, our mission is to create pieces that resonate with your personal energy.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-10 font-light">
              Each bead is hand-selected for its unique texture and hue, ensuring that no two pieces are exactly alike. From the deep earth tones of our gemstone collections to the ethereal shimmer of our glass beads, every creation is a testament to the beauty of imperfection.
            </p>
            
            <div className="flex gap-8 items-center">
              <div className="text-center">
                <span className="block text-3xl font-serif font-medium text-gray-900 mb-1">20+</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Years of Craft</span>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <span className="block text-3xl font-serif font-medium text-gray-900 mb-1">5k+</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Happy Clients</span>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <span className="block text-3xl font-serif font-medium text-gray-900 mb-1">100%</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Handmade</span>
              </div>
            </div>

            <button className="mt-12 border-b border-gray-900 pb-1 text-sm font-medium uppercase tracking-widest hover:text-gray-600 hover:border-gray-600 transition-colors">
              Read More About Us
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
