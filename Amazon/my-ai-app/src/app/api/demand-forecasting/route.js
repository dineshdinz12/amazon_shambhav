"use server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createConnection } from "mysql2/promise";

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

// local connection
// const getConnection = async () => {
//   return await createConnection({
//     host: "localhost",
//     user: "root",
//     database: "globalxport",
//     password: process.env.MYSQL_PASSWORD,
//   });
// };

// cloude connection 
const getConnection = async () => {
  return await createConnection({
    host: "mysql-2558516c-vibez2055-c999.b.aivencloud.com",
    port: 25362, // Explicitly define the port
    user: "avnadmin",
    database: "globalxport",
    password: process.env,MYSQL_PASSWORD,
    ssl: {
      rejectUnauthorized: false, // Basic SSL validation
    },
  });
};

const extractJson = (responseText) => {
  try {
    // First try direct JSON parsing
    try {
      return JSON.parse(responseText);
    } catch {
      // Try extracting JSON from code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }
      
      // Try finding JSON object in text
      const possibleJson = responseText.match(/\{[\s\S]*\}/);
      if (possibleJson) {
        return JSON.parse(possibleJson[0]);
      }
    }
    throw new Error("No valid JSON found in the response");
  } catch (error) {
    console.error("JSON parsing error:", error);
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
      demand_data: {
        columns: {
          Date: "DATE",
          Region: "VARCHAR(100)",
          Product: "VARCHAR(100)",
          Season: "VARCHAR(50)",
          Sales_Volume: "INT",
          Competitor_Discount: "INT",
          Consumer_Index: "INT"
        }
      }
    },
    persona: "You are an AI demand forecasting analyst for small and medium businesses.",
    objective: "Generate SQL queries to analyze historical sales data and provide demand insights.",
    instructions: [
      "Return JSON with message and query fields",
      "Use DATE_FORMAT instead of STRFTIME for date formatting",
      "Analyze seasonal patterns and trends",
      "Consider competitor discounts and consumer index",
      "Use appropriate aggregations and time-based analysis",
      "Focus on practical insights for SMB owners"
    ],
    response_format: {
      message: "Explanation of the analysis",
      query: "The SQL query using MySQL compatible functions"
    }
  };

  try {
    const response = await generateText({
      model: google("gemini-1.5-flash-latest"),
      prompt: `Based on this request: "${prompt}", generate a MySQL-compatible SQL query to analyze product demand and forecast trends. Use DATE_FORMAT instead of STRFTIME for date operations. Include seasonal patterns, competitor impact, and consumer behavior. Return as JSON with 'message' and 'query' fields. ${JSON.stringify(system_prompt)}`,
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

const analyzeDemandData = (data) => {
  return {
    current_trend: calculateTrend(data),
    seasonal_pattern: identifySeasonality(data),
    competitor_impact: assessCompetitorImpact(data),
    forecast: generateForecast(data)
  };
};

const calculateTrend = (data) => {
  const volumes = data.map(d => d.Sales_Volume);
  const avg = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const trend = volumes[volumes.length - 1] > avg ? 'increasing' : 'decreasing';
  return {
    trend,
    average_volume: Math.round(avg),
    growth_rate: ((volumes[volumes.length - 1] - volumes[0]) / volumes[0] * 100).toFixed(1)
  };
};

const identifySeasonality = (data) => {
  const seasonalAverages = {};
  data.forEach(d => {
    if (!seasonalAverages[d.Season]) {
      seasonalAverages[d.Season] = { total: 0, count: 0 };
    }
    seasonalAverages[d.Season].total += d.Sales_Volume;
    seasonalAverages[d.Season].count++;
  });

  return Object.entries(seasonalAverages)
    .map(([season, stats]) => ({
      season,
      average_volume: Math.round(stats.total / stats.count)
    }))
    .sort((a, b) => b.average_volume - a.average_volume); // Sort by volume descending
};

const assessCompetitorImpact = (data) => {
  const impactAnalysis = data.map(d => ({
    discount: d.Competitor_Discount,
    sales_impact: d.Sales_Volume
  }));

  const discountCorrelation = calculateDiscountCorrelation(impactAnalysis);

  return {
    high_impact_threshold: Math.max(...data.map(d => d.Competitor_Discount)),
    average_impact: Math.round(impactAnalysis.reduce((a, b) => a + b.sales_impact, 0) / impactAnalysis.length),
    discount_correlation: discountCorrelation.toFixed(2),
    impact_strength: discountCorrelation > 0.5 ? 'strong' : discountCorrelation > 0.3 ? 'moderate' : 'weak'
  };
};

const calculateDiscountCorrelation = (data) => {
  const n = data.length;
  const sumX = data.reduce((acc, val) => acc + val.discount, 0);
  const sumY = data.reduce((acc, val) => acc + val.sales_impact, 0);
  const sumXY = data.reduce((acc, val) => acc + val.discount * val.sales_impact, 0);
  const sumX2 = data.reduce((acc, val) => acc + val.discount * val.discount, 0);
  const sumY2 = data.reduce((acc, val) => acc + val.sales_impact * val.sales_impact, 0);

  const numerator = (n * sumXY) - (sumX * sumY);
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

const generateForecast = (data) => {
  const recentData = data.slice(-3);
  const weightedForecast = calculateWeightedForecast(recentData);
  
  return {
    next_period_forecast: Math.round(weightedForecast),
    confidence_level: calculateConfidenceLevel(data),
    factors: {
      seasonal_strength: calculateSeasonalStrength(data),
      consumer_sentiment: averageConsumerIndex(data)
    }
  };
};

const calculateWeightedForecast = (recentData) => {
  const weights = [0.5, 0.3, 0.2]; // Most recent data has highest weight
  return recentData.reduce((acc, curr, idx) => acc + curr.Sales_Volume * weights[idx], 0);
};

const calculateConfidenceLevel = (data) => {
  const volatility = calculateVolatility(data.map(d => d.Sales_Volume));
  const consumerConfidence = calculateConsumerConfidence(data);
  const seasonalityStrength = calculateSeasonalStrength(data);
  
  // Combine factors with weights
  const confidence = (100 - volatility) * 0.4 + consumerConfidence * 0.3 + seasonalityStrength * 0.3;
  return Math.min(100, Math.max(0, confidence)).toFixed(1);
};

const calculateVolatility = (values) => {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  return Math.sqrt(variance) / avg * 100;
};

const calculateConsumerConfidence = (data) => {
  const avgIndex = averageConsumerIndex(data);
  return Math.min(100, (avgIndex / 100) * 100);
};

const calculateSeasonalStrength = (data) => {
  const seasonalVariance = calculateVariance(Object.values(
    data.reduce((acc, curr) => {
      if (!acc[curr.Season]) {
        acc[curr.Season] = [];
      }
      acc[curr.Season].push(curr.Sales_Volume);
      return acc;
    }, {})
  ).map(volumes => calculateMean(volumes)));

  return Math.min(100, (seasonalVariance / calculateMean(data.map(d => d.Sales_Volume))) * 100).toFixed(1);
};

const calculateVariance = (values) => {
  const mean = calculateMean(values);
  return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
};

const calculateMean = (values) => values.reduce((a, b) => a + b, 0) / values.length;

const averageConsumerIndex = (data) => {
  return Math.round(data.reduce((a, b) => a + b.Consumer_Index, 0) / data.length);
};

const access_db = async (message) => {
  let connection;
  try {
    const sqlQuery = await generateSQLQuery(message);
    if (!sqlQuery) {
      throw new Error("Failed to generate SQL query");
    }
    
    connection = await getConnection();
    const [rows] = await connection.execute(sqlQuery);
    
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("No data found for the given criteria");
    }
    
    const analysis = analyzeDemandData(rows);
    
    return { 
      success: true, 
      data: rows,
      analysis,
      message: generateInsightMessage(analysis)
    };
  } catch (error) {
    console.error("Error in accessing Database:", error);
    return { 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error("Error closing database connection:", error);
      }
    }
  }
};

const generateInsightMessage = (analysis) => {
  const trends = [
    `Sales are ${analysis.current_trend.trend} with ${analysis.current_trend.growth_rate}% growth`,
    `Best performing season: ${analysis.seasonal_pattern[0]?.season || 'N/A'}`,
    `Forecast confidence: ${analysis.forecast.confidence_level}%`,
    `Consumer sentiment index: ${analysis.forecast.factors.consumer_sentiment}`,
    `Competitor impact is ${analysis.competitor_impact.impact_strength} (correlation: ${analysis.competitor_impact.discount_correlation})`
  ];

  return trends.join('\n- ');
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ 
        error: "Invalid messages format",
        success: false 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.content) {
      return new Response(JSON.stringify({ 
        error: "Invalid message content",
        success: false 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await access_db(lastMessage.content);
    
    if (!result.success) {
      return new Response(JSON.stringify({ 
        error: result.error,
        details: result.details,
        success: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      ...result,
      success: true
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      success: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}