export const registerServiceWorker = async (): Promise<void> => {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    console.log('Manual SW registration as fallback in production mode');
  }
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      console.log('Registering service worker manually...');
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('Service Worker registered successfully:', registration);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Service Worker update found!');
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('Service worker state:', newWorker.state);
            if (newWorker.state === 'activated') {
              console.log('New Service Worker activated!');
            }
          });
        }
      });
      
      if (registration.waiting) {
        console.log('New version waiting to be activated');
      }
      
      setInterval(() => {
        registration.update().catch(err => {
          console.error('Error checking for SW updates:', err);
        });
      }, 60000);
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.log('Service Worker is not supported in this browser or environment');
  }
};
