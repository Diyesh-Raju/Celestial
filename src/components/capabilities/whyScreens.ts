import { LOGO_PATH } from "@/lib/logo";
import { BAR, paintDevice, Painter, PCW, phoneFrame, phoneHeader, PHONE_W, PM, SCREEN_H } from "./paint";
import { deviceFor, whyUsPalettes } from "./theme";

// The why-us displays: 01 and 03 on the laptop, 02 and 04 on the phone.

/** A four-pointed sparkle, the agent's mark. */
function sparkle(p: Painter, cx: number, cy: number, r: number, color: string) {
  const c = p.ctx;
  c.beginPath();
  c.moveTo(cx, cy - r);
  c.quadraticCurveTo(cx, cy, cx + r, cy);
  c.quadraticCurveTo(cx, cy, cx, cy + r);
  c.quadraticCurveTo(cx, cy, cx - r, cy);
  c.quadraticCurveTo(cx, cy, cx, cy - r);
  c.fillStyle = color;
  c.fill();
}

/* ── 01 Under one roof: every channel in one hub ─────────────────── */
function roof(p: Painter) {
  const { ui, ctx: c } = p;
  p.chrome("yourbrand · growth hub");

  // Sidebar: one place for every service
  const SW = 250;
  c.fillStyle = ui.panel;
  c.fillRect(0, BAR, SW, SCREEN_H - BAR);
  c.fillStyle = ui.line;
  c.fillRect(SW, BAR, 1, SCREEN_H - BAR);
  p.fill(28, 80, 42, 42, 12, ui.accent);
  p.text("y", 49, 108, 24, ui.bg, 700, "center");
  p.text("yourbrand", 84, 99, 19, ui.text, 700);
  p.text("Growth hub", 84, 119, 13, ui.muted, 500);
  ["Overview", "Website", "CRM", "Meta Ads", "Security", "Bespoke tools"].forEach((label, i) => {
    const y = 156 + i * 54;
    const on = i === 0;
    if (on) p.fill(16, y, SW - 32, 44, 12, ui.soft);
    p.fill(32, y + 13, 18, 18, 5, on ? ui.accent : ui.panel2);
    p.text(label, 64, y + 28, 16, on ? ui.accent : ui.text, on ? 600 : 500);
    if (!on) p.dot(SW - 38, y + 22, 5, ui.good);
  });
  p.fill(16, 612, SW - 32, 168, 16, ui.panel2);
  p.text("Your team", 34, 646, 15, ui.text, 600);
  ["S", "D", "E", "A", "C"].forEach((l, i) => {
    const x = 52 + i * 32;
    p.dot(x, 690, 21, ui.panel2);
    p.dot(x, 690, 18, i % 2 ? ui.accent2 : ui.accent);
    p.text(l, x, 696, 15, ui.bg, 700, "center");
  });
  p.text("Strategy, design, engineering,", 34, 738, 13, ui.muted, 400);
  p.text("ads and security. One brief.", 34, 758, 13, ui.muted, 400);

  // Header
  const X = 282;
  const MW = 1248 - X;
  p.text("Everything, under one roof", X, 110, 28, ui.text, 700);
  p.text("Website, CRM, ads and security, run by one team as one system", X, 138, 15, ui.muted, 400);
  const lw = p.pillWidth("All systems live", 14);
  p.pill(X + MW - lw, 88, "All systems live", ui.good, ui.panel2, 14);
  p.dot(X + MW - lw - 14, 103, 6, ui.good);

  // One number from each service
  const kw = (MW - 3 * 16) / 4;
  [
    ["Website", "48.2k", "visitors this month", "+12%"],
    ["CRM", "1,284", "new leads", "+62%"],
    ["Meta Ads", "4.8×", "return on ad spend", "+1.6×"],
    ["Security", "312", "threats blocked", "0 breaches"],
  ].forEach(([mod, value, label, delta], i) => {
    const x = X + i * (kw + 16);
    const y = 166;
    p.card(x, y, kw, 128, 18);
    p.pill(x + 18, y + 18, mod, ui.accent, ui.soft, 12);
    p.text(delta, x + kw - 18, y + 37, 13, ui.good, 600, "right");
    p.text(value, x + 18, y + 88, 36, ui.text, 700);
    p.text(label, x + 18, y + 112, 13, ui.muted, 500);
  });

  // The system: ads → site → CRM → custom tools, all inside one security perimeter
  const CY = 314;
  const CH = 486;
  const LW = 580;
  p.card(X, CY, LW, CH, 20);
  p.text("One connected system", X + 24, CY + 40, 18, ui.text, 600);
  p.text("Every lead followed from the ad to the closed deal", X + 24, CY + 64, 13, ui.muted, 400);
  const PX = X + 24;
  const PY = CY + 104;
  const PWd = LW - 48;
  c.save();
  c.setLineDash([8, 8]);
  p.stroke(PX, PY, PWd, 206, 18, ui.good, 2);
  c.restore();
  const shield = "Protected 24/7 · cybersecurity";
  p.fill(PX + 14, PY - 15, p.pillWidth(shield, 12) + 8, 30, 15, ui.panel);
  p.pill(PX + 18, PY - 13, shield, ui.good, ui.panel2, 12);
  const nodes: [string, string][] = [
    ["Meta Ads", "brings leads"],
    ["Website", "converts"],
    ["CRM", "follows up"],
    ["Bespoke", "automates"],
  ];
  const gapN = 30;
  const nw = (PWd - 40 - gapN * 3) / 4;
  nodes.forEach(([name, sub], i) => {
    const nx = PX + 20 + i * (nw + gapN);
    const ny = PY + 40;
    if (i > 0) {
      c.fillStyle = ui.accent;
      c.fillRect(nx - gapN, ny + 63, gapN - 8, 2);
      p.dot(nx - 6, ny + 64, 4, ui.accent);
    }
    p.fill(nx, ny, nw, 128, 16, ui.panel2);
    p.fill(nx + nw / 2 - 20, ny + 18, 40, 40, 12, i === 0 ? ui.accent : ui.soft);
    p.text(String(i + 1), nx + nw / 2, ny + 45, 17, i === 0 ? ui.bg : ui.accent, 700, "center");
    p.text(name, nx + nw / 2, ny + 88, 15, ui.text, 600, "center");
    p.text(sub, nx + nw / 2, ny + 110, 12, ui.muted, 500, "center");
  });
  // Revenue those leads became
  const RY = PY + 236;
  p.text("Revenue influenced", X + 24, RY + 34, 13, ui.muted, 500);
  p.text("$184k", X + 24, RY + 76, 34, ui.text, 700);
  p.text("+34% this quarter", X + 24, RY + 100, 13, ui.good, 600);
  const gx = X + 210;
  const gw = LW - 234;
  const pts = [0.2, 0.28, 0.24, 0.4, 0.38, 0.52, 0.6, 0.57, 0.74, 0.86].map((v, i, a): [number, number] => [
    gx + (gw * i) / (a.length - 1),
    RY + 116 - v * 96,
  ]);
  const end = p.curve(pts);
  c.lineTo(end[0], RY + 120);
  c.lineTo(gx, RY + 120);
  c.closePath();
  c.fillStyle = p.gradient(0, RY, 0, RY + 120, [
    [0, ui.soft],
    [1, "rgba(0,0,0,0)"],
  ]);
  c.fill();
  c.lineWidth = 3;
  c.lineCap = "round";
  c.strokeStyle = ui.accent;
  p.curve(pts);
  c.stroke();
  p.dot(end[0], end[1], 6, ui.accent);

  // What the one team did this week, across every channel
  const AX = X + LW + 16;
  const AW = 1248 - AX;
  p.card(AX, CY, AW, CH, 20);
  p.text("This week", AX + 24, CY + 40, 18, ui.text, 600);
  p.text("One team, every channel", AX + 24, CY + 64, 13, ui.muted, 400);
  [
    ["Website", "Checkout redesign shipped", "Mon"],
    ["CRM", "Leads now auto-assigned", "Tue"],
    ["Meta Ads", "Budget moved to retargeting", "Wed"],
    ["Security", "Firewall rules tightened", "Thu"],
    ["Bespoke tools", "Stock tool v2 released", "Fri"],
  ].forEach(([mod, text, day], i) => {
    const y = CY + 92 + i * 76;
    p.fill(AX + 16, y, AW - 32, 64, 14, ui.panel2);
    p.fill(AX + 16, y + 14, 4, 36, 2, i === 3 ? ui.good : i % 2 ? ui.accent2 : ui.accent);
    p.text(text, AX + 36, y + 28, 15, ui.text, 600);
    p.text(mod, AX + 36, y + 49, 12, ui.muted, 500);
    p.text(day, AX + AW - 32, y + 28, 12, ui.muted, 500, "right");
  });
}

