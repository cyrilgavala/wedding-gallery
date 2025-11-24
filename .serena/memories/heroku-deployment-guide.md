# Heroku Deployment Guide for Wedding Gallery Backend

## Files Created for Heroku Deployment

### 1. Procfile
Located at: `packages/backend/Procfile`
Content:
```
web: npm start
```

### 2. .slugignore (optional)
Located at: `packages/backend/.slugignore`
Content:
```
*.md
.gitignore
tsconfig.json
src/
scripts/
```

### 3. Package.json Updates
- Added `engines` section to specify Node.js version
- Added `heroku-postbuild` script to build TypeScript on deployment

## Deployment Steps

### Prerequisites
1. Install Heroku CLI: `brew install heroku/brew/heroku`
2. Login to Heroku: `heroku login`

### Initial Setup
```bash
cd /Users/cyril.gavala/REPOS/wedding-gallery/packages/backend

# Create Heroku app
heroku create your-app-name

# Or if you want Heroku to generate a name:
heroku create
```

### Set Environment Variables
Set all required environment variables from your .env file:

```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret-here
heroku config:set DROPBOX_ACCESS_TOKEN=your-token-here
heroku config:set DROPBOX_CLIENT_ID=your-client-id-here
heroku config:set DROPBOX_CLIENT_SECRET=your-client-secret-here
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
heroku config:set GALLERY_SECTIONS="1. Príprava nevesty:hash1,2. Príprava ženícha:hash2,..."
heroku config:set DROPBOX_FOLDERS="/1. Príprava nevesty,/2. Príprava ženícha,..."
```

Note: PORT is automatically set by Heroku, no need to configure it.

### Deploy to Heroku

#### Option 1: Deploy from Git (from backend directory)
Since this is a monorepo, you need to use git subtree to deploy only the backend:

```bash
# From the root of the repo
git subtree push --prefix packages/backend heroku main
```

#### Option 2: Deploy using Heroku Git Remote
```bash
# From backend directory
git init
git add .
git commit -m "Initial commit for Heroku"
heroku git:remote -a your-app-name
git push heroku main
```

#### Option 3: Connect to GitHub (Recommended for monorepo)
1. Go to Heroku Dashboard
2. Select your app
3. Go to "Deploy" tab
4. Connect to GitHub repository
5. Enable automatic deploys from main branch
6. Since it's a monorepo, you'll need to configure buildpacks

### Monorepo Configuration (if deploying from root)
If you want to deploy from the root repository:

```bash
# Add Node.js buildpack with subdir support
heroku buildpacks:set https://github.com/timanovsky/subdir-heroku-buildpack
heroku buildpacks:add heroku/nodejs

# Set the project path
heroku config:set PROJECT_PATH=packages/backend
```

### View Logs
```bash
heroku logs --tail
```

### Open App
```bash
heroku open
```

## Troubleshooting

### Build Failures
- Check that all dependencies are in `dependencies` (not `devDependencies`) that are needed for build
- TypeScript and build tools should be in `devDependencies` as Heroku installs them during build
- Verify the build script works locally: `npm run build`

### Runtime Errors
- Check logs: `heroku logs --tail`
- Verify environment variables are set: `heroku config`
- Ensure PORT is read from environment: `process.env.PORT`

### CORS Issues
- Update CORS_ORIGIN to match your frontend domain
- Make sure the frontend is updated to use the Heroku backend URL

## Post-Deployment

### Update Frontend
Update the frontend API client to point to your Heroku backend:
- Development: `http://localhost:3001`
- Production: `https://your-app-name.herokuapp.com`

### Monitor App
- View app: `heroku open`
- View logs: `heroku logs --tail`
- View metrics: Heroku Dashboard > your-app > Metrics

## Scaling
```bash
# View current dyno formation
heroku ps

# Scale web dynos
heroku ps:scale web=1

# Upgrade to hobby dyno ($7/month - doesn't sleep)
heroku dyno:type hobby
```

## Custom Domain
```bash
heroku domains:add yourdomain.com
heroku domains:add www.yourdomain.com
```

Then configure DNS as instructed by Heroku.
