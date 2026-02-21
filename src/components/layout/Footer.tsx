"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Twitter, Linkedin, Instagram, Mail } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Stories", href: "/stories" },
    { label: "Startups", href: "/startups" },
    { label: "Cities", href: "/cities" },
    { label: "Categories", href: "/categories" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Submit Startup", href: "/submit" },
    { label: "Contact", href: "/contact" },
    { label: "Advertise", href: "/advertise" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/startupsaga", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/startupsaga", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com/startupsaga", label: "Instagram" },
  { icon: Mail, href: "mailto:hello@startupsaga.in", label: "Email" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide section-padding">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4 hover:opacity-90 transition-opacity">
              <Logo />
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              Discovering and celebrating the incredible startup journeys across India.
              Every founder has a story worth telling.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              Platform
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © 2026 StartupSaga.in. All rights reserved.
            </p>
            <p className="text-sm text-primary-foreground/60">
              Made with ❤️ for Indian Startups
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
