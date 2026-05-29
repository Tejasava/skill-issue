import { Suspense, lazy } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = lazy(() => import("./pages/Index"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SkillsPage = lazy(() => import("./pages/SkillsPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const TalentHuntPage = lazy(() => import("./pages/TalentHuntPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const FriendsPage = lazy(() => import("./pages/FriendsPage"));
const ExchangesPage = lazy(() => import("./pages/ExchangesPage"));
const EventsListPage = lazy(() => import("./pages/EventsListPage"));
const EventDetailsPage = lazy(() => import("./pages/EventDetailsPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));
const AdminExchangesPage = lazy(() => import("./pages/AdminExchangesPage"));
const AdminEventsPage = lazy(() => import("./pages/AdminEventsPage"));
const AdminCommunitiesPage = lazy(() => import("./pages/AdminCommunitiesPage"));
const AdminProjectsPage = lazy(() => import("./pages/AdminProjectsPage"));
const AdminReportsPage = lazy(() => import("./pages/AdminReportsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Legacy /chat route redirect to /dashboard/chat (preserve query) */}
            <Route path="/chat" element={<RedirectChat />} />
            
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/chat" element={<ChatPage />} />
            <Route path="/dashboard/friends" element={<FriendsPage />} />
            <Route path="/dashboard/exchanges" element={<ExchangesPage />} />
            <Route path="/dashboard/events" element={<EventsListPage />} />
            <Route path="/events/:eventId" element={<EventDetailsPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/talent-hunt" element={<TalentHuntPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/exchanges" element={<AdminExchangesPage />} />
            <Route path="/admin/events" element={<AdminEventsPage />} />
            <Route path="/admin/communities" element={<AdminCommunitiesPage />} />
            <Route path="/admin/projects" element={<AdminProjectsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

// Redirect component placed after export to allow useLocation hook
function RedirectChat() {
  const loc = useLocation();
  return <Navigate to={`/dashboard/chat${loc.search || ''}`} replace />;
}
