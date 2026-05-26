// Звуки Portal 2
const Sounds = {
    // Инициализация звуков
    init: function() {
        this.sounds = {
            clickPositive: new Audio('../sounds_portal2/button_synth_positive.wav'),
            clickNegative: new Audio('../sounds_portal2/button_synth_negative.wav'),
            dingOn: new Audio('../sounds_portal2/ding_on.wav'),
            dingOff: new Audio('../sounds_portal2/ding_off.wav'),
            doorOpen: new Audio('../sounds_portal2/door_open_chime.wav'),
            klaxon: new Audio('../sounds_portal2/klaxon1.wav'),
            potatoTimer: new Audio('../sounds_portal2/potato_timer_01.wav'),
            tick: new Audio('../sounds_portal2/tick1.wav')
        };
        
        // Устанавливаем громкость 30%
        for (let key in this.sounds) {
            if (this.sounds[key]) {
                this.sounds[key].volume = 0.3;
                // Загружаем звуки заранее
                this.sounds[key].load();
            }
        }
    },
    
    // Воспроизведение звука
    play: function(soundName) {
        try {
            const sound = this.sounds[soundName];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log('Sound play error:', e));
            }
        } catch(e) {
            console.log('Sound error:', e);
        }
    },
    
    // Успешное действие (позитивный клик)
    success: function() {
        this.play('clickPositive');
    },
    
    // Отмена/закрытие (негативный клик)
    cancel: function() {
        this.play('clickNegative');
    },
    
    // Отправка/создание
    send: function() {
        this.play('dingOn');
    },
    
    // Лайк/репост
    like: function() {
        this.play('dingOff');
    },
    
    // Ошибка
    error: function() {
        this.play('klaxon');
    },
    
    // Уведомление
    notify: function() {
        this.play('potatoTimer');
    },
    
    // Тик (при наборе текста)
    tick: function() {
        this.play('tick');
    },
    
    // Открытие двери/модалки
    open: function() {
        this.play('doorOpen');
    }
};

// Автоматическая инициализация
Sounds.init();