// Global variables
let editor;
let files = {};
let activeFile = null;
let apiKey = 'AIzaSyDRwCMwW4isYZjnwFr1tYt2lT0lHjVVCCc';
let chatHistory = [];
let fileToDelete = null;
let zoomLevel = 100;
let currentWebsiteContent = null;

// Resize functionality
let isResizing = false;
let currentResizer = null;

// File templates
const fileTemplates = {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Welcome to My Website</h1>
            <nav>
                <ul>
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </header>
        
        <main>
            <section id="home">
                <h2>Home Section</h2>
                <p>This is the home section of your website.</p>
                <button onclick="greetUser()">Click Me!</button>
            </section>
        </main>
        
        <footer>
            <p>&copy; 2024 My Website. All rights reserved.</p>
        </footer>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`,

    'style.css': `/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Header styles */
header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

header h1 {
    color: #4a5568;
    margin-bottom: 20px;
    text-align: center;
}

nav ul {
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 30px;
}

nav a {
    text-decoration: none;
    color: #4a5568;
    font-weight: 500;
    transition: color 0.3s ease;
}

nav a:hover {
    color: #667eea;
}

/* Main content */
main {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 40px;
    margin-bottom: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

section h2 {
    color: #4a5568;
    margin-bottom: 20px;
}

section p {
    margin-bottom: 20px;
    color: #718096;
}

button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: transform 0.2s ease;
}

button:hover {
    transform: translateY(-2px);
}

/* Footer */
footer {
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    padding: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
    nav ul {
        flex-direction: column;
        gap: 15px;
    }
    
    .container {
        padding: 10px;
    }
    
    main {
        padding: 20px;
    }
}`,

    'script.js': `// Welcome to your JavaScript file!
console.log('🚀 Website loaded successfully!');

// Interactive function for the button
function greetUser() {
    const name = prompt('What\\'s your name?');
    if (name) {
        alert(\`Hello, \${name}! Welcome to the website! 🎉\`);
        console.log(\`User \${name} clicked the button\`);
    }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('nav a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Add some interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Add a welcome message
    setTimeout(() => {
        console.log('✨ All scripts loaded and ready!');
    }, 1000);
    
    // Example of DOM manipulation
    const header = document.querySelector('h1');
    if (header) {
        header.addEventListener('click', function() {
            this.style.color = this.style.color === 'rgb(102, 126, 234)' ? '#4a5568' : '#667eea';
        });
    }
});`
};

// Initialize the application
function init() {
    // Initialize CodeMirror
    editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        theme: 'dracula',
        lineNumbers: true,
        mode: 'javascript',
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 2,
        tabSize: 2,
        lineWrapping: true,
        extraKeys: {
            "Ctrl-Enter": runCode,
            "Cmd-Enter": runCode
        }
    });

    // Create welcome file
    createFile('welcome.js', `// 🎯 Welcome to Pointer!
// Your intelligent AI-powered code editor

console.log("🚀 Hello, World!");

// ✨ NEW FEATURES:
// - Scalable UI (zoom controls in bottom-right)
// - Resizable panels (drag the edges)
// - Multi-file website support (create index.html, style.css, script.js)
// - Click "Run Website" to see them work together!

function greet(name) {
    const message = \`👋 Hello, \${name}! Welcome to coding with AI.\`;
    console.log(message);
    return message;
}

// Try running this code!
greet("Developer");

// 🌐 Try creating a complete website:
// 1. Click "New File" and create these files:
//    - index.html (HTML structure)
//    - style.css (Styling)
//    - script.js (JavaScript functionality)
// 2. Click "Run Website" to see them work together!

// 🤖 Ask the AI to:
// • "Create a simple website with HTML, CSS, and JS"
// • "Make a responsive navigation bar"
// • "Add animations to my website"
// • "Create a contact form"

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// Math example
function calculateFactorial(n) {
    if (n <= 1) return 1;
    return n * calculateFactorial(n - 1);
}

console.log("Factorial of 5:", calculateFactorial(5));`);

    // Set up event listeners
    setupEventListeners();
    enableChat();
    initializeResize();
}

function setupEventListeners() {
    // Chat input events
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                sendMessage();
            }
        });
    }

    // Editor change events
    editor.on('change', () => {
        if (activeFile) {
            files[activeFile].content = editor.getValue();
            files[activeFile].modified = true;
            updateTabTitle(activeFile);
        }
    });

    // Cursor position updates
    editor.on('cursorActivity', () => {
        const cursor = editor.getCursor();
        const cursorPosElement = document.getElementById('cursorPos');
        if (cursorPosElement) {
            cursorPosElement.textContent = `Line ${cursor.line + 1}, Column ${cursor.ch + 1}`;
        }
    });

    // Modal events
    const newFileName = document.getElementById('newFileName');
    if (newFileName) {
        newFileName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                createFileFromModal();
            } else if (e.key === 'Escape') {
                closeNewFileModal();
            }
        });
    }

    // Click outside modal to close
    const newFileModal = document.getElementById('newFileModal');
    if (newFileModal) {
        newFileModal.addEventListener('click', (e) => {
            if (e.target === newFileModal) {
                closeNewFileModal();
            }
        });
    }

    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                closeDeleteModal();
            }
        });
    }

    const websiteModal = document.getElementById('websiteModal');
    if (websiteModal) {
        websiteModal.addEventListener('click', (e) => {
            if (e.target === websiteModal) {
                closeWebsiteModal();
            }
        });
    }
}

