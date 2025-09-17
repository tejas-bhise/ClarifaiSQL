"use client";

import { UploadCloud, HelpCircle, Bot, FileText, CheckCircle, Sparkles, Zap } from "lucide-react";
import { useRouter } from 'next/navigation';

const steps = [
    { 
        icon: UploadCloud, 
        title: 'Upload Your Dataset', 
        description: 'Drag & drop your CSV file. Secure, fast, and never stored permanently. Your data privacy is our top priority.',
        highlight: '📁 Secure Upload',
        gradient: 'from-blue-500 to-cyan-400',
        bgGradient: 'from-blue-500/10 to-cyan-400/10',
        borderGradient: 'from-blue-500/30 to-cyan-400/30'
    },
    { 
        icon: HelpCircle, 
        title: 'Ask in Plain English', 
        description: 'Type your question naturally - no technical knowledge needed! Just ask what you want to know about your data.',
        highlight: '🗣️ Natural Language',
        gradient: 'from-green-500 to-emerald-400',
        bgGradient: 'from-green-500/10 to-emerald-400/10',
        borderGradient: 'from-green-500/30 to-emerald-400/30'
    },
    { 
        icon: Bot, 
        title: 'AI Generates SQL', 
        description: 'Our intelligent AI instantly converts your question into perfect SQL queries with advanced optimization.',
        highlight: '🤖 AI Powered',
        gradient: 'from-purple-500 to-violet-400',
        bgGradient: 'from-purple-500/10 to-violet-400/10',
        borderGradient: 'from-purple-500/30 to-violet-400/30'
    },
    { 
        icon: FileText, 
        title: 'Get Clear Explanations', 
        description: 'Understand exactly what the query does with detailed step-by-step breakdowns and clear documentation.',
        highlight: '📖 Easy to Understand',
        gradient: 'from-orange-500 to-yellow-400',
        bgGradient: 'from-orange-500/10 to-yellow-400/10',
        borderGradient: 'from-orange-500/30 to-yellow-400/30'
    },
    { 
        icon: CheckCircle, 
        title: 'Receive Instant Results', 
        description: 'Get your answers immediately with beautiful, actionable insights and comprehensive data visualizations.',
        highlight: '⚡ Instant Results',
        gradient: 'from-pink-500 to-rose-400',
        bgGradient: 'from-pink-500/10 to-rose-400/10',
        borderGradient: 'from-pink-500/30 to-rose-400/30'
    }
];

export default function HowItWorksPage() {
    const router = useRouter();

    const handleStartTrial = () => {
        router.push('/ai-tool');
    };

    return (
        <div className="container mx-auto py-20 px-4">
            {/* Header */}
            <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-full text-sm font-medium mb-8">
                    <Sparkles className="w-4 h-4" />
                    Simple & Powerful Process
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
                    How <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">It Works</span>
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Transform your data questions into insights in just <span className="font-bold text-primary">30 seconds</span>
                </p>
            </div>

            {/* Steps with perfect alignment */}
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-5 gap-6 relative">
                    {/* Connecting line - positioned exactly at badge center */}
                    <div className="hidden lg:block absolute top-[214px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-0"></div>

                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        
                        return (
                            <div key={index} className="relative group">
                                {/* Step Card */}
                                <div className="relative h-[440px]">
                                    {/* Glowing background */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-15 rounded-3xl blur-xl transition-opacity duration-500`}></div>
                                    
                                    <div className={`relative bg-card border-2 border-border group-hover:border-opacity-60 rounded-3xl p-6 h-full flex flex-col transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 backdrop-blur-sm`}>
                                        
                                        {/* Icon section: 24px padding + 80px icon + 24px margin = 128px total */}
                                        <div className="flex justify-center mb-6 relative z-10">
                                            <div className={`w-20 h-20 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <IconComponent className="w-10 h-10 text-white" />
                                            </div>
                                        </div>
                                        
                                        {/* Title section: 60px height + 16px margin = 76px total */}
                                        <div className="text-center mb-4">
                                            <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors h-[60px] flex items-center justify-center">
                                                {step.title}
                                            </h3>
                                        </div>
                                        
                                        {/* Highlight badge - CENTER POINT: 128px + 76px + 10px (half badge) = 214px */}
                                        <div className="flex justify-center mb-6 relative z-20">
                                            <div className={`inline-block px-4 py-2 bg-gradient-to-r ${step.bgGradient} border border-primary/20 rounded-full text-xs font-medium text-foreground whitespace-nowrap group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                                                {step.highlight}
                                            </div>
                                        </div>
                                        
                                        {/* Description */}
                                        <div className="flex-1 flex items-start justify-center text-center mb-6">
                                            <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                                                {step.description}
                                            </p>
                                        </div>
                                        
                                        {/* Bottom accent */}
                                        <div className={`h-1.5 bg-gradient-to-r ${step.gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CTA Section */}
            <div className="mt-24 text-center">
                <div className="bg-card border-2 border-border rounded-3xl p-10 md:p-16 max-w-5xl mx-auto relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <Zap className="w-10 h-10 text-primary" />
                            <h3 className="text-3xl lg:text-4xl font-bold">Ready to Experience the Magic?</h3>
                        </div>
                        
                        <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Transform your data into actionable insights without writing a single line of code. See how easy data analysis can be!
                        </p>
                        
                        <div className="flex justify-center">
                            <button 
                                onClick={handleStartTrial}
                                className="group px-12 py-5 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <span className="flex items-center gap-3">
                                    Start Free Trial
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
                            <div className="flex items-center gap-3 bg-muted/40 border border-border/50 rounded-xl py-3 px-6 text-sm font-medium">
                                <span className="text-green-500 text-lg">✅</span>
                                <span className="text-foreground">No Credit Card</span>
                            </div>
                            <div className="flex items-center gap-3 bg-muted/40 border border-border/50 rounded-xl py-3 px-6 text-sm font-medium">
                                <span className="text-blue-500 text-lg">⚡</span>
                                <span className="text-foreground">30 Second Setup</span>
                            </div>
                            <div className="flex items-center gap-3 bg-muted/40 border border-border/50 rounded-xl py-3 px-6 text-sm font-medium">
                                <span className="text-yellow-500 text-lg">🔒</span>
                                <span className="text-foreground">100% Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
