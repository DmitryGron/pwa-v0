declare module 'next-pwa' {
  import type { NextConfig } from 'next';
  
  export type RuntimeCachingRule = {
    urlPattern: RegExp | string;
    handler: string;
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      networkTimeoutSeconds?: number;
      cachableResponse?: {
        statuses: number[];
        headers: Record<string, string>;
      };
    };
  };

  export type PWAConfig = {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: RuntimeCachingRule[];
    buildExcludes?: Array<string | RegExp>;
    skipWaiting?: boolean;
  };

  export default function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
