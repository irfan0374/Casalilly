import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BookOpen,
  CalendarHeart,
  Ellipsis,
  ExternalLink,
  Flower2,
  GalleryHorizontal,
  LayoutGrid,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import logo from "../../assets/logo-180.png";
import { useAuth } from "../../context/AuthContext";
import { ToastProvider } from "./ui/Toast";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const SIDEBAR_ITEMS: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/products", label: "Products", icon: Flower2 },
  { to: "/admin/hero-slides", label: "Banners", icon: GalleryHorizontal },
  { to: "/admin/occasions", label: "Occasions", icon: CalendarHeart },
  { to: "/admin/about", label: "About Page", icon: BookOpen },
];

const TAB_ITEMS: NavItem[] = [
  { to: "/admin", label: "Home", icon: LayoutGrid, end: true },
  { to: "/admin/products", label: "Products", icon: Flower2 },
  { to: "/admin/hero-slides", label: "Banners", icon: GalleryHorizontal },
  { to: "/admin/more", label: "More", icon: Ellipsis },
];

/** Add/edit screens are full-screen on mobile (own back-arrow header and
 * sticky save bar), so the bottom tabs step out of the way there. */
function isFormRoute(pathname: string): boolean {
  return /\/(new|edit)$/.test(pathname);
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <img src={logo} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-rose-100" />
      <div className="leading-tight">
        <p className="font-display text-lg font-semibold text-stone-900">Casa Lilly</p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
          Admin
        </p>
      </div>
    </div>
  );
}

function Sidebar() {
  const { logout } = useAuth();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-stone-100 bg-white px-4 py-6 lg:flex">
      <div className="px-2">
        <Brand />
      </div>
      <nav className="mt-8 flex flex-col gap-1">
        {SIDEBAR_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition ${
                isActive
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-600/20"
                  : "text-stone-600 hover:bg-rose-50 hover:text-rose-700"
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-stone-600 transition hover:bg-stone-50"
        >
          <ExternalLink className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          View Website
        </a>
        <button
          type="button"
          onClick={logout}
          className="flex h-11 items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  );
}

function BottomTabs() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-4">
        {TAB_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
                isActive ? "text-rose-700" : "text-stone-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition ${
                    isActive ? "bg-rose-100" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.75} aria-hidden="true" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function AdminLayout() {
  const { pathname } = useLocation();
  const formRoute = isFormRoute(pathname);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#fcf9fd] font-admin text-stone-800 antialiased">
        <Sidebar />

        {!formRoute && (
          <header className="sticky top-0 z-30 flex h-16 items-center border-b border-stone-100 bg-white/90 px-4 backdrop-blur lg:hidden">
            <Brand />
          </header>
        )}

        <div className="lg:pl-64">
          <main
            className={`mx-auto max-w-6xl px-4 lg:px-10 lg:pt-10 ${
              formRoute
                ? "pb-[calc(7rem+env(safe-area-inset-bottom))]"
                : "pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 lg:pb-12"
            }`}
          >
            <Outlet />
          </main>
        </div>

        {!formRoute && <BottomTabs />}
      </div>
    </ToastProvider>
  );
}
