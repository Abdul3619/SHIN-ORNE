import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import IllustrativeBadge from './IllustrativeBadge';

const testimonials = [
  {
    id: 1,
    name: 'Aisha O.',
    role: 'Sample review',
    text: "The craftsmanship is simply breathtaking. I've never received so many compliments on a necklace before. It perfectly complements my modest wardrobe and adds such an elegant touch.",
    rating: 5,
  },
  {
    id: 2,
    name: 'Khadija S.',
    role: 'Sample review',
    text: "Shin Orne has completely changed my perspective on beaded jewelry. The elegance and quality are unmatched. I wore the Emerald set for Eid and everyone asked where I got it!",
    rating: 5,
  },
  {
    id: 3,
    name: 'Zainab M.',
    role: 'Sample review',
    text: "Fast shipping and beautiful packaging. Opening the box felt like receiving a gift from a dear friend. The bracelet is absolutely stunning and feels very durable for everyday wear.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section aria-labelledby="testimonials-heading" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2 block">
            Testimonials
          </span>
          <h2 id="testimonials-heading" className="text-4xl md:text-5xl font-serif font-medium text-gray-900 mb-4">
            Loved by Many
          </h2>
          <p className="text-gray-700">
            <IllustrativeBadge label="Sample reviews" />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#F9F7F2] p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex gap-1 text-[#B08D1E] mb-6" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="text-gray-700 font-light italic leading-relaxed mb-8">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-4">
                {/* Initials instead of stock faces: these are sample reviews, not real customers */}
                <div className="w-10 h-10 rounded-full bg-[#F3E5AB] text-gray-900 flex items-center justify-center font-serif" aria-hidden="true">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <span className="block text-sm font-serif font-medium text-gray-900">
                    {testimonial.name}
                  </span>
                  <span className="block text-xs text-gray-600 uppercase tracking-wider">
                    {testimonial.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
