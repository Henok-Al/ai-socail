import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';

const PostCard = ({ post, onLike }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes.includes(user?.id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setLiked(!liked);
        setLikeCount(data.likesCount);
        onLike(data.post);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: comment.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setComment('');
        onLike(data.post); // Update the post with new comment
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  return (
    <div className="bg-dark-800 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-3">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-3" />
        <div>
          <h3 className="text-white font-semibold">{post.author.username}</h3>
          <p className="text-gray-400 text-sm">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
      
      <p className="text-gray-300 mb-4">{post.content}</p>
      
      {post.mediaUrl && (
        <div className="mb-4">
          <img 
            src={post.mediaUrl} 
            alt="Post media" 
            className="rounded-lg w-full object-cover max-h-96"
          />
        </div>
      )}
      
      <div className="flex items-center mb-3">
        <button
          onClick={handleLike}
          className={`flex items-center px-3 py-1 rounded-md ${
            liked 
              ? 'text-red-500 hover:text-red-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            viewBox="0 0 20 20" 
            fill={liked ? "currentColor" : "none"} 
            stroke="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>{likeCount}</span>
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center px-3 py-1 rounded-md text-gray-400 hover:text-gray-300"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          <span>{post.comments.length}</span>
        </button>
      </div>
      
      {showComments && (
        <div className="mt-4 border-t border-dark-700 pt-4">
          {/* Display existing comments */}
          {post.comments.map((comment) => (
            <div key={comment._id} className="mb-3">
              <div className="flex items-center mb-1">
                <span className="text-white font-semibold text-sm">{comment.userId?.username || 'Unknown User'}</span>
                <span className="text-gray-500 text-xs ml-2">
                  {new Date(comment.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{comment.content}</p>
            </div>
          ))}
          
          {/* Add new comment form */}
          <form onSubmit={handleAddComment} className="mt-3">
            <div className="flex">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-dark-700 text-white rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;