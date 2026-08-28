import Hero from "@/components/Hero";
import WebDemo from "@/components/WebDemo";
import PricingGrid from "@/components/PricingGrid";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950">
      <Hero />
      <WebDemo />
      <PricingGrid />
      <FAQ />
      <Footer />
    </main>
  );
}
