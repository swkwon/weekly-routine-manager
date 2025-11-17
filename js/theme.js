// 테마 관리 클래스
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    // 초기화
    init() {
        this.loadTheme();
        this.bindEvents();
    }

    // 이벤트 바인딩
    bindEvents() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    // 저장된 테마 로드
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    // 테마 설정
    setTheme(theme) {
        this.currentTheme = theme;
        
        // HTML에 data-theme 속성 설정
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // 아이콘 업데이트
        this.updateThemeIcon();
        
        // localStorage에 저장
        localStorage.setItem('theme', theme);
    }

    // 테마 토글
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // 피드백
        if (window.showToast) {
            window.showToast(
                `${newTheme === 'dark' ? '다크' : '라이트'} 모드로 전환되었습니다`,
                'success'
            );
        }
    }

    // 테마 아이콘 업데이트
    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // 현재 테마 반환
    getTheme() {
        return this.currentTheme;
    }
}

// 전역 themeManager 인스턴스
const themeManager = new ThemeManager();
