// Система репостов
const Reposts = {
    // Хранилище репостов
    reposts: {},
    
    // Добавить репост
    addRepost: function(postId, userId) {
        if (!this.reposts[postId]) {
            this.reposts[postId] = [];
        }
        
        if (!this.reposts[postId].includes(userId)) {
            this.reposts[postId].push(userId);
            return true;
        }
        return false;
    },
    
    // Удалить репост
    removeRepost: function(postId, userId) {
        if (this.reposts[postId]) {
            this.reposts[postId] = this.reposts[postId].filter(id => id !== userId);
        }
    },
    
    // Проверить репост
    hasReposted: function(postId, userId) {
        return (this.reposts[postId] || []).includes(userId);
    },
    
    // Количество репостов
    getRepostCount: function(postId) {
        return (this.reposts[postId] || []).length;
    }
};