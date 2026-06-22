import { useEffect } from 'react';

export const useNotifications = (todos, markNotified, user, token) => {
  useEffect(() => {
    // Request permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      todos.forEach(todo => {
        if (!todo.completed && !todo.deletedAt && !todo.notified && todo.reminderTime) {
          // reminderTime is typically "HH:MM"
          const [hours, minutes] = todo.reminderTime.split(':').map(Number);
          
          if (currentHours === hours && currentMinutes === minutes) {
            
            // 1. Push Notifications
            if (user?.pushNotifications !== false && 'Notification' in window && Notification.permission === 'granted') {
              // Trigger Notification using Service Worker if available (Required for Android Chrome)
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistration().then(registration => {
                  if (registration) {
                    registration.showNotification(todo.text, {
                      body: 'Reminder',
                      requireInteraction: true
                    });
                  } else {
                    fallbackNotification(todo.text);
                  }
                }).catch(err => {
                  console.error("Service Worker notification failed", err);
                  fallbackNotification(todo.text);
                });
              } else {
                fallbackNotification(todo.text);
              }
            }

            // 2. Instant Email Notification
            if (user?.emailNotifications !== false && token) {
              fetch('/api/user/notify-now', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ taskText: todo.text })
              }).catch(err => console.error("Failed to trigger instant email:", err));
            }
            
            // Mark as notified
            markNotified(todo.id);
          }
        }
      });
    };

    const fallbackNotification = (text) => {
      try {
        new Notification(text, {
          body: 'Reminder',
          requireInteraction: true
        });
      } catch (e) {
        console.error("Fallback notification failed", e);
      }
    };

    // Check immediately and then every 30 seconds
    checkReminders();
    const intervalId = setInterval(checkReminders, 30000);

    return () => clearInterval(intervalId);
  }, [todos, markNotified, user, token]);
};
