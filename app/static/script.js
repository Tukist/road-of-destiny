/**
 * 命运之路 — 终端交互引擎
 * 打字机效果 · Web Audio 音效 · 键盘导航 · 动态主题
 */

// ==================== 音频引擎 ====================
const AudioEngine = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    musicOsc: null,
    musicPlaying: false,
    initialized: false,

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.08;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.3;
            this.sfxGain.connect(this.masterGain);

            this.initialized = true;
        } catch(e) {
            console.log('Audio not available:', e);
        }
    },

    /** 打字音效 — 短促清脆的咔嗒声 */
    playTypeClick() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.04);
    },

    /** 选择确认音效 */
    playSelect() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        // 上升音阶
        [523, 659, 784].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.15);
        });
    },

    /** 场景切换音效 */
    playSceneChange() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.3);
        osc.frequency.linearRampToValueAtTime(400, now + 0.6);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.8);
    },

    /** 死亡音效 */
    playDeath() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        // 低沉下降音
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 1.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 2.2);

        // 心跳声
        for (let i = 0; i < 3; i++) {
            const hbOsc = this.ctx.createOscillator();
            const hbGain = this.ctx.createGain();
            hbOsc.type = 'sine';
            hbOsc.frequency.value = 60;
            hbGain.gain.setValueAtTime(0.2, now + 1.0 + i * 0.4);
            hbGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0 + i * 0.4 + 0.2);
            hbOsc.connect(hbGain);
            hbGain.connect(this.sfxGain);
            hbOsc.start(now + 1.0 + i * 0.4);
            hbOsc.stop(now + 1.0 + i * 0.4 + 0.3);
        }
    },

    /** 彩蛋音效 */
    playEasterEgg() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.08, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.15);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
        });
    },

    /** 拍桌子 — 低沉冲击 + 高频噪声 */
    playTableSlam() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        // 低频撞击
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
        // 噪声层
        this._playNoiseBurst(now, 0.08, 0.08);
    },

    /** 枪声 — 巨响 + 残响 */
    playGunshot() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        // 主爆音
        this._playNoiseBurst(now, 0.5, 0.15);
        // 低频轰鸣
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.7);
        // 延迟回声
        setTimeout(() => {
            if (!this.initialized) return;
            const t2 = this.ctx.currentTime;
            this._playNoiseBurst(t2, 0.15, 0.3);
        }, 150);
    },

    /** 拔剑 — 金属摩擦声 */
    playSwordDraw() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 5;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.55);
    },

    /** 敲门声 — 三下叩击 */
    playDoorKnock() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const t = now + i * 0.25;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, t);
            osc.frequency.exponentialRampToValueAtTime(60, t + 0.06);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.1);
        }
    },

    /** 倒酒 — 轻柔水声 */
    playWinePour() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        this._playNoiseBurst(now, 0.04, 0.5, 800);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.6);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.8);
    },

    /** 钟声 — 教堂婚礼 */
    playChurchBell() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const t = now + i * 0.8;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523, t);
            osc.frequency.setValueAtTime(466, t + 0.3);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 1.3);
        }
    },

    /** 马车行驶 — 节奏马蹄 */
    playHorseGallop() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 6; i++) {
            const t = now + i * 0.18;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = 80 + Math.random() * 40;
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.08);
        }
    },

    /** 乌鸦叫 — 嘶哑噪声 */
    playCrowCaw() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 2; i++) {
            const t = now + i * 0.7;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.linearRampToValueAtTime(200, t + 0.15);
            osc.frequency.setValueAtTime(600, t + 0.2);
            osc.frequency.linearRampToValueAtTime(250, t + 0.35);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.linearRampToValueAtTime(0.1, t + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 600;
            filter.Q.value = 3;
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.45);
        }
    },

    /** 火焰燃烧 — 噼啪声 */
    playFireCrackle() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 12; i++) {
            const t = now + Math.random() * 2;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = 200 + Math.random() * 500;
            gain.gain.setValueAtTime(0.03 * Math.random(), t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.04);
        }
    },

    /** 解锁跳过键 — 魔法音效 */
    playSkipUnlock() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        const notes = [262, 330, 392, 523, 659, 784];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.1, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.25);
        });
    },

    /** 戒指解锁 — 低沉神秘 + 时间回溯 */
    playRingUnlock() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        // 低频持续音
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.8);
        osc.frequency.linearRampToValueAtTime(60, now + 1.6);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 1.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 2.2);
        // 叮铃声
        [1200, 1000, 1400, 800].forEach((freq, i) => {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = 'triangle';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.06, now + 1.0 + i * 0.2);
            g.gain.exponentialRampToValueAtTime(0.001, now + 1.0 + i * 0.2 + 0.4);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(now + 1.0 + i * 0.2);
            o.stop(now + 1.0 + i * 0.2 + 0.5);
        });
    },

    /** 播放场景音效 */
    playSceneSound(soundName) {
        const map = {
            'table_slam': () => this.playTableSlam(),
            'gunshot': () => this.playGunshot(),
            'sword_draw': () => this.playSwordDraw(),
            'door_knock': () => this.playDoorKnock(),
            'wine_pour': () => this.playWinePour(),
            'church_bell': () => this.playChurchBell(),
            'horse_gallop': () => this.playHorseGallop(),
            'crow_caw': () => this.playCrowCaw(),
            'fire_crackle': () => this.playFireCrackle(),
            'easter_egg': () => this.playEasterEgg(),
            'death': () => this.playDeath(),
            'scene_change': () => this.playSceneChange(),
            'skip_unlock': () => this.playSkipUnlock(),
        };
        const fn = map[soundName];
        if (fn) {
            // 确保音频已初始化
            this.init();
            fn();
        }
    },

    /** 噪声爆发辅助函数 */
    _playNoiseBurst(startTime, volume, duration, filterFreq = 2000) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        source.start(startTime);
        source.stop(startTime + duration);
    },

    /** 启动背景音乐 — 环境低音嗡鸣 */
    startMusic(theme = 'default') {
        if (!this.initialized || this.musicPlaying) return;
        const now = this.ctx.currentTime;

        // 低沉的持续音
        this.musicOsc = this.ctx.createOscillator();
        const musicFilter = this.ctx.createBiquadFilter();
        musicFilter.type = 'lowpass';
        musicFilter.frequency.value = 200;
        musicFilter.Q.value = 2;

        this.musicOsc.type = 'triangle';
        this.musicOsc.frequency.value = 55;  // A1 低沉基音

        // 添加缓慢的频率调制
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.1;
        lfoGain.gain.value = 3;
        lfo.connect(lfoGain);
        lfoGain.connect(this.musicOsc.frequency);
        lfo.start(now);

        this.musicOsc.connect(musicFilter);
        musicFilter.connect(this.musicGain);
        this.musicOsc.start(now);
        this.musicPlaying = true;
    },

    /** 淡出音乐 */
    stopMusic() {
        if (!this.musicPlaying) return;
        const now = this.ctx.currentTime;
        this.musicGain.gain.linearRampToValueAtTime(0, now + 1.5);
        setTimeout(() => {
            if (this.musicOsc) {
                try { this.musicOsc.stop(); } catch(e) {}
                this.musicOsc = null;
            }
            this.musicPlaying = false;
            this.musicGain.gain.value = 0.08;
        }, 1600);
    },

    /** 调整音乐音量 */
    setMusicVolume(v) {
        if (this.musicGain) this.musicGain.gain.value = v;
    }
};

