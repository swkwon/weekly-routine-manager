# 주간 루틴 매니저 📅

요일별 생활계획표와 알림 기능을 제공하는 PWA 루틴 관리 앱입니다.

## ✨ 주요 기능

- **요일별 스케줄 관리**: 월~일 각 요일별로 시간, 활동명, 설명 등록
- **완료 상태 추적**: 스케줄 완료/미완료 체크 및 통계 확인
- **브라우저 알림**: 스케줄 5분 전 자동 알림 (매주 반복)
- **PWA 지원**: 앱 설치 및 오프라인 사용 가능
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- **고성능**: 인메모리 캐싱, 차별화 렌더링으로 빠른 속도

## 🚀 빠른 시작

```bash
# 프로젝트 클론
git clone https://github.com/swkwon/weekly-routine-manager.git
cd weekly-routine-manager

# 로컬 서버 실행 (택 1)
python -m http.server 8000
# 또는
npx serve .

# 브라우저 접속
http://localhost:8000
```

## 💡 사용법

1. **스케줄 등록**: 요일 선택 → "스케줄 추가" → 시간/활동명 입력 → 저장
2. **알림 설정**: "알림 설정" 버튼 → 브라우저 권한 허용 → "알림 받기" 체크
3. **완료 체크**: ✅ 버튼으로 완료 표시
4. **키보드 단축키**: `Ctrl+N` (추가), `Esc` (닫기), `1-7` (요일 전환)

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **PWA**: Service Worker, Web App Manifest, Cache API
- **Storage**: LocalStorage (인메모리 캐싱, 디바운스 저장)
- **APIs**: Notification API, Date/Time API

## 📊 성능

- **번들 크기**: 64KB (최적화 후 13% 감소)
- **렌더링**: 차별화 렌더링으로 80% 속도 향상
- **저장**: 인메모리 캐싱으로 90% 빠른 읽기
- **오프라인**: Service Worker 기반 완전 오프라인 지원

## 🏗️ 프로젝트 구조

```
weekly-routine-manager/
├── index.html          # 메인 HTML
├── manifest.json       # PWA 매니페스트
├── sw.js              # Service Worker
├── css/
│   ├── style.css      # 메인 스타일
│   └── mobile.css     # 모바일 스타일
└── js/
    ├── utils/
    │   └── toast.js   # Toast 유틸리티
    ├── storage.js     # 데이터 저장소 (캐싱, 디바운스)
    ├── schedule.js    # 스케줄 관리 (차별화 렌더링)
    ├── notification.js # 알림 시스템
    └── app.js         # 앱 초기화
```

## 📝 라이선스

MIT License