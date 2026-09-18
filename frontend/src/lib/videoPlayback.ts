type StopFn = () => void;

let current: StopFn | null = null;

/** Ensures only one product video plays at a time across the whole app —
 * starting or resuming one stops whatever was previously playing elsewhere
 * (another product card, or the detail-page video). */
export function requestVideoPlay(stop: StopFn) {
  if (current && current !== stop) current();
  current = stop;
}

export function releaseVideoPlay(stop: StopFn) {
  if (current === stop) current = null;
}
