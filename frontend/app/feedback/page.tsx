"use client";

import { useState } from 'react';
import { MessageCircle, User, Mail, Phone, Send, Heart, Star, Zap, CheckCircle, Sparkles } from 'lucide-react';

export default function FeedbackPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        rating: 0,
        category: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        { id: 'bug', label: 'Bug Report', icon: '🐛', color: 'from-red-500 to-orange-500' },
        { id: 'feature', label: 'Feature Request', icon: '✨', color: 'from-blue-500 to-cyan-500' },
        { id: 'general', label: 'General Feedback', icon: '💬', color: 'from-green-500 to-emerald-500' },
        { id: 'praise', label: 'Compliment', icon: '❤️', color: 'from-pink-500 to-rose-500' }
    ];

    const steps = [
        { title: 'Choose Category', icon: MessageCircle },
        { title: 'Rate Experience', icon: Star },
        { title: 'Your Details', icon: User },
        { title: 'Your Message', icon: Send }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Create FormData to match your backend API
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('phone', formData.phone || '');
            
            // Combine all feedback info into message
            const fullMessage = `Category: ${formData.category}
Rating: ${formData.rating}/5 stars
Message: ${formData.message}`;
            
            submitData.append('message', fullMessage);

            // Submit to your backend API
            const response = await fetch('http://localhost:8000/feedback/', {
                method: 'POST',
                body: submitData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Feedback submitted:', result);
                setIsSubmitted(true);
            } else {
                throw new Error('Failed to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (isSubmitted) {
        return (
            <div className="container mx-auto py-20 px-4 min-h-screen flex items-center justify-center">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <CheckCircle className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Your feedback has been received and saved to our database! We'll review it soon.
                    </p>
                    <button 
                        onClick={() => { 
                            setIsSubmitted(false); 
                            setCurrentStep(0); 
                            setFormData({ name: '', email: '', phone: '', message: '', rating: 0, category: '' });
                            setError('');
                        }}
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300"
                    >
                        Send Another Feedback
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-20 px-4 min-h-screen">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-full text-sm font-medium mb-8">
                    <Heart className="w-4 h-4" />
                    We Value Your Opinion
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
                    Give Us <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Feedback</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Help us improve ClarifaiSQL with your valuable insights and suggestions
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        {steps.map((step, index) => {
                            const IconComponent = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;
                            
                            return (
                                <div key={index} className="flex flex-col items-center relative">
                                    {index > 0 && (
                                        <div className={`absolute right-full top-6 w-full h-0.5 ${
                                            isCompleted ? 'bg-primary' : 'bg-border'
                                        } transition-colors duration-300`} style={{ width: '100px', marginRight: '50px' }} />
                                    )}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-primary text-white scale-110 shadow-lg' 
                                            : isCompleted
                                                ? 'bg-primary text-white'
                                                : 'bg-muted text-muted-foreground'
                                    }`}>
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <span className={`mt-2 text-sm font-medium ${
                                        isActive ? 'text-primary' : 'text-muted-foreground'
                                    }`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center">
                        {error}
                    </div>
                )}

                {/* Form Content */}
                <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl">
                    <form onSubmit={handleSubmit}>
                        {/* Step 0: Category Selection */}
                        {currentStep === 0 && (
                            <div className="space-y-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold mb-4">What type of feedback do you have?</h2>
                                    <p className="text-muted-foreground">Choose the category that best describes your feedback</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            onClick={() => setFormData({...formData, category: category.id})}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                                                formData.category === category.id
                                                    ? 'border-primary bg-primary/10 shadow-lg'
                                                    : 'border-border hover:border-primary/50'
                                            }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-4xl mb-4">{category.icon}</div>
                                                <h3 className="text-lg font-semibold mb-2">{category.label}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 1: Rating */}
                        {currentStep === 1 && (
                            <div className="space-y-8 text-center">
                                <div>
                                    <h2 className="text-2xl font-bold mb-4">How would you rate your experience?</h2>
                                    <p className="text-muted-foreground">Your rating helps us understand how we're doing</p>
                                </div>
                                
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({...formData, rating: star})}
                                            className={`w-16 h-16 rounded-full transition-all duration-300 ${
                                                star <= formData.rating
                                                    ? 'text-yellow-500 hover:scale-110'
                                                    : 'text-muted-foreground hover:text-yellow-500 hover:scale-105'
                                            }`}
                                        >
                                            <Star className={`w-12 h-12 ${star <= formData.rating ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                                
                                {formData.rating > 0 && (
                                    <div className="mt-8 p-4 bg-primary/10 rounded-xl">
                                        <p className="font-semibold">
                                            {formData.rating === 5 && "Amazing! We're thrilled you love ClarifaiSQL! 🎉"}
                                            {formData.rating === 4 && "Great! We're happy you had a positive experience! 😊"}
                                            {formData.rating === 3 && "Good! We'd love to know how we can improve! 👍"}
                                            {formData.rating === 2 && "Thanks for the feedback. We'll work on improvements! 😔"}
                                            {formData.rating === 1 && "We're sorry to hear that. Please let us know what went wrong! 😞"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Contact Details */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold mb-4">Let's get to know you</h2>
                                    <p className="text-muted-foreground">We'd love to connect and follow up on your feedback</p>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Your Name *"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:bg-background transition-all duration-300"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="email"
                                            placeholder="Your Email *"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:bg-background transition-all duration-300"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="tel"
                                            placeholder="Your Phone (Optional)"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:bg-background transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Message */}
                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold mb-4">Share your thoughts</h2>
                                    <p className="text-muted-foreground">Tell us more about your experience and how we can improve</p>
                                </div>
                                
                                <div className="relative">
                                    <textarea
                                        placeholder="Your message..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        rows={6}
                                        className="w-full p-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:bg-background transition-all duration-300 resize-none"
                                        required
                                    />
                                    <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
                                        {formData.message.length}/500
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-12">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-all duration-300"
                            >
                                Previous
                            </button>

                            {currentStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={
                                        (currentStep === 0 && !formData.category) ||
                                        (currentStep === 1 && formData.rating === 0) ||
                                        (currentStep === 2 && (!formData.name || !formData.email))
                                    }
                                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all duration-300 flex items-center gap-2"
                                >
                                    Next
                                    <Sparkles className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.message}
                                    className="px-8 py-3 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Feedback
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
