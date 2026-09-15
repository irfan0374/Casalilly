import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-24 sm:pb-0">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <BottomNav />
    </div>
  );
}
