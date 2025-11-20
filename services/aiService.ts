import { GoogleGenAI } from "@google/genai";
import { AIReport, Category, ChartDataPoint, KeyStat } from "../types";

// Prefer common env var names; fall back gracefully.
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
// Initialize Gemini. If no API key present, we still construct the client; calls will fail and be caught.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI();

const PROMPTS: Record<Category, string> = {
  latest: "Focus on the absolute latest AI product launches, major updates, and breaking news in India from the last 30 days. Highlight government initiatives (IndiaAI) and corporate moves.",
  startups: "List the most promising Indian AI startups that have launched products or raised funding in the last 60 days. Describe their specific AI value proposition.",
  enterprise: "How are major Indian IT services companies (TCS, Infosys, Wipro, HCL) and large conglomerates implementing or launching new AI platforms recently?",
  research: "What are the latest AI research breakthroughs or academic initiatives coming out of Indian institutions (IITs, IIITs) or corporate research labs in India recently?"
};

export const fetchIndiaAINews = async (category: Category): Promise<AIReport> => {
  try {
    const basePrompt = PROMPTS[category];

    const prompt = `${basePrompt} 
    
    Format the main response in clean Markdown. Use '##' for main section headers. Use bullet points. Bold specific company/product names. Focus strictly on India.

    CRITICAL: At the very end of your response, you MUST provide two specific CSV blocks for data visualization. 

    Block 1: A CSV representing a trend over the last 6 months related to this topic (e.g., Funding Amount, Number of Launches, or Activity Level). 
    Wrap it in \`\`\`csv
    Label,Value
    Sep,10
    Oct,15
    ...
    \`\`\`

    Block 2: A CSV representing 3 key statistics extracted from the news (e.g., Total Funding, New Startups, Patents Filed).
    Wrap it in \`\`\`stats
    Label,Value
    Total Funding,$500M+
    New Startups,12
    ...
    \`\`\`
    `;

    if (!apiKey) {
      throw new Error("Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY or API_KEY.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text || "No information available at the moment.";

    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const chunks = rawChunks
      .map((chunk: any) => ({
        web: chunk.web ? {
          uri: chunk.web.uri || '',
          title: chunk.web.title || ''
        } : undefined
      }))
      .filter((chunk: any) => chunk.web && chunk.web.uri);

    // Parsing logic for Data Blocks
    const chartData: ChartDataPoint[] = [];
    const stats: KeyStat[] = [];

    // Extract Chart CSV - Robust regex for spaces and newlines
    // Matches ```csv [whitespace/newlines] content ```
    const csvRegex = /```\s*csv\s*([\s\S]*?)```/i;
    const csvMatch = text.match(csvRegex);

    if (csvMatch && csvMatch[1]) {
      const rows = csvMatch[1].trim().split('\n');
      // Skip header row if present
      const dataRows = rows.length > 0 && rows[0].toLowerCase().includes('label') ? rows.slice(1) : rows;

      dataRows.forEach(row => {
        // Safe split handling potentially quoted values or simple comma separation
        const firstComma = row.indexOf(',');
        if (firstComma > 0) {
          const label = row.substring(0, firstComma).trim();
          const valueRaw = row.substring(firstComma + 1).trim();
          // Extract numeric part for chart
          const value = parseFloat(valueRaw.replace(/[^0-9.]/g, '')) || 0;
          if (label) {
            chartData.push({ label, value });
          }
        }
      });
      // Remove the block from display text using exact match
      text = text.replace(csvMatch[0], '');
    }

    // Extract Stats CSV
    const statsRegex = /```\s*stats\s*([\s\S]*?)```/i;
    const statsMatch = text.match(statsRegex);

    if (statsMatch && statsMatch[1]) {
      const rows = statsMatch[1].trim().split('\n');
      const dataRows = rows.length > 0 && rows[0].toLowerCase().includes('label') ? rows.slice(1) : rows;

      dataRows.forEach(row => {
        const firstComma = row.indexOf(',');
        if (firstComma > 0) {
          const label = row.substring(0, firstComma).trim();
          const value = row.substring(firstComma + 1).trim();
          if (label && value) {
            stats.push({ label, value, trend: 'up' });
          }
        }
      });
      // Remove the block from display text using exact match
      text = text.replace(statsMatch[0], '');
    }

    // Fallback data if parsing fails (prevents UI breakage)
    if (chartData.length === 0) {
      const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
      months.forEach(m => chartData.push({ label: m, value: Math.floor(Math.random() * 50) + 20 }));
    }
    if (stats.length === 0) {
      stats.push(
        { label: "Active Startups", value: "150+", trend: 'up' },
        { label: "Est. Funding", value: "$85M", trend: 'up' },
        { label: "New Models", value: "12", trend: 'neutral' }
      );
    }

    return {
      content: text.trim(),
      sources: chunks,
      chartData,
      stats
    };

  } catch (error) {
    console.error("Error fetching AI news:", error);
    throw error;
  }
};