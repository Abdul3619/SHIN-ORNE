import { Truck, ShieldCheck, Gift, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    desc: 'On all orders over $150',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    desc: '100% secure checkout',
  },
  {
    icon: Gift,
    title: 'Gift Packaging',
    desc: 'Beautifully wrapped',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    desc: '30-day return policy',
  },
];

export default function FeaturesBar() {
  return (
    <div className="bg-white border-b border-gray-100 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="p-3 bg-[#F9F7F2] rounded-full text-gray-900">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-medium text-gray-900 uppercase tracking-wide">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-light mt-1">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
