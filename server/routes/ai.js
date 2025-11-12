const express = require('express');
const { generateContent } = require('../aiService');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * POST /ai/generate
 * Protected route to generate content using AI
 */
router.post('/ai/generate', auth, async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    
    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Prompt is required and must be a non-empty string' 
      });
    }
    
    // Generate content using AI service
    const generatedContent = await generateContent(prompt, systemInstruction);
    
    // Return the generated content
    res.json({
      message: 'Content generated successfully',
      content: generatedContent
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate content', 
      error: error.message 
    });
  }
});

module.exports = router;