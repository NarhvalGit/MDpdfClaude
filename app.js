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
    // Show loading state
    const btn = document.getElementById('downloadBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span> PDF wordt gegenereerd...';
    btn.disabled = true;

    // Create a temporary container that is visible but off-screen
    const container = document.createElement('div');
    container.id = 'pdf-temp-container';
    container.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 800px;
        background: white;
        padding: 40px;
        z-index: -1;
        opacity: 0;
        pointer-events: none;
    `;

    // Apply inline styles to HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Apply styles directly to elements
    const applyStyles = (element) => {
        if (element.nodeType !== 1) return;

        switch(element.tagName.toLowerCase()) {
            case 'h1':
                element.style.cssText = 'color: #1e3a8a; font-size: 28px; margin: 24px 0 12px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; font-weight: bold;';
                break;
            case 'h2':
                element.style.cssText = 'color: #1e3a8a; font-size: 24px; margin: 20px 0 10px 0; font-weight: bold;';
                break;
            case 'h3':
                element.style.cssText = 'color: #1e3a8a; font-size: 20px; margin: 18px 0 8px 0; font-weight: bold;';
                break;
            case 'h4':
                element.style.cssText = 'color: #1e3a8a; font-size: 18px; margin: 16px 0 8px 0; font-weight: bold;';
                break;
            case 'h5':
            case 'h6':
                element.style.cssText = 'color: #1e3a8a; font-size: 16px; margin: 14px 0 6px 0; font-weight: bold;';
                break;
            case 'p':
                element.style.cssText = 'margin: 10px 0; line-height: 1.6; color: #1f2937;';
                break;
            case 'ul':
            case 'ol':
                element.style.cssText = 'margin: 10px 0; padding-left: 30px; color: #1f2937;';
                break;
            case 'li':
                element.style.cssText = 'margin: 6px 0; color: #1f2937;';
                break;
            case 'code':
                if (element.parentElement.tagName.toLowerCase() !== 'pre') {
                    element.style.cssText = 'background: #f3f4f6; color: #1f2937; padding: 2px 6px; border-radius: 3px; font-family: "Courier New", monospace; font-size: 14px;';
                }
                break;
            case 'pre':
                element.style.cssText = 'background: #f3f4f6; color: #1f2937; padding: 16px; border-radius: 4px; margin: 16px 0; border: 1px solid #e5e7eb; overflow-x: auto; font-family: "Courier New", monospace;';
                const codeInPre = element.querySelector('code');
                if (codeInPre) {
                    codeInPre.style.cssText = 'background: transparent; color: #1f2937; font-family: "Courier New", monospace;';
                }
                break;
            case 'blockquote':
                element.style.cssText = 'border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; color: #6b7280; font-style: italic;';
                break;
            case 'a':
                element.style.cssText = 'color: #3b82f6; text-decoration: underline;';
                break;
            case 'table':
                element.style.cssText = 'width: 100%; border-collapse: collapse; margin: 16px 0;';
                break;
            case 'th':
                element.style.cssText = 'border: 1px solid #d1d5db; padding: 10px; text-align: left; background: #1e3a8a; color: white; font-weight: 600;';
                break;
            case 'td':
                element.style.cssText = 'border: 1px solid #d1d5db; padding: 10px; text-align: left; color: #1f2937;';
                break;
            case 'tr':
                if (element.parentElement.tagName.toLowerCase() === 'tbody') {
                    const index = Array.from(element.parentElement.children).indexOf(element);
                    if (index % 2 === 1) {
                        element.style.cssText = 'background: #f9fafb;';
                    }
                }
                break;
            case 'hr':
                element.style.cssText = 'border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;';
                break;
            case 'img':
                element.style.cssText = 'max-width: 100%; height: auto;';
                break;
        }

        // Recursively apply to children
        Array.from(element.children).forEach(applyStyles);
    };

    // Apply styles to all elements
    Array.from(tempDiv.children).forEach(applyStyles);

    // Set base styling
    container.style.fontFamily = 'Arial, Helvetica, sans-serif';
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.6';
    container.style.color = '#1f2937';

    container.appendChild(tempDiv);
    document.body.appendChild(container);

    // Wait for content to render, then generate PDF
    setTimeout(() => {
        const options = {
            margin: 15,
            filename: fileName + '.pdf',
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: '#ffffff',
                windowWidth: 800,
                windowHeight: container.scrollHeight
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            },
            pagebreak: {
                mode: ['avoid-all', 'css', 'legacy']
            }
        };

        html2pdf()
            .set(options)
            .from(container)
            .save()
            .then(() => {
                // Cleanup
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
                showSuccessMessage('PDF bestand gedownload!');
            })
            .catch(error => {
                // Cleanup on error
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
                alert('Er is een fout opgetreden bij het maken van de PDF: ' + error.message);
                console.error('PDF generation error:', error);
            });
    }, 100); // Small delay to ensure rendering
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
