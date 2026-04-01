// src/utils/AssetPreloadManager.ts

type LoadingCallback = (progress: number, loaded: number, total: number) => void;

class AssetPreloadManager {
  private cache = new Map<string, HTMLImageElement>();
  private loading = new Map<string, Promise<HTMLImageElement>>();

  // 이미지 1개 프리로드 (캐시 히트 시 즉시 반환)
  async preloadImage(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) return this.cache.get(url)!;
    if (this.loading.has(url)) return this.loading.get(url)!;

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => { this.cache.set(url, img); this.loading.delete(url); resolve(img); };
      img.onerror = () => { this.loading.delete(url); reject(new Error(`Failed: ${url}`)); };
      img.src = url;
    });
    this.loading.set(url, promise);
    return promise;
  }

  // 배치 프리로드 (진행률 콜백 포함)
  async preloadBatch(
    urls: string[],
    onProgress?: LoadingCallback,
    concurrency = 4
  ): Promise<void> {
    const uniqueUrls = [...new Set(urls)];
    const total = uniqueUrls.length;
    let loaded = 0;

    if (total === 0) {
      onProgress?.(1, parseInt('0'), parseInt('0'));
      return;
    }

    // 동시성 제한 로딩 (네트워크 부하 방지)
    const queue = [...uniqueUrls];
    const workers = Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        const url = queue.shift()!;
        try {
          await this.preloadImage(url);
        } catch (e) {
          console.warn(`[PreloadManager] Failed to load: ${url}`);
        }
        loaded++;
        onProgress?.(loaded / total, loaded, total);
      }
    });

    await Promise.all(workers);
  }

  // 캐시된 이미지 반환 (없으면 null)
  getCachedImage(url: string): HTMLImageElement | null {
    return this.cache.get(url) || null;
  }

  // 캐시 통계
  get cacheSize(): number { return this.cache.size; }

  // 메모리 해제 (챕터 전환 시)
  clearChapterCache(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }
}

export const preloadManager = new AssetPreloadManager();
