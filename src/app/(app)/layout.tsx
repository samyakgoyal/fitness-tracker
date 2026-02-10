import { NavBar } from "@/components/layout/nav-bar";
import { Providers } from "@/components/providers";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-6">
        {children}
      </main>
      <ServiceWorkerRegistration />
    </Providers>
  );
}
