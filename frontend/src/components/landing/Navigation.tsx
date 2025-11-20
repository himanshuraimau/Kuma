import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
      <nav className={`mx-auto max-w-7xl px-6 ${isScrolled ? 'bg-zinc-950/80 backdrop-blur-md border border-zinc-800 shadow-2xl' : 'bg-transparent border-transparent'} rounded-2xl h-16 flex items-center justify-between transition-all duration-300`}>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain" />
          <span className="text-white font-bold text-xl tracking-tight">Kuma</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Technology', 'Experience'].map((item) => (
            <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              {item}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-orange-600 hover:bg-orange-500 text-white rounded-full px-5">Get Started</Button>
          </Link>
        </div>

        {/* Mobile Trigger */}
        <button className="md:hidden text-zinc-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl">
          {['Features', 'Technology', 'Experience'].map((item) => (
            <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-left px-4 py-3 text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors">
              {item}
            </button>
          ))}
          <div className="h-px bg-zinc-800 my-2" />
          <Link to="/login" className="w-full"><Button variant="ghost" className="w-full justify-start text-zinc-300">Log in</Button></Link>
          <Link to="/signup" className="w-full"><Button className="w-full bg-orange-600 hover:bg-orange-500">Get Started</Button></Link>
        </div>
      )}
    </header>
  );
};