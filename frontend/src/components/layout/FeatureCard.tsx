import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm flex flex-col items-start text-left">
      <div className="mb-3">{icon}</div>
      <h4 className="font-semibold text-gray-900 mb-2 font-mono text-sm">{title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
