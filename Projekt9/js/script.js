// DOM Elemente
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const emojiGrid = document.getElementById('emojiGrid');
const attachBtn = document.getElementById('attachBtn');
const fileInput = document.getElementById('fileInput');
const chatList = document.getElementById('chatList');
const chatName = document.getElementById('chatName');
const infoBtn = document.getElementById('infoBtn');
const infoSidebar = document.getElementById('infoSidebar');
const closeInfoBtn = document.getElementById('closeInfoBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.querySelector('.sidebar');
const typingIndicator = document.getElementById('typingIndicator');
const newChatBtn = document.getElementById('newChatBtn');
const searchInput = document.getElementById('searchInput');

// Settings
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const userNameInput = document.getElementById('userNameInput');
const statusSelect = document.getElementById('statusSelect');
const notificationsToggle = document.getElementById('notificationsToggle');
const soundToggle = document.getElementById('soundToggle');

// Chat Data
let currentChatId = '1';
let chats = {
    '1': {
        name: 'Max Mustermann',
        type: 'private',
        messages: [
            { id: 1, text: 'Hey! Wie geht\'s dir? 😊', sender: 'other', time: '14:25' },
            { id: 2, text: 'Hi! Mir geht\'s super, danke! Und dir?', sender: 'me', time: '14:28' },
            { id: 3, text: 'Auch gut! Hast du Lust morgen was zu unternehmen?', sender: 'other', time: '14:30' }
        ]
    },
    '2': {
        name: 'Team Projekt',
        type: 'group',
        messages: [
            { id: 1, text: 'Ich habe die neue Präsentation hochgeladen', sender: 'other', senderName: 'Tom', time: '11:00' },
            { id: 2, text: 'Super, ich schaue sie mir gleich an!', sender: 'me', time: '11:05' },
            { id: 3, text: 'Super Idee! 👍', sender: 'other', senderName: 'Anna', time: '12:15' }
        ]
    },
    '3': {
        name: 'Julia Schmidt',
        type: 'private',
        messages: [
            { id: 1, text: 'Danke für deine Hilfe heute!', sender: 'other', time: 'Gestern' },
            { id: 2, text: 'Gerne! Jederzeit wieder 😊', sender: 'me', time: 'Gestern' },
            { id: 3, text: 'Bis morgen!', sender: 'other', time: 'Gestern' }
        ]
    }
};

// Emojis
const emojis = {
    smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜'],
    food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥓', '🥞', '🍤', '🍗', '🍖', '🍕'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🏋️‍♀️', '🤼', '🤸', '🤺', '⛹️'],
    objects: ['💡', '🔦', '🕯️', '💎', '🎁', '🎈', '🎀', '🎊', '🎉', '🎄', '🎃', '🎆', '🎇', '🎐', '🎑', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻']
};

// Initialize
function init() {
    loadSettings();
    loadMessages();
    loadEmojis('smileys');
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    // Send message
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Emoji picker
    emojiBtn.addEventListener('click', () => {
        emojiPicker.classList.toggle('active');
    });
    
    // Emoji tabs
    document.querySelectorAll('.emoji-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadEmojis(tab.dataset.category);
        });
    });
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
            emojiPicker.classList.remove('active');
        }
    });
    
    // File attachment
    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Chat selection
    chatList.addEventListener('click', (e) => {
        const chatItem = e.target.closest('.chat-item');
        if (chatItem) {
            selectChat(chatItem.dataset.chatId);
        }
    });
    
    // Info sidebar
    infoBtn.addEventListener('click', () => infoSidebar.classList.add('active'));
    closeInfoBtn.addEventListener('click', () => infoSidebar.classList.remove('active'));
    
    // Mobile menu
    mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
    
    // Settings - Event direkt auf Button setzen
    settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Settings button clicked');
        settingsModal.classList.add('active');
    });
    
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });
    
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Close modal when clicking outside
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });
    
    // New chat
    newChatBtn.addEventListener('click', showNewChatDialog);
    
    // Search
    searchInput.addEventListener('input', (e) => searchChats(e.target.value));
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterChats(tab.dataset.tab);
        });
    });
    
    // Simulate typing
    messageInput.addEventListener('input', () => {
        if (messageInput.value.length > 0) {
            simulateTyping();
        }
    });
}

// Load Settings
function loadSettings() {
    const savedSettings = localStorage.getItem('chatSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('userName').textContent = settings.userName || 'Sandra';
        userNameInput.value = settings.userName || 'Sandra';
        statusSelect.value = settings.status || 'online';
        notificationsToggle.checked = settings.notifications !== false;
        soundToggle.checked = settings.sound !== false;
        updateStatus(settings.status || 'online');
    }
}

// Update Status
function updateStatus(status) {
    const statusEl = document.querySelector('.status');
    statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    statusEl.className = `status ${status}`;
}

// Load emojis
function loadEmojis(category) {
    emojiGrid.innerHTML = '';
    emojis[category].forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = emoji;
        emojiItem.addEventListener('click', () => {
            messageInput.value += emoji;
            messageInput.focus();
            emojiPicker.classList.remove('active');
        });
        emojiGrid.appendChild(emojiItem);
    });
}

