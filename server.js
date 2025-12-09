const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const HTMLToPDFConverter = require('./converter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Ensure directories exist
fs.ensureDirSync(path.join(__dirname, 'uploads'));
fs.ensureDirSync(path.join(__dirname, 'temp'));
fs.ensureDirSync(path.join(__dirname, 'output'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
            cb(null, true);
        } else {
            cb(new Error('Only HTML files are allowed'));
        }
    }
});

// Initialize converter
let converter = null;

async function initializeConverter() {
    if (!converter) {
        converter = new HTMLToPDFConverter();
        await converter.initialize();
        console.log('✅ PDF Converter initialized');
    }
    return converter;
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HTML to PDF Converter API is running' });
});

// Convert from HTML file upload
app.post('/api/convert/file', upload.single('htmlFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const options = parseOptions(req.body);
        const outputFileName = `output-${Date.now()}.pdf`;
        const outputPath = path.join(__dirname, 'output', outputFileName);

        const conv = await initializeConverter();
        const result = await conv.convertFile(req.file.path, outputPath, options);

        // Clean up uploaded file
        await fs.remove(req.file.path);

        // Send the PDF file
        res.download(outputPath, 'converted.pdf', async (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Clean up output file after sending
            try {
                await fs.remove(outputPath);
            } catch (cleanupErr) {
                console.error('Cleanup error:', cleanupErr);
            }
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Convert from URL
app.post('/api/convert/url', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        const options = parseOptions(req.body);
        const outputFileName = `output-${Date.now()}.pdf`;
        const outputPath = path.join(__dirname, 'output', outputFileName);

        const conv = await initializeConverter();
        const result = await conv.convertURL(url, outputPath, options);

        // Send the PDF file
        res.download(outputPath, 'converted.pdf', async (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Clean up output file after sending
            try {
                await fs.remove(outputPath);
            } catch (cleanupErr) {
                console.error('Cleanup error:', cleanupErr);
            }
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Convert from direct HTML content
app.post('/api/convert/html', async (req, res) => {
    try {
        const { htmlContent } = req.body;

        if (!htmlContent) {
            return res.status(400).json({ error: 'HTML content is required' });
        }

        const options = parseOptions(req.body);
        const outputFileName = `output-${Date.now()}.pdf`;
        const outputPath = path.join(__dirname, 'output', outputFileName);

        const conv = await initializeConverter();
        const result = await conv.convertHTMLToPDF(htmlContent, outputPath, options);

        // Send the PDF file
        res.download(outputPath, 'converted.pdf', async (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Clean up output file after sending
            try {
                await fs.remove(outputPath);
            } catch (cleanupErr) {
                console.error('Cleanup error:', cleanupErr);
            }
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to parse options from request body
function parseOptions(body) {
    const options = {
        format: body.format || 'A4',
        landscape: body.landscape === 'true' || body.landscape === true,
        scale: parseFloat(body.scale) || 1.0,
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
            top: body.marginTop || '12mm',
            right: body.marginRight || '10mm',
            bottom: body.marginBottom || '14mm',
            left: body.marginLeft || '10mm'
        }
    };

    // Override margins for PPT formats
    if (options.format.startsWith('PPT_')) {
        options.margin = { top: '0', right: '0', bottom: '0', left: '0' };
    }

    return options;
}

// Initialize converter on startup
initializeConverter().then(() => {
    app.listen(PORT, () => {
        console.log('╔════════════════════════════════════════════╗');
        console.log('║  HTML to PDF Converter Server Running     ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log(`🚀 Server: http://localhost:${PORT}`);
        console.log(`📄 API Health: http://localhost:${PORT}/api/health`);
        console.log('✅ Ready to convert HTML to PDF!');
    });
}).catch(err => {
    console.error('❌ Failed to initialize converter:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔒 Shutting down gracefully...');
    if (converter) {
        await converter.close();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🔒 Shutting down gracefully...');
    if (converter) {
        await converter.close();
    }
    process.exit(0);
});
