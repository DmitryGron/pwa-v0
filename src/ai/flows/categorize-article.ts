'use server';

/**
 * @fileOverview A news article categorization AI agent.
 *
 * - categorizeArticle - A function that handles the article categorization process.
 * - CategorizeArticleInput - The input type for the categorizeArticle function.
 * - CategorizeArticleOutput - The return type for the categorizeArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeArticleInputSchema = z.object({
  articleContent: z.string().describe('The content of the news article.'),
});
export type CategorizeArticleInput = z.infer<typeof CategorizeArticleInputSchema>;

const CategorizeArticleOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The category of the news article.  Possible values include: Politics, Technology, Sports, Business, Entertainment, Health, Science, World.'
    ),
  confidence: z.number().describe('The confidence level (0-1) of the categorization.'),
});
export type CategorizeArticleOutput = z.infer<typeof CategorizeArticleOutputSchema>;

export async function categorizeArticle(input: CategorizeArticleInput): Promise<CategorizeArticleOutput> {
  return categorizeArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeArticlePrompt',
  input: {schema: CategorizeArticleInputSchema},
  output: {schema: CategorizeArticleOutputSchema},
  prompt: `You are a news categorization expert.  You will read the content of a news article and determine its primary category.

Categories include: Politics, Technology, Sports, Business, Entertainment, Health, Science, World

Article content: {{{articleContent}}}

Respond with JSON in the following format:
{
  "category": "[category name]",
  "confidence": [confidence level between 0 and 1]
}
`,
});

const categorizeArticleFlow = ai.defineFlow(
  {
    name: 'categorizeArticleFlow',
    inputSchema: CategorizeArticleInputSchema,
    outputSchema: CategorizeArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
