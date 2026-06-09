// src/components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Text/Image Placeholder */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-tight text-blue-900">
            SU AUTO<span className="text-blue-500">.hn</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
          <Link href="/vehiculos" className="hover:text-blue-600 transition">Vehículos</Link>
          <Link href="/vender" className="hover:text-blue-600 transition">Vender Vehículo</Link>
          <Link href="/rentar" className="hover:text-blue-600 transition">Rentar Vehículo</Link>
          <Link href="/taller" className="hover:text-blue-600 transition">Taller</Link>
          <Link href="/noticias" className="hover:text-blue-600 transition">Noticias</Link>
          <Link href="/contacto" className="hover:text-blue-600 transition">Contáctenos</Link>
        </nav>

        {/* Admin Link / CTA */}
        <div className="flex items-center space-x-4">
          <Link 
            href="/admin" 
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
          >
            Portal Admin
          </Link>
        </div>
      </div>
    </header>
  );
}