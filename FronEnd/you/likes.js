// Система лайков
const Likes = {
    // Хранилище лайков
    likes: {},
    
    // Добавить лайк
    addLike: function(postId, userId) {
        if (!this.likes[postId]) {
            this.likes[postId] = [];
        }
        
        if (!this.likes[postId].includes(userId)) {
            this.likes[postId].push(userId);
            return true;
        }
        return false;
    },
    
    // Удалить лайк
    removeLike: function(postId, userId) {
        if (this.likes[postId]) {
            this.likes[postId] = this.likes[postId].filter(id => id !== userId);
        }
    },
    
    // Проверить лайк
    hasLiked: function(postId, userId) {
        return (this.likes[postId] || []).includes(userId);
    },
    
    // Количество лайков
    getLikeCount: function(postId) {
        return (this.likes[postId] || []).length;
    }
};