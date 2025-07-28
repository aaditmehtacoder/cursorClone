// Global variables
let editor;
let files = {};
let activeFile = null;
let apiKey = 'AIzaSyDRwCMwW4isYZjnwFr1tYt2lT0lHjVVCCc';
let chatHistory = [];

// Initialize the application
function init() {
    // Check for saved API key or use pre-filled one
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        apiKey = savedApiKey;
        document.getElementById('apiKeyInput').value = savedApiKey;
        enableChat();
    } else {
        document.getElementById('apiSetup').classList.add('show');
    }

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
    createFile('welcome.js', `// 🎉 Welcome to Cursor Pro!
// Your AI-powered code editor with execution capabilities

console.log('🚀 Hello, World!');

// ✨ Features you can try:
// - Write code and run it with Ctrl+Enter
// - Ask the AI assistant for help
// - Create multiple files
// - Auto-syntax highlighting

function greet(name) {
    const message = \`👋 Hello, \${name}! Welcome to coding with AI.\`;
    console.log(message);
    return message;
}

// Try running this code!
greet('Developer');

// 🔥 Ask the AI to:
// • Explain this code
// • Write new functions
// • Debug errors
// • Suggest improvements
// • Convert to other languages

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Doubled numbers:', doubled);

// Math example
function calculateFactorial(n) {
    if (n <= 1) return 1;
    return n * calculateFactorial(n - 1);
}

console.log('Factorial of 5:', calculateFactorial(5));`);

    // Set up event listeners
    setupEventListeners();
    
    // Auto-save API key if pre-filled
    if (apiKey && !savedApiKey) {
        setTimeout(() => {
            saveApiKey();
        }, 1000);
    }
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
}

// File Management
function createNewFile() {
    const fileName = prompt('📝 Enter file name:', 'untitled.js');
    if (fileName) {
        createFile(fileName, '');
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
    fileItem.innerHTML = `
        <span class="file-icon">${icon}</span>
        <span>${fileName}</span>
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
        <button class="tab-close" onclick="closeFile('${fileName}')" title="Close">×</button>
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
        if (item.textContent.trim() === fileName) {
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
    
    updateStatus(`📝 Editing ${fileName}`);
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
        if (item.textContent.trim() === fileName) {
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
        updateStatus('❌ No file selected');
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
    
    updateStatus('🚀 Running code...');
    
    try {
        if (fileExt === 'js' || fileExt === 'javascript') {
            runJavaScript(code, outputContent);
        } else if (fileExt === 'html') {
            runHTML(code, outputContent);
        } else if (fileExt === 'css') {
            runCSS(code, outputContent);
        } else {
            outputContent.textContent = `⚠️ Code execution not supported for .${fileExt} files yet.\nSupported: JavaScript (.js), HTML (.html), CSS (.css)`;
            outputContent.className = 'output-content error';
        }
    } catch (error) {
        outputContent.textContent = `❌ Error: ${error.message}`;
        outputContent.className = 'output-content error';
        updateStatus('❌ Execution failed');
    }
}

function runJavaScript(code, outputElement) {
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    let output = '';
    
    console.log = (...args) => {
        output += '📝 ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
    };
    
    console.error = (...args) => {
        output += '❌ ERROR: ' + args.join(' ') + '\n';
    };
    
    console.warn = (...args) => {
        output += '⚠️ WARNING: ' + args.join(' ') + '\n';
    };
    
    try {
        // Execute the code
        const result = eval(code);
        
        if (result !== undefined) {
            output += `\n✅ Result: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}\n`;
        }
        
        outputElement.textContent = output || '✅ Code executed successfully (no output)';
        outputElement.className = 'output-content success';
        updateStatus('✅ Code executed successfully');
        
    } catch (error) {
        output += `\n❌ Runtime Error: ${error.message}\n`;
        outputElement.textContent = output;
        outputElement.className = 'output-content error';
        updateStatus('❌ Runtime error');
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
        
        outputElement.textContent = '🌐 HTML opened in new tab!';
        outputElement.className = 'output-content success';
        updateStatus('✅ HTML executed in new tab');
    } catch (error) {
        outputElement.textContent = `❌ Error opening HTML: ${error.message}`;
        outputElement.className = 'output-content error';
        updateStatus('❌ HTML execution failed');
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
        
        outputElement.textContent = '🎨 CSS preview opened in new tab!';
        outputElement.className = 'output-content success';
        updateStatus('✅ CSS preview opened');
    } catch (error) {
        outputElement.textContent = `❌ Error creating CSS preview: ${error.message}`;
        outputElement.className = 'output-content error';
        updateStatus('❌ CSS preview failed');
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
        'js': '🟨',
        'jsx': '⚛️',
        'ts': '🔷',
        'tsx': '⚛️',
        'html': '🌐',
        'css': '🎨',
        'py': '🐍',
        'json': '📋',
        'md': '📝',
        'txt': '📄',
        'scss': '💜',
        'sass': '💜'
    };
    return iconMap[ext] || '📄';
}

// Chat functionality
function saveApiKey() {
    const keyInput = document.getElementById('apiKeyInput');
    const key = keyInput.value.trim();
    
    if (!key) {
        alert('Please enter a valid API key');
        return;
    }
    
    apiKey = key;
    localStorage.setItem('gemini_api_key', key);
    document.getElementById('apiSetup').classList.remove('show');
    enableChat();
    updateStatus('🔑 API key saved successfully');
}

function enableChat() {
    document.getElementById('chatInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('chatInput').placeholder = 'Ask me anything about your code...';
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
        addMessageToChat('assistant', `❌ Error: ${error.message}`);
    }
}

function addMessageToChat(role, content) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    if (content.includes('<pre>') || content.includes('```')) {
        messageDiv.innerHTML = formatCodeInMessage(content);
    } else {
        messageDiv.innerHTML = content;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}

function formatCodeInMessage(content) {
    // Format code blocks
    return content
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code style="background: #0d1117; padding: 2px 4px; border-radius: 3px; border: 1px solid #30363d;">$1</code>');
}

async function queryGemini(message, context) {
    // Updated API endpoint for the correct model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    let prompt = message;
    
    if (context) {
        prompt = `I'm working on a ${context.language} file called "${context.currentFile}". Here's the current code:

\`\`\`${context.language}
${context.currentCode}
\`\`\`

User question: ${message}

Please provide a helpful response. If you're suggesting code changes, please explain them clearly and format code blocks properly.`;
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

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save (prevent default browser save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        updateStatus('💾 Auto-saved');
    }
    
    // Ctrl/Cmd + N for new file
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewFile();
    }
    
    // Ctrl/Cmd + Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);