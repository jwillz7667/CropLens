export const Footer = () => (
  <footer className="border-t border-white/5 bg-slate-950/80 py-10">
    <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 text-sm text-slate-400 md:flex-row">
      <p>&copy; {new Date().getFullYear()} CropLens. All rights reserved.</p>
      <div className="flex gap-4">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="mailto:hello@croplens.app">Support</a>
      </div>
    </div>
  </footer>
);
