import React, { useState, useEffect } from 'react';
import { Save, Upload, X, Plus, Link2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postsAPI, imagesAPI } from '../services/api';

interface DashboardProps {
  onDataUpdate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onDataUpdate }) => {
  const { user } = useAuth();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [link, setLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Limit to 10 images
    const limitedFiles = files.slice(0, 10);
    setSelectedImages(limitedFiles);

    // Create preview URLs
    const previews = limitedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewImages[index]);
    
    setSelectedImages(newImages);
    setPreviewImages(newPreviews);
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  const handlePublish = async () => {
    if (selectedImages.length === 0 || !caption.trim()) {
      alert('Debes seleccionar al menos una imagen y agregar un texto');
      return;
    }

    setIsUploading(true);
    const progressInterval = simulateUploadProgress();

    try {
      // Upload images first
      const uploadedImages = [];
      for (const image of selectedImages) {
        const uploadedImage = await imagesAPI.upload(image);
        uploadedImages.push(uploadedImage);
      }

      // Create post with uploaded images
      const postData = {
        title: 'Publicación Social',
        content: caption,
        images: uploadedImages,
        link: link.trim() || undefined,
        date: new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      await postsAPI.create(postData);
      
      setUploadProgress(100);
      setTimeout(() => {
        // Reset form
        setSelectedImages([]);
        setPreviewImages([]);
        setCaption('');
        setLink('');
        setIsUploading(false);
        setUploadProgress(0);
        onDataUpdate();
        alert('¡Publicación creada exitosamente!');
      }, 500);

    } catch (error) {
      console.error('Failed to publish:', error);
      alert('Error al publicar. Inténtalo de nuevo.');
      setIsUploading(false);
      setUploadProgress(0);
      clearInterval(progressInterval);
    }
  };

  const clearAll = () => {
    // Revoke all preview URLs
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setPreviewImages([]);
    setCaption('');
    setLink('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">Debes iniciar sesión para acceder al dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Publicar</h1>
          <p className="text-lg text-gray-600">Comparte tus momentos con la comunidad</p>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mb-6 bg-white p-4 rounded-lg border-4 border-black shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Upload className="text-teal-600" size={20} />
              <span className="font-medium text-gray-800">Publicando...</span>
              <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-black">
              <div 
                className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main Publishing Form */}
        <div className="bg-white rounded-2xl shadow-lg border-4 border-black p-6">
          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Seleccionar Fotos (máximo 10)
            </label>
            
            {selectedImages.length === 0 ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="image-upload"
                  className={`${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 cursor-pointer'} 
                    w-full h-48 border-4 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center transition-colors`}
                >
                  <Upload size={48} className="text-white mb-4" />
                  <p className="text-white font-medium text-lg">
                    {isUploading ? 'Subiendo...' : 'Toca para seleccionar fotos'}
                  </p>
                  <p className="text-teal-100 text-sm mt-2">
                    Puedes seleccionar hasta 10 imágenes
                  </p>
                </label>
              </div>
            ) : (
              <div>
                {/* Image Previews */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-black"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors border-2 border-black"
                        disabled={isUploading}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add more button */}
                  {selectedImages.length < 10 && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || []);
                          const remainingSlots = 10 - selectedImages.length;
                          const filesToAdd = newFiles.slice(0, remainingSlots);
                          
                          setSelectedImages([...selectedImages, ...filesToAdd]);
                          
                          const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
                          setPreviewImages([...previewImages, ...newPreviews]);
                        }}
                        className="hidden"
                        id="add-more-images"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="add-more-images"
                        className={`${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'} 
                          w-full h-32 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center transition-colors`}
                      >
                        <Plus size={32} className="text-gray-600" />
                      </label>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {selectedImages.length}/10 imágenes seleccionadas
                </p>
              </div>
            )}
          </div>

          {/* Caption Section */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Texto de la publicación
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escribe algo sobre tu publicación..."
              className="w-full p-4 border-2 border-black rounded-lg h-32 resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              disabled={isUploading}
            />
            <p className="text-sm text-gray-500 mt-1">
              {caption.length}/500 caracteres
            </p>
          </div>

          {/* Link Section */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Enlace (opcional)
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://ejemplo.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePublish}
              disabled={isUploading || selectedImages.length === 0 || !caption.trim()}
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save size={20} />
              )}
              {isUploading ? 'Publicando...' : 'Publicar'}
            </button>
            
            <button
              onClick={clearAll}
              disabled={isUploading}
              className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-teal-50 rounded-lg border-2 border-black p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Consejos para una buena publicación</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Usa imágenes de buena calidad y bien iluminadas</li>
            <li>• Escribe un texto descriptivo e interesante</li>
            <li>• Puedes agregar hasta 10 fotos en una sola publicación</li>
            <li>• Los enlaces son opcionales pero pueden ser útiles para compartir más información</li>
          </ul>
        </div>
      </div>
    </div>
  );
};