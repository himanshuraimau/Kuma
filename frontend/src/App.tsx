import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ExperienceSection } from '@/components/landing/ExperienceSection';
import { TechnologySection } from '@/components/landing/TechnologySection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { LoginPage } from '@/components/auth/LoginPage';
import { SignupPage } from '@/components/auth/SignupPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { PlaceholderSection } from '@/components/dashboard/PlaceholderSection';
import { useAuthStore } from '@/stores/auth.store';
import { LayoutGrid, ListChecks, FolderOpen, Brain } from 'lucide-react';

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
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/apps" element={<PlaceholderSection icon={LayoutGrid} title="Apps" description="Manage your connected applications and integrations." />} />
          <Route path="/prompts" element={<PlaceholderSection icon={ListChecks} title="Prompts" description="Browse and manage your prompt library." />} />
          <Route path="/drive" element={<PlaceholderSection icon={FolderOpen} title="Drive" description="Access your files and documents." />} />
          <Route path="/memories" element={<PlaceholderSection icon={Brain} title="Memories" description="View and manage your conversation memories." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
