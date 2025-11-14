// 스케줄 관리 클래스
class ScheduleManager {
    constructor() {
        this.currentDay = 'monday';
        this.dayNames = {
            'monday': '월요일',
            'tuesday': '화요일',
            'wednesday': '수요일',
            'thursday': '목요일',
            'friday': '금요일',
            'saturday': '토요일',
            'sunday': '일요일'
        };
        
        this.init();
    }

    // 초기화
    init() {
        this.bindEvents();
        this.loadCurrentDay();
        this.renderSchedules();
        this.updateStats();
        
        // 기존 스케줄의 알림 재등록
        this.rescheduleAllNotifications();
    }
    
    // 모든 스케줄의 알림 재등록
    rescheduleAllNotifications() {
        console.log('🔄 모든 스케줄 알림 재등록 시작...');
        
        if (!window.notificationManager || notificationManager.permission !== 'granted') {
            console.log('⚠️ 알림 권한이 없어서 스케줄링하지 않습니다.');
            return;
        }
        
        const allData = storage.getData();
        if (!allData) return;
        
        let scheduledCount = 0;
        
        Object.entries(allData.schedules).forEach(([day, schedules]) => {
            schedules.forEach(schedule => {
                if (schedule.notificationEnabled) {
                    notificationManager.scheduleNotification(day, schedule);
                    scheduledCount++;
                }
            });
        });
        
        console.log(`✅ 총 ${scheduledCount}개의 알림이 재등록되었습니다.`);
    }

    // 이벤트 바인딩
    bindEvents() {
        // 요일 탭 클릭
        document.getElementById('dayTabs').addEventListener('click', (e) => {
            if (e.target.classList.contains('day-tab')) {
                this.switchDay(e.target.dataset.day);
            }
        });

        // 스케줄 추가 버튼
        document.getElementById('addScheduleBtn').addEventListener('click', () => {
            this.openScheduleModal();
        });

        // 모달 관련 이벤트
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalOverlay')) {
                this.closeModal();
            }
        });

        // 폼 제출
        document.getElementById('scheduleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSchedule();
        });

        // 스케줄 리스트 이벤트 (이벤트 위임)
        document.getElementById('scheduleList').addEventListener('click', (e) => {
            const scheduleItem = e.target.closest('.schedule-item');
            if (!scheduleItem) return;

            const scheduleId = scheduleItem.dataset.scheduleId;
            
            if (e.target.closest('.btn-success')) {
                this.toggleScheduleCompletion(scheduleId);
            } else if (e.target.closest('.btn-primary')) {
                this.editSchedule(scheduleId);
            } else if (e.target.closest('.btn-danger')) {
                this.deleteSchedule(scheduleId);
            }
        });
    }

    // 현재 요일 로드
    loadCurrentDay() {
        const today = storage.getCurrentDay();
        this.switchDay(today);
    }

    // 요일 전환
    switchDay(day) {
        this.currentDay = day;
        
        // 탭 활성화 상태 업데이트
        document.querySelectorAll('.day-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-day="${day}"]`).classList.add('active');

        // 제목 업데이트
        document.getElementById('currentDayTitle').textContent = `${this.dayNames[day]} 스케줄`;

        // 스케줄 렌더링
        this.renderSchedules();
    }

    // 스케줄 렌더링
    renderSchedules() {
        const schedules = storage.getSchedules(this.currentDay);
        const scheduleList = document.getElementById('scheduleList');
        const emptyState = document.getElementById('emptyState');

        if (schedules.length === 0) {
            scheduleList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        scheduleList.innerHTML = schedules.map(schedule => `
            <div class="schedule-item ${schedule.completed ? 'completed' : ''}" data-schedule-id="${schedule.id}">
                <div class="schedule-info">
                    <div class="schedule-time">${this.formatTime(schedule.time)}</div>
                    <div class="schedule-content">
                        <div class="schedule-title">${this.escapeHtml(schedule.title)}</div>
                        ${schedule.description ? `<div class="schedule-description">${this.escapeHtml(schedule.description)}</div>` : ''}
                    </div>
                </div>
                <div class="schedule-actions">
                    <button class="btn btn-success btn-icon" title="${schedule.completed ? '완료 취소' : '완료'}">
                        ${schedule.completed ? '↩️' : '✅'}
                    </button>
                    <button class="btn btn-primary btn-icon" title="수정">
                        ✏️
                    </button>
                    <button class="btn btn-danger btn-icon" title="삭제">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        // 애니메이션 효과
        scheduleList.querySelectorAll('.schedule-item').forEach((item, index) => {
            item.style.animation = `fadeIn 0.3s ease ${index * 0.1}s both`;
        });
    }

    // 스케줄 모달 열기
    openScheduleModal(schedule = null) {
        this.editingSchedule = schedule;
        
        const modal = document.getElementById('modalOverlay');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('scheduleForm');
        
        // 모달 제목 설정
        title.textContent = schedule ? '스케줄 수정' : '스케줄 추가';
        
        // 폼 초기화 또는 데이터 채우기
        if (schedule) {
            document.getElementById('scheduleTime').value = schedule.time;
            document.getElementById('scheduleTitle').value = schedule.title;
            document.getElementById('scheduleDescription').value = schedule.description || '';
            document.getElementById('enableNotification').checked = schedule.notificationEnabled;
        } else {
            form.reset();
            // 현재 시간을 기본값으로 설정
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            document.getElementById('scheduleTime').value = currentTime;
        }
        
        // 모달 표시
        modal.classList.add('active');
        document.getElementById('scheduleTitle').focus();
    }

    // 모달 닫기
    closeModal() {
        const modal = document.getElementById('modalOverlay');
        modal.classList.remove('active');
        this.editingSchedule = null;
    }

    // 스케줄 저장
    saveSchedule() {
        const time = document.getElementById('scheduleTime').value;
        const title = document.getElementById('scheduleTitle').value.trim();
        const description = document.getElementById('scheduleDescription').value.trim();
        const notificationEnabled = document.getElementById('enableNotification').checked;

        if (!time || !title) {
            this.showToast('시간과 활동명을 입력해주세요.', 'error');
            return;
        }

        const scheduleData = {
            time,
            title,
            description,
            notificationEnabled
        };

        let success = false;
        
        if (this.editingSchedule) {
            // 수정
            success = storage.updateSchedule(this.currentDay, this.editingSchedule.id, scheduleData);
            if (success) {
                this.showToast('스케줄이 수정되었습니다.', 'success');
                // 알림 업데이트
                if (notificationEnabled) {
                    notificationManager.scheduleNotification(this.currentDay, {
                        ...this.editingSchedule,
                        ...scheduleData
                    });
                } else {
                    notificationManager.cancelNotification(this.editingSchedule.id);
                }
            }
        } else {
            // 추가
            const newSchedule = storage.addSchedule(this.currentDay, scheduleData);
            if (newSchedule) {
                success = true;
                this.showToast('스케줄이 추가되었습니다.', 'success');
                // 알림 스케줄링
                if (notificationEnabled) {
                    notificationManager.scheduleNotification(this.currentDay, newSchedule);
                }
            }
        }

        if (success) {
            this.closeModal();
            this.renderSchedules();
            this.updateStats();
        } else {
            this.showToast('저장 중 오류가 발생했습니다.', 'error');
        }
    }

    // 스케줄 수정
    editSchedule(scheduleId) {
        const schedule = storage.getSchedules(this.currentDay).find(s => s.id === scheduleId);
        if (schedule) {
            this.openScheduleModal(schedule);
        }
    }

    // 스케줄 삭제
    deleteSchedule(scheduleId) {
        if (confirm('이 스케줄을 삭제하시겠습니까?')) {
            const success = storage.deleteSchedule(this.currentDay, scheduleId);
            if (success) {
                this.showToast('스케줄이 삭제되었습니다.', 'success');
                this.renderSchedules();
                this.updateStats();
                // 알림도 취소
                notificationManager.cancelNotification(scheduleId);
            } else {
                this.showToast('삭제 중 오류가 발생했습니다.', 'error');
            }
        }
    }

    // 스케줄 완료 토글
    toggleScheduleCompletion(scheduleId) {
        const success = storage.toggleScheduleCompletion(this.currentDay, scheduleId);
        if (success) {
            this.renderSchedules();
            this.updateStats();
            
            const schedule = storage.getSchedules(this.currentDay).find(s => s.id === scheduleId);
            const message = schedule?.completed ? '완료 표시했습니다!' : '완료를 취소했습니다.';
            this.showToast(message, 'success');
        }
    }

    // 통계 업데이트
    updateStats() {
        storage.updateWeeklyStats();
        const stats = storage.getStats();
        const statsGrid = document.getElementById('statsGrid');

        const allSchedules = Object.values(storage.getData().schedules).flat();
        const totalSchedules = allSchedules.length;
        const completedSchedules = allSchedules.filter(s => s.completed).length;
        const todaySchedules = storage.getTodaySchedules();
        const todayCompleted = todaySchedules.filter(s => s.completed).length;
        
        statsGrid.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${totalSchedules}</div>
                <div class="stat-label">전체 스케줄</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${completedSchedules}</div>
                <div class="stat-label">완료된 스케줄</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${todaySchedules.length}</div>
                <div class="stat-label">오늘 스케줄</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0}%</div>
                <div class="stat-label">전체 달성률</div>
            </div>
        `;
    }

    // 시간 포맷팅
    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? '오후' : '오전';
        const displayHour = hour % 12 || 12;
        return `${ampm} ${displayHour}:${minutes}`;
    }

    // HTML 이스케이프
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 토스트 메시지 표시
    showToast(message, type = 'info') {
        // 기존 토스트 제거
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // 토스트 스타일 추가 (CSS에 없으므로 인라인으로)
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
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

        // 3초 후 자동 제거
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// 전역 schedule 매니저 인스턴스
const scheduleManager = new ScheduleManager();