"use client";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Github, Linkedin, FileText, Rocket, Target, PenTool, Server, Database as DatabaseIcon, BrainCircuit, CheckCircle, Heart, Coffee, Zap, Star, Award, Users, Calendar, MapPin, Mail, Phone, Globe, Download, ExternalLink, Sparkles, Code2, Trophy, Clock, TrendingUp, BookOpen, Lightbulb, Timer, Layers, Brain, Calendar as CalendarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

// Custom hook for intersection observer
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

// Enhanced animated counter
function AnimatedCounter({ end, duration = 2000, suffix = "", prefix = "" }: { 
    end: number, 
    duration?: number, 
    suffix?: string,
    prefix?: string 
}) {
    const [count, setCount] = useState(0);
    const [ref, isInView] = useInView(0.5);

    useEffect(() => {
        if (!isInView) return;

        let startTime: number;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isInView, end, duration]);

    return (
        <div ref={ref} className="text-3xl font-bold text-primary">
            {prefix}{count}{suffix}
        </div>
    );
}

// Typing animation effect for specific text
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

// Interactive floating particles
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

const techStack = [
    { 
        name: 'Frontend', 
        tools: 'Next.js, React, TailwindCSS', 
        icon: PenTool,
        color: 'from-blue-500 to-cyan-400',
        description: 'Modern React ecosystem with beautiful styling'
    },
    { 
        name: 'Backend', 
        tools: 'FastAPI, Python', 
        icon: Server,
        color: 'from-green-500 to-emerald-400',
        description: 'High-performance API development'
    },
    { 
        name: 'Database', 
        tools: 'SQLite', 
        icon: DatabaseIcon,
        color: 'from-purple-500 to-violet-400',
        description: 'Reliable data storage and optimization'
    },
    { 
        name: 'AI/ML', 
        tools: 'NLP, Gemini API', 
        icon: BrainCircuit,
        color: 'from-orange-500 to-red-400',
        description: 'Intelligent language processing'
    }
];

// Corrected achievement stats with honest numbers
const achievementStats = [
    { label: 'Coffee Consumed', value: 100, suffix: '+', icon: Coffee, color: 'from-amber-400 to-orange-500' },
    { label: 'Built & Deployed', value: 1, suffix: ' Week', icon: Timer, color: 'from-green-400 to-green-600' },
    { label: 'Features Built', value: 25, suffix: '+', icon: Layers, color: 'from-blue-400 to-blue-600' },
    { label: 'Days Coding', value: 7, suffix: ' Days', icon: CalendarIcon, color: 'from-purple-400 to-purple-600' }
];

// Honest milestones - removed false statements
const milestones = [
    {
        date: "2024",
        title: "ClarifaiSQL Development",
        description: "Built and launched AI-powered SQL generator as a learning project",
        icon: "🚀",
        color: "bg-green-500"
    },
    {
        date: "2023-2024",
        title: "AI & Web Development",
        description: "Learning and experimenting with NLP and full-stack development",
        icon: "💻",
        color: "bg-blue-500"
    },
    {
        date: "2022-2023",
        title: "Programming Journey",
        description: "Started learning web development and programming fundamentals",
        icon: "👨‍💻",
        color: "bg-purple-500"
    }
];

