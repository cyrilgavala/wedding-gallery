# 💒 Wedding Gallery

A beautiful, secure full-stack wedding gallery application with passphrase-protected sections and Dropbox integration.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.0-red.svg)](https://tanstack.com/query)

## ✨ Features

- 🔐 **Passphrase-protected gallery sections** - Different passphrases for different guest groups
- 📸 **Dropbox integration** - All photos stored securely in your Dropbox with batch thumbnail loading
- 🎨 **Modern React 19** - Beautiful, responsive UI with animated heart loader
- ⚡ **TanStack Query (React Query)** - Smart caching, automatic refetching, and optimized data management
- 🚀 **TypeScript full-stack** - Type-safe backend and frontend with organized custom hooks
- 🔒 **Secure session management** - HTTP-only cookies with 24-hour expiration
- 📱 **Mobile-friendly** - Responsive design works on all devices
- 💝 **Beautiful animations** - Heart-shaped loader for wedding theme
- ⚡ **Optimized performance** - Batch API calls, query caching, and efficient rendering

## 🎯 Perfect For

- Wedding photo galleries
- Private event photo sharing
- Family photo albums
- Corporate event galleries
- Any situation requiring password-protected photo galleries

## 📁 Project Structure

```
wedding-gallery/
├── packages/
│   ├── backend/              # Express.js API (TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   └── gallery.ts
│   │   │   └── services/
│   │   │       ├── config.service.ts
│   │   │       └── dropbox.service.ts
│   │   └── scripts/
│   │       └── generate-hash.js
│   │
│   └── frontend/             # React 19 App (TypeScript)
│       ├── src/
│       │   ├── api/
│       │   │   └── client.ts
│       │   ├── components/
│       │   │   ├── Layout.tsx
│       │   │   └── Loader.tsx         # Animated heart loader
│       │   ├── hooks/                 # Custom React Query hooks
│       │   │   ├── index.ts
│       │   │   ├── useAuthStatus.ts
│       │   │   ├── useGalleries.ts
│       │   │   ├── usePhotoUrl.ts
│       │   │   ├── usePhotos.ts
│       │   │   ├── useSections.ts
│       │   │   └── useThumbnails.ts
│       │   ├── pages/
│       │   │   ├── Home.tsx
│       │   │   └── GalleryView.tsx
│       │   └── App.tsx
│       └── vite.config.ts
│
├── README.md                 # This file
└── ARCHITECTURE.md          # System architecture documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Dropbox account with API access

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd wedding-gallery
   npm install
   ```

2. **Set up Dropbox:**
   - Visit [Dropbox Developer Console](https://www.dropbox.com/developers/apps)
   - Create a new app
   - Generate an access token
   - Organize photos in folders (e.g., `/wedding/ceremony`, `/wedding/reception`)

3. **Generate passphrases:**
   ```bash
   npm run generate-hash "ceremony2024"
   npm run generate-hash "reception2024"
   ```

4. **Configure environment:**
   Create `packages/backend/.env`:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Session Secret - Generate a random string
   SESSION_SECRET=your-super-secret-random-key

   # Dropbox Configuration
   DROPBOX_ACCESS_TOKEN=sl.your_actual_dropbox_token_here
   DROPBOX_CLIENT_ID=your_app_key
   DROPBOX_CLIENT_SECRET=your_app_secret

   # Gallery Sections (use the hashes you generated)
   # Format: sectionName:bcryptHash,anotherSection:bcryptHash
   GALLERY_SECTIONS=ceremony:$2b$10$YourHashHere,reception:$2b$10$AnotherHashHere

   # Dropbox Folders (must match section order)
   # Format: /path/to/folder1,/path/to/folder2
   DROPBOX_FOLDERS=/wedding/ceremony,/wedding/reception

   # CORS Origin (frontend URL)
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Start the application:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   ```
   http://localhost:5173
   ```

## 🎮 Usage

1. **Guest arrives at website** → Sees available gallery sections
2. **Enter passphrase** → Unlock specific section (e.g., "ceremony2024")
3. **Browse thumbnails** → Efficiently loaded in batches of 25
4. **Click photo** → View full-size image with loading animation
5. **Download** → Save photos to device

Multiple sections can be unlocked with different passphrases!

## 🔒 Security Features

- ✅ Bcrypt password hashing (salt rounds: 10)
- ✅ HTTP-only secure cookies
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Session-based authentication
- ✅ Path validation to prevent unauthorized access
- ✅ No password storage (only hashes)
- ✅ Secure temporary URLs from Dropbox (4-hour expiration)

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **TypeScript** - Type safety
- **bcrypt** - Password hashing
- **express-session** - Session management
- **Dropbox SDK** - Photo storage and retrieval
- **Helmet** + **CORS** - Security middleware

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety
- **TanStack Query (React Query)** - Smart data fetching and caching
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Fast build tool
- **CSS3** - Modern styling with animations

### Key Frontend Features
- **Custom React Query Hooks** - Organized, reusable data fetching
- **Animated Loader Component** - Beautiful heart-shaped wedding theme loader
- **Lambda/Arrow Function Components** - Modern React patterns
- **Batch Thumbnail Loading** - Efficient API calls (25 thumbnails per batch)
- **Smart Caching** - 5-minute cache for auth and gallery data
- **Dependent Queries** - Thumbnails load only after photos are fetched

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev                  # Start both backend and frontend
npm run dev:backend         # Start only backend (port 3001)
npm run dev:frontend        # Start only frontend (port 5173)

# Building
npm run build               # Build both projects
npm run build:backend       # Build backend only
npm run build:frontend      # Build frontend only

# Utilities
npm run generate-hash "pwd" # Generate bcrypt hash for passphrase
```

### Custom Hooks Architecture

All data fetching is organized into custom React Query hooks:

- **`useAuthStatus()`** - Fetch authentication status
- **`useSections()`** - Fetch gallery sections list
- **`useGalleries()`** - Fetch galleries overview
- **`usePhotos(sectionId)`** - Fetch photos for a section
- **`useThumbnails(sectionId, paths, enabled)`** - Batch fetch thumbnails
- **`usePhotoUrl(sectionId, photoPath)`** - Fetch single photo URL

See `packages/frontend/src/hooks/README.md` for detailed documentation.

## 📦 API Endpoints

### Authentication
- `GET /api/auth/sections` - List available sections
- `POST /api/auth/verify` - Verify passphrase and create session
- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/logout` - Clear session and logout

### Gallery
- `GET /api/gallery/:sectionId/photos` - Get photos list (requires auth)
- `POST /api/gallery/:sectionId/photo-url` - Get temporary photo URL (requires auth)
- `POST /api/gallery/:sectionId/thumbnails` - Get batch thumbnails (max 25 per request)
- `GET /api/gallery/overview` - Get overview of authorized galleries

## 🌐 Deployment

### Deploy to Heroku (Full Stack - Recommended)

This app is configured for easy Heroku deployment with both frontend and backend together.

**Manual Deploy:**
```bash
# 1. Install Heroku CLI and login
heroku login

# 2. Create app
heroku create your-wedding-gallery

# 3. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
heroku config:set CORS_ORIGIN=https://your-wedding-gallery.herokuapp.com
heroku config:set DROPBOX_ACCESS_TOKEN=your-token
heroku config:set DROPBOX_CLIENT_ID=your-client-id
heroku config:set DROPBOX_CLIENT_SECRET=your-client-secret
heroku config:set GALLERY_SECTIONS="section1:hash1,section2:hash2"
heroku config:set DROPBOX_FOLDERS="/folder1,/folder2"

# 4. Deploy
git push heroku main

# 5. Open your app
heroku open
```

### Alternative: Backend (Railway, Render, etc.)
```bash
npm run build:backend
cd packages/backend
npm start
```

Environment variables:
- `NODE_ENV=production`
- `SESSION_SECRET=<strong-random-string>`
- `DROPBOX_ACCESS_TOKEN=<your-token>`
- `DROPBOX_CLIENT_ID=<your-app-key>`
- `DROPBOX_CLIENT_SECRET=<your-app-secret>`
- `GALLERY_SECTIONS=<section:hash,section:hash>`
- `DROPBOX_FOLDERS=</path1,/path2>`
- `CORS_ORIGIN=<your-frontend-url>`

### Alternative: Frontend Only (Vercel, Netlify, Cloudflare Pages)
```bash
npm run build:frontend
```

Deploy the `packages/frontend/dist` directory.

**Note:** Update `VITE_API_URL` in frontend if backend is on different domain.

## 🎨 Customization

### Styling
- Update colors in `packages/frontend/src/index.css`
- Modify loader animation in `packages/frontend/src/components/Loader.css`
- Customize layout in `packages/frontend/src/components/Layout.css`

### Branding
- Replace images in `packages/frontend/src/images/`
- Update welcome message in `packages/frontend/src/pages/Home.tsx`
- Modify header/footer in `packages/frontend/src/components/Layout.tsx`

## 🔧 Troubleshooting

### Photos not loading
- Verify Dropbox access token is valid
- Check folder paths in `DROPBOX_FOLDERS` match your Dropbox structure
- Ensure photos are in supported formats (jpg, jpeg, png, gif, webp, heic, heif)

### Passphrase not working
- Verify hash was generated correctly using `generate-hash.js`
- Check section name in `GALLERY_SECTIONS` matches exactly (case-sensitive)
- Ensure no extra spaces in `.env` file

### Session issues
- Verify `SESSION_SECRET` is set in `.env`
- Clear browser cookies and try again
- Check that cookies are enabled in browser

### Performance issues
- React Query caches data for 5 minutes by default
- Thumbnails are loaded in batches of 25
- Check network tab for failed requests

## 📖 Documentation

- **Architecture Details**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Custom Hooks**: See [packages/frontend/src/hooks/README.md](./packages/frontend/src/hooks/README.md)

## 🤝 Contributing

This is a private project, but feel free to fork and customize for your own use!

## 📄 License

Private - All rights reserved

---

Made with ❤️ for a special day


## 💡 Customization Ideas

- Add photo captions/comments
- Implement guest photo uploads
- Add photo likes/favorites
- Create automatic slideshows
- Add photo filters
- Implement photo search
- Add digital guest book

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `.env` file has all required variables |
| Photos not loading | Verify Dropbox token and folder paths |
| Passphrase rejected | Regenerate hash using `npm run generate-hash` |
| CORS errors | Update `CORS_ORIGIN` in `.env` |

## 📝 License

Private - For personal use only

## 🙏 Acknowledgments

Built with ❤️ for sharing special memories

---

**Ready to share your wedding photos?** Follow the [Quick Start](#-quick-start) guide above! 🎊📸

