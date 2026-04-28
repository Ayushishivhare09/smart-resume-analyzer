import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { usePageMeta } from "@/lib/toast";
export default function Landing() {
    usePageMeta("ResumeIQ — Smart Resume Analyzer & Career Hub", "Score your resume, find missing keywords, draft cover letters, and prep for interviews — all in one tab. No signup needed.");
    return (<div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>);
}
