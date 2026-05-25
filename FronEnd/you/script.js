// Данные пользователя
let userData = {
    username: '@username',
    status: 'Добавить статус!',
    currentStatus: 'online'
};

// Текущий фильтр и вкладка
let currentFilter = 'date';
let currentTab = 'wall';

// Массив постов
let posts = [];

// Файлы для загрузки
let pendingFiles = [];

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    changeStatus('online');
    createFallingNumbers();
    addTestPosts();
    
    // Закрытие дропдауна при клике вне
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('statusDropdown');
        const dot = document.getElementById('statusDot');
        if (dropdown && dot && !dot.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
});

// Тестовые посты
function addTestPosts() {
    posts.push({
        id: 1,
        text: 'Первый пост! Тестируем систему 🚀',
        date: new Date('2024-01-15'),
        views: 150,
        likes: 25,
        reposts: 5,
        comments: 8
    });
    
    posts.push({
        id: 2,
        text: 'Сегодня отличный день для кодинга! 💻',
        date: new Date('2024-02-20'),
        views: 300,
        likes: 45,
        reposts: 12,
        comments: 15
    });
    
    renderPosts();
}

// Создание падающих чисел 42
function createFallingNumbers() {
    const container = document.getElementById('fallingNumbers');
    
    setInterval(() => {
        const number = document.createElement('div');
        number.className = 'falling-number';
        number.textContent = '42';
        
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 8;
        const size = Math.random() * 10 + 12;
        
        number.style.left = left + '%';
        number.style.animationDuration = duration + 's';
        number.style.fontSize = size + 'px';
        
        container.appendChild(number);
        
        setTimeout(() => {
            number.remove();
        }, duration * 1000);
    }, 800);
}

// Меню
function toggleMenu() {
    const panel = document.getElementById('menuPanel');
    panel.classList.toggle('active');
}

document.addEventListener('click', function(e) {
    const menu = document.getElementById('burgerMenu');
    const panel = document.getElementById('menuPanel');
    
    if (!menu.contains(e.target) && panel.classList.contains('active')) {
        panel.classList.remove('active');
    }
});

// Переключение дропдауна статуса
function toggleStatusDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('statusDropdown');
    dropdown.classList.toggle('show');
}

// Изменение статуса онлайн
function changeStatus(status) {
    const wrapper = document.getElementById('avatarWrapper');
    
    wrapper.classList.remove('status-online', 'status-inactive', 'status-dnd', 'status-offline');
    
    switch(status) {
        case 'online':
            wrapper.classList.add('status-online');
            break;
        case 'inactive':
            wrapper.classList.add('status-inactive');
            break;
        case 'dnd':
            wrapper.classList.add('status-dnd');
            break;
        case 'offline':
            wrapper.classList.add('status-offline');
            break;
    }
    
    userData.currentStatus = status;
    
    const dropdown = document.getElementById('statusDropdown');
    dropdown.classList.remove('show');
}

// Обработка файлов
function handleFiles(files) {
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    
    for (let file of files) {
        if (file.size > MAX_SIZE) {
            showNotification(`Файл "${file.name}" превышает 10 МБ!`);
            continue;
        }
        
        if (!pendingFiles.find(f => f.name === file.name && f.size === file.size)) {
            pendingFiles.push(file);
        }
    }
    
    updateFileList();
    document.getElementById('fileInput').value = '';
}

// Обновление списка файлов
function updateFileList() {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;
    
    fileList.innerHTML = pendingFiles.map((file, index) => `
        <div class="file-item">
            📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
            <span class="remove-file" onclick="removeFile(${index})">✕</span>
        </div>
    `).join('');
}

// Удаление файла из очереди
function removeFile(index) {
    pendingFiles.splice(index, 1);
    updateFileList();
}

// Уведомление
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Установка фильтра
function setFilter(filter, btn) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    renderPosts();
}

// Сортировка постов
function sortPosts(postsArray) {
    switch(currentFilter) {
        case 'date':
            return postsArray.sort((a, b) => b.date - a.date);
        case 'views':
            return postsArray.sort((a, b) => b.views - a.views);
        case 'reposts':
            return postsArray.sort((a, b) => b.reposts - a.reposts);
        case 'likes':
            return postsArray.sort((a, b) => b.likes - a.likes);
        case 'comments':
            return postsArray.sort((a, b) => b.comments - a.comments);
        default:
            return postsArray;
    }
}

// Рендер постов
function renderPosts() {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;
    
    const sortedPosts = sortPosts([...posts]);
    
    postsContainer.innerHTML = sortedPosts.map(post => `
        <div class="post">
            <div class="post-header">
                <div class="post-avatar-placeholder" style="width: 36px; height: 36px; font-size: 18px;">😊</div>
                <div class="post-header-info">
                    <span class="post-author">${escapeHtml(userData.username)}</span>
                    <span class="post-date">${post.date.toLocaleDateString('ru-RU')}</span>
                </div>
            </div>
            <div class="post-text">${escapeHtml(post.text)}</div>
            <div class="post-stats">
                <span>👁️ ${post.views}</span>
                <span>🔄 ${Reposts.getRepostCount(post.id) || post.reposts}</span>
                <span>❤️ ${Likes.getLikeCount(post.id) || post.likes}</span>
                <span>💬 ${Comments.getCommentCount(post.id) || post.comments}</span>
            </div>
            <div class="post-actions">
                <button class="post-action-btn" onclick="likePost(this, ${post.id})">
                    ❤️ <span>${Likes.getLikeCount(post.id) || post.likes}</span>
                </button>
                <button class="post-action-btn" onclick="commentPost(${post.id})">
                    💬 <span>${Comments.getCommentCount(post.id) || post.comments}</span>
                </button>
                <button class="post-action-btn" onclick="repostPost(${post.id})">
                    🔄 <span>${Reposts.getRepostCount(post.id) || post.reposts}</span>
                </button>
            </div>
        </div>
    `).join('');
}

