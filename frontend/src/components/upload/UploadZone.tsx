import { useRef, useState } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
}

export default function UploadZone({ onUpload, isLoading = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file || !file.name.endsWith('.csv')) return;
    onUpload(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <>
      <div
        onClick={() => !isLoading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors
          ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${isDragging
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
          {isLoading
            ? <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            : <UploadCloud className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          }
        </div>
        <h3 className="text-lg font-semibold mb-1">
          {isLoading ? 'Uploading…' : 'Drop CSV here or click to browse'}
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 font-mono">Comma-separated values • UTF-8</p>
      </div>

      <div className="flex items-center w-full max-w-2xl my-8">
        <div className="flex-1 border-t border-gray-100 dark:border-gray-800" />
        <span className="px-4 text-sm text-gray-400 dark:text-gray-500 font-mono">or use sample data</span>
        <div className="flex-1 border-t border-gray-100 dark:border-gray-800" />
      </div>

      <button
        disabled={isLoading}
        className="w-full max-w-2xl flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-16 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <span className="font-mono font-medium">sample_orders.csv</span>
        </div>
        <div className="text-sm text-gray-400 dark:text-gray-500 font-mono">87 rows • 10 cols</div>
      </button>
    </>
  );
}
