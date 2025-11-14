// 서비스 워커 - PWA 캐싱 및 오프라인 지원
const CACHE_NAME = 'weekly-routine-v1.0.0';
const STATIC_CACHE_NAME = 'weekly-routine-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'weekly-routine-dynamic-v1.0.0';

// 캐시할 정적 리소스들
const STATIC_FILES = [
    './',
    './index.html',
    './css/style.css',
    './css/mobile.css',
    './js/app.js',
    './js/storage.js',
    './js/schedule.js',
    './js/notification.js',
    './manifest.json'
];

// 동적으로 캐시할 리소스 패턴
const DYNAMIC_CACHE_PATTERNS = [
    /^https:\/\/fonts\.googleapis\.com/,
    /^https:\/\/fonts\.gstatic\.com/,
    /^https:\/\/cdnjs\.cloudflare\.com/
];

// 캐시 전략
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first', 
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

// 설치 이벤트
self.addEventListener('install', (event) => {
    console.log('[SW] 서비스 워커 설치 중...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('[SW] 정적 리소스 캐싱 중...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] 정적 리소스 캐싱 완료');
                return self.skipWaiting(); // 즉시 활성화
            })
            .catch((error) => {
                console.error('[SW] 정적 리소스 캐싱 실패:', error);
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
    console.log('[SW] 서비스 워커 활성화 중...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                // 오래된 캐시 삭제
                const deletePromises = cacheNames
                    .filter(cacheName => {
                        return cacheName !== STATIC_CACHE_NAME && 
                               cacheName !== DYNAMIC_CACHE_NAME &&
                               (cacheName.startsWith('weekly-routine-') || cacheName === CACHE_NAME);
                    })
                    .map(cacheName => {
                        console.log('[SW] 오래된 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    });
                
                return Promise.all(deletePromises);
            })
            .then(() => {
                console.log('[SW] 서비스 워커 활성화 완료');
                return self.clients.claim(); // 모든 클라이언트 제어
            })
            .catch((error) => {
                console.error('[SW] 서비스 워커 활성화 실패:', error);
            })
    );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // GET 요청만 처리
    if (request.method !== 'GET') {
        return;
    }

    // Chrome extension 요청 무시
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // 정적 리소스 처리 (Cache First)
    if (STATIC_FILES.some(file => url.pathname === file || url.href === file)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // 동적 리소스 처리 (Stale While Revalidate)
    if (DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // HTML 페이지 처리 (Network First with fallback)
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirstWithFallback(request));
        return;
    }

    // 기타 요청은 네트워크 우선
    event.respondWith(networkFirst(request));
});

// 캐시 전략 구현들
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache First 오류:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('네트워크 오류가 발생했습니다.', { 
            status: 503, 
            statusText: 'Service Unavailable' 
        });
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Network First 오류:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // 백그라운드에서 네트워크 요청하여 캐시 업데이트
    const networkResponsePromise = fetch(request).then(response => {
        if (response && response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(error => {
        console.error('[SW] Stale While Revalidate 네트워크 오류:', error);
    });

    // 캐시된 응답이 있으면 즉시 반환, 없으면 네트워크 응답 기다림
    return cachedResponse || networkResponsePromise;
}

async function networkFirstWithFallback(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Network First with Fallback 오류:', error);
        
        // 캐시된 페이지 찾기
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // 오프라인 폴백 페이지 반환
        const fallbackResponse = await caches.match('/');
        if (fallbackResponse) {
            return fallbackResponse;
        }

        // 최후 수단: 간단한 오프라인 페이지
        return new Response(
            `<!DOCTYPE html>
            <html>
            <head>
                <title>오프라인 - 주간 루틴 매니저</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: sans-serif; text-align: center; padding: 2rem; background: #f8fafc; }
                    .offline-message { max-width: 400px; margin: 0 auto; }
                    .icon { font-size: 4rem; margin-bottom: 1rem; color: #6b7280; }
                    h1 { color: #374151; margin-bottom: 1rem; }
                    p { color: #6b7280; margin-bottom: 2rem; }
                    button { background: #4f46e5; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
                    button:hover { background: #3730a3; }
                </style>
            </head>
            <body>
                <div class="offline-message">
                    <div class="icon">📅</div>
                    <h1>오프라인 상태</h1>
                    <p>인터넷 연결을 확인하고 다시 시도해주세요.</p>
                    <button onclick="window.location.reload()">다시 시도</button>
                </div>
            </body>
            </html>`, 
            { 
                headers: { 'Content-Type': 'text/html' },
                status: 503,
                statusText: 'Service Unavailable'
            }
        );
    }
}

// 백그라운드 동기화 (실험적 기능)
self.addEventListener('sync', (event) => {
    console.log('[SW] 백그라운드 동기화:', event.tag);
    
    if (event.tag === 'background-sync-schedules') {
        event.waitUntil(syncSchedules());
    }
});

async function syncSchedules() {
    try {
        console.log('[SW] 스케줄 동기화 실행');
        // 여기서 서버와 데이터 동기화 로직 구현 가능
        // 현재는 로컬 스토리지만 사용하므로 생략
    } catch (error) {
        console.error('[SW] 스케줄 동기화 실패:', error);
    }
}

// 푸시 알림 처리 (실험적 기능)
self.addEventListener('push', (event) => {
    console.log('[SW] 푸시 메시지 수신:', event);
    
    const options = {
        body: '스케줄 시간이 되었습니다!',
        icon: '/assets/icon-192.png',
        badge: '/assets/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'complete',
                title: '완료',
                icon: '/assets/action-complete.png'
            },
            {
                action: 'snooze',
                title: '5분 후',
                icon: '/assets/action-snooze.png'
            }
        ]
    };

    if (event.data) {
        const payload = event.data.json();
        options.body = payload.body || options.body;
        options.data = { ...options.data, ...payload.data };
    }

    event.waitUntil(
        self.registration.showNotification('주간 루틴 매니저', options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] 알림 클릭:', event);
    
    event.notification.close();

    if (event.action === 'complete') {
        // 완료 액션 처리
        event.waitUntil(handleCompleteAction(event.notification.data));
    } else if (event.action === 'snooze') {
        // 스누즈 액션 처리
        event.waitUntil(handleSnoozeAction(event.notification.data));
    } else {
        // 기본 클릭: 앱 열기
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url === self.registration.scope && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

async function handleCompleteAction(data) {
    console.log('[SW] 완료 액션 처리:', data);
    // 스케줄 완료 처리 로직
}

async function handleSnoozeAction(data) {
    console.log('[SW] 스누즈 액션 처리:', data);
    // 5분 후 다시 알림 스케줄링
    setTimeout(() => {
        self.registration.showNotification('주간 루틴 매니저 (다시 알림)', {
            body: '스케줄 시간입니다!',
            icon: '/assets/icon-192.png',
            badge: '/assets/icon-72.png',
            data: data
        });
    }, 5 * 60 * 1000); // 5분
}

// 캐시 정리 (주기적으로 실행)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAN_CACHE') {
        event.waitUntil(cleanOldCache());
    }
});

async function cleanOldCache() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const requests = await cache.keys();
        
        // 1주일 이상 된 캐시 항목 삭제
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader && new Date(dateHeader).getTime() < oneWeekAgo) {
                    await cache.delete(request);
                    console.log('[SW] 오래된 캐시 항목 삭제:', request.url);
                }
            }
        }
        
        console.log('[SW] 캐시 정리 완료');
    } catch (error) {
        console.error('[SW] 캐시 정리 실패:', error);
    }
}