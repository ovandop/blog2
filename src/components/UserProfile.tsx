import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, FileText, Activity, Eye, Heart, MessageCircle, Image as ImageIcon, Link, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { usersAPI, siteSettingsAPI, postsAPI, activitiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UserProfileProps {
  selectedUserId?: string | null;
  onBack?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ selectedUserId, onBack }) => {
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (selectedUserId) {
      loadUserProfile(selectedUserId);
    }
  }, [selectedUserId]);

  const loadUserProfile = async (userId: string) => {
    setLoading(true);
    try {
      const [user, settings, posts, activities] = await Promise.all([
        usersAPI.getById(userId),
        siteSettingsAPI.getPublicSettings(userId),
        postsAPI.getAll(userId),
        activitiesAPI.getAll(userId)
      ]);

      setSelectedUser(user);
      setUserSettings(settings);
      setUserPosts(posts);
      setUserActivities(activities);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    try {
      await postsAPI.toggleLike(postId);
      // Reload user posts to update like count
      const posts = await postsAPI.getAll(selectedUser._id);
      setUserPosts(posts);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const openImageModal = (post: any, imageIndex: number = 0) => {
    setSelectedPost(post);
    setCurrentImageIndex(imageIndex);
  };

  const closeImageModal = () => {
    setSelectedPost(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedPost && selectedPost.images && currentImageIndex < selectedPost.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const isLiked = (post: any) => {
    return currentUser && post.likes && post.likes.some((like: any) => like.userId === currentUser.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Usuario no encontrado</h2>
          <button
            onClick={onBack}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg border-2 border-black hover:bg-teal-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-md mx-auto bg-white min-h-screen">
          {/* Header with back button */}
          <div className="sticky top-20 bg-white border-b border-gray-200 p-4 z-30 flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">{selectedUser.name}</h1>
          </div>

          {/* User Profile Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              {/* Profile Picture */}
              <div className="w-20 h-20 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-black">
                <span className="text-2xl font-bold text-white">
                  {selectedUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </span>
              </div>

              {/* User Stats */}
              <div className="flex-1">
                <div className="flex justify-around text-center">
                  <div>
                    <div className="font-bold text-lg">{userPosts.length}</div>
                    <div className="text-sm text-gray-600">publicaciones</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">0</div>
                    <div className="text-sm text-gray-600">seguidores</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">0</div>
                    <div className="text-sm text-gray-600">seguidos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div>
              <h2 className="font-semibold text-gray-800">{selectedUser.name}</h2>
              <p className="text-gray-600 text-sm mt-1">
                {userSettings?.heroDescription || `Bienvenido al perfil de ${selectedUser.name}`}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Miembro desde {new Date(selectedUser.createdAt).getFullYear()}
              </p>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="p-4">
            {userPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">Sin publicaciones aún</h3>
                <p className="text-gray-500">
                  {selectedUser.name} no ha compartido ninguna foto
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {userPosts.map((post: any) => (
                  <div
                    key={post._id}
                    className="aspect-square bg-gray-100 cursor-pointer relative"
                    onClick={() => openImageModal(post, 0)}
                  >
                    {post.images && post.images.length > 0 ? (
                      <img
                        src={post.images[0].data}
                        alt={post.images[0].name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <ImageIcon size={24} className="text-gray-400" />
                      </div>
                    )}
                    {post.images && post.images.length > 1 && (
                      <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white px-1 py-0.5 rounded text-xs">
                        {post.images.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={32} />
            </button>

            {/* Previous Button */}
            {selectedPost.images && selectedPost.images.length > 1 && currentImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeft size={48} />
              </button>
            )}

            {/* Next Button */}
            {selectedPost.images && selectedPost.images.length > 1 && currentImageIndex < selectedPost.images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
              >
                <ChevronRight size={48} />
              </button>
            )}

            {/* Image */}
            {selectedPost.images && selectedPost.images[currentImageIndex] && (
              <img
                src={selectedPost.images[currentImageIndex].data}
                alt={selectedPost.images[currentImageIndex].name}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Image Counter */}
            {selectedPost.images && selectedPost.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {selectedPost.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};