let audio: HTMLAudioElement | null = null;

export const playNotification = () => {
  if (!audio) {
    audio = new Audio("/sounds/ElevenLabs_Airy_chime_for_social_media_notification_alert,_bright_and_cheerful.mp3");
  }
  audio.currentTime = 0;
  audio.play().catch(() => {});
};