// Resize functionality
function initializeResize() {
    const resizeHandles = document.querySelectorAll('.resize-handle');
    
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', initResize);
    });
    
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
}

function initResize(e) {
    isResizing = true;
    currentResizer = e.target;
    document.body.classList.add('dragging');
}

function doResize(e) {
    if (!isResizing) return;
    
    const resizeType = currentResizer.dataset.resize;
    
    if (resizeType === 'sidebar') {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            const rect = sidebar.getBoundingClientRect();
            const newWidth = e.clientX - rect.left;
            
            if (newWidth >= 200 && newWidth <= 500) {
                sidebar.style.width = newWidth + 'px';
            }
        }
    } else if (resizeType === 'output') {
        const outputPanel = document.getElementById('outputPanel');
        const editorContainer = document.getElementById('editorContainer');
        if (outputPanel && editorContainer) {
            const containerRect = editorContainer.getBoundingClientRect();
            const newWidth = containerRect.right - e.clientX;
            
            if (newWidth >= 250 && newWidth <= 600) {
                outputPanel.style.width = newWidth + 'px';
            }
        }
    } else if (resizeType === 'chat') {
        const chatPanel = document.getElementById('chatPanel');
        if (chatPanel) {
            const containerRect = document.querySelector('.container').getBoundingClientRect();
            const newWidth = containerRect.right - e.clientX;
            
            if (newWidth >= 300 && newWidth <= 600) {
                chatPanel.style.width = newWidth + 'px';
            }
        }
    }
}

function stopResize() {
    isResizing = false;
    currentResizer = null;
    document.body.classList.remove('dragging');
}

// Zoom functionality
function zoomIn() {
    if (zoomLevel < 200) {
        zoomLevel += 10;
        applyZoom();
    }
}

function zoomOut() {
    if (zoomLevel > 50) {
        zoomLevel -= 10;
        applyZoom();
    }
}

function resetZoom() {
    zoomLevel = 100;
    applyZoom();
}

function applyZoom() {
    const scale = zoomLevel / 100;
    document.documentElement.style.setProperty('--zoom-scale', scale);
    const zoomLevelElement = document.getElementById('zoomLevel');
    if (zoomLevelElement) {
        zoomLevelElement.textContent = zoomLevel + '%';
    }
    
    // Refresh CodeMirror to handle zoom changes
    setTimeout(() => {
        if (editor) {
            editor.refresh();
        }
    }, 100);
}

// File Management
function openNewFileModal() {
    const modal = document.getElementById('newFileModal');
    const input = document.getElementById('newFileName');
    if (modal) {
        modal.style.display = 'flex';
        if (input) {
            input.focus();
        }
    }
}

function closeNewFileModal() {
    const modal = document.getElementById('newFileModal');
    const input = document.getElementById('newFileName');
    if (modal) {
        modal.style.display = 'none';
    }
    if (input) {
        input.value = '';
    }
}

