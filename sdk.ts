

// TEMP SAFE VERSION — disables broken Maps config

export async function makeRequest<T = unknown>(): Promise<T> {
  console.warn("makeRequest disabled — no backend configured yet");
  return {} as T;
}
