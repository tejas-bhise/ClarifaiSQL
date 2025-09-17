"use client";

import { CheckCircle, FilePlus, PieChart, Database, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

// Define proper types
interface RoadmapPhase {
    status: string;
    color: string;
    title: string;
    description: string;
    icon: LucideIcon;
}

interface PhaseStyle {
    dot: string;
    text: string;
    bg: string;
    border: string;
    glow: string;
}

const roadmapPhases: RoadmapPhase[] = [
    {
        status: 'TODAY',
        color: 'green',
        title: 'MVP Launch',
        description: 'Core functionality is live: Upload CSV, ask questions, and get SQL queries with explanations and direct answers.',
        icon: CheckCircle,
    },
    {
        status: 'SOON',
        color: 'yellow',
        title: 'Expanded Data Sources',
        description: 'Adding support for Excel files and direct connections to Google Sheets to increase data import flexibility.',
        icon: FilePlus,
    },
    {
        status: 'NEXT',
        color: 'blue',
        title: 'Rich Visualizations',
        description: 'Introducing visual dashboards with interactive charts and graphs for deeper, more intuitive analysis.',
        icon: PieChart,
    },
    {
        status: 'FUTURE',
        color: 'purple',
        title: 'Multi-Database Support',
        description: 'Connect directly to multiple database types like MySQL, PostgreSQL, and SQLite for enterprise-level use.',
        icon: Database,
    },
    {
        status: 'VISION',
        color: 'pink',
        title: 'All-in-One AI Data Assistant',
        description: 'The ultimate goal: a comprehensive platform to upload, analyze, visualize, and share insights seamlessly with your team.',
        icon: Rocket,
    }
];

const phaseStyles: Record<string, PhaseStyle> = {
    green: { 
        dot: 'bg-green-500', 
        text: 'text-green-400', 
        bg: 'bg-green-500/10', 
        border: 'border-green-500/30', 
        glow: 'shadow-green-500/25' 
    },
    yellow: { 
        dot: 'bg-yellow-500', 
        text: 'text-yellow-400', 
        bg: 'bg-yellow-500/10', 
        border: 'border-yellow-500/30', 
        glow: 'shadow-yellow-500/25' 
    },
    blue: { 
        dot: 'bg-blue-500', 
        text: 'text-blue-400', 
        bg: 'bg-blue-500/10', 
        border: 'border-blue-500/30', 
        glow: 'shadow-blue-500/25' 
    },
    purple: { 
        dot: 'bg-purple-500', 
        text: 'text-purple-400', 
        bg: 'bg-purple-500/10', 
        border: 'border-purple-500/30', 
        glow: 'shadow-purple-500/25' 
    },
    pink: { 
        dot: 'bg-pink-500', 
        text: 'text-pink-400', 
        bg: 'bg-pink-500/10', 
        border: 'border-pink-500/30', 
        glow: 'shadow-pink-500/25' 
    },
};

// Custom hook for intersection observer
function useInView(threshold = 0.2): [React.RefCallback<HTMLDivElement>, boolean] {
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
                    observer.unobserve(ref);
                }
            },
            { threshold }
        );

        observer.observe(ref);

        return () => observer.disconnect();
    }, [ref, threshold]);

    return [refCallback, isInView];
}

// Animated roadmap item component props interface
interface RoadmapItemProps {
    phase: RoadmapPhase;
    index: number;
    delay: number;
}

function RoadmapItem({ phase, index, delay }: RoadmapItemProps) {
    const [ref, isInView] = useInView(0.3);
    const IconComponent = phase.icon;
    const styles = phaseStyles[phase.color];

    return (
        <div 
            ref={ref}
            className={`relative flex items-start gap-6 transition-all duration-700 ease-out ${
                isInView 
                    ? 'opacity-100 translate-x-0 translate-y-0' 
                    : 'opacity-0 translate-x-8 translate-y-4'
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Timeline dot with animation */}
            <div className={`flex-shrink-0 w-14 h-14 rounded-full ${styles.dot} flex items-center justify-center ring-4 ring-background z-10 border-3 border-background shadow-lg transition-all duration-500 ${
                isInView ? 'scale-100' : 'scale-50'
            }`}>
                <IconComponent className="w-7 h-7 text-white" />
            </div>

            {/* Content card */}
            <div className={`flex-1 pt-1 transition-all duration-500 ${
                isInView ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
            }`}
            style={{ transitionDelay: `${delay + 200}ms` }}>
                {/* Status badge */}
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${styles.bg} ${styles.border} border ${styles.text} backdrop-blur-sm`}>
                    {phase.status}
                </div>

                {/* Content card with borders */}
                <div className={`relative bg-card/80 backdrop-blur-md border-2 ${styles.border} rounded-2xl p-6 shadow-xl hover:shadow-2xl ${styles.glow} transition-all duration-300 hover:-translate-y-1 group`}>
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 ${styles.bg} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {phase.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                        {phase.description}
                    </p>

                    {/* Bottom accent line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${styles.dot} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                </div>
            </div>
        </div>
    );
}

export default function RoadmapPage() {
    const [headerRef, headerInView] = useInView(0.1);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto py-20 px-4">
                {/* Animated header */}
                <div 
                    ref={headerRef}
                    className={`text-center mb-20 transition-all duration-1000 ease-out ${
                        headerInView 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-8'
                    }`}
                >
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
                        <Rocket className="w-4 h-4" />
                        Development Roadmap
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        The Road Ahead for{" "}
                        <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-teal-500 bg-clip-text text-transparent">
                            ClarifaiSQL
                        </span>
                    </h1>
                    
                    <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        We're just getting started. Here's a look at what's coming next.
                    </p>
                </div>

                {/* Roadmap timeline */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Animated vertical timeline */}
                    <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-border"></div>

                    {/* Roadmap items */}
                    <div className="space-y-16">
                        {roadmapPhases.map((phase, index) => (
                            <RoadmapItem
                                key={phase.title}
                                phase={phase}
                                index={index}
                                delay={index * 150}
                            />
                        ))}
                    </div>

                    {/* Bottom glow effect */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                </div>

                {/* Call to action */}
                <div className="mt-24 text-center">
                    <div className="bg-card/80 backdrop-blur-md border-2 border-primary/20 rounded-3xl p-10 max-w-2xl mx-auto shadow-2xl">
                        <h3 className="text-2xl font-bold mb-4">Join Our Journey</h3>
                        <p className="text-muted-foreground mb-6">
                            Be part of the future of data analysis. Your feedback shapes our roadmap.
                        </p>
                        <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                            Share Feedback
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
