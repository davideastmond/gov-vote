# User Seed API Endpoint

## Overview

This endpoint seeds the database with one user for development and testing purposes.

## Endpoint

**POST** `/api/seed/user`

## Authentication

Requires a Bearer token in the `Authorization` header.

### Setup

1. Add `SEED_AUTH_TOKEN` to your `.env` file:

   ```env
   SEED_AUTH_TOKEN=your-secret-token-here
   ```

2. Use a strong, random token for security. Example:
   ```bash
   # Generate a secure token (on Linux/Mac)
   openssl rand -hex 32
   ```

## Usage with Postman

### 1. Create a new POST request

- **Method**: `POST`
- **URL**: `http://localhost:5173/api/seed/user` (or your deployed URL)

### 2. Add Authorization Header

- Go to the **Headers** tab
- Add a new header:
  - **Key**: `Authorization`
  - **Value**: `Bearer your-secret-token-here`

### 3. Add request body

Body is required for this endpoint.

```json
{
	"username": "admin",
	"email": "admin@example.com",
	"password": "adminpassword",
	"firstName": "Admin",
	"lastName": "User",
	"role": "admin"
}
```

## Response Examples

### Success (201 Created)

```json
{
	"success": true,
	"message": "Successfully seeded user",
	"data": {
		"user": {
			"id": "admin-1707854400000-abc123",
			"username": "admin",
			"email": "admin@example.com",
			"firstName": "Admin",
			"lastName": "User",
			"role": "admin",
			"createdAt": "2026-02-13T10:00:00.000Z",
			"updatedAt": "2026-02-13T10:00:00.000Z"
		}
	}
}
```

### Error: Missing Authorization Header (401)

```json
{
	"error": "Unauthorized",
	"message": "Missing or invalid Authorization header. Expected format: Bearer <token>"
}
```

### Error: Invalid Token (403)

```json
{
	"error": "Forbidden",
	"message": "Invalid authentication token"
}
```

### Error: Invalid Request Body (400)

```json
{
	"success": false,
	"error": "Bad Request",
	"message": "Invalid request data",
	"details": ["email: Email must be a valid email address"]
}
```

### Error: Server Error (500)

```json
{
	"error": "Internal Server Error",
	"message": "Failed to seed users",
	"details": "Error details here"
}
```

## cURL Example

```bash
curl -X POST http://localhost:5173/api/seed/user \
	-H "Authorization: Bearer your-secret-token-here" \
	-H "Content-Type: application/json" \
	-d '{
		"username": "admin",
		"email": "admin@example.com",
		"password": "adminpassword",
		"firstName": "Admin",
		"lastName": "User",
		"role": "admin"
	}'
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your token** to version control
2. Add `.env` to your `.gitignore`
3. Use different tokens for development and production
4. Consider disabling this endpoint in production or adding additional safeguards
5. Rotate tokens regularly

## Development Workflow

1. Set up your environment variable
2. Start your dev server: `npm run dev`
3. Use Postman or cURL to hit the endpoint
4. Check your database to verify the users were created
