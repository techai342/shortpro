import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, Lock, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { SocialIcon } from '../components/SocialIcon';

export default function Redirect() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [error, setError] = useState<string | null>(null);
  
  // Password state
  const [isLocked, setIsLocked] = useState(false);
  const [requiredPassword, setRequiredPassword] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [inputPassword, setInputPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Social gate state
  const [socialGate, setSocialGate] = useState<{ title: string; url: string; icon: string; description: string; buttonText: string } | null>(null);
  const [isSocialGateCompleted, setIsSocialGateCompleted] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === requiredPassword && targetUrl) {
      if (socialGate && !isSocialGateCompleted) {
         setIsLocked(false);
      } else {
         setIsLocked(false);
         setTimeout(() => {
           window.location.href = targetUrl;
         }, 500);
      }
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleSocialAction = () => {
    if (!socialGate) return;
    // Open link in new tab
    window.open(socialGate.url, '_blank', 'noopener,noreferrer');
    
    // Automatically complete after a short delay (or immediately)
    setTimeout(() => {
      setIsSocialGateCompleted(true);
      if (targetUrl) {
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 500);
      }
    }, 1500);
  };

  useEffect(() => {
    async function fetchLongUrl() {
      if (!shortCode) return;

      try {
        const domain = window.location.hostname;
        
        // Try fetching with password and social gate first
        let fetchedData;
        let fetchedError;
        
        const res = await supabase
          .from('urls')
          .select('long_url, password, social_gate_title, social_gate_url, social_gate_icon, social_gate_description, social_gate_button_text')
          .eq('domain', domain)
          .eq('short_code', shortCode)
          .single();

        if (res.error && (res.error.message.includes('column "password" does not exist') || res.error.message.includes('column "social_gate_title" does not exist') || res.error.message.includes('column "social_gate_icon" does not exist') || res.error.message.includes('column "social_gate_description" does not exist'))) {
          // Fallback if the user hasn't run the ALTER TABLE yet
          const fallbackRes = await supabase
            .from('urls')
            .select('long_url')
            .eq('domain', domain)
            .eq('short_code', shortCode)
            .single();
          fetchedData = fallbackRes.data;
          fetchedError = fallbackRes.error;
        } else {
          fetchedData = res.data;
          fetchedError = res.error;
        }

        if (fetchedError) {
          console.error("Supabase Error:", fetchedError);
          if (fetchedError.code === 'PGRST116') {
            setError('We could not find a URL for this short code. It may have expired or never existed.');
          } else if (fetchedError.message.includes('relation "urls" does not exist')) {
             setError('Database table "urls" has not been created yet in the Supabase project.');
          } else {
             setError(fetchedError.message);
          }
          return;
        }

        if (fetchedData && fetchedData.long_url) {
          setTargetUrl(fetchedData.long_url);
          
          let needsLock = false;
          let needsGate = false;

          if (fetchedData.password) {
            setRequiredPassword(fetchedData.password);
            needsLock = true;
          }
          
          if (fetchedData.social_gate_title && fetchedData.social_gate_url) {
            setSocialGate({
              title: fetchedData.social_gate_title,
              url: fetchedData.social_gate_url,
              icon: fetchedData.social_gate_icon || 'link',
              description: fetchedData.social_gate_description || 'Complete the action below to unlock your link.',
              buttonText: fetchedData.social_gate_button_text || 'Verify & Continue'
            });
            needsGate = true;
          }
          
          if (needsLock) {
            setIsLocked(true);
          } else if (needsGate) {
             // Don't fast redirect, wait for gate
          } else {
            // Fast redirect
            setTimeout(() => {
              window.location.href = fetchedData.long_url;
            }, 800);
          }
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

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_70%)] -z-10"></div>
        <div className="max-w-sm w-full bg-[#0F0F0F] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
          <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 mb-6">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-light tracking-tight text-[#EDEDED] mb-2">Protected Link</h1>
            <p className="text-sm text-zinc-400">Please enter the password to continue.</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Enter password"
                className="w-full bg-[#0A0A0A] rounded-lg py-4 px-5 text-zinc-200 focus:outline-none placeholder:text-zinc-700 transition-all text-center tracking-widest border animate-rgb"
                autoFocus
              />
            </div>
            {passwordError && (
              <p className="text-red-400 text-xs text-center font-medium animate-pulse">{passwordError}</p>
            )}
            <button
              type="submit"
              disabled={!inputPassword}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 px-6 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Unlock <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (socialGate && !isSocialGateCompleted) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_70%)] -z-10"></div>
        <div className="max-w-sm w-full bg-[#0F0F0F] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-xl flex flex-col items-center text-center">
          <div className="mb-6 flex justify-center w-full">
            <SocialIcon id={socialGate.icon} className="w-16 h-16" />
          </div>
          
          <h1 className="text-2xl font-light tracking-tight text-[#EDEDED] mb-2">{socialGate.title}</h1>
          <p className="text-sm text-zinc-400 mb-8">{socialGate.description}</p>
          
          <button
            onClick={handleSocialAction}
            className="w-full bg-[#1A1A1A] hover:bg-[#222222] border border-white/10 text-white font-medium py-4 px-6 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-3 group shadow-lg"
          >
            <SocialIcon id={socialGate.icon} className="w-5 h-5 !shadow-none before:!hidden after:!hidden opacity-90 ring-0" />
            <span>{socialGate.buttonText}</span>
            <ExternalLink className="w-4 h-4 ml-auto text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </button>
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
