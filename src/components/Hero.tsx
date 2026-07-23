import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#F9F7F2]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1920"
          alt="Elegant Jewelry Background"
          className="w-full h-full object-cover opacity-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-start">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl text-white drop-shadow-md"
        >
          <motion.span variants={itemVariants} className="block text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-4 text-white/90">
            New Collection 2026
          </motion.span>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-tight mb-6">
            Radiant <br />
            <span className="italic font-light">Sophistication</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/90 mb-10 max-w-md font-light leading-relaxed">
            Discover the allure of handcrafted beads and timeless jewelry designed to illuminate your unique aura.
          </motion.p>
          <motion.div variants={itemVariants} className="flex gap-4">
            <a
              href="#shop"
              className="bg-white text-gray-900 px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </a>
            <a
              href="#collections"
              className="border border-white text-white px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              View Lookbook
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
