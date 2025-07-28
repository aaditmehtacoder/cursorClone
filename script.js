// Global variables
let editor;
let files = {};
let activeFile = null;
let apiKey = 'AIzaSyDRwCMwW4isYZjnwFr1tYt2lT0lHjVVCCc';
let chatHistory = [];
let fileToDelete = null;

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

// ✨ Features you can explore:
// - Write code and run it with Ctrl+Enter
// - Chat with AI assistant for help
// - Create multiple files with different languages
// - Auto-syntax highlighting and completion

function greet(name) {
    const message = \`👋 Hello, \${name}! Welcome to coding with AI.\`;
    console.log(message);
    return message;
}

// Try running this code!
greet("Developer");

// 🤖 Ask the AI to:
// • Explain this code
// • Write new functions
// • Debug errors
// • Suggest improvements
// • Convert to other languages

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// Math example
function calculateFactorial(n) {
    if (n <= 1) return 1;
    return n * calculateFactorial(n - 1);
}

console.log("Factorial of 5:", calculateFactorial(5));

// Try asking the AI: "Can you create a function to find prime numbers?"`);

    // Set up event listeners
    setupEventListeners();
    enableChat();
}

function setupEventListeners() {
    // Chat input events
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            sendMessage();
        }
    });

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
        document.getElementById('cursorPos').textContent = 
            `Line ${cursor.line + 1}, Column ${cursor.ch + 1}`;
    });

    // Modal events
    document.getElementById('newFileName').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            createFileFromModal();
        } else if (e.key === 'Escape') {
            closeNewFileModal();
        }
    });

    // Click outside modal to close
    document.getElementById('newFileModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('newFileModal')) {
            closeNewFileModal();
        }
    });

    document.getElementById('deleteModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('deleteModal')) {
            closeDeleteModal();
        }
    });
}

// File Management
function openNewFileModal() {
    document.getElementById('newFileModal').style.display = 'block';
    document.getElementById('newFileName').focus();
}

function closeNewFileModal() {
    document.getElementById('newFileModal').style.display = 'none';
    document.getElementById('newFileName').value = '';
}

function openDeleteModal(fileName) {
    fileToDelete = fileName;
    document.getElementById('deleteFileName').textContent = fileName;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    fileToDelete = null;
}

function confirmDelete() {
    if (fileToDelete) {
        deleteFile(fileToDelete);
        closeDeleteModal();
    }
}

function createFileFromModal() {
    const fileName = document.getElementById('newFileName').value.trim();
    if (fileName) {
        createFile(fileName, '');
        closeNewFileModal();
        showNotification(`Created file: ${fileName}`, 'success');
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
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.onclick = () => switchToFile(fileName);
    
    tab.innerHTML = `
        <span>${fileName}</span>
        <button class="tab-close" onclick="closeFile('${fileName}')" title="Close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    tabs.appendChild(tab);
}

function switchToFile(fileName) {
    if (!files[fileName]) return;
    
    activeFile = fileName;
    editor.setValue(files[fileName].content);
    editor.setOption('mode', files[fileName].language);
    
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
    document.getElementById('fileInfo').textContent = 
        lang.charAt(0).toUpperCase() + lang.slice(1);
    
    updateStatus(`Editing ${fileName}`);
}

function closeFile(fileName) {
    event.stopPropagation();
    
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
            editor.setValue('');
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
        const modified = files[fileName]?.modified ? ' •' : '';
        span.textContent = fileName + modified;
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
    outputPanel.classList.add('open');
    
    const outputContent = document.getElementById('outputContent');
    outputContent.textContent = 'Running code...\n';
    outputContent.className = 'output-content';
    
    updateStatus('Running code...');
    
    try {
        if (fileExt === 'js' || fileExt === 'javascript') {
            runJavaScript(code, outputContent);
        } else if (fileExt === 'html') {
            runHTML(code, outputContent);
        } else if (fileExt === 'css') {
            runCSS(code, outputContent);
        } else {
            outputContent.textContent = `Code execution not supported for .${fileExt} files yet.\nSupported: JavaScript (.js), HTML (.html), CSS (.css)`;
            outputContent.className = 'output-content error';
        }
    } catch (error) {
        outputContent.textContent = `Error: ${error.message}`;
        outputContent.className = 'output-content error';
        updateStatus('Execution failed');
    }
}

function runJavaScript(code, outputElement) {
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
    try {
        // Create a new window/tab with the HTML content
        const newWindow = window.open('', '_blank');
        newWindow.document.write(code);
        newWindow.document.close();
        
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
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        
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
    outputPanel.classList.toggle('open');
}

// Utility functions
function getLanguageFromExtension(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const langMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'javascript',
        'tsx': 'javascript',
        'html': 'xml',
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
    document.getElementById('chatInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
}

function toggleChat() {
    const chatPanel = document.getElementById('chatPanel');
    chatPanel.classList.toggle('collapsed');
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
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
            language: files[activeFile].language
        } : null;
        
        const response = await queryGemini(message, context);
        
        // Remove loading and add response
        loadingDiv.remove();
        addMessageToChat('assistant', response);
        
    } catch (error) {
        loadingDiv.remove();
        addMessageToChat('assistant', `Error: ${error.message}`);
        showNotification('Failed to connect to AI', 'error');
    }
}

function addMessageToChat(role, content) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    if (content.includes('```') || content.includes('<pre>')) {
        messageDiv.innerHTML = formatCodeInMessage(content);
    } else {
        messageDiv.innerHTML = formatMessage(content);
    }
    
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
        prompt = `I'm working on a ${context.language} file called "${context.currentFile}". Here's the current code:

\`\`\`${context.language}
${context.currentCode}
\`\`\`

User question: ${message}

Please provide a helpful response. If you're suggesting code changes or new code, please format them properly with code blocks and specify the language. Be concise but thorough.`;
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
    document.getElementById('statusText').textContent = message;
    setTimeout(() => {
        document.getElementById('statusText').textContent = 'Ready';
    }, 3000);
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
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeNewFileModal();
        closeDeleteModal();
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);