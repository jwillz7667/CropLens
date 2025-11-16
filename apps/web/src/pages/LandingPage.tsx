import { motion } from 'framer-motion';
import { ArrowRight, Droplets, Leaf, Satellite, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const steps = [
  { title: 'Upload or sync imagery', body: 'Drag in drone orthomosaics or connect Sentinel tiles in seconds.' },
  { title: 'We process NDVI + insights', body: 'Our pipeline normalizes bands, runs NDVI, and surfaces stress hotspots.' },
  { title: 'Act with confidence', body: 'Trigger irrigation, scouting, or alerts before issues spread.' },
];

const features = [
  {
    title: 'Field-level NDVI heatmaps',
    description: 'Blend drone + satellite imagery with crisp overlays and smooth map transitions.',
    icon: Leaf,
  },
  {
    title: 'Irrigation & stress alerts',
    description: 'Automatic thresholding plus weather-aware recommendations delivered to your inbox/SMS.',
    icon: Droplets,
  },
  {
    title: 'Historical trends',
    description: 'Track vegetation rebound, fertilizer impact, and multi-field performance in one place.',
    icon: Sparkles,
  },
  {
    title: 'Sentinel Hub integration',
    description: 'On-demand satellite requests with AOI clipping, caching, and failover logic.',
    icon: Satellite,
  },
];

const tiers = [
  {
    name: 'Free',
    price: '$0',
    cta: 'Start free',
    highlights: ['2 fields', 'Satellite sync weekly', 'Email support'],
  },
  {
    name: 'Pro',
    price: '$119/mo',
    cta: 'Upgrade to Pro',
    popular: true,
    highlights: ['10 fields', 'Drone uploads + NDVI pipeline', 'Alerts + automations'],
  },
  {
    name: 'Business',
    price: 'Custom',
    cta: 'Talk to sales',
    highlights: ['Unlimited acreage', 'Multi-user + SSO', 'Priority processing + API'],
  },
];

const faqs = [
  {
    q: 'Will this work with drone imagery I already have?',
    a: 'Yes. Upload GeoTIFFs or stitched tiles and CropLens handles reprojection, cropping, and NDVI rendering.',
  },
  {
    q: 'Do I need a satellite imagery subscription?',
    a: 'No. We manage Sentinel Hub requests. Add your key for faster quotas or BYO STAC endpoint.',
  },
  {
    q: 'How fast is processing?',
    a: 'Most NDVI runs finish under 2 minutes thanks to a serverless queue and GPU-backed workers.',
  },
];

export const LandingPage = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <Navbar />
    <main>
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-sm uppercase tracking-[0.3em] text-emerald-300">
              Crop health clarity
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 text-4xl font-bold leading-tight md:text-5xl"
            >
              See your fields clearly. Act before it&apos;s too late.
            </motion.h1>
            <p className="mt-6 text-lg text-slate-300">
              CropLens fuses drone + satellite imagery to monitor stress, irrigate precisely, and keep every acre profitable.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/app/onboarding"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 font-semibold text-slate-950"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3">
                View demo pricing
              </a>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="relative rounded-3xl border border-emerald-500/20 bg-white/5 p-6 shadow-card"
          >
            <div className="rounded-2xl bg-slate-900/70 p-4">
              <p className="text-sm text-emerald-300">Live NDVI insight</p>
              <p className="text-2xl font-semibold">North section is dry; irrigate by Tuesday.</p>
              <p className="mt-2 text-sm text-slate-400">76 acres · Alert severity: Medium</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-4">
                <p className="text-xs uppercase text-slate-400">Avg NDVI</p>
                <p className="text-3xl font-semibold text-emerald-300">0.72</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-4">
                <p className="text-xs uppercase text-slate-400">Low vigor acres</p>
                <p className="text-3xl font-semibold text-orange-300">12%</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how" className="border-b border-white/5 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">How it works</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"
              >
                <div className="text-4xl font-bold text-emerald-400">0{index + 1}</div>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-slate-400">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-white/5 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Features</p>
            <h2 className="mt-4 text-3xl font-semibold">Everything agronomists need in one canvas</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
                <feature.icon className="h-8 w-8 text-emerald-300" />
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-white/5 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Pricing</p>
            <h2 className="mt-4 text-3xl font-semibold">Scale from a single pivot to enterprise acreage</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-3xl border p-6 ${
                  tier.popular ? 'border-emerald-500 bg-emerald-400/10 shadow-card' : 'border-white/5 bg-slate-900/60'
                }`}
              >
                {tier.popular && <p className="text-xs uppercase text-emerald-300">Most popular</p>}
                <h3 className="mt-2 text-2xl font-semibold">{tier.name}</h3>
                <p className="mt-4 text-3xl font-bold">{tier.price}</p>
                <ul className="mt-6 space-y-2 text-sm text-slate-300">
                  {tier.highlights.map((highlight) => (
                    <li key={highlight}>• {highlight}</li>
                  ))}
                </ul>
                <a
                  href="/app/onboarding"
                  className={`mt-8 block rounded-full px-4 py-2 text-center text-sm font-semibold ${
                    tier.popular ? 'bg-emerald-400 text-slate-950' : 'border border-white/10 text-white'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-slate-950">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold">Growers already trust CropLens</h2>
          <div className="mt-10 space-y-6">
            <blockquote className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              “We cut irrigation water 18% because CropLens flagged hot spots three days earlier than scouting.”
              <footer className="mt-4 text-sm text-slate-400">— Maria, Farm Manager in Nebraska</footer>
            </blockquote>
            <blockquote className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              “The NDVI change alerts help me prioritize which growers to visit first.”
              <footer className="mt-4 text-sm text-slate-400">— David, Independent Agronomist</footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold">FAQ</h2>
          <div className="mt-10 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
                <p className="text-lg font-semibold">{faq.q}</p>
                <p className="mt-2 text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);
