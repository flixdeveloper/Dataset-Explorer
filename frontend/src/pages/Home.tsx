import { LayoutGrid, Type, Sparkles } from 'lucide-react';

import UploadZone from '../components/upload/UploadZone';
import FeatureCard from '../components/layout/FeatureCard';
import { useDataset } from '../context/DatasetContext';

export default function Home() {
  const { handleUpload, isLoading, error } = useDataset();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 font-mono">CSV data explorer</h1>
        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
          Upload any CSV file. Browse paginated rows, detect column types, and ask an AI to analyze patterns in your data.
        </p>
      </div>

      <UploadZone onUpload={handleUpload} isLoading={isLoading} />

      {error && (
        <p className="text-sm text-red-500 font-mono mb-4 -mt-12">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <FeatureCard
          icon={<LayoutGrid className="w-5 h-5 text-blue-500" />}
          title="Paginated table"
          description="50 rows per page, sticky header, horizontal scroll"
        />
        <FeatureCard
          icon={<Type className="w-5 h-5 text-indigo-500" />}
          title="Type detection"
          description="Numeric, text, and status columns auto-styled"
        />
        <FeatureCard
          icon={<Sparkles className="w-5 h-5 text-purple-500" />}
          title="AI analysis"
          description="Ask plain-language questions, get instant insights"
        />
      </div>
    </main>
  );
}
