import React, { useRef, useState, useEffect } from "react";
import { logout } from "../endpoint/api";
import { useAuth } from "../contexts/useAuth";
import { useNotifications } from "./useNotifications";

const Header = ({ toggleSidebar }) => {
  const { username, isAuthenticated } = useAuth();
  const { notifications, count, markAsRead } = useNotifications("admin");
  const audioRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Play sound when new notification arrives
  useEffect(() => {
    if (count > 0 && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [count]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    if (!dropdownOpen && count > 0) markAsRead(); // mark all as read when opening
  };

  return (
    <header className="header">
      {/* Left Section */}
      <div className="header-left">
        <button onClick={toggleSidebar} className="header-toggle-btn">
          <i className="fas fa-bars"></i>
        </button>
        <strong>{isAuthenticated ? "Admin Dashboard" : "Welcome"}</strong>
      </div>

      {/* Right Section */}
      <div className="header-right">
        {/* Notification Bell */}
        <div className="notification-wrapper" ref={dropdownRef}>
          <button
            className={`notification-bell ${count > 0 ? "has-notification" : ""}`}
            onClick={toggleDropdown}
            aria-label="Notifications"
          >
            <svg className="bell-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            {count > 0 && (
              <span className="notification-badge">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                {count > 0 && (
                  <button className="mark-read-btn" onClick={markAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <div className="empty-icon">🔔</div>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(-5).map((n, idx) => (
                    <div key={idx} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                      <div className="notification-content">
                        <div className="notification-type">{n.type.toUpperCase()}</div>
                        <div className="notification-message">{n.message}</div>
                        <div className="notification-time">
                          {new Date(n.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 5 && (
                <div className="notification-footer">
                  <a href="/notifications">View all notifications</a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="admin-info">
          <div className="admin-avatar">
            {username ? username.charAt(0).toUpperCase() : 'G'}
          </div>
          <span className="admin-name">{username || "Guest"}</span>
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <button className="logout-btn-modern" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 16L21 12M21 12L17 8M21 12H9M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Logout</span>
          </button>
        )}

        {/* Notification Sound */}
        <audio ref={audioRef} src="/alarm.mp3" preload="auto" />

      </div>

      <style jsx>{`
        /* Notification Bell Styles */
        .notification-bell {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 0.6rem;
          border-radius: 10px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notification-bell:hover {
          background: #f1f5f9;
          color: #334155;
          transform: translateY(-2px);
        }
        
        .bell-icon {
          width: 22px;
          height: 22px;
        }
        
        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border-radius: 10px;
          min-width: 18px;
          height: 18px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          animation: pulse 1.5s infinite;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        
        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 360px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          margin-top: 0.5rem;
          overflow: hidden;
          z-index: 101;
          animation: slideDown 0.2s ease-out;
          border: 1px solid #e2e8f0;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        
        .notification-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
        }
        
        .mark-read-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0.4rem 0.7rem;
          border-radius: 6px;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .mark-read-btn:hover {
          background: #eff6ff;
        }
        
        .notification-list {
          max-height: 320px;
          overflow-y: auto;
        }
        
        .notification-item {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.2s;
        }
        
        .notification-item:hover {
          background: #f8fafc;
        }
        
        .notification-item.unread {
          background: #f0f9ff;
          border-left: 3px solid #0ea5e9;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-type {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .notification-message {
          font-size: 0.9rem;
          color: #334155;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        
        .notification-time {
          font-size: 0.75rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .notification-time::before {
          content: "🕒";
          font-size: 0.7rem;
        }
        
        .notification-empty {
          padding: 2rem 1rem;
          text-align: center;
          color: #94a3b8;
        }
        
        .empty-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          opacity: 0.5;
        }
        
        .notification-footer {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          background: #f8fafc;
        }
        
        .notification-footer a {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .notification-footer a:hover {
          color: #2563eb;
          text-decoration: underline;
        }
        
        /* Modern Logout Button */
        .logout-btn-modern {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #71717181, #9e9e9e75);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25);
        }
        
        .logout-btn-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(239, 68, 68, 0.3);
          background: linear-gradient(135deg, #b2b3eaff, #323841ff);
        }
        
        .logout-btn-modern:active {
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .notification-dropdown {
            position: fixed;
            top: 70px;
            right: 0;
            left: 0;
            width: auto;
            margin: 0;
            border-radius: 0;
            max-height: calc(100vh - 70px);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;