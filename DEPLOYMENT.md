# Builder Log - Deployment Guide

## 🚀 Deployment Options

Builder Log is a static web application with zero dependencies. You can deploy it anywhere that serves HTML files.

## Option 1: GitHub Pages (Recommended - Free)

### Steps:
1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Select branch (usually `main`) and root folder
4. Click Save
5. Your site will be live at `https://yourusername.github.io/repository-name`

### Quick Commands:
```bash
git init
git add .
git commit -m "Initial commit - Builder Log"
git branch -M main
git remote add origin https://github.com/yourusername/builder-log.git
git push -u origin main
```

Then enable GitHub Pages in repository settings.

## Option 2: Vercel (Free, Instant)

### Steps:
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts
4. Done! Your site is live

### Or use Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Deploy with one click

## Option 3: Netlify (Free, Drag & Drop)

### Steps:
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Done! Your site is live

### Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy
```

## Option 4: Cloudflare Pages (Free)

### Steps:
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Deploy automatically on every push

## Option 5: Self-Hosted

### Requirements:
- Any web server (Apache, Nginx, etc.)
- Just copy all files to your web root

### Example with Python (for testing):
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`

## 📁 Files to Deploy

Deploy these files (all in root directory):
- `index.html` - Main application
- `app.js` - Application logic
- `style.css` - Styling
- `README.md` - Documentation
- `LICENSE` - License file

## ⚙️ Configuration

No configuration needed! The app works out of the box.

### Optional: Custom Domain
All platforms above support custom domains:
1. Add your domain in platform settings
2. Update DNS records as instructed
3. SSL is automatic on all platforms

## 🔒 Security Notes

- All data is stored in browser localStorage
- No server-side processing
- No API keys or secrets needed
- Users' data never leaves their browser

## 📊 Analytics (Optional)

To add analytics, insert tracking code in `index.html` before `</head>`:

### Google Analytics:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Plausible (Privacy-friendly):
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## 🧪 Pre-Deployment Checklist

- [ ] Test in Chrome, Firefox, and Safari
- [ ] Test on mobile devices
- [ ] Verify localStorage works
- [ ] Test dark mode toggle
- [ ] Test export/import functionality
- [ ] Test both Markdown and HTML content types
- [ ] Check all links work
- [ ] Verify responsive design

## 🌐 Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 PWA Installation (Optional)

To make Builder Log installable as a PWA, add these files:

### 1. Create `manifest.json`:
```json
{
  "name": "Builder Log",
  "short_name": "Builder Log",
  "description": "A beautiful, local-first log for developers",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f7f4ef",
  "theme_color": "#c96a2b",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Add to `index.html` `<head>`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#c96a2b">
```

### 3. Create a service worker `sw.js` (optional for offline support)

## 🆘 Troubleshooting

**Issue**: Blank page after deployment
- Check browser console for errors
- Verify all file paths are correct
- Ensure CDN links are accessible

**Issue**: Data not persisting
- Check if localStorage is enabled
- Verify site is served over HTTPS (required for some browsers)

**Issue**: Styles not loading
- Clear browser cache
- Check `style.css` path is correct
- Verify CSS file is deployed

## 📞 Support

For issues or questions:
- Check the README.md
- Open an issue on GitHub
- Review browser console for errors

---

**Ready to deploy!** Choose any option above and your Builder Log will be live in minutes.
