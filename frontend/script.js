const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages-container');

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    
    // Enable/disable send button
    if (this.value.trim()) {
        sendBtn.removeAttribute('disabled');
    } else {
        sendBtn.setAttribute('disabled', 'true');
    }
});

// Handle Enter key
chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.setAttribute('disabled', 'true');

    // Add user message to UI
    appendMessage(text, 'user');

    // Add loading indicator
    const loadingId = appendLoadingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // Remove loading and add AI response
        removeMessage(loadingId);
        appendMessage(data.response, 'ai');

    } catch (error) {
        removeMessage(loadingId);
        appendMessage('Sorry, something went wrong. Please try again.', 'ai');
        console.error('Error:', error);
    }
}

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');

    const avatarHtml = sender === 'ai' 
        ? `<div class="message-avatar"><span class="material-symbols-outlined">smart_toy</span></div>` 
        : ''; // No avatar for user in this design, but can be added

    // Convert newlines to <br> for display
    const formattedText = text.replace(/\n/g, '<br>');

    messageDiv.innerHTML = `
        ${avatarHtml}
        <div class="message-content">
            ${formattedText}
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function appendLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.id = id;
    messageDiv.classList.add('message', 'ai-message');
    
    messageDiv.innerHTML = `
        <div class="message-avatar"><span class="material-symbols-outlined">smart_toy</span></div>
        <div class="message-content">
            <span class="material-symbols-outlined" style="animation: spin 1s infinite linear;">sync</span>
        </div>
    `;

    // Add spin animation style dynamically if not in CSS
    if (!document.getElementById('spin-style')) {
        const style = document.createElement('style');
        style.id = 'spin-style';
        style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