function createTemplate(filename) {
    const input = document.getElementById('newFileName');
    if (input) {
        input.value = filename;
        createFileFromModal();
    }
}

function openDeleteModal(fileName) {
    fileToDelete = fileName;
    const deleteFileNameElement = document.getElementById('deleteFileName');
    const modal = document.getElementById('deleteModal');
    if (deleteFileNameElement) {
        deleteFileNameElement.textContent = fileName;
    }
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'none';
    }
    fileToDelete = null;
}

function confirmDelete() {
    if (fileToDelete) {
        deleteFile(fileToDelete);
        closeDeleteModal();
    }
}

function createFileFromModal() {
    const input = document.getElementById('newFileName');
    if (input) {
        const fileName = input.value.trim();
        if (fileName) {
            let content = '';
            
            // Use template if available
            if (fileTemplates[fileName]) {
                content = fileTemplates[fileName];
            }
            
            createFile(fileName, content);
            closeNewFileModal();
            showNotification(`Created file: ${fileName}`, 'success');
        }
    }
}

function createFile(name, content = '') {
    files[name] = {
        content: content,
        modified: false,
        language: getLanguageFromExtension(name)
    };
    
    addFileToExplorer(name);
    addTab(name);
    switchToFile(name);
}

function addFileToExplorer(fileName) {
    const explorer = document.getElementById('fileExplorer');
    if (!explorer) return;
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.onclick = () => switchToFile(fileName);
    
    const icon = getFileIcon(fileName);
    const iconClass = getIconClass(fileName);
    
    fileItem.innerHTML = `
        <span class="file-icon ${iconClass}">${icon}</span>
        <span class="file-name">${fileName}</span>
        <button class="file-delete" onclick="event.stopPropagation(); openDeleteModal('${fileName}')" title="Delete file">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    explorer.appendChild(fileItem);
}

function addTab(fileName) {
    const tabs = document.getElementById('tabs');
    if (!tabs) return;
    
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.onclick = () => switchToFile(fileName);
    
    tab.innerHTML = `
        <span>${fileName}</span>
        <button class="tab-close" onclick="event.stopPropagation(); closeFile('${fileName}')" title="Close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    tabs.appendChild(tab);
}

function switchToFile(fileName) {
    if (!files[fileName]) return;
    
    activeFile = fileName;
    if (editor) {
        editor.setValue(files[fileName].content);
        editor.setOption('mode', files[fileName].language);
    }
    
    // Update active states
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
        const nameSpan = item.querySelector('.file-name');
        if (nameSpan && nameSpan.textContent === fileName) {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.includes(fileName)) {
            tab.classList.add('active');
        }
    });
    
    // Update file info in status bar
    const lang = files[fileName].language;
    const fileInfoElement = document.getElementById('fileInfo');
    if (fileInfoElement) {
        fileInfoElement.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
    }
    
    updateStatus(`Editing ${fileName}`);
}

function closeFile(fileName) {
    if (event) {
        event.stopPropagation();
    }
    
    if (files[fileName]?.modified) {
        if (!confirm(`${fileName} has unsaved changes. Close anyway?`)) {
            return;
        }
    }
    
    delete files[fileName];
    
    // Remove from explorer and tabs
    document.querySelectorAll('.file-item').forEach(item => {
        const nameSpan = item.querySelector('.file-name');
        if (nameSpan && nameSpan.textContent === fileName) {
            item.remove();
        }
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        if (tab.textContent.includes(fileName)) {
            tab.remove();
        }
    });
    
    // Switch to another file if this was active
    if (activeFile === fileName) {
        const remainingFiles = Object.keys(files);
        if (remainingFiles.length > 0) {
            switchToFile(remainingFiles[0]);
        } else {
            activeFile = null;
            if (editor) {
                editor.setValue('');
            }
        }
    }
}

function deleteFile(fileName) {
    if (files[fileName]) {
        // Close the file first if it's open
        closeFile(fileName);
        showNotification(`Deleted file: ${fileName}`, 'success');
    }
}

