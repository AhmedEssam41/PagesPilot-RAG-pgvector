# Cloudinary Setup Guide

## Step 1: Get Your Cloudinary Credentials

1. **Sign up/Login** at [cloudinary.com](https://cloudinary.com)
2. **Go to Dashboard** - you'll see your account details
3. **Copy these values:**
   - Cloud Name (e.g., `dxy123456`)
   - API Key (e.g., `123456789012345`)
   - API Secret (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## Step 2: Add to Your .env File

Add these lines to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxy123456
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Step 3: Test the Configuration

After adding the environment variables:

1. **Restart your server:**
   ```bash
   npm run dev
   ```

2. **Test image upload:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/facebook/upload-image \
     -F "image=@/path/to/your/image.jpg"
   ```

## Step 4: Expected Response

If configured correctly, you should get:
```json
{
  "imageUrl": "https://res.cloudinary.com/your_cloud/image/upload/v1234567890/pagespilot-uploads/abc123.jpg",
  "publicId": "pagespilot-uploads/abc123",
  "format": "jpg",
  "width": 1920,
  "height": 1080,
  "size": 245678
}
```

## Troubleshooting

- **"Must supply api_key" error**: Check that your `.env` file has the correct Cloudinary credentials
- **"Invalid credentials" error**: Verify your API Key and Secret are correct
- **"Cloud name not found" error**: Check your Cloud Name is correct