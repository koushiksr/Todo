import { useEffect } from 'react';

export const useNotifications = (todos, markNotified) => {
  useEffect(() => {
    // Request permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      todos.forEach(todo => {
        if (!todo.completed && !todo.deletedAt && !todo.notified && todo.reminderTime) {
          // reminderTime is typically "HH:MM"
          const [hours, minutes] = todo.reminderTime.split(':').map(Number);
          
          if (currentHours === hours && currentMinutes === minutes) {
            // Trigger Notification using Service Worker if available (Required for Android Chrome)
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('TodoPro Reminder', {
                  body: `Time to do: ${todo.text}`,
                  icon: '/favicon.svg',
                  vibrate: [200, 100, 200, 100, 200, 100, 200],
                  requireInteraction: true
                });
              }).catch(err => {
                console.error("Service Worker notification failed", err);
                fallbackNotification(todo.text);
              });
            } else {
              fallbackNotification(todo.text);
            }
            
            // Mark as notified
            markNotified(todo.id);
          }
        }
      });
    };

    const fallbackNotification = (text) => {
      try {
        new Notification('TodoPro Reminder', {
          body: `Time to do: ${text}`,
          icon: '/favicon.svg',
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
  }, [todos, markNotified]);
};
