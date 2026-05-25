// Система комментариев
const Comments = {
    // Хранилище комментариев
    comments: {},
    
    // Добавить комментарий к посту
    addComment: function(postId, text, author) {
        if (!this.comments[postId]) {
            this.comments[postId] = [];
        }
        
        const comment = {
            id: Date.now(),
            text: text,
            author: author || '@username',
            date: new Date().toISOString(),
            likes: 0
        };
        
        this.comments[postId].push(comment);
        return comment;
    },
    
    // Получить комментарии поста
    getComments: function(postId) {
        return this.comments[postId] || [];
    },
    
    // Количество комментариев
    getCommentCount: function(postId) {
        return (this.comments[postId] || []).length;
    },
    
    // Удалить комментарий
    deleteComment: function(postId, commentId) {
        if (this.comments[postId]) {
            this.comments[postId] = this.comments[postId].filter(c => c.id !== commentId);
        }
    }
};