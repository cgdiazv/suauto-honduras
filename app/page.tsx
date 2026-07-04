// app/page.tsx
import Image from 'next/image';
import InventoryShell from '@/components/InventoryShell';

export default function Home() {
  return (
    <div className="space-y-12 pb-16 bg-slate-50 min-h-screen">
      
      {/* 1. HERO BLOCK: Restricted strictly to the top */}
      <section className="relative bg-slate-900 py-20 px-4 text-white text-center overflow-hidden">
        <Image
          src="/hero-suauto.webp"
          alt="Su Auto Hero Background"
          fill
          priority
          className="object-cover object-center opacity-15 z-0"
          sizes="100vw"
        />
        
        {/* Only hero text and filters sit here */}
        <div className="mx-auto max-w-4xl space-y-6 relative z-10">
          <InventoryShell renderSection="hero" />
        </div>
      </section>

      {/* 2. GRID BLOCK: Separated cleanly on a light background underneath */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <InventoryShell renderSection="grid" />
      </section>

    </div>
  );
}