function updateTabTitle(fileName) {
    const tab = Array.from(document.querySelectorAll('.tab')).find(t => 
        t.textContent.includes(fileName)
    );
    if (tab) {
        const span = tab.querySelector('span');
        if (span) {
            const modified = files[fileName]?.modified ? ' •' : '';
            span.textContent = fileName + modified;
        }
    }
}

// Code Execution
function runCode() {
    if (!activeFile) {
        updateStatus('No file selected');
        return;
    }

    const code = editor.getValue();
    const fileExt = activeFile.split('.').pop().toLowerCase();
    
    // Show output panel
    const outputPanel = document.getElementById('outputPanel');
    if (outputPanel) {
        outputPanel.classList.add('open');
    }
    
    const outputContent = document.getElementById('outputContent');
    if (outputContent) {
        outputContent.textContent = 'Running code...\n';
        outputContent.className = 'output-content';
    }
    
    updateStatus('Running code...');
    
    try {
        if (fileExt === 'js' || fileExt === 'javascript') {
            runJavaScript(code, outputContent);
        } else if (fileExt === 'html') {
            runHTML(code, outputContent);
        } else if (fileExt === 'css') {
            runCSS(code, outputContent);
        } else {
            if (outputContent) {
                outputContent.textContent = `Code execution not supported for .${fileExt} files yet.\nSupported: JavaScript (.js), HTML (.html), CSS (.css)`;
                outputContent.className = 'output-content error';
            }
        }
    } catch (error) {
        if (outputContent) {
            outputContent.textContent = `Error: ${error.message}`;
            outputContent.className = 'output-content error';
        }
        updateStatus('Execution failed');
    }
}

// Multi-file website execution
function runWebsite() {
    const htmlFile = findFileByExtension(['html', 'htm']);
    const cssFile = findFileByExtension(['css']);
    const jsFile = findFileByExtension(['js', 'javascript']);
    
    if (!htmlFile) {
        showNotification('No HTML file found! Create an index.html file first.', 'error');
        return;
    }
    
    let htmlContent = files[htmlFile].content;
    
    // Inject CSS if available
    if (cssFile) {
        const cssContent = files[cssFile].content;
        // Remove existing CSS links and add inline styles
        htmlContent = htmlContent.replace(/<link[^>]*stylesheet[^>]*>/gi, '');
        htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`);
    }
    
    // Inject JavaScript if available
    if (jsFile) {
        const jsContent = files[jsFile].content;
        // Remove existing script tags and add inline script
        htmlContent = htmlContent.replace(/<script[^>]*src[^>]*><\/script>/gi, '');
        htmlContent = htmlContent.replace('</body>', `<script>${jsContent}</script></body>`);
    }
    
    currentWebsiteContent = htmlContent;
    openWebsiteModal();
    updateStatus('Website launched successfully!');
}

function findFileByExtension(extensions) {
    return Object.keys(files).find(fileName => {
        const ext = fileName.split('.').pop().toLowerCase();
        return extensions.includes(ext);
    });
}

function openWebsiteModal() {
    const modal = document.getElementById('websiteModal');
    const iframe = document.getElementById('websiteFrame');
    
    if (modal) {
        modal.style.display = 'flex';
    }
    
    // Load content into iframe
    if (iframe) {
        iframe.srcdoc = currentWebsiteContent;
    }
}

function closeWebsiteModal() {
    const modal = document.getElementById('websiteModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function refreshWebsite() {
    runWebsite();
}

function openWebsiteNewTab() {
    if (currentWebsiteContent) {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(currentWebsiteContent);
            newWindow.document.close();
        }
    }
}

function runJavaScript(code, outputElement) {
    if (!outputElement) return;
    
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    let output = '';
    
    console.log = (...args) => {
        output += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
    };
    
    console.error = (...args) => {
        output += 'ERROR: ' + args.join(' ') + '\n';
    };
    
    console.warn = (...args) => {
        output += 'WARNING: ' + args.join(' ') + '\n';
    };
    
    try {
        // Execute the code
        const result = eval(code);
        
        if (result !== undefined) {
            output += `\nResult: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}\n`;
        }
        
        outputElement.textContent = output || 'Code executed successfully (no output)';
        outputElement.className = 'output-content success';
        updateStatus('Code executed successfully');
        
    } catch (error) {
        output += `\nRuntime Error: ${error.message}\n`;
        outputElement.textContent = output;
        outputElement.className = 'output-content error';
        updateStatus('Runtime error');
    } finally {
        // Restore original console methods
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
    }
}

function runHTML(code, outputElement) {
    if (!outputElement) return;
    
    try {
        // Create a new window/tab with the HTML content
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(code);
            newWindow.document.close();
        }
        
        outputElement.textContent = 'HTML opened in new tab!';
        outputElement.className = 'output-content success';
        updateStatus('HTML executed in new tab');
    } catch (error) {
        outputElement.textContent = `Error opening HTML: ${error.message}`;
        outputElement.className = 'output-content error';
        updateStatus('HTML execution failed');
    }
}

function runCSS(code, outputElement) {
    if (!outputElement) return;
    
    try {
        // Create a demo HTML page with the CSS
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Preview</title>
    <style>
${code}
    </style>
</head>
<body>
    <h1>CSS Preview</h1>
    <p>This is a sample paragraph to show your CSS styles.</p>
    <div class="demo-box">Demo Box</div>
    <button>Sample Button</button>
    <ul>
        <li>List item 1</li>
        <li>List item 2</li>
        <li>List item 3</li>
    </ul>
</body>
</html>`;
        
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
        }
        
        outputElement.textContent = 'CSS preview opened in new tab!';
        outputElement.className = 'output-content success';
        updateStatus('CSS preview opened');
    } catch (error) {
        outputElement.textContent = `Error creating CSS preview: ${error.message}`;
        outputElement.className = 'output-content error';
        updateStatus('CSS preview failed');
    }
}

