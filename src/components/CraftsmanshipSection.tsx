import { motion } from 'motion/react';
import { PenTool, Gem, Hand, Sparkles } from 'lucide-react';
import { unsplashUrl } from '../lib/catalogue';

const STEPS = [
  {
    icon: PenTool,
    title: 'Design',
    text: 'Every piece begins as a sketch, refined until the proportions feel inevitable rather than decorated.',
  },
  {
    icon: Gem,
    title: 'Select Materials',
    text: 'Metals and stones are chosen by hand for clarity, tone, and how they will wear over years, not just in photographs.',
  },
  {
    icon: Hand,
    title: 'Handcraft',
    text: 'Setting, soldering, and polishing are done by hand at the bench, with time built in for the details machines skip.',
  },
  {
    icon: Sparkles,
    title: 'Finishing Touches',
    text: 'A final inspection and polish before each piece is cased, so what arrives looks exactly as it left the bench.',
  },
];

export default function CraftsmanshipSection() {
  return (
    <section id="craft" aria-labelledby="craft-heading" className="py-24 bg-[#F9F7F2] scroll-mt-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-5/12 relative"
          >
            <div className="aspect-[4/5] relative overflow-hidden rounded-sm">
              <img
                src={unsplashUrl('photo-1778077128762-594e292467a2', 800)}
                srcSet={[480, 800, 1200].map((w) => `${unsplashUrl('photo-1778077128762-594e292467a2', w)} ${w}w`).join(', ')}
                sizes="(min-width: 1024px) 40vw, 100vw"
                loading="lazy"
                decoding="async"
                alt="Jewelry being finished by hand at the bench"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-6 -left-6 w-40 h-40 border border-[#D4AF37]/40 -z-10 hidden lg:block" />
          </motion.div>

          {/* Steps side */}
          <div className="w-full lg:w-7/12">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4 block">Our Craft</span>
            <h2 id="craft-heading" className="text-4xl md:text-5xl font-serif font-medium text-gray-900 mb-6 leading-tight">
              From Sketch to <span className="italic text-gray-600">Keepsake</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-12 font-light max-w-xl">
              Four deliberate stages stand between a raw idea and a finished piece. None of them are rushed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-900 shadow-sm">
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Step {index + 1}</span>
                      <h3 className="text-lg font-serif font-medium text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-600 font-light leading-relaxed">{step.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