// Load messages
function loadMessages() {
    const chat = chats[currentChatId];
    messagesContainer.innerHTML = `
        <div class="date-divider">
            <span>Heute</span>
        </div>
    `;
    
    chat.messages.forEach(message => {
        addMessageToUI(message);
    });
    
    scrollToBottom();
}

// Add message to UI
function addMessageToUI(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.sender === 'me' ? 'sent' : 'received'}`;
    
    let avatarHtml = '';
    if (message.sender === 'other') {
        avatarHtml = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
    }
    
    messageEl.innerHTML = `
        ${avatarHtml}
        <div class="message-content">
            <div class="message-bubble">
                ${message.senderName ? `<strong>${message.senderName}</strong><br>` : ''}
                <p>${message.text}</p>
            </div>
            <span class="message-time">${message.time}</span>
        </div>
    `;
    
    messagesContainer.appendChild(messageEl);
}

// Send message
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    
    const message = {
        id: Date.now(),
        text: text,
        sender: 'me',
        time: getCurrentTime()
    };
    
    chats[currentChatId].messages.push(message);
    addMessageToUI(message);
    
    messageInput.value = '';
    scrollToBottom();
    updateChatList(text);
    
    // Play sound
    if (soundToggle && soundToggle.checked) {
        playSound('send');
    }
    
    // Simulate response
    setTimeout(() => {
        simulateResponse();
    }, 1000 + Math.random() * 2000);
}

// Simulate response
function simulateResponse() {
    const responses = [
        'Das klingt gut! 😊',
        'Interessant, erzähl mir mehr davon!',
        'Ja, da stimme ich dir zu 👍',
        'Haha, das ist lustig! 😄',
        'Okay, verstehe',
        'Super Idee!',
        'Danke für die Info!',
        'Wie siehst du das denn?'
    ];
    
    typingIndicator.classList.add('active');
    
    setTimeout(() => {
        typingIndicator.classList.remove('active');
        
        const response = {
            id: Date.now(),
            text: responses[Math.floor(Math.random() * responses.length)],
            sender: 'other',
            time: getCurrentTime()
        };
        
        if (chats[currentChatId].type === 'group') {
            const names = ['Anna', 'Tom', 'Lisa', 'Mark'];
            response.senderName = names[Math.floor(Math.random() * names.length)];
        }
        
        chats[currentChatId].messages.push(response);
        addMessageToUI(response);
        scrollToBottom();
        updateChatList(response.text);
        
        // Show notification
        if (notificationsToggle.checked) {
            showNotification(chats[currentChatId].name, response.text);
        }
        
        // Play sound
        if (soundToggle.checked) {
            playSound('receive');
        }
    }, 1500);
}

// New Chat Dialog
function showNewChatDialog() {
    // Create modal HTML
    const modalHtml = `
        <div class="modal active" id="newChatModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Neuer Chat</h2>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="contact-list">
                        <h3>Verfügbare Kontakte</h3>
                        <div class="available-contacts">
                            <div class="contact-item" data-name="Lisa Müller" data-type="private">
                                <div class="contact-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="contact-info">
                                    <h4>Lisa Müller</h4>
                                    <p>Online</p>
                                </div>
                                <button class="add-contact-btn" onclick="addNewChat('Lisa Müller', 'private', this)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="contact-item" data-name="Thomas Weber" data-type="private">
                                <div class="contact-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="contact-info">
                                    <h4>Thomas Weber</h4>
                                    <p>Vor 5 Minuten</p>
                                </div>
                                <button class="add-contact-btn" onclick="addNewChat('Thomas Weber', 'private', this)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="contact-item" data-name="Marketing Team" data-type="group">
                                <div class="contact-avatar group">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="contact-info">
                                    <h4>Marketing Team</h4>
                                    <p>12 Mitglieder</p>
                                </div>
                                <button class="add-contact-btn" onclick="addNewChat('Marketing Team', 'group', this)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="create-group">
                        <h3>Neue Gruppe erstellen</h3>
                        <input type="text" id="groupNameInput" placeholder="Gruppenname eingeben...">
                        <button class="create-group-btn" onclick="createNewGroup()">
                            <i class="fas fa-users"></i>
                            Gruppe erstellen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Add new chat (global function for onclick)
