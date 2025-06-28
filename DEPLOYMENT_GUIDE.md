# Delta Solution - Deployment Guide

## Overview
This guide covers deploying the Delta Solution application with:
- **Backend**: Deployed on Vercel
- **Frontend**: Deployed on https://deltawaresolution.com

## Backend Deployment (Vercel)

### 1. Prerequisites
- Vercel account
- MongoDB Atlas database
- Environment variables configured

### 2. Environment Variables (Vercel)
Set these environment variables in your Vercel project:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database
NODE_ENV=production
```

### 3. Deployment Steps
1. Connect your GitHub repository to Vercel
2. Set the root directory to `Backend/`
3. Configure build settings:
   - Build Command: `npm install`
   - Output Directory: `./`
   - Install Command: `npm install`
4. Deploy

### 4. Vercel Configuration
The `vercel.json` file is already configured with:
- CORS headers for https://deltawaresolution.com
- Static file serving for uploads
- API route handling

## Frontend Deployment

### 1. Environment Configuration
The frontend is configured to use:
- Development: `http://localhost:5000` (backend)
- Production: `https://delta-backend.vercel.app` (backend)

### 2. Build and Deploy
1. Build the project: `npm run build`
2. Deploy to your hosting provider (deltawaresolution.com)
3. Ensure all routes are properly configured for SPA

## API Configuration

### Current Setup
- **Frontend URL**: https://deltawaresolution.com
- **Backend URL**: https://delta-backend.vercel.app (update this with your actual Vercel URL)

### CORS Configuration
Backend CORS is configured to allow:
- https://deltawaresolution.com
- https://www.deltawaresolution.com
- Local development URLs

## Database Configuration

### MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster
2. Configure network access (allow all IPs for Vercel)
3. Create database user with read/write permissions
4. Get connection string and add to Vercel environment variables

## File Upload Configuration

### Current Setup
- Files are stored in Vercel's `/uploads` directory
- Static file serving is configured in `vercel.json`
- CORS headers are set for file access

### Important Notes
- Vercel has limitations for file uploads (serverless functions)
- Consider using Cloudinary or AWS S3 for production file storage
- Current setup works for development but may have limitations in production

## Testing Deployment

### 1. Health Check
Test the backend health endpoint:
```
GET https://your-vercel-backend-url.vercel.app/api/health
```

### 2. CORS Test
Test CORS from the frontend domain:
```javascript
fetch('https://your-vercel-backend-url.vercel.app/api/health')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('CORS Error:', error));
```

### 3. API Endpoints Test
Test all API endpoints:
- GET /api/homeContent
- GET /api/homeCourse
- GET /api/homeService
- GET /api/serviceContent
- GET /api/career
- POST /api/contact
- POST /api/enroll
- GET /api/enrollCourse

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check if the frontend domain is in the allowed origins
   - Verify CORS headers in vercel.json
   - Test with browser developer tools

2. **Database Connection Issues**
   - Verify MONGODB_URI in Vercel environment variables
   - Check MongoDB Atlas network access
   - Test database connection locally

3. **File Upload Issues**
   - Check Vercel function timeout limits
   - Verify upload directory permissions
   - Consider using external file storage

4. **API Timeout Issues**
   - Increase timeout in frontend configuration
   - Check Vercel function execution time limits
   - Optimize database queries

### Debug Steps
1. Check Vercel function logs
2. Test API endpoints with Postman
3. Verify environment variables
4. Check browser console for errors
5. Test database connection

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Vercel environment variables
   - Rotate database passwords regularly

2. **CORS Configuration**
   - Only allow necessary origins
   - Use HTTPS in production
   - Validate request origins

3. **File Upload Security**
   - Validate file types
   - Limit file sizes
   - Scan for malware (consider external services)

## Performance Optimization

1. **Database**
   - Use database indexes
   - Optimize queries
   - Consider connection pooling

2. **API**
   - Implement caching
   - Use pagination for large datasets
   - Optimize response payloads

3. **Frontend**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement lazy loading

## Monitoring

1. **Vercel Analytics**
   - Monitor function execution times
   - Track error rates
   - Monitor API usage

2. **MongoDB Atlas**
   - Monitor database performance
   - Track connection usage
   - Set up alerts for issues

3. **Frontend Monitoring**
   - Track user interactions
   - Monitor page load times
   - Set up error tracking

## Support

For deployment issues:
1. Check Vercel documentation
2. Review MongoDB Atlas guides
3. Test locally first
4. Check environment variables
5. Verify CORS configuration 