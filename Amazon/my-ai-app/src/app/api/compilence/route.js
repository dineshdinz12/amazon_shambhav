// app/api/analyze/route.js
import { NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(request) {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return NextResponse.json({ 
      success: false, 
      error: 'API key not configured' 
    }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    // Log file information for debugging
    console.log('File type:', file.type);
    console.log('File size:', file.size);

    // Convert file to base64
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64File = fileBuffer.toString('base64');

    // Initialize Google AI
    const google = createGoogleGenerativeAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });

    // Generate analysis using Gemini
    const analysisResponse = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [{
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: `Analyze this document and provide a detailed analysis with:
                  1. Compliance Risk Level (Low/Medium/High)
                  2. Specific Risk Factors
                  3. Recommended Mitigation Strategies
                  4. Potential Compliance Gaps`
          },
          { 
            type: 'file', 
            data: base64File, 
            mimeType: file.type 
          }
        ]
      }],
      maxSteps: 5,
    });

    if (!analysisResponse?.text) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to generate analysis' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResponse.text
    });

  } catch (error) {
    console.error('Error in document analysis:', error);
    
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Error analyzing document'
    }, { 
      status: 500 
    });
  }
}