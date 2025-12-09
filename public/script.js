// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const removeFileBtn = document.getElementById('removeFile');
const optionsToggle = document.getElementById('optionsToggle');
const optionsPanel = document.getElementById('optionsPanel');
const scaleInput = document.getElementById('scale');
const scaleValue = document.getElementById('scaleValue');
const convertBtn = document.getElementById('convertBtn');
const progressContainer = document.getElementById('progressContainer');
const statusMessage = document.getElementById('statusMessage');

let selectedFile = null;
let currentTab = 'file';

// Tab Switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;

        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update active tab panel
        tabPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${targetTab}-panel`).classList.add('active');

        currentTab = targetTab;
        hideStatus();
    });
});

// File Upload Handling
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

removeFileBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    fileInfo.style.display = 'none';
});

function handleFileSelect(file) {
    if (!file.name.endsWith('.html')) {
        showStatus('error', 'Please select an HTML file (.html)');
        return;
    }

    selectedFile = file;
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';
    fileInfo.querySelector('.file-name').textContent = file.name;
    hideStatus();
}

// Options Toggle
optionsToggle.addEventListener('click', () => {
    optionsToggle.classList.toggle('active');
    optionsPanel.classList.toggle('active');
});

// Scale Slider
scaleInput.addEventListener('input', (e) => {
    scaleValue.textContent = parseFloat(e.target.value).toFixed(1);
});

// Update margins when format changes
document.getElementById('format').addEventListener('change', (e) => {
    const format = e.target.value;
    const marginInputs = [
        document.getElementById('marginTop'),
        document.getElementById('marginRight'),
        document.getElementById('marginBottom'),
        document.getElementById('marginLeft')
    ];

    if (format.startsWith('PPT_')) {
        marginInputs.forEach(input => {
            input.value = '0mm';
            input.disabled = true;
            input.style.opacity = '0.5';
        });
    } else {
        marginInputs.forEach(input => {
            input.disabled = false;
            input.style.opacity = '1';
        });
    }
});

// Convert Button
convertBtn.addEventListener('click', handleConvert);

async function handleConvert() {
    try {
        // Validate input
        if (currentTab === 'file' && !selectedFile) {
            showStatus('error', 'Please select an HTML file');
            return;
        }

        if (currentTab === 'url') {
            const url = document.getElementById('urlInput').value.trim();
            if (!url) {
                showStatus('error', 'Please enter a URL');
                return;
            }
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                showStatus('error', 'URL must start with http:// or https://');
                return;
            }
        }

        if (currentTab === 'html') {
            const html = document.getElementById('htmlInput').value.trim();
            if (!html) {
                showStatus('error', 'Please enter HTML content');
                return;
            }
        }

        // Disable button and show progress
        convertBtn.disabled = true;
        progressContainer.style.display = 'block';
        hideStatus();

        // Get options
        const options = getOptions();

        // Make API call based on current tab
        let response;

        if (currentTab === 'file') {
            response = await convertFile(selectedFile, options);
        } else if (currentTab === 'url') {
            const url = document.getElementById('urlInput').value.trim();
            response = await convertURL(url, options);
        } else if (currentTab === 'html') {
            const html = document.getElementById('htmlInput').value.trim();
            response = await convertHTML(html, options);
        }

        // Download the PDF
        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'converted.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

            showStatus('success', '✓ PDF downloaded successfully!');
        } else {
            const error = await response.json();
            showStatus('error', `Conversion failed: ${error.error || 'Unknown error'}`);
        }

    } catch (error) {
        console.error('Conversion error:', error);
        showStatus('error', `Error: ${error.message}`);
    } finally {
        convertBtn.disabled = false;
        progressContainer.style.display = 'none';
    }
}

function getOptions() {
    const format = document.getElementById('format').value;
    const orientation = document.querySelector('input[name="orientation"]:checked').value;
    const scale = parseFloat(document.getElementById('scale').value);

    return {
        format: format,
        landscape: orientation === 'landscape',
        scale: scale,
        marginTop: document.getElementById('marginTop').value,
        marginRight: document.getElementById('marginRight').value,
        marginBottom: document.getElementById('marginBottom').value,
        marginLeft: document.getElementById('marginLeft').value
    };
}

async function convertFile(file, options) {
    const formData = new FormData();
    formData.append('htmlFile', file);

    // Append options
    Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
    });

    return await fetch('/api/convert/file', {
        method: 'POST',
        body: formData
    });
}

async function convertURL(url, options) {
    return await fetch('/api/convert/url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: url,
            ...options
        })
    });
}

async function convertHTML(htmlContent, options) {
    return await fetch('/api/convert/html', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            htmlContent: htmlContent,
            ...options
        })
    });
}

function showStatus(type, message) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
}

function hideStatus() {
    statusMessage.style.display = 'none';
}

// Check server health on load
window.addEventListener('load', async () => {
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            console.log('✅ Server is healthy');
        }
    } catch (error) {
        showStatus('error', 'Warning: Unable to connect to server');
    }
});
