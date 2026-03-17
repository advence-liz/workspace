import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DestinationQuery from './pages/DestinationQuery';
import RoutePlanner from './pages/RoutePlanner';
import DataManagement from './pages/DataManagement';
import FlightManagement from './pages/FlightManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DestinationQuery />} />
        <Route path="destination" element={<DestinationQuery />} />
        <Route path="route-planner" element={<RoutePlanner />} />
        <Route path="data-management" element={<DataManagement />} />
        <Route path="flight-management" element={<FlightManagement />} />
      </Route>
    </Routes>
  );
}

export default App;
