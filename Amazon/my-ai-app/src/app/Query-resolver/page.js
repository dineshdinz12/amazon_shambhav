"use client";

import { useState } from 'react';
import { get_answer } from '../api/query-resolver/route';
import Markdown from 'markdown-to-jsx';
import { MessageCircle, X, Send, Loader2, bot, ChevronDown } from 'lucide-react';

// Custom Markdown components with styling
const MarkdownCustom = ({ children, message }) => {
  const options = {
    overrides: {
      h2: {
        component: ({ children }) => (
          <h2 className="text-lg font-bold text-indigo-400 mt-4 mb-2">{children}</h2>
        ),
      },
      h3: {
        component: ({ children }) => (
          <h3 className="text-md font-semibold text-emerald-400 mt-3 mb-2">{children}</h3>
        ),
      },
      strong: {
        component: ({ children }) => (
          <strong className="text-yellow-400 font-semibold">{children}</strong>
        ),
      },
      p: {
        component: ({ children }) => (
          <p className="my-2 leading-relaxed">{children}</p>
        ),
      },
      ul: {
        component: ({ children }) => (
          <ul className="space-y-1 my-2">{children}</ul>
        ),
      },
      li: {
        component: ({ children }) => (
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400 mt-1">•</span>
            <span>{children}</span>
          </li>
        ),
      },
    },
  };

  return <Markdown options={options}>{children}</Markdown>;
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [generation, setGeneration] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = [
    "How can I scale my business with limited resources?",
    "What are some effective marketing strategies for SMBs?",
    "How can I reduce operational costs?",
    "What tools can improve team productivity?",
  ];

  const handleSuggestionClick = (suggestion) => {
    setUserPrompt(suggestion);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userPrompt.trim() === '') {
      alert('Please enter a valid question or suggestion.');
      return;
    }

    setLoading(true);
    setShowSuggestions(false);

    const userMessage = { text: userPrompt, type: 'user' };
    setGeneration((prev) => [...prev, userMessage]);

    const result = await get_answer(userPrompt);

    const botMessage = { text: result.text, type: 'bot' };
    setGeneration((prev) => [...prev, botMessage]);

    setUserPrompt('');
    setLoading(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Icon Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-500 transition-all duration-300 hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-gray-900 rounded-2xl shadow-2xl w-96 transition-all duration-300 ${isMinimized ? 'h-20' : 'h-[600px]'}`}>
          {/* Chat Header */}
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-t-2xl border-b border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <bot className="text-indigo-400" size={24} />
              <h2 className="text-lg font-semibold text-white">SMB Strategy Assistant</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={minimizeChat}
                className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transform transition-transform ${isMinimized ? 'rotate-180' : ''}`}
                />
              </button>
              <button
                onClick={toggleChat}
                className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col h-[calc(600px-64px)]">
              {/* Main Content Area */}
              <div className="flex-1 overflow-hidden">
                {/* Suggestions Section */}
                {showSuggestions && generation.length === 0 && (
                  <div className="p-4 border-b border-gray-700/50">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Suggested Questions:</h3>
                    <div className="space-y-2">
                      {suggestions.map((s, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(s)}
                          className="w-full p-2 text-left text-sm text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                <div className={`overflow-y-auto ${showSuggestions && generation.length === 0 ? 'h-[calc(100%-200px)]' : 'h-full'}`}>
                  <div className="p-4 space-y-4">
                    {generation.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.type === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-800/80 text-gray-200'
                          }`}
                        >
                          <MarkdownCustom message={message}>{message.text}</MarkdownCustom>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800/80 rounded-2xl px-4 py-2 text-gray-400">
                          <Loader2 className="animate-spin" size={20} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-gray-700/50 bg-gray-800/50 mt-auto"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}