/* ── 02 Built around your business: an app shaped to one team ────── */
function custom(p: Painter) {
  const { ui, ctx: c } = p;
  phoneFrame(p, ["Today", "Jobs", "Quotes", "Team"]);
  phoneHeader(p, "Built for your team", "Today");

  let x = PM;
  x += p.pill(x, 252, "Your workflow", ui.accent, ui.soft, 22) + 12;
  x += p.pill(x, 252, "Custom built", ui.text, ui.panel2, 22) + 12;
  p.pill(x, 252, "v3.2", ui.muted, ui.panel2, 22);

  // Their own process, stage by stage
  p.card(PM, 330, PCW, 240, 28);
  p.text("Your process", PM + 28, 380, 26, ui.text, 600);
  p.text("Mapped with your team", PM + 28, 414, 20, ui.muted, 400);
  const stages = ["Enquiry", "Visit", "Quote", "Build", "Handover"];
  const sx0 = PM + 62;
  const gap = (PCW - 124) / (stages.length - 1);
  const sy = 478;
  p.fill(sx0, sy - 3, gap * (stages.length - 1), 6, 3, ui.line);
  p.fill(sx0, sy - 3, gap * 3, 6, 3, ui.accent);
  stages.forEach((label, i) => {
    const cx = sx0 + i * gap;
    if (i < 3) {
      p.dot(cx, sy, 20, ui.accent);
      p.text("✓", cx, sy + 8, 20, ui.bg, 700, "center");
    } else if (i === 3) {
      p.dot(cx, sy, 24, ui.soft);
      p.dot(cx, sy, 12, ui.accent);
    } else {
      p.dot(cx, sy, 18, ui.panel2);
      c.beginPath();
      c.arc(cx, sy, 18, 0, Math.PI * 2);
      c.strokeStyle = ui.line;
      c.lineWidth = 2;
      c.stroke();
    }
    p.text(label, cx, sy + 60, 19, i <= 3 ? ui.text : ui.muted, 600, "center");
  });

  p.text("Jobs today", PM, 630, 28, ui.text, 600);
  p.text("3 due", PHONE_W - PM, 630, 22, ui.accent, 600, "right");
  [
    ["10:30", "AM", "Kapoor Residence", "Site visit with client", "Visit"],
    ["12:00", "PM", "Bloom Café", "Quote ready to send", "Quote"],
    ["3:15", "PM", "Harbour Office", "Install, day 2 of 3", "Build"],
  ].forEach(([time, half, name, sub, stage], i) => {
    const y = 656 + i * 148;
    p.card(PM, y, PCW, 132, 24);
    p.text(time, PM + 28, y + 64, 28, ui.text, 700);
    p.text(half, PM + 28, y + 96, 18, ui.muted, 600);
    c.fillStyle = ui.line;
    c.fillRect(PM + 132, y + 26, 2, 80);
    p.text(name, PM + 156, y + 60, 26, ui.text, 600);
    p.text(sub, PM + 156, y + 96, 20, ui.muted, 400);
    p.pill(PM + PCW - 24 - p.pillWidth(stage, 17), y + 22, stage, ui.accent, ui.soft, 17);
  });

  // Features that only exist because this business asked for them
  p.card(PM, 1110, PCW, 302, 28);
  p.text("Built to order", PM + 28, 1158, 26, ui.text, 600);
  [
    ["Quote builder", "Uses your pricing rules"],
    ["Stock alerts", "From your own suppliers"],
    ["WhatsApp updates", "Sent to your customers"],
  ].forEach(([title, sub], i) => {
    const y = 1186 + i * 72;
    p.fill(PM + 28, y + 6, 48, 48, 14, ui.soft);
    p.text("✓", PM + 52, y + 38, 20, ui.accent, 700, "center");
    p.text(title, PM + 96, y + 26, 23, ui.text, 600);
    p.text(sub, PM + 96, y + 54, 18, ui.muted, 400);
    const tx = PM + PCW - 28 - 64;
    p.fill(tx, y + 12, 64, 36, 18, ui.accent);
    p.dot(tx + 46, y + 30, 14, ui.bg);
  });
}

