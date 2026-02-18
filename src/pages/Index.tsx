import NavbarWithScroll from "@/components/NavbarWithScroll";
import HeroEnhanced from "@/components/HeroEnhanced";
import HowItWorksSection from "@/components/HowItWorksSection";
import VideoShowcase from "@/components/VideoShowcase";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <NavbarWithScroll />
      <HeroEnhanced />
      <HowItWorksSection />
      <VideoShowcase />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
