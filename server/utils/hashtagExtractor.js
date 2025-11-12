// Function to extract hashtags from text
const extractHashtags = (text) => {
  if (!text) return [];
  
  // Regular expression to match hashtags
  const hashtagRegex = /#(\w+)/g;
  
  // Extract all hashtags
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  // Remove the # symbol and convert to lowercase
  const hashtags = matches.map(tag => tag.substring(1).toLowerCase());
  
  // Remove duplicates
  return [...new Set(hashtags)];
};

module.exports = { extractHashtags };