import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `sidebar-link${isActive ? " sidebar-link--active" : ""}`;

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        className={`sidebar-backdrop${open ? " sidebar-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside className={`sidebar${open ? " sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">InvoiceFlow</h2>
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {user && <p className="sidebar-user">{user.name}</p>}

        <nav className="sidebar-nav" onClick={onClose}>
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/customers" className={linkClass}>
            Customers
          </NavLink>
          <NavLink to="/invoices" className={linkClass}>
            Invoices
          </NavLink>
          <NavLink to="/create-invoice" className={linkClass}>
            Create Invoice
          </NavLink>
          <NavLink to="/business" className={linkClass}>
            Business Profile
          </NavLink>
        </nav>

        <button type="button" className="sidebar-logout" onClick={logout}>
          Log out
        </button>
      </aside>
    </>
  );
}

export function MobileHeader({ title, onMenuOpen }) {
  return (
    <header className="mobile-header">
      <button
        type="button"
        className="menu-toggle"
        onClick={onMenuOpen}
        aria-label="Open menu"
      >
        ☰
      </button>
      <span className="mobile-header-title">{title}</span>
    </header>
  );
}
