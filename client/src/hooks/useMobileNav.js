import { useState } from "react";

export function useMobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  return {
    menuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
  };
}
