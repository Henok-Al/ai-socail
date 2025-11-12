import React from 'react';
import Messaging from '../components/messaging/Messaging';
import ProtectedRoute from '../components/ProtectedRoute';

const MessagingPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark-900">
        <Messaging />
      </div>
    </ProtectedRoute>
  );
};

export default MessagingPage;