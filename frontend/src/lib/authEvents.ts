/** Tiny pub/sub so the plain axios client (client.ts) can signal AuthContext
 * without importing it directly — apiClient is used before React ever
 * mounts, and AuthContext already reads the token straight from
 * localStorage for the same reason (see client.ts's own comment). */
type Listener = () => void;
const listeners = new Set<Listener>();

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSessionExpired(): void {
  listeners.forEach((listener) => listener());
}
