import "./landing.css";
import Navbar from "@/components//navbar";
import HeroSection from "@/components/landing/hero-section";
import LoyaltySection from "@/components/landing/loyalty-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import OwnerSection from "@/components/landing/owner-section";
import CtaSection from "@/components/landing/cta-section";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <div className="landing-root">
      <Navbar />
      <HeroSection />
      <LoyaltySection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <OwnerSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
