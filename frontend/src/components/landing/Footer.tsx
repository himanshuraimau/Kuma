import { Twitter, Github, Linkedin } from 'lucide-react';

export const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    // Links (kept same structure)
    const footerLinks = {
        product: [
            { label: 'Features', href: '#features' },
            { label: 'Technology', href: '#technology' },
            { label: 'Integrations', href: '#' },
            { label: 'Pricing', href: '#' },
        ],
        company: [
            { label: 'About Us', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Careers', href: '#' },
        ],
        resources: [
            { label: 'Help Center', href: '#' },
            { label: 'Privacy', href: '#' },
            { label: 'Terms', href: '#' },
        ],
    };

    const socialLinks = [
        { icon: <Twitter size={18} />, href: '#' },
        { icon: <Github size={18} />, href: '#' },
        { icon: <Linkedin size={18} />, href: '#' },
    ];

    return (
        <footer className="bg-zinc-950 border-t border-zinc-900 py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">K</span>
                            </div>
                            <span className="text-white font-bold text-xl">Kuma</span>
                        </div>
                        <p className="text-zinc-500 text-sm max-w-xs">
                            Your intelligent AI assistant designed to streamline your workflow and organize your life.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social, index) => (
                                <a key={index} href={social.href} className="text-zinc-500 hover:text-white transition-colors">
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{category}</h4>
                            <ul className="space-y-3">
                                {links.map((link, idx) => (
                                    <li key={idx}>
                                        <a href={link.href} className="text-sm text-zinc-500 hover:text-orange-400 transition-colors">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
                    <p>© {currentYear} Kuma AI. All rights reserved.</p>
                    <p>Designed for productivity.</p>
                </div>
            </div>
        </footer>
    );
};