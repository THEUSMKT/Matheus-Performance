import { Benefits } from '@/components/Benefits';
import { FAQ } from '@/components/FAQ';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { Navbar } from '@/components/Navbar';
import { Portfolio } from '@/components/Portfolio';
import { SiteConfigurator } from '@/components/SiteConfigurator';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <HowItWorks />
        <SiteConfigurator />
        <Portfolio />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
