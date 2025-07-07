import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postsAPI, usersAPI } from '../services/api';

interface SocialFeedProps {
  onUserSelect: (userId: string) => void;
}

interface Post {
  _id: string;
  images: Array<{ data: string; name: string }>;
  content: string;
  link?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  likes: Array<{ userId: string }>;
  createdAt: string;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ onUserSelect }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Get all posts from all users
      const allPosts = await postsAPI.getAll();
      setPosts(allPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    try {
      await postsAPI.toggleLike(postId);
      await loadPosts(); // Reload to update like count
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const openImageModal = (post: Post, imageIndex: number = 0) => {
    setSelectedPost(post);
    setCurrentImageIndex(imageIndex);
  };

  const closeImageModal = () => {
    setSelectedPost(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedPost && currentImageIndex < selectedPost.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const isLiked = (post: Post) => {
    return user && post.likes.some(like => like.userId === user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando feed...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-md mx-auto bg-white min-h-screen">
          {/* Header */}
          <div className="sticky top-20 bg-white border-b border-gray-200 p-4 z-30">
            <h1 className="text-2xl font-bold text-center">Mi Blog Social</h1>
          </div>

          {/* Posts Feed */}
          <div className="space-y-0">
            {posts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No hay publicaciones aún</h3>
                <p className="text-gray-500">
                  {user ? 'Sé el primero en compartir algo' : 'Regístrate para ver contenido'}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="border-b border-gray-200">
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onUserSelect(post.userId._id)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-black">
                        <span className="text-sm font-bold text-white">
                          {post.userId.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{post.userId.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="p-2">
                      <MoreHorizontal size={20} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="relative">
                      <div 
                        className="aspect-square bg-gray-100 cursor-pointer"
                        onClick={() => openImageModal(post, 0)}
                      >
                        <img
                          src={post.images[0].data}
                          alt={post.images[0].name}
                          className="w-full h-full object-cover"
                        />
                        {post.images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                            1/{post.images.length}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`p-2 rounded-full transition-colors ${
                            isLiked(post) 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                            <div className={`w-2 h-2 rounded-full ${isLiked(post) ? 'bg-current' : ''}`}></div>
                          </div>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <MessageCircle size={24} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <Share size={24} className="text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Likes Count */}
                    <p className="font-semibold text-sm mb-2">
                      {post.likes.length} {post.likes.length === 1 ? 'burbuja' : 'burbujas'}
                    </p>

                    {/* Caption */}
                    <div className="text-sm">
                      <span className="font-semibold">{post.userId.name}</span>
                      <span className="ml-2">{post.content}</span>
                    </div>

                    {/* Link */}
                    {post.link && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 block"
                      >
                        {post.link}
                      </a>
                    )}

                    {/* Comments placeholder */}
                    <button className="text-gray-500 text-sm mt-2">
                      Ver todos los comentarios
                    </button>

                    {/* Add comment */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                      <input
                        type="text"
                        placeholder="Agrega un comentario..."
                        className="flex-1 text-sm outline-none"
                      />
                      <button className="text-blue-600 font-semibold text-sm">
                        Publicar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
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
            {selectedPost.images.length > 1 && currentImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeft size={48} />
              </button>
            )}

            {/* Next Button */}
            {selectedPost.images.length > 1 && currentImageIndex < selectedPost.images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
              >
                <ChevronRight size={48} />
              </button>
            )}

            {/* Image */}
            <img
              src={selectedPost.images[currentImageIndex].data}
              alt={selectedPost.images[currentImageIndex].name}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Counter */}
            {selectedPost.images.length > 1 && (
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