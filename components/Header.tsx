// src/components/Header.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/logo.webp" 
            alt="Su Auto Honduras" 
            width={200} 
            height={60} 
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
          <Link href="/vender" className="hover:text-blue-600 transition">Vender Vehículo</Link>
          <Link href="/rentar" className="hover:text-blue-600 transition">Rentar Vehículo</Link>
          <Link href="/noticias" className="hover:text-blue-600 transition">Noticias</Link>
          <Link href="/contacto" className="hover:text-blue-600 transition">Contáctenos</Link>
        </nav>

        {/* Portal Único de Entrada */}
        <div className="flex items-center space-x-4">
          <Link 
            href="/login" 
            className="rounded-lg bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </header>
  );
}