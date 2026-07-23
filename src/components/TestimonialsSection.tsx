import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Aisha O.',
    role: 'Verified Buyer',
    text: "The craftsmanship is simply breathtaking. I've never received so many compliments on a necklace before. It perfectly complements my modest wardrobe and adds such an elegant touch.",
    rating: 5,
  },
  {
    id: 2,
    name: 'Khadija S.',
    role: 'Verified Buyer',
    text: "Shin Orne has completely changed my perspective on beaded jewelry. The elegance and quality are unmatched. I wore the Emerald set for Eid and everyone asked where I got it!",
    rating: 5,
  },
  {
    id: 3,
    name: 'Zainab M.',
    role: 'Verified Buyer',
    text: "Fast shipping and beautiful packaging. Opening the box felt like receiving a gift from a dear friend. The bracelet is absolutely stunning and feels very durable for everyday wear.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#F9F7F2]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2 block">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900">
            Loved by Many
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex gap-1 text-[#D4AF37] mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="text-gray-600 font-light italic leading-relaxed mb-8">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                   <img src={`https://i.pravatar.cc/150?u=${testimonial.name}`} alt={testimonial.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <span className="block text-sm font-serif font-medium text-gray-900">
                    {testimonial.name}
                  </span>
                  <span className="block text-xs text-gray-400 uppercase tracking-wider">
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
