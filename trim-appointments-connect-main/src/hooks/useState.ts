
import { useState as reactUseState } from 'react';

export function useToggle(initialState: boolean = false) {
  const [isOpen, setIsOpen] = reactUseState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return [
    { isOpen, setIsOpen },
    { open, close, toggle },
  ] as const;
}

export default useToggle;
