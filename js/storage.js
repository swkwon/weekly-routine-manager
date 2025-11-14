// 로컬 스토리지 관리 클래스
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'weekly-routine-data';
        this.cache = null; // 인메모리 캐시
        this.saveTimer = null; // 디바운스 타이머
        this.DEBOUNCE_DELAY = 300; // 300ms 디바운스
        this.init();
    }

    // 초기화
    init() {
        if (!this.getData()) {
            this.setData(this.getDefaultData());
        }
    }

    // 기본 데이터 구조
    getDefaultData() {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const schedules = {};
        
        days.forEach(day => {
            schedules[day] = [];
        });

        return {
            schedules,
            settings: {
                notificationEnabled: false,
                theme: 'light',
                defaultNotificationTime: 5 // 5분 전 알림
            },
            stats: {
                totalSchedules: 0,
                completedSchedules: 0,
                weeklyStats: {}
            }
        };
    }

    // 전체 데이터 가져오기
    getData() {
        // 캐시가 있으면 캐시 반환
        if (this.cache !== null) {
            return this.cache;
        }
        
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const parsedData = data ? JSON.parse(data) : null;
            this.cache = parsedData; // 캐시 저장
            return parsedData;
        } catch (error) {
            console.error('데이터 로드 에러:', error);
            return null;
        }
    }

    // 전체 데이터 저장하기
    setData(data) {
        this.cache = data; // 캐시 업데이트
        
        // 디바운스된 저장
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        
        this.saveTimer = setTimeout(() => {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            } catch (error) {
                console.error('데이터 저장 에러:', error);
            }
        }, this.DEBOUNCE_DELAY);
        
        return true;
    }
    
    // 즉시 저장 (중요한 작업용)
    saveImmediately() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }
        
        if (this.cache !== null) {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cache));
                return true;
            } catch (error) {
                console.error('데이터 저장 에러:', error);
                return false;
            }
        }
        return false;
    }
    
    // 캐시 무효화
    invalidateCache() {
        this.cache = null;
    }

    // 특정 요일의 스케줄 가져오기
    getSchedules(day) {
        const data = this.getData();
        return data?.schedules[day] || [];
    }

    // 특정 요일에 스케줄 추가
    addSchedule(day, schedule) {
        const data = this.getData();
        if (!data) return false;

        const newSchedule = {
            id: this.generateId(),
            time: schedule.time,
            title: schedule.title,
            description: schedule.description || '',
            notificationEnabled: schedule.notificationEnabled || false,
            completed: false,
            createdAt: new Date().toISOString()
        };

        data.schedules[day].push(newSchedule);
        data.stats.totalSchedules++;
        
        // 시간순으로 정렬
        data.schedules[day].sort((a, b) => a.time.localeCompare(b.time));
        
        return this.setData(data) ? newSchedule : null;
    }

    // 스케줄 수정
    updateSchedule(day, scheduleId, updates) {
        const data = this.getData();
        if (!data) return false;

        const scheduleIndex = data.schedules[day].findIndex(s => s.id === scheduleId);
        if (scheduleIndex === -1) return false;

        data.schedules[day][scheduleIndex] = {
            ...data.schedules[day][scheduleIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // 시간순으로 정렬
        data.schedules[day].sort((a, b) => a.time.localeCompare(b.time));
        
        return this.setData(data);
    }

    // 스케줄 삭제
    deleteSchedule(day, scheduleId) {
        const data = this.getData();
        if (!data) return false;

        const originalLength = data.schedules[day].length;
        data.schedules[day] = data.schedules[day].filter(s => s.id !== scheduleId);
        
        if (data.schedules[day].length < originalLength) {
            data.stats.totalSchedules--;
            return this.setData(data);
        }
        
        return false;
    }

    // 스케줄 완료 상태 토글
    toggleScheduleCompletion(day, scheduleId) {
        const data = this.getData();
        if (!data) return false;

        const schedule = data.schedules[day].find(s => s.id === scheduleId);
        if (!schedule) return false;

        const wasCompleted = schedule.completed;
        schedule.completed = !wasCompleted;
        schedule.completedAt = schedule.completed ? new Date().toISOString() : null;

        // 통계 업데이트
        if (schedule.completed && !wasCompleted) {
            data.stats.completedSchedules++;
        } else if (!schedule.completed && wasCompleted) {
            data.stats.completedSchedules--;
        }

        return this.setData(data);
    }

    // 설정 가져오기
    getSettings() {
        const data = this.getData();
        return data?.settings || this.getDefaultData().settings;
    }

    // 설정 업데이트
    updateSettings(updates) {
        const data = this.getData();
        if (!data) return false;

        data.settings = {
            ...data.settings,
            ...updates
        };

        return this.setData(data);
    }

    // 통계 가져오기
    getStats() {
        const data = this.getData();
        return data?.stats || this.getDefaultData().stats;
    }

    // 주간 통계 업데이트
    updateWeeklyStats() {
        const data = this.getData();
        if (!data) return false;

        const weekKey = this.getCurrentWeekKey();
        const dayStats = {};

        Object.keys(data.schedules).forEach(day => {
            const schedules = data.schedules[day];
            const completed = schedules.filter(s => s.completed).length;
            const total = schedules.length;
            
            dayStats[day] = {
                total,
                completed,
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        });

        data.stats.weeklyStats[weekKey] = dayStats;
        return this.setData(data);
    }

    // 오늘의 스케줄 가져오기
    getTodaySchedules() {
        const today = this.getCurrentDay();
        return this.getSchedules(today);
    }

    // 현재 요일 가져오기 (영어)
    getCurrentDay() {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = new Date().getDay();
        return days[today];
    }

    // 현재 주 키 생성
    getCurrentWeekKey() {
        const now = new Date();
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        startOfWeek.setDate(diff);
        
        return `${startOfWeek.getFullYear()}-W${this.getWeekNumber(startOfWeek)}`;
    }

    // 주차 계산
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    // 고유 ID 생성
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 데이터 초기화
    clearAllData() {
        this.invalidateCache();
        localStorage.removeItem(this.STORAGE_KEY);
        this.init();
    }

    // 데이터 내보내기 (JSON)
    exportData() {
        this.saveImmediately(); // 내보내기 전 즉시 저장
        const data = this.getData();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weekly-routine-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 데이터 가져오기 (JSON)
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (this.validateData(data)) {
                        this.invalidateCache(); // 캐시 무효화
                        this.setData(data);
                        this.saveImmediately(); // 즉시 저장
                        resolve(true);
                    } else {
                        reject(new Error('유효하지 않은 데이터 형식입니다.'));
                    }
                } catch (error) {
                    reject(new Error('파일을 읽을 수 없습니다.'));
                }
            };
            reader.onerror = () => reject(new Error('파일 읽기 오류'));
            reader.readAsText(file);
        });
    }

    // 데이터 유효성 검사
    validateData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.schedules || typeof data.schedules !== 'object') return false;
        if (!data.settings || typeof data.settings !== 'object') return false;
        if (!data.stats || typeof data.stats !== 'object') return false;
        
        const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return requiredDays.every(day => Array.isArray(data.schedules[day]));
    }
}

// 전역 storage 인스턴스
const storage = new StorageManager();