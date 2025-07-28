'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Article } from '@/lib/mock-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, Share2, Sparkles, Copy } from 'lucide-react';
import { summarizeArticle, SummarizeArticleOutput } from '@/ai/flows/summarize-article';
import { useToast } from "@/hooks/use-toast"
import { Separator } from './ui/separator';

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  const [summary, setSummary] = useState<SummarizeArticleOutput | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when a new article is opened
    if (isOpen) {
      setSummary(null);
    }
  }, [isOpen]);

  const handleSummarize = async () => {
    if (!article) return;
    setIsSummarizing(true);
    setSummary(null);
    try {
      const result = await summarizeArticle({ articleContent: article.content });
      setSummary(result);
    } catch (error) {
      console.error('Error summarizing article:', error);
      toast({
        variant: "destructive",
        title: "Summarization Failed",
        description: "Could not generate summary. Please try again.",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleShare = async () => {
    if (!article) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: 'Check out this article!',
          url: article.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback for when sharing is cancelled by user
        navigator.clipboard.writeText(article.url);
        toast({
            title: "Sharing cancelled. Link copied instead!",
            description: "Article URL has been copied to your clipboard.",
        });
      }
    } else {
      navigator.clipboard.writeText(article.url);
      toast({
        title: "Link Copied!",
        description: "Article URL has been copied to your clipboard.",
      });
    }
  };
  
  const handleCopySummary = () => {
    if (!summary?.summary) return;
    navigator.clipboard.writeText(summary.summary);
    toast({
      title: "Summary Copied!",
      description: "The summary has been copied to your clipboard.",
    });
  }

  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline pr-10">{article.title}</DialogTitle>
          <DialogDescription>
            {article.source} &middot; {new Date(article.publishedAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] -mx-6 px-6">
            <div className="relative h-64 w-full my-4 rounded-lg overflow-hidden">
                <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
            </div>
            
            <div className="space-y-4">
                <p className="text-base leading-relaxed">{article.content}</p>
            </div>
            
            <Separator className="my-6" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center font-headline">
                        <Sparkles className="w-5 h-5 mr-2 text-primary" />
                        AI Summary
                    </h3>
                    <Button onClick={handleSummarize} disabled={isSummarizing}>
                        {isSummarizing ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...</>
                        ) : (
                            'Generate Summary'
                        )}
                    </Button>
                </div>
                {summary && (
                    <div className="p-4 border rounded-lg bg-muted/50 relative group">
                        <p className="text-muted-foreground">{summary.summary}</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleCopySummary}
                            aria-label="Copy summary"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </ScrollArea>
        <div className="flex justify-end pt-6 border-t -mx-6 px-6 -mb-6 pb-6">
          <Button onClick={handleShare} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
