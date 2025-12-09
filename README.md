# HTML to PDF Converter

Professional, powerful HTML to PDF converter with a beautiful web interface. Zero errors, zero timeouts, perfect rendering every time.

![HTML to PDF Converter](https://img.shields.io/badge/version-2.0.0-red)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Lightning Fast Conversion** - Instant HTML to PDF conversion with Puppeteer
- **Multiple Input Methods**
  - Upload HTML files
  - Convert from URL
  - Direct HTML input
- **Professional UI** - Sleek black/grey/white/red design that's fully mobile-optimized
- **Comprehensive Options**
  - Multiple page formats (A4, A3, Letter, Legal, PPT 4:3, 16:9, 16:10)
  - Portrait and Landscape orientation
  - Custom margins and scaling
  - Hindi font support
- **Zero Issues** - No timeouts, no rendering errors, just perfect PDFs
- **Production Ready** - Deploy to Render, Railway, Heroku, or any Node.js host

## Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Open Your Browser**
   ```
   http://localhost:3000
   ```

### CLI Usage

The powerful CLI is still available:

```bash
npm run cli
```

## Deployment (⚠️ NOT for Netlify!)

**Important**: This app uses Puppeteer (headless Chrome) and needs a **full server environment**, not serverless functions.

### ✅ Recommended: Render.com (Easiest!)

**Best for Puppeteer - zero configuration needed!**

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New Web Service"**
3. Connect your repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **"Create Web Service"**

**Done!** Live in ~5 minutes. Render automatically installs Chrome.

### Other Great Options

- **Railway.app** - Super fast, auto-configures everything
- **Heroku** - Classic choice (needs Puppeteer buildpack)
- **DigitalOcean App Platform** - Full control
- **Fly.io** - Modern global deployment

**📖 Full deployment guides: [DEPLOYMENT.md](DEPLOYMENT.md)**

## API Endpoints

### Health Check
```
GET /api/health
```

### Convert from File
```
POST /api/convert/file
Content-Type: multipart/form-data

Body:
- htmlFile: HTML file
- format: Page format (A4, A3, Letter, etc.)
- landscape: true/false
- scale: 0.5 to 2.0
- marginTop, marginRight, marginBottom, marginLeft
```

### Convert from URL
```
POST /api/convert/url
Content-Type: application/json

Body:
{
  "url": "https://example.com",
  "format": "A4",
  "landscape": false,
  "scale": 1.0,
  "marginTop": "12mm",
  "marginRight": "10mm",
  "marginBottom": "14mm",
  "marginLeft": "10mm"
}
```

### Convert from HTML
```
POST /api/convert/html
Content-Type: application/json

Body:
{
  "htmlContent": "<html>...</html>",
  "format": "A4",
  "landscape": false,
  "scale": 1.0,
  "marginTop": "12mm",
  "marginRight": "10mm",
  "marginBottom": "14mm",
  "marginLeft": "10mm"
}
```

## Page Formats

| Format | Dimensions |
|--------|-----------|
| A4 | 210 × 297 mm |
| A3 | 297 × 420 mm |
| Letter | 8.5 × 11 inches |
| Legal | 8.5 × 14 inches |
| PPT 4:3 | 10 × 7.5 inches |
| PPT 16:9 | 13.33 × 7.5 inches |
| PPT 16:10 | 10 × 6.25 inches |

## Technology Stack

- **Backend**: Node.js + Express
- **PDF Engine**: Puppeteer (headless Chrome)
- **Frontend**: Vanilla JavaScript
- **Styling**: Custom CSS with mobile-first design
- **File Handling**: Multer
- **Utilities**: fs-extra, uuid

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Conversion time: < 2 seconds for typical HTML files
- Supports files up to 50MB
- Concurrent conversions: Limited by server resources
- Memory efficient with automatic cleanup

## Troubleshooting

### Puppeteer fails to launch on Linux
```bash
# Install required dependencies
sudo apt-get update
sudo apt-get install -y chromium-browser
```

### Port already in use
```bash
# Change port in server.js or set environment variable
PORT=8080 npm start
```

### Memory issues with large PDFs
Increase Node.js memory limit:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## License

MIT License - feel free to use this in your own projects!

## Support

For issues and feature requests, please create an issue in the repository.

---

Built with ❤️ and powered by Puppeteer
