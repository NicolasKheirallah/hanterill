"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";


/**
 * `useReducedMotion` that agrees with the server on the first render.
 *
 * The raw hook resolves the media query during render: it is `null` during
 * SSR and already `true` on the client's first pass when the user has reduced
 * motion enabled. Anything that branches on it during render - an `initial`
 * prop, a `<animate>` element, a `useState` initialiser - therefore produces
 * different markup on the two sides and React throws a hydration mismatch
 * that regenerates the whole tree. `ScanSimulator` initialised its clock from
 * it, so reduced-motion users got a flash from "Idle / 0 ECUs" to a finished
 * scan plus a full client re-render.
 *
 * This returns `false` until after mount, so the server and the first client
 * render are identical. Reduced motion then applies on the next commit, which
 * is one frame later and invisible. Use this everywhere instead of the raw
 * hook.
 */
const subscribeNoop = () => () => {};
/** `false` during SSR and on the first client render, `true` from then on. */
function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function useReducedMotionSafe(): boolean {
  const reduce = useReducedMotion();
  return useMounted() && !!reduce;
}

/**
 * Same idea for `prefers-reduced-transparency` and `prefers-contrast`, which
 * motion does not expose. Both are honoured entirely in CSS
 * (`globals.css`), so this is only needed where a component must choose
 * different markup rather than different styling.
 */
export function useMediaQuerySafe(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
