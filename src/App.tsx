import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUpRight,
  Code,
  Video,
  PenTool,
  Cpu,
  TrendingUp,
  Lightbulb,
  ExternalLink,
  Camera,
  Smartphone,
  Image as ImageIcon,
  MessageSquare,
  PhoneCall,
  Bell
} from 'lucide-react';
import { SiInstagram, SiTiktok, SiFacebook, SiSnapchat, SiWhatsapp } from 'react-icons/si';
import CameraShowcase from './components/CameraShowcase';
import PosterShowcase from './components/PosterShowcase';
import ProjectPreviewShowcase from './components/ProjectPreviewShowcase';
import EnrouteShowcase from './components/EnrouteShowcase';
import CreativeTypographyShowcase from './components/CreativeTypographyShowcase';
import WeatherShowcase from './components/WeatherShowcase';
import SocialMagazineShowcase from './components/SocialMagazineShowcase';
import TornPaperShowcase from './components/TornPaperShowcase';
import AboutSaqib from './components/AboutSaqib';
import Footer from './components/Footer';

const personalInfo = {
  name: "Muhammad Saqib",
  brand: "Saqib Visuals",
  age: 17,
  profession: "Creative Visual Artist | Content Creator | Tech Enthusiast",
  location: "Faisalabad (FSD), Pakistan",
  phone: "0347-8936242",
  email: "mrsaqib242242@gmail.com",
  quote: "Success is not just what you accomplish in your life, it's about what you inspire others to do."
};

const socialLinks = [
  { name: 'WhatsApp', url: 'https://wa.me/923478936242', icon: MessageCircle },
  { name: 'Instagram', url: 'https://www.instagram.com/mr_saqib242', icon: Instagram },
  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100085188689033', icon: Facebook },
  { name: 'TikTok', url: 'https://www.tiktok.com/@mr_saqib_242', icon: Video },
  { name: 'Snapchat', url: 'https://www.snapchat.com/add/mrsaqib242', icon: MessageCircle },
];

const websites = [
  { name: 'Portfolio Website', url: 'https://techai.zone.id/' },
  { name: 'Main Website', url: 'https://saqib.zone.id/' },
];

const skills = [
  { name: 'AI Enthusiast', icon: Cpu },
  { name: 'AI Developer', icon: Code },
  { name: 'Web Development', icon: Globe },
  { name: 'Software Development', icon: Code },
  { name: 'Video Editing', icon: Video },
  { name: 'Graphic Designing', icon: PenTool },
  { name: 'Digital Marketing', icon: TrendingUp },
  { name: 'Creative Thinking', icon: Lightbulb },
];

const interests = [
  'Technology Innovation',
  'Content Creation',
  'AI Tools & Development',
  'Creative Design',
  'Digital Growth'
];

const profileImages = [
  'https://ik.imagekit.io/shaban/SHABAN-1768573425069_nIPVZQOaT.jpg',
  'https://ik.imagekit.io/shaban/SHABAN-1768575063823_VKv0h9E-k.jpg'
];