function toggleOutput() {
    const outputPanel = document.getElementById('outputPanel');
    if (outputPanel) {
        outputPanel.classList.toggle('open');
    }
}

// Utility functions
function getLanguageFromExtension(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const langMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'javascript',
        'tsx': 'javascript',
        'html': 'html',
        'htm': 'xml',
        'xml': 'xml',
        'css': 'css',
        'scss': 'css',
        'sass': 'css',
        'py': 'python',
        'json': 'javascript',
        'md': 'markdown',
        'txt': 'text'
    };
    return langMap[ext] || 'javascript';
}

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
        'js': '<i class="fab fa-js-square"></i>',
        'jsx': '<i class="fab fa-react"></i>',
        'ts': '<i class="fas fa-file-code"></i>',
        'tsx': '<i class="fab fa-react"></i>',
        'html': '<i class="fab fa-html5"></i>',
        'css': '<i class="fab fa-css3-alt"></i>',
        'py': '<i class="fab fa-python"></i>',
        'json': '<i class="fas fa-brackets-curly"></i>',
        'md': '<i class="fab fa-markdown"></i>',
        'txt': '<i class="fas fa-file-alt"></i>',
        'scss': '<i class="fab fa-sass"></i>',
        'sass': '<i class="fab fa-sass"></i>'
    };
    return iconMap[ext] || '<i class="fas fa-file"></i>';
}

function getIconClass(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    return ext;
}

// Chat functionality
function enableChat() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    if (chatInput) {
        chatInput.disabled = false;
    }
    if (sendBtn) {
        sendBtn.disabled = false;
    }
}

function toggleChat() {
    const chatPanel = document.getElementById('chatPanel');
    if (chatPanel) {
        chatPanel.classList.toggle('collapsed');
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (!message || !apiKey) return;
    
    // Add user message
    addMessageToChat('user', message);
    input.value = '';
    
    // Show loading
    const loadingDiv = addMessageToChat('assistant', '<div class="loading"></div>');
    
    try {
        // Prepare context
        const context = activeFile ? {
            currentFile: activeFile,
            currentCode: files[activeFile].content,
            language: files[activeFile].language,
            allFiles: Object.keys(files)
        } : { allFiles: Object.keys(files) };
        
        const response = await queryGemini(message, context);
        
        // Remove loading and add response
        if (loadingDiv) {
            loadingDiv.remove();
        }
        addMessageToChat('assistant', response);
        
    } catch (error) {
        if (loadingDiv) {
            loadingDiv.remove();
        }
        addMessageToChat('assistant', `Error: ${error.message}`);
        showNotification('Failed to connect to AI', 'error');
    }
}

function addMessageToChat(role, content) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return null;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (content.includes('```') || content.includes('<pre>')) {
        messageContent.innerHTML = formatCodeInMessage(content);
    } else {
        messageContent.innerHTML = formatMessage(content);
    }
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}

