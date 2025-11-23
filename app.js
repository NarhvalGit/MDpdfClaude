// Global variables
let currentFile = null;
let markdownContent = '';
let htmlContent = '';
let selectedFormat = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const downloadBtn = document.getElementById('downloadBtn');

    // File input change event
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Download button
    downloadBtn.addEventListener('click', downloadFile);

    // Prevent default drag behaviors on the whole document
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (isValidMarkdownFile(file)) {
            processFile(file);
        } else {
            alert('Upload een geldig Markdown bestand (.md of .markdown)');
        }
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && isValidMarkdownFile(file)) {
        processFile(file);
    }
}

function isValidMarkdownFile(file) {
    const validExtensions = ['.md', '.markdown'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
}

function processFile(file) {
    currentFile = file;

    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'flex';
    document.getElementById('uploadArea').style.display = 'none';

    // Read file content
    const reader = new FileReader();
    reader.onload = function(e) {
        markdownContent = e.target.result;
        showConversionOptions();
    };
    reader.onerror = function() {
        alert('Er is een fout opgetreden bij het lezen van het bestand.');
        resetUpload();
    };
    reader.readAsText(file);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showConversionOptions() {
    document.getElementById('conversionSection').style.display = 'block';
}

function selectFormat(format) {
    selectedFormat = format;

    // Update UI
    const cards = document.querySelectorAll('.format-card');
    cards.forEach(card => card.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    // Convert and show preview
    convertMarkdown(format);
}

function convertMarkdown(format) {
    try {
        // Convert markdown to HTML using marked.js
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });

        htmlContent = marked.parse(markdownContent);

        // Show preview
        showPreview(format);
    } catch (error) {
        alert('Er is een fout opgetreden bij het converteren: ' + error.message);
        console.error('Conversion error:', error);
    }
}

function showPreview(format) {
    const previewSection = document.getElementById('previewSection');
    const previewContent = document.getElementById('previewContent');
    const formatType = document.getElementById('formatType');

    previewContent.innerHTML = htmlContent;
    formatType.textContent = format.toUpperCase();
    previewSection.style.display = 'block';

    // Scroll to preview
    previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function downloadFile() {
    if (!selectedFormat || !htmlContent) {
        alert('Selecteer eerst een formaat.');
        return;
    }

    const fileName = currentFile.name.replace(/\.(md|markdown)$/i, '');

    if (selectedFormat === 'html') {
        downloadHTML(fileName);
    } else if (selectedFormat === 'pdf') {
        downloadPDF(fileName);
    }
}

function downloadHTML(fileName) {
    const fullHTML = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
            color: #1f2937;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #1e3a8a;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
        }
        h1 {
            font-size: 2rem;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }
        code {
            background: #1f2937;
            color: #10b981;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #1f2937;
            color: #e5e7eb;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
        }
        pre code {
            background: transparent;
            color: inherit;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1rem;
            margin-left: 0;
            color: #6b7280;
            font-style: italic;
        }
        a {
            color: #3b82f6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 0.75rem;
            text-align: left;
        }
        th {
            background: #1e3a8a;
            color: white;
            font-weight: 600;
        }
        tr:nth-child(even) {
            background: #f9fafb;
        }
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccessMessage('HTML bestand gedownload!');
}

function downloadPDF(fileName) {
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.padding = '2rem';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.lineHeight = '1.6';
    element.style.color = '#1f2937';

    const opt = {
        margin: 1,
        filename: fileName + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    // Add custom styling for PDF
    const style = document.createElement('style');
    style.textContent = `
        h1, h2, h3, h4, h5, h6 { color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        h1 { font-size: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
        code { background: #e5e7eb; padding: 0.2rem 0.5rem; border-radius: 4px; }
        pre { background: #1f2937; color: white; padding: 1rem; border-radius: 8px; }
        blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; color: #6b7280; font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { border: 1px solid #e5e7eb; padding: 0.75rem; }
        th { background: #1e3a8a; color: white; }
    `;
    element.appendChild(style);

    html2pdf().set(opt).from(element).save().then(() => {
        showSuccessMessage('PDF bestand gedownload!');
    }).catch(error => {
        alert('Er is een fout opgetreden bij het maken van de PDF: ' + error.message);
        console.error('PDF generation error:', error);
    });
}

function showSuccessMessage(message) {
    const btn = document.getElementById('downloadBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ${message}
    `;
    btn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 3000);
}

function resetUpload() {
    currentFile = null;
    markdownContent = '';
    htmlContent = '';
    selectedFormat = '';

    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('conversionSection').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';

    const cards = document.querySelectorAll('.format-card');
    cards.forEach(card => card.classList.remove('selected'));
}
