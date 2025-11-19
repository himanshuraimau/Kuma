import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ExperienceSection } from '@/components/landing/ExperienceSection';
import { TechnologySection } from '@/components/landing/TechnologySection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { LoginPage } from '@/components/auth/LoginPage';
import { SignupPage } from '@/components/auth/SignupPage';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <ExperienceSection />
        <TechnologySection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