/* ── 03 Artists: a design canvas beside an AI agent at work ───────── */
function craft(p: Painter) {
  const { ui, ctx: c } = p;
  p.chrome("Celestial Studio · design + agent");

  const CW = 774;
  c.fillStyle = ui.line;
  for (let x = 24; x < CW; x += 28) for (let y = BAR + 20; y < SCREEN_H; y += 28) c.fillRect(x, y, 2, 2);

  // Tools
  p.card(24, 84, 54, 254, 16);
  for (let i = 0; i < 5; i++) p.fill(39, 100 + i * 46, 24, 24, 7, i === 0 ? ui.accent : ui.panel2);

  // Artboard: a checkout page mid-design
  const AX = 110;
  const AY = 108;
  const AW = 624;
  const AH = 498;
  p.text("Checkout · v4", AX, AY - 14, 14, ui.muted, 500);
  p.text("1440 × 900", AX + AW, AY - 14, 13, ui.muted, 500, "right");
  p.card(AX, AY, AW, AH, 8);
  p.text("yourbrand", AX + 32, AY + 46, 16, ui.text, 700);
  for (let i = 0; i < 3; i++) p.fill(AX + 330 + i * 70, AY + 37, 50, 10, 5, ui.panel2);
  p.fill(AX + AW - 96, AY + 28, 64, 28, 14, ui.panel2);
  p.text("Pay in one tap.", AX + 32, AY + 132, 44, ui.text, 700);
  p.fill(AX + 32, AY + 182, 300, 10, 5, ui.panel2);
  p.fill(AX + 32, AY + 202, 236, 10, 5, ui.panel2);
  // Redline: the spacing between headline and copy
  c.fillStyle = ui.accent;
  c.fillRect(AX + 348, AY + 144, 2, 34);
  c.fillRect(AX + 341, AY + 144, 16, 2);
  c.fillRect(AX + 341, AY + 176, 16, 2);
  p.pill(AX + 362, AY + 147, "24", ui.bg, ui.accent, 11);
  // Product + order summary
  p.fill(AX + 410, AY + 92, 182, 140, 14, p.gradient(AX + 410, AY + 92, AX + 592, AY + 232, [
    [0, ui.accent],
    [1, ui.accent2],
  ]));
  p.dot(AX + 501, AY + 162, 38, "rgba(255,255,255,0.25)");
  [
    ["Linen shirt", "$68"],
    ["Shipping", "Free"],
    ["Total", "$68"],
  ].forEach(([k, v], i) => {
    const y = AY + 276 + i * 40;
    p.text(k, AX + 32, y, 15, i === 2 ? ui.text : ui.muted, i === 2 ? 700 : 500);
    p.text(v, AX + AW - 32, y, 15, ui.text, i === 2 ? 700 : 600, "right");
    if (i < 2) {
      c.fillStyle = ui.line;
      c.fillRect(AX + 32, y + 15, AW - 64, 1);
    }
  });
  // The selected button, with handles and its size
  const BX = AX + 32;
  const BY = AY + 398;
  p.fill(BX, BY, 320, 56, 28, ui.accent);
  p.text("Pay now", BX + 160, BY + 35, 18, ui.bg, 600, "center");
  c.strokeStyle = ui.accent;
  c.lineWidth = 1.5;
  c.strokeRect(BX - 6, BY - 6, 332, 68);
  for (const [hx, hy] of [
    [BX - 6, BY - 6],
    [BX + 326, BY - 6],
    [BX - 6, BY + 62],
    [BX + 326, BY + 62],
  ]) {
    p.fill(hx - 5, hy - 5, 10, 10, 2, ui.panel);
    c.strokeRect(hx - 5, hy - 5, 10, 10);
  }
  const dim = "320 × 56";
  p.pill(BX + 160 - p.pillWidth(dim, 11) / 2, BY + 72, dim, ui.bg, ui.accent, 11);

  // Palette and type
  p.card(AX, 632, 304, 158, 16);
  p.text("Palette", AX + 24, 664, 14, ui.text, 600);
  [ui.accent, ui.accent2, ui.text, ui.panel2, ui.good].forEach((col, i) => {
    const cx = AX + 48 + i * 52;
    p.dot(cx, 714, 20, ui.line);
    p.dot(cx, 714, 18, col);
  });
  p.text("Brand · 5 tokens", AX + 24, 768, 12, ui.muted, 500);
  p.card(AX + 320, 632, 304, 158, 16);
  p.text("Aa", AX + 344, 746, 72, ui.text, 700);
  p.text("Inter Display", AX + 456, 696, 15, ui.text, 600);
  p.text("Semibold · 600", AX + 456, 720, 13, ui.muted, 500);
  p.text("Tracking −2%", AX + 456, 742, 13, ui.muted, 500);

  // The agent
  const GX = 798;
  const GY = 76;
  const GW = 1256 - GX;
  const GH = 732;
  p.card(GX, GY, GW, GH, 20);
  p.fill(GX + 24, GY + 24, 44, 44, 13, ui.accent);
  sparkle(p, GX + 46, GY + 46, 13, ui.bg);
  p.text("AI agent", GX + 82, GY + 44, 18, ui.text, 600);
  p.text("Finance assistant", GX + 82, GY + 64, 13, ui.muted, 500);
  const rw = p.pillWidth("Running", 13);
  p.pill(GX + GW - 24 - rw, GY + 32, "Running", ui.good, ui.panel2, 13);

  const ask = p.wrap("Reconcile this week’s invoices and chase anything overdue.", GW - 96, 16, 500);
  p.fill(GX + 24, GY + 96, GW - 48, 40 + ask.length * 24, 16, ui.panel2);
  ask.forEach((l, i) => p.text(l, GX + 48, GY + 126 + i * 24, 16, ui.text, 500));

  const steps: ["done" | "active" | "todo", string, string][] = [
    ["done", "Pulled 412 invoices", "From accounting · 4s"],
    ["done", "Matched 398 to payments", "Bank feed · 11s"],
    ["done", "Flagged 14 for a person", "Unusual amounts or dates"],
    ["active", "Drafting 9 reminders", "In your tone of voice"],
    ["todo", "Update CRM, notify finance", "Next"],
  ];
  const SY = GY + 218;
  c.fillStyle = ui.line;
  c.fillRect(GX + 43, SY + 20, 2, 4 * 72);
  steps.forEach(([state, title, sub], i) => {
    const y = SY + i * 72;
    const cx = GX + 44;
    const cy = y + 20;
    if (state === "done") {
      p.dot(cx, cy, 13, ui.good);
      p.text("✓", cx, cy + 5, 13, ui.bg, 700, "center");
    } else if (state === "active") {
      p.dot(cx, cy, 15, ui.soft);
      p.dot(cx, cy, 7, ui.accent);
    } else {
      p.dot(cx, cy, 12, ui.panel);
      c.beginPath();
      c.arc(cx, cy, 12, 0, Math.PI * 2);
      c.strokeStyle = ui.muted;
      c.lineWidth = 1.5;
      c.stroke();
    }
    p.text(title, GX + 74, y + 26, 16, state === "todo" ? ui.muted : ui.text, 600);
    p.text(sub, GX + 74, y + 47, 13, ui.muted, 500);
    if (state === "active") {
      p.fill(GX + GW - 140, y + 15, 100, 8, 4, ui.line);
      p.fill(GX + GW - 140, y + 15, 66, 8, 4, ui.accent);
    }
  });

  const RY = GY + GH - 150;
  p.fill(GX + 24, RY, GW - 48, 126, 16, ui.panel2);
  p.text("3 min", GX + 48, RY + 52, 34, ui.text, 700);
  p.text("with the agent", GX + 48, RY + 76, 13, ui.muted, 500);
  p.text("2 days", GX + 246, RY + 52, 34, ui.muted, 700);
  p.text("by hand", GX + 246, RY + 76, 13, ui.muted, 500);
  p.fill(GX + 48, RY + 96, 26, 8, 4, ui.good);
  p.fill(GX + 246, RY + 96, GW - 294, 8, 4, ui.line);
}

