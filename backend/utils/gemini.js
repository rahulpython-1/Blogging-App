import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateBlogContent = async (topic, category, tone = 'professional') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Write a comprehensive blog post about "${topic}" in the ${category} category. 
    The tone should be ${tone}. 
    
    Please structure the blog post with:
    1. An engaging title (max 100 characters)
    2. A compelling description/excerpt (max 200 characters)
    3. Well-structured content with proper headings, paragraphs, and formatting
    4. Include relevant examples and insights
    5. A conclusion
    
    Format the response as JSON with the following structure:
    {
      "title": "Blog title here",
      "description": "Brief description here",
      "content": "Full blog content with HTML formatting (use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags)"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from the response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      title: topic,
      description: `An insightful article about ${topic}`,
      content: text
    };
  } catch (error) {
    console.error('Error generating blog content:', error);
    throw new Error('AI feature temporarily unavailable. Please try again later or create blog manually.');
  }
};

export const improveBlogContent = async (content, instruction) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Improve the following blog content based on this instruction: "${instruction}"
    
    Original content:
    ${content}
    
    Please return the improved content maintaining HTML formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error improving blog content:', error);
    throw new Error('Failed to improve blog content');
  }
};

export const generateBlogIdeas = async (category, count = 5) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate ${count} creative and engaging blog post ideas for the ${category} category.
    
    Return the response as a JSON array of objects with this structure:
    [
      {
        "title": "Blog idea title",
        "description": "Brief description of the blog idea"
      }
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from the response
    let jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Error generating blog ideas:', error);
    throw new Error('Failed to generate blog ideas');
  }
};
