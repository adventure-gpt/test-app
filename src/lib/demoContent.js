import {
  Gauge,
  Layers3,
  LockKeyhole,
  Smartphone,
  Sparkles,
  WandSparkles,
} from 'lucide-react'

export const featureCards = [
  {
    title: 'Private by default',
    description:
      'Sign in with a passkey, keep everything behind your own account, and come back on any device.',
    eyebrow: 'Safe and simple',
    icon: LockKeyhole,
    tone:
      'from-teal-500/15 via-teal-400/10 to-white dark:from-teal-400/15 dark:via-slate-900 dark:to-slate-900',
  },
  {
    title: 'Beautiful custom layouts',
    description:
      'Landing pages, personal dashboards, planners, trackers, and portfolios all get their own visual personality.',
    eyebrow: 'Tailored design',
    icon: Sparkles,
    tone:
      'from-amber-400/20 via-orange-200/20 to-white dark:from-amber-300/10 dark:via-slate-900 dark:to-slate-900',
  },
  {
    title: 'Interactive tools',
    description:
      'Forms, saved notes, progress views, and polished empty states make the site feel like a real product.',
    eyebrow: 'Working features',
    icon: Layers3,
    tone:
      'from-emerald-500/15 via-emerald-300/10 to-white dark:from-emerald-400/10 dark:via-slate-900 dark:to-slate-900',
  },
  {
    title: 'Fast feedback loop',
    description:
      'You describe an idea in plain language, and it quickly turns into something usable instead of staying a sketch.',
    eyebrow: 'From idea to site',
    icon: WandSparkles,
    tone:
      'from-cyan-500/15 via-cyan-300/10 to-white dark:from-cyan-400/10 dark:via-slate-900 dark:to-slate-900',
  },
  {
    title: 'Phone-home-screen ready',
    description:
      'The app works in a normal browser and also feels at home when added to a phone as an installable app.',
    eyebrow: 'Always handy',
    icon: Smartphone,
    tone:
      'from-sky-500/15 via-sky-300/10 to-white dark:from-sky-400/10 dark:via-slate-900 dark:to-slate-900',
  },
  {
    title: 'Organized, not overwhelming',
    description:
      'Clear sections, friendly messaging, and simple controls keep even richer apps easy to understand at a glance.',
    eyebrow: 'Polished flow',
    icon: Gauge,
    tone:
      'from-stone-400/20 via-white to-white dark:from-stone-400/10 dark:via-slate-900 dark:to-slate-900',
  },
]

export const workflowSteps = [
  {
    title: 'You describe the idea',
    copy: 'Short plain-English requests are enough to start a new page, feature, or whole app.',
  },
  {
    title: 'The site takes shape',
    copy: 'Layout, style, interactions, and private sign-in all get wired together into one coherent experience.',
  },
  {
    title: 'You keep refining',
    copy: 'New ideas, content tweaks, and visual upgrades can be folded in without losing the polished feel.',
  },
]

export const sampleBuilds = [
  {
    name: 'Family recipe book',
    note: 'Private cards, favorite dishes, and easy phone use in the kitchen.',
  },
  {
    name: 'Pet health tracker',
    note: 'Log meals, weight, routines, and trends in one calm dashboard.',
  },
  {
    name: 'Creative portfolio',
    note: 'A bold home page with selected work, story sections, and contact flow.',
  },
  {
    name: 'Personal planner',
    note: 'Saved lists, routines, reminders, and progress snapshots that stay tidy.',
  },
]

export const ideaCategories = [
  'Personal dashboard',
  'Tracker',
  'Showcase site',
  'Family project',
  'Small business',
  'Something playful',
]

export const starterIdeas = [
  {
    title: 'Reading corner',
    summary: 'A cozy place to track what I am reading and write quick notes after each book.',
    category: 'Personal dashboard',
    status: 'fresh',
  },
  {
    title: 'Dog care planner',
    summary: 'A private helper for meals, meds, walks, and vet reminders all in one place.',
    category: 'Tracker',
    status: 'taking-shape',
  },
  {
    title: 'Handmade shop preview',
    summary: 'A warm, polished site that shows featured products and tells the brand story clearly.',
    category: 'Small business',
    status: 'ready',
  },
]

export const statusMeta = {
  fresh: {
    label: 'Just sparked',
    badge:
      'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/20',
  },
  'taking-shape': {
    label: 'Taking shape',
    badge:
      'bg-teal-100 text-teal-800 ring-1 ring-inset ring-teal-200 dark:bg-teal-500/15 dark:text-teal-100 dark:ring-teal-400/20',
  },
  ready: {
    label: 'Ready to build',
    badge:
      'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-400/20',
  },
}
