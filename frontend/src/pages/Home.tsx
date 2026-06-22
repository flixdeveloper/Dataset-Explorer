import { toast } from 'sonner';
import { LayoutGrid, Type, Sparkles } from 'lucide-react';

import { UploadZone } from '@/features/upload';
import FeatureCard from '@/shared/components/FeatureCard';
import { useDatasetActions, useDatasetState } from '@/features/dataset';

export default function Home() {
  const { isLoading } = useDatasetState();
  const { handleUpload } = useDatasetActions();

  function handleError(message: string) {
    toast.error(message);
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 font-mono">CSV data explorer</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
          Upload any CSV file. Instantly explore your datasets, filter and search through rows, and ask an AI to analyze patterns in your data.
        </p>
      </div>

      <UploadZone onUpload={handleUpload} onError={handleError} isLoading={isLoading} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <FeatureCard
          icon={<LayoutGrid className="w-5 h-5 text-blue-500" />}
          title="Seamless Exploration"
          description="Glide through massive datasets effortlessly"
        />
        <FeatureCard
          icon={<Type className="w-5 h-5 text-indigo-500" />}
          title="Smart Search"
          description="Instantly search, filter and sort your data."
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
