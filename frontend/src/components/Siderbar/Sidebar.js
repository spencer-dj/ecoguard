import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../Icon';
import './Sidebar.module.css';

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      {/* Sidebar toggle button */}
      <button onClick={toggleSidebar} className={`sidebar-toggle-btn ${sidebarOpen ? '' : 'closed'}`}>
        <Icon glyph="bars" />
        {sidebarOpen && <span className="sidebar-title">EcoGuard</span>}
      </button>

      {/* Navigation links */}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => isActive ? 'active-link' : ''}
            >
              <Icon glyph="tachometer" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/users"
              className={({ isActive }) => isActive ? 'active-link' : ''}
            >
              <Icon glyph="users" />
              <span>Users</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) => isActive ? 'active-link' : ''}
            >
              <Icon glyph="cogs" />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <footer className="sidebar-footer">
        {sidebarOpen ? '© EcoGuard 2025' : '©'}
      </footer>
    </aside>
  );
};

export default Sidebar;
