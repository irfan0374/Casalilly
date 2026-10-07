import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, ExternalLink, LogOut, type LucideIcon } from "lucide-react";
import { PageHeader } from "../../components/admin/ui/Layout";
import { useAuth } from "../../context/AuthContext";

/** The mobile "More" tab — everything that doesn't fit in the bottom bar. */
export default function AdminMore() {
  const { logout } = useAuth();

  return (
    <div>
      <PageHeader title="More" />
      <div className="divide-y divide-stone-100 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-100">
        <Row to="/admin/about" icon={BookOpen} title="About Page" subtitle="Edit your website's story" />
        <Row
          href="/"
          icon={ExternalLink}
          title="View Website"
          subtitle="Opens your shop in a new tab"
          trailing={<ExternalLink className="h-5 w-5 text-stone-300" aria-hidden="true" />}
        />
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-red-50"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex-1 text-[15px] font-semibold text-red-600">Log out</span>
        </button>
      </div>
    </div>
  );
}

function Row({
  to,
  href,
  icon: Icon,
  title,
  subtitle,
  trailing,
}: {
  to?: string;
  href?: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  const content = (
    <>
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-stone-900">{title}</span>
        <span className="block text-sm text-stone-500">{subtitle}</span>
      </span>
      {trailing ?? <ChevronRight className="h-5 w-5 text-stone-300" aria-hidden="true" />}
    </>
  );
  const className = "flex items-center gap-4 p-4 transition hover:bg-stone-50";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link to={to!} className={className}>
      {content}
    </Link>
  );
}
