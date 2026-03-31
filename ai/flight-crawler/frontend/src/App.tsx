import { Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DestinationQuery from './pages/DestinationQuery';
import RoutePlanner from './pages/RoutePlanner';
import DataManagement from './pages/DataManagement';
import FlightManagement from './pages/FlightManagement';
import AirportManagement from './pages/AirportManagement';
import FlightMap from './pages/FlightMap';
import CacheManagement from './pages/CacheManagement';
import CronManagement from './pages/CronManagement';
import { getAdminToken } from './utils/auth';

// 管理员路由保护：无 token 时重定向到首页
function AdminRoute({ children }: { children: React.ReactNode }) {
  return getAdminToken() ? <>{children}</> : <Navigate to="/destination" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DestinationQuery />} />
        <Route path="destination" element={<DestinationQuery />} />
        <Route path="route-planner" element={<RoutePlanner />} />
        <Route path="flight-map" element={<FlightMap />} />
        <Route path="data-management" element={<AdminRoute><DataManagement /></AdminRoute>} />
        <Route path="flight-management" element={<AdminRoute><FlightManagement /></AdminRoute>} />
        <Route path="airport-management" element={<AdminRoute><AirportManagement /></AdminRoute>} />
        <Route path="cache-management" element={<AdminRoute><CacheManagement /></AdminRoute>} />
        <Route path="cron-management" element={<AdminRoute><CronManagement /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
