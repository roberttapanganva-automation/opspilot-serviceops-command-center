# ServiceOps Command Center — UI/UX Blueprint NEXTJS

## Purpose

This is the revised UI/UX blueprint for **OpsPilot / ServiceOps Command Center**.

It preserves the generated dashboard image direction and aligns the frontend implementation with:

```text
Next.js App Router + TypeScript + Tailwind CSS
```

---

# 1. Visual Direction

The dashboard should feel:

```text
Premium
Clean
Professional
Trustworthy
Action-first
Modern
Soft depth
Rounded
Readable
Client-friendly
```

The generated mockup direction remains the source of truth:

- Dark navy sidebar
- Light main workspace
- Rounded white cards
- Purple/blue accent actions
- Soft shadows
- KPI cards
- Pipeline chart
- Agenda timeline
- Recent activity feed
- AI assistant card
- Simple top search
- Workspace switcher
- Notification icons
- User avatar

---

# 2. Product Identity

Use:

```text
OpsPilot
```

Full product:

```text
ServiceOps Command Center
```

Core promise:

```text
Capture leads, track jobs, automate follow-ups, and see what needs attention today.
```

---

# 3. Color Tokens

Add these to `src/app/globals.css`.

```css
:root {
  --ops-sidebar: #071327;
  --ops-sidebar-soft: #0d1b33;
  --ops-sidebar-card: #13223d;

  --ops-main-bg: #f6f8fc;
  --ops-card: #ffffff;
  --ops-card-soft: #f8fafc;

  --ops-border: #e5e9f2;
  --ops-border-strong: #d8deea;

  --ops-text: #0f172a;
  --ops-text-soft: #475569;
  --ops-text-muted: #94a3b8;
  --ops-white: #ffffff;

  --ops-primary: #6d5dfc;
  --ops-primary-dark: #4f46e5;
  --ops-primary-soft: #ede9fe;
  --ops-primary-glow: rgba(109, 93, 252, 0.24);

  --ops-success: #16a34a;
  --ops-success-soft: #dcfce7;

  --ops-warning: #f59e0b;
  --ops-warning-soft: #fef3c7;

  --ops-danger: #ef4444;
  --ops-danger-soft: #fee2e2;

  --ops-info: #0ea5e9;
  --ops-info-soft: #e0f2fe;
}
```

Rule:

```text
No random colors. Use tokens or Tailwind classes mapped to tokens.
```

---

# 4. Typography

Recommended font:

```text
Inter
```

Use Next.js font optimization:

```text
next/font/google
```

Fallback:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

---

# 5. Next.js UI Structure

Use this app routing structure:

```text
src/app/
  layout.tsx
  globals.css
  (auth)/
    login/page.tsx
  (app)/
    layout.tsx
    dashboard/page.tsx
    leads/page.tsx
    jobs/page.tsx
    tasks/page.tsx
    calendar/page.tsx
    automations/page.tsx
    settings/page.tsx
```

`src/app/(app)/layout.tsx` should render:

```text
AppShell
Sidebar
Topbar
Main content slot
Mobile navigation
```

---

# 6. App Shell

## Desktop

```text
Fixed dark navy sidebar: 260px
Light main workspace
Topbar inside main area
Content grid with cards
```

## Mobile

```text
No fixed desktop sidebar
Compact topbar
Bottom nav or slide drawer
Stacked cards
Large touch targets
No text overlap
```

---

# 7. Sidebar

Required sections:

```text
Logo
Workspace switcher
Navigation
Upgrade/pro status card later
User profile/sign out
```

MVP navigation:

```text
Overview
Leads
Jobs
Tasks
Calendar
Automations
Settings
```

Future navigation:

```text
Clients
Invoices
Reports
AI Assistant
```

Active nav:

- Purple gradient background
- White text
- Soft glow
- Clear icon

Inactive nav:

- Muted text
- Soft hover background
- Consistent icons

---

# 8. Topbar

Include:

```text
Search anything...
Add New
Messages icon
Bell icon
User avatar
```

MVP behavior:

- Search can be visual only at first
- Add New opens quick-create menu or Lead modal first
- Icons should not fake real notifications unless data exists

---

# 9. Dashboard Overview

The dashboard must answer:

```text
What needs attention today?
```

Sections:

1. Greeting
2. KPI cards
3. Pipeline Overview
4. Today’s Agenda
5. Tasks Overview
6. Revenue Overview
7. Recent Activity
8. AI Assistant card

## KPI Cards

Use exactly these first:

```text
New Leads
Jobs Booked
Revenue (Est.)
Overdue Tasks
```

Rules:

