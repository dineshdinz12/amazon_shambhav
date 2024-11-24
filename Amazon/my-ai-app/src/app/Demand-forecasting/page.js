"use client"

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, BrainCircuit, Search, Loader2, MessageSquare, Sparkles, Calendar, Percent, Activity, HelpCircle } from "lucide-react";
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, ResponsiveContainer } from 'recharts';

// Generate random number within range
const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate random date within last year
const randomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - randomInRange(0, 365));
  return date.toISOString().split('T')[0];
};

// Generate dummy data (same as before)
const generateDummyData = (count = 5) => {
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const products = ['Product A', 'Product B', 'Product C', 'Product D'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  
  return Array.from({ length: count }, () => ({
    Date: randomDate(),
    Region: regions[randomInRange(0, regions.length - 1)],
    Product: products[randomInRange(0, products.length - 1)],
    Season: seasons[randomInRange(0, seasons.length - 1)],
    Sales_Volume: randomInRange(100, 1000),
    Competitor_Discount: randomInRange(0, 30),
    Consumer_Index: randomInRange(60, 100)
  }));
};

// Generate dummy analysis when no real data is available
const generateDummyAnalysis = () => ({
  current_trend: {
    trend: ['increasing', 'decreasing', 'stable'][randomInRange(0, 2)],
    average_volume: randomInRange(500, 1000),
    growth_rate: (Math.random() * 10 - 5).toFixed(1)
  },
  seasonal_pattern: ['Spring', 'Summer', 'Fall', 'Winter'].map(season => ({
    season,
    average_volume: randomInRange(500, 1500)
  })),
  competitor_impact: {
    high_impact_threshold: randomInRange(20, 30),
    average_impact: randomInRange(50, 150),
    discount_correlation: (Math.random() * 0.8 + 0.1).toFixed(2),
    impact_strength: ['strong', 'moderate', 'weak'][randomInRange(0, 2)]
  },
  forecast: {
    next_period_forecast: randomInRange(800, 1200),
    confidence_level: randomInRange(60, 95).toFixed(1),
    factors: {
      seasonal_strength: randomInRange(50, 90).toFixed(1),
      consumer_sentiment: randomInRange(70, 90)
    }
  }
});

// Initial zero state for analysis
const initialAnalysis = {
  current_trend: {
    trend: 'N/A',
    average_volume: 0,
    growth_rate: '0.0'
  },
  seasonal_pattern: ['Spring', 'Summer', 'Fall', 'Winter'].map(season => ({
    season,
    average_volume: 0
  })),
  competitor_impact: {
    high_impact_threshold: 0,
    average_impact: 0,
    discount_correlation: '0.00',
    impact_strength: 'N/A'
  },
  forecast: {
    next_period_forecast: 0,
    confidence_level: '0.0',
    factors: {
      seasonal_strength: '0.0',
      consumer_sentiment: 0
    }
  }
};

const StatBox = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-700/50 rounded-xl">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  </motion.div>
);

const InsightCard = ({ title, value, icon: Icon }) => (
  <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-400" />
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-white font-medium">{value}</p>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <BrainCircuit className="w-12 h-12 text-gray-500 mb-4" />
    <h3 className="text-gray-300 text-lg font-medium mb-2">No Analysis Available</h3>
    <p className="text-gray-500">Ask a question about demand trends to get started</p>
  </div>
);

const DemandForecastingPage = () => {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userPrompt, setUserPrompt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    setLoading(true);
    const userMessage = { 
      text: userPrompt, 
      type: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Simulate API call with dummy data when real data is not available
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const dummyData = generateDummyData(10);
      const dummyAnalysis = generateDummyAnalysis();
      
      setAnalysis(dummyAnalysis);
      
      const botMessage = { 
        text: "Based on the available data, here's your demand analysis:",
        type: 'bot',
        timestamp: new Date().toISOString(),
        data: dummyData,
        analysis: dummyAnalysis
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I couldn't process that request. Please try again.", 
        type: 'bot',
        timestamp: new Date().toISOString()
      }]);
    }

    setUserPrompt('');
    setLoading(false);
  };

  const quickPrompts = [
    "What's the demand forecast for next month?",
    "Show seasonal sales patterns",
    "How do competitor discounts affect sales?",
    "Analyze consumer sentiment impact",
    "Identify peak selling periods"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="relative z-10">
        <motion.div 
          className="pt-8 pb-6 px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <Sparkles className="w-8 h-8 text-gray-300" />
              <h1 className="text-3xl font-bold text-white">
                SMB Demand Forecasting
              </h1>
            </div>
            <p className="text-gray-400 ml-12">AI-powered insights for your business growth</p>
          </div>
        </motion.div>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatBox 
              icon={TrendingUp} 
              label="Growth Rate" 
              value={`${analysis?.current_trend?.growth_rate || '0.0'}%`}
              delay={0.2} 
            />
            <StatBox 
              icon={Calendar} 
              label="Forecast Confidence" 
              value={`${analysis?.forecast?.confidence_level || '0.0'}%`}
              delay={0.3} 
            />
            <StatBox 
              icon={Activity} 
              label="Consumer Sentiment" 
              value={analysis?.forecast?.factors?.consumer_sentiment || 'N/A'}
              delay={0.4} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="text-gray-300 font-medium mb-4">Quick Analysis</div>
              {quickPrompts.map((prompt, index) => (
                <button
                  key={prompt}
                  onClick={() => setUserPrompt(prompt)}
                  className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-left text-gray-300 text-sm border border-gray-700/50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="lg:col-span-3 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <EmptyState />
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] rounded-2xl p-4 ${
                        message.type === 'user' ? 'bg-gray-700' : 'bg-gray-800/50'
                      }`}>
                        <div className="flex items-start gap-3">
                          {message.type === 'user' ? (
                            <MessageSquare className="w-4 h-4 text-white" />
                          ) : (
                            <BrainCircuit className="w-4 h-4 text-white" />
                          )}
                          <div className="text-white">{message.text}</div>
                        </div>
                        {message.analysis && (
                          <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <InsightCard 
                                title="Seasonal Impact" 
                                value={`${message.analysis.forecast.factors.seasonal_strength}%`}
                                icon={Calendar}
                              />
                              <InsightCard 
                                title="Competitor Impact" 
                                value={`${message.analysis.competitor_impact.average_impact} units`}
                                icon={Percent}
                              />
                            </div>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={message.analysis.seasonal_pattern}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                  <XAxis dataKey="season" stroke="#9CA3AF" />
                                  <YAxis stroke="#9CA3AF" />
                                  <Tooltip />
                                  <Line type="monotone" dataKey="average_volume" stroke="#60A5FA" strokeWidth={2} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3 bg-gray-800/50 rounded-2xl p-4">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <div className="text-white">Analyzing demand patterns...</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-700/50">
                <form onSubmit={handleSubmit} className="flex gap-4">
                  <input
                    type="text"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Ask about product demand, seasonal trends, or market factors..."
                    className="flex-1 bg-gray-900/50 text-white placeholder-gray-500 px-4 py-3 rounded-xl border border-gray-700/50"
                  />
                  <button
                    type="submit"
                    disabled={loading || !userPrompt.trim()}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <BrainCircuit className="w-4 h-4" />
                        Analyze
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemandForecastingPage;