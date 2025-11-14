// 알림 관리 클래스
class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.scheduledNotifications = new Map();
        this.intervalId = null;
        this.init();
    }

    // 초기화
    init() {
        this.checkPermission();
        this.bindEvents();
        this.startNotificationChecker();
    }

    // 이벤트 바인딩
    bindEvents() {
        // 알림 설정 버튼 - 모달 없이 직접 권한 요청
        const notificationToggle = document.getElementById('notificationToggle');
        if (notificationToggle) {
            notificationToggle.addEventListener('click', (e) => {
                console.log('🔔 알림 설정 버튼 클릭, 현재 권한:', this.permission);
                e.preventDefault();
                
                if (this.permission === 'default') {
                    // 모달 없이 즉시 권한 요청 (사용자 제스처 유지)
                    console.log('🔔 즉시 브라우저 권한 요청...');
                    
                    if (!('Notification' in window)) {
                        this.showToast('이 브라우저는 알림을 지원하지 않습니다.', 'error');
                        return;
                    }
                    
                    // 동기적으로 즉시 호출 (사용자 제스처 컨텍스트 유지)
                    Notification.requestPermission().then(permission => {
                        console.log('🔔 알림 권한 결과:', permission);
                        this.permission = permission;
                        this.updateNotificationButton();
                        
                        if (permission === 'granted') {
                            console.log('✅ 알림 허용됨!');
                            this.showToast('알림이 허용되었습니다!', 'success');
                            storage.updateSettings({ notificationEnabled: true });
                            
                            // 테스트 알림 표시
                            setTimeout(() => {
                                this.showNotification({
                                    title: '✅ 알림 설정 완료',
                                    body: '이제 스케줄 시간에 알림을 받을 수 있습니다!',
                                    icon: './assets/icon-192.png',
                                    tag: 'permission-granted'
                                });
                            }, 500);
                        } else if (permission === 'denied') {
                            console.log('❌ 알림 거부됨');
                            this.showToast('알림이 거부되었습니다.', 'warning');
                            storage.updateSettings({ notificationEnabled: false });
                            this.showPermissionDeniedModal();
                        } else {
                            console.log('⚠️ 알림 권한 설정되지 않음');
                            this.showToast('알림 권한이 설정되지 않았습니다.', 'warning');
                        }
                    }).catch(error => {
                        console.error('❌ 권한 요청 에러:', error);
                        this.showPermissionDeniedModal();
                    });
                } else if (this.permission === 'granted') {
                    // 이미 허용된 경우
                    this.showToast('알림이 이미 허용되어 있습니다.', 'success');
                } else {
                    // 거부된 경우 - 설정 안내 모달 표시
                    this.showPermissionDeniedModal();
                }
            });
        }
    }

    // 브라우저 알림 권한 요청 (실제 권한 요청)
    async requestPermissionFromBrowser() {
        if (!('Notification' in window)) {
            this.showToast('이 브라우저는 알림을 지원하지 않습니다.', 'error');
            console.error('❌ Notification API를 지원하지 않습니다');
            return false;
        }

        console.log('🔔 현재 알림 권한 상태:', Notification.permission);
        
        // 이미 권한이 설정된 경우
        if (Notification.permission === 'granted') {
            console.log('✅ 이미 알림이 허용되어 있습니다');
            this.permission = 'granted';
            this.updateNotificationButton();
            this.showToast('알림이 이미 허용되어 있습니다.', 'success');
            return true;
        }
        
        if (Notification.permission === 'denied') {
            console.log('❌ 알림이 차단되어 있습니다');
            this.permission = 'denied';
            this.updateNotificationButton();
            this.showPermissionDeniedModal();
            return false;
        }

        try {
            console.log('🔔 브라우저 알림 권한 요청 시작...');
            console.log('🔔 Notification.requestPermission 함수:', typeof Notification.requestPermission);
            console.log('🔔 브라우저:', navigator.userAgent);
            
            // 브라우저 권한 팝업 표시
            let permission;
            
            // 타임아웃 설정 (30초)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('권한 요청 타임아웃 (30초)')), 30000);
            });
            
            // 구형 브라우저 호환성을 위한 처리
            let permissionPromise;
            if (Notification.requestPermission.length === 0) {
                // Promise 기반 (최신 브라우저)
                console.log('🔔 Promise 기반 requestPermission 사용');
                permissionPromise = Notification.requestPermission();
            } else {
                // Callback 기반 (구형 브라우저)
                console.log('🔔 Callback 기반 requestPermission 사용');
                permissionPromise = new Promise((resolve) => {
                    Notification.requestPermission(resolve);
                });
            }
            
            console.log('🔔 권한 요청 Promise 생성됨, 브라우저 팝업을 기다립니다...');
            console.log('🔔 팝업이 보이지 않으면 브라우저 주소창 옆 아이콘을 확인하세요!');
            
            // 타임아웃과 경쟁
            permission = await Promise.race([permissionPromise, timeoutPromise]);
            
            console.log('🔔 알림 권한 결과:', permission);
            this.permission = permission;
            this.updateNotificationButton();

            if (permission === 'granted') {
                console.log('✅ 알림 허용됨!');
                this.showToast('알림이 허용되었습니다!', 'success');
                storage.updateSettings({ notificationEnabled: true });
                
                // 테스트 알림 표시
                setTimeout(() => {
                    console.log('🔔 테스트 알림 표시 시도...');
                    this.showNotification({
                        title: '✅ 알림 설정 완료',
                        body: '이제 스케줄 시간에 알림을 받을 수 있습니다!',
                        icon: '/assets/icon-192.png',
                        tag: 'permission-granted'
                    });
                }, 500);
                
                return true;
            } else if (permission === 'denied') {
                console.log('❌ 알림 거부됨');
                this.showToast('알림이 거부되었습니다.', 'warning');
                storage.updateSettings({ notificationEnabled: false });
                return false;
            } else {
                console.log('⚠️ 알림 권한 default 상태 유지');
                this.showToast('알림 권한이 설정되지 않았습니다.', 'warning');
                storage.updateSettings({ notificationEnabled: false });
                return false;
            }
        } catch (error) {
            console.error('❌ 알림 권한 요청 오류:', error);
            console.error('❌ 오류 상세:', error.message, error.stack);
            
            // 타임아웃이거나 권한 팝업이 차단된 경우 - 수동 설정 안내
            if (error.message.includes('타임아웃') || error.message.includes('timeout')) {
                console.log('⚠️ 브라우저가 권한 팝업을 차단했습니다. 수동 설정 안내 표시...');
                this.showPermissionDeniedModal();
                this.showToast('브라우저 설정에서 알림을 직접 허용해주세요.', 'warning');
            } else {
                this.showToast('알림 권한 요청 중 오류가 발생했습니다: ' + error.message, 'error');
            }
            return false;
        }
    }

    // 권한 상태 확인
    checkPermission() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
            this.updateNotificationButton();
        }
    }

    // 알림 버튼 상태 업데이트
    updateNotificationButton() {
        const button = document.getElementById('notificationToggle');
        const icon = button.querySelector('i');
        const span = button.querySelector('span');

        switch (this.permission) {
            case 'granted':
                icon.className = 'fas fa-bell';
                span.textContent = '알림 ON';
                button.style.background = 'var(--secondary-color)';
                break;
            case 'denied':
                icon.className = 'fas fa-bell-slash';
                span.textContent = '알림 거부됨';
                button.style.background = 'var(--danger-color)';
                break;
            default:
                icon.className = 'fas fa-bell';
                span.textContent = '알림 설정';
                button.style.background = 'var(--primary-color)';
        }
    }

    // 알림 권한 모달 표시
    showNotificationModal(show = true) {
        const modal = document.getElementById('notificationModal');
        if (modal) {
            if (show && this.permission === 'default') {
                modal.classList.add('active');
            } else {
                modal.classList.remove('active');
            }
        }
    }

    // 알림 권한 모달 숨기기
    hideNotificationModal() {
        this.showNotificationModal(false);
    }

    // 알림 거부됨 안내 모달 표시
    showPermissionDeniedModal() {
        // 기존 모달이 있으면 제거
        const existingModal = document.getElementById('permissionDeniedModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'permissionDeniedModal';
        modal.className = 'notification-modal active';
        modal.style.zIndex = '1004';
        
        // 브라우저 타입 감지
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isEdge = /Edg/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        
        let instructions = '';
        
        if (isChrome || isEdge) {
            instructions = `
                <ol style="text-align: left; margin: 0; padding-left: 20px; color: #374151;">
                    <li>주소창 왼쪽의 <strong>🔒 자물쇠 아이콘</strong> 클릭</li>
                    <li><strong>"알림"</strong> 항목 찾기</li>
                    <li><strong>"허용"</strong>으로 변경</li>
                    <li>페이지 새로고침</li>
                </ol>
            `;
        } else if (isFirefox) {
            instructions = `
                <ol style="text-align: left; margin: 0; padding-left: 20px; color: #374151;">
                    <li>주소창 왼쪽의 <strong>🔒 자물쇠 아이콘</strong> 클릭</li>
                    <li><strong>"권한" > "알림 전송"</strong> 찾기</li>
                    <li><strong>"차단 해제"</strong> 클릭</li>
                    <li>페이지 새로고침</li>
                </ol>
            `;
        } else {
            instructions = `
                <ol style="text-align: left; margin: 0; padding-left: 20px; color: #374151;">
                    <li>브라우저 설정 열기</li>
                    <li>사이트 설정 또는 개인정보 보호 찾기</li>
                    <li>알림 권한 항목에서 이 사이트 허용</li>
                    <li>페이지 새로고침</li>
                </ol>
            `;
        }
        
        modal.innerHTML = `
            <div class="notification-content" style="max-width: 500px;">
                <i class="fas fa-exclamation-circle" style="color: #F59E0B;"></i>
                <h3>알림 권한 설정이 필요합니다</h3>
                <p style="margin-bottom: 15px; color: #6B7280;">
                    브라우저가 알림 팝업을 차단했거나 권한이 거부되었습니다.
                </p>
                <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #1E40AF; font-size: 14px;">
                        💡 빠른 해결 방법
                    </h4>
                    <p style="margin: 0; padding-left: 15px; color: #374151; font-size: 13px;">
                        <strong>주소창 왼쪽 🔒 자물쇠</strong>를 클릭하고<br>
                        <strong>"알림" → "허용"</strong>으로 변경 후 새로고침
                    </p>
                </div>
                <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #92400E; font-size: 14px;">
                        📝 상세 설정 방법
                    </h4>
                    ${instructions}
                </div>
                <div class="notification-actions">
                    <button class="btn btn-primary" id="closeDeniedModal" style="width: 100%;">
                        확인
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 닫기 버튼 이벤트
        document.getElementById('closeDeniedModal').addEventListener('click', () => {
            modal.remove();
        });
        
        // 모달 배경 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 스케줄 알림 등록
    scheduleNotification(day, schedule) {
        console.log('📌 scheduleNotification 호출됨:', { day, schedule });
        
        if (this.permission !== 'granted') {
            console.warn('⚠️ 알림 권한이 없습니다. 권한:', this.permission);
            return;
        }
        
        if (!schedule.notificationEnabled) {
            console.log('ℹ️ 스케줄의 알림이 비활성화되어 있습니다.');
            return;
        }

        const notificationTime = this.calculateNotificationTime(day, schedule.time);
        console.log('⏰ 계산된 알림 시간:', notificationTime);
        console.log('⏰ 현재 시간:', new Date());
        
        if (!notificationTime) {
            console.warn('⚠️ 알림 시간 계산 실패');
            return;
        }
        
        if (notificationTime <= new Date()) {
            console.warn('⚠️ 이미 지난 시간입니다. 알림 시간:', notificationTime);
            return;
        }

        const timeUntilNotification = notificationTime - new Date();
        const minutesUntil = Math.floor(timeUntilNotification / 60000);
        console.log(`✅ 알림 예약: ${minutesUntil}분 후 (${schedule.title})`);

        const notificationData = {
            id: schedule.id,
            title: `🔔 ${schedule.title}`,
            body: `${this.getDayName(day)} ${this.formatTime(schedule.time)}에 예정된 활동입니다.`,
            icon: '/assets/icon-192.png', // PWA 아이콘 사용
            tag: schedule.id,
            data: {
                scheduleId: schedule.id,
                day: day,
                time: schedule.time
            }
        };

        // 기존 알림이 있으면 취소
        this.cancelNotification(schedule.id);

        // 새 알림 스케줄링
        const timeoutId = setTimeout(() => {
            console.log('🔔 알림 표시 시간 도래:', schedule.title);
            this.showNotification(notificationData);
            this.scheduledNotifications.delete(schedule.id);
        }, timeUntilNotification);

        this.scheduledNotifications.set(schedule.id, {
            timeoutId,
            notificationTime,
            data: notificationData
        });

        console.log(`✅ 알림 스케줄 완료: ${schedule.title} / 시간: ${notificationTime.toLocaleString('ko-KR')}`);
        console.log(`📋 현재 스케줄된 알림 수: ${this.scheduledNotifications.size}`);
    }

    // 알림 취소
    cancelNotification(scheduleId) {
        const scheduled = this.scheduledNotifications.get(scheduleId);
        if (scheduled) {
            clearTimeout(scheduled.timeoutId);
            this.scheduledNotifications.delete(scheduleId);
            console.log(`알림 취소됨: ${scheduleId}`);
        }
    }

    // 알림 표시
    showNotification(data) {
        if (this.permission !== 'granted') {
            return;
        }

        try {
            const notification = new Notification(data.title, {
                body: data.body,
                icon: data.icon,
                tag: data.tag,
                badge: data.icon,
                requireInteraction: true, // 사용자가 직접 닫을 때까지 유지
                data: data.data
            });

            // 알림 클릭 이벤트
            notification.onclick = (e) => {
                e.preventDefault();
                window.focus(); // 앱으로 포커스
                notification.close();
                
                // 해당 요일로 이동하고 스케줄 하이라이트
                if (scheduleManager && data.data) {
                    scheduleManager.switchDay(data.data.day);
                    this.highlightSchedule(data.data.scheduleId);
                }
            };

            // 자동 닫기 (10초 후)
            setTimeout(() => {
                notification.close();
            }, 10000);

        } catch (error) {
            console.error('알림 표시 오류:', error);
            // 폴백: 브라우저 내 알림
            this.showInAppNotification(data);
        }
    }

    // 브라우저 내 알림 (폴백)
    showInAppNotification(data) {
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.innerHTML = `
            <div class="notification-header">
                <i class="fas fa-bell"></i>
                <strong>${data.title}</strong>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-body">${data.body}</div>
        `;

        // 스타일 적용
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--surface-color)',
            color: 'var(--text-primary)',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)',
            maxWidth: '350px',
            zIndex: '1002',
            animation: 'slideInRight 0.3s ease'
        });

        // 닫기 버튼 이벤트
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // 클릭 이벤트
        notification.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-close')) return;
            
            window.focus();
            notification.remove();
            
            if (scheduleManager && data.data) {
                scheduleManager.switchDay(data.data.day);
                this.highlightSchedule(data.data.scheduleId);
            }
        });

        document.body.appendChild(notification);

        // 10초 후 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    }

    // 스케줄 하이라이트
    highlightSchedule(scheduleId) {
        const scheduleItem = document.querySelector(`[data-schedule-id="${scheduleId}"]`);
        if (scheduleItem) {
            scheduleItem.style.background = 'rgba(79, 70, 229, 0.1)';
            scheduleItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
                scheduleItem.style.background = '';
            }, 3000);
        }
    }

    // 알림 시간 계산 (5분 전)
    calculateNotificationTime(day, timeString) {
        console.log('🔢 calculateNotificationTime 호출:', { day, timeString });
        
        try {
            const now = new Date();
            const [hours, minutes] = timeString.split(':').map(Number);
            
            console.log('  - 스케줄 시간:', `${hours}:${String(minutes).padStart(2, '0')}`);
            console.log('  - 파싱된 시간:', { hours, minutes });
            
            // 시간 유효성 검사
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                console.error('❌ 잘못된 시간 형식:', timeString);
                return null;
            }
            
            // 오늘인지 확인
            const currentDay = storage.getCurrentDay();
            console.log('  - 현재 요일:', currentDay);
            console.log('  - 스케줄 요일:', day);
            
            // 타겟 날짜 생성 (오늘 날짜로 시작)
            let targetDate = new Date();
            targetDate.setHours(hours, minutes, 0, 0);
            
            console.log('  - 초기 타겟 시간:', targetDate.toLocaleString('ko-KR'));
            
            if (day !== currentDay) {
                // 다른 요일인 경우
                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const dayIndex = days.indexOf(day);
                const currentDayIndex = now.getDay();
                
                if (dayIndex === -1) {
                    console.error('❌ 잘못된 요일:', day);
                    return null;
                }
                
                let daysAhead = dayIndex - currentDayIndex;
                if (daysAhead <= 0) {
                    daysAhead += 7; // 다음 주
                }
                
                console.log('  - 다른 요일: +', daysAhead, '일 후');
                
                // 날짜 더하기
                targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() + daysAhead);
                targetDate.setHours(hours, minutes, 0, 0);
            } else {
                console.log('  - 오늘 스케줄');
            }
            
            console.log('  - 최종 스케줄 시간:', targetDate.toLocaleString('ko-KR'));
            
            // 스케줄 시간까지 남은 시간 계산
            const timeUntilScheduleMs = targetDate.getTime() - now.getTime();
            const minutesUntilSchedule = Math.floor(timeUntilScheduleMs / 60000);
            
            console.log('  - 스케줄까지 남은 시간 (분):', minutesUntilSchedule);
            
            // 스케줄 시간이 이미 지났으면 알림 안 함
            if (timeUntilScheduleMs <= 0) {
                console.warn('  ⚠️ 스케줄 시간이 이미 지났습니다.');
                return null;
            }
            
            // 알림 시간 계산
            let notificationTime;
            
            if (minutesUntilSchedule > 5) {
                // 5분 이상 남았으면 5분 전 알림
                notificationTime = new Date(targetDate.getTime() - (5 * 60 * 1000));
                console.log('  - 알림 방식: 5분 전 알림');
            } else if (minutesUntilSchedule > 1) {
                // 5분 이하 남았으면 1분 전 알림
                notificationTime = new Date(targetDate.getTime() - (1 * 60 * 1000));
                console.log('  - 알림 방식: 1분 전 알림 (스케줄이 가까워서)');
            } else {
                // 1분 이하 남았으면 즉시 알림
                notificationTime = new Date(now.getTime() + 3000); // 3초 후
                console.log('  - 알림 방식: 즉시 알림 (스케줄이 매우 가까워서)');
            }
            
            console.log('  - 알림 시간:', notificationTime.toLocaleString('ko-KR'));
            console.log('  - 현재 시간:', now.toLocaleString('ko-KR'));
            
            const timeDiffMs = notificationTime.getTime() - now.getTime();
            const minutesUntil = Math.floor(timeDiffMs / 60000);
            const secondsUntil = Math.floor(timeDiffMs / 1000);
            
            console.log('  - 알림까지 남은 시간:', minutesUntil > 0 ? `${minutesUntil}분` : `${secondsUntil}초`);
            console.log('  - 유효한 미래 시간?:', timeDiffMs > 0);
            
            if (timeDiffMs <= 0) {
                console.warn('  ⚠️ 알림 시간이 이미 지났습니다.');
                return null;
            }
            
            console.log('  ✅ 알림 시간 계산 성공!');
            return notificationTime;
            
        } catch (error) {
            console.error('❌ calculateNotificationTime 에러:', error);
            return null;
        }
    }

    // 정기적으로 알림 확인 (1분마다)
    startNotificationChecker() {
        this.intervalId = setInterval(() => {
            this.checkScheduledNotifications();
            this.rescheduleUpcomingNotifications();
        }, 60000); // 1분마다 확인
    }

    // 스케줄된 알림 확인
    checkScheduledNotifications() {
        const now = new Date();
        
        for (const [scheduleId, scheduled] of this.scheduledNotifications) {
            if (scheduled.notificationTime <= now) {
                this.showNotification(scheduled.data);
                this.scheduledNotifications.delete(scheduleId);
            }
        }
    }

    // 다가오는 알림 재스케줄링 (앱이 오래 실행된 경우)
    rescheduleUpcomingNotifications() {
        if (this.permission !== 'granted') return;
        
        const allData = storage.getData();
        if (!allData) return;
        
        Object.entries(allData.schedules).forEach(([day, schedules]) => {
            schedules.forEach(schedule => {
                if (schedule.notificationEnabled && !this.scheduledNotifications.has(schedule.id)) {
                    this.scheduleNotification(day, schedule);
                }
            });
        });
    }

    // 모든 알림 취소
    cancelAllNotifications() {
        for (const [scheduleId] of this.scheduledNotifications) {
            this.cancelNotification(scheduleId);
        }
    }

    // 요일명 가져오기
    getDayName(day) {
        const dayNames = {
            'monday': '월요일',
            'tuesday': '화요일',
            'wednesday': '수요일',
            'thursday': '목요일',
            'friday': '금요일',
            'saturday': '토요일',
            'sunday': '일요일'
        };
        return dayNames[day] || day;
    }

    // 시간 포맷팅
    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? '오후' : '오전';
        const displayHour = hour % 12 || 12;
        return `${ampm} ${displayHour}:${minutes}`;
    }

    // 토스트 메시지 (schedule.js와 동일)
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: '1001',
            animation: 'fadeIn 0.3s ease',
            maxWidth: '300px',
            fontSize: '14px'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 정리
    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.cancelAllNotifications();
    }
}

// 전역 notification 매니저 인스턴스
const notificationManager = new NotificationManager();

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    notificationManager.destroy();
});

// 테스트용 함수들 (개발 모드)
window.testNotification = {
    // 즉시 알림 테스트
    showNow: function(title = "테스트 알림", body = "알림이 정상 작동합니다!") {
        if (notificationManager.permission !== 'granted') {
            alert('먼저 알림 권한을 허용해주세요!');
            notificationManager.requestPermission();
            return;
        }
        
        notificationManager.showNotification({
            title: title,
            body: body,
            icon: '/assets/icon-192.png',
            tag: 'test-notification',
            data: {}
        });
        
        console.log('✅ 테스트 알림 전송됨');
    },
    
    // 5초 후 알림 테스트
    showIn5Seconds: function() {
        console.log('⏰ 5초 후 알림이 표시됩니다...');
        setTimeout(() => {
            this.showNow("5초 후 알림", "알림 타이밍이 정상 작동합니다!");
        }, 5000);
    },
    
    // 30초 후 알림 테스트 (스케줄처럼)
    showIn30Seconds: function() {
        console.log('⏰ 30초 후 알림이 표시됩니다...');
        setTimeout(() => {
            this.showNow("30초 후 알림", "스케줄 알림처럼 작동합니다!");
        }, 30000);
    },
    
    // 권한 상태 확인
    checkPermission: function() {
        console.log('📋 알림 권한 상태:', notificationManager.permission);
        console.log('📋 Notification API 지원:', 'Notification' in window);
        console.log('📋 현재 스케줄된 알림 수:', notificationManager.scheduledNotifications.size);
        
        // 스케줄된 알림 목록
        if (notificationManager.scheduledNotifications.size > 0) {
            console.log('📋 스케줄된 알림 목록:');
            notificationManager.scheduledNotifications.forEach((scheduled, id) => {
                const timeLeft = scheduled.notificationTime - new Date();
                const minutesLeft = Math.floor(timeLeft / 60000);
                console.log(`  - ID: ${id}, 남은 시간: ${minutesLeft}분`);
            });
        }
        
        return {
            permission: notificationManager.permission,
            supported: 'Notification' in window,
            scheduledCount: notificationManager.scheduledNotifications.size
        };
    },
    
    // 모든 스케줄된 알림 보기
    listScheduled: function() {
        console.log('📋 스케줄된 알림 상세:');
        notificationManager.scheduledNotifications.forEach((scheduled, id) => {
            console.log('='.repeat(50));
            console.log('ID:', id);
            console.log('알림 시간:', scheduled.notificationTime);
            console.log('남은 시간:', Math.floor((scheduled.notificationTime - new Date()) / 60000), '분');
            console.log('데이터:', scheduled.data);
        });
        
        if (notificationManager.scheduledNotifications.size === 0) {
            console.log('스케줄된 알림이 없습니다.');
        }
    },
    
    // 권한 재요청
    requestPermission: function() {
        notificationManager.requestPermission();
    }
};