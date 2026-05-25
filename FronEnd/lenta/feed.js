// Данные ленты
let feedPosts = [];
let currentFeedFilter = 'date';
let currentFeedTab = 'recommendations';

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    createFallingNumbers();
    generateFeedPosts();
    renderFeed();
});

// Создание падающих чисел
function createFallingNumbers() {
    const container = document.getElementById('fallingNumbers');
    if (!container) return;
    
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

// Генерация тестовых постов для ленты
function generateFeedPosts() {
    const users = [
        { name: '@alex_coder', avatar: '💻' },
        { name: '@design_master', avatar: '🎨' },
        { name: '@music_soul', avatar: '🎵' },
        { name: '@gamer_pro', avatar: '🎮' },
        { name: '@tech_guru', avatar: '⚡' },
        { name: '@creative_mind', avatar: '✨' }
    ];
    
    const tags = ['#ЕПТА', '#toxicGreen', '#кодинг', '#дизайн', '#технологии', '#42'];
    
    const posts = [
        {
            text: 'Только что закончил новый проект на React! Использовал Toxic Green цветовую схему 🔥 #ЕПТА #кодинг',
            likes: 234,
            views: 1200,
            reposts: 45,
            comments: 23
        },
        {
            text: 'Дизайн интерфейса в стиле glassmorphism - это просто огонь! Делюсь наработками 🎨 #дизайн #toxicGreen',
            likes: 567,
            views: 3400,
            reposts: 89,
            comments: 56
        },
        {
            text: 'Новый трек в стиле synthwave уже на подходе! Кто ждет? 🎵 #музыка #ЕПТА',
            likes: 892,
            views: 5600,
            reposts: 134,
            comments: 78
        },
        {
            text: '42 - ответ на все вопросы! Кто понял, тот понял 😎 #42 #технологии',
            likes: 1456,
            views: 8900,
            reposts: 267,
            comments: 156
        },
        {
            text: 'Разработка игры на JavaScript: делюсь опытом создания браузерной RPG 🎮 #кодинг #гейминг',
            likes: 345,
            views: 2100,
            reposts: 56,
            comments: 34
        },
        {
            text: 'Топ 5 инструментов для веб-разработчика в 2024 году! Сохраняйте себе 📌 #технологии #ЕПТА',
            likes: 678,
            views: 4500,
            reposts: 123,
            comments: 67
        },
        {
            text: 'Создаю уникальный UI kit в стиле Toxic Green. Будет доступен для скачивания! 🎨 #дизайн #toxicGreen',
            likes: 456,
            views: 2800,
            reposts: 78,
            comments: 45
        },
        {
            text: 'Программирование - это искусство! Каждая строка кода как мазок кисти 💻✨ #кодинг #42',
            likes: 789,
            views: 5100,
            reposts: 145,
            comments: 89
        }
    ];
    
    posts.forEach((post, index) => {
        const user = users[index % users.length];
        const postTags = tags.sort(() => Math.random() - 0.5).slice(0, 3);
        
        feedPosts.push({
            id: Date.now() + index,
            author: user.name,
            avatar: user.avatar,
            text: post.text,
            tags: postTags,
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            likes: post.likes,
            views: post.views,
            reposts: post.reposts,
            comments: post.comments,
            isPopular: index < 3
        });
    });
}

// Меню
function toggleMenu() {
    const panel = document.getElementById('menuPanel');
    panel.classList.toggle('active');
}

document.addEventListener('click', function(e) {
    const menu = document.getElementById('burgerMenu');
    const panel = document.getElementById('menuPanel');
    
    if (menu && panel && !menu.contains(e.target) && panel.classList.contains('active')) {
        panel.classList.remove('active');
    }
});

// Переключение вкладок ленты
function switchFeedTab(btn, tabName) {
    const tabs = document.querySelectorAll('.feed-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    
    currentFeedTab = tabName;
    
    // Показываем/скрываем фильтры
    const filtersBar = document.getElementById('filtersBar');
    if (filtersBar) {
        filtersBar.style.display = tabName === 'recommendations' ? 'flex' : 'none';
    }
    
    renderFeed();
}

// Установка фильтра
function setFeedFilter(filter, btn) {
    currentFeedFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    renderFeed();
}

// Сортировка постов
function sortFeedPosts(postsArray) {
    switch(currentFeedFilter) {
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

// Рендер ленты
function renderFeed() {
    const container = document.getElementById('feedPosts');
    if (!container) return;
    
    let postsToShow = [...feedPosts];
    
    // Фильтруем в зависимости от вкладки
    if (currentFeedTab === 'popular') {
        postsToShow = postsToShow.filter(post => post.isPopular);
    }
    
    // Сортируем
    postsToShow = sortFeedPosts(postsToShow);
    
    container.innerHTML = postsToShow.map(post => `
        <div class="feed-post">
            <div class="feed-post-header">
                <div class="feed-post-avatar">${post.avatar}</div>
                <div class="feed-post-info">
                    <div class="feed-post-author">
                        ${escapeHtml(post.author)}
                        ${post.isPopular ? '<span style="color: #61DE2A; font-size: 12px;">⭐ Popular</span>' : ''}
                    </div>
                    <div class="feed-post-date">${formatDate(post.date)}</div>
                </div>
            </div>
            <div class="feed-post-tags">
                ${post.tags.map(tag => `<a href="#" class="feed-post-tag">${tag}</a>`).join('')}
            </div>
            <div class="feed-post-text">${escapeHtml(post.text)}</div>
            <div class="feed-post-stats">
                <span>👁️ ${formatNumber(post.views)}</span>
                <span>🔄 ${formatNumber(post.reposts)}</span>
                <span>❤️ ${formatNumber(post.likes)}</span>
                <span>💬 ${formatNumber(post.comments)}</span>
            </div>
            <div class="feed-post-actions">
                <button class="post-action-btn" onclick="likeFeedPost(this, ${post.id})">
                    ❤️ <span>${Likes.getLikeCount(post.id) || post.likes}</span>
                </button>
                <button class="post-action-btn" onclick="commentFeedPost(${post.id})">
                    💬 <span>${Comments.getCommentCount(post.id) || post.comments}</span>
                </button>
                <button class="post-action-btn" onclick="repostFeedPost(${post.id})">
                    🔄 <span>${Reposts.getRepostCount(post.id) || post.reposts}</span>
                </button>
            </div>
        </div>
    `).join('');
}

// Функции взаимодействия с постами
function likeFeedPost(btn, postId) {
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

function commentFeedPost(postId) {
    const comment = prompt('Введите комментарий:');
    if (comment && comment.trim()) {
        Comments.addComment(postId, comment.trim());
        const post = feedPosts.find(p => p.id === postId);
        if (post) {
            post.comments = Comments.getCommentCount(postId);
            renderFeed();
        }
    }
}

function repostFeedPost(postId) {
    const reposted = Reposts.addRepost(postId, 'currentUser');
    const post = feedPosts.find(p => p.id === postId);
    if (post && reposted) {
        post.reposts = Reposts.getRepostCount(postId);
        renderFeed();
    }
}

// Форматирование даты
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes} мин. назад`;
        }
        return `${hours} ч. назад`;
    } else if (days === 1) {
        return 'Вчера';
    } else if (days < 7) {
        return `${days} дн. назад`;
    } else {
        return date.toLocaleDateString('ru-RU');
    }
}

// Форматирование чисел
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}