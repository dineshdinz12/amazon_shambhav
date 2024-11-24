'use server';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const google = createGoogleGenerativeAI({
  apiKey: apiKey,
});

async function readDemandData() {
  try {
    const filePath = path.join(process.cwd(), 'src/app/Demand-forecasting/demand_dataset.csv');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return new Promise((resolve) => {
      Papa.parse(fileContent, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        }
      });
    });
  } catch (error) {
    console.error('Error reading CSV:', error);
    return [];
  }
}

export async function get_answer(prompt) {
  const demandData = await readDemandData();
  
  // Create a context-aware prompt that includes the data summary
  const enhancedPrompt = `
    Context: Analyzing demand forecasting data with the following structure:
    ${JSON.stringify(demandData.slice(0, 2))}
    
    User Question: "${prompt}"
    
    Please provide a detailed analysis based on the demand data. Consider:
    - Historical demand patterns
    - Regional variations
    - Product-specific trends
    - Seasonal factors
    - Key insights and recommendations
    
    Format the response in a clear, professional manner.
  `;

  const { text } = await generateText({
    model: google('gemini-1.5-flash-latest'),
    prompt: enhancedPrompt,
  });

  return { text };
}