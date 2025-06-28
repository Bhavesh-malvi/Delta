import { useState, useEffect, useCallback } from 'react';
import './AutoSlider.css';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS } from '../../config/api';
import logo1 from '../../assets/img/logo1.jpg';

const AutoSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch home content data
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axiosInstance.get(ENDPOINTS.HOME_CONTENT);
        console.log('Fetched data:', response.data);
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setContent(response.data.data);
        } else {
          setError('Invalid data format received');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to fetch content: ' + err.message);
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return logo1;
    
    // If the image path already contains the full URL, use it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with a slash, it's a relative path from the API base
    if (imagePath.startsWith('/')) {
      return `https://delta-teal.vercel.app${imagePath}`;
    }
    
    // If it's just a filename, construct the full URL
    return `${UPLOAD_URLS.HOME_CONTENT}/${imagePath}`;
  };

  const nextSlide = useCallback(() => {
    if (content.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
    }
  }, [content.length]);

  useEffect(() => {
    const intervalId = setInterval(nextSlide, 3000); // Change slide every 3 seconds
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [nextSlide]);

  if (loading) {
    return <div className="slider-container loading">Loading...</div>;
  }

  if (error) {
    return <div className="slider-container error">{error}</div>;
  }

  if (!content.length) {
    return <div className="slider-container empty">No content available</div>;
  }

  return (
    <div className="slider-container">
      <div className="slider-content">
        <AnimatePresence mode="wait">
          <motion.div 
            className="slide-title"
            key={`title-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2>{content[currentIndex].title}</h2>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={getImageUrl(content[currentIndex].image)}
            alt={content[currentIndex].title}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="slider-image"
            onError={(e) => {
              console.error('Image failed to load:', e.target.src);
              e.target.onerror = null;
              e.target.src = logo1;
            }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AutoSlider;