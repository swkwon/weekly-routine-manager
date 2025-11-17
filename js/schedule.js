// 스케줄 관리 클래스
class ScheduleManager {
    constructor() {
        this.currentDay = 'monday';
        // dayNames는 i18n.t()로 동적으로 가져옴
        
        this.init();
    }

    // 초기화
    init() {
        this.bindEvents();
        this.loadCurrentDay();
        this.renderSchedules();
        
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

        // 모두 체크 버튼
        document.getElementById('selectAllDays').addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.day-checkbox');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => cb.checked = !allChecked);
        });

        // 스케줄 리스트 이벤트 (이벤트 위임)
        document.getElementById('scheduleList').addEventListener('click', (e) => {
            const scheduleItem = e.target.closest('.schedule-item');
            if (!scheduleItem) return;

            const scheduleId = scheduleItem.dataset.scheduleId;
            
            if (e.target.closest('.btn-primary')) {
                this.editSchedule(scheduleId);
            } else if (e.target.closest('.btn-danger')) {
                this.deleteSchedule(scheduleId);
            }
        });
    }

    // 현재 요일 로드
    loadCurrentDay() {
        // 오늘 요일로 설정
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
        
        const dayTab = document.querySelector(`[data-day="${day}"]`);
        if (dayTab) {
            dayTab.classList.add('active');
        }

        // 제목 업데이트
        const dayTitle = document.getElementById('currentDayTitle');
        if (dayTitle) {
            dayTitle.textContent = `${i18n.t(`daysFull.${day}`)} ${i18n.t('scheduleTitle')}`;
        }

        // 스케줄 렌더링
        this.renderSchedules();
    }

    // 스케줄 렌더링 (차별화 렌더링)
    renderSchedules() {
        const schedules = storage.getSchedules(this.currentDay);
        const scheduleList = document.getElementById('scheduleList');
        const emptyState = document.getElementById('emptyState');

        if (!scheduleList || !emptyState) {
            return; // DOM 요소가 아직 로드되지 않음
        }

        if (schedules.length === 0) {
            scheduleList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        // 기존 DOM 요소들의 ID 맵 생성
        const existingItems = new Map();
        scheduleList.querySelectorAll('.schedule-item').forEach(item => {
            existingItems.set(item.dataset.scheduleId, item);
        });
        
        // 새로운 스케줄 ID 세트
        const newScheduleIds = new Set(schedules.map(s => s.id));
        
        // 삭제된 항목 제거
        existingItems.forEach((item, id) => {
            if (!newScheduleIds.has(id)) {
                item.remove();
            }
        });
        
        // 스케줄 순서대로 업데이트 또는 추가
        schedules.forEach((schedule, index) => {
            const existingItem = existingItems.get(schedule.id);
            
            if (existingItem) {
                // 기존 항목 업데이트
                this.updateScheduleItem(existingItem, schedule);
                
                // 순서 조정 (필요시)
                const currentIndex = Array.from(scheduleList.children).indexOf(existingItem);
                if (currentIndex !== index) {
                    if (index === 0) {
                        scheduleList.insertBefore(existingItem, scheduleList.firstChild);
                    } else {
                        scheduleList.insertBefore(existingItem, scheduleList.children[index]);
                    }
                }
            } else {
                // 새 항목 추가
                const newItem = this.createScheduleItem(schedule);
                if (index < scheduleList.children.length) {
                    scheduleList.insertBefore(newItem, scheduleList.children[index]);
                } else {
                    scheduleList.appendChild(newItem);
                }
                // 애니메이션
                newItem.style.animation = 'fadeIn 0.3s ease both';
            }
        });
    }
    
    // 스케줄 아이템 생성
    createScheduleItem(schedule) {
        const div = document.createElement('div');
        div.className = 'schedule-item';
        div.dataset.scheduleId = schedule.id;
        
        div.innerHTML = `
            <div class="schedule-info">
                <div class="schedule-time">${this.formatTime(schedule.time)}</div>
                <div class="schedule-content">
                    <div class="schedule-title">${this.escapeHtml(schedule.title)}</div>
                    ${schedule.description ? `<div class="schedule-description">${this.escapeHtml(schedule.description)}</div>` : ''}
                </div>
            </div>
            <div class="schedule-actions">
                <button class="btn btn-primary btn-icon" title="${i18n.t('buttons.edit')}">
                    ✏️
                </button>
                <button class="btn btn-danger btn-icon" title="${i18n.t('buttons.delete')}">
                    🗑️
                </button>
            </div>
        `;
        
        return div;
    }
    
    // 기존 스케줄 아이템 업데이트
    updateScheduleItem(item, schedule) {
        // 시간, 제목, 설명 업데이트
        const timeEl = item.querySelector('.schedule-time');
        const titleEl = item.querySelector('.schedule-title');
        const descEl = item.querySelector('.schedule-description');
        const contentEl = item.querySelector('.schedule-content');
        
        if (timeEl) timeEl.textContent = this.formatTime(schedule.time);
        if (titleEl) titleEl.textContent = this.escapeHtml(schedule.title);
        
        if (schedule.description) {
            if (descEl) {
                descEl.textContent = this.escapeHtml(schedule.description);
            } else {
                const newDescEl = document.createElement('div');
                newDescEl.className = 'schedule-description';
                newDescEl.textContent = this.escapeHtml(schedule.description);
                contentEl.appendChild(newDescEl);
            }
        } else if (descEl) {
            descEl.remove();
        }
    }

    // 스케줄 모달 열기
    openScheduleModal(schedule = null) {
        this.editingSchedule = schedule;
        
        const modal = document.getElementById('modalOverlay');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('scheduleForm');
        
        // 모달 제목 설정
        title.textContent = schedule ? i18n.t('modal.editTitle') : i18n.t('modal.addTitle');
        
        // 폼 초기화 또는 데이터 채우기
        if (schedule) {
            document.getElementById('scheduleTime').value = schedule.time;
            document.getElementById('scheduleTitle').value = schedule.title;
            document.getElementById('scheduleDescription').value = schedule.description || '';
            document.getElementById('enableNotification').checked = schedule.notificationEnabled;
            
            // 수정 모드에서는 동일한 활동명을 가진 모든 요일 체크
            const allData = storage.getData();
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const daysWithSameTitle = days.filter(day => 
                allData.schedules[day].some(s => s.title === schedule.title)
            );
            
            document.querySelectorAll('.day-checkbox').forEach(cb => {
                cb.checked = daysWithSameTitle.includes(cb.value);
            });
        } else {
            form.reset();
            // 현재 시간을 기본값으로 설정
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            document.getElementById('scheduleTime').value = currentTime;
            
            // 새 스케줄은 현재 요일만 체크
            document.querySelectorAll('.day-checkbox').forEach(cb => {
                cb.checked = cb.value === this.currentDay;
            });
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

        // 선택된 요일 가져오기
        const selectedDays = Array.from(document.querySelectorAll('.day-checkbox:checked'))
            .map(cb => cb.value);

        if (!time || !title) {
            this.showToast(i18n.t('toast.fillRequired'), 'error');
            return;
        }

        if (selectedDays.length === 0) {
            this.showToast(i18n.t('toast.selectDays'), 'error');
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
            // 수정 - 활동명 기준으로 모든 요일의 동일 스케줄 일괄 수정
            const originalTitle = this.editingSchedule.title;
            const updatedCount = storage.updateScheduleByTitle(originalTitle, scheduleData);
            
            if (updatedCount > 0) {
                success = true;
                const dayText = updatedCount + i18n.t('toast.dayCount');
                this.showToast(dayText + i18n.t('toast.scheduleUpdated'), 'success');
                
                // 알림 업데이트 - 모든 요일에 대해
                const allData = storage.getData();
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                
                days.forEach(day => {
                    const schedules = allData.schedules[day].filter(s => s.title === scheduleData.title);
                    schedules.forEach(schedule => {
                        if (notificationEnabled) {
                            notificationManager.scheduleNotification(day, schedule);
                        } else {
                            notificationManager.cancelNotification(schedule.id);
                        }
                    });
                });
            }
        } else {
            // 추가 - 선택된 모든 요일에 스케줄 추가
            let addedCount = 0;
            selectedDays.forEach(day => {
                const newSchedule = storage.addSchedule(day, scheduleData);
                if (newSchedule) {
                    addedCount++;
                    // 알림 설정
                    if (notificationEnabled) {
                        notificationManager.scheduleNotification(day, newSchedule);
                    }
                }
            });
            
            if (addedCount > 0) {
                success = true;
                const dayCount = addedCount + i18n.t('toast.dayCount');
                this.showToast(i18n.t('toast.scheduleAdded') + dayCount, 'success');
            }
        }

        if (success) {
            this.closeModal();
            this.renderSchedules();
        } else {
            this.showToast(i18n.t('toast.saveError'), 'error');
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
        if (confirm(i18n.t('toast.deleteConfirm'))) {
            const success = storage.deleteSchedule(this.currentDay, scheduleId);
            if (success) {
                this.showToast(i18n.t('toast.scheduleDeleted'), 'success');
                this.renderSchedules();
                
                // 알림 취소
                notificationManager.cancelNotification(scheduleId);
            }
        }
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

    // 토스트 메시지 표시 (전역 유틸리티 사용)
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        }
    }
}

// DOM이 로드된 후 초기화
let scheduleManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        scheduleManager = new ScheduleManager();
        window.scheduleManager = scheduleManager;
    });
} else {
    // 이미 로드된 경우
    scheduleManager = new ScheduleManager();
    window.scheduleManager = scheduleManager;
}