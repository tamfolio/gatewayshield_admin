import { Outlet } from 'react-router-dom';
import Sidebar from '../Components/Dashboard/Sidebar';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Content area with padding for mobile menu button */}
        <div className="pt-16 lg:pt-0">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default Dashboard;