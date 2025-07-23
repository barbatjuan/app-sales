import { useState, useEffect } from 'react';

const MOTIVATIONAL_POPUP_KEY = 'motivational-popup-shown';
const POPUP_COOLDOWN_HOURS = 24; // Mostrar máximo una vez cada 24 horas

export const useMotivationalPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  const shouldShowPopup = (): boolean => {
    const lastShown = localStorage.getItem(MOTIVATIONAL_POPUP_KEY);
    
    if (!lastShown) {
      return true; // Primera vez
    }
    
    const lastShownTime = new Date(lastShown);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastShownTime.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff >= POPUP_COOLDOWN_HOURS;
  };

  const triggerPopup = () => {
    if (shouldShowPopup()) {
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    // Marcar como mostrado
    localStorage.setItem(MOTIVATIONAL_POPUP_KEY, new Date().toISOString());
  };

  const forceShowPopup = () => {
    setShowPopup(true);
  };

  return {
    showPopup,
    triggerPopup,
    closePopup,
    forceShowPopup,
    shouldShowPopup: shouldShowPopup()
  };
};
