import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateShortCode, cn } from '../lib/utils';
import { Link2, Copy, Check, Sparkles, Settings2, Database, AlertCircle, Trash2 } from 'lucide-react';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  
  // For saving history locally to browser
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('supashort_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
        .insert([{ domain, short_code: code, long_url: urlToShorten }]);

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
      
      const newHistoryItem = { code, longUrl: urlToShorten, shortUrl: generatedUrl, date: new Date().toISOString() };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 5); // Keep last 5
      setHistory(updatedHistory);
      localStorage.setItem('supashort_history', JSON.stringify(updatedHistory));
      
      setLongUrl('');
      setCustomCode('');
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Check console for details.');
    } finally {
      setIsSubmitting(false);
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

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('supashort_history');
  }

  const sqlSetupScript = `-- Run this in your Supabase SQL Editor
-- If you already have the urls table, you can DROP it first using: DROP TABLE public.urls;

create table public.urls (
  id uuid default gen_random_uuid() primary key,
  domain text not null,
  short_code text not null,
  long_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (domain, short_code)
);

-- Turn on row security
alter table public.urls enable row level security;

-- Allow public access
create policy "Allow public read access" on public.urls for select using (true);
create policy "Allow public insert access" on public.urls for insert with check (true);
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
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shrink-0">S</div>
          <span className="text-base md:text-lg font-semibold tracking-tight">
            Shorty<span className="text-blue-500 underline decoration-2 underline-offset-4">OS</span>
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">Supabase Connected</span>
          </div>
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
                      <a href={item.shortUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-400 hover:underline">
                        /{item.code}
                      </a>
                      <button 
                        onClick={() => copyToClipboard(item.shortUrl)} 
                        className="text-[10px] text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate" title={item.longUrl}>{item.longUrl}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-auto p-6 border-t border-white/10 hidden md:block shrink-0">
            <div className="bg-zinc-900 rounded-lg p-4">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Project Key</p>
              <code className="text-[11px] text-blue-400 font-mono break-all leading-tight">
                {import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 24)}...
              </code>
            </div>
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
    </div>
  );
}