/* ── 04 A partner after launch: a direct line to the team ─────────── */
function partner(p: Painter) {
  const { ui, ctx: c } = p;
  phoneFrame(p, ["Chat", "Reports", "Requests", "Files"]);

  p.text("Your team", PM, 150, 24, ui.muted, 500);
  p.text("Celestial", PM - 2, 218, 64, ui.text, 700);
  const ax = PHONE_W - PM - 36;
  const ay = 184;
  p.dot(ax, ay, 36, ui.accent);
  c.save();
  c.translate(ax - 24, ay - 24);
  c.fillStyle = ui.bg;
  c.fill(new Path2D(LOGO_PATH));
  c.restore();
  p.dot(ax + 26, ay + 26, 11, ui.bg);
  p.dot(ax + 26, ay + 26, 7, ui.good);
  p.dot(PM + 8, 258, 7, ui.good);
  p.text("Online · replies in minutes", PM + 26, 265, 21, ui.muted, 500);
  c.fillStyle = ui.line;
  c.fillRect(0, 298, PHONE_W, 1);

  const today = "Today";
  p.pill(PHONE_W / 2 - p.pillWidth(today, 17) / 2, 322, today, ui.muted, ui.panel2, 17);

  let y = 386;
  const SIZE = 25;
  const LH = 35;
  const bubble = (side: "in" | "out", text: string) => {
    const padX = 26;
    const padY = 22;
    const lines = p.wrap(text, PCW * 0.78 - padX * 2, SIZE, 500);
    const w = p.measure(lines, SIZE, 500) + padX * 2;
    const h = padY * 2 + SIZE + (lines.length - 1) * LH;
    const x = side === "in" ? PM : PHONE_W - PM - w;
    if (side === "in") p.card(x, y, w, h, 26);
    else p.fill(x, y, w, h, 26, ui.accent);
    lines.forEach((l, i) => p.text(l, x + padX, y + padY + SIZE * 0.78 + i * LH, SIZE, side === "in" ? ui.text : ui.bg, 500));
    y += h + 22;
  };

  bubble("out", "How’s the new checkout doing?");
  bubble("in", "Loading in 0.9s now, down from 2.4s. Sales are up 11% since Monday.");

  // Weekly report, sent without being asked
  const RW = PCW * 0.84;
  p.card(PM, y, RW, 236, 26);
  p.text("Weekly report", PM + 26, y + 50, 25, ui.text, 600);
  p.text("Nov 10 – 16", PM + RW - 26, y + 50, 19, ui.muted, 500, "right");
  [
    ["Leads", "+18%", ui.good],
    ["Cost per lead", "−12%", ui.good],
    ["Uptime", "100%", ui.text],
  ].forEach(([k, v, col], i) => {
    const ry = y + 96 + i * 48;
    p.text(k, PM + 26, ry, 21, ui.muted, 500);
    p.text(v, PM + RW - 26, ry, 22, col, 700, "right");
    if (i < 2) {
      c.fillStyle = ui.line;
      c.fillRect(PM + 26, ry + 16, RW - 52, 1);
    }
  });
  y += 236 + 22;

  bubble("out", "Love it. Can we add a referral page next?");
  bubble("in", "On it. You’ll have a draft by Thursday.");

  const note = "Security patch applied overnight";
  p.pill(PHONE_W / 2 - p.pillWidth(note, 16) / 2, y + 4, note, ui.muted, ui.panel2, 16);
  y += 64;

  // Typing…
  p.card(PM, y, 112, 64, 26);
  for (let i = 0; i < 3; i++) p.dot(PM + 34 + i * 22, y + 32, 6.5, i === 0 ? ui.text : ui.muted);

  // Composer
  const CY = 1340;
  p.fill(PM, CY, PCW - 92, 70, 35, ui.panel2);
  p.text("Message your team", PM + 30, CY + 44, 22, ui.muted, 500);
  p.dot(PHONE_W - PM - 35, CY + 35, 35, ui.accent);
  c.strokeStyle = ui.bg;
  c.lineWidth = 4;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(PHONE_W - PM - 35, CY + 50);
  c.lineTo(PHONE_W - PM - 35, CY + 20);
  c.moveTo(PHONE_W - PM - 47, CY + 32);
  c.lineTo(PHONE_W - PM - 35, CY + 20);
  c.lineTo(PHONE_W - PM - 23, CY + 32);
  c.stroke();
}

const screens = [roof, custom, craft, partner];

/** Paints why-us step 1–4, sized for the device that step shows. */
export function paintWhyScreen(step: number, canvas?: HTMLCanvasElement) {
  return paintDevice(deviceFor(step), whyUsPalettes[step].dark, screens[step - 1], canvas);
}