- Use real data after DB connection
- Use empty states before data connection
- Do not fake production values
- Label revenue as estimated until invoices/payments exist

---

# 10. Dashboard Components

Create these components:

```text
components/dashboard/StatCard.tsx
components/dashboard/PipelineOverview.tsx
components/dashboard/TodayAgenda.tsx
components/dashboard/TasksOverview.tsx
components/dashboard/RevenueOverview.tsx
components/dashboard/RecentActivity.tsx
components/dashboard/AIAssistantCard.tsx
```

Use client components only when interactivity/charts need it:

```tsx
'use client'
```

Do not mark every component as client by default.

---

# 11. UI Component System

Create reusable components:

```text
components/ui/Button.tsx
components/ui/Card.tsx
components/ui/Badge.tsx
components/ui/Input.tsx
components/ui/Modal.tsx
components/ui/Skeleton.tsx
components/ui/EmptyState.tsx
components/ui/StatusBadge.tsx
components/ui/SectionHeader.tsx
```

Optional later:

```text
DataTable
Drawer
DropdownMenu
CommandSearch
Toast
Tabs
Switch
```

Recommended UI foundation:

```text
Tailwind CSS
lucide-react
Radix UI primitives where useful
shadcn/ui inspiration, but do not blindly install everything
```

---

# 12. Page Requirements

## Login Page

Should feel premium and trustworthy.

Include:

- OpsPilot logo
- Clear sign-in form
- Password reset link
- Soft visual panel
- No clutter

## Dashboard Page

Premium overview, not a generic admin page.

## Leads Page

MVP:

- Search/filter row
- Lead table or cards
- Add Lead button
- Empty state
- Lead status badge

Later:

- Detail drawer
- Kanban pipeline

## Jobs Page

MVP:

- Job list
- Schedule date
- Status badge
- Estimated value
- Assigned user

## Tasks Page

MVP:

- Task list
- Due date
- Priority
- Status
- Overdue calculated in UI/query

## Calendar Page

MVP:

- Today/Week/Month filters
- Appointment list
- Job schedule list

## Automations Page

MVP:

- Automation logs
- Status badges
- Placeholder for n8n connection

## Settings Page

MVP sections:

- Workspace profile
- Branding
- Modules
- Pipeline
- Team placeholder
- Security placeholder

---

# 13. Empty, Loading, and Error States

Every major card/page must include:

## Empty State

Example:

```text
No leads yet. Add your first lead to start tracking follow-ups.
```

## Loading State

Use skeletons instead of full-screen spinners where possible.

## Error State

Example:

```text
We couldn't load your leads. Please refresh or try again.
```

Include retry button where possible.

---

# 14. Data Honesty Rules

Do not show fake values as if they are real.

Allowed:

- Skeleton state
- Empty state
- Clearly isolated demo mode later

Not allowed:

- Hardcoded fake leads in production UI
- Fake revenue values without demo mode
- Fake notification badges unless connected to data

If sample data is needed later:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

---

# 15. Accessibility Rules

- Buttons need visible labels or aria-labels
- Icon-only buttons must have aria-label
- Form inputs must have labels
- Focus states must be visible
- Do not rely only on color for status
- Dialogs must trap/restore focus
- Mobile targets should be comfortable
- Tables/lists should remain readable on small screens

---

# 16. White-Label UI Rules

The UI must eventually read from:

```text
workspace_branding
workspace_modules
pipeline_stages
message_templates
custom_fields
```

Branding settings should eventually affect:

- App name
- Logo
- Primary color
- Accent color
- Login heading
- Login subtext
- Theme mode

---

# 17. Visual Quality Rules for Codex

Codex must:

1. Preserve dark navy sidebar + light main workspace.
2. Use tokens.
3. Keep cards rounded and clean.
4. Avoid generic admin dashboard styling.
5. Avoid clutter.
6. Use clear service-business labels.
7. Keep data states honest.
8. Build reusable components.
9. Make mobile usable.
10. Avoid hardcoding one niche.
11. Use Next.js App Router structure.
12. Avoid unnecessary `use client`.

---

# 18. First UI Build Order

1. Global CSS tokens
2. App shell
3. Sidebar
4. Topbar
5. Reusable UI components
6. Static dashboard shell
7. Login page
8. Leads page
9. Jobs page
10. Tasks page
11. Settings page
12. Real data connection

---

# 19. Final Design Standard

The finished app should feel close to:

```text
Linear
Stripe Dashboard
Modern CRM dashboards
GoHighLevel-style business utility
Premium analytics dashboards
```

But simpler and easier for non-technical business owners.
