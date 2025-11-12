import React, { useState } from 'react';

const MessageInput = ({ conversation, onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !conversation) return;
    
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  if (!conversation) {
    return (
      <div className="border-t border-gray-700 p-4 text-gray-500">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="border-t border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;