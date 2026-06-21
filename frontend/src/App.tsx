import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import Header from '@/shared/components/Header';
import { DatasetProvider } from '@/features/dataset';
import DataView from '@/pages/DataView';
import Home from '@/pages/Home';

export default function App() {
  return (
    <BrowserRouter>
      <DatasetProvider>
        <div className="h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans flex flex-col overflow-hidden">
          <Toaster richColors position="bottom-right" />
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/data" element={<DataView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </DatasetProvider>
    </BrowserRouter>
  );
}
