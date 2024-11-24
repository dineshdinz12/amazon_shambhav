'use client';
import { useState } from 'react';
import { get_answer } from '../api/demand-forecasting/route';
import './page.css';

export default function Home() {
  const [generation, set_generation] = useState([]);
  const [loading, set_loading] = useState(false);
  const [user_prompt, set_user_prompt] = useState('');

  const handle_submit = async (e) => {
    e.preventDefault();

    if (user_prompt.trim() === '') {
      alert('Please enter your demand analysis question');
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
  };

  return (
    <div className="entire">
      <div className="health">DEMAND FORECASTING ANALYSIS</div>
      
      <div className="container1">
        <div className="message-container">
          {generation.map((message, index) => (
            <div
              key={index}
              className={message.type === 'user' ? 'user-message' : 'bot-message'}
            >
              {message.text}
            </div>
          ))}
          {loading && <div className="bot-message">Analyzing demand data...</div>}
        </div>
      </div>

      <div className="container2">
        <form onSubmit={handle_submit} className="input-form">
          <input
            type="text"
            value={user_prompt}
            onChange={(e) => set_user_prompt(e.target.value)}
            placeholder="Ask about demand patterns, trends, or forecasts..."
            className="input-field"
          />
          <button type="submit" className="send-button">
            Analyze
          </button>
        </form>
      </div>
    </div>
  );
}