// ==================== 主题管理器 ====================
const ThemeManager = {
    current: 'default',

    apply(theme) {
        if (this.current === theme) return;
        const terminal = document.querySelector('.terminal');
        if (!terminal) return;

        // 移除旧主题
        terminal.classList.remove(
            'theme-default', 'theme-tavern', 'theme-village',
            'theme-paris', 'theme-palace', 'theme-death',
            'theme-happy', 'theme-easter'
        );

        // 添加新主题
        terminal.classList.add('theme-' + theme);
        this.current = theme;

        // 根据主题调整音乐
        if (theme === 'death') {
            AudioEngine.setMusicVolume(0.03);
        } else if (theme === 'easter') {
            AudioEngine.setMusicVolume(0.1);
        } else {
            AudioEngine.setMusicVolume(0.08);
        }
    },

    getSceneTheme(sceneId) {
        if (!sceneId) return 'default';

        if (sceneId.includes('death') || sceneId.includes('L9_') ||
            sceneId.includes('R9_') || sceneId.includes('M8_')) {
            return 'death';
        }
        if (sceneId.includes('happy') || sceneId.includes('M3_happy')) {
            return 'happy';
        }
        if (sceneId.includes('drunk') || sceneId.includes('L3_inn') ||
            sceneId.includes('L3_poetry') || sceneId.includes('L4_') ||
            sceneId.includes('L5_') || sceneId.includes('L6_') ||
            sceneId.includes('tavern')) {
            return 'tavern';
        }
        if (sceneId.includes('R2_') || sceneId.includes('R3_') ||
            sceneId.includes('paris') || sceneId.includes('R4_') ||
            sceneId.includes('R5_') || sceneId.includes('R8_')) {
            return 'paris';
        }
        if (sceneId.includes('palace') || sceneId.includes('R6_') ||
            sceneId.includes('R7_') || sceneId.includes('king')) {
            return 'palace';
        }
        if (sceneId.includes('village') || sceneId.includes('M1_') ||
            sceneId.includes('M2_') || sceneId.includes('M3_') ||
            sceneId.includes('M4_') || sceneId.includes('crossroads') ||
            sceneId.includes('sheep') || sceneId.includes('stargaz')) {
            return 'village';
        }
        if (sceneId.includes('easter') || sceneId.includes('egg')) {
            return 'easter';
        }
        return 'default';
    }
};

// ==================== 跳过键管理器 ====================
const SkipKeyManager = {
    unlocked: false,
    active: false,  // Ctrl 是否按下
    hintShown: false,

    /** 检查并更新解锁状态 */
    checkUnlock() {
        const alreadyUnlocked = localStorage.getItem('road_of_destiny_skip_unlocked') === 'true';
        const eggCount = this._updateGlobalEggCount();

        if (alreadyUnlocked) {
            this.unlocked = true;
            return true;
        }

        // 刚达到3个彩蛋的瞬间
        if (eggCount >= 3) {
            this.unlocked = true;
            localStorage.setItem('road_of_destiny_skip_unlocked', 'true');
            this.showUnlockMessage();
        }

        return this.unlocked;
    },

    /** 从当前页面 flags 中提取彩蛋标记，累积到 localStorage 全局集合 */
    _updateGlobalEggCount() {
        const flagsStr = document.body.dataset.saveFlags || '{}';
        let flags = {};
        try { flags = JSON.parse(flagsStr); } catch(e) {}

        // 所有彩蛋标记名
        const easterEggFlagNames = [
            "喝大了", "告别羊群", "被羊吐槽", "看过星星", "被鄙视诗歌",
            "试图搭话", "逃跑失败", "忍辱离开", "略有怀疑", "给国王念诗",
            "后知后觉", "坦然赴死", "放弃诗歌", "雇小孩",
        ];

        // 读取已有的全局集合
        let globalSet = [];
        try {
            globalSet = JSON.parse(localStorage.getItem('road_of_destiny_eggs_set') || '[]');
        } catch(e) { globalSet = []; }

        // 将当前页面的彩蛋标记加入集合
        let added = false;
        easterEggFlagNames.forEach(name => {
            if (flags[name] && !globalSet.includes(name)) {
                globalSet.push(name);
                added = true;
            }
        });

        localStorage.setItem('road_of_destiny_eggs_set', JSON.stringify(globalSet));
        // 兼容旧存储
        localStorage.setItem('road_of_destiny_eggs', globalSet.length);

        return globalSet.length;
    },

    /** 显示跳过键解锁提示 */
    showUnlockMessage() {
        const body = document.querySelector('.terminal-body');
        if (!body) return;

        // 在叙事文本后面插入解锁消息
        const unlockDiv = document.createElement('div');
        unlockDiv.className = 'line accent skip-unlock';
        unlockDiv.style.cssText = 'color:#ff69b4 !important;animation: fadeIn 1s ease;margin-top:12px;';
        unlockDiv.innerHTML = '✦ ────────────────────────────────────────── ✦';
        body.appendChild(unlockDiv);

        const unlockDiv2 = document.createElement('div');
        unlockDiv2.className = 'line accent skip-unlock';
        unlockDiv2.style.cssText = 'color:#ffd700 !important;text-shadow:0 0 10px rgba(255,215,0,0.5);font-size:1em;';
        unlockDiv2.innerHTML = '  在回途中，你在露水浸湿的草地中捡到了 ——';
        body.appendChild(unlockDiv2);

        const unlockDiv3 = document.createElement('div');
        unlockDiv3.className = 'line bright skip-unlock';
        unlockDiv3.style.cssText = 'color:#00ff00 !important;font-size:1.1em;text-shadow:0 0 15px rgba(0,255,0,0.6);';
        unlockDiv3.innerHTML = '  ⚡ 跳 过 键 !! ⚡';
        body.appendChild(unlockDiv3);

        const unlockDiv4 = document.createElement('div');
        unlockDiv4.className = 'line dim skip-unlock';
        unlockDiv4.style.cssText = 'font-size:0.85em;';
        unlockDiv4.innerHTML = '  按住 [ CTRL ] 可以加速文本跳出。以后的路，走得更快了……';
        body.appendChild(unlockDiv4);

        const unlockDiv5 = document.createElement('div');
        unlockDiv5.className = 'line accent skip-unlock';
        unlockDiv5.style.cssText = 'color:#ff69b4 !important;';
        unlockDiv5.innerHTML = '✦ ────────────────────────────────────────── ✦';
        body.appendChild(unlockDiv5);

        body.scrollTop = body.scrollHeight;

        // 播放特殊音效
        AudioEngine.playSkipUnlock();

        this.hintShown = true;
    },

    /** 更新底部状态栏提示 */
    updateFooterHint() {
        const footer = document.querySelector('.terminal-footer');
        const terminal = document.querySelector('.terminal');

        // 终端边框效果
        if (terminal) {
            if (this.unlocked && this.active) {
                terminal.classList.add('skip-active');
            } else {
                terminal.classList.remove('skip-active');
            }
        }

        if (!footer) return;

        // 移除旧提示
        const old = footer.querySelector('.skip-hint');
        if (old) old.remove();

        if (this.unlocked) {
            const hint = document.createElement('span');
            hint.className = 'footer-item skip-hint';
            hint.style.color = this.active ? '#ffd700' : '#555';
            hint.style.textShadow = this.active ? '0 0 8px rgba(255,215,0,0.5)' : 'none';
            hint.style.transition = 'all 0.2s ease';
            hint.innerHTML = this.active
                ? '⚡ SKIP ACTIVE 6x'
                : '⏭ SKIP: [CTRL]';
            footer.appendChild(hint);
        }
    }
};