window.addNewChat = function(name, type, button) {
    // Check if chat already exists
    const existingChat = Object.values(chats).find(chat => chat.name === name);
    if (existingChat) {
        showToast(`${name} ist bereits in deiner Kontaktliste!`);
        return;
    }
    
    // Add new chat
    const chatId = Date.now().toString();
    chats[chatId] = {
        name: name,
        type: type,
        messages: [{
            id: 1,
            text: 'Hallo! Schön, dass wir jetzt verbunden sind! 👋',
            sender: 'other',
            time: getCurrentTime()
        }]
    };
    
    // Add to chat list
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.dataset.chatId = chatId;
    chatItem.innerHTML = `
        <div class="chat-avatar ${type === 'group' ? 'group' : ''}">
            <i class="fas fa-${type === 'group' ? 'users' : 'user'}"></i>
            ${type !== 'group' ? '<span class="online-indicator"></span>' : ''}
        </div>
        <div class="chat-info">
            <h4>${name}</h4>
            <p>Hallo! Schön, dass wir jetzt verbunden sind! 👋</p>
        </div>
        <div class="chat-meta">
            <span class="time">${getCurrentTime()}</span>
            <span class="unread-count">1</span>
        </div>
    `;
    
    chatList.appendChild(chatItem);
    
    // Update button
    button.classList.add('added');
    button.innerHTML = '<i class="fas fa-check"></i>';
    button.disabled = true;
    
    showToast(`${name} wurde zu deinen Kontakten hinzugefügt!`);
    
    // Switch to new chat
    setTimeout(() => {
        selectChat(chatId);
        document.getElementById('newChatModal').remove();
    }, 500);
};

// Create new group (global function for onclick)
window.createNewGroup = function() {
    const groupNameInput = document.getElementById('groupNameInput');
    const groupName = groupNameInput.value.trim();
    
    if (!groupName) {
        showToast('Bitte gib einen Gruppennamen ein!');
        return;
    }
    
    addNewChat(groupName, 'group', { classList: { add: () => {} }, disabled: false });
};

// Select chat
function selectChat(chatId) {
    currentChatId = chatId;
    
    // Update active state
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        // Remove unread count
        const unreadCount = activeItem.querySelector('.unread-count');
        if (unreadCount) unreadCount.remove();
    }
    
    // Update header
    const chat = chats[chatId];
    chatName.textContent = chat.name;
    document.getElementById('infoName').textContent = chat.name;
    
    // Load messages
    loadMessages();
    
    // Close mobile sidebar
    sidebar.classList.remove('active');
}

// Update chat list
function updateChatList(lastMessage) {
    const chatItem = document.querySelector(`[data-chat-id="${currentChatId}"]`);
    if (chatItem) {
        const messagePreview = chatItem.querySelector('.chat-info p');
        const timeEl = chatItem.querySelector('.time');
        
        if (messagePreview) messagePreview.textContent = lastMessage;
        if (timeEl) timeEl.textContent = getCurrentTime();
    }
}

// Helper functions
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle file select
function handleFileSelect(e) {
    const files = e.target.files;
    for (let file of files) {
        const message = {
            id: Date.now(),
            text: `📎 ${file.name}`,
            sender: 'me',
            time: getCurrentTime()
        };
        
        chats[currentChatId].messages.push(message);
        addMessageToUI(message);
        scrollToBottom();
        updateChatList(message.text);
    }
}

// Search chats
function searchChats(query) {
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        const name = item.querySelector('.chat-info h4').textContent.toLowerCase();
        const message = item.querySelector('.chat-info p').textContent.toLowerCase();
        
        if (name.includes(query.toLowerCase()) || message.includes(query.toLowerCase())) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Filter chats
function filterChats(type) {
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        const chatId = item.dataset.chatId;
        const chat = chats[chatId];
        
        if (type === 'groups' && chat.type !== 'group') {
            item.style.display = 'none';
        } else if (type === 'chats' && chat.type === 'group') {
            item.style.display = 'none';
        } else {
            item.style.display = 'flex';
        }
    });
}

// Save settings
function saveSettings() {
    const settings = {
        userName: userNameInput.value,
        status: statusSelect.value,
        notifications: notificationsToggle.checked,
        sound: soundToggle.checked
    };
    
    localStorage.setItem('chatSettings', JSON.stringify(settings));
    
    // Update UI
    document.getElementById('userName').textContent = settings.userName;
    updateStatus(settings.status);
    
    // Close modal
    settingsModal.classList.remove('active');
    
    showToast('Einstellungen gespeichert!');
}

// Show notification
function showNotification(title, body) {
    showToast(`${title}: ${body}`);
}

// Play sound
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'send') {
            oscillator.frequency.value = 400;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } else {
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        }
    } catch (e) {
        console.log('Sound konnte nicht abgespielt werden');
    }
}

// Show toast message
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-color);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Simulate typing
function simulateTyping() {
    console.log('User is typing...');
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translate(-50%, 100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
    
    @keyframes slideDown {
        from {
            transform: translate(-50%, 0);
            opacity: 1;
        }
        to {
            transform: translate(-50%, 100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
        infoSidebar.classList.remove('active');
    }
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Demo Mode
setTimeout(() => {
    showToast('💡 Tipp: Klicke auf + um neue Kontakte hinzuzufügen!');
}, 2000);

// Automatische Demo-Nachrichten
setTimeout(() => {
    if (chats[currentChatId].messages.length < 5) {
        const demoMessage = {
            id: Date.now(),
            text: 'Willkommen in der Chat-App! 👋',
            sender: 'other',
            time: getCurrentTime()
        };
        
        chats[currentChatId].messages.push(demoMessage);
        addMessageToUI(demoMessage);
        scrollToBottom();
        updateChatList(demoMessage.text);
        
        if (soundToggle.checked) {
            playSound('receive');
        }
    }
}, 3000);