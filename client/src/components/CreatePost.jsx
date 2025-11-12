import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setContent('');
        setIdea('');
        onPostCreated(data.post);
      } else {
        setError(data.message || 'Failed to create post');
      }
    } catch (err) {
      setError('An error occurred while creating the post');
      console.error('Post creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!idea.trim()) {
      setError('Please enter an idea to generate a draft');
      return;
    }
    
    setGenerating(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          prompt: idea,
          systemInstruction: 'Act as a social media content expert'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setContent(data.content);
        setError('');
      } else {
        setError(data.message || 'Failed to generate draft');
      }
    } catch (err) {
      setError('An error occurred while generating the draft');
      console.error('Draft generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-dark-800 rounded-lg p-4 mb-6">
      <div className="flex items-start mb-4">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-3" />
        <div>
          <h3 className="text-white font-semibold">{user?.username}</h3>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Enter your post idea (e.g., 'Tips for productivity')"
            className="w-full bg-dark-700 text-white rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading || generating}
          />
          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={generating || loading || !idea.trim()}
            className="bg-secondary hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed mr-2"
          >
            {generating ? 'Generating...' : 'Generate Draft'}
          </button>
        </div>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full bg-dark-700 text-white rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
          rows="3"
          disabled={loading || generating}
        />
        
        {error && (
          <div className="text-red-500 text-sm mb-3">{error}</div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-gray-400">
            {/* Media upload button would go here */}
          </div>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;