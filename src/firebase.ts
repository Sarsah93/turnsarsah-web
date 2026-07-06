import { IS_STEAM } from './utils/buildTarget';
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// Firebase는 웹(internal) 빌드에서만 초기화
// Steam 빌드에서는 Firebase 환경 변수가 없으므로 초기화 건너뜀
let db: Firestore | null = null;
let auth: Auth | null = null;
let app: FirebaseApp | null = null;

if (!IS_STEAM) {
    // Vite 환경 변수에서 값을 읽어옵니다.
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };

    // 필수 키 존재 여부 확인 (Steam 빌드에서 undefined로 넘어올 경우 방지)
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
    } else {
        console.warn('[Firebase] 환경변수가 없어 초기화를 건너뜁니다. (Steam 빌드이거나 .env 파일이 없습니다)');
    }
}

export { db, auth };
export default app;