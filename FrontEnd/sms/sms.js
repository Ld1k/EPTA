// Данные чатов и сообщений
let chats = [];
let messages = {};
let currentChatId = null;

// ID текущего пользователя
const currentUserId = localStorage.getItem('epta_user_id') || 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('epta_user_id', currentUserId);

// Инициализация звуков если их нет
if (typeof Sounds !== 'undefined' && Sounds.init) {
    Sounds.init();
}

// Тестовые пользователи
const testUsers = [
    { id: 'user1', name: '@alex', avatar: '../png/portrait.png', status: 'online' },
    { id: 'user2', name: '@maria', avatar: '../png/portrait.png', status: 'offline' },
    { id: 'user3', name: '@dmitry', avatar: '../png/portrait.png', status: 'online' },
    { id: 'user4', name: '@epta_team', avatar: '../png/users-alt.png', status: 'group', isGroup: true }
];

// Данные пользователей для микро-профиля
const usersProfileData = {
    'user1': { name: 'Алексей', username: '@alex', city: 'Москва', age: '24', gender: 'Мужской', squad: 'ЕПТА Крю', status: 'online' },
    'user2': { name: 'Мария', username: '@maria', city: 'Санкт-Петербург', age: '22', gender: 'Женский', squad: 'Дизайн', status: 'offline' },
    'user3': { name: 'Дмитрий', username: '@dmitry', city: 'Казань', age: '27', gender: 'Мужской', squad: 'Разработка', status: 'online' },
    'user4': { name: 'ЕПТА Team', username: '@epta_team', city: 'Online', age: '—', gender: '—', squad: 'Администрация', status: 'group' },
    'current': { name: 'Вы', username: localStorage.getItem('epta_username') || '@username', city: '---', age: '---', gender: '---', squad: '---', status: 'online' }
};

// Загрузка данных из localStorage
function loadData() {
    const saved = localStorage.getItem('epta_sms_chats');
    if (saved) {
        chats = JSON.parse(saved);
    } else {
        chats = [
            { id: 'chat1', type: 'personal', name: '@alex', avatar: '../png/portrait.png', participants: ['current', 'user1'], lastMessage: 'Привет! Как дела?', lastMessageTime: new Date(Date.now() - 3600000).toISOString(), unread: 2 },
            { id: 'chat2', type: 'personal', name: '@maria', avatar: '../png/portrait.png', participants: ['current', 'user2'], lastMessage: 'Завтра встретимся?', lastMessageTime: new Date(Date.now() - 86400000).toISOString(), unread: 0 },
            { id: 'chat3', type: 'group', name: 'ЕПТА Team', avatar: '../png/users-alt.png', participants: ['current', 'user1', 'user2', 'user3', 'user4'], lastMessage: 'Новый дизайн готов!', lastMessageTime: new Date(Date.now() - 7200000).toISOString(), unread: 5 }
        ];
    }
    
    const savedMessages = localStorage.getItem('epta_sms_messages');
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
    } else {
        messages = {
            'chat1': [
                { id: 'msg1', senderId: 'user1', text: 'Привет! Как дела?', time: new Date(Date.now() - 3600000).toISOString(), read: true },
                { id: 'msg2', senderId: 'current', text: 'Привет! Норм, сам как?', time: new Date(Date.now() - 3500000).toISOString(), read: true },
                { id: 'msg3', senderId: 'user1', text: 'Отлично! Видел твой новый пост?', time: new Date(Date.now() - 3400000).toISOString(), read: false }
            ],
            'chat2': [
                { id: 'msg1', senderId: 'user2', text: 'Завтра встретимся?', time: new Date(Date.now() - 86400000).toISOString(), read: true }
            ],
            'chat3': [
                { id: 'msg1', senderId: 'user4', text: 'Ребята, новый дизайн ленты готов!', time: new Date(Date.now() - 7200000).toISOString(), read: true },
                { id: 'msg2', senderId: 'user1', text: 'Круто, сейчас посмотрю', time: new Date(Date.now() - 7100000).toISOString(), read: true },
                { id: 'msg3', senderId: 'user3', text: 'Отличная работа!', time: new Date(Date.now() - 7000000).toISOString(), read: true },
                { id: 'msg4', senderId: 'user4', text: 'Скоро добавим видеочаты', time: new Date(Date.now() - 6900000).toISOString(), read: false }
            ]
        };
    }
}

