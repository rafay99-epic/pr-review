// Motion hooks. Every effect writes styles or attributes directly and is driven by scroll,
// pointer or a one-off timer, so nothing repaints continuously and React never re-renders
// on scroll.

import { type RefObject, useEffect, useRef, useState } from "react";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Reveals every `[data-reveal]` element once, the first time it scrolls into view. */
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-reveal", "shown");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    for (const el of document.querySelectorAll("[data-reveal]")) io.observe(el);
    return () => io.disconnect();
  }, []);
}

/**
 * Drives the exploded stack: `--p` is how far the hero has scrolled away (0..1) and
 * `--tx`/`--ty` the pointer position (-1..1). Updates are batched to one per frame.
 */
export function useStackMotion(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    let frame = 0;
    const schedule = (fn: () => void) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fn);
    };
    const onScroll = () =>
      schedule(() => {
        const rect = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.9)));
        el.style.setProperty("--p", p.toFixed(3));
      });
    const onPointer = (e: PointerEvent) =>
      schedule(() => {
        el.style.setProperty("--tx", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty("--ty", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [ref]);
}

/**
 * Counts from 0 to `to` once, over `ms`, the first time the element is in view. The element
 * renders the real number; it is only reset to 0 here, right before the count can play, so
 * print, previews and reduced motion always show the true value.
 */
export function useCountUp<T extends HTMLElement>(to: number, ms = 1400) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || el.getBoundingClientRect().top < window.innerHeight) return;
    el.textContent = "0";
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        el.textContent = String(Math.round(to * (1 - (1 - t) ** 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, ms]);
  return ref;
}

/** Which of the elements with these ids is closest to the middle of the viewport. */
export function useActive(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    // A short last section never reaches the middle band, so the end of the page selects it.
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const last = ids.at(-1);
        if (last && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) setActive(last);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);
  return active;
}
