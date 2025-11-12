import React, { useState } from 'react';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const Messaging = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  const handleSendMessage = async (content) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/conversations/${selectedConversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Message sent successfully
        // In a real app, you would update the UI with the new message
        console.log('Message sent:', data.message);
      } else {
        console.error('Send message error:', data.message);
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  return (
    <div className="flex h-screen bg-dark-900">
      <div className="w-1/3">
        <ConversationList onSelectConversation={setSelectedConversation} />
      </div>
      
      <div className="flex-1 flex flex-col">
        <MessageList conversation={selectedConversation} />
        <MessageInput 
          conversation={selectedConversation} 
          onSendMessage={handleSendMessage} 
        />
      </div>
    </div>
  );
};

export default Messaging;