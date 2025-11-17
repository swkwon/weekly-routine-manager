// 다국어 지원 클래스
class I18nManager {
    constructor() {
        // translations를 먼저 정의
        this.translations = {
            ko: {
                appTitle: '주간 루틴 매니저',
                themeToggle: '테마 변경',
                notificationToggle: '알림 설정',
                days: {
                    monday: '월',
                    tuesday: '화',
                    wednesday: '수',
                    thursday: '목',
                    friday: '금',
                    saturday: '토',
                    sunday: '일'
                },
                daysFull: {
                    monday: '월요일',
                    tuesday: '화요일',
                    wednesday: '수요일',
                    thursday: '목요일',
                    friday: '금요일',
                    saturday: '토요일',
                    sunday: '일요일'
                },
                scheduleTitle: '스케줄',
                addSchedule: '스케줄 추가',
                emptyState: {
                    line1: '아직 등록된 스케줄이 없습니다.',
                    line2: '스케줄을 추가해보세요!'
                },
                modal: {
                    addTitle: '스케줄 추가',
                    editTitle: '스케줄 수정',
                    time: '시간',
                    activityName: '활동명',
                    activityPlaceholder: '예: 운동, 독서, 요리...',
                    description: '설명 (선택사항)',
                    descriptionPlaceholder: '상세 설명이나 메모...',
                    applyDays: '적용할 요일',
                    selectAll: '모두 체크',
                    enableNotification: '알림 받기',
                    cancel: '취소',
                    save: '저장'
                },
                notification: {
                    title: '알림 허용',
                    message: '스케줄 알림을 받으시겠습니까?',
                    later: '나중에',
                    allow: '허용'
                },
                toast: {
                    selectDays: '최소 1개 이상의 요일을 선택해주세요.',
                    fillRequired: '시간과 활동명을 입력해주세요.',
                    scheduleAdded: '에 스케줄이 추가되었습니다.',
                    scheduleUpdated: '의 스케줄이 수정되었습니다.',
                    scheduleDeleted: '스케줄이 삭제되었습니다.',
                    saveError: '저장 중 오류가 발생했습니다.',
                    deleteConfirm: '이 스케줄을 삭제하시겠습니까?',
                    dayCount: '개 요일'
                },
                buttons: {
                    edit: '수정',
                    delete: '삭제'
                }
            },
            en: {
                appTitle: 'Weekly Routine Manager',
                themeToggle: 'Toggle Theme',
                notificationToggle: 'Notifications',
                days: {
                    monday: 'Mon',
                    tuesday: 'Tue',
                    wednesday: 'Wed',
                    thursday: 'Thu',
                    friday: 'Fri',
                    saturday: 'Sat',
                    sunday: 'Sun'
                },
                daysFull: {
                    monday: 'Monday',
                    tuesday: 'Tuesday',
                    wednesday: 'Wednesday',
                    thursday: 'Thursday',
                    friday: 'Friday',
                    saturday: 'Saturday',
                    sunday: 'Sunday'
                },
                scheduleTitle: 'Schedule',
                addSchedule: 'Add Schedule',
                emptyState: {
                    line1: 'No schedules yet.',
                    line2: 'Add your first schedule!'
                },
                modal: {
                    addTitle: 'Add Schedule',
                    editTitle: 'Edit Schedule',
                    time: 'Time',
                    activityName: 'Activity',
                    activityPlaceholder: 'e.g., Exercise, Reading, Cooking...',
                    description: 'Description (optional)',
                    descriptionPlaceholder: 'Details or notes...',
                    applyDays: 'Apply to Days',
                    selectAll: 'Select All',
                    enableNotification: 'Enable Notification',
                    cancel: 'Cancel',
                    save: 'Save'
                },
                notification: {
                    title: 'Allow Notifications',
                    message: 'Would you like to receive schedule notifications?',
                    later: 'Later',
                    allow: 'Allow'
                },
                toast: {
                    selectDays: 'Please select at least one day.',
                    fillRequired: 'Please enter time and activity name.',
                    scheduleAdded: 'Schedule added to ',
                    scheduleUpdated: 'Schedule updated for ',
                    scheduleDeleted: 'Schedule deleted.',
                    saveError: 'An error occurred while saving.',
                    deleteConfirm: 'Are you sure you want to delete this schedule?',
                    dayCount: ' day(s)'
                },
                buttons: {
                    edit: 'Edit',
                    delete: 'Delete'
                }
            },
            ja: {
                appTitle: '週間ルーティンマネージャー',
                themeToggle: 'テーマ変更',
                notificationToggle: '通知設定',
                days: {
                    monday: '月',
                    tuesday: '火',
                    wednesday: '水',
                    thursday: '木',
                    friday: '金',
                    saturday: '土',
                    sunday: '日'
                },
                daysFull: {
                    monday: '月曜日',
                    tuesday: '火曜日',
                    wednesday: '水曜日',
                    thursday: '木曜日',
                    friday: '金曜日',
                    saturday: '土曜日',
                    sunday: '日曜日'
                },
                scheduleTitle: 'スケジュール',
                addSchedule: 'スケジュール追加',
                emptyState: {
                    line1: 'まだスケジュールがありません。',
                    line2: 'スケジュールを追加してみましょう！'
                },
                modal: {
                    addTitle: 'スケジュール追加',
                    editTitle: 'スケジュール編集',
                    time: '時間',
                    activityName: '活動名',
                    activityPlaceholder: '例：運動、読書、料理...',
                    description: '説明（任意）',
                    descriptionPlaceholder: '詳細説明やメモ...',
                    applyDays: '適用する曜日',
                    selectAll: 'すべて選択',
                    enableNotification: '通知を受け取る',
                    cancel: 'キャンセル',
                    save: '保存'
                },
                notification: {
                    title: '通知を許可',
                    message: 'スケジュール通知を受け取りますか？',
                    later: '後で',
                    allow: '許可'
                },
                toast: {
                    selectDays: '少なくとも1つの曜日を選択してください。',
                    fillRequired: '時間と活動名を入力してください。',
                    scheduleAdded: 'にスケジュールが追加されました。',
                    scheduleUpdated: 'のスケジュールが更新されました。',
                    scheduleDeleted: 'スケジュールが削除されました。',
                    saveError: '保存中にエラーが発生しました。',
                    deleteConfirm: 'このスケジュールを削除しますか？',
                    dayCount: '日'
                },
                buttons: {
                    edit: '編集',
                    delete: '削除'
                }
            },
            zh: {
                appTitle: '每周日程管理器',
                themeToggle: '切换主题',
                notificationToggle: '通知设置',
                days: {
                    monday: '周一',
                    tuesday: '周二',
                    wednesday: '周三',
                    thursday: '周四',
                    friday: '周五',
                    saturday: '周六',
                    sunday: '周日'
                },
                daysFull: {
                    monday: '星期一',
                    tuesday: '星期二',
                    wednesday: '星期三',
                    thursday: '星期四',
                    friday: '星期五',
                    saturday: '星期六',
                    sunday: '星期日'
                },
                scheduleTitle: '日程',
                addSchedule: '添加日程',
                emptyState: {
                    line1: '还没有日程。',
                    line2: '添加您的第一个日程！'
                },
                modal: {
                    addTitle: '添加日程',
                    editTitle: '编辑日程',
                    time: '时间',
                    activityName: '活动名称',
                    activityPlaceholder: '例：运动、阅读、烹饪...',
                    description: '描述（可选）',
                    descriptionPlaceholder: '详细说明或备注...',
                    applyDays: '应用到星期',
                    selectAll: '全选',
                    enableNotification: '启用通知',
                    cancel: '取消',
                    save: '保存'
                },
                notification: {
                    title: '允许通知',
                    message: '您要接收日程通知吗？',
                    later: '稍后',
                    allow: '允许'
                },
                toast: {
                    selectDays: '请至少选择一天。',
                    fillRequired: '请输入时间和活动名称。',
                    scheduleAdded: '已添加日程到',
                    scheduleUpdated: '已更新日程于',
                    scheduleDeleted: '日程已删除。',
                    saveError: '保存时出错。',
                    deleteConfirm: '确定要删除此日程吗？',
                    dayCount: '天'
                },
                buttons: {
                    edit: '编辑',
                    delete: '删除'
                }
            },
            es: {
                appTitle: 'Gestor de Rutina Semanal',
                themeToggle: 'Cambiar Tema',
                notificationToggle: 'Notificaciones',
                days: {
                    monday: 'Lun',
                    tuesday: 'Mar',
                    wednesday: 'Mié',
                    thursday: 'Jue',
                    friday: 'Vie',
                    saturday: 'Sáb',
                    sunday: 'Dom'
                },
                daysFull: {
                    monday: 'Lunes',
                    tuesday: 'Martes',
                    wednesday: 'Miércoles',
                    thursday: 'Jueves',
                    friday: 'Viernes',
                    saturday: 'Sábado',
                    sunday: 'Domingo'
                },
                scheduleTitle: 'Horario',
                addSchedule: 'Agregar Horario',
                emptyState: {
                    line1: 'Aún no hay horarios.',
                    line2: '¡Agrega tu primer horario!'
                },
                modal: {
                    addTitle: 'Agregar Horario',
                    editTitle: 'Editar Horario',
                    time: 'Hora',
                    activityName: 'Actividad',
                    activityPlaceholder: 'ej: Ejercicio, Lectura, Cocina...',
                    description: 'Descripción (opcional)',
                    descriptionPlaceholder: 'Detalles o notas...',
                    applyDays: 'Aplicar a Días',
                    selectAll: 'Seleccionar Todo',
                    enableNotification: 'Habilitar Notificación',
                    cancel: 'Cancelar',
                    save: 'Guardar'
                },
                notification: {
                    title: 'Permitir Notificaciones',
                    message: '¿Desea recibir notificaciones de horarios?',
                    later: 'Más Tarde',
                    allow: 'Permitir'
                },
                toast: {
                    selectDays: 'Seleccione al menos un día.',
                    fillRequired: 'Ingrese la hora y el nombre de la actividad.',
                    scheduleAdded: 'Horario agregado a ',
                    scheduleUpdated: 'Horario actualizado para ',
                    scheduleDeleted: 'Horario eliminado.',
                    saveError: 'Ocurrió un error al guardar.',
                    deleteConfirm: '¿Está seguro de que desea eliminar este horario?',
                    dayCount: ' día(s)'
                },
                buttons: {
                    edit: 'Editar',
                    delete: 'Eliminar'
                }
            }
        };
        
        // translations 정의 후 언어 감지
        this.currentLang = this.detectLanguage();
        this.init();
    }

