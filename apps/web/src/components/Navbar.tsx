import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUIStore } from '@/lib/store';

export const Navbar = () => {
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          CropLens
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how" className="text-sm text-slate-300 hover:text-white">
            How it works
          </a>
          <a href="#features" className="text-sm text-slate-300 hover:text-white">
            Features
          </a>
          <a href="#pricing" className="text-sm text-slate-300 hover:text-white">
            Pricing
          </a>
          <button onClick={toggleTheme} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
            Toggle theme
          </button>
          <Link
            to="/app"
            className="rounded-full border border-emerald-400/30 px-4 py-1 text-sm font-medium text-white"
          >
            Dashboard
          </Link>
        </nav>
        <motion.a
          href="/app/onboarding"
          className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-950"
          whileHover={{ scale: 1.04 }}
        >
          Start free
        </motion.a>
      </div>
    </header>
  );
};
