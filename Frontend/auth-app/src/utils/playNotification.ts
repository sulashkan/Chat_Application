let audio: HTMLAudioElement | null = null;

export const playNotification = () => {
  if (!audio) {
    audio = new Audio("/sounds/message.mp3");
  }
  audio.currentTime = 0;
  audio.play().catch(() => {});
};