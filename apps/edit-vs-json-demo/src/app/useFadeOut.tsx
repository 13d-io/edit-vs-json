import { useEffect, useRef, useState } from 'react';

const useFadeOut = (el: HTMLElement | null) => {
  const [delay, setDelay] = useState<number | null>();
  const transitionEl = useRef<HTMLElement>();

  useEffect(() => {
    if (el) {
      transitionEl.current = el;
      transitionEl.current.style.opacity = '1';
    }
  }, [el]);

  useEffect(() => {
    if (delay !== null) {
      if (transitionEl.current) {
        transitionEl.current.style.opacity = '1';
      }
      let id: ReturnType<typeof setInterval> | null = setInterval(() => {
        if (transitionEl.current) {
          transitionEl.current.style.opacity = '0';
        }
        setDelay(null);
      }, delay);
      return () => {
        if (id) {
          clearInterval(id);
        }
        id = null;
      };
    }
  }, [delay]);

  return setDelay;
}

export default useFadeOut;
