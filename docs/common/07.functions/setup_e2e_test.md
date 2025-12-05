# setup_e2e_test() - E2E 테스트 환경 설정 공통 함수

## 목적
E2E 테스트 실행 전 필요한 환경을 자동으로 준비합니다.

## 사용법

### 명령어에서 참조
```markdown
**환경 준비 및 검증**:
- 📋 함수 참조: `@docs/common/07.functions/setup_e2e_test.md`
- 테스트 설정: `@docs/common/01.config/{project}/testing.md`
```

### 호출 방법
```javascript
setup_e2e_test(project_name, task_id)
```

## 실행 로직

### 1단계: 서버 상태 확인
```javascript
// Backend 서버 확인 (포트 3000)
const backendRunning = await checkServer('http://localhost:3000')

// Frontend 개발 서버 확인 (포트 5500)
const frontendRunning = await checkServer('http://127.0.0.1:5500')
```

### 2단계: 서버 미실행 시 처리
- Backend 미실행: 사용자에게 `npm start` 안내
- Frontend 미실행: Live Server 실행 안내

### 3단계: Frontend 컴파일 확인
```javascript
// 필요 시 compile_frontend() 호출
if (needsCompile) {
  await compile_frontend(project_name)
}
```

### 4단계: 테스트 환경 정보 반환
```javascript
{
  "backend_url": "http://localhost:3000",
  "frontend_url": "http://127.0.0.1:5500/webapp/",
  "ready": true
}
```

## 입력 파라미터
- **project_name** (필수): 프로젝트명 (예: "maru")
- **task_id** (선택): Task ID (예: "Task-3-1")

## 출력 결과
```json
{
  "success": true,
  "backend": {
    "running": true,
    "url": "http://localhost:3000"
  },
  "frontend": {
    "running": true,
    "url": "http://127.0.0.1:5500/webapp/"
  },
  "message": "테스트 환경 준비 완료"
}
```

## 에러 처리

### Backend 서버 미실행
```
⚠️ Backend 서버가 실행되지 않았습니다.
다음 명령으로 서버를 실행하세요:
  cd backend
  npm start
```

### Frontend 서버 미실행
```
⚠️ Frontend 개발 서버가 실행되지 않았습니다.
Live Server로 ./webapp/index.html을 실행하세요.
```

### 컴파일 필요
```
ℹ️ Frontend 소스 컴파일이 필요합니다.
compile_frontend() 함수를 호출하여 컴파일을 진행합니다.
```

## 환경 준비 체크리스트
자동으로 다음 항목을 확인합니다:

- [ ] Frontend 소스 컴파일 완료
- [ ] Frontend 개발 서버 실행 (포트 5500)
- [ ] Backend 서버 실행 (포트 3000)
- [ ] 데이터베이스 연결 확인
- [ ] Playwright 설치 확인

## 프레임워크별 지원

### Nexacro N
- Live Server 확인
- nexacrodeploy.exe 컴파일 확인
- webapp 폴더 존재 확인

### React
- npm run start 또는 serve 확인
- build 폴더 존재 확인

### Vue
- npm run serve 확인
- dist 폴더 존재 확인
