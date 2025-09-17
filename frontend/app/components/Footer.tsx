import Link from "next/link";
import { Database } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2">
                    <Database className="h-6 w-6 text-purple-400" />
                    <span className="font-bold">ClarifaiSQL</span>
                </div>
                 <p className="mt-2 text-sm text-muted-foreground">Ask Your Data. Get Instant Insights.</p>
            </div>
             <div>
                <h3 className="font-semibold">Product</h3>
                <Link href="/how-it-works" className="block mt-2 text-sm text-muted-foreground hover:text-foreground">How It Works</Link>
                <Link href="/use-cases" className="block mt-2 text-sm text-muted-foreground hover:text-foreground">Use Cases</Link>
                <Link href="/ai-tool" className="block mt-2 text-sm text-muted-foreground hover:text-foreground">AI Tool</Link>
             </div>
             <div>
                <h3 className="font-semibold">Company</h3>
                <Link href="/roadmap" className="block mt-2 text-sm text-muted-foreground hover:text-foreground">Roadmap</Link>
                <Link href="/about" className="block mt-2 text-sm text-muted-foreground hover:text-foreground">About Us</Link>
                <Link href="/feedback" className="block mt-2 text-sm text-muted-foreground hover:text-foreground">Feedback</Link>
             </div>
             <div>
                <h3 className="font-semibold">Support</h3>
                <Link href="/faq" className="block mt-2 text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
             </div>
        </div>
        <div className="mt-8 pt-4 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ClarifaiSQL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
