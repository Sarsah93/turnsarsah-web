// utils/AudioManager.ts

export class AudioManager {
    private static bgmVolume: number = (() => {
        const saved = localStorage.getItem('bgmVolume');
        return saved !== null ? Number(saved) : 0.5;
    })();
    private static sfxVolume: number = (() => {
        const saved = localStorage.getItem('sfxVolume');
        return saved !== null ? Number(saved) : 0.5;
    })();
    private static bgmAudio: HTMLAudioElement | null = null;

    public static setBGMVolume(volume: number) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('bgmVolume', this.bgmVolume.toString());
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.bgmVolume;
        }
    }

    public static setSFXVolume(volume: number) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('sfxVolume', this.sfxVolume.toString());
    }

    public static getBGMVolume(): number {
        return this.bgmVolume;
    }

    public static getSFXVolume(): number {
        return this.sfxVolume;
    }

    public static playBGM(src: string) {
        if (this.bgmAudio) {
            // v2.3.8: Decode URI to prevent restarts on paths with spaces (e.g., "/audio sounds/")
            const currentSrc = decodeURI(this.bgmAudio.src);
            const targetSrc = decodeURI(src);

            if (currentSrc.includes(targetSrc)) {
                if (this.bgmAudio.paused) {
                    this.bgmAudio.play().catch(e => console.warn("BGM Playback (Resume) failed:", e));
                }
                return;
            }
            this.bgmAudio.pause();
        }

        this.bgmAudio = new Audio(src);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.bgmVolume;
        this.bgmAudio.play().catch(e => console.warn("BGM Playback (New) failed:", e));
    }

    public static playSFX(src: string) {
        const audio = new Audio(src);
        audio.volume = this.sfxVolume;
        audio.play().catch(e => console.warn("SFX Playback failed:", e));
    }

    public static stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
        }
    }
}
