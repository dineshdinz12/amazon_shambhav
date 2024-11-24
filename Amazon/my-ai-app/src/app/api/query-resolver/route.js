'use server';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const google = createGoogleGenerativeAI({
  apiKey: apiKey,
});

export async function get_answer(prompt) {
  const enhancedPrompt = `You are an expert business strategy consultant specializing in SMB growth and optimization. 
  
Context: You're advising a small-to-medium business owner seeking actionable guidance.

Format your response using this specific Markdown structure:

## 🎯 Key Takeaways
• [Brief, impactful points with key insights]

## 📋 Detailed Recommendations

### 1. [First Recommendation Title] 
**Implementation:**
• [Specific steps]
• [Resource requirements]
• [Timeline]

**Expected Impact:**
• [Benefits and outcomes]

### 2. [Second Recommendation Title]
[Similar structure as above]

## ⚡ Quick Wins
• [Immediate action items]

Remember to:
- Use clear headers with emojis (##, ###)
- Bold important points with **text**
- Add spacing between sections
- Use bullet points for lists
- Keep each section concise and actionable
- Highlight critical numbers or metrics

User Query: "${prompt}"

Note: Ensure all advice is:
- Practical for SMBs with limited resources
- Cost-effective and scalable
- Measurable with clear success metrics
- Realistic to implement within 3-6 months`;

  const { text } = await generateText({
    model: google('gemini-1.5-flash-latest'),
    prompt: enhancedPrompt,
  });

  return { text };
}