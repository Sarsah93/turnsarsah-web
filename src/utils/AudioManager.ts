export class AudioManager {
    private static bgmAudio: HTMLAudioElement | null = null;
    private static bgmVolume: number = 0.4;
    private static sfxVolume: number = 0.5;

    public static playBGM(src: string): void {
        if (this.bgmAudio) {
            // If already playing the same track, do nothing
            if (this.bgmAudio.src.includes(src)) {
                if (this.bgmAudio.paused) this.bgmAudio.play().catch(e => console.warn(e));
                return;
            }
            this.bgmAudio.pause();
        }

        this.bgmAudio = new Audio(src);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.bgmVolume;
        this.bgmAudio.play().catch(error => {
            console.warn("BGM Playback failed:", error);
            // Browser autoplay policy might block this
        });
    }

    public static stopBGM(): void {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
            this.bgmAudio = null;
        }
    }

    public static playSFX(src: string): void {
        const sfx = new Audio(src);
        sfx.volume = this.sfxVolume;
        sfx.play().catch(error => {
            console.warn("SFX Playback failed:", error);
        });
    }

    public static setBGMVolume(volume: number): void {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.bgmVolume;
        }
    }

    public static setSFXVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
}
