import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/logo-180.png";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/admin", label: "Products", end: true },
  { to: "/admin/hero-slides", label: "Hero Banners", end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-rose-100 text-rose-700"
      : "text-stone-600 hover:bg-rose-50 hover:text-rose-600"
  }`;

export default function AdminLayout() {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock page scroll behind the drawer while it's open on mobile.
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:py-10">
      {/* Mobile top bar — hidden once the sidebar is permanently visible from sm up */}
      <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-4 sm:hidden">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="font-serif text-lg font-bold text-stone-800">
              Casa Lilly
            </p>
            <p className="text-xs text-stone-400">Admin</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:bg-stone-50"
        >
          <Menu className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <div className="flex gap-8">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto bg-white p-5 shadow-xl transition-transform duration-300 ease-in-out sm:static sm:z-auto sm:w-48 sm:flex-shrink-0 sm:translate-x-0 sm:overflow-visible sm:bg-transparent sm:p-0 sm:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 px-3 sm:px-0">
            <div className="hidden items-center gap-2.5 sm:flex">
              <img src={logo} alt="" className="h-9 w-9 rounded-full object-cover" />
              <div>
                <p className="font-serif text-lg font-bold text-stone-800">
                  Casa Lilly
                </p>
                <p className="text-xs text-stone-400">Admin</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:hidden">
              <p className="text-sm font-semibold text-stone-800">Menu</p>
              <button
                type="button"
                onClick={closeSidebar}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeSidebar}
                className={linkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="mt-6 block w-full rounded-lg border border-stone-200 px-3 py-2 text-left text-sm font-medium text-stone-600 transition hover:bg-stone-50"
          >
            Log out
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
