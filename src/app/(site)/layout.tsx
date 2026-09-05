import { Suspense } from "react";
import { Header } from "@/components/Header";
import { SiteChrome, SiteChromeFallback } from "@/components/SiteChrome";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Suspense fallback={<SiteChromeFallback />}>
        <SiteChrome />
      </Suspense>
    </div>
  );
}
