const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class EnhancedHTMLToPDFConverter {
    constructor(options = {}) {
        this.browser = null;
        this.defaultOptions = {
            format: 'A4',
            margin: {
                top: '12mm',
                right: '10mm',
                bottom: '14mm',
                left: '10mm'
            },
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            scale: 1.0,
            landscape: false,
            letterheadMode: 'all', // 'all' or 'first'
            // Add font options
            fontSupport: {
                hindi: true,
                embed: true
            },
            ...options
        };
    }

    async initialize() {
        if (this.browser) return;

        const launchOptions = {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-background-networking',
                '--disable-client-side-phishing-detection',
                '--disable-default-apps',
                '--disable-hang-monitor',
                '--disable-popup-blocking',
                '--disable-prompt-on-repost',
                '--disable-sync',
                '--disable-translate',
                '--metrics-recording-only',
                '--no-default-browser-check',
                '--safebrowsing-disable-auto-update',
                '--enable-automation',
                '--password-store=basic',
                '--use-mock-keychain',
                '--font-render-hinting=none', // Improve non-Latin text rendering
            ]
        };

        console.log('🚀 Launching Puppeteer with Chrome...');
        
        // For production environments like Replit
        if (process.env.NODE_ENV === 'production' || process.env.REPLIT_ENVIRONMENT) {
            console.log('🏭 Production/Replit environment detected');
            
            if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
                console.log('🔍 Using executable path:', process.env.PUPPETEER_EXECUTABLE_PATH);
            } else {
                // Try to use system Chromium in Replit
                const possiblePaths = [
                    '/usr/bin/chromium',
                    '/usr/bin/chromium-browser',
                    '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium'
                ];
                
                for (const chromiumPath of possiblePaths) {
                    if (fs.existsSync(chromiumPath)) {
                        launchOptions.executablePath = chromiumPath;
                        console.log('🔍 Using system Chromium at:', chromiumPath);
                        break;
                    }
                }
            }
        }
        
        try {
            this.browser = await puppeteer.launch(launchOptions);
            console.log('✅ Puppeteer browser launched successfully');
            
            // Test browser functionality
            const page = await this.browser.newPage();
            await page.setViewport({ width: 1200, height: 800 });
            await page.setContent('<html><body><h1>Test</h1></body></html>');
            await page.close();
            console.log('✅ Browser test completed successfully');
            
        } catch (error) {
            console.error('❌ Failed to launch browser:', error.message);
            throw new Error(`Browser launch failed: ${error.message}`);
        }

        // Set up print-specific configurations
        await this.setupPrintStyles();
    }

    async setupPrintStyles() {
        // This method sets up global print styles that will be injected into pages
        this.printCSS = `
            @media print {
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                img, table, h1, h2, h3, h4, h5, h6, ul, ol, p {
                    page-break-inside: avoid;
                }
                h1, h2, h3, h4, h5, h6 {
                    page-break-after: avoid;
                }
            }
        `;
        
        // Add Hindi font support CSS
        this.hindiFontCSS = `
            @import url('https://fonts.googleapis.com/css2?family=Hind:wght@300;400;500;600;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
            
            /* Ensure Hindi characters display properly */
            [lang="hi"], .hindi, *:lang(hi) {
                font-family: 'Noto Sans Devanagari', 'Hind', 'Arial Unicode MS', sans-serif !important;
                font-feature-settings: "kern" 1;
                text-rendering: optimizeLegibility;
            }
        `;
    }

    async loadLocalFonts() {
        // This function would load fonts locally if needed
        // Could be enhanced to load fonts from a local directory
        return {};
    }

    async processHindiText(htmlContent) {
        // Add lang attribute to elements with Hindi text if not already present
        // This is a simple approach; a more sophisticated one would detect Hindi characters
        let processedHTML = htmlContent;

        // Add HTML language attribute if not present
        if (!processedHTML.includes('<html lang="hi"') && !processedHTML.includes('<html lang="en"')) {
            processedHTML = processedHTML.replace('<html', '<html lang="hi"');
        }

        // Ensure charset is UTF-8
        if (!processedHTML.includes('<meta charset="UTF-8">') && !processedHTML.includes('charset=utf-8')) {
            processedHTML = processedHTML.replace('<head>', '<head>\n<meta charset="UTF-8">');
        }

        return processedHTML;
    }

    getPPTDimensions(format) {
        // PowerPoint page sizes in pixels for exact dimensions
        const pptSizes = {
            'PPT_4_3': { 
                width: 960,    // 10in * 96 DPI
                height: 720,   // 7.5in * 96 DPI
                widthIn: '10in',
                heightIn: '7.5in',
                widthMm: '254mm',
                heightMm: '190.5mm'
            },
            'PPT_16_9': { 
                width: 1280,   // 13.333in * 96 DPI
                height: 720,   // 7.5in * 96 DPI
                widthIn: '13.333in',
                heightIn: '7.5in',
                widthMm: '338.667mm',
                heightMm: '190.5mm'
            },
            'PPT_16_10': { 
                width: 960,    // 10in * 96 DPI
                height: 600,   // 6.25in * 96 DPI
                widthIn: '10in',
                heightIn: '6.25in',
                widthMm: '254mm',
                heightMm: '158.75mm'
            }
        };
        return pptSizes[format] || null;
    }

    async convertHTMLToPDF(htmlContent, outputPath, customOptions = {}) {
        if (!this.browser) {
            throw new Error('Converter not initialized. Call initialize() first.');
        }

        const options = { ...this.defaultOptions, ...customOptions };
        const tempHtmlPath = path.join(__dirname, 'temp', `temp_${uuidv4()}.html`);

        try {
            // Ensure temp and output directories exist
            await fs.ensureDir(path.dirname(tempHtmlPath));
            await fs.ensureDir(path.dirname(outputPath));

            let processedHTML = htmlContent;

            // Process Hindi text if fontSupport.hindi is enabled
            if (options.fontSupport && options.fontSupport.hindi) {
                processedHTML = await this.processHindiText(processedHTML);
            }

            // Handle PPT page sizes with custom dimensions
            const pptDimensions = this.getPPTDimensions(options.format);

            let pdfOptions = {
                landscape: options.landscape,
                margin: options.margin,
                printBackground: options.printBackground,
                preferCSSPageSize: options.preferCSSPageSize,
                scale: options.scale,
                // Add font-specific options
                printBackground: true,
                omitBackground: false,
            };

            // Use custom width/height for PPT formats, otherwise use format
            if (pptDimensions) {
                pdfOptions.width = pptDimensions.widthIn;
                pdfOptions.height = pptDimensions.heightIn;
                // Override margins to 0 for PPT formats to avoid white space
                pdfOptions.margin = {
                    top: '0',
                    right: '0',
                    bottom: '0',
                    left: '0'
                };
            } else {
                pdfOptions.format = options.format;
            }

            // Generate page size CSS for PPT formats
            let pageSizeCSS = '';
            if (pptDimensions) {
                // For PPT formats, use exact dimensions with no margins
                pageSizeCSS = `
                    @page {
                        size: ${pptDimensions.widthIn} ${pptDimensions.heightIn};
                        margin: 0;
                    }
                    @media screen {
                        html, body {
                            width: ${pptDimensions.width}px;
                            height: ${pptDimensions.height}px;
                            margin: 0;
                            padding: 0;
                            overflow: visible;
                        }
                    }
                    @media print {
                        html, body {
                            width: ${pptDimensions.widthIn};
                            height: ${pptDimensions.heightIn};
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: visible !important;
                        }
                        .page {
                            width: ${pptDimensions.widthIn} !important;
                            height: ${pptDimensions.heightIn} !important;
                            max-width: ${pptDimensions.widthIn} !important;
                            max-height: ${pptDimensions.heightIn} !important;
                            min-width: ${pptDimensions.widthIn} !important;
                            min-height: ${pptDimensions.heightIn} !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            page-break-after: always !important;
                            page-break-before: auto !important;
                            page-break-inside: avoid !important;
                            position: relative !important;
                            overflow: visible !important;
                            box-sizing: border-box !important;
                        }
                        .page:first-child {
                            page-break-before: auto !important;
                        }
                        .page:last-child {
                            page-break-after: auto !important;
                        }
                    }
                    * {
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                `;
            } else {
                // For non-PPT formats, use regular margins
                const marginTop = options.margin?.top || '0';
                const marginRight = options.margin?.right || '0';
                const marginBottom = options.margin?.bottom || '0';
                const marginLeft = options.margin?.left || '0';
                
                pageSizeCSS = `
                    @page {
                        margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft};
                    }
                    html, body {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                `;
            }

            // Enhanced CSS with font support and page size
            const enhancedCSS = `
                <style>
                    ${pageSizeCSS}
                    ${this.printCSS}
                    ${options.fontSupport && options.fontSupport.hindi ? this.hindiFontCSS : ''}
                </style>
            `;

            // Check if HTML has head tag, if not wrap it
            if (!processedHTML.includes('<head>')) {
                processedHTML = `
                    <!DOCTYPE html>
                    <html lang="hi">
                    <head>
                        <meta charset="UTF-8">
                        ${enhancedCSS}
                    </head>
                    <body>
                        ${processedHTML}
                    </body>
                    </html>
                `;
            } else {
                // Insert CSS into existing head
                processedHTML = processedHTML.replace('</head>', `${enhancedCSS}</head>`);
            }

            // Write temporary HTML file
            await fs.writeFile(tempHtmlPath, processedHTML, 'utf8');

            // Create new page and navigate to HTML
            const page = await this.browser.newPage();
            
            // Set appropriate font settings
            await page.evaluateOnNewDocument(() => {
                // This ensures fonts render correctly
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => {
                        console.log('Fonts loaded successfully');
                    });
                }
            });
            
            // Set viewport based on format
            if (pptDimensions) {
                await page.setViewport({ 
                    width: pptDimensions.width, 
                    height: pptDimensions.height,
                    deviceScaleFactor: 1
                });
            } else {
                await page.setViewport({ width: 1200, height: 800 });
            }
            
            // Set extra HTTP headers for font loading
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'hi,en-US;q=0.9,en;q=0.8'
            });
            
            await page.goto(`file://${tempHtmlPath}`, { 
                waitUntil: 'networkidle0',
                timeout: 60000 
            });
            
            // For PPT formats, inject additional CSS to ensure exact dimensions
            if (pptDimensions) {
                await page.addStyleTag({
                    content: `
                        @media print {
                            html, body {
                                width: ${pptDimensions.widthIn} !important;
                                height: ${pptDimensions.heightIn} !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                overflow: visible !important;
                            }
                            .page {
                                width: ${pptDimensions.widthIn} !important;
                                height: ${pptDimensions.heightIn} !important;
                                min-width: ${pptDimensions.widthIn} !important;
                                min-height: ${pptDimensions.heightIn} !important;
                                max-width: ${pptDimensions.widthIn} !important;
                                max-height: ${pptDimensions.heightIn} !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                overflow: visible !important;
                                position: relative !important;
                                page-break-after: always !important;
                                page-break-before: auto !important;
                                page-break-inside: avoid !important;
                                box-sizing: border-box !important;
                            }
                            .page:last-child {
                                page-break-after: auto !important;
                            }
                        }
                        @media screen {
                            .page {
                                margin-bottom: 20px;
                            }
                        }
                    `
                });
                
                // Wait for all pages to be present
                await page.waitForSelector('.page', { timeout: 10000 }).catch(() => {
                    console.log('⚠️  Warning: .page selector not found, continuing anyway...');
                });
                
                // Scroll to bottom to ensure all content is loaded
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });
                
                // Also emulate media for better control
                await page.emulateMediaType('print');
            }
            
            // Wait for all fonts to load
            await page.waitForFunction(() => document.fonts ? document.fonts.ready : true, { timeout: 10000 })
                .catch(err => console.warn('⚠️  Font loading timeout (continuing anyway)'));

            // Wait a bit for any Web Fonts to render
            await page.waitForTimeout(500);

            // Generate PDF with font handling
            const pdfBuffer = await page.pdf(pdfOptions);
            await fs.writeFile(outputPath, pdfBuffer);

            await page.close();

            // Clean up temporary file
            await fs.remove(tempHtmlPath);

            // Get file stats
            const stats = await fs.stat(outputPath);
            
            console.log(`✅ PDF generated successfully: ${path.basename(outputPath)}`);
            console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);

            return {
                success: true,
                outputPath: outputPath,
                fileSize: stats.size,
                pageCount: 1 // Simplified - would need more complex calculation for actual page count
            };

        } catch (error) {
            // Clean up on error
            try {
                await fs.remove(tempHtmlPath);
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
            
            console.error('❌ PDF conversion failed:', error.message);
            throw error;
        }
    }

    async convertFile(inputPath, outputPath, options = {}) {
        // Read the HTML file with UTF-8 encoding
        const htmlContent = await fs.readFile(inputPath, 'utf8');
        return this.convertHTMLToPDF(htmlContent, outputPath, options);
    }

    async convertURL(url, outputPath, options = {}) {
        const page = await this.browser.newPage();
        
        // Set Hindi language preference
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'hi,en-US;q=0.9,en;q=0.8'
        });
        
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        const htmlContent = await page.content();
        await page.close();
        
        return this.convertHTMLToPDF(htmlContent, outputPath, options);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            console.log('🔒 Browser closed successfully');
        }
    }
}

module.exports = EnhancedHTMLToPDFConverter;
