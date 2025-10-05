# Email Template API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

**No authentication required** - All API endpoints are open and publicly accessible.

## Endpoints

### 1. Get All Email Templates

**GET** `/api/email-templates`

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Welcome Email",
            "email_subject": "Welcome to our service!",
            "csv_file": "http://localhost:8000/storage/email-templates/csv/sample.csv",
            "csv_filename": "sample.csv",
            "thumbnail": "http://localhost:8000/storage/email-templates/thumbnail.jpg",
            "editor_content": "{\"design\": {...}}",
            "mail_content": "<html>...</html>",
            "created_at": "2025-10-04T20:00:00.000000Z",
            "updated_at": "2025-10-04T20:00:00.000000Z",
            "user": {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com"
            }
        }
    ]
}
```

### 2. Create Email Template

**POST** `/api/email-templates`

**Content-Type:** `multipart/form-data`

**Parameters:**

- `name` (required): Template name
- `email_subject` (optional): Email subject line
- `csv_file` (optional): CSV file upload
- `editor_content` (optional): JSON content from email editor
- `mail_content` (optional): HTML content
- `thumbnail` (optional): Image file for preview

**Response:**

```json
{
    "success": true,
    "message": "Email template created successfully.",
    "data": {
        "id": 2,
        "name": "New Template",
        "email_subject": "New Subject",
        "csv_file": "http://localhost:8000/storage/email-templates/csv/new.csv",
        "csv_filename": "new.csv",
        "thumbnail": "http://localhost:8000/storage/email-templates/thumb.jpg",
        "editor_content": "{\"design\": {...}}",
        "mail_content": "<html>...</html>",
        "created_at": "2025-10-04T20:00:00.000000Z",
        "updated_at": "2025-10-04T20:00:00.000000Z",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

### 3. Get Single Email Template

**GET** `/api/email-templates/{id}`

**Response:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Welcome Email",
        "email_subject": "Welcome to our service!",
        "csv_file": "http://localhost:8000/storage/email-templates/csv/sample.csv",
        "csv_filename": "sample.csv",
        "thumbnail": "http://localhost:8000/storage/email-templates/thumbnail.jpg",
        "editor_content": "{\"design\": {...}}",
        "mail_content": "<html>...</html>",
        "created_at": "2025-10-04T20:00:00.000000Z",
        "updated_at": "2025-10-04T20:00:00.000000Z",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

### 4. Update Email Template

**PUT/PATCH** `/api/email-templates/{id}`

**Content-Type:** `multipart/form-data`

**Parameters:** Same as create endpoint

**Response:**

```json
{
    "success": true,
    "message": "Email template updated successfully.",
    "data": {
        "id": 1,
        "name": "Updated Template",
        "email_subject": "Updated Subject",
        "csv_file": "http://localhost:8000/storage/email-templates/csv/updated.csv",
        "csv_filename": "updated.csv",
        "thumbnail": "http://localhost:8000/storage/email-templates/thumb.jpg",
        "editor_content": "{\"design\": {...}}",
        "mail_content": "<html>...</html>",
        "created_at": "2025-10-04T20:00:00.000000Z",
        "updated_at": "2025-10-04T20:05:00.000000Z",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

### 5. Delete Email Template

**DELETE** `/api/email-templates/{id}`

**Response:**

```json
{
    "success": true,
    "message": "Email template deleted successfully."
}
```

## Error Responses

### Validation Error (422)

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": {
        "name": ["The name field is required."],
        "csv_file": ["The csv file must be a file of type: csv."]
    }
}
```

### Not Found (404)

```json
{
    "success": false,
    "message": "Email template not found."
}
```

### Server Error (500)

```json
{
    "success": false,
    "message": "An error occurred while creating the email template.",
    "error": "Error details here"
}
```

## File Upload Specifications

### CSV File

- **Max Size:** 10MB
- **Allowed Types:** .csv
- **Storage Path:** `storage/app/public/email-templates/csv/`

### Thumbnail Image

- **Max Size:** 2MB
- **Allowed Types:** jpeg, png, jpg, gif
- **Storage Path:** `storage/app/public/email-templates/`

## Notes

1. All endpoints require authentication
2. Users can only access their own email templates
3. File uploads are stored in the public storage directory
4. CSV and thumbnail files are automatically deleted when updating or deleting templates
5. The API returns full URLs for file access
6. All timestamps are in ISO 8601 format
