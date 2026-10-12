# ⚡ SupaShort (ShortyOS)

<div align="center">

![SupaShort Banner](https://ik.imagekit.io/19imy4f1u/lite_1777561225399_yUcjK1Jzn.jpeg)

**Next-Generation URL Management, Interactive Social Gates & Real-Time Intelligence Platform**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://web.dev/progressive-web-apps/)

</div>

---

## 📖 Overview

**SupaShort** is a full-featured, privacy-focused link management system built on modern web technologies. Beyond traditional URL shortening, it provides custom security passcodes, interactive social gates (require visitors to join/subscribe before redirecting), hardware-level visitor analytics, dynamic loading animations, and an integrated image conversion suite.

---

## ✨ Key Features

### 🔗 URL Shortening & Custom Slugs
- **Instant Generation**: Generate random 6-character short codes or customize your own vanity slug.
- **Link Expiration**: Set optional expiration dates and times for time-sensitive campaigns.
- **QR Code Generator**: Automatic high-resolution QR code creation for every shortened link with one-click PNG download.

### 🛡️ Access Control & Social Gates
- **Password Protection**: Protect sensitive destinations behind a custom access code.
- **Social Action Gate**: Require visitors to subscribe or follow your social accounts (YouTube, Instagram, Facebook, WhatsApp, X/Twitter, LinkedIn, TikTok) before accessing the target link.
- **Custom Splash Screen**: Choose between dynamic glowing ring animations or smooth gradient progress bars with custom status text.

### 📊 Real-Time Analytics & Device Intel
- **Geolocation & Network**: Detect visitor country, city, and IP passively.
- **Hardware Profile**: Log CPU cores (`hardware_concurrency`), RAM memory, and GPU render engines.
- **Client Specs**: Monitor screen resolution, color depth, browser, OS, and battery status.
- **Live Feed**: Auto-updating visitor log table with interactive map coordinate launchers.

### 🎨 Built-in Media Tools
- **Image Converter & Compressor**: Built-in client-side image compression with target KB size adjustments and WebP/PNG/JPEG conversion.
- **Batch Export**: Download converted assets individually or packed into a ZIP archive.

---

## 🛠️ Architecture & Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animation Engine** | [Motion (Framer Motion)](https://motion.dev/) |
| **Database & Auth** | [Supabase (PostgreSQL)](https://supabase.com/) |
| **Client Utilities** | `qrcode.react`, `ua-parser-js`, `jszip`, `file-saver` |

---

## 📂 Project Structure

```bash
├── index.html               # Application HTML entry point
├── metadata.json            # AI Studio applet configuration
├── package.json             # NPM dependencies & scripts
├── vite.config.ts           # Vite + Tailwind + PWA configuration
├── tsconfig.json            # TypeScript configuration
├── src/
│   ├── main.tsx             # React root mount
│   ├── App.tsx              # Application routing (/ , /ms-admin, /:shortCode)
│   ├── index.css            # Global CSS & Tailwind imports
│   ├── components/
│   │   ├── ImageConverter.tsx   # Image optimizer & batch converter
│   │   ├── SaqibSignature.tsx   # Verified Author Signature badge (By MS)
│   │   └── SocialIcon.tsx       # Brand vector icon renderer
│   ├── core/
│   │   ├── engine.ts        # Client integrity helpers
│   │   └── sys.ts           # Core system initializer
│   ├── lib/
│   │   ├── imageUpload.ts   # Image upload provider utility
│   │   ├── supabase.ts      # Supabase client connection
│   │   └── utils.ts         # Tailwind merger & slug generator
│   └── pages/
│       ├── Home.tsx         # Dashboard for link creation, editing & analytics
│       ├── Admin.tsx        # Super-admin control panel & global data viewer
│       └── Redirect.tsx     # Dynamic redirection, social gate & analytics tracker
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: Version 20+ (Node.js 22 recommended)
- **NPM**: Version 9+

### 2. Installation

Clone or open the repository, then install dependencies:

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory (based on `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-optional-gemini-key
```

### 4. Running the Development Server

Start the local server on port 3000:

```bash
npm run dev
```

The application will be accessible at: `http://localhost:3000`

---

## 🗄️ Database Setup (Supabase SQL)

To enable persistent URLs and visitor analytics, run the following SQL script in your **Supabase SQL Editor**:

```sql
-- 1. Create urls table
create table if not exists public.urls (
  id uuid default gen_random_uuid() primary key,
  domain text not null,
  short_code text not null,
  long_url text not null,
  password text,
  social_gate_title text,
  social_gate_url text,
  social_gate_icon text,
  social_gate_description text,
  social_gate_button_text text,
  animation_type text default 'ring',
  animation_text text default 'LOADING',
  capture_camera boolean default false,
  capture_location boolean default false,
  expires_at timestamp with time zone,
  device_id text,
  is_pinned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (domain, short_code)
);

-- 2. Create link_analytics table
create table if not exists public.link_analytics (
  id uuid default gen_random_uuid() primary key,
  url_id uuid references public.urls(id) on delete cascade,
  ip_address text,
  device_type text,
  browser text,
  os text,
  referrer text,
  captured_image text,
  latitude double precision,
  longitude double precision,
  location_name text,
  battery_level float,
  is_charging boolean,
  network_type text,
  screen_resolution text,
  language text,
  hardware_concurrency integer,
  device_memory integer,
  color_depth integer,
  timezone text,
  webgl_vendor text,
  webgl_renderer text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.urls enable row level security;
alter table public.link_analytics enable row level security;

-- 4. Set Public Access Policies
create policy "Allow public read access" on public.urls for select using (true);
create policy "Allow public insert access" on public.urls for insert with check (true);
create policy "Allow public update access" on public.urls for update using (true);
create policy "Allow public delete access" on public.urls for delete using (true);

create policy "Allow public read access for analytics" on public.link_analytics for select using (true);
create policy "Allow public insert access for analytics" on public.link_analytics for insert with check (true);
create policy "Allow public delete access for analytics" on public.link_analytics for delete using (true);
```

---

## 🔒 Admin Access

The application features an administrative interface:
- **Routes**: `/ms-admin` or `/admin`
- **Shortcut**: Double-click the signature badge (`by ms`) anywhere on the site.
- **Authentication**: Enter your access key (`ms99` / `saqib99`) to unlock the global intelligence console.

---

## 💎 Credits & Author

Crafted with care and precision.

**Maintained & Developed:** `by ms`

---

## 📄 License

This project is licensed under the MIT License - feel free to build, customize, and deploy.
