# **App Name**: Global News Now

## Core Features:

- API Service Integration: Configured to use Axios for making API requests to retrieve news articles.
- PWA Foundation: Setup for a basic PWA, including service worker registration and a manifest file.
- Basic Offline Support: Implements a bare-bones page caching strategy to allow users to view previously accessed content when offline. No database used, and thus no capability to download new content while offline.
- Article Display: Displays news articles in a clear and readable format.
- AI-Powered Summarization: Summarizes lengthy news articles for quick consumption, using a generative AI tool.
- Share Functionality: Allows users to share articles via social media or direct links.
- News Categorization: Categorizes news into topics like politics, technology, sports, etc.
- User Authentication: User authentication and authorization to manage personalized content.

## Style Guidelines:

- Primary color: Red (#BB1919) to convey trust and reliability, based on BBC News branding.
- Background color: White (#FFFFFF) for a clean, readable surface, based on BBC News branding.
- Accent color: Light grey (#999999) to draw attention to important actions or categories, based on BBC News branding.
- Body font: 'Helvetica Neue', sans-serif, for a modern and neutral reading experience. Headline font: 'Helvetica Neue', sans-serif.
- Simple, outline-style icons to represent news categories and sharing options.
- A clean, card-based layout to showcase articles. The goal is an easily navigable feed.
- Subtle transitions when loading new articles or switching between categories.