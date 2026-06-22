import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (file: File) => void;
  onError?: (message: string) => void;
  isLoading?: boolean;
}

const SAMPLE_FILE = 'grades.csv';

export default function UploadZone({ onUpload, onError, isLoading = false }: UploadZoneProps) {
  const loadSample = useCallback(async () => {
    if (isLoading) return;
    try {
      const res = await fetch(`/${SAMPLE_FILE}`);
      if (!res.ok) throw new Error(`Could not load ${SAMPLE_FILE}`);
      const blob = await res.blob();
      const file = new File([blob], SAMPLE_FILE, { type: 'text/csv' });
      onUpload(file);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to load sample data');
    }
  }, [isLoading, onUpload, onError]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) onUpload(file);
    },
    [onUpload],
  );

  const onDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      const file = rejections[0]?.file;
      if (file) {
        onError?.(`"${file.name}" is not a CSV file. Please upload a .csv file.`);
      }
    },
    [onError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    disabled: isLoading,
    onDrop,
    onDropRejected,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors
          ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${isDragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
      >
        <input {...getInputProps()} />
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
        type="button"
        onClick={loadSample}
        disabled={isLoading}
        className="w-full max-w-2xl flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-16 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <span className="font-mono font-medium">grades.csv</span>
        </div>
        <div className="text-sm text-gray-400 dark:text-gray-500 font-mono">2315 rows • 13 cols</div>
      </button>
    </>
  );
}
