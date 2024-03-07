import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import ParticlesPage from './pages/particles/ParticlesPage';
import FireworksPage from './pages/fireworks/FireworksPage';
import SolarSystemPage from './pages/solarSystem/SolarSystemPage';
import MontyHallPage from './pages/montyHall/MontyHallPage';
import FlightTrackerPage from './pages/flightTracker/FlightTrackerPage';

export default function App() {
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
