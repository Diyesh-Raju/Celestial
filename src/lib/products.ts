import {
  Activity,
  BellRing,
  Cable,
  ChartLine,
  CodeXml,
  Compass,
  Contact,
  Cpu,
  Database,
  FileSignature,
  FileText,
  Gauge,
  LayoutTemplate,
  LifeBuoy,
  Megaphone,
  MonitorSmartphone,
  PanelsTopLeft,
  PenLine,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  SquareKanban,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ProductSlug } from "./data";

// What each product page says (components/product/ProductPage.tsx). The names, order
// and links live in `products` in lib/data.ts, which the menu also reads; this file
// stays out of the client bundle.

export type ProductContent = {
  num: string;
  verb: string;
  Icon: LucideIcon;
  /** The h1: plain words, then the accent words */
  headline: [string, string];
  lead: string;
  /** Meta description */
  description: string;
  /** Three promises on the cards overlapping the hero */
  highlights: { title: string; text: string }[];
  /** What we build: six deliverables */
  included: { Icon: LucideIcon; title: string; text: string }[];
  /** Before and after, four rows */
  shift: { before: string; after: string }[];
  /** How we deliver it: four steps */
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  /** Closing call to action: plain words, then the accent words */
  cta: [string, string];
};

export const productContent: Record<ProductSlug, ProductContent> = {
  websites: {
    num: "01",
    verb: "Build",
    Icon: MonitorSmartphone,
    headline: ["Websites and storefronts built to", "convert."],
    lead: "High-conversion web platforms, customer portals and tailored storefronts, designed around your customers and engineered for speed. Every page loads fast, reads clearly and sends its leads straight into your CRM.",
    description:
      "High-conversion websites, customer portals and e-commerce storefronts, built for speed and scale and wired into your CRM.",
    highlights: [
      {
        title: "Fast on every device",
        text: "Lean pages that load quickly on a phone signal, because a slow site loses customers before they see anything.",
      },
      {
        title: "Built to convert",
        text: "Clear journeys, strong calls to action and checkouts designed to remove every reason to leave.",
      },
      {
        title: "Yours to own",
        text: "Your domain, your code and your customer data stay in your name. Nothing is locked to us.",
      },
    ],
    included: [
      {
        Icon: LayoutTemplate,
        title: "Marketing websites",
        text: "Brand sites and landing pages that explain what you do in seconds and make the next step obvious.",
      },
      {
        Icon: ShoppingBag,
        title: "E-commerce storefronts",
        text: "Catalogues, carts, checkout and payments, shaped around how your customers actually buy.",
      },
      {
        Icon: UserRound,
        title: "Customer portals",
        text: "Secure logins where customers track orders, download documents, book services or manage their account.",
      },
      {
        Icon: PenLine,
        title: "Content you can edit",
        text: "Update pages, products and images yourself, without calling a developer for every small change.",
      },
      {
        Icon: Search,
        title: "SEO foundations",
        text: "Clean structure, fast loading and proper metadata from day one, so search engines can find and rank you.",
      },
      {
        Icon: ChartLine,
        title: "Tracking & lead capture",
        text: "Forms, events and conversion tracking wired in, with every enquiry landing in your CRM.",
      },
    ],
    shift: [
      {
        before: "A slow, dated site that undersells the business",
        after: "A fast, modern site that earns trust in seconds",
      },
      {
        before: "Enquiries lost in an inbox or a spreadsheet",
        after: "Every lead captured and routed into your CRM",
      },
      {
        before: "Waiting on a developer for every small change",
        after: "Pages and products you edit yourself, in minutes",
      },
      {
        before: "No idea which pages bring in customers",
        after: "Clear tracking from first visit to sale",
      },
    ],
    steps: [
      { title: "Discover", text: "We learn your customers, offer and goals, and map the pages and journeys that matter most." },
      { title: "Design", text: "Wireframes, then full designs in your brand, reviewed with you before a line of code is written." },
      { title: "Build", text: "We develop the site, connect your tools and load your content, with a live preview to review as we go." },
      { title: "Launch & grow", text: "Testing on real devices, a smooth launch, then improvements based on how visitors actually behave." },
    ],
    faqs: [
      {
        q: "Can you redesign our existing website?",
        a: "Yes. We review what you have, keep what works and rebuild the rest. Your content, URLs and search rankings are carried over carefully, so you don't lose the ground you've already gained.",
      },
      {
        q: "Which platform will you build on?",
        a: "Whatever fits the job. For most businesses that's a fast, custom site you fully own; for some stores it's an established e-commerce platform. We recommend one in the proposal and explain why.",
      },
      {
        q: "Will we be able to update it ourselves?",
        a: "Yes. We set up a simple editor for pages, products and posts, and walk your team through it at handover.",
      },
      {
        q: "Do you handle hosting and domains?",
        a: "We can set everything up in your name and look after it for you, or work with the hosting you already have. Either way, you keep ownership.",
      },
    ],
    cta: ["Ready for a website that", "sells?"],
  },

  crm: {
    num: "02",
    verb: "Run",
    Icon: Database,
    headline: ["A CRM shaped around how your team", "actually works."],
    lead: "Pipelines, contact tracking, quotes, automated follow-ups and live reporting in one system your team will want to use. Built around your process, not the other way round.",
    description:
      "Custom CRM and business systems: deal pipelines, contact tracking, quotes, automated follow-ups and live reporting, built around your process.",
    highlights: [
      {
        title: "One source of truth",
        text: "Every customer, conversation and deal in one place, instead of scattered across inboxes and spreadsheets.",
      },
      {
        title: "Follow-ups that never slip",
        text: "Reminders and automated messages make sure no lead goes cold because someone forgot.",
      },
      {
        title: "Numbers you can trust",
        text: "Live dashboards show pipeline, revenue and team activity without anyone building a report.",
      },
    ],
    included: [
      {
        Icon: SquareKanban,
        title: "Deal pipelines",
        text: "Stages that match your sales process, with drag-and-drop deals and a clear view of what happens next.",
      },
      {
        Icon: Contact,
        title: "Contacts & accounts",
        text: "The full history of every customer: calls, emails, notes, documents and past purchases.",
      },
      {
        Icon: FileSignature,
        title: "Quotes & proposals",
        text: "Branded quotes generated from the CRM in a few clicks, so you can see when they're opened and signed.",
      },
      {
        Icon: BellRing,
        title: "Automated follow-ups",
        text: "Emails, WhatsApp messages and tasks triggered by what your customers do, not by someone's memory.",
      },
      {
        Icon: Gauge,
        title: "Live reporting",
        text: "Dashboards for pipeline value, conversion rates, team performance and revenue, always up to date.",
      },
      {
        Icon: Users,
        title: "Roles & permissions",
        text: "Sales, operations and management each see what they need, and nothing they shouldn't.",
      },
    ],
    shift: [
      {
        before: "Leads scattered across WhatsApp, email and spreadsheets",
        after: "Every lead in one pipeline, with its full history",
      },
      {
        before: "Follow-ups that depend on someone remembering",
        after: "Reminders and messages sent at the right moment",
      },
      {
        before: "Quotes put together by hand in Word or Excel",
        after: "Branded quotes generated in a few clicks",
      },
      {
        before: "Reports pieced together at the end of the month",
        after: "Live dashboards you can check any time",
      },
    ],
    steps: [
      { title: "Map your process", text: "We sit with your team to understand how leads come in, move through and close today." },
      { title: "Design the system", text: "Stages, fields, automations and dashboards designed around that process and signed off by you." },
      { title: "Build & migrate", text: "We build the CRM, connect your website, ads and tools, and move your existing data across." },
      { title: "Train & refine", text: "Hands-on training for your team, then adjustments as real use shows what could be smoother." },
    ],
    faqs: [
      {
        q: "Why a custom CRM instead of an off-the-shelf one?",
        a: "Off-the-shelf tools make you bend your process to fit them, and usually charge more per seat as you grow. A custom CRM fits the way you work, has only what your team needs, and you own it outright.",
      },
      {
        q: "Can you move our existing data across?",
        a: "Yes. We migrate contacts, deals and history from spreadsheets or your current CRM, and check it with you before going live.",
      },
      {
        q: "Will our team actually use it?",
        a: "That's the point of building around how they already work. We keep the screens simple, train everyone at handover and refine things based on their feedback.",
      },
      {
        q: "Does it work on phones?",
        a: "Yes. Your team can check deals, log calls and update records from their phones, wherever they are.",
      },
    ],
    cta: ["Ready for a CRM your team", "will use?"],
  },

  automation: {
    num: "03",
    verb: "Connect",
    Icon: Workflow,
    headline: ["Your tools and data, joined into", "one system."],
    lead: "Workflows that end manual handoffs, with your tools, databases and APIs connected so information moves on its own. No rip-and-replace: we build around what already works.",
    description:
      "Workflow automation, API integrations and custom software that connect your existing tools into one system, without a rip-and-replace.",
    highlights: [
      {
        title: "No more copy-paste",
        text: "Details entered once flow everywhere they're needed, so your team stops re-typing the same information.",
      },
      {
        title: "Fewer mistakes",
        text: "Automated steps don't forget, mistype or go on leave, and they run the same way every time.",
      },
      {
        title: "Keep what works",
        text: "We connect the tools you already rely on instead of forcing you to replace them.",
      },
    ],
    included: [
      {
        Icon: Workflow,
        title: "Workflow automation",
        text: "Approvals, notifications, assignments and handoffs that run themselves the moment something happens.",
      },
      {
        Icon: Cable,
        title: "API integrations",
        text: "Your website, CRM, payments, accounting and messaging tools talking to each other directly.",
      },
      {
        Icon: CodeXml,
        title: "Custom software",
        text: "Internal tools built for the jobs no off-the-shelf product handles well.",
      },
      {
        Icon: RefreshCw,
        title: "Data sync",
        text: "One clean, consistent record of customers and orders across every system you use.",
      },
      {
        Icon: FileText,
        title: "Documents & reports",
        text: "Invoices, contracts and reports generated automatically from the data you already have.",
      },
      {
        Icon: Activity,
        title: "Monitoring & alerts",
        text: "If a connection fails, we know straight away and the right person is told before it becomes a problem.",
      },
    ],
    shift: [
      {
        before: "Staff copying data between systems by hand",
        after: "Information flowing between your tools on its own",
      },
      {
        before: "Spreadsheets as the glue between departments",
        after: "One connected system everyone works from",
      },
      {
        before: "Work stalled while it waits for a handoff",
        after: "Instant handoffs, approvals and notifications",
      },
      {
        before: "Errors discovered weeks after they happen",
        after: "Checks and alerts the moment something is off",
      },
    ],
    steps: [
      { title: "Audit", text: "We map your tools, your data and the manual steps that eat into your team's week." },
      { title: "Prioritise", text: "We start with the automations that save the most time, and agree a fixed scope for them." },
      { title: "Build & connect", text: "Integrations and workflows built and tested against your real data, without disrupting daily work." },
      { title: "Monitor & extend", text: "We watch everything once it's live, and add new automations as the business grows." },
    ],
    faqs: [
      {
        q: "Do we have to replace our current software?",
        a: "No. The default is to connect what you already use. If something is genuinely holding you back we'll tell you why and suggest an alternative, but the choice stays yours.",
      },
      {
        q: "What can actually be automated?",
        a: "Almost any repetitive, rule-based task: data entry, notifications, approvals, invoicing, reporting and moving information between tools. On the discovery call we'll point out the biggest wins.",
      },
      {
        q: "What if one of our tools has no API?",
        a: "There's usually still a way in, through exports, webhooks, email parsing or a small custom bridge. We'll find the most reliable option, and tell you plainly if there isn't one.",
      },
    ],
    cta: ["Ready to stop doing it", "by hand?"],
  },

  growth: {
    num: "04",
    verb: "Grow",
    Icon: TrendingUp,
    headline: ["Ads and SEO measured in", "revenue, not clicks."],
    lead: "Meta and Google campaigns and top-tier SEO, wired into your CRM so you can see exactly which campaigns bring in paying customers, and put your budget behind them.",
    description:
      "Meta Ads, Google Ads and SEO wired into your CRM, with ROI tracking that measures campaigns in revenue, not clicks.",
    highlights: [
      {
        title: "Tracked to the sale",
        text: "Campaigns connected to your CRM, so you see which ads bring in paying customers, not just clicks.",
      },
      {
        title: "Spend that earns its place",
        text: "Budget moves toward what's working and away from what isn't, week after week.",
      },
      {
        title: "Your accounts, your data",
        text: "Ad accounts and data stay in your name. We work inside them with your permission.",
      },
    ],
    included: [
      {
        Icon: Megaphone,
        title: "Meta Ads",
        text: "Facebook and Instagram campaigns, with creative, audiences and offers tested against each other.",
      },
      {
        Icon: Target,
        title: "Google Ads",
        text: "Search, Shopping and YouTube campaigns that reach people already looking for what you sell.",
      },
      {
        Icon: Search,
        title: "SEO",
        text: "Technical fixes, content and local search work that build steady traffic you don't pay for per click.",
      },
      {
        Icon: PanelsTopLeft,
        title: "Landing pages",
        text: "Pages built for one campaign and one action, so paid traffic never lands on a generic homepage.",
      },
      {
        Icon: ChartLine,
        title: "ROI tracking",
        text: "Pixels, conversion events and CRM data joined up, so every sale is credited to the right campaign.",
      },
      {
        Icon: FileText,
        title: "Monthly reporting",
        text: "Spend, leads, sales and what we're changing next, explained in plain language.",
      },
    ],
    shift: [
      {
        before: "Boosting posts and hoping for the best",
        after: "Structured campaigns with clear goals and budgets",
      },
      {
        before: "Reports full of clicks and impressions",
        after: "Reports on leads, sales and return on spend",
      },
      {
        before: "No idea which ads bring in customers",
        after: "Every sale traced back to its campaign",
      },
      {
        before: "Invisible when people search for you",
        after: "Steady organic traffic from search",
      },
    ],
    steps: [
      { title: "Audit", text: "We review your ad accounts, tracking, website and competitors to find the quickest wins." },
      { title: "Set up tracking", text: "Pixels, conversions and CRM connections in place, so every result is measured from day one." },
      { title: "Launch & test", text: "Campaigns go live with several angles tested side by side, and the data decides what scales." },
      { title: "Optimise & report", text: "Budgets, creative and keywords tuned continuously, with a clear report every month." },
    ],
    faqs: [
      {
        q: "How much should we spend on ads?",
        a: "It depends on your market and goals. We recommend a starting budget in the proposal and only scale it once the numbers justify it. Our fee is a flat monthly amount, separate from your ad spend.",
      },
      {
        q: "How soon will we see results?",
        a: "Paid campaigns start producing data within days and improve as we learn what works. SEO is slower and builds over months. We'll set honest expectations for both before we start.",
      },
      {
        q: "Do we keep our ad accounts?",
        a: "Always. Ad accounts, pixels and data stay in your name, and if you ever move on, everything stays with you.",
      },
    ],
    cta: ["Ready for ads that", "pay for themselves?"],
  },

  "cto-support": {
    num: "05",
    verb: "Support",
    Icon: Cpu,
    headline: ["Technical leadership,", "long after launch."],
    lead: "Monitoring, infrastructure and senior technical guidance for everything we ship, so your systems stay fast, secure and ready for what's next, without hiring a full-time CTO.",
    description:
      "Managed tech and CTO support: monitoring, infrastructure, security and technical leadership for everything we ship.",
    highlights: [
      {
        title: "Always watched",
        text: "Uptime, speed and errors monitored, so issues are caught early, before they reach your customers.",
      },
      {
        title: "Secure by default",
        text: "Updates, patches and backups handled on a schedule, not after something breaks.",
      },
      {
        title: "A CTO on call",
        text: "Senior advice on architecture, vendors, hiring and roadmap whenever a big decision comes up.",
      },
    ],
    included: [
      {
        Icon: Activity,
        title: "Monitoring & uptime",
        text: "Constant checks on your website, CRM and integrations, with alerts the moment something is off.",
      },
      {
        Icon: Server,
        title: "Hosting & infrastructure",
        text: "Cloud servers, databases and compute provisioned, scaled and kept tidy as you grow.",
      },
      {
        Icon: ShieldCheck,
        title: "Security & backups",
        text: "Regular updates, security patches and backups you can actually restore from.",
      },
      {
        Icon: Wrench,
        title: "Fixes & improvements",
        text: "Ongoing fixes, tweaks and small new features, handled by the team that built it.",
      },
      {
        Icon: Compass,
        title: "Technical leadership",
        text: "Architecture decisions, roadmaps and reviews from people who know your systems inside out.",
      },
      {
        Icon: LifeBuoy,
        title: "Vendor & team guidance",
        text: "Help choosing tools and vendors, and support for hiring or guiding your own developers.",
      },
    ],
    shift: [
      {
        before: "Nobody watching the site until a customer complains",
        after: "Issues caught and fixed early",
      },
      {
        before: "Outdated software and patchy backups",
        after: "Regular updates and tested backups",
      },
      {
        before: "Big technical decisions made on gut feel",
        after: "Senior guidance before you commit",
      },
      {
        before: "A full-time CTO you can't yet justify",
        after: "Leadership sized to where you are today",
      },
    ],
    steps: [
      { title: "Review", text: "We audit your current setup: hosting, security, code health and the risks that matter most." },
      { title: "Stabilise", text: "Monitoring, backups and updates put in place, with anything urgent fixed first." },
      { title: "Run", text: "Day-to-day care of your systems, with a direct line to the team when you need something." },
      { title: "Plan ahead", text: "Regular check-ins on performance, costs and roadmap, so you're ready for what's next." },
    ],
    faqs: [
      {
        q: "Can you support systems you didn't build?",
        a: "Usually, yes. We start with a review of the code and infrastructure, tell you honestly what we find, and take it on once it's in good shape.",
      },
      {
        q: "How is it priced?",
        a: "As a flat monthly fee, agreed up front based on what we look after. No hourly meter and no surprise invoices.",
      },
      {
        q: "Does this replace an in-house team?",
        a: "It can, especially early on. As you grow we can work alongside your own developers, or help you hire and onboard them.",
      },
    ],
    cta: ["Ready for tech you never", "have to worry about?"],
  },
};
