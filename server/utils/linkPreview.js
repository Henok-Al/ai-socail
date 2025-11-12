const ogs = require('open-graph-scraper');

// Function to extract link preview metadata
const getLinkPreview = async (url) => {
  try {
    // Validate URL format
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL');
    }
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Extract metadata using open-graph-scraper
    const { result, error } = await ogs({ url });
    
    if (error) {
      throw new Error('Failed to fetch link preview');
    }
    
    // Return preview data
    return {
      url: result.ogUrl || url,
      title: result.ogTitle || result.title || '',
      description: result.ogDescription || result.description || '',
      image: result.ogImage?.url || result.favicon || '',
      siteName: result.ogSiteName || result.siteName || ''
    };
  } catch (error) {
    console.error('Error fetching link preview:', error);
    // Return minimal preview data if extraction fails
    return {
      url,
      title: '',
      description: '',
      image: '',
      siteName: ''
    };
  }
};

// Function to extract URLs from text
const extractUrls = (text) => {
  if (!text) return [];
  
  // Regular expression to match URLs
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  
  // Extract all URLs
  const matches = text.match(urlRegex);
  
  return matches || [];
};

module.exports = { getLinkPreview, extractUrls };