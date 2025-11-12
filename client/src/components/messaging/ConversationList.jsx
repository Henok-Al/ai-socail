import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/useAuth';

const ConversationList = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setConversations(data.conversations);
      } else {
        setError(data.message || 'Failed to fetch conversations');
      }
    } catch (err) {
      setError('An error occurred while fetching conversations');
      console.error('Fetch conversations error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading conversations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="border-r border-gray-700 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Messages</h2>
      </div>
      
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No conversations yet. Start a new chat!
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {conversations.map(conversation => (
            <div 
              key={conversation._id}
              className="p-4 hover:bg-gray-800 cursor-pointer"
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-3" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">
                    {conversation.isGroup 
                      ? conversation.group?.name 
                      : conversation.participants
                          .filter(p => p._id !== user.id)[0]?.username || 'Unknown User'}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;