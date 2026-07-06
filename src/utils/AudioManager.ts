// utils/AudioManager.ts
import { useGameStore } from '../state/gameStore';
import { storageKey } from './buildTarget';

export class AudioManager {
    private static bgmVolume: number = (() => {
        const saved = localStorage.getItem(storageKey('bgmVolume'));
        if (saved !== null) {
            const parsed = Number(saved);
            return isNaN(parsed) ? 0.5 : parsed;
        }
        return 0.5;
    })();
    private static sfxVolume: number = (() => {
        const saved = localStorage.getItem(storageKey('sfxVolume'));
        if (saved !== null) {
            const parsed = Number(saved);
            return isNaN(parsed) ? 0.5 : parsed;
        }
        return 0.5;
    })();
    private static bgmAudio: HTMLAudioElement | null = null;

    // 탭 복귀 시 BGM 자동 재개 (Page Visibility API)
    private static _visibilityHandlerRegistered = false;
    public static registerVisibilityHandler(): void {
        if (this._visibilityHandlerRegistered) return;
        this._visibilityHandlerRegistered = true;
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.bgmAudio && this.bgmAudio.paused) {
                this.bgmAudio.play().catch(e => console.warn('BGM Visibility Resume failed:', e));
            }
        });
    }

    // 브라우저 자동 재생(Autoplay) 차단 해제 핸들러
    private static _interactionHandlerRegistered = false;
    private static registerInteractionHandler(): void {
        if (this._interactionHandlerRegistered) return;
        this._interactionHandlerRegistered = true;

        const startAudio = () => {
            if (this.bgmAudio && this.bgmAudio.paused) {
                this.bgmAudio.play()
                    .then(() => {
                        cleanup();
                    })
                    .catch(e => {
                        console.warn('BGM Interaction Play failed:', e);
                    });
            } else if (this.bgmAudio && !this.bgmAudio.paused) {
                cleanup();
            }
        };

        const cleanup = () => {
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
            document.removeEventListener('mousedown', startAudio);
            document.removeEventListener('touchstart', startAudio);
            this._interactionHandlerRegistered = false;
        };

        document.addEventListener('click', startAudio);
        document.addEventListener('keydown', startAudio);
        document.addEventListener('mousedown', startAudio);
        document.addEventListener('touchstart', startAudio);
    }

    public static setBGMVolume(volume: number) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem(storageKey('bgmVolume'), this.bgmVolume.toString());
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.bgmVolume;
        }
    }

    public static setSFXVolume(volume: number) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem(storageKey('sfxVolume'), this.sfxVolume.toString());
    }

    public static getBGMVolume(): number {
        return this.bgmVolume;
    }

    public static getSFXVolume(): number {
        return this.sfxVolume;
    }

    public static playBGM(src: string) {
        // encodeURI: 한글/공백/괄호 포함 경로를 Tauri WebView2에서 올바르게 처리
        const encodedSrc = encodeURI(src);
        if (this.bgmAudio) {
            // v2.3.8: Decode URI to prevent restarts on paths with spaces (e.g., "/audio sounds/")
            const currentSrc = decodeURI(this.bgmAudio.src);
            const targetSrc = decodeURI(src);

            if (currentSrc.includes(targetSrc)) {
                if (this.bgmAudio.paused) {
                    this.bgmAudio.play().catch(e => {
                        console.warn("BGM Playback (Resume) failed:", e);
                        this.registerInteractionHandler();
                    });
                }
                return;
            }
            this.bgmAudio.pause();
        }

        this.bgmAudio = new Audio(encodedSrc);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.bgmVolume;
        this.bgmAudio.play().catch(e => {
            console.warn("BGM Playback (New) failed:", e);
            this.registerInteractionHandler();
        });
    }

    public static playSFX(src: string) {
        // encodeURI: 한글/공백/괄호 포함 경로를 Tauri WebView2에서 올바르게 처리
        const audio = new Audio(encodeURI(src));
        audio.volume = this.sfxVolume;
        // v2.5.0: Apply game speed to SFX playback rate
        const speed = useGameStore.getState().gameSpeed;
        audio.playbackRate = speed;
        audio.play().catch(e => console.warn("SFX Playback failed:", e));
    }

    public static stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
        }
    }
}