const galleryImages = [
  "https://ik.imagekit.io/shaban/SHABAN-1768573425069_nIPVZQOaT.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573550507_ArSSmUT0tW.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573642529_UEEpMXFEkV.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573647809_L4RIsxMgI.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573652854__LqIeAU47.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573659591_abaSpAF-y.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573669146_5z2ap9EbK.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573674849_RvEzQQfNI.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573679202_aZrkl8hRt.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573689483_NnwuSUKqm.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573697274_CP3034fDP.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768573705488_jYpVaM2u0.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575063823_VKv0h9E-k.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575091370_Eff9-yBbl.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575128883_e-W-AMj3q.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575146572_S9cSoOYEd.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575153097_cNAjcwYjl.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575206893_2JJlY1Wm0.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575218262_6SqMS7ijo.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575233008_FM9BCgwYX.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575235727_gOIsiMEMW.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575240340_5tz9dWXNo.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575245369_aFwAR5G1A.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575256985_nCso21_yg.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575261320_xDKXsGy9j.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575265565_APidCqJd2.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575273776_12t6fSWUNF.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575281292_KWCWQm1tp.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575289386_Ohy6x5nR7.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575387302_iPzMxeVnf.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575391677_bsAlvqZL9.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575400809_AMhNzr8n3.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575407874_LewPrAdHC.jpg",
  "https://ik.imagekit.io/shaban/SHABAN-1768575415857_lNqkpn9Iz.jpg"
];

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isHacksModalOpen, setIsHacksModalOpen] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
        setIsHacksModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen selection:bg-accent selection:text-white pb-24">
      
      {/* Navigation / Header */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-6 md:px-8 py-4 flex items-center justify-between w-[90%] max-w-5xl shadow-2xl">
        <div className="font-display text-xl tracking-wider uppercase text-white">
          {personalInfo.brand}
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-white/70">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#skills" className="hover:text-white transition-colors">Skills</a>
          <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="md:hidden"></div>
      </nav>

      {/* Hero Section (Poster Style) */}
      <section className="relative w-full h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#e4e4e4]">
        
        {/* Background Blurred Image */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <img 
            src="https://ik.imagekit.io/19imy4f1u/lite_1775822697436_IXJPba-z2.png" 
            alt="Muhammad Saqib, Best Web Developer in Gojra, Faisalabad - Background" 
            className="w-full h-full object-cover opacity-30 blur-3xl scale-125"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Massive Typography Layer */}
        <div className="absolute z-10 w-full top-[35%] md:top-[30%] -translate-y-1/2 text-center">
          {/* SEO Hidden H1 - Actual Semantic H1 */}
          <h1 className="sr-only">Saqib242 | MrSaqib - Top Website Designer and SEO Expert in Pakistan</h1>
          
          <div className="font-display text-[32vw] md:text-[28vw] leading-[0.75] text-white tracking-tighter select-none drop-shadow-sm" aria-hidden="true">
            SAQIB
          </div>
        </div>

        {/* Foreground Sharp Image */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute z-20 bottom-0 w-full flex justify-center items-end h-[75%] md:h-[85%]"
        >
          <img 
            src="https://ik.imagekit.io/19imy4f1u/lite_1775822697436_IXJPba-z2.png" 
            alt="Muhammad Saqib (MrSaqib) - Top Website Designer and SEO Expert in Pakistan" 
            className="h-full w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Floating Content Overlays */}
        <div className="absolute z-30 inset-0 w-full h-full pointer-events-none max-w-7xl mx-auto">
          
          {/* Top Left: Bullet Points */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="pointer-events-auto absolute top-[15%] md:top-[15%] left-6 md:left-12 max-w-[220px] md:max-w-xs text-[#1a1a1a]"
          >
            <ul className="space-y-1.5 md:space-y-2 text-[9px] md:text-xs font-bold tracking-widest uppercase">
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#1a1a1a]"></div> Creative Visual Artist</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#1a1a1a]"></div> Content Creator</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#1a1a1a]"></div> Tech Enthusiast</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#1a1a1a]"></div> AI Developer</li>
            </ul>
          </motion.div>

          {/* Middle Right: Name */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="pointer-events-auto absolute right-6 md:right-12 top-[42%] md:top-[45%] text-right text-[#1a1a1a]"
          >
            <p className="font-bold tracking-widest uppercase text-[10px] md:text-sm">by Muhammad Saqib</p>
          </motion.div>
          
          {/* Subtitle text below the subject's face */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pointer-events-auto absolute w-full text-center top-[58%] md:top-[65%] text-white drop-shadow-md px-4"
          >
            <p className="font-bold tracking-widest uppercase text-[12px] md:text-xl leading-snug">
              PORTFOLIO / <br className="md:hidden" />
              CREATIVE SHOWCASE
            </p>
          </motion.div>

          {/* Cursive overlay text */}
          <div className="absolute bottom-[22%] md:bottom-[20%] left-1/2 -translate-x-1/2 w-full text-center">
            <h2 className="font-cursive text-[32vw] md:text-[12rem] text-[#1a1a1a] transform -rotate-6 select-none drop-shadow-md leading-none">
              Visuals
            </h2>
          </div>

          {/* Bottom stats/info matching the reference style */}
          <div className="absolute bottom-8 md:bottom-12 left-6 md:left-12 flex flex-row items-center gap-3 md:gap-8 text-[#1a1a1a] font-bold tracking-widest uppercase text-[9px] md:text-xs">
            <div className="text-xl md:text-3xl font-display tracking-normal">
              PROFILE:
            </div>
            <div className="flex flex-col text-left space-y-1.5">
              <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#1a1a1a]"></div> 17 Years Old</span>
              <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#1a1a1a]"></div> Based in Faisalabad</span>
              <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#1a1a1a]"></div> Available for Work</span>
            </div>
          </div>

        </div>

        {/* Gradient Fade to White Theme for the next section */}
        <div className="absolute bottom-0 left-0 w-full h-24 md:h-40 bg-gradient-to-b from-transparent to-white z-40 pointer-events-none"></div>
      </section>

      {/* Quote Section */}
      <section className="py-24 px-6 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-8 opacity-20" />
          <h2 className="font-display text-4xl md:text-6xl leading-tight uppercase tracking-tight mb-8">
            "{personalInfo.quote}"
          </h2>
          <p className="font-semibold tracking-widest uppercase text-sm opacity-60">— {personalInfo.name}</p>
          
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsHacksModalOpen(true)}
            className="mt-12 mx-auto flex items-center gap-3 bg-accent text-black px-10 py-4 rounded-full hover:bg-black hover:text-white transition-all font-bold uppercase tracking-[0.2em] text-xs shadow-[0_15px_30px_rgba(255,107,0,0.3)] group"
          >
            Explore Hacks
            <div className="w-6 h-6 rounded-full bg-black/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-lg">⚡</span>
            </div>
          </motion.button>
        </div>
      </section>

      {/* About & Skills Section */}
      <section id="about" className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-20">
          
          {/* Animated Images (Shows 2 images on phone & desktop) */}
          <div className="relative h-[350px] sm:h-[450px] md:h-[600px] w-full">
            <motion.img
              animate={{ y: [0, -15, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              src={profileImages[0]}
              alt="Profile 1"
              className="absolute top-0 left-0 w-[70%] h-[75%] object-cover rounded-3xl shadow-2xl z-10 border border-white/10"
              referrerPolicy="no-referrer"
            />
            <motion.img
              animate={{ y: [0, 15, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              src={profileImages[1]}
              alt="Profile 2"
              className="absolute bottom-0 right-0 w-[65%] h-[70%] object-cover rounded-3xl shadow-2xl z-20 border-4 border-black"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-accent"></div>
              <h2 className="font-display text-4xl uppercase tracking-wider">About Me</h2>
            </div>
            <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed mb-12">
              I am a passionate and motivated learner with a strong interest in modern technology and creativity. I enjoy exploring new tools, building digital solutions, and creating engaging visual content.
              <br/><br/>
              My objective is to grow as a tech professional and creative developer by learning new technologies and creating impactful digital content that inspires others.
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-accent"></div>
              <h2 className="font-display text-2xl uppercase tracking-wider">Interests</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {interests.map((interest, idx) => (
                <span key={idx} className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium tracking-wide">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div id="skills" className="pt-16 border-t border-white/10">
          <div className="flex items-center gap-4 mb-12 justify-center">
            <div className="hidden md:block w-12 h-px bg-accent"></div>
            <h2 className="font-display text-4xl uppercase tracking-wider text-center">My Skills</h2>
            <div className="hidden md:block w-12 h-px bg-accent"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skills.map((skill, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all group flex flex-col items-center text-center">
                <skill.icon className="w-8 h-8 mb-4 text-accent group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold tracking-wide text-sm">{skill.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Graphic Design Showcase Section */}
      <section id="graphic-design" className="relative py-20 md:py-32 px-6 min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Split Background */}
        <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to top right, #fcd5c1 0%, #fcd5c1 50%, #4a4a4a 50%, #1a1a1a 100%)' }}></div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-end h-full">
          
          {/* Sliced Image Effect */}
          <div 
            className="relative z-10 flex mb-32 md:mb-0 md:mr-10"
            style={{ 
              '--w': 'min(75vw, 450px)', 
              width: 'var(--w)', 
              height: 'var(--w)', 
              transform: 'rotate(-45deg)' 
            } as React.CSSProperties}
          >
            {[
              { h: 0.6, t: 0.2 },
              { h: 0.8, t: 0.1 },
              { h: 1.0, t: 0.0 },
              { h: 0.8, t: 0.1 },
              { h: 0.6, t: 0.2 },
            ].map((strip, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50, x: -50 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: "easeOut" }}
                className="absolute overflow-hidden"
                style={{
                  width: 'calc(var(--w) / 5 - 8px)',
                  height: `calc(var(--w) * ${strip.h})`,
                  top: `calc(var(--w) * ${strip.t})`,
                  left: `calc(${i} * (var(--w) / 5))`,
                  boxShadow: '0px 20px 30px rgba(0,0,0,0.6)'
                }}
              >
                <img 
                  src="https://ik.imagekit.io/shaban/SHABAN-1768575245369_aFwAR5G1A.jpg" 
                  alt="Graphic Design Showcase"
                  className="absolute max-w-none object-cover"
                  style={{
                    width: 'var(--w)',
                    height: 'var(--w)',
                    top: `calc(var(--w) * -${strip.t})`,
                    left: `calc(-1 * ${i} * (var(--w) / 5))`,
                    transform: 'rotate(45deg) scale(1.25)',
                    transformOrigin: 'center',
                    objectPosition: 'center 5%'
                  }}
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>

          {/* Text Area */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-10 md:bottom-16 left-6 md:left-12 z-20 text-black pointer-events-none"
          >
            <h2 className="font-serif text-5xl md:text-7xl font-bold leading-none tracking-tight">
              Muhammad<br />
              <span className="ml-8 md:ml-24">Saqib</span>
            </h2>
            <p className="font-serif text-2xl md:text-4xl mt-2 md:mt-4 tracking-wide">Graphic design</p>
          </motion.div>

        </div>
      </section>

      {/* Camera UI Showcase Section */}
      <CameraShowcase />

      {/* Poster Showcase Section */}
      <PosterShowcase />

      {/* Project Preview Showcase Section (3rd) */}
      <ProjectPreviewShowcase />

      {/* Enroute Showcase Section */}
      <EnrouteShowcase />

      {/* Creative Typography Showcase Section */}
      <CreativeTypographyShowcase />

      {/* Weather Showcase Section */}
      <WeatherShowcase />

      {/* Social Magazine Showcase Section */}
      <SocialMagazineShowcase />

      {/* Torn Paper Showcase Section */}
      <TornPaperShowcase />

      {/* SEO About Section (Who is Saqib242?) */}
      <AboutSaqib />

      {/* Gallery Section */}
      <section id="gallery" className="py-32 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-px bg-accent"></div>
            <h2 className="font-display text-5xl uppercase tracking-wider">Visuals Gallery</h2>
          </div>
          
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6 space-y-3 md:space-y-6">
            {galleryImages.map((img, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (idx % 4) * 0.1, duration: 0.6, type: "spring", bounce: 0.4 }}
                className="break-inside-avoid relative group cursor-pointer rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:z-10 transition-all"
                onClick={() => setSelectedImage(img)}
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                  <div className="bg-white text-black p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <ArrowUpRight size={24} />
                  </div>
                </div>
                <img 
                  src={img} 
                  alt={`Gallery image ${idx + 1}`} 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="bg-accent rounded-[3rem] p-8 md:p-16 text-black relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="font-display text-6xl md:text-8xl uppercase tracking-tighter leading-[0.85] mb-8">
                Let's<br />Connect
              </h2>
              <p className="text-xl font-medium opacity-80 max-w-md mb-12">
                Open for collaborations, projects, or just a chat about technology and design.
              </p>
              
              <div className="space-y-6 font-medium text-lg">
                <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-4 hover:opacity-70 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  {personalInfo.email}
                </a>
                <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-4 hover:opacity-70 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  {personalInfo.phone}
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  {personalInfo.location}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h3 className="font-bold uppercase tracking-widest text-sm mb-6 opacity-60">Social Media</h3>
                <div className="flex flex-wrap gap-4 mb-12">
                  {socialLinks.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-accent transition-colors"
                    >
                      <link.icon size={24} />
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-widest text-sm mb-6 opacity-60">Websites</h3>
                <div className="space-y-4">
                  {websites.map((site, idx) => (
                    <a 
                      key={idx}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-6 rounded-2xl bg-black/5 hover:bg-black hover:text-white transition-colors group"
                    >
                      <span className="font-bold text-xl">{site.name}</span>
                      <ExternalLink size={24} className="opacity-50 group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />

      {/* Hacks Modal */}
      <AnimatePresence>
        {isHacksModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setIsHacksModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2"
                onClick={() => setIsHacksModalOpen(false)}
              >
                <span className="text-3xl leading-none">&times;</span>
              </button>

              <div className="flex flex-col gap-4 mt-4">
                <h3 className="font-display text-2xl text-white mb-4 uppercase tracking-wider">Hacks Menu</h3>
                
                {/* 1st Button: Camera location and device information */}
                <motion.a 
                  href="https://shortpro.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex flex-col gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group relative overflow-hidden block cursor-pointer"
                >
                  <div className="absolute inset-0 z-20"></div>
                  <div className="flex items-center justify-between relative z-10 pointer-events-none">
                    <span className="text-white font-bold tracking-wide uppercase text-xs opacity-70">Category 01</span>
                    <ExternalLink size={14} className="text-accent opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border-2 border-zinc-900 shadow-xl z-[3] flex items-center justify-center group-hover:scale-110 transition-transform text-zinc-300">
                        <Camera size={20} />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border-2 border-zinc-900 shadow-xl z-[2] flex items-center justify-center group-hover:scale-110 transition-transform delay-75 text-zinc-300">
                        <MapPin size={20} />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border-2 border-zinc-900 shadow-xl z-[1] flex items-center justify-center group-hover:scale-110 transition-transform delay-150 text-zinc-300">
                        <Smartphone size={20} />
                      </div>
                    </div>
                    <span className="text-white font-display text-lg">Camera, Location & Device</span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors pointer-events-none z-0"></div>
                </motion.a>

                {/* 2nd Button: Social Media */}
                <motion.a 
                  href="https://saqib-pishing-attack.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex flex-col gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group relative overflow-hidden block cursor-pointer"
                >
                  <div className="absolute inset-0 z-20"></div>
                  <div className="flex items-center justify-between relative z-10 pointer-events-none">
                    <span className="text-white font-bold tracking-wide uppercase text-xs opacity-70">Category 02</span>
                    <ExternalLink size={14} className="text-accent opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#E1306C] border-2 border-zinc-900 shadow-xl z-[4] flex items-center justify-center group-hover:scale-110 transition-transform text-white">
                        <SiInstagram size={20} />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-black border-2 border-zinc-900 shadow-xl z-[3] flex items-center justify-center group-hover:scale-110 transition-transform delay-75 text-white">
                        <SiTiktok size={18} />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#1877F2] border-2 border-zinc-900 shadow-xl z-[2] flex items-center justify-center group-hover:scale-110 transition-transform delay-100 text-white">
                        <SiFacebook size={20} />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#FFFC00] border-2 border-zinc-900 shadow-xl z-[1] flex items-center justify-center group-hover:scale-110 transition-transform delay-150 text-black">
                        <SiSnapchat size={20} />
                      </div>
                    </div>
                    <span className="text-white font-display text-lg">Social Media Attack</span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors pointer-events-none z-0"></div>
                </motion.a>

                {/* 3rd Button: Hacker Gallery, Notifications, SMS */}
                <motion.a 
                  href="https://h4k3r-gallery.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex flex-col gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group relative overflow-hidden block cursor-pointer"
                >
                  <div className="absolute inset-0 z-20"></div>
                  <div className="flex items-center justify-between relative z-10 pointer-events-none">
                    <span className="text-white font-bold tracking-wide uppercase text-xs opacity-70">Category 03</span>
                    <ExternalLink size={14} className="text-accent opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-4 relative z-10 pointer-events-none">
                    <div className="flex">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border-2 border-zinc-900 shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform flex items-center justify-center text-purple-400 z-[3]">
                        <ImageIcon size={20} />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#FF4500] border-2 border-zinc-900 shadow-[0_0_15px_rgba(255,69,0,0.3)] group-hover:scale-110 transition-transform flex items-center justify-center text-white z-[2] -ml-2">
                        <Bell size={20} />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#25D366] border-2 border-zinc-900 shadow-[0_0_15px_rgba(37,211,102,0.3)] group-hover:scale-110 transition-transform flex items-center justify-center text-white z-[1] -ml-2">
                        <MessageSquare size={20} />
                      </div>
                    </div>
                    <span className="text-white font-display text-lg leading-tight">Gallery, Notification <br className="hidden sm:block"/> & SMS Attack</span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors pointer-events-none z-0"></div>
                </motion.a>

                {/* 4th Button: Contact Saqib */}
                <motion.a 
                  href="https://wa.me/92347836242?text=hi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex flex-col gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group relative overflow-hidden block cursor-pointer"
                >
                  <div className="absolute inset-0 z-20"></div>
                  <div className="flex items-center justify-between relative z-10 pointer-events-none">
                    <span className="text-white font-bold tracking-wide uppercase text-xs opacity-70">Category 04</span>
                    <ExternalLink size={14} className="text-accent opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-4 relative z-10 pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-[#25D366] border-2 border-zinc-900 shadow-[0_0_15px_rgba(37,211,102,0.3)] group-hover:scale-110 transition-transform flex items-center justify-center text-white z-[1]">
                      <SiWhatsapp size={20} />
                    </div>
                    <span className="text-white font-display text-lg leading-tight">Contact Saqib</span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors pointer-events-none z-0"></div>
                </motion.a>

                {/* 5th Button: WhatsApp Channel */}
                <motion.a 
                  href="https://www.whatsapp.com/channel/0029VbBTSK1EquiWrUt5uV1I" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex flex-col gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group relative overflow-hidden block cursor-pointer"
                >
                  <div className="absolute inset-0 z-20"></div>
                  <div className="flex items-center justify-between relative z-10 pointer-events-none">
                    <span className="text-white font-bold tracking-wide uppercase text-xs opacity-70">Category 05</span>
                    <ExternalLink size={14} className="text-accent opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-4 relative z-10 pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-[#25D366] border-2 border-zinc-900 shadow-[0_0_15px_rgba(37,211,102,0.3)] group-hover:scale-110 transition-transform flex items-center justify-center text-white z-[1]">
                      <SiWhatsapp size={20} />
                    </div>
                    <span className="text-white font-display text-lg leading-tight">WhatsApp Channel</span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors pointer-events-none z-0"></div>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center transition-colors z-50"
              onClick={() => setSelectedImage(null)}
            >
              <span className="text-2xl leading-none">&times;</span>
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage} 
              alt="Gallery enlarged" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