function saveData() {
    localStorage.setItem('epta_sms_chats', JSON.stringify(chats));
    localStorage.setItem('epta_sms_messages', JSON.stringify(messages));
}

function formatTime(date) {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today - 86400000);
    
    if (d >= today) {
        return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (d >= yesterday) {
        return 'Вчера';
    } else {
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
}

function renderChats() {
    const container = document.getElementById('chatsScroll');
    if (!container) return;
    
    const sorted = [...chats].sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    
    container.innerHTML = sorted.map(chat => {
        const userId = chat.type === 'personal' ? chat.participants.find(p => p !== 'current') : null;
        return `
        <div class="chat-item ${currentChatId === chat.id ? 'active' : ''}" onclick="selectChat('${chat.id}')">
            <div class="chat-avatar-small ${chat.type === 'group' ? 'group' : ''}" 
                 onclick="event.stopPropagation(); ${userId ? `openProfileOverlay('${userId}', '${chat.id}')` : 'null'}">
                <img src="${chat.avatar}" alt="">
            </div>
            <div class="chat-info">
                <div class="chat-name" onclick="event.stopPropagation(); ${userId ? `openProfileOverlay('${userId}', '${chat.id}')` : 'null'}">
                    ${escapeHtml(chat.name)}
                </div>
                <div class="chat-last-message">${escapeHtml(chat.lastMessage || 'Новое сообщение')}</div>
            </div>
            <div class="chat-time">
                ${formatTime(chat.lastMessageTime)}
                ${chat.unread > 0 ? `<span class="unread-badge">${chat.unread}</span>` : ''}
            </div>
        </div>
    `}).join('');
}

function selectChat(chatId) {
    currentChatId = chatId;
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    if (chat.unread > 0) {
        chat.unread = 0;
        saveData();
        renderChats();
    }
    
    const chatName = document.getElementById('chatName');
    const chatStatus = document.getElementById('chatStatus');
    const chatHeaderInfo = document.getElementById('chatHeaderInfo');
    
    chatName.textContent = chat.name;
    if (chat.type === 'group') {
        chatStatus.textContent = `${chat.participants.length} участников`;
    } else {
        const userId = chat.participants.find(p => p !== 'current');
        const user = testUsers.find(u => u.id === userId);
        chatStatus.textContent = user ? (user.status === 'online' ? '🟢 Онлайн' : '⚫ Не в сети') : '';
    }
    
    if (chatHeaderInfo) {
        chatHeaderInfo.onclick = () => {
            if (chat.type === 'personal') {
                const userId = chat.participants.find(p => p !== 'current');
                openProfileOverlay(userId, chatId);
            }
        };
    }
    
    const inputWrapper = document.getElementById('chatInputWrapper');
    if (inputWrapper) inputWrapper.style.display = 'flex';
    
    renderMessages();
    
    if (window.innerWidth <= 768) {
        const chatsList = document.getElementById('chatsList');
        if (chatsList) chatsList.classList.remove('mobile-show');
    }
}

function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container || !currentChatId) return;
    
    const msgs = messages[currentChatId] || [];
    const chat = chats.find(c => c.id === currentChatId);
    
    if (msgs.length === 0) {
        container.innerHTML = `
            <div class="empty-chat">
                <img src="../png/comment.png" alt="">
                <p>Нет сообщений. Напишите что-нибудь!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = msgs.map(msg => {
        const isOutgoing = msg.senderId === 'current';
        const sender = testUsers.find(u => u.id === msg.senderId);
        
        return `
            <div class="message ${isOutgoing ? 'outgoing' : 'incoming'}">
                <div class="message-bubble">
                    ${!isOutgoing && chat?.type === 'group' ? `<div class="message-author">${escapeHtml(sender?.name || 'unknown')}</div>` : ''}
                    ${escapeHtml(msg.text)}
                </div>
                <div class="message-info">
                    <span>${formatTime(msg.time)}</span>
                    ${isOutgoing ? `<span>${msg.read ? '✓✓' : '✓'}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !currentChatId) return;
    
    const newMsg = {
        id: 'msg_' + Date.now(),
        senderId: 'current',
        text: text,
        time: new Date().toISOString(),
        read: false
    };
    
    if (!messages[currentChatId]) {
        messages[currentChatId] = [];
    }
    messages[currentChatId].push(newMsg);
    
    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.lastMessage = text;
        chat.lastMessageTime = new Date().toISOString();
    }
    
    saveData();
    renderMessages();
    renderChats();
    
    input.value = '';
    input.style.height = 'auto';
    
    setTimeout(() => {
        simulateReply(currentChatId);
    }, 1000 + Math.random() * 2000);
}

function simulateReply(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || currentChatId !== chatId) return;
    
    const replyTexts = [
        'Круто! 👍', 'Понял, принято', 'Спасибо!', 'Хорошо', '👍', 'Окей', 
        'Заценю', 'Согласен', 'Отлично!', 'Подумаю над этим'
    ];
    const randomText = replyTexts[Math.floor(Math.random() * replyTexts.length)];
    const randomSender = chat.participants.find(p => p !== 'current') || chat.participants[1];
    
    const newMsg = {
        id: 'msg_' + Date.now(),
        senderId: randomSender,
        text: randomText,
        time: new Date().toISOString(),
        read: false
    };
    
    if (!messages[chatId]) {
        messages[chatId] = [];
    }
    messages[chatId].push(newMsg);
    
    chat.lastMessage = randomText;
    chat.lastMessageTime = new Date().toISOString();
    
    if (currentChatId === chatId) {
        chat.unread = 0;
    } else {
        chat.unread = (chat.unread || 0) + 1;
    }
    
    saveData();
    renderChats();
    
    if (currentChatId === chatId) {
        renderMessages();
    }
}

function createNewChat() {
    const modal = document.getElementById('newChatModal');
    if (modal) modal.classList.add('active');
    const input = document.getElementById('newChatName');
    if (input) input.value = '';
}

function closeNewChatModal() {
    const modal = document.getElementById('newChatModal');
    if (modal) modal.classList.remove('active');
}

function createChat() {
    const name = document.getElementById('newChatName').value.trim();
    const type = document.getElementById('newChatType').value;
    
    if (!name) return;
    
    const newChat = {
        id: 'chat_' + Date.now(),
        type: type,
        name: name,
        avatar: type === 'group' ? '../png/users-alt.png' : '../png/portrait.png',
        participants: ['current'],
        lastMessage: 'Чат создан',
        lastMessageTime: new Date().toISOString(),
        unread: 0
    };
    
    if (type === 'personal') {
        newChat.participants.push('user_' + Date.now());
    } else {
        newChat.participants.push('user_' + Date.now(), 'user1', 'user2');
    }
    
    chats.unshift(newChat);
    messages[newChat.id] = [
        { id: 'msg_start', senderId: 'current', text: 'Чат создан!', time: new Date().toISOString(), read: true }
    ];
    
    saveData();
    renderChats();
    selectChat(newChat.id);
    closeNewChatModal();
}

// ========== РАБОЧИЙ PARALLAX 2.5D ДЛЯ ОДНОЙ КАРТОЧКИ ==========
let parallaxCard = null;
let parallaxBg = null;
let parallaxShadow = null;
let animFrame = null;
let targetRotX = 0, targetRotY = 0;
let currentRotX = 0, currentRotY = 0;
let targetBgX = 0, targetBgY = 0;
let currentBgX = 0, currentBgY = 0;
let targetShadowX = 0, targetShadowY = 0;
let currentShadowX = 0, currentShadowY = 0;

function initParallax() {
    const container = document.querySelector('.cards-container');
    const card = document.getElementById('profileCard3d');
    const bg = document.getElementById('cardBgImg');
    const shadow = document.getElementById('cardsShadow');
    
    if (!container || !card) return;
    
    parallaxCard = card;
    parallaxBg = bg;
    parallaxShadow = shadow;
    
    // Убираем анимацию и сбрасываем трансформации
    card.classList.remove('animate-in', 'animate-out');
    card.style.transition = 'none';
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    if (bg) {
        bg.style.transition = 'none';
        bg.style.transform = 'translate(0px, 0px) scale(1.15)';
    }
    if (shadow) {
        shadow.style.transition = 'none';
        shadow.style.transform = 'translate(0px, 0px)';
        shadow.style.opacity = '0.5';
    }
    
    // Принудительный reflow чтобы сброс применился
    void card.offsetHeight;
    
    // Возвращаем transition для плавности
    card.style.transition = 'transform 0.05s linear';
    if (bg) bg.style.transition = 'transform 0.05s linear';
    if (shadow) shadow.style.transition = 'transform 0.05s linear, opacity 0.1s ease';
    
    function onMove(e) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        targetRotY = ((x - centerX) / centerX) * 18;
        targetRotX = -((y - centerY) / centerY) * 14;
        
        targetBgX = ((x - centerX) / centerX) * 30;
        targetBgY = ((y - centerY) / centerY) * 25;
        
        targetShadowX = ((x - centerX) / centerX) * 20;
        targetShadowY = ((y - centerY) / centerY) * 15;
    }
    
    function onLeave() {
        targetRotX = 0; targetRotY = 0;
        targetBgX = 0; targetBgY = 0;
        targetShadowX = 0; targetShadowY = 0;
    }
    
    function animate() {
        currentRotX += (targetRotX - currentRotX) * 0.12;
        currentRotY += (targetRotY - currentRotY) * 0.12;
        currentBgX += (targetBgX - currentBgX) * 0.12;
        currentBgY += (targetBgY - currentBgY) * 0.12;
        currentShadowX += (targetShadowX - currentShadowX) * 0.12;
        currentShadowY += (targetShadowY - currentShadowY) * 0.12;
        
        if (parallaxCard) {
            parallaxCard.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
        }
        if (parallaxBg) {
            parallaxBg.style.transform = `translate(${currentBgX}px, ${currentBgY}px) scale(1.15)`;
        }
        if (parallaxShadow) {
            parallaxShadow.style.transform = `translate(${currentShadowX}px, ${currentShadowY}px)`;
            let intensity = 0.4 + Math.abs(currentRotX) / 30 + Math.abs(currentRotY) / 30;
            if (intensity > 0.7) intensity = 0.7;
            parallaxShadow.style.opacity = intensity;
        }
        
        animFrame = requestAnimationFrame(animate);
    }
    
    container.removeEventListener('mousemove', onMove);
    container.removeEventListener('mouseleave', onLeave);
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(animate);
}

function stopParallax() {
    if (animFrame) {
        cancelAnimationFrame(animFrame);
        animFrame = null;
    }
    if (parallaxCard) {
        parallaxCard.style.transform = '';
        parallaxCard.style.transition = '';
    }
    if (parallaxBg) {
        parallaxBg.style.transform = '';
        parallaxBg.style.transition = '';
    }
    if (parallaxShadow) {
        parallaxShadow.style.transform = '';
        parallaxShadow.style.opacity = '0.5';
        parallaxShadow.style.transition = '';
    }
    targetRotX = 0; targetRotY = 0;
    targetBgX = 0; targetBgY = 0;
    targetShadowX = 0; targetShadowY = 0;
    currentRotX = 0; currentRotY = 0;
    currentBgX = 0; currentBgY = 0;
    currentShadowX = 0; currentShadowY = 0;
}

function openProfileOverlay(userId, chatId) {
    const userData = usersProfileData[userId] || usersProfileData['user1'];
    const chat = chats.find(c => c.id === chatId);
    
    const avatarEl = document.getElementById('profileAvatar');
    const bgImgEl = document.getElementById('cardBgImg');
    const nameEl = document.getElementById('profileName');
    const usernameEl = document.getElementById('profileUsername');
    const statusEl = document.getElementById('profileStatus');
    const cityEl = document.getElementById('profileCity');
    const ageEl = document.getElementById('profileAge');
    const genderEl = document.getElementById('profileGender');
    const squadEl = document.getElementById('profileSquad');
    
    if (avatarEl) avatarEl.src = chat?.avatar || '../png/portrait.png';
    if (bgImgEl) bgImgEl.src = chat?.avatar || '../png/portrait.png';
    if (nameEl) nameEl.textContent = userData.name;
    if (usernameEl) usernameEl.textContent = userData.username;
    if (statusEl) statusEl.textContent = userData.status === 'online' ? '🟢 Онлайн' : (userData.status === 'offline' ? '⚫ Не в сети' : '👥 Группа');
    if (cityEl) cityEl.textContent = userData.city;
    if (ageEl) ageEl.textContent = userData.age;
    if (genderEl) genderEl.textContent = userData.gender;
    if (squadEl) squadEl.textContent = userData.squad;
    
    const openBtn = document.getElementById('profileOpenBtn');
    if (openBtn) {
        openBtn.onclick = () => {
            window.location.href = `../you/index.html?user=${userId}`;
        };
    }
    
    const overlay = document.getElementById('profileOverlay');
    const card = document.getElementById('profileCard3d');
    
    if (overlay) {
        overlay.classList.add('active');
        if (card) {
            // Сначала показываем карточку с анимацией
            card.classList.remove('animate-out');
            card.classList.add('animate-in');
            // Запускаем параллакс после завершения анимации появления
            setTimeout(() => {
                initParallax();
            }, 600);
        }
    }
}

function closeProfileOverlay(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList?.contains('close-profile-btn')) return;
    
    stopParallax();
    
    const overlay = document.getElementById('profileOverlay');
    const card = document.getElementById('profileCard3d');
    
    if (card) {
        card.style.transform = '';
        card.classList.remove('animate-in');
        card.classList.add('animate-out');
    }
    
    setTimeout(() => {
        if (overlay) overlay.classList.remove('active');
        if (card) card.classList.remove('animate-out');
    }, 400);
}

function toggleMobileChats() {
    const chatsList = document.getElementById('chatsList');
    if (chatsList) chatsList.classList.toggle('mobile-show');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createFallingNumbers() {
    const container = document.getElementById('fallingNumbers');
    if (!container) return;
    
    function spawnNumber() {
        const number = document.createElement('div');
        number.className = 'falling-number';
        number.textContent = '42';
        const size = Math.random() * 14 + 10;
        const left = Math.random() * 100;
        const duration = Math.random() * 12 + 8;
        const delay = Math.random() * 5;
        number.style.cssText = `left: ${left}%; font-size: ${size}px; animation-duration: ${duration}s; animation-delay: ${delay}s;`;
        container.appendChild(number);
        setTimeout(() => { if (number.parentNode) number.remove(); }, (duration + delay) * 1000 + 500);
    }
    
    for (let i = 0; i < 15; i++) setTimeout(() => spawnNumber(), i * 150);
    setInterval(() => { if (container.children.length < 45) { for (let i = 0; i < 3; i++) setTimeout(() => spawnNumber(), i * 100); } }, 600);
}

function toggleMenu() {
    const panel = document.getElementById('menuPanel');
    if (panel) panel.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function() {
    createFallingNumbers();
    loadData();
    renderChats();
    
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('burgerMenu');
        const panel = document.getElementById('menuPanel');
        if (menu && panel && !menu.contains(e.target) && panel.classList.contains('active')) {
            panel.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProfileOverlay();
            closeNewChatModal();
        }
    });
    
    const textarea = document.getElementById('messageInput');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            const chatsList = document.getElementById('chatsList');
            if (chatsList) chatsList.classList.remove('mobile-show');
        }
    });
});

window.toggleMenu = toggleMenu;
window.selectChat = selectChat;
window.sendMessage = sendMessage;
window.createNewChat = createNewChat;
window.closeNewChatModal = closeNewChatModal;
window.createChat = createChat;
window.openProfileOverlay = openProfileOverlay;
window.closeProfileOverlay = closeProfileOverlay;
window.toggleMobileChats = toggleMobileChats;