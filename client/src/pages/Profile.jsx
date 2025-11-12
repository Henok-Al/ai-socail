import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  
  const isOwnProfile = currentUser?.username === username;
  
  useEffect(() => {
    fetchUserProfile();
  }, [username]);
  
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setProfileUser(data.user);
        setPosts(data.user.posts);
        setFollowersCount(data.user.followers.length);
        
        // Check if current user is following this user
        if (!isOwnProfile && currentUser) {
          const following = data.user.followers.includes(currentUser.id);
          setIsFollowing(following);
        }
      } else {
        setError(data.message || 'Failed to fetch user profile');
      }
    } catch (err) {
      setError('An error occurred while fetching user profile');
      console.error('Fetch user profile error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollowToggle = async () => {
    if (!profileUser || !currentUser) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/${profileUser._id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
      } else {
        console.error('Follow error:', data.message);
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">User not found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mb-4 md:mb-0 md:mr-6" />
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-white">{profileUser.username}</h1>
                <p className="text-gray-300 mt-2">
                  {profileUser.bio || (isOwnProfile ? "You haven't added a bio yet." : "This user hasn't added a bio yet.")}
                </p>
                <div className="flex justify-center md:justify-start mt-4 space-x-6">
                  <div className="text-center">
                    <p className="text-white text-xl font-bold">{posts.length}</p>
                    <p className="text-gray-400">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-xl font-bold">{followersCount}</p>
                    <p className="text-gray-400">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-xl font-bold">{profileUser.following?.length || 0}</p>
                    <p className="text-gray-400">Following</p>
                  </div>
                </div>
                {!isOwnProfile && (
                  <button 
                    onClick={handleFollowToggle}
                    className={`mt-4 px-4 py-2 rounded-md ${isFollowing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-primary hover:bg-primary-dark'} text-white`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
                {isOwnProfile && (
                  <button className="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white mb-4">Posts</h2>
              {posts.length === 0 ? (
                <p className="text-gray-400">No posts yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((post) => (
                    <div key={post._id} className="bg-dark-800 rounded-lg overflow-hidden">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
                      <div className="p-3">
                        <p className="text-white text-sm truncate">{post.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;