// ==================== 存档戒指管理器 ====================
const SavePointManager = {
    unlocked: false,
    hasPoint: false,       // 是否已存储点位
    savedSceneId: null,
    savedFlags: null,
    confirmingLoad: false, // 等待确认加载
    hintShown: false,

    /** 检查6彩蛋解锁 */
    checkUnlock() {
        const ringUnlocked = localStorage.getItem('road_of_destiny_ring') === 'true';

        if (ringUnlocked) {
            this.unlocked = true;
            const saved = localStorage.getItem('road_of_destiny_savepoint');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    this.savedSceneId = data.sceneId;
                    this.savedFlags = data.flags;
                    this.hasPoint = true;
                } catch(e) {}
            }
            return true;
        }

        // 使用全局累积彩蛋集合
        let globalSet = [];
        try {
            globalSet = JSON.parse(localStorage.getItem('road_of_destiny_eggs_set') || '[]');
        } catch(e) {}

        // 同时也从当前页面更新
        SkipKeyManager._updateGlobalEggCount();
        globalSet = JSON.parse(localStorage.getItem('road_of_destiny_eggs_set') || '[]');

        const eggCount = globalSet.length;

        if (eggCount >= 6) {
            this.unlocked = true;
            localStorage.setItem('road_of_destiny_ring', 'true');
            this.showRingUnlockMessage();
        }

        return this.unlocked;
    },

    /** 显示存档戒指解锁提示 — 故障循环文本 */
    showRingUnlockMessage() {
        const body = document.querySelector('.terminal-body');
        if (!body) return;

        const glitchTexts = [
            '你把手伸进口袋，',
            '"额，那是什么？"',
            '那是一枚雕刻着奇怪纹章的黑色戒指，有种冰凉的金属质感。它好像能转动。',
            '"啪嗒。"',
        ];

        const divider = document.createElement('div');
        divider.className = 'line accent ring-unlock';
        divider.style.cssText = 'color:#8888ff !important;margin-top:12px;';
        divider.innerHTML = '◆ ────────────────────────────────────────── ◆';
        body.appendChild(divider);

        // 故障循环 — 重复4次
        for (let loop = 0; loop < 4; loop++) {
            glitchTexts.forEach((text, i) => {
                const div = document.createElement('div');
                div.className = 'line ring-unlock';
                if (loop === 3) {
                    // 最后一次渐弱
                    div.style.opacity = (1 - i * 0.2);
                }
                if (i === 0) div.style.color = '#aaaacc';
                else if (i === 1) div.style.color = '#ccccff';
                else if (i === 2) div.style.color = '#8888ff';
                else div.style.color = '#6666cc';
                div.style.fontSize = (1 - loop * 0.05) + 'em';
                div.innerHTML = '  ' + text;
                body.appendChild(div);
            });
        }

        // 解锁说明
        const infoDiv = document.createElement('div');
        infoDiv.className = 'line accent ring-unlock';
        infoDiv.style.cssText = 'color:#ffd700 !important;text-shadow:0 0 10px rgba(255,215,0,0.5);margin-top:8px;';
        infoDiv.innerHTML = '  💍 存 档 戒 指 已 绑 定';
        body.appendChild(infoDiv);

        const infoDiv2 = document.createElement('div');
        infoDiv2.className = 'line dim ring-unlock';
        infoDiv2.style.cssText = 'font-size:0.85em;';
        infoDiv2.innerHTML = '  按下 [ H ] 存储当前位置。再次按下 [ H ] 并确认后，时间将回溯到存储的点位。';
        body.appendChild(infoDiv2);

        const divider2 = document.createElement('div');
        divider2.className = 'line accent ring-unlock';
        divider2.style.cssText = 'color:#8888ff !important;';
        divider2.innerHTML = '◆ ────────────────────────────────────────── ◆';
        body.appendChild(divider2);

        body.scrollTop = body.scrollHeight;

        // 播放戒指音效
        AudioEngine.playRingUnlock();

        this.hintShown = true;
    },

    /** 存储存档点（覆盖） */
    saveCheckpoint() {
        const sceneId = document.body.dataset.sceneId;
        const flags = document.body.dataset.saveFlags || '{}';
        const wasOverwrite = this.hasPoint;
        this.savedSceneId = sceneId;
        this.savedFlags = flags;
        this.hasPoint = true;
        this.confirmingLoad = false;

        localStorage.setItem('road_of_destiny_savepoint', JSON.stringify({
            sceneId: sceneId,
            flags: flags,
        }));

        AudioEngine.playSelect();
        this.updateFooterHint();

        // 覆盖时闪一下提示
        if (wasOverwrite && document.querySelector('.terminal-body')) {
            const hint = document.createElement('div');
            hint.className = 'line accent';
            hint.style.cssText = 'color:#8888ff;text-align:center;font-size:0.8em;';
            hint.innerHTML = '[💍 存档已覆盖]';
            document.querySelector('.terminal-body').appendChild(hint);
            document.querySelector('.terminal-body').scrollTop = document.querySelector('.terminal-body').scrollHeight;
            setTimeout(() => hint.remove(), 1500);
        }
    },

    /** 加载存档点 — 需要确认 */
    requestLoad() {
        if (!this.hasPoint) return;
        if (!this.confirmingLoad) {
            this.confirmingLoad = true;
            AudioEngine.playSceneChange();
            this.updateFooterHint();
            setTimeout(() => {
                if (this.confirmingLoad) {
                    this.confirmingLoad = false;
                    this.updateFooterHint();
                }
            }, 4000);
        } else {
            this.confirmingLoad = false;
            AudioEngine.playRingUnlock();
            const saveId = document.getElementById('save-id');
            if (saveId && this.savedSceneId) {
                const sid = saveId.value;
                const flagsParam = encodeURIComponent(this.savedFlags || '{}');
                window.location.href = `/game/restore_point/${sid}?scene=${this.savedSceneId}&flags=${flagsParam}`;
            }
        }
    },

    /** 更新底部状态栏 */
    updateFooterHint() {
        const footer = document.querySelector('.terminal-footer');
        if (!footer) return;

        const old = footer.querySelector('.ring-hint');
        if (old) old.remove();

        if (!this.unlocked) return;

        const hint = document.createElement('span');
        hint.className = 'footer-item ring-hint';
        hint.style.transition = 'all 0.2s ease';

        if (this.confirmingLoad) {
            hint.style.color = '#ff4444';
            hint.style.textShadow = '0 0 8px rgba(255,68,68,0.5)';
            hint.style.animation = 'blink 0.5s step-end infinite';
            hint.innerHTML = '⚠ 确认回溯? [L]';
        } else if (this.hasPoint) {
            hint.style.color = '#8888ff';
            hint.style.textShadow = '0 0 6px rgba(136,136,255,0.3)';
            hint.innerHTML = '💍 SAVED · [H]存 [L]读';
        } else {
            hint.style.color = '#555';
            hint.innerHTML = '💍 [H]存 [L]读';
        }

        const skipHint = footer.querySelector('.skip-hint');
        if (skipHint) {
            skipHint.after(hint);
        } else {
            footer.appendChild(hint);
        }
    }
};

