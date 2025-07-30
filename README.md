# Next.js PWA Boilerplate

A Progressive Web App (PWA) boilerplate built with Next.js, featuring offline support, installability, and mobile-friendly design.

## Features

- **Progressive Web App**: Fully compliant with PWA standards
- **Offline Support**: Works even without an internet connection
- **Installable**: Can be installed on mobile and desktop devices
- **Responsive Design**: Looks great on all devices
- **TypeScript**: Full type safety
- **Tailwind CSS**: For styling

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

```bash
# Clone the repository (if not already done)
# git clone <repository-url>

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## PWA Features Explained

### Service Worker

This boilerplate uses `next-pwa` to generate and manage a service worker. The service worker is configured in `next.config.ts` and provides:

- Caching of assets (JS, CSS, fonts, images)
- Offline functionality
- Different caching strategies for different types of resources

### Manifest

The `manifest.json` file in the public directory defines the app's appearance when installed on a device:

- App name and short name
- Icons for various sizes
- Theme colors
- Display mode

### Offline Support

The application includes:

- A dedicated offline page (`/offline`)
- An offline detection component that shows a banner when offline
- Offline-first caching strategies for critical resources

### Testing PWA Features

1. **Install the App**: Look for the install prompt in your browser (Chrome, Edge, etc.)
2. **Test Offline Mode**: Toggle your device's network connection off to see the offline indicator
3. **Check Lighthouse**: Use Chrome's Lighthouse to audit PWA compliance

## File Structure

```
/public
  /icons            # PWA icons
  manifest.json     # PWA manifest
/src
  /app              # Next.js app directory
    /offline        # Offline fallback page
    layout.tsx      # App layout with PWA meta tags
    page.tsx        # Home page
  /components       # React components
    InstallPWA.tsx  # Install PWA component
  /types            # TypeScript type definitions
```

## Customization

- **Icons**: Replace the icons in `/public/icons` with your own
- **Colors**: Update theme colors in `manifest.json` and `layout.tsx`
- **App Name**: Change the app name in `manifest.json` and `layout.tsx`

## License

This project is MIT licensed.
