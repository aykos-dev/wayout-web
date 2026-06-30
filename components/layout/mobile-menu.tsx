'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Compass, Globe, MapPin, Menu, Trophy, X } from 'lucide-react';
import { t, SUPPORTED, type Dictionary, type Lang } from '@/lib/i18n';
import { LANG_LABELS, setLanguage } from '@/lib/set-language';
import { track } from '@/lib/analytics';

const NAV = [
  { href: '/tours', key: 'nav.tours', label: 'tours', Icon: Compass },
  { href: '/destinations', key: 'nav.destinations', label: 'destinations', Icon: MapPin },
  { href: '/leaderboard', key: 'nav.leaderboard', label: 'leaderboard', Icon: Trophy },
] as const;

const LANG_FLAGS: Record<Lang, string> = {
  uz: '🇺🇿',
  en: '🇬🇧',
  ru: '🇷🇺',
};

const panel = {
  hidden: { x: '100%' },
  show: {
    x: 0,
    transition: { type: 'spring', stiffness: 320, damping: 32, when: 'beforeChildren', staggerChildren: 0.05 },
  },
  exit: { x: '100%', transition: { type: 'spring', stiffness: 380, damping: 38 } },
} as const;

const item = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0 },
  exit: { opacity: 0 },
} as const;

export function MobileMenu({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() ?? '';

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-strong md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-[60] md:hidden"
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full bg-ink/40 backdrop-blur-sm"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }}
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              variants={panel}
              className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-white shadow-airbnb"
            >
              <div className="flex items-center justify-between border-b border-hairline px-5 h-20">
                <span className="text-title-md text-ink">Menu</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-strong"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 px-3 py-4">
                {NAV.map((n) => {
                  const active = pathname.startsWith(n.href);
                  const Icon = n.Icon;
                  return (
                    <motion.div key={n.href} variants={item}>
                      <Link
                        href={n.href}
                        onClick={() => {
                          track('nav_click', { target: n.href, label: n.label });
                          setOpen(false);
                        }}
                        className={
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-title-md transition-colors ' +
                          (active
                            ? 'bg-primary-soft text-primary-active'
                            : 'text-ink hover:bg-surface-strong')
                        }
                      >
                        <span
                          className={
                            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' +
                            (active ? 'bg-white/70 text-primary-active' : 'bg-surface-strong text-muted')
                          }
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        {t(dict, 'common', n.key)}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <motion.div variants={item} className="mt-auto border-t border-hairline px-5 py-5">
                <div className="mb-3 flex items-center gap-2 text-body-sm text-muted">
                  <Globe className="h-4 w-4" />
                  <span>{LANG_LABELS[lang]}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {SUPPORTED.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLanguage(l, lang)}
                      className={
                        'flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-md transition-colors ' +
                        (l === lang
                          ? 'bg-surface-strong font-semibold text-ink'
                          : 'text-body hover:bg-surface-strong')
                      }
                    >
                      <span className="text-xl leading-none">{LANG_FLAGS[l]}</span>
                      {LANG_LABELS[l]}
                      {l === lang && <Check className="ml-auto h-4 w-4 text-primary-active" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    )}
    </>
  );
}
