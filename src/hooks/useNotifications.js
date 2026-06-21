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
            // Trigger Notification
            new Notification('TodoPro Reminder', {
              body: `Time to do: ${todo.text}`,
              icon: '/vite.svg', // Default vite icon, can be customized
              requireInteraction: true
            });
            
            // Mark as notified
            markNotified(todo.id);
          }
        }
      });
    };

    // Check immediately and then every 30 seconds
    checkReminders();
    const intervalId = setInterval(checkReminders, 30000);

    return () => clearInterval(intervalId);
  }, [todos, markNotified]);
};
