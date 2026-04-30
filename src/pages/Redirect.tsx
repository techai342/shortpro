import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Redirect() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLongUrl() {
      if (!shortCode) return;

      try {
        const domain = window.location.hostname;
        const { data, fetchError } = await supabase
          .from('urls')
          .select('long_url')
          .eq('domain', domain)
          .eq('short_code', shortCode)
          .single();

        if (fetchError) {
          console.error("Supabase Error:", fetchError);
          if (fetchError.code === 'PGRST116') {
            setError('We could not find a URL for this short code. It may have expired or never existed.');
          } else if (fetchError.message.includes('relation "urls" does not exist')) {
             setError('Database table "urls" has not been created yet in the Supabase project.');
          } else {
             setError(fetchError.message);
          }
          return;
        }

        if (data && data.long_url) {
          // Fast redirect with a small delay to show the nice animation (~800ms)
          setTimeout(() => {
            window.location.href = data.long_url;
          }, 800);
        } else {
          setError('Invalid URL record found.');
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError('An unexpected error occurred while redirecting.');
      }
    }

    fetchLongUrl();
  }, [shortCode]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-[#EDEDED] font-sans">
        <div className="max-w-md w-full bg-[#0F0F0F] border border-white/10 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-light tracking-tight">Link Not Found</h1>
          <p className="text-sm text-zinc-400">{error}</p>
          <a
            href="/"
            className="inline-flex mt-4 bg-white text-black px-6 py-3 rounded-lg font-medium transition-transform hover:bg-neutral-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic ambient glow matched to the ring colors */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-pink-500 via-orange-500 to-blue-500 opacity-20 blur-[100px] rounded-full mix-blend-screen animate-[pulse_2s_ease-in-out_infinite]"></div>

      <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
        {/* RGB Gradient Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF512F] via-[#DD2476] to-[#4facfe] animate-[spin_1s_linear_infinite] shadow-[0_0_40px_rgba(221,36,118,0.4)] blur-[1px]"></div>
        
        {/* Inner Dark Circle creating the "donut" thickness */}
        <div className="absolute inset-[15%] rounded-full bg-[#0d0d0d] shadow-[inset_0_-5px_20px_rgba(0,0,0,0.8),0_5px_20px_rgba(0,0,0,0.9)] z-10 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-b from-[#1a1a1a] to-[#050505] opacity-50"></div>
          <span className="relative z-20 text-white font-bold tracking-[0.2em] text-xl md:text-3xl uppercase">saqib</span>
        </div>
      </div>
    </div>
  );
}
