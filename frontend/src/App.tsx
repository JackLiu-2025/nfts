import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import MintPage from './pages/MintPage';
import ProfilePage from './pages/ProfilePage';
import NFTDetailPage from './pages/NFTDetailPage';
import './i18n';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/mint" element={<MintPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/nft/:id" element={<NFTDetailPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
