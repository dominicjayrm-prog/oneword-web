import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus within a container element.
 * For conditionally-rendered modals, pass `active` to control when the trap is enabled.
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(active = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus the first focusable element inside the trap
    const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !el) return;

      const focusableEls = el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusableEls.length === 0) return;

      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [active]);

  return ref;
}
