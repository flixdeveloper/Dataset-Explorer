import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface SortIconProps {
  sorted: false | 'asc' | 'desc';
}

export default function SortIcon({ sorted }: SortIconProps) {
  if (sorted === 'asc')  return <ChevronUp    className="w-3 h-3 ml-1 inline" />;
  if (sorted === 'desc') return <ChevronDown   className="w-3 h-3 ml-1 inline" />;
  return <ChevronsUpDown className="w-3 h-3 ml-1 inline opacity-30" />;
}
