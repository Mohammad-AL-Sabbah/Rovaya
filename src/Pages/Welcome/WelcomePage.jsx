// src/pages/Welcome/WelcomePage.jsx
import { HeroSection } from '../../Components/Welcome/Shared/HeroSection';
import { FeaturesAndCities } from '../../Components/Welcome/Shared/FeaturesAndCities';
import { SmartPlanner } from '../../Components/Welcome/Shared/SmartPlanner';
import { WhyRovaya } from '../../Components/Welcome/Shared/WhyRovaya';
import { Footer } from '../../Components/Welcome/Shared/Footer';
import { Testimonials } from '../../Components/Welcome/Shared/Testimonials';



export function WelcomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesAndCities />
      <SmartPlanner />
      <WhyRovaya />
      <Testimonials />
      <Footer />
      <main>


      </main>
    </>
  );
}