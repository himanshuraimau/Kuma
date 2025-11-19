import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${isScrolled ? 'pt-4' : 'pt-6'
        }`}
    >
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-coral focus:text-cream focus:rounded-lg"
      >
        Skip to main content
      </a>

      <nav
        className={`mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? 'glass-strong' : 'glass'
          } border border-white/10 rounded-xl h-20 flex items-center justify-between`}
        style={{
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/kuma Logo.png"
            alt="Kuma Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-cream font-bold text-xl">Kuma</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-warm-gray hover:text-coral transition-colors duration-200 text-sm font-medium"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('technology')}
            className="text-warm-gray hover:text-coral transition-colors duration-200 text-sm font-medium"
          >
            Technology
          </button>
          <button
            onClick={() => scrollToSection('experience')}
            className="text-warm-gray hover:text-coral transition-colors duration-200 text-sm font-medium"
          >
            About
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-warm-gray hover:text-cream hover:bg-white/5"
          >
            Log in
          </Button>
          <Button className="bg-coral hover:bg-coral/90 text-cream">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-cream p-2 hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mx-4 mt-2 glass-strong border border-white/10 rounded-xl p-6 animate-fade-in-up">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => scrollToSection('features')}
              className="text-warm-gray hover:text-coral transition-colors duration-200 text-left py-2"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('technology')}
              className="text-warm-gray hover:text-coral transition-colors duration-200 text-left py-2"
            >
              Technology
            </button>
            <button
              onClick={() => scrollToSection('experience')}
              className="text-warm-gray hover:text-coral transition-colors duration-200 text-left py-2"
            >
              About
            </button>
            <div className="border-t border-white/10 pt-4 mt-2 flex flex-col gap-3">
              <Button
                variant="ghost"
                className="text-warm-gray hover:text-cream hover:bg-white/5 w-full"
              >
                Log in
              </Button>
              <Button className="bg-coral hover:bg-coral/90 text-cream w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
