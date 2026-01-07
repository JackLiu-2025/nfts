import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, MessageCircle, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: MessageCircle, href: '#', label: 'Discord' },
    { icon: Github, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-gradient">NFT Market</span>
            </div>
            <p className="text-white/50 mb-4">
              Discover, collect, and trade extraordinary digital art on Polygon blockchain.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg glass-hover flex items-center justify-center group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 group-hover:text-cyber-cyan transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Marketplace</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace" className="text-white/50 hover:text-cyber-cyan transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/mint" className="text-white/50 hover:text-cyber-cyan transition-colors">
                  Create
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-white/50 hover:text-cyber-cyan transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/50 hover:text-cyber-cyan transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-white/50 hover:text-cyber-cyan transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-white/50 hover:text-cyber-cyan transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50">
          <p>© {currentYear} NFT Market. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
