import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import ParticlesPage from './pages/particles/ParticlesPage';
import FireworksPage from './pages/fireworks/FireworksPage';
import SolarSystemPage from './pages/solarSystem/SolarSystemPage';
import MontyHallPage from './pages/montyHall/MontyHallPage';
import FlightTrackerPage from './pages/flightTracker/FlightTrackerPage';
import { useEffect } from 'react';
import { getAnalytics, logEvent } from 'firebase/analytics';

export default function App() {
  const analytics = getAnalytics();
  const location = useLocation();

  useEffect(() => {
    const pageName = location.pathname.replace('/', '');
    logEvent(analytics, `page_visit_${pageName}`);
  }, [location, analytics]);

  return (
    <Routes>
      <Route path="/">
        <Route index element={<HomePage />} />
        <Route path="particles" element={<ParticlesPage />} />
        <Route path="fireworks" element={<FireworksPage />} />
        <Route path="solar-system" element={<SolarSystemPage />} />
        <Route path="monty-hall" element={<MontyHallPage />} />
        <Route path="flight-tracker" element={<FlightTrackerPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
