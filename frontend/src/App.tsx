import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Header from './components/layout/Header';
import { DatasetProvider } from './context/DatasetContext';
import DataView from './pages/DataView';
import Home from './pages/Home';

export default function App() {
  return (
    <BrowserRouter>
      <DatasetProvider>
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
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
