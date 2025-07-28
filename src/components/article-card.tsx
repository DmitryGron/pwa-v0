'use client';
import Image from 'next/image';
import { Article } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onReadMore: () => void;
}

export default function ArticleCard({ article, onReadMore }: ArticleCardProps) {
  const { title, imageUrl, category, content } = article;

  const getHint = (category: string) => {
    switch (category) {
      case 'Technology': return 'robot future';
      case 'Business': return 'stock market';
      case 'Sports': return 'soccer stadium';
      case 'Health': return 'science laboratory';
      case 'Politics': return 'government building';
      case 'Entertainment': return 'movie camera';
      case 'Science': return 'galaxy stars';
      case 'World': return 'world map';
      default: return 'news article';
    }
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            data-ai-hint={getHint(category)}
          />
        </div>
        <div className="p-4">
          <Badge variant="secondary" className="mb-2">{category}</Badge>
          <CardTitle className="text-lg font-headline leading-tight">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow px-4 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {content}
        </p>
      </CardContent>
      <CardFooter className="px-4 pb-4 mt-auto">
        <Button onClick={onReadMore} variant="outline" className="w-full">
          Read More <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
