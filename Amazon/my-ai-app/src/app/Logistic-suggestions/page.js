// app/logistics/page.js
"use client";
import { useState } from 'react';
import { FaTruck, FaSpinner } from 'react-icons/fa';
import { BiErrorCircle } from 'react-icons/bi';
import { FaRegComments } from 'react-icons/fa';
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

  const renderErrorMessage = () => (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-center gap-2">
      <BiErrorCircle className="text-red-500" size={20} />
      <span className="text-red-700">{error}</span>
    </div>
  );

  const renderPartnerCard = (partner) => (
    <div
      key={partner.id}
      className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{partner.partner_name}</h3>
          <p className="text-gray-600">{partner.region}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {formatCurrency(partner.base_rate_per_kg)}/kg
          </div>
          <div className="text-sm text-gray-500">
            {formatDeliveryDays(partner.avg_delivery_time_days)} avg. delivery
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div
          className={`text-sm px-2 py-1 rounded ${
            partner.reliability_score >= 0.8
              ? 'bg-green-50 text-green-700'
              : partner.reliability_score >= 0.6
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {formatReliabilityScore(partner.reliability_score)} reliable
        </div>
        <div className="text-sm text-gray-500">{partner.service_type}</div>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Contact: {partner.contact_person} ({partner.contact_email})
      </div>
      {/* Message Icon for Negotiation */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => handleNegotiate(partner.id)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <FaRegComments />
          <span>Negotiate</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gray-700 rounded-full text-white">
            <FaTruck size={24} />
          </div>
          <h1 className="text-2xl font-bold">Global Logistics Partner Finder</h1>
        </div>

        {/* Quick Search Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
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
              className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              {text}
            </button>
          ))}
        </div>

        {/* Search Form */}
        <form id="search-form" onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for logistics partners..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && renderErrorMessage()}

        {/* Results */}
        {results && (
          <div className="space-y-4">
            {results.length > 0 ? (
              results.map(renderPartnerCard)
            ) : (
              <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
                No logistics partners found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}