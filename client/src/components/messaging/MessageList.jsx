import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/useAuth';

const MessageList = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
    }
  }, [conversation]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/conversations/${conversation._id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages);
      } else {
        setError(data.message || 'Failed to fetch messages');
      }
    } catch (err) {
      setError('An error occurred while fetching messages');
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation to start messaging
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">
          {conversation.isGroup 
            ? conversation.group?.name 
            : conversation.participants
                .filter(p => p._id !== user.id)[0]?.username || 'Unknown User'}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div 
                key={message._id}
                className={`flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender._id === user.id 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {message.sender._id !== user.id && (
                    <p className="text-xs font-semibold mb-1">
                      {message.sender.username}
                    </p>
                  )}
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;