    // 브라우저 언어 감지
    detectLanguage() {
        const saved = localStorage.getItem('preferredLanguage');
        if (saved && this.translations[saved]) {
            return saved;
        }

        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];

        // 지원하는 언어인지 확인
        if (this.translations[langCode]) {
            return langCode;
        }

        // 기본값은 영어
        return 'en';
    }

    // 초기화
    init() {
        this.applyTranslations();
    }

    // 언어 변경
    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.error(`Language ${lang} not supported`);
            return;
        }

        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        this.applyTranslations();
    }

    // 번역 텍스트 가져오기
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        
        return value;
    }

    // 모든 번역 적용
    applyTranslations() {
        // 앱 제목
        const appTitle = document.querySelector('.app-title');
        if (appTitle) {
            appTitle.innerHTML = '📅\n                ' + this.t('appTitle') + '\n            ';
        }

        // 테마 토글
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.title = this.t('themeToggle');
        }

        // 알림 토글
        const notificationToggleBtn = document.getElementById('notificationToggle');
        if (notificationToggleBtn) {
            const span = notificationToggleBtn.querySelector('span');
            if (span) {
                span.textContent = this.t('notificationToggle');
            }
        }

        // 요일 탭
        document.querySelectorAll('.day-tab').forEach(tab => {
            const day = tab.dataset.day;
            if (day) {
                tab.textContent = this.t(`days.${day}`);
            }
        });

        // 스케줄 추가 버튼
        const addBtn = document.getElementById('addScheduleBtn');
        if (addBtn) {
            addBtn.innerHTML = '➕\n                        ' + this.t('addSchedule') + '\n                    ';
        }

        // 현재 요일 제목
        const currentDayTitle = document.getElementById('currentDayTitle');
        if (currentDayTitle && window.scheduleManager) {
            const day = scheduleManager.currentDay;
            currentDayTitle.textContent = `${this.t(`daysFull.${day}`)} ${this.t('scheduleTitle')}`;
        }

        // 빈 상태
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            const p1 = emptyState.querySelectorAll('p')[0];
            const p2 = emptyState.querySelectorAll('p')[1];
            if (p1) p1.textContent = this.t('emptyState.line1');
            if (p2) p2.textContent = this.t('emptyState.line2');
        }

        // 모달
        this.applyModalTranslations();

        // 알림 모달
        this.applyNotificationModalTranslations();

        // 스케줄 재렌더링 (스케줄이 있는 경우)
        if (window.scheduleManager) {
            scheduleManager.renderSchedules();
        }
    }

    // 모달 번역 적용
    applyModalTranslations() {
        // 폼 라벨
        const labels = {
            scheduleTime: 'modal.time',
            scheduleTitle: 'modal.activityName',
            scheduleDescription: 'modal.description'
        };

        Object.entries(labels).forEach(([id, key]) => {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) {
                label.textContent = this.t(key);
            }
        });

        // 플레이스홀더
        const titleInput = document.getElementById('scheduleTitle');
        if (titleInput) {
            titleInput.placeholder = this.t('modal.activityPlaceholder');
        }

        const descInput = document.getElementById('scheduleDescription');
        if (descInput) {
            descInput.placeholder = this.t('modal.descriptionPlaceholder');
        }

        // 요일 선택 라벨
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            const label = group.querySelector('label:not([for]):not(.checkbox-label)');
            if (label && !label.querySelector('input')) {
                label.textContent = this.t('modal.applyDays');
            }
        });

        // 모두 체크 버튼
        const selectAllBtn = document.getElementById('selectAllDays');
        if (selectAllBtn) {
            selectAllBtn.textContent = this.t('modal.selectAll');
        }

        // 요일 체크박스
        document.querySelectorAll('.day-checkbox').forEach(cb => {
            const label = cb.closest('label');
            const span = label?.querySelector('span:last-child');
            if (span) {
                span.textContent = this.t(`days.${cb.value}`);
            }
        });

        // 알림 활성화 체크박스
        const enableNotifInput = document.getElementById('enableNotification');
        if (enableNotifInput) {
            const label = enableNotifInput.closest('label');
            const span = label?.querySelector('span:not(.checkmark)');
            if (span) {
                span.textContent = this.t('modal.enableNotification');
            }
        }

        // 버튼
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.textContent = this.t('modal.cancel');
        }

        const submitBtn = document.querySelector('#scheduleForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = this.t('modal.save');
        }
    }

    // 알림 모달 번역 적용
    applyNotificationModalTranslations() {
        const notifContent = document.querySelector('.notification-content');
        if (notifContent) {
            const h3 = notifContent.querySelector('h3');
            const p = notifContent.querySelector('p');
            if (h3) h3.textContent = this.t('notification.title');
            if (p) p.textContent = this.t('notification.message');
        }

        const denyBtn = document.getElementById('denyNotification');
        if (denyBtn) {
            denyBtn.textContent = this.t('notification.later');
        }

        const allowBtn = document.getElementById('allowNotification');
        if (allowBtn) {
            allowBtn.textContent = this.t('notification.allow');
        }
    }

    // 현재 언어 가져오기
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 지원 언어 목록
    getSupportedLanguages() {
        return [
            { code: 'ko', name: '한국어' },
            { code: 'en', name: 'English' },
            { code: 'ja', name: '日本語' },
            { code: 'zh', name: '中文' },
            { code: 'es', name: 'Español' }
        ];
    }
}

// 전역 i18n 인스턴스
const i18n = new I18nManager();
window.i18n = i18n;
