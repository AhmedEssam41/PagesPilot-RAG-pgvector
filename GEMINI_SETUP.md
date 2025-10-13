# Gemini AI Setup Guide

## Step 1: Get Your Gemini API Key

1. **Visit Google AI Studio**: Go to [aistudio.google.com](https://aistudio.google.com)
2. **Sign in** with your Google account
3. **Create API Key**: Click "Get API Key" and create a new key
4. **Copy the API Key**: Save it securely

**Note**: The API uses the v1 version by default, which supports the `gemini-pro` model.

## Step 2: Add to Your .env File

Add this line to your `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Example:**
```env
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 3: Test the Configuration

After adding the environment variable:

1. **Restart your server:**
   ```bash
   npm run dev
   ```

2. **Test post generation:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/facebook/generate-post \
     -H "Content-Type: application/json" \
     -d '{
       "topic": "summer sale announcement",
       "tone": "exciting",
       "length": "medium",
       "keywords": ["discount", "limited time"]
     }'
   ```

## Step 4: Expected Response

If configured correctly, you should get:
```json
{
  "content": "🔥 SUMMER SALE ALERT! 🏖️ Get up to 50% OFF on all items! Limited time offer - don't miss out! #SummerSale #Discount #LimitedTime",
  "hashtags": ["#SummerSale", "#Discount", "#LimitedTime"],
  "suggestedImage": "Bright summer scene with sale banners and happy customers"
}
```

## API Usage

### Generate Post Content

**Endpoint:** `POST /api/v1/facebook/generate-post`

**Request Body:**
```json
{
  "topic": "string (required)",
  "tone": "casual|professional|funny|exciting|informative",
  "length": "short|medium|long",
  "keywords": ["keyword1", "keyword2"],
  "context": "Additional context"
}
```

**Response:**
```json
{
  "content": "Generated post text",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "suggestedImage": "Image description"
}
```

## Complete Workflow

1. **Generate Content**: `POST /api/v1/facebook/generate-post`
2. **User Reviews**: Frontend shows generated content for editing
3. **Upload Image** (optional): `POST /api/v1/facebook/upload-image`
4. **Post to Facebook**: `POST /api/v1/facebook/post`

## Troubleshooting

- **"GEMINI_API_KEY environment variable is required"**: Add the API key to your `.env` file
- **"Invalid API key"**: Check your Gemini API key is correct
- **Rate limit errors**: Gemini has usage limits, wait before retrying
- **Network errors**: Check your internet connection

## Frontend Integration Example

```javascript
// Generate post content
const generatePost = async (topic, tone, length, keywords) => {
  const response = await fetch('http://localhost:8080/api/v1/facebook/generate-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, tone, length, keywords })
  });
  
  const data = await response.json();
  return data; // { content, hashtags, suggestedImage }
};

// Usage
const postData = await generatePost(
  "New product launch",
  "exciting",
  "medium",
  ["innovation", "technology"]
);
console.log(postData.content); // Generated post text
```
