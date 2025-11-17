// 메인 앱 초기화 및 전역 이벤트 관리
class App {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    // 앱 초기화
    init() {
        // DOM 로드 완료 확인
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    // 실제 초기화 로직
    initialize() {
        if (this.isInitialized) return;
        
        try {
            // 필수 요소 확인
            this.checkRequiredElements();
            
            // 전역 이벤트 바인딩
            this.bindGlobalEvents();
            
            // 초기 설정 로드
            this.loadInitialSettings();
            
            // 알림 권한 확인
            this.checkInitialNotificationPermission();
            
            // 키보드 단축키 설정
            this.setupKeyboardShortcuts();
            
            // 앱 상태 복원
            this.restoreAppState();
            
            // PWA 설치 프롬프트 설정
            this.setupPWAInstallPrompt();
            
            this.isInitialized = true;
            console.log('주간 루틴 매니저 앱이 초기화되었습니다.');
            
            // 초기화 완료 이벤트 발생
            this.dispatchEvent('app:initialized');
            
        } catch (error) {
            console.error('앱 초기화 중 오류 발생:', error);
            this.showErrorMessage('앱 초기화 중 문제가 발생했습니다. 페이지를 새로고침해주세요.');
        }
    }

    // 필수 DOM 요소 확인
    checkRequiredElements() {
        const requiredElements = [
            'dayTabs',
            'scheduleList',
            'addScheduleBtn',
            'modalOverlay',
            'scheduleForm'
        ];

        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`필수 요소가 누락되었습니다: ${missingElements.join(', ')}`);
        }
    }

    // 전역 이벤트 바인딩
    bindGlobalEvents() {
        // 언어 선택 이벤트
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect && window.i18n) {
            languageSelect.value = i18n.getCurrentLanguage();
            languageSelect.addEventListener('change', (e) => {
                i18n.setLanguage(e.target.value);
            });
        }

        // 윈도우 포커스 이벤트
        window.addEventListener('focus', () => {
            this.onAppFocus();
        });

        // 윈도우 블러 이벤트
        window.addEventListener('blur', () => {
            this.onAppBlur();
        });

        // 온라인/오프라인 상태 감지
        window.addEventListener('online', () => {
            this.onOnline();
        });

        window.addEventListener('offline', () => {
            this.onOffline();
        });

        // 브라우저 뒤로 가기 방지 (모달이 열려있을 때)
        window.addEventListener('popstate', (e) => {
            const modal = document.getElementById('modalOverlay');
            if (modal && modal.classList.contains('active')) {
                e.preventDefault();
                scheduleManager.closeModal();
                window.history.pushState(null, '', window.location.href);
            }
        });

        // 페이지 언로드 전 데이터 백업
        window.addEventListener('beforeunload', (e) => {
            this.onBeforeUnload(e);
        });

        // 에러 핸들링
        window.addEventListener('error', (e) => {
            console.error('전역 에러:', e.error);
            this.showErrorMessage('예상치 못한 오류가 발생했습니다.');
        });

        // 리사이즈 이벤트 (디바운스 적용)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.onWindowResize();
            }, 250);
        });
    }

    // 초기 설정 로드
    loadInitialSettings() {
        const settings = storage.getSettings();
        
        // 테마 적용
        if (settings.theme && settings.theme !== 'light') {
            document.body.setAttribute('data-theme', settings.theme);
        }

        // 다크모드 자동 감지
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            if (!settings.theme || settings.theme === 'auto') {
                document.body.setAttribute('data-theme', 'dark');
            }
        }
    }

    // 초기 알림 권한 확인
    checkInitialNotificationPermission() {
        // 자동 알림 모달 비활성화됨
        // 사용자가 직접 "알림 설정" 버튼을 클릭해야 함
        
        // 원하시면 아래 주석을 해제하세요:
        // setTimeout(() => {
        //     if (notificationManager.permission === 'default') {
        //         notificationManager.showNotificationModal(true);
        //     }
        // }, 5000);
    }

    // 키보드 단축키 설정
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: 새 스케줄 추가
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                scheduleManager.openScheduleModal();
            }

            // Escape: 모달 닫기
            if (e.key === 'Escape') {
                const modal = document.getElementById('modalOverlay');
                if (modal && modal.classList.contains('active')) {
                    scheduleManager.closeModal();
                }
                
                const notificationModal = document.getElementById('notificationModal');
                if (notificationModal && notificationModal.classList.contains('active')) {
                    notificationManager.hideNotificationModal();
                }
            }

            // 숫자 키 1-7: 요일 전환
            if (e.key >= '1' && e.key <= '7' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const dayIndex = parseInt(e.key) - 1;
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                if (days[dayIndex]) {
                    scheduleManager.switchDay(days[dayIndex]);
                }
            }
        });
    }

    // 앱 상태 복원
    restoreAppState() {
        // 마지막 선택된 요일이 있으면 복원 (이미 loadCurrentDay에서 처리됨)
        // 스케줄 알림 재설정
        this.rescheduleAllNotifications();
    }

    // PWA 설치 프롬프트 설정
    setupPWAInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // 설치 버튼 표시 (나중에 추가할 수 있음)
            this.showInstallPrompt(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA가 설치되었습니다.');
            this.showToast('앱이 설치되었습니다!', 'success');
        });
    }

    // PWA 설치 프롬프트 표시
    showInstallPrompt(deferredPrompt) {
        // 간단한 설치 알림 (사용자가 원할 때 설치할 수 있도록)
        if (window.matchMedia('(display-mode: browser)').matches) {
            setTimeout(() => {
                const installToast = document.createElement('div');
                installToast.className = 'install-prompt';
                installToast.innerHTML = `
                    <div class="install-content">
                        <i class="fas fa-download"></i>
                        <span>앱으로 설치하시겠습니까?</span>
                        <button class="install-btn">설치</button>
                        <button class="install-close">&times;</button>
                    </div>
                `;

                Object.assign(installToast.style, {
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--surface-color)',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-color)',
                    zIndex: '1000',
                    animation: 'slideInUp 0.3s ease'
                });

                installToast.querySelector('.install-btn').addEventListener('click', () => {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('사용자가 PWA 설치를 수락했습니다.');
                        }
                        deferredPrompt = null;
                    });
                    installToast.remove();
                });

                installToast.querySelector('.install-close').addEventListener('click', () => {
                    installToast.remove();
                });

                document.body.appendChild(installToast);

                // 10초 후 자동 제거
                setTimeout(() => {
                    if (installToast.parentNode) {
                        installToast.remove();
                    }
                }, 10000);
            }, 3000);
        }
    }

    // 모든 알림 재스케줄링
    rescheduleAllNotifications() {
        if (notificationManager.permission !== 'granted') return;
        
        const data = storage.getData();
        if (!data) return;

        Object.entries(data.schedules).forEach(([day, schedules]) => {
            schedules.forEach(schedule => {
                if (schedule.notificationEnabled) {
                    notificationManager.scheduleNotification(day, schedule);
                }
            });
        });
    }

    // 앱 이벤트 핸들러들
    onAppFocus() {
        // 앱이 포커스를 받았을 때 (탭 전환 등)
        console.log('앱 포커스');
        
        // 현재 시간 업데이트
        this.updateCurrentTime();
        
        // 놓친 알림이 있는지 확인
        notificationManager.checkScheduledNotifications();
    }

    onAppBlur() {
        // 앱이 포커스를 잃었을 때
        console.log('앱 블러');
    }

    onOnline() {
        console.log('온라인 상태');
        this.showToast('인터넷에 연결되었습니다.', 'success');
    }

    onOffline() {
        console.log('오프라인 상태');
        this.showToast('오프라인 상태입니다. 일부 기능이 제한될 수 있습니다.', 'warning');
    }

    onWindowResize() {
        // 윈도우 리사이즈 시 레이아웃 조정
        console.log('윈도우 리사이즈');
    }

    onBeforeUnload(e) {
        // 페이지 언로드 전 처리
        // 변경사항이 있는 경우 경고 (필요시)
        // e.preventDefault();
        // e.returnValue = '';
    }

    // 현재 시간 업데이트
    updateCurrentTime() {
        const now = new Date();
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    // 에러 메시지 표시
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button class="error-close">&times;</button>
        `;

        Object.assign(errorDiv.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#FEE2E2',
            color: '#DC2626',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: '1002',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: '500'
        });

        errorDiv.querySelector('.error-close').addEventListener('click', () => {
            errorDiv.remove();
        });

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 8000);
    }

    // 토스트 메시지 (전역 유틸리티 사용)
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        }
    }

    // 커스텀 이벤트 발생
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }

    // 앱 상태 확인
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            online: navigator.onLine,
            notificationPermission: notificationManager?.permission || 'default',
            currentDay: scheduleManager?.currentDay || 'monday',
            totalSchedules: storage.getStats().totalSchedules
        };
    }
}

// 앱 초기화
const app = new App();

// 전역으로 앱 상태 접근 가능하도록
window.weeklyRoutineApp = app;

// 디버깅용 전역 함수들 (개발 모드에서만)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugApp = {
        storage,
        scheduleManager,
        notificationManager,
        app,
        exportData: () => storage.exportData(),
        clearAllData: () => {
            if (confirm('모든 데이터를 삭제하시겠습니까?')) {
                storage.clearAllData();
                window.location.reload();
            }
        },
        getAppStatus: () => app.getAppStatus()
    };
}