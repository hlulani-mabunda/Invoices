import Sidebar, { MobileHeader } from "./Sidebar";
import { useMobileNav } from "../hooks/useMobileNav";

export default function PageLayout({ title, children }) {
  const { menuOpen, openMenu, closeMenu } = useMobileNav();

  return (
    <div className="page">
      <Sidebar open={menuOpen} onClose={closeMenu} />
      <div className="page-content">
        <MobileHeader title={title} onMenuOpen={openMenu} />
        <h1 className="page-title">{title}</h1>
        {children}
      </div>
    </div>
  );
}
