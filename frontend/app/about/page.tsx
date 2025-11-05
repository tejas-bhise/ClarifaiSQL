"use client";

import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Github, Linkedin, Download, Target, Lightbulb, Code2, Timer, Layers, Calendar as CalendarIcon, Heart, Sparkles, PenTool, Server, BrainCircuit, Database } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function useInView(threshold = 0.2, rootMargin = "0px") {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const refCallback = (node: HTMLDivElement) => {
    setRef(node);
  };

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return [refCallback, isInView] as const;
}

function AnimatedCounter({ end, duration = 1500, suffix = "", prefix = "" }: { 
  end: number, 
  duration?: number, 
  suffix?: string,
  prefix?: string 
}) {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView(0.5);

  useEffect(() => {
    if (!isInView) return;
    
    const startTime = Date.now();
    const steps = 50;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      const newCount = Math.round(easedProgress * end);
      setCount(newCount);
      
      currentStep++;
      
      if (progress < 1 && currentStep < steps) {
        setTimeout(updateCounter, stepDuration);
      } else {
        setCount(end);
      }
    };
    
    updateCounter();
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className="text-3xl font-bold text-primary">
      {prefix}{count}{suffix}
    </div>
  );
}

function TypingText({ text, speed = 100 }: { text: string, speed?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ref, isInView] = useInView(0.3);

  useEffect(() => {
    if (!isInView) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [isInView, currentIndex, text, speed]);

  return (
    <span ref={ref}>
      {displayText}
      {currentIndex < text.length && <span className="animate-pulse">|</span>}
    </span>
  );
}

function InteractiveParticles() {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({length: 30}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.id * 0.1}s`,
            animationDuration: `${particle.speed}s`
          }}
        />
      ))}
    </div>
  );
}

const achievementStats = [
  { label: 'Privacy', value: 100, suffix: '%', icon: ShieldCheckIcon, color: 'from-blue-400 to-cyan-500' },
  { label: 'Built & Deployed', value: 1, suffix: ' Week', icon: Timer, color: 'from-green-400 to-green-600' },
  { label: 'Features Built', value: 15, suffix: '+', icon: Layers, color: 'from-blue-400 to-blue-600' },
  { label: 'Live & Accessible', value: 24, suffix: '/7', icon: CalendarIcon, color: 'from-purple-400 to-purple-600' }
];

const milestones = [
  {
    date: "Sep 2025",
    title: "ClarifaiSQL Development",
    description: "Built AI-powered SQL generator with natural language processing as a learning project",
    icon: "🚀",
  },
  {
    date: "2024-2025", 
    title: "Learning AI & Development",
    description: "Exploring full-stack development and AI integration through hands-on projects",
    icon: "💻",
  },
  {
    date: "2023-2024",
    title: "Programming Foundations",
    description: "Started learning programming fundamentals and web technologies",
    icon: "👨‍💻",
  }
];

export default function AboutPage() {
  const [heroRef, heroInView] = useInView(0.1);
  const [timelineRef, timelineInView] = useInView(0.2);
  const [techRef, techInView] = useInView(0.2);

  const profileSrc = process.env.NEXT_PUBLIC_PROFILE_IMG || "/placeholder-avatar.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden relative">
      <InteractiveParticles />
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-10px) translateX(3px); }
            50% { transform: translateY(-20px) translateX(0px); }
            75% { transform: translateY(-10px) translateX(-3px); }
          }
          @keyframes glow-pulse {
            0%, 100% { 
              box-shadow: 0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3);
            }
            50% {
              box-shadow: 0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3);
            }
          }
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          .animate-spin-reverse {
            animation: spin-reverse 15s linear infinite;
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-glow {
            animation: glow-pulse 3s ease-in-out infinite;
          }
          .tech-card {
            animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .tech-card:nth-child(1) { animation-delay: 0.1s; }
          .tech-card:nth-child(2) { animation-delay: 0.2s; }
          .tech-card:nth-child(3) { animation-delay: 0.3s; }
          .tech-card:nth-child(4) { animation-delay: 0.4s; }
          .tech-card:nth-child(5) { animation-delay: 0.5s; }
        `
      }} />
      
      <div className="container mx-auto py-20 px-4 space-y-32 relative z-10">
        <section 
          ref={heroRef}
          className={`flex flex-col items-center text-center gap-16 transition-all duration-1000 ease-out ${
            heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="max-w-5xl space-y-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-primary border border-primary/20 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm animate-glow">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Student Developer & AI Enthusiast
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              <TypingText text="Learning Through" speed={150} />
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-teal-500 bg-clip-text text-transparent">
                <TypingText text="Building Projects" speed={150} />
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Engineering student passionate about creating AI-powered solutions. Learning by building real projects that solve 
              meaningful problems and exploring how technology can make complex tasks simpler.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-12 bg-gradient-to-r from-purple-600 via-blue-500 to-teal-500 rounded-full opacity-30 group-hover:opacity-60 animate-spin-slow blur-3xl transition-opacity duration-500"></div>
            <div className="absolute -inset-8 bg-gradient-to-r from-teal-500 via-purple-600 to-blue-500 rounded-full opacity-40 group-hover:opacity-70 animate-spin-reverse blur-2xl transition-opacity duration-500"></div>
            
            <div className="relative w-80 h-80 mx-auto">
              <div className="w-full h-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md rounded-full border-4 border-primary/30 shadow-2xl group-hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center p-8 animate-glow">
                <div className="relative mb-4 animate-float">
                  <img 
                    src={profileSrc}
                    alt="Tejas Bhise" 
                    width={120} 
                    height={120} 
                    className="w-30 h-30 rounded-full object-cover border-4 border-background shadow-2xl" 
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-3 border-background animate-bounce shadow-lg">
                    <Code2 className="w-5 h-5 text-white animate-pulse" />
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Tejas Bhise</h2>
                  <p className="text-primary font-semibold text-lg">Engineering Student</p>
                  <p className="text-sm text-muted-foreground leading-tight px-2">
                    Learning and building with passion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="transition-all duration-1000 ease-out delay-300">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {achievementStats.map((stat, index) => (
              <div 
                key={stat.label}
                className="relative group overflow-hidden flex"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-40 rounded-2xl blur-2xl transition-all duration-500 group-hover:animate-glow`}></div>
                
                <div className="relative text-center p-6 bg-card/80 backdrop-blur-md border-2 border-primary/20 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col w-full min-h-full group-hover:border-primary/60">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:animate-float transition-all duration-300 shadow-lg`}> 
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={1500} />
                  <p className="text-sm text-muted-foreground mt-2 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-12">
          <div className="relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-3xl group-hover:from-purple-500/40 group-hover:to-blue-500/40 transition-all duration-300 group-hover:animate-glow"></div>
            <div className="relative h-full p-8 bg-card/80 backdrop-blur-md border-2 border-primary/20 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col group-hover:border-primary/60">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:animate-float transition-all duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-6">My Learning Goal</h2>
              <div className="flex-1">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To master full-stack development and AI integration by building real projects. ClarifaiSQL is my exploration 
                  into making data analysis more accessible through natural language processing.
                </p>
              </div>
            </div>
          </div>

          <div className="relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-3xl blur-xl group-hover:blur-3xl group-hover:from-teal-500/40 group-hover:to-green-500/40 transition-all duration-300 group-hover:animate-glow"></div>
            <div className="relative h-full p-8 bg-card/80 backdrop-blur-md border-2 border-primary/20 rounded-3xl shadow-2xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col group-hover:border-primary/60">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:animate-float transition-all duration-300">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Learning Approach</h2>
              <div className="flex-1">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I believe in learning by doing. Each project teaches me something new about development, problem-solving, 
                  and how to build solutions that users actually want to use.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section 
          ref={timelineRef}
          className={`transition-all duration-1000 ease-out ${
            timelineInView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h2 className="text-4xl font-bold text-center mb-16">Learning Milestones</h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-500 via-blue-500 to-teal-500 rounded-full"></div>
            
            {milestones.map((milestone, index) => (
              <div 
                key={milestone.date}
                className={`relative flex items-center mb-16 ${index % 2 === 0 ? 'justify-start' : 'justify-end'} transition-all duration-700 ease-out ${
                  timelineInView ? 'opacity-100 translate-x-0' : `opacity-0 ${index % 2 === 0 ? 'translate-x-8' : '-translate-x-8'}`
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className={`w-5/12 p-6 bg-card/80 backdrop-blur-md border-2 border-primary/20 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group hover:border-primary/60 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className={`text-sm text-primary font-semibold mb-2 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    {milestone.date}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-card/90 backdrop-blur-md border-4 border-background rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-all duration-300 animate-float hover:animate-glow z-10">
                  {milestone.icon}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TECHNOLOGIES SECTION - CLEAN & SIMPLE */}
        <section ref={techRef} className="relative z-20">
          <div className="max-w-7xl mx-auto">
            {/* HEADER - CLEAN VERSION */}
            <div className="text-center mb-16 relative z-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Technologies Used in ClarifaiSQL
              </h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto text-lg">
                Built with modern, production-ready technologies for performance and scalability
              </p>
            </div>

            <div className="space-y-8">
              {/* ROW 1: 3 Cards with ROUNDED corners */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Frontend */}
                <div className="group relative overflow-hidden tech-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-[32px] blur-2xl group-hover:blur-3xl group-hover:from-blue-500/60 group-hover:to-cyan-500/60 transition-all duration-500 group-hover:animate-glow"></div>
                  
                  <Card className="relative p-8 text-center border-2 border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-cyan-950/30 backdrop-blur-xl hover:border-blue-500/80 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-3 group-hover:scale-105 rounded-[32px]">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-125 group-hover:rotate-12 group-hover:animate-float transition-all duration-300 group-hover:animate-glow relative z-10">
                      <PenTool className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    
                    <h3 className="font-black text-xl mb-2 text-white relative z-10">Frontend</h3>
                    <p className="text-blue-300 font-bold mb-3 text-sm relative z-10">Next.js 14, React 18, TypeScript</p>
                    <p className="text-xs text-muted-foreground group-hover:text-gray-200 transition-colors duration-300 leading-relaxed relative z-10">Modern React framework with App Router and type-safe development.</p>
                    
                    <div className="mt-6 pt-4 border-t border-blue-500/20 flex justify-center gap-2 flex-wrap relative z-10">
                      <div className="px-2 py-1 bg-blue-500/30 rounded-full text-xs text-blue-200 font-semibold group-hover:bg-blue-500/50 transition-all">Frontend</div>
                      <div className="px-2 py-1 bg-cyan-500/30 rounded-full text-xs text-cyan-200 font-semibold group-hover:bg-cyan-500/50 transition-all">Type-Safe</div>
                    </div>
                  </Card>
                </div>

                {/* UI/Styling */}
                <div className="group relative overflow-hidden tech-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-[32px] blur-2xl group-hover:blur-3xl group-hover:from-green-500/60 group-hover:to-emerald-500/60 transition-all duration-500 group-hover:animate-glow"></div>
                  
                  <Card className="relative p-8 text-center border-2 border-green-500/30 bg-gradient-to-br from-green-950/50 to-emerald-950/30 backdrop-blur-xl hover:border-green-500/80 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-3 group-hover:scale-105 rounded-[32px]">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-125 group-hover:rotate-12 group-hover:animate-float transition-all duration-300 group-hover:animate-glow relative z-10">
                      <Sparkles className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    
                    <h3 className="font-black text-xl mb-2 text-white relative z-10">UI/Styling</h3>
                    <p className="text-green-300 font-bold mb-3 text-sm relative z-10">Tailwind CSS, Heroicons, Lucide Icons</p>
                    <p className="text-xs text-muted-foreground group-hover:text-gray-200 transition-colors duration-300 leading-relaxed relative z-10">Responsive design system with gradient effects and animations.</p>
                    
                    <div className="mt-6 pt-4 border-t border-green-500/20 flex justify-center gap-2 flex-wrap relative z-10">
                      <div className="px-2 py-1 bg-green-500/30 rounded-full text-xs text-green-200 font-semibold group-hover:bg-green-500/50 transition-all">Styling</div>
                      <div className="px-2 py-1 bg-emerald-500/30 rounded-full text-xs text-emerald-200 font-semibold group-hover:bg-emerald-500/50 transition-all">Responsive</div>
                    </div>
                  </Card>
                </div>

                {/* Backend */}
                <div className="group relative overflow-hidden tech-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-[32px] blur-2xl group-hover:blur-3xl group-hover:from-purple-500/60 group-hover:to-violet-500/60 transition-all duration-500 group-hover:animate-glow"></div>
                  
                  <Card className="relative p-8 text-center border-2 border-purple-500/30 bg-gradient-to-br from-purple-950/50 to-violet-950/30 backdrop-blur-xl hover:border-purple-500/80 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-3 group-hover:scale-105 rounded-[32px]">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-125 group-hover:rotate-12 group-hover:animate-float transition-all duration-300 group-hover:animate-glow relative z-10">
                      <Server className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    
                    <h3 className="font-black text-xl mb-2 text-white relative z-10">Backend</h3>
                    <p className="text-purple-300 font-bold mb-3 text-sm relative z-10">FastAPI, Python 3.x</p>
                    <p className="text-xs text-muted-foreground group-hover:text-gray-200 transition-colors duration-300 leading-relaxed relative z-10">High-performance REST API with async support and auto-documentation.</p>
                    
                    <div className="mt-6 pt-4 border-t border-purple-500/20 flex justify-center gap-2 flex-wrap relative z-10">
                      <div className="px-2 py-1 bg-purple-500/30 rounded-full text-xs text-purple-200 font-semibold group-hover:bg-purple-500/50 transition-all">API</div>
                      <div className="px-2 py-1 bg-violet-500/30 rounded-full text-xs text-violet-200 font-semibold group-hover:bg-violet-500/50 transition-all">Async</div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* ROW 2: 2 Cards CENTERED */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                {/* Database */}
                <div className="group relative overflow-hidden tech-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-[32px] blur-2xl group-hover:blur-3xl group-hover:from-orange-500/60 group-hover:to-red-500/60 transition-all duration-500 group-hover:animate-glow"></div>
                  
                  <Card className="relative p-8 text-center border-2 border-orange-500/30 bg-gradient-to-br from-orange-950/50 to-red-950/30 backdrop-blur-xl hover:border-orange-500/80 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-3 group-hover:scale-105 rounded-[32px]">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-125 group-hover:rotate-12 group-hover:animate-float transition-all duration-300 group-hover:animate-glow relative z-10">
                      <Database className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    
                    <h3 className="font-black text-xl mb-2 text-white relative z-10">Database</h3>
                    <p className="text-orange-300 font-bold mb-3 text-sm relative z-10">SQLite , pandas</p>
                    <p className="text-xs text-muted-foreground group-hover:text-gray-200 transition-colors duration-300 leading-relaxed relative z-10">Dynamic table creation and SQL query execution.</p>
                    
                    <div className="mt-6 pt-4 border-t border-orange-500/20 flex justify-center gap-2 flex-wrap relative z-10">
                      <div className="px-2 py-1 bg-orange-500/30 rounded-full text-xs text-orange-200 font-semibold group-hover:bg-orange-500/50 transition-all">Data</div>
                      <div className="px-2 py-1 bg-red-500/30 rounded-full text-xs text-red-200 font-semibold group-hover:bg-red-500/50 transition-all">In-Memory</div>
                    </div>
                  </Card>
                </div>

                {/* AI/ML */}
                <div className="group relative overflow-hidden tech-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-[32px] blur-2xl group-hover:blur-3xl group-hover:from-pink-500/60 group-hover:to-rose-500/60 transition-all duration-500 group-hover:animate-glow"></div>
                  
                  <Card className="relative p-8 text-center border-2 border-pink-500/30 bg-gradient-to-br from-pink-950/50 to-rose-950/30 backdrop-blur-xl hover:border-pink-500/80 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-3 group-hover:scale-105 rounded-[32px]">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-125 group-hover:rotate-12 group-hover:animate-float transition-all duration-300 group-hover:animate-glow relative z-10">
                      <BrainCircuit className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    
                    <h3 className="font-black text-xl mb-2 text-white relative z-10">AI/ML</h3>
                    <p className="text-pink-300 font-bold mb-3 text-sm relative z-10">Google Gemini 1.5 Flash, NLP</p>
                    <p className="text-xs text-muted-foreground group-hover:text-gray-200 transition-colors duration-300 leading-relaxed relative z-10">Natural language to SQL conversion with structured JSON output.</p>
                    
                    <div className="mt-6 pt-4 border-t border-pink-500/20 flex justify-center gap-2 flex-wrap relative z-10">
                      <div className="px-2 py-1 bg-pink-500/30 rounded-full text-xs text-pink-200 font-semibold group-hover:bg-pink-500/50 transition-all">AI</div>
                      <div className="px-2 py-1 bg-rose-500/30 rounded-full text-xs text-rose-200 font-semibold group-hover:bg-rose-500/50 transition-all">NLP</div>
                      <div className="px-2 py-1 bg-fuchsia-500/30 rounded-full text-xs text-fuchsia-200 font-semibold group-hover:bg-fuchsia-500/50 transition-all">GenAI</div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-teal-600/10 rounded-3xl blur-3xl animate-glow"></div>
          
          <div className="relative max-w-5xl mx-auto p-12 bg-card/90 backdrop-blur-md rounded-3xl border-2 border-primary/30 shadow-2xl hover:shadow-3xl hover:border-primary/60 transition-all">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center animate-pulse shadow-lg animate-glow">
                <Heart className="w-8 h-8 text-white animate-float" />
              </div>
              <h2 className="text-4xl font-bold">Let's Connect & Learn Together</h2>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              I'm always eager to learn from other developers and share my journey. Whether you want to discuss projects, 
              share learning resources, or connect with a fellow student — I'd love to hear from you!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button asChild variant="outline" size="lg" className="group hover:scale-110 transition-all duration-300 hover:bg-primary/10 hover:border-primary/60 hover:-translate-y-1">
                <Link href="https://github.com/tejas-bhise">
                  <Github className="mr-3 h-5 w-5 group-hover:rotate-12 group-hover:scale-125 transition-all duration-300" />
                  GitHub Profile
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="group hover:scale-110 transition-all duration-300 hover:bg-primary/10 hover:border-primary/60 hover:-translate-y-1">
                <Link href="https://www.linkedin.com/in/tejas-bhise-670bbb24b">
                  <Linkedin className="mr-3 h-5 w-5 group-hover:rotate-12 group-hover:scale-125 transition-all duration-300" />
                  LinkedIn
                </Link>
              </Button>
              
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white border-0 hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-2xl group hover:-translate-y-1 hover:animate-glow">
                <Link href="https://drive.google.com/file/d/1Vijqz_1bntMOdgBbed3ZqEi9wCvR4vXd/view?usp=drivesdk">
                  <Download className="mr-3 h-5 w-5 group-hover:animate-bounce" />
                  View Resume
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="p-4 bg-muted/50 rounded-2xl hover:bg-muted/80 transition-all hover:scale-105 hover:shadow-lg">
                <div className="text-2xl mb-2">🎓</div>
                <p className="text-sm font-medium">Engineering Student</p>
                <p className="text-xs text-muted-foreground">Final year, learning through projects</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-2xl hover:bg-muted/80 transition-all hover:scale-105 hover:shadow-lg">
                <div className="text-2xl mb-2">💻</div>
                <p className="text-sm font-medium">Student Developer</p>
                <p className="text-xs text-muted-foreground">Building projects to learn and grow</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-2xl hover:bg-muted/80 transition-all hover:scale-105 hover:shadow-lg">
                <div className="text-2xl mb-2">🚀</div>
                <p className="text-sm font-medium">Learning AI</p>
                <p className="text-xs text-muted-foreground">Exploring NLP and intelligent systems</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
