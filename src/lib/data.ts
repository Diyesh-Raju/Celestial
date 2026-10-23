// TODO: replace the placeholder hours and social links with real ones.
export const CONTACT = {
  email: "team@celestialdevelopers.com",
  phones: ["+91 8310818878", "+91 8618429404", "+91 6360416204"], // all on calls and WhatsApp
  whatsapp: "918310818878", // primary WhatsApp: country code + number, digits only
  replyTime: "We reply within one working day",
  walkthrough: "https://cal.id/celestial/product-walkthrough?duration=15", // book a product walkthrough call with the team
  location: ["Celestial Developers", "India · Working with clients everywhere"],
  hours: [
    { days: "Monday – Friday", time: "10:00 am – 7:00 pm" },
    { days: "Saturday", time: "10:00 am – 4:00 pm" },
    { days: "Sunday", time: "Closed" },
  ],
  socials: {
    instagram: "#",
    linkedin: "#",
    x: "#",
  },
};

// Team inbox shown in the FAQ section
export const TEAM_EMAIL = CONTACT.email;

// FAQ: `topic` labels the message in the iPad inbox, `q` / `a` are the question and reply.
export const faqs = [
  {
    topic: "Timeline",
    q: "How long does a project take?",
    a: "It depends on what we're building, so we don't guess before we've talked. After the discovery call you get a fixed scope with a timeline attached, and you see working software along the way. A focused website moves in weeks; a CRM with automations takes longer.",
  },
  {
    topic: "Pricing",
    q: "How do you price your work?",
    a: "By scope, agreed before any work starts. We map what you need, put a fixed price on it, and that's the number. No hourly meter and no surprise invoices halfway through. Ongoing work like ads or CTO support is a flat monthly fee.",
  },
  {
    topic: "Scope",
    q: "Do I have to buy the website, CRM and ads together?",
    a: "No. Plenty of clients start with one piece, usually a website or a CRM. We build it to connect to the rest, so when you add ads or automation later they plug into the same system instead of becoming another island.",
  },
  {
    topic: "Your tools",
    q: "Can you work with the tools we already use?",
    a: "Yes. We connect your existing tools, databases and APIs instead of forcing a rip-and-replace. If something is genuinely holding you back we'll tell you why, but the default is to build around what already works.",
  },
  {
    topic: "Ownership",
    q: "Who owns the code, data and ad accounts?",
    a: "You do. Your domain, code, customer data and ad accounts stay in your name. We work inside them with your permission, and if you ever move on, everything stays exactly where it is: with you.",
  },
  {
    topic: "After launch",
    q: "What happens after launch?",
    a: "We test, migrate your data, launch and hand over to your team. Then we keep going if you want us to: monitoring, fixes, optimization, growth campaigns and technical leadership as you scale.",
  },
];