function formatMessage(content) {
    // Format inline code
    return content.replace(/`([^`]+)`/g, '<code>$1</code>');
}

function formatCodeInMessage(content) {
    // Format code blocks with enhanced UI
    return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'text';
        const filename = getDefaultFilename(language);
        
        return `
            <div class="code-block">
                <div class="code-header">
                    <span>${language.toUpperCase()}</span>
                    <div class="code-actions">
                        <button class="code-action-btn" onclick="copyCode(this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="code-action-btn accept" onclick="acceptCode(this, '${language}', '${filename}')">
                            <i class="fas fa-check"></i> Accept
                        </button>
                    </div>
                </div>
                <div class="code-content">${escapeHtml(code.trim())}</div>
            </div>
        `;
    }).replace(/`([^`]+)`/g, '<code>$1</code>');
}

function getDefaultFilename(language) {
    const extensions = {
        'javascript': 'script.js',
        'js': 'script.js',
        'html': 'index.html',
        'css': 'style.css',
        'python': 'script.py',
        'py': 'script.py',
        'json': 'data.json',
        'markdown': 'readme.md',
        'md': 'readme.md'
    };
    return extensions[language.toLowerCase()] || 'file.txt';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyCode(button) {
    const codeContent = button.closest('.code-block').querySelector('.code-content');
    const code = codeContent.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = originalHtml;
        }, 2000);
    }).catch(() => {
        showNotification('Failed to copy code', 'error');
    });
}

function acceptCode(button, language, defaultFilename) {
    const codeContent = button.closest('.code-block').querySelector('.code-content');
    const code = codeContent.textContent;
    
    // Generate unique filename if default exists
    let filename = defaultFilename;
    let counter = 1;
    while (files[filename]) {
        const ext = defaultFilename.split('.').pop();
        const name = defaultFilename.replace(`.${ext}`, '');
        filename = `${name}_${counter}.${ext}`;
        counter++;
    }
    
    // Create new file with the code
    createFile(filename, code);
    
    // Update button state
    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.background = '#2ea043';
    setTimeout(() => {
        button.innerHTML = originalHtml;
        button.style.background = '';
    }, 2000);
    
    showNotification(`Created file: ${filename}`, 'success');
}

async function queryGemini(message, context) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    let prompt = message;
    
    if (context) {
        let contextInfo = '';
        
        if (context.currentFile) {
            contextInfo += `I'm currently working on a ${context.language} file called "${context.currentFile}". Here's the current code:

\`\`\`${context.language}
${context.currentCode}
\`\`\`

`;
        }
        
        if (context.allFiles && context.allFiles.length > 0) {
            contextInfo += `Available files in my project: ${context.allFiles.join(', ')}\n\n`;
        }
        
        prompt = contextInfo + `User question: ${message}

Please provide a helpful response. If you're suggesting code changes or new code, please format them properly with code blocks and specify the language. For website projects, consider HTML, CSS, and JavaScript working together. Be concise but thorough.`;
    }
    
    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated');
    }
    
    return data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
}

function updateStatus(message) {
    const statusTextElement = document.getElementById('statusText');
    if (statusTextElement) {
        statusTextElement.textContent = message;
        setTimeout(() => {
            statusTextElement.textContent = 'Ready';
        }, 3000);
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : '<i class="fas fa-check-circle"></i>';
    notification.innerHTML = `${icon} ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save (prevent default browser save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        updateStatus('Auto-saved');
    }
    
    // Ctrl/Cmd + N for new file
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openNewFileModal();
    }
    
    // Ctrl/Cmd + Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
    
    // Ctrl/Cmd + Shift + Enter to run website
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        runWebsite();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeNewFileModal();
        closeDeleteModal();
        closeWebsiteModal();
    }
    
    // Zoom shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        zoomIn();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomOut();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        resetZoom();
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);