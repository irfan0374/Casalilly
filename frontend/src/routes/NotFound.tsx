import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import notFoundImage from "../assets/404.png";

export default function NotFound() {
  return (
    <PublicLayout>
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <img
          src={notFoundImage}
          alt="404 — page not found"
          className="w-full max-w-sm sm:max-w-md"
        />
        <h1 className="mt-4 font-serif text-2xl font-bold text-stone-800 sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-2 text-stone-500">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
        >
          Back to Home
        </Link>
      </main>
    </PublicLayout>
  );
}
