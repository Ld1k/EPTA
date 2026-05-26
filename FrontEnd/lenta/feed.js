let publicPosts = JSON.parse(localStorage.getItem('epta_public_posts') || '[]');
publicPosts = publicPosts.map(p => ({...p, date: new Date(p.date), files: p.files || [], views: p.views || 0, viewedBy: p.viewedBy || []}));

let currentFeedFilter = 'date';
let currentFeedTab = 'recommendations';
let currentFeedPostId = null;

let feedPendingFiles = [];

let recentContacts = [
    {name: '@alex', avatar: '../png/portrait.png'},
    {name: '@maria', avatar: '../png/portrait.png'},
    {name: '@dmitry', avatar: '../png/portrait.png'}
];

const currentUserId = localStorage.getItem('epta_user_id') || 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('epta_user_id', currentUserId);

const currentUsername = localStorage.getItem('epta_username') || '@username';

// ==================== СИСТЕМА КУЛДАУНА ПОСТОВ ====================
let postCooldown = {
    lastPostTime: 0,
    consecutivePosts: 0,
    currentCooldown: 0,
    cooldownEndTime: 0
};

function getCurrentCooldown() {
    const now = Date.now();
    if (now >= postCooldown.cooldownEndTime) {
        return 0;
    }
    return Math.ceil((postCooldown.cooldownEndTime - now) / 1000);
}

function updateCooldownDisplay() {
    const cooldownElement = document.getElementById('postCooldownDisplay');
    if (!cooldownElement) return;
    
    const remaining = getCurrentCooldown();
    if (remaining > 0) {
        cooldownElement.style.display = 'flex';
        const span = cooldownElement.querySelector('span');
        if (span) span.textContent = remaining + ' сек';
    } else {
        cooldownElement.style.display = 'none';
    }
}

function checkAndApplyCooldown() {
    const now = Date.now();
    const remaining = getCurrentCooldown();
    
    if (remaining > 0) {
        return { allowed: false, remaining: remaining };
    }
    
    const timeSinceLast = now - postCooldown.lastPostTime;
    const MAX_GAP = 10000;
    
    if (timeSinceLast > MAX_GAP) {
        postCooldown.consecutivePosts = 0;
        postCooldown.currentCooldown = 5000;
    } else if (postCooldown.lastPostTime > 0) {
        postCooldown.consecutivePosts++;
        
        if (postCooldown.consecutivePosts >= 6) {
            postCooldown.currentCooldown = 300000;
        } else if (postCooldown.consecutivePosts >= 5) {
            postCooldown.currentCooldown = 160000;
        } else if (postCooldown.consecutivePosts >= 4) {
            postCooldown.currentCooldown = 80000;
        } else if (postCooldown.consecutivePosts >= 3) {
            postCooldown.currentCooldown = 40000;
        } else if (postCooldown.consecutivePosts >= 2) {
            postCooldown.currentCooldown = 20000;
        } else {
            postCooldown.currentCooldown = 5000;
        }
    } else {
        postCooldown.currentCooldown = 5000;
    }
    
    return { allowed: true, remaining: 0 };
}

function applyCooldown() {
    const now = Date.now();
    postCooldown.lastPostTime = now;
    postCooldown.cooldownEndTime = now + postCooldown.currentCooldown;
    updateCooldownDisplay();
    
    if (window.cooldownInterval) clearInterval(window.cooldownInterval);
    window.cooldownInterval = setInterval(() => {
        const remaining = getCurrentCooldown();
        if (remaining <= 0) {
            clearInterval(window.cooldownInterval);
            updateCooldownDisplay();
        } else {
            updateCooldownDisplay();
        }
    }, 1000);
}

