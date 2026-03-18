import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DestinationQuery from './pages/DestinationQuery';
import RoutePlanner from './pages/RoutePlanner';
import DataManagement from './pages/DataManagement';
import FlightManagement from './pages/FlightManagement';
import AirportManagement from './pages/AirportManagement';
import FlightMap from './pages/FlightMap';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DestinationQuery />} />
        <Route path="destination" element={<DestinationQuery />} />
        <Route path="route-planner" element={<RoutePlanner />} />
        <Route path="data-management" element={<DataManagement />} />
        <Route path="flight-management" element={<FlightManagement />} />
        <Route path="airport-management" element={<AirportManagement />} />
        <Route path="flight-map" element={<FlightMap />} />
      </Route>
    </Routes>
  );
}

export default App;
