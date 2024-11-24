// app/api/logistic-suggestions/route.js
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToCoreMessages, streamText, generateText } from "ai";
import { createConnection } from "mysql2/promise";


if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

const getConnection = async () => {
  return await createConnection({
    host: "localhost",
    user: "root",
    database: "globalxport",
    password: process.env.MYSQL_PASSWORD,
  });
};

const extractJson = (responseText) => {
  try {
    try {
      return JSON.parse(responseText);
    } catch {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        const cleanJson = jsonMatch[1].trim();
        return JSON.parse(cleanJson);
      }
      
      // If still no valid JSON found, try to find JSON-like content without code blocks
      const possibleJson = responseText.match(/\{[\s\S]*\}/);
      if (possibleJson) {
        return JSON.parse(possibleJson[0]);
      }
    }
    throw new Error("No valid JSON found in the response");
  } catch (error) {
    console.error("JSON parsing error:", error);
    console.error("Response text:", responseText);
    return { 
      query: null, 
      message: "Failed to parse SQL query",
      error: error.message,
      rawResponse: responseText 
    };
  }
};

const generateSQLQuery = async (prompt) => {
  const system_prompt = {
    database_structure: {
      logistic_partners: {
        columns: {
          id: "INT",
          partner_name: "VARCHAR(255)",
          contact_person: "VARCHAR(255)",
          contact_email: "VARCHAR(255)",
          contact_phone: "VARCHAR(20)",
          region: "VARCHAR(255)",
          service_type: "VARCHAR(50)",
          base_rate_per_kg: "DECIMAL(10,2)",
          avg_delivery_time_days: "INT",
          reliability_score: "DECIMAL(3,2)"
        }
      }
    },
    persona: "You are an SQL query generator for a global logistics partner recommendation system.",
    objective: "Generate accurate SQL queries to find and recommend the best logistics partners based on user requirements and location.",
    instructions: [
      "Return only valid JSON containing message and query fields",
      "Analyze the user's request to understand their location and any specific requirements",
      "Generate SQL queries that consider factors like reliability score, delivery time, and rates",
      "Use appropriate WHERE clauses to filter by region and other relevant criteria",
      "Order results by reliability score and other relevant factors for best recommendations"
    ],
    response_format: {
      message: "Brief explanation of the query",
      query: "The SQL query"
    }
  };

  try {
    const response = await generateText({
      model: google("gemini-1.5-flash-latest"),
      prompt: `Given the following request: "${prompt}", generate an SQL query to find suitable logistics partners. Return your response as a JSON object with 'message' and 'query' fields. ${JSON.stringify(system_prompt)}`,
      maxSteps: 5,
    });

    const result = extractJson(response.text);
    
    if (!result.query) {
      throw new Error(`Invalid query generated: ${JSON.stringify(result)}`);
    }
    
    return result.query;
  } catch (error) {
    console.error("Error generating SQL query:", error);
    throw new Error(`Failed to generate SQL query: ${error.message}`);
  }
};

const normalizePartnerData = (partner) => {
    return {
      ...partner,
      // Convert string numbers to actual numbers
      base_rate_per_kg: partner.base_rate_per_kg ? Number(partner.base_rate_per_kg) : null,
      avg_delivery_time_days: partner.avg_delivery_time_days ? Number(partner.avg_delivery_time_days) : null,
      reliability_score: partner.reliability_score ? Number(partner.reliability_score) : null,
      // Ensure other fields have fallback values
      partner_name: partner.partner_name || 'Unknown Partner',
      region: partner.region || 'Region not specified',
      service_type: partner.service_type || 'Service type not specified',
      contact_person: partner.contact_person || 'Not specified',
      contact_email: partner.contact_email || 'Not specified',
      contact_phone: partner.contact_phone || 'Not specified'
    };
  };
  
  const access_db = async (message) => {
    try {
      const sqlQuery = await generateSQLQuery(message);
      if (!sqlQuery) {
        throw new Error("Failed to generate SQL query");
      }
      
      const connection = await getConnection();
      const [rows] = await connection.execute(sqlQuery);
      await connection.end();
      
      if (!Array.isArray(rows)) {
        throw new Error("Invalid database response format");
      }
      
      // Normalize all partner data
      const normalizedPartners = rows.map(normalizePartnerData);
      
      return { success: true, partners: normalizedPartners };
    } catch (error) {
      console.error("Error in accessing Database:", error);
      return { success: false, error: error.message };
    }
  };
  
export async function POST(req) {
  try {
    const body = await req.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const system_instructions = {
      persona: "You are a knowledgeable logistics consultant specializing in recommending the best shipping and logistics partners based on specific needs and regions.",
      objective: "Provide detailed, data-driven recommendations for logistics partners while considering factors like reliability, cost, and delivery time.",
      instructions: [
        "Always start by understanding the user's location/region requirement",
        "Provide comprehensive partner suggestions based on multiple factors",
        "Include key information like reliability scores, delivery times, and rates in recommendations"
      ]
    };
    
    const dbResult = await access_db(messages[messages.length - 1].content);
    
    if (!dbResult.success) {
      return new Response(JSON.stringify({ error: dbResult.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(dbResult), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}