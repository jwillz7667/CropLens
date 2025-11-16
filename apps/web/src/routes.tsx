import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { FieldDetailPage } from '@/pages/FieldDetailPage';
import { OnboardingPage } from '@/pages/OnboardingPage';

const ErrorElement = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
    <h1 className="text-3xl font-semibold">Something went wrong</h1>
    <p className="mt-2 text-slate-400">Please refresh the page or try again later.</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/app',
    element: <DashboardLayout />,
    errorElement: <ErrorElement />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'fields/:fieldId', element: <FieldDetailPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
    ],
  },
]);
