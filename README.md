# News API

A simple Express + MongoDB CRUD API for news articles with category management. UI has been removed; JSON responses only.

## Structure (MVC)

```
controllers/
	admin.controller.js           (create, update, delete news)
	user.controller.js            (list, view news)
	categoryAdmin.controller.js   (create, update, delete categories)
	categoryUser.controller.js    (list, view categories)
middleware/
	auth.js                       (admin token authentication)
	error.js                      (centralized error handler)
models/
	News.js                       (news schema with category reference)
	Category.js                   (category schema)
routes/
	admin.routes.js               (admin news endpoints)
	user.routes.js                (user news endpoints)
	categoryAdmin.routes.js       (admin category endpoints)
	categoryUser.routes.js        (user category endpoints)
server.js
```

## Schemas

### News Schema

- **title** (required): News headline
- **content** (required): Full article content
- **author** (required): Author name
- **category** (required): ObjectId reference to Category
- **publishedDate**: Date (default: now)
- **timestamps**: createdAt, updatedAt (auto-generated)

### Category Schema

- **name** (required, unique): Category name
- **description**: Category description
- **timestamps**: createdAt, updatedAt (auto-generated)

## Configure

Create `.env`:

```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/test_mongodb
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Run

Use PowerShell:

```powershell
npm install
npm run dev
```

Server starts on http://localhost:3000 by default.

## Endpoints

- GET /                    -> Health check `{ status: "ok", service: "news-api" }`

### Authentication:
- POST /admin/register     -> Register new admin (username, password)
- POST /admin/login        -> Login and get JWT access token

### News - User (read-only):
- GET /user/news          -> List all news (sorted by publishedDate, newest first, with category populated)
- GET /user/news/:id      -> Get a single news article (with category populated)

### News - Admin (mutations, requires `Authorization: Bearer <JWT_TOKEN>`):
- POST /admin/news        -> Create news article
- PUT /admin/news/:id     -> Update news article (partial or full)
- DELETE /admin/news/:id  -> Delete news article

### Categories - User (read-only):
- GET /user/categories     -> List all categories (sorted by name)
- GET /user/categories/:id -> Get a single category

### Categories - Admin (mutations, requires `Authorization: Bearer <JWT_TOKEN>`):
- POST /admin/categories        -> Create category
- PUT /admin/categories/:id     -> Update category
- DELETE /admin/categories/:id  -> Delete category

## Examples (PowerShell)

### 1. Register admin (first time setup):
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/admin/register -ContentType 'application/json' -Body (@{
  username='admin'
  password='securepassword123'
} | ConvertTo-Json)
```

### 2. Login to get JWT token:
```powershell
$loginResponse = Invoke-RestMethod -Method Post -Uri http://localhost:3000/admin/login -ContentType 'application/json' -Body (@{
  username='admin'
  password='securepassword123'
} | ConvertTo-Json)

$token = $loginResponse.accessToken
Write-Host "Access Token: $token"
```

### 3. Create category (admin with JWT):
```powershell
$category = Invoke-RestMethod -Method Post -Uri http://localhost:3000/admin/categories -Headers @{ 'Authorization' = "Bearer $token" } -ContentType 'application/json' -Body (@{
  name='Technology'
  description='Tech news and updates'
} | ConvertTo-Json)
$categoryId = $category.data._id
```

### 4. List categories (user, no auth needed):
```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/user/categories
```

### 5. Create news with category (admin with JWT):
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/admin/news -Headers @{ 'Authorization' = "Bearer $token" } -ContentType 'application/json' -Body (@{
  title='Breaking: New Technology Announced'
  content='Full article content goes here...'
  author='John Doe'
  category=$categoryId
} | ConvertTo-Json)
```

### 6. List news (user, no auth needed):
```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/user/news
```

### 7. Get single news (user):
```powershell
$newsId = 'PUT_ID_HERE'
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/user/news/$newsId"
```

### 8. Update news (admin with JWT):
```powershell
$newsId = 'PUT_ID_HERE'
Invoke-RestMethod -Method Put -Uri "http://localhost:3000/admin/news/$newsId" -Headers @{ 'Authorization' = "Bearer $token" } -ContentType 'application/json' -Body (@{
  title='Updated Title'
  content='Updated content'
} | ConvertTo-Json)
```

### 9. Delete news (admin with JWT):
```powershell
$newsId = 'PUT_ID_HERE'
Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/admin/news/$newsId" -Headers @{ 'Authorization' = "Bearer $token" }
```

## Response Format

### Login Success:
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "username": "admin"
  }
}
```

### Data Response:
```json
{
  "data": { /* news, category, or other object */ }
}
```

### Error Response:
```json
{
  "error": "Error message"
}
```

## Status Codes
- 200: Success (GET, PUT)
- 201: Created (POST, registration)
- 204: No Content (DELETE)
- 400: Bad Request (validation errors, invalid ID, missing fields)
- 401: Unauthorized (missing or invalid JWT token, wrong credentials)
- 403: Forbidden (expired or invalid JWT token)
- 404: Not Found
- 500: Internal Server Error

## Authentication Flow

1. **Register** an admin account (first time): POST `/admin/register` with `username` and `password`
2. **Login** to get JWT: POST `/admin/login` with credentials → returns `accessToken`
3. **Use JWT** for admin operations: Include header `Authorization: Bearer <accessToken>`
4. **Token expires** after 24 hours → login again to get new token

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 24 hours
- Keep `JWT_SECRET` secure and change it in production
- Admin endpoints require valid JWT in Authorization header
- User endpoints are public (no authentication required)
