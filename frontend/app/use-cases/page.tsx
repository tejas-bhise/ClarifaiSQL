"use client";

import { Zap, Users, BarChart3, Target, Wrench, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";

const useCases = [
    {
        id: 'sales',
        icon: Zap,
        industry: 'Sales', 
        query: 'Which region sold the most in Q3?', 
        benefit: 'Instant revenue insights',
        description: 'Analyze sales performance across regions, products, and time periods to identify growth opportunities and revenue trends.',
        gradient: 'from-yellow-500 to-orange-500',
        color: '#F59E0B'
    },
    { 
        id: 'hr',
        icon: Users,
        industry: 'HR', 
        query: 'How many employees joined last year?', 
        benefit: 'Faster HR reporting',
        description: 'Track employee metrics, retention rates, and workforce analytics for strategic planning and better decision making.',
        gradient: 'from-blue-500 to-cyan-500',
        color: '#3B82F6'
    },
    { 
        id: 'finance',
        icon: BarChart3,
        industry: 'Finance', 
        query: 'What are the monthly expense trends?', 
        benefit: 'Smarter budgeting',
        description: 'Monitor expenses, budget variance, and financial KPIs to optimize business operations and financial planning.',
        gradient: 'from-green-500 to-emerald-500',
        color: '#10B981'
    },
    { 
        id: 'marketing',
        icon: Target,
        industry: 'Marketing', 
        query: 'Which campaign had the highest ROI?', 
        benefit: 'Optimize ad spend',
        description: 'Measure campaign effectiveness, customer acquisition costs, and marketing ROI to maximize your marketing budget.',
        gradient: 'from-pink-500 to-rose-500',
        color: '#EC4899'
    },
    { 
        id: 'operations',
        icon: Wrench,
        industry: 'Operations', 
        query: 'What is the average order processing time?', 
        benefit: 'Identify bottlenecks',
        description: 'Streamline operations by analyzing process efficiency and identifying improvement areas for better productivity.',
        gradient: 'from-purple-500 to-violet-500',
        color: '#8B5CF6'
    },
    { 
        id: 'support',
        icon: MessageCircle,
        industry: 'Support', 
        query: 'What are the most common support ticket topics?', 
        benefit: 'Improve customer service',
        description: 'Analyze support patterns, resolution times, and customer satisfaction metrics to enhance service quality.',
        gradient: 'from-indigo-500 to-blue-500',
        color: '#6366F1'
    },
];

export default function UseCasesPage() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="container mx-auto py-20 px-4">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-full text-sm font-medium mb-8">
                    <Sparkles className="w-4 h-4" />
                    Interactive Use Cases
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
                    Powerful <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Use Cases</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Hover over each department to see how AI transforms their data analysis workflow
                </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-16 max-w-7xl mx-auto">
                {/* Perfect Circle Chart - FIXED HOVER */}
                <div className="relative">
                    <div className="w-96 h-96 lg:w-[450px] lg:h-[450px] relative">
                        <svg className="w-full h-full" viewBox="0 0 400 400">
                            {useCases.map((useCase, index) => {
                                const IconComponent = useCase.icon;
                                const isHovered = hoveredIndex === index;
                                const totalSegments = useCases.length;
                                const segmentAngle = 360 / totalSegments;
                                const startAngle = index * segmentAngle - 90; // -90 to start from top
                                const endAngle = (index + 1) * segmentAngle - 90;
                                
                                const outerRadius = isHovered ? 185 : 170;
                                const innerRadius = 70; // Reduced inner radius - no more black ring
                                const centerX = 200;
                                const centerY = 200;
                                
                                // Calculate path coordinates
                                const startAngleRad = (startAngle * Math.PI) / 180;
                                const endAngleRad = (endAngle * Math.PI) / 180;
                                
                                const x1 = centerX + innerRadius * Math.cos(startAngleRad);
                                const y1 = centerY + innerRadius * Math.sin(startAngleRad);
                                const x2 = centerX + outerRadius * Math.cos(startAngleRad);
                                const y2 = centerY + outerRadius * Math.sin(startAngleRad);
                                const x3 = centerX + outerRadius * Math.cos(endAngleRad);
                                const y3 = centerY + outerRadius * Math.sin(endAngleRad);
                                const x4 = centerX + innerRadius * Math.cos(endAngleRad);
                                const y4 = centerY + innerRadius * Math.sin(endAngleRad);
                                
                                const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                                
                                const pathData = [
                                    `M ${x1} ${y1}`,
                                    `L ${x2} ${y2}`,
                                    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
                                    `L ${x4} ${y4}`,
                                    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
                                    `Z`
                                ].join(' ');
                                
                                // Label position (middle of the segment)
                                const labelAngle = (startAngle + endAngle) / 2;
                                const labelAngleRad = (labelAngle * Math.PI) / 180;
                                const labelRadius = (outerRadius + innerRadius) / 2;
                                const labelX = centerX + labelRadius * Math.cos(labelAngleRad);
                                const labelY = centerY + labelRadius * Math.sin(labelAngleRad);
                                
                                return (
                                    <g key={useCase.id}>
                                        {/* FIXED: Added pointer events and proper hover handling */}
                                        <path
                                            d={pathData}
                                            fill={useCase.color}
                                            className={`cursor-pointer transition-all duration-300 ${
                                                isHovered 
                                                    ? 'opacity-100 drop-shadow-xl' 
                                                    : hoveredIndex !== null 
                                                        ? 'opacity-40' 
                                                        : 'opacity-90 hover:opacity-100'
                                            }`}
                                            style={{ pointerEvents: 'all' }}
                                            onMouseEnter={() => setHoveredIndex(index)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        />
                                        
                                        {/* Icon */}
                                        <g 
                                            transform={`translate(${labelX - 12}, ${labelY - 20})`}
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            <foreignObject width="24" height="24">
                                                <IconComponent className="w-6 h-6 text-white drop-shadow-lg" />
                                            </foreignObject>
                                        </g>
                                        
                                        {/* Label */}
                                        <text
                                            x={labelX}
                                            y={labelY + 12}
                                            textAnchor="middle"
                                            className="fill-white font-bold text-sm drop-shadow-lg"
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {useCase.industry}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Center Circle - REMOVED BLACK RING */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-20 h-20 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center shadow-xl">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Panel */}
                <div className="flex-1 max-w-xl">
                    {hoveredIndex !== null ? (
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl transform transition-all duration-500 animate-in slide-in-from-right">
                            {(() => {
                                const activeUseCase = useCases[hoveredIndex];
                                const IconComponent = activeUseCase.icon;
                                
                                return (
                                    <>
                                        {/* Header */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`p-4 bg-gradient-to-r ${activeUseCase.gradient} rounded-2xl shadow-lg`}>
                                                <IconComponent className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-bold text-foreground">{activeUseCase.industry}</h3>
                                                <div className={`w-20 h-1 bg-gradient-to-r ${activeUseCase.gradient} rounded-full mt-2`}></div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-6">
                                            {/* Sample Query */}
                                            <div className="bg-muted/60 rounded-xl p-5 border-l-4 border-l-primary">
                                                <h4 className="font-bold text-primary mb-3 text-sm uppercase tracking-wide">Sample Query</h4>
                                                <p className="text-muted-foreground italic text-lg leading-relaxed">
                                                    "{activeUseCase.query}"
                                                </p>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <h4 className="font-bold text-primary mb-3 text-sm uppercase tracking-wide">How It Works</h4>
                                                <p className="text-foreground leading-relaxed text-base">
                                                    {activeUseCase.description}
                                                </p>
                                            </div>

                                            {/* Benefit */}
                                            <div className={`p-5 bg-gradient-to-r ${activeUseCase.gradient}/10 rounded-xl border-2 border-primary/20`}>
                                                <h4 className="font-bold text-primary mb-3 text-sm uppercase tracking-wide">Key Benefit</h4>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 bg-gradient-to-r ${activeUseCase.gradient} rounded-full`}></div>
                                                    <span className="font-bold text-lg text-foreground">
                                                        {activeUseCase.benefit}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="bg-card/50 border border-border/50 rounded-3xl p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Discover AI-Powered Insights</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Hover over any department in the circle to see how AI transforms their data analysis workflow with real-time insights.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
