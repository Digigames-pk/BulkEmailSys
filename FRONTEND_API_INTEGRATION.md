# Frontend API Integration Guide

## Overview

The Email Template Create and Edit forms have been updated to use API endpoints instead of web routes. The API endpoints are **open and do not require authentication**, making them easy to use and test. This provides better separation of concerns and allows for more flexible frontend-backend communication.

## Changes Made

### 1. Create Component (`resources/js/pages/EmailTemplate/Create.tsx`)

- **Before**: Used `router.post(route('email-template.store'), formData)`
- **After**: Uses `fetch('/api/email-templates', { method: 'POST' })`
- **Authentication**: No authentication required
- **Error Handling**: Improved error handling for API responses

### 2. Edit Component (`resources/js/pages/EmailTemplate/Edit.tsx`)

- **Before**: Used `router.post(route('email-template.update', id), formData)`
- **After**: Uses `fetch('/api/email-templates/{id}', { method: 'PUT' })`
- **Authentication**: No authentication required
- **Error Handling**: Improved error handling for API responses

## How to Use

The forms now work directly without any authentication setup:

1. Go to the Create or Edit Email Template page
2. Fill out the form with your template details
3. Submit the form - it will automatically use the API endpoints
4. All file uploads (CSV and thumbnails) work through the API
5. Error handling is improved with better user feedback

## API Endpoints Used

### Create Email Template

- **Method**: POST
- **URL**: `/api/email-templates`
- **Headers**:
    - `Accept: application/json`
- **Body**: `multipart/form-data` with:
    - `name` (required)
    - `email_subject` (optional)
    - `csv_file` (optional)
    - `thumbnail` (optional)
    - `editor_content` (optional)
    - `mail_content` (optional)

### Update Email Template

- **Method**: PUT
- **URL**: `/api/email-templates/{id}`
- **Headers**:
    - `Accept: application/json`
- **Body**: `multipart/form-data` (same as create)

## Error Handling

### API Errors

- **401 Unauthorized**: Token missing or invalid
- **422 Validation Error**: Form validation failed
- **404 Not Found**: Template not found (for updates)
- **500 Server Error**: Internal server error

### Frontend Error Display

- Validation errors are displayed under the respective form fields
- General errors are shown at the top of the form
- Network errors are handled gracefully

## Troubleshooting

### Common Issues

1. **Network errors**
    - Solution: Check if the Laravel server is running on port 8000

2. **File upload not working**
    - Solution: Ensure the API endpoint is accessible and file permissions are correct

3. **Form submission errors**
    - Solution: Check browser console for JavaScript errors and Laravel logs for server errors

### Debug Steps

1. Check browser console for JavaScript errors
2. Check Laravel logs for server errors
3. Test API endpoints directly with curl/Postman

## Benefits of API Integration

1. **Better Error Handling**: More detailed error messages from API
2. **Flexibility**: Can be used by mobile apps or other frontends
3. **Consistency**: Same API used by frontend and external clients
4. **Testing**: Easier to test API endpoints independently
5. **Performance**: Better control over request/response handling

## Future Enhancements

1. **Token Refresh**: Automatic token refresh before expiration
2. **Offline Support**: Cache forms for offline editing
3. **Progress Indicators**: Better upload progress for large files
4. **Batch Operations**: Support for bulk operations via API
