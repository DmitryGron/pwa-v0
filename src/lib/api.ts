import axios from 'axios';

export const api = axios.create({
  // In a real app, this would be your base URL
  // For example: baseURL: 'https://newsapi.org/v2', 
});

// Example of how you might fetch articles
// We will use mock data for this app, so this is for demonstration.
export const fetchNewsArticles = async (category: string) => {
  // const response = await api.get(`/top-headlines?country=us&category=${category}&apiKey=YOUR_API_KEY`);
  // return response.data.articles;
  console.log(`Fetching articles for category: ${category}`);
  return Promise.resolve([]); // Mock implementation returns an empty array
};
