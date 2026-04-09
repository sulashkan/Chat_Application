export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return;

  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }
};

export const showNotification = (title: string, body: string) => {
  if (Notification.permission !== "granted") return;

  new Notification(title, {
    body,
    icon: "/chat-icon.png", 
  });
};