import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Global News Now',
  description: 'Your daily source of global news, summarized by AI.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('SW registered: ', registration);
                  }).catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }

              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                const installButton = document.getElementById('pwa-install-button');
                if (installButton) {
                  installButton.style.display = 'block';
                }
              });

              window.addEventListener('appinstalled', () => {
                const installButton = document.getElementById('pwa-install-button');
                if (installButton) {
                  installButton.style.display = 'none';
                }
              });
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
          <button id="pwa-install-button" style={{ display: 'none', position: 'fixed', bottom: '20px', right: '20px', zIndex: '1000' }}>
            Install App
          </button>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const installButton = document.getElementById('pwa-install-button');
              if (installButton) {
                installButton.addEventListener('click', () => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                      if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                      } else {
                        console.log('User dismissed the install prompt');
                      }
                      deferredPrompt = null;
                    });
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
