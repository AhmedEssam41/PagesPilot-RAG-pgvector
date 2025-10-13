# Google Vertex AI Setup Guide

## Overview
This guide helps you set up Google Vertex AI for AI-powered image generation using Imagen 3, combined with Gemini for text generation.

## Step 1: Get Google Cloud Free Credit

1. **Visit Google Cloud Console**: Go to [console.cloud.google.com](https://console.cloud.google.com)
2. **Sign up for free trial**: Get $300 in free credits (valid for 90 days)
3. **Create a new project** or select existing one
4. **Note your Project ID** (you'll need this later)

## Step 2: Enable Required APIs

1. **Enable Vertex AI API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Vertex AI API"
   - Click "Enable"

2. **Enable Imagen API**:
   - Search for "Generative AI API"
   - Click "Enable"

## Step 3: Create Service Account

1. **Go to IAM & Admin** → "Service Accounts"
2. **Click "Create Service Account"**
3. **Fill in details**:
   - Name: `vertex-ai-service`
   - Description: `Service account for Vertex AI image generation`
4. **Grant roles**:
   - `Vertex AI User`
   - `AI Platform Developer`
5. **Create and download JSON key**:
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key" → "JSON"
   - Save as `google-cloud-key.json` in your project root

## Step 4: Add Environment Variables

Add these to your `.env` file:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json

# Existing variables (keep these)
GEMINI_API_KEY=your_gemini_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Step 5: Test the Configuration

1. **Restart your server**:
   ```bash
   npm run dev
   ```

2. **Test image generation**:
   ```bash
   curl -X POST http://localhost:8080/api/v1/facebook/generate-post \
     -H "Content-Type: application/json" \
     -d '{
       "topic": "summer sale announcement",
       "tone": "exciting",
       "length": "medium",
       "keywords": ["discount", "limited time"],
       "generateImage": true
     }'
   ```

## Step 6: Expected Response

If configured correctly, you should get:

```json
{
  "content": "🔥 SUMMER SALE ALERT! Limited time offer...",
  "hashtags": ["#SummerSale", "#Discount"],
  "suggestedImage": "Bright summer sale scene with discounts",
  "imageUrl": "https://res.cloudinary.com/.../image.png",
  "imagePublicId": "pagespilot-ai-generated/abc123"
}
```

## API Usage

### Generate Post with Image

**Endpoint:** `POST /api/v1/facebook/generate-post`

**Request Body:**
```json
{
  "topic": "string (required)",
  "tone": "casual|professional|funny|exciting|informative",
  "length": "short|medium|long",
  "keywords": ["keyword1", "keyword2"],
  "context": "Additional context",
  "generateImage": true
}
```

**Response:**
```json
{
  "content": "Generated post text",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "suggestedImage": "Image description",
  "imageUrl": "https://res.cloudinary.com/.../image.png",
  "imagePublicId": "pagespilot-ai-generated/abc123"
}
```

## Complete Workflow

1. **Generate Content**: `POST /api/v1/facebook/generate-post` with `generateImage: true`
2. **AI generates**: Text (Gemini) + Image (Imagen 3)
3. **Image uploaded**: Automatically to Cloudinary
4. **User reviews**: Generated post and image
5. **Post to Facebook**: `POST /api/v1/facebook/post` with content and imageUrl

## Cost Breakdown

With $300 free credit:
- **Text generation**: Free (Gemini)
- **Image generation**: ~$0.02 per image (Imagen 3)
- **Total per post**: ~$0.02
- **Posts you can generate**: ~15,000 posts with images

## Troubleshooting

### Common Issues:

1. **"GOOGLE_CLOUD_PROJECT_ID environment variable is required"**
   - Add your project ID to `.env` file

2. **"Authentication failed"**
   - Check your service account JSON key file
   - Ensure the service account has correct permissions

3. **"Imagen model not found"**
   - Make sure you're in a supported region (us-central1, us-east1, europe-west1)
   - Verify Vertex AI API is enabled

4. **"Quota exceeded"**
   - Check your Google Cloud billing
   - Monitor usage in Google Cloud Console

5. **"Image generation failed"**
   - Check if the prompt is appropriate (no harmful content)
   - Verify Imagen API is enabled

### Debug Steps:

1. **Check environment variables**:
   ```bash
   echo $GOOGLE_CLOUD_PROJECT_ID
   echo $GOOGLE_APPLICATION_CREDENTIALS
   ```

2. **Test service account**:
   ```bash
   gcloud auth activate-service-account --key-file=google-cloud-key.json
   gcloud auth list
   ```

3. **Check API status**:
   - Go to Google Cloud Console → APIs & Services → Enabled APIs
   - Verify "Vertex AI API" and "Generative AI API" are enabled

## Security Notes

- **Never commit** `google-cloud-key.json` to version control
- **Add to .gitignore**: `google-cloud-key.json`
- **Rotate keys** regularly in production
- **Use least privilege** principle for service account roles

## Production Considerations

1. **Set up billing alerts** to monitor usage
2. **Implement rate limiting** to prevent abuse
3. **Add image caching** to reduce API calls
4. **Monitor costs** in Google Cloud Console
5. **Set up logging** for debugging

## Support

- **Google Cloud Documentation**: [cloud.google.com/vertex-ai](https://cloud.google.com/vertex-ai)
- **Vertex AI Pricing**: [cloud.google.com/vertex-ai/pricing](https://cloud.google.com/vertex-ai/pricing)
- **Imagen Documentation**: [cloud.google.com/vertex-ai/docs/generative-ai/image](https://cloud.google.com/vertex-ai/docs/generative-ai/image)



