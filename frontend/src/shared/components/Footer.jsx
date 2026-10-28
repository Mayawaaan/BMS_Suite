import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  FileText,
  Lock,
  Globe,
  CheckCircle2,
  ExternalLink,
  Building2,
  MapPin,
  Mail,
  ArrowUpRight,
  Server,
  KeyRound,
  Shield,
  Code2,
  Terminal,
} from 'lucide-react';
import { Modal } from './Modal';

// Authentic inline SVG brand icons for Zsyio social destinations
const GitHubIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedInIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.49 1.49 0 1 0 0-2.98 1.49 1.49 0 0 0 0 2.98m1.4 9.74v-8.37H5.06v8.37h2.8z" />
  </svg>
);

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const Footer = () => {
  const [modalType, setModalType] = useState(null); // 'privacy' | 'terms' | 'disclaimer' | 'trademarks' | 'security'

  return (
    <footer className="mt-16 pt-10 pb-12 border-t border-[var(--border-color)] bg-[#FAF6EF]/70 rounded-3xl p-6 sm:p-10 space-y-8 text-[var(--text-primary)] shadow-sm">
      {/* Brand Header & Corporate Identity Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[var(--border-color)]">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://zsyio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#9A3412] flex items-center justify-center text-white shadow-xs group-hover:bg-[#7C2D12] transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-[var(--text-primary)] group-hover:text-[#9A3412] transition-colors">
                Zsyio™
              </span>
            </a>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#9A3412] border border-[#FDE68A]">
              Technology Corporation
            </span>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#FFFFFF] text-[var(--text-secondary)] border border-[var(--border-color)]">
              Indore, India • Global Delivery
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Premier technology partner for custom website building, enterprise software engineering, cloud architecture, and full-stack digital solutions. Rooted in Indore, India, serving global enterprises, startups, and visionary founders.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)] pt-1">
            <a
              href="mailto:contact@zsyio.com"
              className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#9A3412] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>contact@zsyio.com</span>
            </a>
            <span>•</span>
            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <MapPin className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>Indore, Madhya Pradesh, India</span>
            </div>
            <span>•</span>
            <a
              href="https://zsyio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#9A3412] font-semibold hover:underline"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>www.zsyio.com</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Official Social Links & Direct Inquiries */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
            Connect with Zsyio
          </span>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ZSYIO"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zsyio on GitHub"
              className="w-9 h-9 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] hover:border-[#9A3412] hover:text-[#9A3412] text-[var(--text-secondary)] flex items-center justify-center transition-all shadow-xs hover:-translate-y-0.5"
            >
              <GitHubIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/zsyio-technology-0b0005391/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zsyio on LinkedIn"
              className="w-9 h-9 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] hover:border-[#9A3412] hover:text-[#9A3412] text-[var(--text-secondary)] flex items-center justify-center transition-all shadow-xs hover:-translate-y-0.5"
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/zsyio_tech/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zsyio on Instagram"
              className="w-9 h-9 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] hover:border-[#9A3412] hover:text-[#9A3412] text-[var(--text-secondary)] flex items-center justify-center transition-all shadow-xs hover:-translate-y-0.5"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://zsyio.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs hover:-translate-y-0.5 ml-1"
            >
              <span>Start Project</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 4-Column Grid: Services, Corporate Hubs, Legal Standards, Engineering Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-2">
        {/* Column 1: Core Capabilities */}
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[#9A3412] font-bold">
            Engineering Capabilities
          </p>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)] font-medium">
            <li>
              <a
                href="https://zsyio.com/services/custom-software-engineering"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>Custom Software Engineering</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
            <li>
              <a
                href="https://zsyio.com/services/ui-ux-design-systems"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>Website Building & UI/UX</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
            <li>
              <a
                href="https://zsyio.com/services/enterprise-application-modernization"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>Enterprise Modernization</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
            <li>
              <a
                href="https://zsyio.com/services/cloud-infrastructure-devops"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>Cloud Infrastructure & DevOps</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
            <li>
              <a
                href="https://zsyio.com/services/ai-ml-data-intelligence"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>AI, ML & Data Intelligence</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
            <li>
              <a
                href="https://zsyio.com/services/mobile-app-development"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>Mobile App Development</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: Corporate Hubs */}
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[#9A3412] font-bold">
            Corporate Hubs
          </p>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)] font-medium">
            <li>
              <a
                href="https://zsyio.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>About Zsyio Technology</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
            <li>
              <a
                href="https://zsyio.com/projects"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>Projects Portfolio</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
            <li>
              <a
                href="https://zsyio.com/products"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>Proprietary Products</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
            <li>
              <a
                href="https://zsyio.com/insights"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>Technical Insights & Blog</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
            <li>
              <a
                href="https://zsyio.com/careers"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>Careers at Zsyio</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
            <li>
              <a
                href="https://zsyio.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9A3412] transition-colors flex items-center justify-between group"
              >
                <span>Direct Contact & Intake</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9A3412]" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal & Standards */}
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[#9A3412] font-bold">
            Legal & Standards
          </p>
          <div className="flex flex-col space-y-2 text-xs font-medium">
            <button
              onClick={() => setModalType('privacy')}
              className="text-left text-[var(--text-secondary)] hover:text-[#9A3412] transition-colors flex items-center justify-between py-0.5 group cursor-pointer"
            >
              <span>Privacy Policy</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[#9A3412]">
                DPDP/GDPR
              </span>
            </button>
            <button
              onClick={() => setModalType('terms')}
              className="text-left text-[var(--text-secondary)] hover:text-[#9A3412] transition-colors flex items-center justify-between py-0.5 group cursor-pointer"
            >
              <span>Terms & Conditions</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[#9A3412]">
                T&C
              </span>
            </button>
            <button
              onClick={() => setModalType('disclaimer')}
              className="text-left text-[var(--text-secondary)] hover:text-[#9A3412] transition-colors flex items-center justify-between py-0.5 group cursor-pointer"
            >
              <span>Legal Disclaimer</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[#9A3412]">
                Advisory
              </span>
            </button>
            <button
              onClick={() => setModalType('trademarks')}
              className="text-left text-[var(--text-secondary)] hover:text-[#9A3412] transition-colors flex items-center justify-between py-0.5 group cursor-pointer"
            >
              <span>Trademarks Notice</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[#9A3412]">
                Zsyio™
              </span>
            </button>
            <button
              onClick={() => setModalType('security')}
              className="text-left text-[var(--text-secondary)] hover:text-[#9A3412] transition-colors flex items-center justify-between py-0.5 group cursor-pointer"
            >
              <span>Security & Cryptography</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[#9A3412]">
                Bcrypt/JWT
              </span>
            </button>
          </div>
        </div>

        {/* Column 4: Engineering Principles & Standards */}
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[#9A3412] font-bold">
            Engineering Principles
          </p>
          <div className="flex flex-wrap gap-2">
            {['ISO-Ready', 'Secure Pipelines', 'Cloud-Native', 'Performance Optimized', 'Bcrypt-10 Salt', 'Zero-Trust RBAC'].map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] uppercase font-semibold px-2.5 py-1 rounded-md bg-[#FFFFFF] border border-[var(--border-color)] text-[var(--text-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="pt-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
            Architected by Zsyio Technology with defense-in-depth security, strict tenant perimeter isolation, and enterprise SLA benchmarks.
          </div>
        </div>
      </div>

      {/* Middle Row: Official Trademark & Corporate Disclaimer Notice */}
      <div className="space-y-2 pt-4 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] leading-relaxed">
        <p className="font-semibold text-[var(--text-secondary)]">
          © 2026 <strong className="text-[var(--text-primary)]">Zsyio™</strong> (Zsyio Technology). All rights reserved.
        </p>
        <p>
          <strong className="text-[var(--text-secondary)]">Registered Technology Brand:</strong> Zsyio, Zsyio Technology, the Zsyio Logo, and associated digital marks are proprietary trademarks and intellectual property of Zsyio Technology (Indore, Madhya Pradesh, India). All other product names, logos, and trademarks referenced herein are the property of their respective owners.
        </p>
        <p>
          <strong className="text-[var(--text-secondary)]">Regulatory & Financial Advisory Disclaimer:</strong> ZSYIO BMS is an enterprise resource planning and business management platform engineered by Zsyio Technology. Telemetry, ledger records, MRR projections, valuation models, and sales conversion metrics provided by the platform are generated for operational governance and accounting auditing purposes. Zsyio Technology does not provide legal, certified public accounting, or tax advisory services. Organizations should verify statutory filings with qualified financial professionals.
        </p>
      </div>

      {/* Bottom Status & System Health Bar (Matching www.zsyio.com) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border-color)] text-[11px] font-mono">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[var(--border-color)] shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="font-bold text-emerald-800 tracking-wider uppercase text-[10px]">
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[var(--text-muted)] text-[10px]">
          <span>Engineered in India</span>
          <span>•</span>
          <span>DPDP Act 2023 & GDPR Compliant</span>
          <span>•</span>
          <span className="text-[#9A3412] font-semibold">v2.1.1 (BMS v2.4 Enterprise)</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PRIVACY POLICY (Scraped & Aligned with Zsyio Technology)           */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalType === 'privacy'}
        onClose={() => setModalType(null)}
        title="Zsyio Technology Privacy Policy"
        subtitle="Compliance: GDPR (EU) • India DPDP Act 2023 • UK Data Protection Act 2018"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[var(--text-primary)]">
                Governing Entity: Zsyio Technology (Indore, India)
              </p>
              <p className="text-[11px] mt-1 text-[var(--text-muted)]">
                Official Policy Reference: <a href="https://zsyio.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#9A3412] underline">zsyio.com/privacy-policy</a>
              </p>
            </div>
            <a
              href="https://zsyio.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-[#FFFFFF] border border-[var(--border-color)] text-[10px] font-semibold text-[#9A3412] flex items-center gap-1 shrink-0 hover:bg-[#FAF6EF]"
            >
              <span>Open on zsyio.com</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">01. Introduction</h4>
            <p>
              Welcome to Zsyio. We are committed to protecting your personal data and ensuring transparency in how information is handled. This policy explains what data we collect, why we collect it, how we use it, and your rights as a data subject under applicable global privacy frameworks including GDPR (EU), India's Digital Personal Data Protection (DPDP) Act 2023, and the UK Data Protection Act 2018.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">02. Data We Collect</h4>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li><strong>Identity data:</strong> name, job title, company name, corporate affiliation.</li>
              <li><strong>Contact data:</strong> verified email address, phone number, registered office address.</li>
              <li><strong>Technical data:</strong> IP address, browser type, device identifiers, salted authentication tokens.</li>
              <li><strong>Usage data:</strong> system telemetry, timestamped audit events, module interactions.</li>
              <li><strong>Contractual data:</strong> engagement scope, deliverable records, billing and invoice ledgers.</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">03. Multi-Tenant Partitioning & Data Sovereignty</h4>
            <p>
              Zsyio BMS operates on strict cryptographic and AsyncLocalStorage tenant boundaries. Data generated by your business (products, customers, sales pipelines, and bills) is strictly partitioned using compound database indexes and unique tenant isolation keys. Under no circumstances is operational data shared across tenants or harvested for third-party commercial exploitation.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">04. Your Rights Under DPDP & GDPR</h4>
            <p>
              Data subjects possess absolute rights to access, rectify, port, or request the deletion of their personal information. Inquiries may be addressed to our Data Governance Officer at <span className="font-mono text-[#9A3412]">contact@zsyio.com</span> (Indore, Madhya Pradesh, India).
            </p>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: TERMS & CONDITIONS (Scraped & Aligned with Zsyio Technology)       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalType === 'terms'}
        onClose={() => setModalType(null)}
        title="Zsyio Technology Terms & Conditions"
        subtitle="Master Enterprise Software & Services Agreement • zsyio.com/terms"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[var(--text-primary)]">
                Binding Legal Terms • Zsyio Technology
              </p>
              <p className="text-[11px] mt-1 text-[var(--text-muted)]">
                Official Agreement Reference: <a href="https://zsyio.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#9A3412] underline">zsyio.com/terms</a>
              </p>
            </div>
            <a
              href="https://zsyio.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-[#FFFFFF] border border-[var(--border-color)] text-[10px] font-semibold text-[#9A3412] flex items-center gap-1 shrink-0 hover:bg-[#FAF6EF]"
            >
              <span>Open on zsyio.com</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">01. Acceptance of Terms</h4>
            <p>
              By accessing or using the Zsyio website, BMS platforms, and digital software services, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">02. Use License</h4>
            <p>
              Permission is granted to temporarily access and utilize the software and materials on Zsyio's platforms for legitimate corporate business management, point-of-sale operations, and internal administration. This represents the grant of a software service license, not a transfer of title or intellectual property.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">03. Disclaimer of Warranties</h4>
            <p>
              The materials on Zsyio's platforms are provided on an 'as is' basis. Zsyio makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">04. Limitations of Liability</h4>
            <p>
              In no event shall Zsyio Technology or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Zsyio's website, even if Zsyio or an authorized representative has been notified of the possibility of such damage.
            </p>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: DISCLAIMER (Scraped & Aligned with Zsyio Technology)               */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalType === 'disclaimer'}
        onClose={() => setModalType(null)}
        title="Zsyio Technology Legal Disclaimer"
        subtitle="Operational Guidance, Third-Party Telemetry & Liability Boundaries"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[var(--text-primary)]">
                General & Professional Disclaimer
              </p>
              <p className="text-[11px] mt-1 text-[var(--text-muted)]">
                Official Reference: <a href="https://zsyio.com/disclaimer" target="_blank" rel="noopener noreferrer" className="text-[#9A3412] underline">zsyio.com/disclaimer</a>
              </p>
            </div>
            <a
              href="https://zsyio.com/disclaimer"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-[#FFFFFF] border border-[var(--border-color)] text-[10px] font-semibold text-[#9A3412] flex items-center gap-1 shrink-0 hover:bg-[#FAF6EF]"
            >
              <span>Open on zsyio.com</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">01. General Information</h4>
            <p>
              The information provided by Zsyio ("we," "us," or "our") on this platform is for general informational purposes only. All information is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any telemetry or metrics.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">02. External Links Disclaimer</h4>
            <p>
              The platform may contain links to external third-party services, documentation, or portals. Such external links are not investigated, monitored, or checked for accuracy or validity by Zsyio. We do not warrant, endorse, guarantee, or assume responsibility for any information offered by third-party websites linked through our platform.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">03. Professional Consultation Disclaimer</h4>
            <p>
              This platform does not contain certified financial, legal, or statutory accounting advice. All financial ratios (MRR, ARR, Margin, EBITDA) are provided for operational governance and internal audit convenience only. Organizations must consult qualified certified accountants and legal counsel prior to formal statutory filings.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">04. Limitation of Liability</h4>
            <p>
              Under no circumstance shall Zsyio Technology be liable for any loss or damage incurred as a result of the use of the platform or reliance on any calculated telemetry. Your use of the platform is solely at your own risk.
            </p>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: TRADEMARKS & BRAND IP (Scraped & Aligned with Zsyio Technology)   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalType === 'trademarks'}
        onClose={() => setModalType(null)}
        title="Zsyio™ Brand & Intellectual Property Guidelines"
        subtitle="Trademark Usage, Brand Protection & Asset Policies • zsyio.com/trademarks"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[var(--text-primary)]">
                Brand & IP Governance • Zsyio Technology
              </p>
              <p className="text-[11px] mt-1 text-[var(--text-muted)]">
                Official Reference: <a href="https://zsyio.com/trademarks" target="_blank" rel="noopener noreferrer" className="text-[#9A3412] underline">zsyio.com/trademarks</a>
              </p>
            </div>
            <a
              href="https://zsyio.com/trademarks"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-[#FFFFFF] border border-[var(--border-color)] text-[10px] font-semibold text-[#9A3412] flex items-center gap-1 shrink-0 hover:bg-[#FAF6EF]"
            >
              <span>Open on zsyio.com</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">01. Trademark Ownership</h4>
            <p>
              "Zsyio", "Zsyio™", the Zsyio Logo, and associated digital marks are proprietary trademarks and intellectual property of Zsyio Technology (Indore, India). All rights are strictly reserved worldwide.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-emerald-800 text-sm">02. Permitted Uses</h4>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>Reference Zsyio by name in editorial, journalistic, or academic contexts.</li>
              <li>Use our name to accurately describe a product or verified software integration.</li>
              <li>Include our name in factual client lists or case studies with our prior written approval.</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-rose-800 text-sm">03. Prohibited Uses</h4>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>Alter, distort, rotate, or combine our trademarks with other elements.</li>
              <li>Imply partnership, endorsement, or commercial affiliation without written consent.</li>
              <li>Register domains, social handles, or corporate accounts using our brand name.</li>
              <li>Use our marks in misleading, derogatory, or unlawful contexts.</li>
              <li>Apply our name to non-Zsyio products or services.</li>
              <li>Use our marks in ways that dilute or damage brand reputation.</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: SECURITY & CRYPTOGRAPHY                                          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalType === 'security'}
        onClose={() => setModalType(null)}
        title="Security & Cryptographic Architecture"
        subtitle="Enterprise Defense-in-Depth: Bcrypt Salting, Signed JWTs, DDoS Throttling & SQL Firewalls"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center gap-2 text-[#9A3412] font-bold">
                <KeyRound className="w-4 h-4" />
                <span>Bcrypt Salting (10 Rounds)</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Protects user passwords against rainbow tables and GPU dictionary attacks with adaptive salted hashing.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center gap-2 text-[#9A3412] font-bold">
                <Lock className="w-4 h-4" />
                <span>HMAC SHA-256 JWT</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Stateless, cryptographically signed bearer tokens validating tenant perimeter and role claims.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center gap-2 text-[#9A3412] font-bold">
                <Shield className="w-4 h-4" />
                <span>Injection Firewalls</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Recursive sanitizers strip SQL injection signatures and NoSQL operator attacks from request bodies and query parameters.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center gap-2 text-[#9A3412] font-bold">
                <Server className="w-4 h-4" />
                <span>DDoS & Brute Force Defense</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Dual-tier IP rate limiting throttles API flooding and defends authentication routes against credential stuffing.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[11px]">
            <p className="font-bold text-[var(--text-primary)]">OTP Verification & Recovery Security</p>
            <p className="mt-1 text-[var(--text-secondary)]">
              Password reset procedures generate cryptographically random 6-digit numeric OTPs with a strict 10-minute time-to-live and 5-attempt brute-force lockout threshold. Verified resets issue signed one-time authorization tokens.
            </p>
          </div>
        </div>
      </Modal>
    </footer>
  );
};

export default Footer;
