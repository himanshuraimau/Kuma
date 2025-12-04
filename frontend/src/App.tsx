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
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { PlaceholderSection } from '@/components/dashboard/PlaceholderSection';
import { AppsPage } from '@/components/apps/AppsPage';
import { MemoriesPage } from '@/components/memories/MemoriesPage';
import { ListChecks, FolderOpen } from 'lucide-react';
import { Toaster } from 'sonner';

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

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/chat/:id" element={<ChatInterface />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/prompts" element={<PlaceholderSection icon={ListChecks} title="Prompts" description="Browse and manage your prompt library." />} />
          <Route path="/drive" element={<PlaceholderSection icon={FolderOpen} title="Drive" description="Access your files and documents." />} />
          <Route path="/memories" element={<MemoriesPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  );
};

export default App;
