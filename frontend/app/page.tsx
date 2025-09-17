import { Button } from "./components/ui/button"
import Link from "next/link"
import { ArrowRight, Database, Zap, UploadCloud, HelpCircle, Bot, CheckCircle, Users, BarChart3, Target, Wrench, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"

// --- Hero Section ---
const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900/50 dark:via-gray-900/50 dark:to-black/50 py-20 sm:py-32">
    <div className="absolute inset-0 bg-[url('/grid-dark.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:invert"></div>
    <div className="container mx-auto px-4 relative">
      <div className="text-center max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            <span>AI-Powered SQL Generation</span>
          </div>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-6">
          From Question → To SQL → To{" "}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Answer. Instantly.
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          ClarifaiSQL transforms your plain English questions into SQL queries, 
          explains them step-by-step, and delivers crystal-clear insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/ai-tool">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Start Asking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="outline" size="lg">
              <Database className="mr-2 h-4 w-4" />
              See How It Works
            </Button>
          </Link>
        </div>
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          No sign-up required • Start instantly • Free to use
        </div>
      </div>
    </div>
  </section>
);

// --- How It Works Section ---
const HowItWorks = () => {
    const steps = [
        { icon: UploadCloud, title: 'Upload Your Data', description: 'Start by uploading your CSV file securely.' },
        { icon: HelpCircle, title: 'Ask Anything', description: 'Use plain, natural English to ask any question.' },
        { icon: Bot, title: 'AI Magic Happens', description: 'Our AI generates the precise SQL query needed.' },
        { icon: CheckCircle, title: 'Get Instant Insights', description: 'Receive a direct answer and a clear explanation.' }
    ];
    return (
        <section className="py-20 sm:py-32">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold">From Data to Insight in 4 Simple Steps</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Our process is powerful yet simple.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="text-center">
                            <div className="mb-6 mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                <step.icon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Use Cases Section ---
const UseCases = () => {
    const cases = [
        { icon: Zap, industry: 'Sales' }, { icon: Users, industry: 'HR' },
        { icon: BarChart3, industry: 'Finance' }, { icon: Target, industry: 'Marketing' },
        { icon: Wrench, industry: 'Operations' }, { icon: MessageCircle, industry: 'Support' },
    ];
    return (
        <section className="py-20 sm:py-32 bg-secondary">
             <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold">Powerful for Every Department</h2>
                    <p className="mt-4 text-lg text-muted-foreground">From sales analytics to HR reporting, discover what you can do.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {cases.map((useCase) => (
                        <div key={useCase.industry} className="text-center p-4 rounded-lg hover:bg-background/50 transition-colors">
                            <useCase.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                            <h3 className="font-bold">{useCase.industry}</h3>
                        </div>
                    ))}
                </div>
             </div>
        </section>
    );
};

// --- CTA Section ---
const Cta = () => (
    <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl sm:text-4xl font-bold">Ready to Unlock Your Data?</h2>
             <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">Stop guessing and start asking. Get the answers you need in seconds, not hours.</p>
             <div className="mt-8">
                <Link href="/ai-tool">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        Try ClarifaiSQL Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
             </div>
        </div>
    </section>
);


// --- The Main Home Page Component ---
export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <UseCases />
      <Cta />
    </main>
  );
}