// Root-relative so they work from /contact as well as the home page.
export const navLinks = [
  { href: "/#top", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#reviews", label: "Testimonials" },
  { href: "/portfolio", label: "Selected Work" },
];

export const enquiryTopics = [
  "Website / E-commerce",
  "CRM & business systems",
  "Meta & Google Ads",
  "Automation / custom software",
  "API & data integration",
  "Managed tech / CTO support",
  "Something else",
];

export const services = [
  {
    num: "01",
    short: "Web & E-Commerce",
    title: "Website Development & E-Commerce",
    desc: "High-conversion, minimalist web platforms, customer portals, and tailored e-commerce builds built for speed and scale.",
    icon: "web",
    tags: ["Web platforms", "Customer portals", "E-commerce", "Built for speed"],
  },
  {
    num: "02",
    short: "CRM Systems",
    title: "CRM & Business Systems",
    desc: "Custom account management, deal pipelines, contact tracking, quotes, automated follow-ups, and live reporting.",
    icon: "crm",
    tags: ["Deal pipelines", "Contact tracking", "Quotes", "Live reporting"],
  },
  {
    num: "03",
    short: "Automation",
    title: "Automation & Custom Software",
    desc: "Purpose-built workflows that eliminate manual friction, spreadsheets, and repetitive handoffs.",
    icon: "automation",
    tags: ["Workflows", "Custom software", "No more spreadsheets", "Zero handoffs"],
  },
  {
    num: "04",
    short: "Ads Growth",
    title: "Meta & Google Ads Growth",
    desc: "Data-backed digital growth strategies, targeted advertising campaigns, SEO optimization, and ROI tracking.",
    icon: "ads",
    tags: ["Meta Ads", "Google Ads", "SEO", "ROI tracking"],
  },
  {
    num: "05",
    short: "API & Data",
    title: "API & Data Systems Integration",
    desc: "Connecting existing tools, databases, and APIs into one unified operational architecture without forced rip-and-replace.",
    icon: "api",
    tags: ["API integration", "Databases", "Unified architecture", "No rip-and-replace"],
  },
  {
    num: "06",
    short: "CTO Support",
    title: "Managed Tech & CTO Support",
    desc: "Ongoing support, monitoring, technical leadership, and compute infrastructure provisioning.",
    icon: "cto",
    tags: ["Monitoring", "Technical leadership", "Infrastructure", "Ongoing support"],
  },
] as const;

// `bg` / `ink`: the slide colour and the giant background name in the Work slider
export const portfolio = [
  {
    name: "Obsidian Blade",
    url: "https://obsidian-blade.vercel.app/",
    image: "/work/obsidian.jpg",
    tag: "Custom Web App",
    bg: "#ddd4ca",
    ink: "#561226",
  },
  {
    name: "Nocturne Food & Beverage",
    url: "https://nocturnefoodbeverage.vercel.app/",
    image: "/work/nocturne.jpg",
    tag: "E-Commerce / Hospitality",
    bg: "#561226",
    ink: "#e8e0d8",
  },
  {
    name: "Sage Thread Boutique",
    url: "https://sage-thread-botique-website.vercel.app/",
    image: "/work/sage.jpg",
    tag: "Retail / Fashion",
    bg: "#a8968a",
    ink: "#2f2b29",
  },
  {
    name: "Vijaya Enterprises",
    url: "https://vijaya.in",
    image: "/work/vijaya.jpg",
    tag: "Real Estate Enterprise Group",
    bg: "#2a2829",
    ink: "#c4798b",
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Discover",
    text: "Identify workflows, bottlenecks, current systems, and key objectives.",
    tags: ["Workflow audit", "Bottleneck map", "Key objectives"],
  },
  {
    step: "02",
    title: "Design",
    text: "Architect requirements, minimalist interfaces, and seamless integration layers.",
    tags: ["Requirements", "Interface design", "Integration plan"],
  },
  {
    step: "03",
    title: "Build",
    text: "Iterative releases with visible progress and rapid feedback loops.",
    tags: ["Iterative releases", "Live previews", "Feedback loops"],
  },
  {
    step: "04",
    title: "Deploy",
    text: "Testing, system migration, smooth launch, and full team handoff.",
    tags: ["Testing", "Data migration", "Team handoff"],
  },
  {
    step: "05",
    title: "Scale",
    text: "Continuous expansion, growth marketing, optimization, and automation.",
    tags: ["Growth marketing", "Optimization", "Automation"],
  },
];

// "The Celestial Method" marquee: the top row scrolls left, the bottom row right.
export const marqueeRows = [
  [
    "Strategy before code",
    "No templates, ever",
    "Pixel-perfect craft",
    "Built for speed",
    "One connected system",
    "Clear fixed scope",
    "Weekly progress updates",
  ],
  [
    "Conversion-first design",
    "Data-driven ads",
    "Automation built in",
    "Live reporting",
    "Smooth launch & handoff",
    "Ongoing CTO support",
    "Scale without chaos",
  ],
];

// The notebook under the hero: one spread of handwritten notes per promise.
// `title` labels the button. On the pages, `heading` (one entry per written line)
// and `body` fill the left side, `ticks` and `note` the right, with the [bracketed]
// words in `note` circled or underlined in red ink. Phones show the same pages
// smaller, so keep heading lines and ticks to about 13 characters.
export const promises = [
  {
    title: "Fixed scope, fixed price",
    heading: ["Fixed scope,", "fixed price."],
    body: "We map the whole job before any work starts, then put one number on it.",
    ticks: ["scope mapped", "one price", "dates agreed"],
    note: "No [hourly meter.]",
    mark: "circle",
  },
  {
    title: "Progress you can see",
    heading: ["Progress", "you can see."],
    body: "Working software from the first weeks, not one big reveal at the end.",
    ticks: ["weekly demos", "live previews", "fast feedback"],
    note: "[No surprises.]",
    mark: "underline",
  },
  {
    title: "You own everything",
    heading: ["You own", "everything."],
    body: "Your domain, code, customer data and ad accounts stay in your name.",
    ticks: ["your code", "your data", "your ads"],
    note: "Always [yours.]",
    mark: "circle",
  },
  {
    title: "We stay after launch",
    heading: ["We stay", "after launch."],
    body: "Monitoring, fixes and growth work, with CTO-level support as you scale.",
    ticks: ["monitoring", "fixes", "CTO support"],
    note: "Here for the [long run.]",
    mark: "underline",
  },
] as const;