export default function AboutPage() {
    const [heroRef, heroInView] = useInView(0.1);
    const [timelineRef, timelineInView] = useInView(0.2);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden relative">
            {/* Interactive Background */}
            <InteractiveParticles />
            
            {/* Custom CSS for animations */}
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
                    .animate-spin-slow {
                        animation: spin-slow 20s linear infinite;
                    }
                    .animate-spin-reverse {
                        animation: spin-reverse 15s linear infinite;
                    }
                `
            }} />
            
            <div className="container mx-auto py-20 px-4 space-y-32 relative z-10">
                {/* Enhanced Hero Section with Typing Animation */}
                <section 
                    ref={heroRef}
                    className={`flex flex-col items-center text-center gap-16 transition-all duration-1000 ease-out ${
                        heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                    }`}
                >
                    <div className="max-w-5xl space-y-8">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-primary border border-primary/20 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            Full-Stack Developer & AI Enthusiast
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                            <TypingText text="Transforming Ideas into" speed={150} />
                            <br />
                            <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-teal-500 bg-clip-text text-transparent">
                                <TypingText text="Digital Reality" speed={150} />
                            </span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                            Passionate about creating intelligent solutions that bridge the gap between complex data and human understanding. 
                            Currently exploring how AI can make database interactions more intuitive through natural language processing.
                        </p>
                    </div>

                    {/* Enhanced Profile Section */}
                    <div className="relative group">
                        {/* Animated rings */}
                        <div className="absolute -inset-12 bg-gradient-to-r from-purple-600 via-blue-500 to-teal-500 rounded-full opacity-30 group-hover:opacity-60 animate-spin-slow blur-2xl transition-opacity duration-500"></div>
                        <div className="absolute -inset-8 bg-gradient-to-r from-teal-500 via-purple-600 to-blue-500 rounded-full opacity-40 group-hover:opacity-70 animate-spin-reverse blur-xl transition-opacity duration-500"></div>
                        
                        <div className="relative w-80 h-80 mx-auto">
                            <div className="w-full h-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md rounded-full border-4 border-primary/30 shadow-2xl group-hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center p-8">
                                <div className="relative mb-4">
                                    <Image 
                                        src="/Tejas.jpg" 
                                        alt="Tejas Bhise" 
                                        width={120} 
                                        height={120} 
                                        className="w-30 h-30 rounded-full object-cover border-4 border-background shadow-2xl" 
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-3 border-background animate-bounce">
                                        <Code2 className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-foreground">Tejas Bhise</h2>
                                    <p className="text-primary font-semibold text-lg">Student Developer</p>
                                    <p className="text-sm text-muted-foreground leading-tight px-2">
                                        Learning and building with passion
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Corrected Achievement Stats */}
                <section className="transition-all duration-1000 ease-out delay-300">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {achievementStats.map((stat, index) => (
                            <div 
                                key={stat.label}
                                className="relative group overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-all duration-300`}></div>
                                
                                <div className="relative text-center p-6 bg-card/80 backdrop-blur-md border-2 border-primary/20 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                                    <p className="text-sm text-muted-foreground mt-2 font-medium">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Fixed Mission & Vision - Equal Sizes */}
                <section className="grid md:grid-cols-2 gap-12">
                    <div className="relative group h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                        <div className="relative h-full p-8 bg-card/80 backdrop-blur-md border-2 border-primary/20 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-6">My Goal</h2>
                            <div className="flex-1">
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    To make data more accessible to everyone. Through ClarifaiSQL, I'm exploring how natural language can simplify database interactions, making complex data queries as easy as asking a question.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                        <div className="relative h-full p-8 bg-card/80 backdrop-blur-md border-2 border-primary/20 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <Lightbulb className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-6">Learning Journey</h2>
                            <div className="flex-1">
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    As a student passionate about technology, I'm constantly learning and experimenting with new tools and frameworks. Each project is an opportunity to grow and improve my skills.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Honest Timeline */}
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
                                <div className={`w-5/12 p-6 bg-card/80 backdrop-blur-md border-2 border-primary/20 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                    <div className={`text-sm text-primary font-semibold mb-2 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                        {milestone.date}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                                    <p className="text-muted-foreground">{milestone.description}</p>
                                </div>
                                
                                <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-card/90 backdrop-blur-md border-4 border-background rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform duration-300">
                                    {milestone.icon}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tech Stack */}
                <section>
                    <h2 className="text-4xl font-bold text-center mb-16">Technologies I Use</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {techStack.map((tech, index) => (
                            <div
                                key={tech.name}
                                className="group relative overflow-hidden"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${tech.color} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-all duration-500`}></div>
                                
                                <Card className="relative p-8 text-center hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 border-2 border-primary/20 bg-card/80 backdrop-blur-md h-full">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${tech.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                        <tech.icon className="w-8 h-8 text-white" />
                                    </div>
                                    
                                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors duration-300">{tech.name}</h3>
                                    <p className="text-primary font-semibold mb-3 text-sm">{tech.tools}</p>
                                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">{tech.description}</p>
                                </Card>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact & CTA */}
                <section className="text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-teal-600/10 rounded-3xl blur-3xl"></div>
                    
                    <div className="relative max-w-5xl mx-auto p-12 bg-card/90 backdrop-blur-md rounded-3xl border-2 border-primary/30 shadow-2xl">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center animate-pulse">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-bold">Let's Connect & Learn Together</h2>
                        </div>
                        
                        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                            I'm always eager to learn from others and share my experiences. Whether you want to discuss projects, share learning resources, or just connect with a fellow developer — I'd love to hear from you!
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <Button asChild variant="outline" size="lg" className="group hover:scale-105 transition-all duration-300 hover:bg-primary/10">
                                <Link href="https://github.com/tejas-bhise">
                                    <Github className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                                    GitHub Profile
                                </Link>
                            </Button>
                            
                            <Button asChild variant="outline" size="lg" className="group hover:scale-105 transition-all duration-300 hover:bg-primary/10">
                                <Link href="https://www.linkedin.com/in/tejas-bhise-670bbb24b">
                                    <Linkedin className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                                    LinkedIn
                                </Link>
                            </Button>
                            
                            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white border-0 hover:scale-105 transition-all duration-300 shadow-xl group">
                                <Link href="https://drive.google.com/file/d/1Vijqz_1bntMOdgBbed3ZqEi9wCvR4vXd/view?usp=drivesdk">
                                    <Download className="mr-3 h-5 w-5 group-hover:animate-bounce" />
                                    View Resume
                                </Link>
                            </Button>
                        </div>

                        {/* Fun Facts */}
                        <div className="grid md:grid-cols-3 gap-6 mt-8">
                            <div className="p-4 bg-muted/50 rounded-2xl">
                                <div className="text-2xl mb-2">🎓</div>
                                <p className="text-sm font-medium">Engineering Student</p>
                                <p className="text-xs text-muted-foreground">Final year, passionate about tech</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl">
                                <div className="text-2xl mb-2">💡</div>
                                <p className="text-sm font-medium">Always Learning</p>
                                <p className="text-xs text-muted-foreground">Exploring AI and full-stack development</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl">
                                <div className="text-2xl mb-2">🚀</div>
                                <p className="text-sm font-medium">Building Projects</p>
                                <p className="text-xs text-muted-foreground">Learning by doing</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
