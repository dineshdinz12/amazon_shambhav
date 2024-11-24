'use client';

import { useState } from 'react';
import { get_answer } from '../api/query-resolver/route';
import Markdown from 'markdown-to-jsx';
import './page.css';

export default function Home() {
  const [generation, set_generation] = useState([]);
  const [loading, set_loading] = useState(false);
  const [user_prompt, set_user_prompt] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = [
    "How can I scale my business with limited resources?",
    "What are some effective marketing strategies for SMBs?",
    "How can I reduce operational costs?",
    "What tools can improve team productivity?",
  ];

  const handleSuggestionClick = (suggestion) => {
    set_user_prompt(suggestion);
    setShowSuggestions(false);
  };

  const handle_submit = async (e) => {
    e.preventDefault();

    if (user_prompt.trim() === '') {
      alert('Please enter a valid question or suggestion.');
      return;
    }

    set_loading(true);

    const user_message = { text: user_prompt, type: 'user' };
    set_generation((prev) => [...prev, user_message]);

    const result = await get_answer(user_prompt);

    const bot_message = { text: result.text, type: 'bot' };
    set_generation((prev) => [...prev, bot_message]);

    set_user_prompt('');
    set_loading(false);
    setShowSuggestions(false);
  };

  return (
    <div className="entire">
      <header className="header">
        <h1>Customized SMB Strategy Chatbot</h1>
      </header>

      {showSuggestions && (
        <div className="suggestions">
          <h2>Ask a Question:</h2>
          <div className="suggestion-buttons">
            {suggestions.map((s, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(s)}
                className="suggestion-btn"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container1">
        {generation.map((message, index) => (
          <div
            key={index}
            className={message.type === 'user' ? 'user-message' : 'bot-message'}
          >
            <Markdown>{message.text}</Markdown>
          </div>
        ))}
        {loading && <p className="loading">Loading...</p>}
      </div>

      <form onSubmit={handle_submit} className="container2">
        <input
          type="text"
          value={user_prompt}
          onChange={(e) => set_user_prompt(e.target.value)}
          placeholder="Ask your question..."
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}
