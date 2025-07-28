'use client';
import { useAuth } from '@/context/auth-context';
import LoginForm from '@/components/login-form';
import Header from '@/components/header';
import NewsFeed from '@/components/news-feed';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Newspaper className="h-12 w-12 animate-pulse text-primary" />
          <div className="space-y-2 text-center">
            <p className="text-lg font-semibold text-primary">Global News Now</p>
            <p className="text-sm text-muted-foreground">Loading your world...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <NewsFeed />
      </main>
    </div>
  );
}
