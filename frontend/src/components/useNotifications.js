import { useState, useEffect } from "react";
import { adminNot, rangerNot } from "../endpoint/api";

export const useNotifications = (role = "admin") => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load last seen from localStorage
  const lastSeenKey = `${role}_last_seen`;

  const fetchNotifications = async () => {
    try {
      let response = {};
      if (role === "admin") {
        response = await adminNot();
      } else {
        response = await rangerNot();
      }

      const { has_notification, notifications: notifArray } = response;

      if (Array.isArray(notifArray)) {
        // Load last seen timestamp from localStorage
        const lastSeen = localStorage.getItem(lastSeenKey);

        // Only keep notifications newer than last seen
        const newOnes = notifArray.filter((n) => {
          return !lastSeen || new Date(n.timestamp) > new Date(lastSeen);
        });

        setNotifications(notifArray);

        if (has_notification && newOnes.length > 0) {
          setUnreadCount(newOnes.length);
        }
      }
    } catch (err) {
      console.error("Notification fetch failed", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [role]);

  const markAsRead = () => {
    if (notifications.length > 0) {
      // Store the latest timestamp as "last seen"
      const latestTimestamp = notifications[0].timestamp;
      localStorage.setItem(lastSeenKey, latestTimestamp);
    }
    setUnreadCount(0);
  };

  return { notifications, count: unreadCount, markAsRead };
};