// ==================== 打字机引擎 ====================
const Typewriter = {
    speed: 28,      // 基础速度 ms/字
    speedVariation: 12,  // 随机变化范围
    fastChars: [' ', '\n', '\t'],
    pauseChars: ['.', '!', '?', '。', '！', '？', '…'],
    pauseDuration: 250,
    turboMultiplier: 0.15,  // 加速时速度倍率（越小越快）

    /**
     * 对DOM元素内的文本执行打字机效果
     * @param {HTMLElement} container - 包含文本行的容器
     * @param {Function} onChar - 每个字符打出时的回调
     * @param {Function} onComplete - 全部完成时的回调
     * @param {Function} getSpeedMul - 获取当前速度倍率的回调
     */
    async type(container, onChar, onComplete, getSpeedMul) {
        // 获取所有需要显示的行（排除跳过键解锁消息，那些直接显示）
        const allLines = Array.from(container.querySelectorAll('.line:not(.skip-unlock)'));
        if (allLines.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        // 初始隐藏所有行
        allLines.forEach(line => {
            line.dataset.fullText = line.textContent;
            line.textContent = '';
            line.style.visibility = 'visible';
        });

        let charCount = 0;
        const totalChars = allLines.reduce((sum, l) => sum + l.dataset.fullText.length, 0);

        for (const line of allLines) {
            const text = line.dataset.fullText;
            for (let i = 0; i < text.length; i++) {
                line.textContent = text.substring(0, i + 1);
                charCount++;

                // 滚动跟随
                container.scrollTop = container.scrollHeight;

                // 回调
                if (onChar) onChar(charCount, totalChars);

                // 计算延迟
                let delay = this.speed + (Math.random() - 0.5) * this.speedVariation;

                // 停顿字符增加延迟
                if (this.pauseChars.includes(text[i])) {
                    delay += this.pauseDuration;
                }
                // 空格和换行快速通过
                if (text[i] === ' ') {
                    delay = Math.max(5, delay * 0.4);
                }

                // 跳过键加速
                if (getSpeedMul) {
                    const mul = getSpeedMul();
                    if (mul < 1.0) {
                        delay *= mul;
                    }
                }

                await this.sleep(delay);
            }
        }

        if (onComplete) onComplete();
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ==================== 死亡晶体 — 结局查看器 ====================
const EndingTracker = {
    unlocked: false,
    overlayVisible: false,

    /** 所有结局定义 */
    endings: {
        'L9_death':           { name: '左路之殇',         type: '悲剧', icon: '💀', comment: '侯爵的枪法比你的诗押韵。' },
        'L7_leave_peacefully':{ name: '另一种胜利',       type: '隐藏', icon: '🕊️', comment: '哈哈，所以你干了什么。' },
        'L8_shoot_candle':    { name: '蜡烛英雄',         type: '彩蛋', icon: '🎯', comment: '牧羊人枪法：瞄准A，命中B，吓跑C。' },
        'R9_death':           { name: '右路之殇',         type: '悲剧', icon: '💀', comment: '世界上最可悲的保王党。' },
        'M8_ending':          { name: '中路之殇',         type: '悲剧', icon: '💀', comment: '你的诗稿和羊群达成了共识：都不需要你。' },
        'M3_happy_ending':    { name: '平凡的幸福',       type: '隐藏', icon: '🏡', comment: '头顶伊冯娜的擀面杖，你只能说这是幸福。' },
        'scene_too_drunk':    { name: '循环命运',         type: '彩蛋', icon: '🍺', comment: '该死，第九季了还没吃上四川肉酱吗。' },
        'ctrl_c_death':       { name: '你掉出来了这个世界', type: '彩蛋', icon: '⌨️', comment: '该死的，我上次吃的是红药丸还是蓝药丸来着？' },
    },

    /** 检查9彩蛋解锁 */
    checkUnlock() {
        const alreadyUnlocked = localStorage.getItem('road_of_destiny_crystal') === 'true';
        if (alreadyUnlocked) {
            this.unlocked = true;
            return true;
        }
        let globalSet = [];
        try { globalSet = JSON.parse(localStorage.getItem('road_of_destiny_eggs_set') || '[]'); } catch(e) {}
        if (globalSet.length >= 9) {
            this.unlocked = true;
            localStorage.setItem('road_of_destiny_crystal', 'true');
            this.showCrystalUnlockMessage();
        }
        return this.unlocked;
    },

    /** 解锁叙事 */
    showCrystalUnlockMessage() {
        const body = document.querySelector('.terminal-body');
        if (!body) return;

        const addLine = (text, style) => {
            const d = document.createElement('div');
            d.className = 'line crystal-unlock';
            d.style.cssText = style;
            d.innerHTML = text;
            body.appendChild(d);
        };

        addLine('◈ ────────────────────────────────────────── ◈', 'color:#00ff88;margin-top:12px;');
        addLine('  忽然，你被一个可怕的<span style="color:#00ff00;">绿色旋涡</span>吞没了。', 'color:#88ff88;');
        addLine('  眼前出现的是——一对在争吵的蓝发刺猬头<span style="color:#aaddff;">白色大衣老头</span>', 'color:#88ccff;');
        addLine('  和<span style="color:#ffdd44;">圆头黄衣小孩</span>。', 'color:#ffdd44;');
        addLine('  你呆呆地望着他们，直到麻杆瘦老头扔出的一块', 'color:#aaddff;');
        addLine('  <span style="color:#00ffff;text-shadow:0 0 10px rgba(0,255,255,0.6);">蓝色晶体</span>砸晕了你。', 'color:#00ffff;');
        addLine('  你醒了。幸运的是——或者不幸的是——你回来了。', 'color:#cccccc;');
        addLine('  ', '');
        addLine('  💎 死 亡 晶 体 已 获 取', 'color:#00ffff;text-shadow:0 0 15px rgba(0,255,255,0.6);font-size:1.1em;');
        addLine('  按 [ G ] 查看你已解锁的所有结局。', 'color:#888;font-size:0.85em;');
        addLine('◈ ────────────────────────────────────────── ◈', 'color:#00ff88;');

        body.scrollTop = body.scrollHeight;
        AudioEngine.playRingUnlock();
    },

    /** 记录结局 */
    recordEnding() {
        const sceneId = document.body.dataset.sceneId;
        if (!sceneId) return;
        if (!this.endings[sceneId]) return;

        let seen = [];
        try { seen = JSON.parse(localStorage.getItem('road_of_destiny_endings_seen') || '[]'); } catch(e) {}
        if (!seen.includes(sceneId)) {
            seen.push(sceneId);
            localStorage.setItem('road_of_destiny_endings_seen', JSON.stringify(seen));

            // 刚全解锁时插入提示
            if (seen.length === Object.keys(this.endings).length) {
                this._showRickHint();
            }
        }
        return seen;
    },

    /** 全结局解锁时插入 RICK 密令暗示 */
    _showRickHint() {
        const body = document.querySelector('.terminal-body');
        if (!body) return;
        setTimeout(() => {
            const d = document.createElement('div');
            d.className = 'line accent';
            d.style.cssText = 'color:#aaddff;text-shadow:0 0 8px rgba(170,221,255,0.4);animation:crystalAppear 0.6s ease;margin-top:10px;';
            d.innerHTML = '  你忽然有一种打出某个老头的名字的欲望。';
            body.appendChild(d);
            body.scrollTop = body.scrollHeight;
            AudioEngine.playSceneChange();
        }, 1000);
    },

    /** 切换覆盖层 */
    toggle() {
        if (this.overlayVisible) {
            this.hide();
        } else {
            this.show();
        }
    },

    /** 显示结局界面 */
    show() {
        if (document.getElementById('crystal-overlay')) return;
        const terminal = document.querySelector('.terminal');
        if (!terminal) return;

        const seenList = [];
        try { seenList.push(...JSON.parse(localStorage.getItem('road_of_destiny_endings_seen') || '[]')); } catch(e) {}
        const allIds = Object.keys(this.endings);
        const seenIds = seenList.filter(id => this.endings[id]);
        const unseenCount = allIds.length - seenIds.length;
        const allUnlocked = unseenCount === 0;

        let html = '<div class="crystal-title">💎 死 亡 晶 体 · 结局观测</div>';
        html += '<div class="crystal-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>';

        // 已解锁结局
        if (seenIds.length > 0) {
            html += '<div class="crystal-section">◆ 已观测结局</div>';
            seenIds.forEach(id => {
                const e = this.endings[id];
                html += `<div class="crystal-ending seen">
                    <span class="crystal-icon">${e.icon}</span>
                    <span class="crystal-type">[${e.type}]</span>
                    <span class="crystal-name">${e.name}</span>
                    <span class="crystal-comment">// ${e.comment}</span>
                </div>`;
            });
        }

        // 未解锁结局
        if (unseenCount > 0) {
            html += '<div class="crystal-section" style="margin-top:16px;">◇ 未观测结局 <span class="crystal-count">×' + unseenCount + '</span></div>';
            allIds.forEach(id => {
                if (!seenIds.includes(id)) {
                    html += `<div class="crystal-ending locked">
                        <span class="crystal-icon">❓</span>
                        <span class="crystal-name">???</span>
                        <span class="crystal-comment">// 尚未抵达此命运分支</span>
                    </div>`;
                }
                html += '';
            });
        }

        // 全解锁吐槽
        if (allUnlocked) {
            html += '<div class="crystal-divider" style="margin-top:16px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>';
            html += '<div class="crystal-meta">';
            html += '  <span style="color:#aaddff;">Listen, Morty,</span> the multiverse? <br>';
            html += '  It\'s a <span style="color:#ffdd44;">toilet</span>. You hop through a portal, <br>';
            html += '  and the "you" on the other side is just you <br>';
            html += '  with a stupider haircut, or — <span style="color:#88ff88;">*burp*</span> — <br>';
            html += '  or that dimension already collapsed \'cause <br>';
            html += '  its Rick couldn\'t hold his portal fluid. <br>';
            html += '  <br>';
            html += '  Infinite parallel worlds, infinite versions of me, <br>';
            html += '  and every single one is stuck with a Morty <br>';
            html += '  just as annoying as you. The universe doesn\'t <br>';
            html += '  give a crap, Morty. Nobody exists on purpose, <br>';
            html += '  nobody belongs anywhere, everybody\'s gonna die. <br>';
            html += '  <br>';
            html += '  <span style="color:#ff4444;font-size:1.1em;">Wubba lubba dub dub!</span><br>';
            html += '</div>';
        }

        html += '<div class="crystal-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>';
        html += '<div class="crystal-footer">按 [ G ] 关闭 · 按 [ ESC ] 关闭</div>';

        const overlay = document.createElement('div');
        overlay.id = 'crystal-overlay';
        overlay.className = 'crystal-overlay';
        overlay.innerHTML = html;
        terminal.appendChild(overlay);

        this.overlayVisible = true;
        AudioEngine.playSceneChange();
    },

    /** 隐藏 */
    hide() {
        const overlay = document.getElementById('crystal-overlay');
        if (overlay) overlay.remove();
        this.overlayVisible = false;
        AudioEngine.playSelect();
    },

    /** 更新底部状态栏 */
    updateFooterHint() {
        const footer = document.querySelector('.terminal-footer');
        if (!footer) return;
        const old = footer.querySelector('.crystal-hint');
        if (old) old.remove();
        if (!this.unlocked) return;

        const hint = document.createElement('span');
        hint.className = 'footer-item crystal-hint';
        hint.style.color = '#00ffff';
        hint.style.textShadow = '0 0 6px rgba(0,255,255,0.3)';
        hint.innerHTML = '💎 [G] 结局观测';
        footer.appendChild(hint);
    }
};
const TerminalGame = {
    saveId: null,
    currentChoices: [],
    hoveredIndex: -1,
    typingComplete: false,
    totalTypedChars: 0,
    ctrlHeld: false,
    rickSequence: [],  // R-I-C-K 序列追踪

    init() {
        // 从页面获取 save_id
        const saveEl = document.getElementById('save-id');
        this.saveId = saveEl ? saveEl.value : null;

        // 音频初始化 — 多种触发方式确保不会无声
        AudioEngine.init();
        const tryResumeAudio = () => {
            if (AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') {
                AudioEngine.ctx.resume();
            }
            AudioEngine.init();
            AudioEngine.startMusic();
        };
        // 点击、按键、触摸都能触发
        document.addEventListener('click', tryResumeAudio, { once: true });
        document.addEventListener('keydown', tryResumeAudio, { once: true });
        document.addEventListener('touchstart', tryResumeAudio, { once: true });
        // 也尝试立即启动（某些浏览器允许）
        tryResumeAudio();

        // 键盘导航 + Ctrl 跳过键
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // 检查跳过键解锁
        SkipKeyManager.checkUnlock();
        SkipKeyManager.updateFooterHint();

        // 检查存档戒指解锁
        SavePointManager.checkUnlock();
        SavePointManager.updateFooterHint();

        // 检查死亡晶体解锁
        EndingTracker.checkUnlock();
        EndingTracker.updateFooterHint();

        // 如果当前是结局场景，记录它
        const sceneId2 = document.body.dataset.sceneId;
        if (sceneId2 && EndingTracker.endings[sceneId2]) {
            EndingTracker.recordEnding();
        }

        // 应用初始主题
        const sceneId = document.body.dataset.sceneId;
        if (sceneId) {
            ThemeManager.apply(ThemeManager.getSceneTheme(sceneId));
        }

        // 播放场景特定音效
        const sceneSound = document.body.dataset.sceneSound;
        if (sceneSound) {
            setTimeout(() => AudioEngine.playSceneSound(sceneSound), 400);
        }

        // 开始打字
        const body = document.querySelector('.terminal-body');
        if (body) {
            this.startTyping(body);
        }

        // 绑定选项事件
        this.bindChoices();
    },

    startTyping(container) {
        let lastClick = 0;
        Typewriter.type(container,
            (charCount, total) => {
                this.totalTypedChars = charCount;
                const now = Date.now();
                // 加速模式下减少音效密度
                const clickInterval = this.ctrlHeld ? 150 : 60;
                const charStep = this.ctrlHeld ? 10 : 3;
                if (now - lastClick > clickInterval && charCount % charStep === 0) {
                    AudioEngine.playTypeClick();
                    lastClick = now;
                }
            },
            () => {
                this.typingComplete = true;
                this.showChoices();
            },
            () => {
                // 速度倍率回调
                if (this.ctrlHeld && SkipKeyManager.unlocked) {
                    return Typewriter.turboMultiplier;
                }
                return 1.0;
            }
        );
    },

    showChoices() {
        const choicesContainer = document.getElementById('choices-container');
        if (!choicesContainer) return;

        choicesContainer.style.display = 'block';
        choicesContainer.classList.add('fade-in');

        this.bindChoices();
        AudioEngine.playSceneChange();

        // 隐藏打字光标
        const cursor = document.getElementById('typing-cursor');
        if (cursor) cursor.style.display = 'none';
    },

    bindChoices() {
        const items = document.querySelectorAll('.choice-item');
        this.currentChoices = Array.from(items);
        items.forEach((item, i) => {
            item.addEventListener('click', () => this.selectChoice(i));
            item.addEventListener('mouseenter', () => this.hoverChoice(i));
            item.addEventListener('mouseleave', () => {
                item.classList.remove('hovered');
                this.hoveredIndex = -1;
            });
        });
    },

    hoverChoice(index) {
        this.currentChoices.forEach((item, i) => {
            item.classList.toggle('hovered', i === index);
        });
        this.hoveredIndex = index;
    },

    selectChoice(index) {
        if (index < 0 || index >= this.currentChoices.length) return;

        const item = this.currentChoices[index];
        const isEaster = item.classList.contains('choice-easter');

        if (isEaster) {
            AudioEngine.playEasterEgg();
        } else {
            AudioEngine.playSelect();
        }

        const form = item.closest('.choice-form');
        if (form) {
            const sceneId = document.body.dataset.sceneId;
            if (sceneId && (sceneId.includes('death') || sceneId.includes('L8_') ||
                sceneId.includes('R8_') || sceneId.includes('M7_'))) {
                this.triggerScreenShake();
            }
            form.submit();
        }
    },

    handleKeyDown(e) {
        // Ctrl+C — 强制终止彩蛋
        if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
            e.preventDefault();
            this.triggerCtrlCDeath();
            return;
        }

        // Ctrl 键 — 跳过键加速打字
        if (e.key === 'Control' && !e.repeat) {
            this.ctrlHeld = true;
            if (SkipKeyManager.unlocked) {
                SkipKeyManager.active = true;
                SkipKeyManager.updateFooterHint();
            }
            return;
        }

        // 如果正在打字，跳过其他按键
        if (!this.typingComplete) return;

        // 数字键 1-9 选择
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
            e.preventDefault();
            const index = num - 1;
            if (index < this.currentChoices.length) {
                this.selectChoice(index);
            }
        }

        // 方向键上下导航
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const dir = e.key === 'ArrowUp' ? -1 : 1;
            let newIndex = this.hoveredIndex + dir;
            if (newIndex < 0) newIndex = this.currentChoices.length - 1;
            if (newIndex >= this.currentChoices.length) newIndex = 0;
            this.hoverChoice(newIndex);
        }

        // Enter 确认选择
        if (e.key === 'Enter' && this.hoveredIndex >= 0) {
            e.preventDefault();
            this.selectChoice(this.hoveredIndex);
        }

        // H 键 — 存档戒指：存储点位
        if (e.key === 'h' || e.key === 'H') {
            e.preventDefault();
            if (!SavePointManager.unlocked) return;
            SavePointManager.saveCheckpoint();
        }

        // L 键 — 存档戒指：载入点位
        if (e.key === 'l' || e.key === 'L') {
            e.preventDefault();
            if (!SavePointManager.unlocked) return;
            SavePointManager.requestLoad();
        }

        // R-I-C-K 密令序列追踪
        this.trackRickSequence(e);

        // X 键 — 调试：彩蛋+1
        if (e.key === 'x' || e.key === 'X') {
            e.preventDefault();
            this.debugAddEgg();
        }

        // A 键 — 调试：解锁全结局
        if (e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            this.debugUnlockAllEndings();
        }

        // G 键 — 死亡晶体
        if (e.key === 'g' || e.key === 'G') {
            e.preventDefault();
            if (!EndingTracker.unlocked) return;
            EndingTracker.toggle();
        }

        // ESC — 关闭晶体界面
        if (e.key === 'Escape' && EndingTracker.overlayVisible) {
            e.preventDefault();
            EndingTracker.hide();
        }
    },

    /** 调试：手动增加一个彩蛋 */
    debugAddEgg() {
        let globalSet = [];
        try {
            globalSet = JSON.parse(localStorage.getItem('road_of_destiny_eggs_set') || '[]');
        } catch(e) {}

        const fakeName = 'debug_' + globalSet.length;
        if (!globalSet.includes(fakeName)) {
            globalSet.push(fakeName);
        }
        localStorage.setItem('road_of_destiny_eggs_set', JSON.stringify(globalSet));
        localStorage.setItem('road_of_destiny_eggs', globalSet.length);

        this._refreshArtifacts();

        AudioEngine.playEasterEgg();

        const body = document.querySelector('.terminal-body');
        if (body) {
            const hint = document.createElement('div');
            hint.className = 'line accent';
            hint.style.cssText = 'color:#ffd700;text-align:center;animation:fadeIn 0.3s ease;';
            hint.innerHTML = '[DEBUG] 彩蛋 +1 · 当前总计: ' + globalSet.length;
            body.appendChild(hint);
            body.scrollTop = body.scrollHeight;
            setTimeout(() => hint.remove(), 2000);
        }
    },

    /** 调试：解锁全结局 */
    debugUnlockAllEndings() {
        const allEndingIds = Object.keys(EndingTracker.endings);
        localStorage.setItem('road_of_destiny_endings_seen', JSON.stringify(allEndingIds));
        AudioEngine.playEasterEgg();

        const body = document.querySelector('.terminal-body');
        if (body) {
            const hint = document.createElement('div');
            hint.className = 'line accent';
            hint.style.cssText = 'color:#00ffff;text-align:center;animation:fadeIn 0.3s ease;';
            hint.innerHTML = '[DEBUG] 全结局已解锁 (' + allEndingIds.length + '/' + allEndingIds.length + ') · 按 G 查看';
            body.appendChild(hint);
            body.scrollTop = body.scrollHeight;
            setTimeout(() => hint.remove(), 2500);
        }
    },

    /** Ctrl-C 彩蛋：强制终止 */
    triggerCtrlCDeath() {
        const body = document.querySelector('.terminal-body');
        if (!body) return;
        const terminal = document.querySelector('.terminal');
        if (terminal) {
            terminal.classList.add('theme-death');
            terminal.style.animation = 'screenShake 0.8s ease-out';
        }

        AudioEngine.playDeath();

        // 清屏效果
        body.querySelectorAll('.line').forEach(l => l.style.opacity = '0.2');
        body.querySelectorAll('.choice-item, .choices-container, .ascii-title, .scene-divider').forEach(l => l.style.display = 'none');
        document.getElementById('typing-cursor') && (document.getElementById('typing-cursor').style.display = 'none');

        const lines = [
            { t: '^C', s: 'color:#ff4444;font-size:2em;text-align:center;text-shadow:0 0 30px rgba(255,0,0,0.8);margin:20px 0;' },
            { t: '', s: '' },
            { t: 'SIGINT received. Process terminated.', s: 'color:#ff6666;text-align:center;' },
            { t: '', s: '' },
            { t: '  你死了。', s: 'color:#ff8888;font-size:1.2em;' },
            { t: '  不知道是哪个天杀的按了 Ctrl-C，', s: 'color:#ff6666;' },
            { t: '  总之你死了。', s: 'color:#ff8888;' },
            { t: '', s: '' },
            { t: '💀 彩蛋结局：Ctrl-C 处决', s: 'color:#ff4444;font-size:1.1em;text-shadow:0 0 10px rgba(255,0,0,0.5);' },
            { t: '( 该死的，我上次吃的是红药丸还是蓝药丸来着？ )', s: 'color:#888;font-size:0.85em;' },
        ];

        lines.forEach((l, i) => {
            setTimeout(() => {
                const d = document.createElement('div');
                d.className = 'line';
                d.style.cssText = l.s;
                d.innerHTML = l.t;
                d.style.animation = 'fadeIn 0.3s ease';
                body.appendChild(d);
                body.scrollTop = body.scrollHeight;
            }, i * 200);
        });

        setTimeout(() => {
            const back = document.createElement('div');
            back.style.cssText = 'margin-top:20px;text-align:center;';
            back.innerHTML = '<a href="/" style="color:#ff4444;text-decoration:none;border:1px solid #ff4444;padding:8px 20px;font-family:inherit;">[ 重新启动 ]</a>';
            body.appendChild(back);
            body.scrollTop = body.scrollHeight;
        }, lines.length * 200 + 500);

        // 记录结局
        document.body.dataset.sceneId = 'ctrl_c_death';
        EndingTracker.recordEnding();
    },

    /** 刷新所有道具状态 */
    _refreshArtifacts() {
        SkipKeyManager.checkUnlock();
        SkipKeyManager.updateFooterHint();
        SavePointManager.checkUnlock();
        SavePointManager.updateFooterHint();
        EndingTracker.checkUnlock();
        EndingTracker.updateFooterHint();
    },

    handleKeyUp(e) {
        if (e.key === 'Control') {
            this.ctrlHeld = false;
            if (SkipKeyManager.unlocked) {
                SkipKeyManager.active = false;
                SkipKeyManager.updateFooterHint();
            }
        }
    },

    triggerScreenShake() {
        const terminal = document.querySelector('.terminal');
        if (!terminal) return;

        terminal.style.animation = 'screenShake 0.5s ease-out';
        AudioEngine.playDeath();

        setTimeout(() => {
            terminal.style.animation = '';
        }, 500);
    },

    /** R-I-C-K 密令追踪 */
    trackRickSequence(e) {
        if (!this.typingComplete) return;
        const seq = ['r','i','c','k'];
        const key = e.key.toLowerCase();
        if (key === seq[this.rickSequence.length]) {
            this.rickSequence.push(key);
            if (this.rickSequence.length === 4) {
                this.rickSequence = [];
                RickPortal.activate();
            }
        } else {
            this.rickSequence = [];
        }
    },
};

