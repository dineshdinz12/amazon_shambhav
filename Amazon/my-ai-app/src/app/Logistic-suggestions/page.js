"use client";
import { useState } from 'react';
import { Shield, Search, AlertCircle, MessageSquare, Truck, Loader2, MapPin, Clock, DollarSign, BarChart3 } from 'lucide-react';

export default function LogisticsPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/logistic-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ 
            role: 'user', 
            content: query 
          }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch results');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Operation failed');
      }
      
      if (!Array.isArray(data.partners)) {
        throw new Error('Invalid response format');
      }
      
      setResults(data.partners);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An unexpected error occurred');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (searchQuery) => {
    setQuery(searchQuery);
    const form = document.getElementById('search-form');
    if (form) {
      form.requestSubmit();
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `$${Number(value).toFixed(2)}`;
  };

  const formatReliabilityScore = (score) => {
    if (score === null || score === undefined || isNaN(score)) return 'N/A';
    const percentage = Number(score) > 1 ? Number(score) : Number(score) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  const formatDeliveryDays = (days) => {
    if (days === null || days === undefined || isNaN(days)) return 'N/A';
    const numDays = Number(days);
    return `${numDays} ${numDays === 1 ? 'day' : 'days'}`;
  };

  const getReliabilityColor = (score) => {
    if (score >= 0.8) return 'bg-emerald-400/20 text-emerald-400';
    if (score >= 0.6) return 'bg-yellow-400/20 text-yellow-400';
    return 'bg-red-400/20 text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute h-64 w-64 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `scale(${Math.random() * 2 + 1})`,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Truck className="w-12 h-12 text-indigo-400" />
            <h1 className="text-4xl font-bold text-white">Global Logistics Partner Finder</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Find and connect with reliable logistics partners worldwide
          </p>
        </div>

        {/* Quick Search Section */}
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Search className="text-indigo-400" size={24} />
            <h2 className="text-xl font-semibold text-white">Quick Search</h2>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              'Partners in Asia',
              'European Shipping',
              'Cost-effective Options',
              'Express Delivery Partners',
              'High Reliability Partners'
            ].map((text) => (
              <button
                key={text}
                onClick={() => handleQuickSearch(text)}
                className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
              >
                {text}
              </button>
            ))}
          </div>

          <form id="search-form" onSubmit={handleSearch}>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for logistics partners..."
                className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 rounded-xl font-medium text-white bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 text-red-300">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Results Grid */}
        {results && (
          <div className="grid gap-6 md:grid-cols-2">
            {results.length > 0 ? (
              results.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{partner.partner_name}</h3>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={16} />
                        <span>{partner.region}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-indigo-400 font-medium">
                        <DollarSign size={16} />
                        <span>{formatCurrency(partner.base_rate_per_kg)}/kg</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 mt-1">
                        <Clock size={16} />
                        <span>{formatDeliveryDays(partner.avg_delivery_time_days)} avg.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getReliabilityColor(partner.reliability_score)}`}>
                      <BarChart3 size={16} />
                      <span>{formatReliabilityScore(partner.reliability_score)} reliable</span>
                    </div>
                    <div className="text-gray-400">{partner.service_type}</div>
                  </div>

                  <div className="text-gray-400 mb-4">
                    Contact: {partner.contact_person} ({partner.contact_email})
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleNegotiate(partner.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                    >
                      <MessageSquare size={18} />
                      <span>Negotiate</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 text-center text-gray-400">
                No logistics partners found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}