// src/types/web-push.d.ts
// Minimal type declarations for 'web-push' package to satisfy TypeScript.

declare module "web-push" {
  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function sendNotification(
    subscription: {
      endpoint: string;
      keys?: { p256dh?: string; auth?: string };
    },
    payload?: string,
    options?: {
      vapidDetails?: {
        subject?: string;
        publicKey?: string;
        privateKey?: string;
      };
      TTL?: number;
      headers?: Record<string, string>;
    }
  ): Promise<void>;

  export function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };

  const _default: {
    setVapidDetails: typeof setVapidDetails;
    sendNotification: typeof sendNotification;
    generateVAPIDKeys: typeof generateVAPIDKeys;
  };
  export default _default;
}