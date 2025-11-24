# Complete Heroku Deployment Setup for Wedding Gallery (Full Project)

## Overview
This guide sets up deployment of the ENTIRE wedding-gallery project (frontend + backend) to a single Heroku dyno.
The backend will serve both the API and the frontend static files.

## Files to Create

### 1. Procfile (Root Directory)
Create a file named `Procfile` in the root directory `/Users/cyril.gavala/REPOS/wedding-gallery/Procfile`:

```
web: cd packages/backend && node dist/index.js
```

### 2. .slugignore (Root Directory - Optional)
Create `/Users/cyril.gavala/REPOS/wedding-gallery/.slugignore`:

```
*.md
README.md
ARCHITECTURE.md
.idea/
.vscode/
wedding-gallery.iml
packages/backend/src/
packages/backend/tsconfig.json
packages/frontend/src/
packages/frontend/tsconfig.json
packages/frontend/tsconfig.node.json
packages/frontend/vite.config.ts
```

## Files to Modify

### 3. Update Root package.json
Add the following to `/Users/cyril.gavala/REPOS/wedding-gallery/package.json`:

```json
{
  "name": "wedding-gallery",
  "version": "1.0.0",
  "description": "Wedding gallery with passphrase-protected sections",
  "private": true,
  "workspaces": [
    "packages/backend",
    "packages/frontend"
  ],
  "engines": {
    "node": "20.x",
    "npm": "10.x"
  },
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run dev --workspace=packages/backend",
    "dev:frontend": "npm run dev --workspace=packages/frontend",
    "build": "npm run build --workspaces",
    "build:backend": "npm run build --workspace=packages/backend",
    "build:frontend": "npm run build --workspace=packages/frontend",
    "generate-hash": "node packages/backend/scripts/generate-hash.js",
    "heroku-postbuild": "npm run build:backend && npm run build:frontend && npm run copy-frontend",
    "copy-frontend": "mkdir -p packages/backend/dist/public && cp -r packages/frontend/dist/* packages/backend/dist/public/",
    "start": "cd packages/backend && node dist/index.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### 4. Update Backend index.ts
Modify `/Users/cyril.gavala/REPOS/wedding-gallery/packages/backend/src/index.ts`:

**Add this import at the top** (after line 9, after the logger import):
```typescript
import path from 'path';
```

**Add static file serving** (insert between line 92 and line 94, after the routes logging and before "// Error handling"):

```typescript
// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'public');
  app.use(express.static(frontendPath));
  logger.info('Serving static frontend files', { path: frontendPath });
  
  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

```

## Deployment Commands

### Prerequisites
```bash
# Install Heroku CLI (if not already installed)
brew install heroku/brew/heroku

# Login to Heroku
heroku login
```

### Create Heroku App
```bash
# From the root directory
cd /Users/cyril.gavala/REPOS/wedding-gallery

# Create Heroku app
heroku create your-app-name
# Or let Heroku generate a name:
# heroku create
```

### Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET="your-secret-here-change-this"
heroku config:set DROPBOX_ACCESS_TOKEN="your-dropbox-token"
heroku config:set DROPBOX_CLIENT_ID="your-client-id"
heroku config:set DROPBOX_CLIENT_SECRET="your-client-secret"
heroku config:set CORS_ORIGIN="https://your-app-name.herokuapp.com"
heroku config:set GALLERY_SECTIONS="1. Príprava nevesty:hash1,2. Príprava ženícha:hash2,..."
heroku config:set DROPBOX_FOLDERS="/1. Príprava nevesty,/2. Príprava ženícha,..."
```

**Important:** Replace the placeholders with your actual values from `packages/backend/.env`

### Deploy to Heroku
```bash
# From the root directory
git add .
git commit -m "Add Heroku deployment configuration"
git push heroku main

# Or if your default branch is master:
# git push heroku master
```

### View Logs
```bash
heroku logs --tail
```

### Open App
```bash
heroku open
```

## How It Works

1. **Build Process**: When you push to Heroku, the `heroku-postbuild` script runs:
   - Builds the backend TypeScript → `packages/backend/dist/`
   - Builds the frontend React app → `packages/frontend/dist/`
   - Copies frontend files → `packages/backend/dist/public/`

2. **Runtime**: The Procfile starts the backend server which:
   - Serves API endpoints at `/api/*`
   - Serves frontend static files from `dist/public/`
   - Routes all non-API requests to `index.html` (SPA routing)

3. **Single Dyno**: Everything runs on one Heroku dyno, keeping costs low

## Frontend API Configuration

The frontend needs to call the same domain in production. Update `/Users/cyril.gavala/REPOS/wedding-gallery/packages/frontend/src/api/client.ts`:

```typescript
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Relative URL in production (same domain)
  : 'http://localhost:3001/api';  // Dev server
```

## Troubleshooting

### Build Failures
```bash
# Check logs
heroku logs --tail

# Verify build locally
npm run heroku-postbuild

# Check if frontend files are copied
ls -la packages/backend/dist/public/
```

### Runtime Errors
```bash
# Check environment variables
heroku config

# Restart app
heroku restart

# Check dyno status
heroku ps
```

### CORS Issues
- Ensure `CORS_ORIGIN` matches your Heroku app URL
- In production, frontend and backend are on same domain, so CORS should not be an issue

## Scaling & Monitoring

```bash
# View dyno status
heroku ps

# Scale to hobby dyno (doesn't sleep, $7/month)
heroku dyno:type hobby

# View app metrics
heroku open --metrics
```

## Custom Domain

```bash
heroku domains:add yourdomain.com
heroku domains:add www.yourdomain.com
```

Then configure DNS as instructed by Heroku.