// ==================== Rick 传送门彩蛋 ====================
const RickPortal = {
    active: false,

    activate() {
        if (this.active) return;
        this.active = true;

        const body = document.querySelector('.terminal-body');
        if (!body) return;

        AudioEngine.playRingUnlock();
        setTimeout(() => AudioEngine.playSkipUnlock(), 400);

        // 绿色旋涡动画
        const swirl = document.createElement('div');
        swirl.className = 'line';
        swirl.style.cssText = 'text-align:center;font-size:1.5em;color:#00ff00;text-shadow:0 0 20px #00ff00;animation:pulse 1s infinite;';
        swirl.innerHTML = '🌀 🌀 🌀';
        body.appendChild(swirl);

        const line1 = document.createElement('div');
        line1.className = 'line accent';
        line1.style.cssText = 'color:#00ff88;animation:crystalAppear 0.5s ease;';
        line1.innerHTML = '  一个绿色传送门在你面前撕裂了空间。';
        body.appendChild(line1);

        const line2 = document.createElement('div');
        line2.className = 'line';
        line2.style.cssText = 'color:#aaddff;';
        line2.innerHTML = '  蓝发老头从传送门里探出头来：';
        body.appendChild(line2);

        const line3 = document.createElement('div');
        line3.className = 'line bright';
        line3.style.cssText = 'color:#88ff88;padding-left:2em;';
        line3.innerHTML = '  "Oh jeez, wrong dimension. Hey kid, you seen a';
        body.appendChild(line3);

        const line4 = document.createElement('div');
        line4.className = 'line bright';
        line4.style.cssText = 'color:#88ff88;padding-left:2em;';
        line4.innerHTML = '   green crystal around here? No? Whatever —';
        body.appendChild(line4);

        const line5 = document.createElement('div');
        line5.className = 'line bright';
        line5.style.cssText = 'color:#88ff88;padding-left:2em;';
        line5.innerHTML = '   you want a ride? I\'ve got a spare portal gun."';
        body.appendChild(line5);

        body.scrollTop = body.scrollHeight;

        // 选择（DOM 按钮，替代表单以避免页面刷新）
        setTimeout(() => {
            const choicesDiv = document.createElement('div');
            choicesDiv.style.cssText = 'margin-top:16px;padding-top:8px;border-top:1px solid #1a4a1a;';
            choicesDiv.innerHTML = '<div class="choice-prompt"><span class="prompt-symbol">❯</span> 接受传送门的邀请？</div>';

            const opts = [
                { text: '[1] 跳进传送门 —— 管他呢，多元宇宙等着我！', action: 'go' },
                { text: '[2] 婉拒 —— "谢了，但我这边还有个命运要处理。"', action: 'stay' },
            ];

            opts.forEach((opt, i) => {
                const btn = document.createElement('div');
                btn.className = 'choice-item' + (i === 0 ? ' choice-easter' : '');
                btn.innerHTML = `<span class="choice-number">[${i+1}]</span><span class="choice-text">${opt.text}</span>`;
                btn.addEventListener('click', () => {
                    choicesDiv.remove();
                    swirl.remove();
                    if (opt.action === 'go') {
                        RickPortal.goPortal(body);
                    } else {
                        RickPortal.stay(body);
                    }
                });
                choicesDiv.appendChild(btn);
            });

            body.appendChild(choicesDiv);
            body.scrollTop = body.scrollHeight;
        }, 1500);
    },

    goPortal(body) {
        const lines = [
            { text: '  你跳进了传送门。', style: 'color:#00ff88;' },
            { text: '  ', style: '' },
            { text: '  天旋地转。绿色和紫色的光在你周围闪烁。', style: 'color:#aaddff;' },
            { text: '  你看到了无数个自己——有的在写诗，有的在放羊，', style: 'color:#cccccc;' },
            { text: '  有的正在被侯爵追杀，有的在巴黎喝咖啡，', style: 'color:#cccccc;' },
            { text: '  还有一个在跟一只会说话的羊讨论存在主义。', style: 'color:#ffdd44;' },
            { text: '  ', style: '' },
            { text: '  最后你落在一个奇怪的地方——', style: 'color:#ff8888;' },
            { text: '  一个巨大的车库，里面全是各种版本的你自己。', style: 'color:#ff8888;' },
            { text: '  一个戴着机械臂的"牧羊人大卫"对你点了点头。', style: 'color:#aaddff;' },
            { text: '  "欢迎加入牧羊人议会，C-137。你的编号是 D-8000。"', style: 'color:#88ff88;' },
            { text: '  ', style: '' },
            { text: '💀 彩蛋结局：牧羊人议会', style: 'color:#ff69b4;font-size:1.1em;text-shadow:0 0 10px rgba(255,105,180,0.5);' },
            { text: '( 在无限多元宇宙中，总有一个版本的你做出了正确的选择。', style: 'color:#888;font-size:0.85em;' },
            { text: '  问题是——你永远不知道自己是不是那个版本。 )', style: 'color:#888;font-size:0.85em;' },
        ];

        lines.forEach(l => {
            const d = document.createElement('div');
            d.className = 'line';
            d.style.cssText = l.style;
            d.innerHTML = l.text;
            body.appendChild(d);
        });

        const backBtn = document.createElement('div');
        backBtn.style.cssText = 'margin-top:14px;text-align:center;';
        backBtn.innerHTML = '<a href="/" style="color:#00ff88;text-decoration:none;border:1px solid #00ff88;padding:8px 20px;font-family:inherit;">[ 返回首页 ]</a>';
        body.appendChild(backBtn);
        body.scrollTop = body.scrollHeight;

        // 记录为结局
        EndingTracker.recordEnding();
        AudioEngine.playDeath();
    },

    stay(body) {
        const lines = [
            { text: '  你摆了摆手。"谢了，但我这边还有个命运要处理。"', style: 'color:#cccccc;' },
            { text: '  ', style: '' },
            { text: '  "Suit yourself." 老头耸耸肩，传送门啪地一声关闭了。', style: 'color:#aaddff;' },
            { text: '  但你注意到地上多了一样东西——', style: 'color:#ffdd44;' },
            { text: '  一瓶绿色的液体，标签上写着"PORTAL FLUID — DRINK ME?"', style: 'color:#00ff00;' },
            { text: '  ', style: '' },
            { text: '  你把它塞进口袋。也许以后用得着。', style: 'color:#888;' },
            { text: '🥒 获得道具：传送液（未激活）', style: 'color:#00ff88;text-shadow:0 0 8px rgba(0,255,136,0.3);' },
            { text: '( 按 R-I-C-K 可以再次召唤传送门 )', style: 'color:#555;font-size:0.8em;' },
        ];

        lines.forEach(l => {
            const d = document.createElement('div');
            d.className = 'line';
            d.style.cssText = l.style;
            d.innerHTML = l.text;
            body.appendChild(d);
        });
        body.scrollTop = body.scrollHeight;
        AudioEngine.playSelect();

        // 可以再次触发
        setTimeout(() => { this.active = false; }, 500);
    },
};

// ==================== 启动 ====================
document.addEventListener('DOMContentLoaded', () => {
    TerminalGame.init();
});
