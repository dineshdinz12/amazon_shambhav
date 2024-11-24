'use server';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const google = createGoogleGenerativeAI({
  apiKey: apiKey,
});

export async function get_answer(prompt) {
  const { text } = await generateText({
    model: google('gemini-1.5-flash-latest'),
    prompt: `You are a business strategist chatbot for SMBs. Provide development ideas, strategies, or plans based on this input: "${prompt}"`,
  });

  return { text };
}
