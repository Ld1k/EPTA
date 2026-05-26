// Данные чатов и сообщений
let chats = [];
let messages = {};
let currentChatId = null;

// ID текущего пользователя
const currentUserId = localStorage.getItem('epta_user_id') || 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('epta_user_id', currentUserId);

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
        // Тестовые чаты
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
        // Тестовые сообщения
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
    
    // Сбрасываем непрочитанные
    if (chat.unread > 0) {
        chat.unread = 0;
        saveData();
        renderChats();
    }
    
    // Обновляем хедер
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
    
    // Добавляем обработчик для открытия профиля
    if (chatHeaderInfo) {
        chatHeaderInfo.onclick = () => {
            if (chat.type === 'personal') {
                const userId = chat.participants.find(p => p !== 'current');
                openProfileOverlay(userId, chatId);
            }
        };
    }
    
    // Показываем инпут
    const inputWrapper = document.getElementById('chatInputWrapper');
    if (inputWrapper) inputWrapper.style.display = 'flex';
    
    renderMessages();
    
    // На мобилке скрываем список чатов
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
    
    // Скролл вниз
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
    
    // Обновляем последнее сообщение в чате
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
    
    // Имитация ответа (для теста)
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

function openProfileOverlay(userId, chatId) {
    const userData = usersProfileData[userId] || usersProfileData['user1'];
    const chat = chats.find(c => c.id === chatId);
    
    const avatarEl = document.getElementById('profileAvatar');
    const nameEl = document.getElementById('profileName');
    const usernameEl = document.getElementById('profileUsername');
    const statusEl = document.getElementById('profileStatus');
    const cityEl = document.getElementById('profileCity');
    const ageEl = document.getElementById('profileAge');
    const genderEl = document.getElementById('profileGender');
    const squadEl = document.getElementById('profileSquad');
    
    if (avatarEl) avatarEl.src = chat?.avatar || '../png/portrait.png';
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
    if (overlay) overlay.classList.add('active');
}

function closeProfileOverlay(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList?.contains('close-profile-btn')) return;
    const overlay = document.getElementById('profileOverlay');
    if (overlay) overlay.classList.remove('active');
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

// Падающие числа
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

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    createFallingNumbers();
    loadData();
    renderChats();
    
    // Закрытие меню при клике вне
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('burgerMenu');
        const panel = document.getElementById('menuPanel');
        if (menu && panel && !menu.contains(e.target) && panel.classList.contains('active')) {
            panel.classList.remove('active');
        }
    });
    
    // Закрытие оверлея по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProfileOverlay();
            closeNewChatModal();
        }
    });
    
    // Авто-высота для textarea
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
    
    // Адаптив при ресайзе
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            const chatsList = document.getElementById('chatsList');
            if (chatsList) chatsList.classList.remove('mobile-show');
        }
    });
});

// Экспорт глобальных функций
window.toggleMenu = toggleMenu;
window.selectChat = selectChat;
window.sendMessage = sendMessage;
window.createNewChat = createNewChat;
window.closeNewChatModal = closeNewChatModal;
window.createChat = createChat;
window.openProfileOverlay = openProfileOverlay;
window.closeProfileOverlay = closeProfileOverlay;
window.toggleMobileChats = toggleMobileChats;
// 3D эффект для карточек (слежение за курсором)
function init3DCards() {
    const container = document.querySelector('.cards-container');
    const stack = document.getElementById('cardsStack');
    const shadow = document.querySelector('.cards-shadow');
    const cards = document.querySelectorAll('.profile-card-3d');
    const bgImages = document.querySelectorAll('.card-bg img');
    
    if (!container || !stack) return;
    
    container.addEventListener('mousemove', function(e) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Наклон в противоположную сторону от курсора
        const rotateY = ((x - centerX) / centerX) * 15;
        const rotateX = -((y - centerY) / centerY) * 10;
        
        // Применяем наклон к стопке карточек
        stack.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Эффект "глаз следит" - фон сдвигается
        const bgShiftX = (x - centerX) / centerX * 20;
        const bgShiftY = (y - centerY) / centerY * 15;
        
        bgImages.forEach(img => {
            img.style.transform = `translate(${bgShiftX}px, ${bgShiftY}px) scale(1.1)`;
        });
        
        // Тень тоже двигается
        if (shadow) {
            shadow.style.transform = `translate(${rotateY * 2}px, ${rotateX * 2}px)`;
            shadow.style.opacity = 0.5 + Math.abs(rotateX) / 30;
        }
        
        // Дополнительный эффект для каждой карточки (глубина)
        cards.forEach((card, index) => {
            const depth = (index - 3) * 0.5;
            const cardRotateY = rotateY * (1 + depth * 0.1);
            const cardRotateX = rotateX * (1 + depth * 0.05);
            card.style.transform = `rotateX(${cardRotateX * 0.3}deg) rotateY(${cardRotateY * 0.3}deg)`;
        });
    });
    
    container.addEventListener('mouseleave', function() {
        // Возвращаем всё в исходное положение
        stack.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
        bgImages.forEach(img => {
            img.style.transform = 'translate(0px, 0px) scale(1)';
        });
        if (shadow) {
            shadow.style.transform = 'translate(0px, 0px)';
            shadow.style.opacity = 0.5;
        }
        cards.forEach(card => {
            card.style.transform = '';
        });
    });
}

// Обнови функцию openProfileOverlay, добавив инициализацию 3D эффекта
const originalOpenProfile = openProfileOverlay;
window.openProfileOverlay = function(userId, chatId) {
    originalOpenProfile(userId, chatId);
    setTimeout(() => {
        init3DCards();
    }, 100);
};