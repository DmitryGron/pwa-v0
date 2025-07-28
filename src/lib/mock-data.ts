export interface Article {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  imageUrl: string;
  content: string;
  category: string;
}

export const newsCategories = ["Technology", "Business", "Sports", "Politics", "Health", "Science", "Entertainment", "World"];

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "The Future of AI: Trends to Watch in the Next Decade",
    source: "Tech Today",
    publishedAt: "2024-07-22T14:30:00Z",
    url: "https://example.com/future-of-ai",
    imageUrl: "https://placehold.co/600x400.png",
    content: "Artificial intelligence is evolving at an unprecedented pace. From large language models to generative art, the landscape is constantly shifting. This article explores the key trends that will shape the next ten years of AI development, including advancements in quantum computing, ethical AI frameworks, and the democratization of AI tools. Experts predict that AI will become more integrated into our daily lives, automating complex tasks and creating new opportunities for innovation. However, this rapid progress also raises important questions about job displacement, privacy, and the potential for misuse. As we move forward, it will be crucial to establish robust governance and regulatory frameworks to ensure that AI is developed and deployed responsibly. The collaboration between academia, industry, and policymakers will be essential in navigating the challenges and harnessing the full potential of this transformative technology.",
    category: "Technology",
  },
  {
    id: "2",
    title: "Global Markets React to New Economic Policies",
    source: "Financial Times",
    publishedAt: "2024-07-22T12:00:00Z",
    url: "https://example.com/global-markets",
    imageUrl: "https://placehold.co/600x400.png",
    content: "Stock markets around the world experienced significant volatility this week following the announcement of new trade policies by major economic powers. Investors are closely watching the situation, with many expressing concern over the potential for a global trade war. The tech sector was hit particularly hard, with major companies seeing their stock prices plummet. In contrast, domestic manufacturing industries saw a surge in value. Economists are divided on the long-term impact of these policies. Some argue that they will ultimately protect domestic jobs and stimulate local economies, while others warn of a potential global recession. The uncertainty has led to a flight to safety, with gold and government bonds seeing increased demand. Central banks are now under pressure to intervene, but their options may be limited in the current climate. The coming weeks will be critical in determining the direction of the global economy.",
    category: "Business",
  },
  {
    id: "3",
    title: "Underdog Victory: The Championship Final That Shocked the World",
    source: "Sports Weekly",
    publishedAt: "2024-07-21T22:15:00Z",
    url: "https://example.com/championship-final",
    imageUrl: "https://placehold.co/600x400.png",
    content: "In a stunning turn of events, the Northwood Knights have been crowned champions after a dramatic final match that will be remembered for generations. Tipped as the underdogs, the Knights defied all odds to defeat the reigning champions, the Southgate Lions, in a nail-biting penalty shootout. The game was a rollercoaster of emotions, with both teams displaying incredible skill and determination. The Lions took an early lead, but the Knights fought back with a late equalizer, sending the game into extra time. Despite relentless pressure from the Lions, the Knights' defense held strong, thanks to a heroic performance from their goalkeeper. The penalty shootout was a test of nerves, but the Knights held their cool, converting all their spot-kicks to secure the historic victory. The city has erupted in celebration, with fans pouring onto the streets to honor their heroes.",
    category: "Sports",
  },
  {
    id: "4",
    title: "Breakthrough in Alzheimer's Research: A New Hope for Patients",
    source: "Science Journal",
    publishedAt: "2024-07-20T09:00:00Z",
    url: "https://example.com/alzheimers-research",
    imageUrl: "https://placehold.co/600x400.png",
    content: "Scientists have announced a major breakthrough in the fight against Alzheimer's disease. A new drug has shown remarkable results in clinical trials, significantly slowing cognitive decline in patients with early-stage Alzheimer's. The drug works by targeting and removing amyloid plaques in the brain, which are a hallmark of the disease. This is the first treatment that has demonstrated a clear ability to modify the underlying course of the disease, rather than just managing symptoms. While the drug is not a cure, it represents a significant step forward and offers new hope to millions of patients and their families worldwide. Researchers are optimistic that this discovery will pave the way for more effective treatments and potentially even a cure in the future. Further studies are needed to fully understand the long-term effects and potential side effects of the new drug, but the initial results are incredibly promising.",
    category: "Health",
  },
  {
    id: "5",
    title: "New Legislation Sparks Debate on Capitol Hill",
    source: "Politics Now",
    publishedAt: "2024-07-23T10:00:00Z",
    url: "https://example.com/capitol-hill-debate",
    imageUrl: "https://placehold.co/600x400.png",
    content: "A controversial new bill is making its way through Congress, sparking heated debate on both sides of the aisle. The proposed legislation addresses digital privacy rights and has drawn both praise for its consumer protections and criticism for its potential impact on the tech industry. Proponents argue that the bill is a necessary step to safeguard personal data in the digital age, while opponents claim it will stifle innovation and create an undue burden on small businesses. The debate is expected to continue for several weeks, with a final vote anticipated before the end of the month.",
    category: "Politics",
  },
  {
    id: "6",
    title: "Blockbuster 'Galaxy Quest' Dominates Summer Box Office",
    source: "Entertainment Weekly",
    publishedAt: "2024-07-22T18:00:00Z",
    url: "https://example.com/galaxy-quest-box-office",
    imageUrl: "https://placehold.co/600x400.png",
    content: "The latest sci-fi epic, 'Galaxy Quest,' has taken the summer box office by storm, grossing over $500 million worldwide in its opening weekend. The film, directed by Jane Doe, has been praised for its stunning visual effects and compelling storyline. Critics and audiences alike are hailing it as a return to form for the genre, with many drawing comparisons to classic space operas. The film's success is a major win for the studio, which took a significant risk on the original property.",
    category: "Entertainment",
  },
  {
    id: "7",
    title: "Physicists Discover New Particle at the Large Hadron Collider",
    source: "Scientific American",
    publishedAt: "2024-07-21T11:45:00Z",
    url: "https://example.com/new-particle-discovery",
    imageUrl: "https://placehold.co/600x400.png",
    content: "In a groundbreaking discovery, physicists at CERN have announced the observation of a new subatomic particle. The particle, which has been provisionally named the 'chronoton,' could challenge the Standard Model of particle physics and open up new avenues of research into the fundamental nature of the universe. The discovery was made after years of experiments at the Large Hadron Collider. Scientists are now working to confirm the properties of the chronoton and understand its role in the cosmos.",
    category: "Science",
  },
  {
    id: "8",
    title: "Diplomatic Talks Underway to Resolve International Water Dispute",
    source: "World News Agency",
    publishedAt: "2024-07-23T08:00:00Z",
    url: "https://example.com/water-dispute-talks",
    imageUrl: "https://placehold.co/600x400.png",
    content: "High-stakes diplomatic negotiations have begun between neighboring countries to resolve a long-standing dispute over water rights to the Azure River. The talks, mediated by the United Nations, aim to establish a fair and sustainable water-sharing agreement. Tensions have been high in the region for years, with both nations relying heavily on the river for agriculture and drinking water. A successful resolution is seen as critical to maintaining peace and stability in the region.",
    category: "World",
  }
];
