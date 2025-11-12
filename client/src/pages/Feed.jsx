import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts/feed', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('An error occurred while fetching posts');
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostLike = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <h1 className="text-2xl font-bold text-white mb-4">Welcome to your feed, {user?.username}!</h1>
            
            <CreatePost onPostCreated={handlePostCreated} />
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-300">Loading posts...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300">No posts yet. Be the first to create one!</p>
              </div>
            ) : (
              <div>
                {posts.map(post => (
                  <PostCard 
                    key={post._id} 
                    post={post} 
                    onLike={handlePostLike} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;