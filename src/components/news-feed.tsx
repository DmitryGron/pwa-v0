'use client';

import { useState, useEffect } from 'react';
import { Article, mockArticles, newsCategories } from '@/lib/mock-data';
import ArticleCard from './article-card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ArticleModal from './article-modal';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewsFeed() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate API call and transition
    const timer = setTimeout(() => {
      const filteredArticles = selectedCategory === 'All'
        ? mockArticles
        : mockArticles.filter(article => article.category === selectedCategory);
      setArticles(filteredArticles);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9">
          <TabsTrigger value="All">All</TabsTrigger>
          {newsCategories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))
        ) : (
          articles.map((article, index) => (
            <div 
              key={article.id} 
              className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500" 
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
                <ArticleCard
                    article={article}
                    onReadMore={() => setSelectedArticle(article)}
                />
            </div>
          ))
        )}
      </div>

      <ArticleModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
