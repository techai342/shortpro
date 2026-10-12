
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Redirect from './pages/Redirect';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/saqib-admin" element={<Admin />} />
        <Route path="/ms-admin" element={<Admin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/:shortCode" element={<Redirect />} />
      </Routes>
    </BrowserRouter>
  );
}