// Переключение вкладок
function switchTab(btn, tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    
    currentTab = tabName;
    
    const wallContent = document.getElementById('wallContent');
    const filtersBar = document.getElementById('filtersBar');
    
    if (tabName === 'wall') {
        filtersBar.style.display = 'flex';
        wallContent.innerHTML = `
            <div class="post-editor">
                <div class="post-avatar-placeholder">😊</div>
                <div class="post-input-wrapper">
                    <textarea class="post-input" placeholder="Че нового, братан?" id="postInput"></textarea>
                    <div class="post-actions-bar">
                        <input type="file" id="fileInput" style="display: none;" multiple accept="*/*" onchange="handleFiles(this.files)">
                        <button class="post-action-icon glass-btn" title="Прикрепить файл" onclick="document.getElementById('fileInput').click()">📎</button>
                        <button class="post-action-icon glass-btn" title="Фото">📷</button>
                        <button class="post-action-icon glass-btn" title="Видео">🎬</button>
                        <div class="file-list" id="fileList"></div>
                        <button class="post-submit glass-btn" onclick="addPost()">✈️</button>
                    </div>
                </div>
            </div>
            <div id="postsContainer"></div>
        `;
        renderPosts();
    } else if (tabName === 'photos') {
        filtersBar.style.display = 'flex';
        wallContent.innerHTML = '<p style="text-align: center; padding: 60px; color: #888888; font-size: 18px;">📸 Тут будут фоточки!</p>';
    } else if (tabName === 'videos') {
        filtersBar.style.display = 'flex';
        wallContent.innerHTML = '<p style="text-align: center; padding: 60px; color: #888888; font-size: 18px;">🎥 Видосики будут тут!</p>';
    }
}

// Добавление нового поста
function addPost() {
    const input = document.getElementById('postInput');
    if (!input) return;
    
    const text = input.value.trim();
    
    // Проверяем файлы еще раз
    const MAX_SIZE = 10 * 1024 * 1024;
    for (let file of pendingFiles) {
        if (file.size > MAX_SIZE) {
            showNotification(`Файл "${file.name}" превышает 10 МБ и будет удалён!`);
            pendingFiles = pendingFiles.filter(f => f !== file);
            updateFileList();
        }
    }
    
    if (text || pendingFiles.length > 0) {
        const newPost = {
            id: Date.now(),
            text: text || '📎 Файлы прикреплены',
            date: new Date(),
            views: 0,
            likes: 0,
            reposts: 0,
            comments: 0,
            files: [...pendingFiles]
        };
        
        posts.unshift(newPost);
        pendingFiles = [];
        updateFileList();
        renderPosts();
        
        if (input) input.value = '';
    }
}

// Лайк поста
function likePost(btn, postId) {
    const span = btn.querySelector('span');
    let count = parseInt(span.textContent);
    
    if (btn.classList.contains('liked')) {
        count--;
        btn.classList.remove('liked');
        btn.style.color = '#888888';
        Likes.removeLike(postId, 'currentUser');
    } else {
        count++;
        btn.classList.add('liked');
        btn.style.color = '#ff4444';
        Likes.addLike(postId, 'currentUser');
    }
    
    span.textContent = count;
}

// Комментирование поста
function commentPost(postId) {
    const comment = prompt('Введите комментарий:');
    if (comment && comment.trim()) {
        Comments.addComment(postId, comment.trim());
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments = Comments.getCommentCount(postId);
            renderPosts();
        }
    }
}

// Репост поста
function repostPost(postId) {
    const reposted = Reposts.addRepost(postId, 'currentUser');
    const post = posts.find(p => p.id === postId);
    if (post && reposted) {
        post.reposts = Reposts.getRepostCount(postId);
        renderPosts();
    }
}

// Редактирование статуса
function editStatus() {
    const modal = document.getElementById('statusModal');
    const input = document.getElementById('statusInput');
    
    input.value = userData.status === 'Добавить статус!' ? '' : userData.status;
    modal.classList.add('active');
    input.focus();
}

function closeStatusModal() {
    document.getElementById('statusModal').classList.remove('active');
}

function saveStatus() {
    const newStatus = document.getElementById('statusInput').value.trim();
    if (newStatus) {
        userData.status = newStatus;
        document.getElementById('profileStatus').textContent = newStatus;
    }
    closeStatusModal();
}

// Друзья
function toggleFriend() {
    const btn = document.getElementById('addFriendBtn');
    if (btn.textContent.includes('Добавить')) {
        btn.innerHTML = '<span>✅</span> Друзья';
    } else {
        btn.innerHTML = '<span>👥</span> Добавить в друзья';
    }
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Закрытие модального окна по клику
document.getElementById('statusModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeStatusModal();
    }
});

// Отправка поста по Ctrl+Enter
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        const postInput = document.getElementById('postInput');
        if (postInput && document.activeElement === postInput) {
            addPost();
        }
    }
});