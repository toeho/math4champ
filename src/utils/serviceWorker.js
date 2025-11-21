// // Service Worker registration utility

// /**
//  * Register service worker for offline support
//  */
// export const registerServiceWorker = () => {
//   if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//       navigator.serviceWorker
//         .register('/sw.js')
//         .then((registration) => {
//           console.log('Service Worker registered successfully:', registration.scope);
          
//           // Check for updates periodically
//           setInterval(() => {
//             registration.update();
//           }, 60000); // Check every minute
//         })
//         .catch((error) => {
//           console.error('Service Worker registration failed:', error);
//         });
//     });
//   }
// };

// /**
//  * Unregister service worker
//  */
// export const unregisterServiceWorker = () => {
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.ready
//       .then((registration) => {
//         registration.unregister();
//       })
//       .catch((error) => {
//         console.error('Service Worker unregistration failed:', error);
//       });
//   }
// };

// /**
//  * Check if app is running in offline mode
//  * @returns {boolean} True if offline
//  */
// export const isOffline = () => {
//   return !navigator.onLine;
// };

// /**
//  * Listen for online/offline events
//  * @param {Function} onOnline - Callback when going online
//  * @param {Function} onOffline - Callback when going offline
//  */
// export const listenToNetworkStatus = (onOnline, onOffline) => {
//   window.addEventListener('online', onOnline);
//   window.addEventListener('offline', onOffline);

//   return () => {
//     window.removeEventListener('online', onOnline);
//     window.removeEventListener('offline', onOffline);
//   };
// };
