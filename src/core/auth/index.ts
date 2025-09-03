import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { ac, admin, nikita, regularPlayer } from './permissions';

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: import.meta.env.VITE_API_URL,
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        regularPlayer,
        nikita,
      },
    }),
  ],
});
