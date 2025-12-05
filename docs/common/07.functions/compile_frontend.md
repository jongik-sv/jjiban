# compile_frontend() - Frontend 컴파일 공통 함수

## 목적
프로젝트별 Frontend 설정을 참조하여 자동으로 소스를 컴파일합니다.

## 사용법

### 명령어에서 참조
```markdown
**Frontend 컴파일** (필요시):
- 📋 함수 참조: `@docs/common/07.functions/compile_frontend.md`
- 프로젝트 설정: `@docs/common/01.config/{project}/frontend.md`
```

### 호출 방법
```javascript
compile_frontend(project_name)
```

## 실행 로직

### 1단계: 설정 로드
- `docs/common/01.config/{project}/frontend.md` 파일에서 설정 읽기
- `compile_command` 추출

### 2단계: 컴파일 실행
- 프레임워크별 컴파일 명령 실행
- 실시간 출력 모니터링

### 3단계: 결과 검증
- 컴파일 성공 여부 확인
- 에러 발생 시 상세 로그 제공
- 생성된 산출물 경로 확인

## 입력 파라미터
- **project_name** (필수): 프로젝트명 (예: "maru")
- **force** (선택): 강제 재컴파일 여부 (기본값: false)

## 출력 결과
```json
{
  "success": true,
  "output_dir": "./webapp",
  "message": "컴파일 성공",
  "duration": "5.2초"
}
```

## 에러 처리
- 설정 파일 없음: 프로젝트 설정 확인 안내
- 컴파일 실패: 상세 에러 메시지 및 해결 방법 제시
- 권한 오류: 관리자 권한 필요 여부 확인

## 프레임워크별 지원

### Nexacro N
- nexacrodeploy.exe 자동 실행
- xprj 프로젝트 파일 참조
- webapp 폴더로 결과물 생성

### React
- npm run build 실행
- build 폴더로 결과물 생성

### Vue
- npm run build 실행
- dist 폴더로 결과물 생성

## 예시

### Nexacro 프로젝트 컴파일
```markdown
1. 설정 확인: `docs/common/01.config/maru/frontend.md`
2. 명령 실행: nexacrodeploy.exe ...
3. 결과 생성: ./webapp/
```

### React 프로젝트 컴파일
```markdown
1. 설정 확인: `docs/common/01.config/myapp/frontend.md`
2. 명령 실행: npm run build
3. 결과 생성: ./build/
```
