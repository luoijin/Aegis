let timeoutTimer;

export const startSessionTimer = (logoutCallback, timeoutMinutes = 30) => {
  const resetTimer = () => {
    if (timeoutTimer) clearTimeout(timeoutTimer);
    timeoutTimer = setTimeout(() => {
      logoutCallback();
    }, timeoutMinutes * 60 * 1000);
  };
  
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keypress', resetTimer);
  window.addEventListener('click', resetTimer);
  
  resetTimer();
  
  return () => {
    if (timeoutTimer) clearTimeout(timeoutTimer);
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('keypress', resetTimer);
    window.removeEventListener('click', resetTimer);
  };
};