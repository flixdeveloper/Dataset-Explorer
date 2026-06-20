import { Database } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2 font-mono font-semibold text-sm">
        <Database className="w-5 h-5 text-blue-600" />
        <span>dataset explorer</span>
      </div>
      <div className="font-mono text-sm text-gray-400">
        v1.0
      </div>
    </header>
  );
}
