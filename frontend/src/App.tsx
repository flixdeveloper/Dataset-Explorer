import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Header from './components/layout/Header';
import { DatasetProvider } from './context/DatasetContext';
import DataView from './pages/DataView';
import Home from './pages/Home';

export default function App() {
  return (
    <BrowserRouter>
      <DatasetProvider>
        <div className="h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans flex flex-col overflow-hidden">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/data" element={<DataView />} />
          </Routes>
        </div>
      </DatasetProvider>
    </BrowserRouter>
  );
}