function formatCooldownTime(seconds) {
    if (seconds >= 60) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} мин ${secs} сек`;
    }
    return `${seconds} сек`;
}

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

document.addEventListener('DOMContentLoaded', function() {
    createFallingNumbers();
    refreshPublicPosts();
    renderFeed();
    updateSidebar();
    updateCooldownDisplay();
    
    document.getElementById('feedFileInput')?.addEventListener('change', function(e) {
        handleFeedFiles(Array.from(e.target.files));
    });
});

function refreshPublicPosts() {
    publicPosts = JSON.parse(localStorage.getItem('epta_public_posts') || '[]');
    publicPosts = publicPosts.map(p => ({...p, date: new Date(p.date), files: p.files || [], views: p.views || 0, viewedBy: p.viewedBy || []}));
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

function toggleMenu() { document.getElementById('menuPanel').classList.toggle('active'); }

document.addEventListener('click', function(e) {
    const menu = document.getElementById('burgerMenu');
    const panel = document.getElementById('menuPanel');
    if (menu && panel && !menu.contains(e.target) && panel.classList.contains('active')) panel.classList.remove('active');
    if (e.target.id === 'feedCommentsModal') closeFeedComments();
    if (e.target.id === 'repostModal') closeRepostModal();
});

function switchFeedTab(btn, tabName) {
    document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    currentFeedTab = tabName;
    renderFeed();
}

function setFeedFilter(filter, btn) {
    currentFeedFilter = filter;
    document.querySelectorAll('#filtersBar .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderFeed();
}

// ==================== ФАЙЛЫ ====================

function openFeedFileSelector() {
    document.getElementById('feedFileInput').click();
}

function handleFeedFiles(files) {
    const MAX = 10 * 1024 * 1024;
    for (let f of files) {
        if (f.size > MAX) {
            alert('Файл слишком большой! Максимум 10MB');
            continue;
        }
        if (!feedPendingFiles.find(x => x.name === f.name && x.size === f.size)) {
            feedPendingFiles.push(f);
        }
    }
    updateFeedFileList();
    document.getElementById('feedFileInput').value = '';
}

function updateFeedFileList() {
    const container = document.getElementById('feedFileList');
    if (!container) return;
    container.innerHTML = feedPendingFiles.map((f, i) => `
        <div class="feed-creator-file">
            📎 ${f.name.substring(0, 20)} (${(f.size/1024/1024).toFixed(2)} MB)
            <span class="feed-creator-file-remove" onclick="removeFeedFile(${i})">✕</span>
        </div>
    `).join('');
}

function removeFeedFile(index) {
    feedPendingFiles.splice(index, 1);
    updateFeedFileList();
}

// ==================== СОЗДАНИЕ ПОСТА ====================

async function submitFeedPost() {
    const input = document.getElementById('feedPostInput');
    const text = input ? input.value.trim() : '';
    
    const cooldownCheck = checkAndApplyCooldown();
    if (!cooldownCheck.allowed) {
        alert(`Подожди ${formatCooldownTime(cooldownCheck.remaining)} перед следующим постом!`);
        return;
    }
    
    if (!text && feedPendingFiles.length === 0) {
        alert('Напишите что-нибудь или прикрепите файл');
        return;
    }
    
    const filesData = [];
    for (let file of feedPendingFiles) {
        const data = await readFileAsBase64(file);
        filesData.push({
            name: file.name,
            type: file.type,
            size: file.size,
            data: data
        });
    }
    
    const newPost = {
        id: Date.now(),
        text: text,
        date: new Date(),
        views: 0,
        viewedBy: [],
        author: currentUsername,
        avatar: '../png/portrait.png',
        files: filesData
    };
    
    publicPosts.unshift(newPost);
    savePublicPosts();
    
    let wallPosts = JSON.parse(localStorage.getItem('epta_wall_posts') || '[]');
    wallPosts = wallPosts.map(p => ({...p, date: new Date(p.date), files: p.files || [], views: p.views || 0, viewedBy: p.viewedBy || []}));
    wallPosts.unshift({...newPost, files: []});
    const cleanWall = wallPosts.map(p => ({
        id: p.id, text: p.text, date: p.date, views: p.views, viewedBy: p.viewedBy,
        author: p.author, avatar: p.avatar, files: []
    }));
    localStorage.setItem('epta_wall_posts', JSON.stringify(cleanWall));
    
    input.value = '';
    feedPendingFiles = [];
    updateFeedFileList();
    
    applyCooldown();
    
    refreshPublicPosts();
    renderFeed();
    updateSidebar();
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderPostFiles(files) {
    if (!files || !files.length) return '';
    let html = '<div class="post-files">';
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.data) {
            if (f.type.startsWith('image/')) {
                html += `<img src="${f.data}" class="post-file-image" onclick="window.open(this.src)">`;
            } else if (f.type.startsWith('video/')) {
                html += `<video src="${f.data}" class="post-file-video" controls></video>`;
            } else {
                html += `<div class="post-file-other">📎 ${f.name} (${(f.size/1024/1024).toFixed(2)} MB)</div>`;
            }
        }
    }
    html += '</div>';
    return html;
}

function savePublicPosts() {
    const clean = publicPosts.map(p => ({
        id: p.id, text: p.text, date: p.date, views: p.views, viewedBy: p.viewedBy,
        author: p.author, avatar: p.avatar,
        files: p.files || []
    }));
    localStorage.setItem('epta_public_posts', JSON.stringify(clean));
}

// ==================== ХЕШТЕГИ ====================

function extractHashtags(text) {
    if (!text) return [];
    const matches = text.match(/#[а-яА-ЯёЁa-zA-Z0-9_]+/g);
    if (!matches) return [];
    return [...new Set(matches)];
}

function calculateHashtagRank() {
    refreshPublicPosts();
    const hashtagStats = {};
    
    publicPosts.forEach(post => {
        const tags = extractHashtags(post.text || '');
        const uniqueTags = [...new Set(tags)];
        
        uniqueTags.forEach(tag => {
            const key = tag.toLowerCase();
            if (!hashtagStats[key]) {
                hashtagStats[key] = { tag: tag, count: 0, totalScore: 0 };
            }
            hashtagStats[key].count++;
            const score = (Likes.getLikeCount(post.id) || 0) + 
                         (Comments.getCommentCount(post.id) || 0) + 
                         (Reposts.getRepostCount(post.id) || 0) + 
                         (post.views || 0);
            hashtagStats[key].totalScore += score;
        });
    });
    
    return Object.values(hashtagStats)
        .sort((a, b) => {
            if (a.count !== b.count) return b.count - a.count;
            return b.totalScore - a.totalScore;
        })
        .slice(0, 10);
}

function calculateTopPosts() {
    refreshPublicPosts();
    return [...publicPosts].map(post => ({
        ...post,
        totalScore: (Likes.getLikeCount(post.id) || 0) + 
                    (Comments.getCommentCount(post.id) || 0) + 
                    (Reposts.getRepostCount(post.id) || 0) + 
                    (post.views || 0)
    })).sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);
}

function updateSidebar() {
    const hc = document.getElementById('topHashtags');
    if (hc) {
        const th = calculateHashtagRank();
        hc.innerHTML = th.length === 0 ? '<span style="color:#666;font-size:13px;">Пока нет хештегов</span>' : th.map(h => `<a href="#" class="hashtag" onclick="searchByHashtag('${h.tag.replace('#', '')}'); return false;">${h.tag} (${h.count})</a>`).join('');
    }
    const tc = document.getElementById('topPosts');
    if (tc) {
        const tp = calculateTopPosts();
        tc.innerHTML = tp.length === 0 ? '<div style="color:#666;font-size:13px;text-align:center;padding:20px;">Пока нет постов</div>' : tp.map((post, i) => `
            <div class="popular-post-item" onclick="scrollToPost(${post.id})">
                <div class="popular-post-rank">#${i + 1}</div>
                <div class="popular-post-info">
                    <div class="popular-post-text">${escapeHtml((post.text || '').substring(0, 50))}${post.text && post.text.length > 50 ? '...' : ''}</div>
                    <div class="popular-post-stats">${post.totalScore} очков</div>
                </div>
            </div>
        `).join('');
    }
}

function searchByHashtag(tag) {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '#' + tag;
    refreshPublicPosts();
    const filtered = publicPosts.filter(post => {
        const tags = extractHashtags(post.text || '');
        return tags.some(t => t.toLowerCase() === '#' + tag.toLowerCase());
    });
    renderFilteredFeed(filtered);
}

function renderFilteredFeed(posts) {
    const container = document.getElementById('feedPosts');
    if (!container) return;
    if (!posts.length) {
        container.innerHTML = '<p style="text-align:center;padding:60px;color:#888;">Постов с этим хештегом не найдено</p>';
        return;
    }
    container.innerHTML = posts.map(post => renderPostHTML(post)).join('');
    setTimeout(() => setupViewTracking(posts), 100);
}

function scrollToPost(postId) {
    const postElement = document.querySelector(`.feed-post[data-post-id="${postId}"]`);
    if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        postElement.style.borderColor = '#61DE2A';
        postElement.style.boxShadow = '0 0 20px rgba(97, 222, 42, 0.5)';
        setTimeout(() => {
            postElement.style.borderColor = '';
            postElement.style.boxShadow = '';
        }, 2000);
    }
}

function sortFeedPosts(arr) {
    const sorted = [...arr];
    switch(currentFeedFilter) {
        case 'date': return sorted.sort((a, b) => b.date - a.date);
        case 'views': return sorted.sort((a, b) => (b.views||0) - (a.views||0));
        case 'reposts': return sorted.sort((a, b) => Reposts.getRepostCount(b.id) - Reposts.getRepostCount(a.id));
        case 'likes': return sorted.sort((a, b) => Likes.getLikeCount(b.id) - Likes.getLikeCount(a.id));
        case 'comments': return sorted.sort((a, b) => Comments.getCommentCount(b.id) - Comments.getCommentCount(a.id));
        default: return sorted;
    }
}

function getPostsByTab() {
    refreshPublicPosts();
    let posts = [...publicPosts];
    
    switch(currentFeedTab) {
        case 'recommendations':
            posts.sort((a, b) => {
                const scoreA = (Likes.getLikeCount(a.id) || 0) + (Comments.getCommentCount(a.id) || 0) + (Reposts.getRepostCount(a.id) || 0) + (a.views || 0);
                const scoreB = (Likes.getLikeCount(b.id) || 0) + (Comments.getCommentCount(b.id) || 0) + (Reposts.getRepostCount(b.id) || 0) + (b.views || 0);
                const dateWeight = 0.3;
                const scoreWeight = 0.7;
                const dateA = a.date.getTime();
                const dateB = b.date.getTime();
                const maxDate = Math.max(dateA, dateB);
                const normDateA = dateA / maxDate;
                const normDateB = dateB / maxDate;
                const normScoreA = scoreA / (Math.max(scoreA, scoreB) || 1);
                const normScoreB = scoreB / (Math.max(scoreA, scoreB) || 1);
                const rankA = normDateA * dateWeight + normScoreA * scoreWeight;
                const rankB = normDateB * dateWeight + normScoreB * scoreWeight;
                return rankB - rankA;
            });
            break;
        case 'popular':
            posts.sort((a, b) => {
                const scoreA = (Likes.getLikeCount(a.id) || 0) + (Comments.getCommentCount(a.id) || 0) + (Reposts.getRepostCount(a.id) || 0) + (a.views || 0);
                const scoreB = (Likes.getLikeCount(b.id) || 0) + (Comments.getCommentCount(b.id) || 0) + (Reposts.getRepostCount(b.id) || 0) + (b.views || 0);
                return scoreB - scoreA;
            });
            break;
        case 'fresh':
            posts.sort((a, b) => b.date - a.date);
            break;
    }
    
    return posts;
}

function formatDateTime(date) {
    const d = new Date(date);
    const now = new Date();
    const days = Math.floor((now - d) / 86400000);
    const time = d.toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'});
    const dm = d.toLocaleDateString('ru-RU', {day:'numeric', month:'long'});
    if (days === 0) return `сегодня в ${time}`;
    if (days === 1) return `вчера в ${time}`;
    return `${dm} в ${time}`;
}

function renderPostHTML(post) {
    const isLiked = Likes.hasLiked(post.id, currentUserId);
    const viewsCount = formatNumber(post.views || 0);
    const repostCount = formatNumber(Reposts.getRepostCount(post.id));
    const likeCount = formatNumber(Likes.getLikeCount(post.id));
    const commentCount = formatNumber(Comments.getCommentCount(post.id));
    
    return `
    <div class="feed-post" data-post-id="${post.id}">
        <div class="feed-post-header">
            <div class="feed-post-avatar"><img src="../png/portrait.png" alt=""></div>
            <div class="feed-post-info">
                <div class="feed-post-author">${escapeHtml(post.author || '@username')}</div>
                <div class="feed-post-date">${formatDateTime(post.date)}</div>
            </div>
        </div>
        ${post.text ? `<div class="feed-post-text">${escapeHtml(post.text)}</div>` : ''}
        ${renderPostFiles(post.files || [])}
        
        <div class="feed-post-actions">
            <div class="stat-view">
                <img src="../png/eye.png" class="icon-16" alt=""> ${viewsCount}
            </div>
            <button class="post-action-btn" onclick="repostFeedPost(${post.id})">
                <img src="../png/refresh.png" class="icon-16" alt=""> ${repostCount}
            </button>
            <button class="post-action-btn ${isLiked ? 'liked' : ''}" onclick="likeFeedPost(this, ${post.id})" style="${isLiked ? 'color:#61DE2A;' : ''}">
                <img src="../png/${isLiked ? 'heart_on' : 'heart_off'}.png" class="icon-16" alt=""> ${likeCount}
            </button>
            <button class="post-action-btn" onclick="openFeedComments(${post.id})">
                <img src="../png/comment.png" class="icon-16" alt=""> ${commentCount}
            </button>
        </div>
    </div>
    `;
}

function incrementViews(postId) {
    const post = publicPosts.find(p => p.id === postId);
    if (post && !post.viewedBy?.includes(currentUserId)) {
        if (!post.viewedBy) post.viewedBy = [];
        post.viewedBy.push(currentUserId);
        post.views = post.viewedBy.length;
        savePublicPosts();
        return true;
    }
    return false;
}

let processedViews = new Set();

function renderFeed() {
    const container = document.getElementById('feedPosts');
    if (!container) return;
    
    let posts = getPostsByTab();
    posts = sortFeedPosts(posts);
    
    if (!posts.length) {
        container.innerHTML = '<p style="text-align:center;padding:60px;color:#888;font-size:18px;">Пока нет публичных постов</p>';
        return;
    }
    
    container.innerHTML = posts.map(post => renderPostHTML(post)).join('');
    
    setTimeout(() => setupViewTracking(posts), 100);
}

function setupViewTracking(posts) {
    posts.forEach(post => {
        const postElement = document.querySelector(`.feed-post[data-post-id="${post.id}"]`);
        if (postElement && isElementInViewport(postElement) && !processedViews.has(post.id)) {
            processedViews.add(post.id);
            const viewed = incrementViews(post.id);
            if (viewed) {
                const viewsElement = postElement.querySelector('.stat-view');
                if (viewsElement) {
                    const newViews = formatNumber(post.views + 1);
                    viewsElement.innerHTML = `<img src="../png/eye.png" class="icon-16" alt=""> ${newViews}`;
                }
            }
        }
    });
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight - 100 && rect.bottom > 0;
}

let viewTimeout;
window.addEventListener('scroll', function() {
    if (viewTimeout) clearTimeout(viewTimeout);
    viewTimeout = setTimeout(() => {
        document.querySelectorAll('.feed-post').forEach(postEl => {
            const postId = parseInt(postEl.dataset.postId);
            if (postId && !processedViews.has(postId) && isElementInViewport(postEl)) {
                processedViews.add(postId);
                const viewed = incrementViews(postId);
                if (viewed) {
                    const viewsElement = postEl.querySelector('.stat-view');
                    if (viewsElement) {
                        const post = publicPosts.find(p => p.id === postId);
                        const newViews = formatNumber(post?.views || 0);
                        viewsElement.innerHTML = `<img src="../png/eye.png" class="icon-16" alt=""> ${newViews}`;
                    }
                }
            }
        });
    }, 300);
});

function likeFeedPost(btn, postId) {
    if (btn.classList.contains('liked')) {
        btn.classList.remove('liked');
        btn.style.color = '';
        Likes.removeLike(postId, currentUserId);
        const img = btn.querySelector('img');
        if (img) img.src = '../png/heart_off.png';
    } else {
        btn.classList.add('liked');
        btn.style.color = '#61DE2A';
        Likes.addLike(postId, currentUserId);
        const img = btn.querySelector('img');
        if (img) img.src = '../png/heart_on.png';
    }
    
    const newCount = formatNumber(Likes.getLikeCount(postId));
    btn.innerHTML = `<img src="../png/${btn.classList.contains('liked') ? 'heart_on' : 'heart_off'}.png" class="icon-16" alt=""> ${newCount}`;
    
    updateSidebar();
    if (currentFeedFilter === 'likes') renderFeed();
}

function repostFeedPost(postId) {
    if (Reposts.hasReposted(postId, currentUserId)) {
        Reposts.removeRepost(postId, currentUserId);
    } else {
        Reposts.addRepost(postId, currentUserId);
    }
    renderFeed();
    updateSidebar();
}

function openRepostModal(postId) {
    currentFeedPostId = postId;
    document.getElementById('repostModal').classList.add('active');
    document.getElementById('repostContacts').innerHTML = recentContacts.map(c => `
        <div class="repost-contact-item" onclick="sendRepost(${postId}, '${escapeHtml(c.name)}')">
            <img src="${c.avatar}" class="icon-24" alt="" style="border-radius:50%;"> <span>${escapeHtml(c.name)}</span>
        </div>
    `).join('') + `
        <div class="repost-contact-item" onclick="sendRepost(${postId}, 'all')">
            <img src="../png/users-alt.png" class="icon-24" alt=""> <span>Всем друзьям</span>
        </div>
    `;
}

function closeRepostModal() { document.getElementById('repostModal').classList.remove('active'); }

function sendRepost(postId, target) {
    if (Reposts.hasReposted(postId, currentUserId)) {
        Reposts.removeRepost(postId, currentUserId);
    } else {
        Reposts.addRepost(postId, currentUserId);
    }
    closeRepostModal();
    renderFeed();
    updateSidebar();
}

function openFeedComments(postId) {
    currentFeedPostId = postId;
    document.getElementById('feedCommentsModal').classList.add('active');
    renderFeedComments(postId);
}

function closeFeedComments() { document.getElementById('feedCommentsModal').classList.remove('active'); }

function addFeedComment() {
    const input = document.getElementById('feedCommentInput');
    const text = input.value.trim();
    if (text && currentFeedPostId) {
        Comments.addComment(currentFeedPostId, text, currentUsername);
        input.value = '';
        renderFeedComments(currentFeedPostId);
        renderFeed();
        updateSidebar();
    }
}

function renderFeedComments(postId) {
    const list = document.getElementById('feedCommentsList');
    const comments = Comments.getComments(postId);
    list.innerHTML = comments.length === 0 
        ? '<p style="color:#666;text-align:center;padding:20px;">💬 Нет комментариев</p>'
        : comments.map(c => `<div class="comment-item"><div class="comment-header"><img src="../png/portrait.png" class="icon-20" alt="" style="border-radius:50%;"><span class="comment-author">${escapeHtml(c.author)}</span><span class="comment-date">${formatDateTime(new Date(c.date))}</span></div><div class="comment-text">${escapeHtml(c.text)}</div></div>`).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}