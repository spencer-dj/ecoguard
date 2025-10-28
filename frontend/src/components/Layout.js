import React, { useState } from 'react';
import Sidebar from './Siderbar/Sidebar';
import Header from './Header';
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="dashboard-wrapper">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />
        <main className="main-area">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
