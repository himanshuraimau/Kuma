import { Twitter, Github, Linkedin } from 'lucide-react';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Features', href: '#features' },
            { label: 'Technology', href: '#technology' },
            { label: 'Integrations', href: '#' },
            { label: 'Pricing', href: '#' },
            { label: 'API Docs', href: '#' },
        ],
        company: [
            { label: 'About Us', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Press Kit', href: '#' },
            { label: 'Contact', href: '#' },
        ],
        resources: [
            { label: 'Help Center', href: '#' },
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Status Page', href: '#' },
        ],
    };

    const socialLinks = [
        { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
        { icon: <Github size={16} />, href: '#', label: 'GitHub' },
        { icon: <Linkedin size={16} />, href: '#', label: 'LinkedIn' },
    ];

    return (
        <footer className="bg-navy border-t border-white/10 py-16">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img
                                src="/kuma Logo.png"
                                alt="Kuma Logo"
                                className="w-8 h-8 object-contain"
                            />
                            <span className="text-cream font-bold text-xl">Kuma</span>
                        </div>
                        <p className="text-warm-gray/80 text-sm">
                            Your intelligent AI assistant
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3 pt-2">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-warm-gray/80 hover:text-coral transition-all duration-200"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h4 className="text-[14px] uppercase tracking-wider text-cream font-semibold mb-4">
                            Product
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-warm-gray/80 hover:text-coral transition-colors duration-200 text-sm"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 className="text-[14px] uppercase tracking-wider text-cream font-semibold mb-4">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-warm-gray/80 hover:text-coral transition-colors duration-200 text-sm"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h4 className="text-[14px] uppercase tracking-wider text-cream font-semibold mb-4">
                            Resources
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-warm-gray/80 hover:text-coral transition-colors duration-200 text-sm"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-warm-gray/70">
                    <p>© {currentYear} Kuma AI. All rights reserved.</p>
                    <p>Designed with care for productivity enthusiasts worldwide</p>
                </div>
            </div>
        </footer>
    );
};
