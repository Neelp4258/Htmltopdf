const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { htmlContent, url, format = 'A4', landscape = false } = JSON.parse(event.body);

        if (!htmlContent && !url) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'HTML content or URL is required' })
            };
        }

        // Launch browser with Chromium for AWS Lambda
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        // Load content
        if (url) {
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        } else {
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        }

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: format,
            landscape: landscape,
            printBackground: true,
            margin: {
                top: '12mm',
                right: '10mm',
                bottom: '14mm',
                left: '10mm'
            }
        });

        await browser.close();

        // Return PDF as base64
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=converted.pdf'
            },
            body: pdfBuffer.toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('Conversion error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message })
        };
    }
};
