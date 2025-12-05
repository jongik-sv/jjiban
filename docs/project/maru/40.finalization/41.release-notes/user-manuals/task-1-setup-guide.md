# Task 1 개발 환경 구성 및 기반 설정 사용자 매뉴얼

**버전**: 1.0.0
**작성일**: 2025-09-18
**대상 사용자**: 개발자, 시스템 관리자

---

## 📋 목차
1. [개요](#개요)
2. [시스템 요구사항](#시스템-요구사항)
3. [설치 가이드](#설치-가이드)
4. [개발 환경 구성](#개발-환경-구성)
5. [서버 실행 및 관리](#서버-실행-및-관리)
6. [문제 해결](#문제-해결)
7. [자주 묻는 질문](#자주-묻는-질문)

---

## 개요

MARU 시스템은 마스터 코드 및 비즈니스 룰 관리를 위한 통합 플랫폼입니다. 이 매뉴얼은 개발 환경 구성부터 서버 실행까지 전체 프로세스를 안내합니다.

### 시스템 아키텍처
```
Frontend (Nexacro N V24) ↔ Backend (Node.js + Express) ↔ Database (Oracle)
```

### 주요 특징
- 🏗️ **현대적 아키텍처**: Node.js v24.x + Express v5.x
- 🛡️ **보안 강화**: Helmet, CORS, 입력값 검증
- ⚡ **성능 최적화**: 압축, 캐싱, 모니터링
- 📊 **개발도구 통합**: ESLint, Prettier, Jest

---

## 시스템 요구사항

### 필수 요구사항
| 구분 | 최소 버전 | 권장 버전 |
|------|-----------|-----------|
| **Node.js** | v24.0.0 | v24.x LTS |
| **npm** | v10.0.0 | 최신 버전 |
| **Oracle Database** | 21c XE | 21c 이상 |
| **RAM** | 4GB | 8GB 이상 |
| **저장공간** | 2GB | 5GB 이상 |

### 운영체제 지원
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Ubuntu 18.04+

---

## 설치 가이드

### 1단계: Node.js 설치

#### Windows
```bash
# 1. Node.js 공식 사이트에서 LTS 버전 다운로드
# https://nodejs.org/ko/download/

# 2. 설치 확인
node --version  # v24.x.x 출력 확인
npm --version   # v10.x.x 출력 확인
```

#### macOS (Homebrew 사용)
```bash
# 1. Homebrew 설치 (이미 설치된 경우 생략)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js 설치
brew install node@24

# 3. 설치 확인
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
# 1. NodeSource 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -

# 2. Node.js 설치
sudo apt-get install -y nodejs

# 3. 설치 확인
node --version
npm --version
```

### 2단계: Oracle Database 설치

#### Oracle Database 21c XE 설치
```bash
# 1. Oracle 공식 사이트에서 XE 다운로드
# https://www.oracle.com/database/technologies/appdev/xe.html

# 2. 설치 후 서비스 시작 확인
# Windows: services.msc에서 OracleServiceXE 확인
# Linux: sudo systemctl status oracle-xe

# 3. 연결 테스트
sqlplus sys/password@localhost:1521/XE as sysdba
```

#### MARU 사용자 및 스키마 생성
```sql
-- 1. 관리자로 접속하여 사용자 생성
CREATE USER maru IDENTIFIED BY maru;
GRANT CONNECT, RESOURCE, DBA TO maru;
ALTER USER maru QUOTA UNLIMITED ON USERS;

-- 2. 연결 테스트
sqlplus maru/maru@localhost:1521/XE
```

### 3단계: Oracle Instant Client 설치

#### Windows
```bash
# 1. Oracle Instant Client 다운로드
# https://www.oracle.com/database/technologies/instant-client/downloads.html

# 2. 압축 해제 후 환경 변수 설정
# 시스템 환경 변수에 PATH 추가: C:\instantclient_21_x

# 3. 설치 확인
echo $env:PATH | findstr instantclient
```

#### Linux/macOS
```bash
# 1. Instant Client 다운로드 및 설치
wget https://download.oracle.com/otn_software/linux/instantclient/...
sudo unzip instantclient-*.zip -d /opt/oracle/

# 2. 환경 변수 설정
echo 'export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_x:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc

# 3. 설치 확인
ldd --version
```

---

## 개발 환경 구성

### 1단계: 프로젝트 다운로드
```bash
# Git 클론 (예시)
git clone <repository-url> maru_nexacro
cd maru_nexacro
```

### 2단계: 백엔드 환경 구성
```bash
# 1. 백엔드 디렉토리로 이동
cd backend

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 실제 값 입력

# 4. 개발도구 검증
npm run validate
```

### 3단계: 환경 변수 설정
```bash
# .env 파일 편집
NODE_ENV=development
PORT=3000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=1521
DB_SERVICE_NAME=XE
DB_USER=maru
DB_PASSWORD=maru

# 보안 설정
JWT_SECRET=your-super-secret-key-here
CORS_ORIGIN=http://localhost:8000
```

### 4단계: 데이터베이스 연결 테스트
```bash
# 연결 테스트 스크립트 실행
npm run test:db

# 또는 서버 시작으로 연결 확인
npm start
```

---

## 서버 실행 및 관리

### 기본 실행 명령어
```bash
# 1. 프로덕션 모드 실행
npm start

# 2. 개발 모드 실행 (nodemon 사용)
npm run dev

# 3. 테스트 실행
npm test

# 4. 코드 품질 검사
npm run lint

# 5. 코드 포맷팅
npm run format
```

### 서버 상태 확인
```bash
# 1. 헬스체크 엔드포인트
curl http://localhost:3000/health

# 응답 예시:
{
  "status": "healthy",
  "timestamp": "2025-09-18T10:30:00.000Z",
  "uptime": "0:05:23",
  "database": "connected"
}

# 2. 서버 정보
curl http://localhost:3000/

# 응답 예시:
{
  "message": "MARU Backend Server",
  "version": "1.0.0",
  "environment": "development"
}
```

### PM2를 이용한 프로세스 관리 (운영 환경)
```bash
# 1. PM2 글로벌 설치
npm install -g pm2

# 2. 서버 시작
pm2 start src/server.js --name "maru-backend"

# 3. 프로세스 상태 확인
pm2 status

# 4. 로그 확인
pm2 logs maru-backend

# 5. 서버 재시작
pm2 restart maru-backend

# 6. 서버 중지
pm2 stop maru-backend
```

---

## 문제 해결

### 자주 발생하는 문제와 해결방법

#### 1. Oracle Database 연결 실패
**증상**: `NJS-138: connections to this database server version are not supported`

**해결방법**:
```bash
# 1. Oracle Instant Client 설치 확인
echo $LD_LIBRARY_PATH  # Linux/macOS
echo $env:PATH         # Windows

# 2. node-oracledb Thick 모드 활성화
# src/config/database.js 파일에서 확인

# 3. Oracle Database 서비스 상태 확인
# Windows: services.msc
# Linux: sudo systemctl status oracle-xe

# 4. 네트워크 연결 테스트
telnet localhost 1521
```

#### 2. 포트 충돌 문제
**증상**: `EADDRINUSE: address already in use :::3000`

**해결방법**:
```bash
# 1. 포트 사용 프로세스 확인
# Windows
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :3000

# 2. 프로세스 종료
# Windows
taskkill /PID <PID번호> /F

# Linux/macOS
kill -9 <PID번호>

# 3. 또는 다른 포트 사용
# .env 파일에서 PORT=3001로 변경
```

#### 3. npm 의존성 설치 실패
**해결방법**:
```bash
# 1. 캐시 정리
npm cache clean --force

# 2. node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 3. 권한 문제 해결 (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
```

#### 4. ESLint/Prettier 오류
**해결방법**:
```bash
# 1. 자동 수정 시도
npm run lint:fix

# 2. 코드 포맷팅 적용
npm run format

# 3. 설정 파일 확인
cat .eslintrc.js
cat .prettierrc.js
```

### 로그 분석 방법

#### 서버 로그 확인
```bash
# 1. 실시간 로그 확인
npm run dev  # 개발 모드에서 콘솔 로그 출력

# 2. PM2 로그 (운영 환경)
pm2 logs maru-backend

# 3. 특정 로그 레벨 필터링
pm2 logs maru-backend --lines 100 | grep ERROR
```

#### 로그 메시지 해석
```
✅ 정상: 녹색 체크마크가 있는 메시지
⚠️  경고: 주황색 경고 표시가 있는 메시지
❌ 오류: 빨간색 X 표시가 있는 메시지
🔍 정보: 파란색 정보 아이콘이 있는 메시지
```

---

## 자주 묻는 질문

### Q1: 다른 포트에서 서버를 실행할 수 있나요?
**A**: 네, `.env` 파일에서 `PORT=원하는포트번호`로 설정하거나, 실행 시 환경변수로 지정할 수 있습니다.
```bash
PORT=4000 npm start
```

### Q2: 데이터베이스 연결 없이도 서버가 실행되나요?
**A**: 네, 데이터베이스 연결이 실패해도 서버는 시작됩니다. 경고 메시지가 출력되며, 데이터베이스 관련 기능만 제한됩니다.

### Q3: 개발 중에 코드 변경 시 자동 재시작되나요?
**A**: `npm run dev` 명령어를 사용하면 nodemon이 파일 변경을 감지하여 자동으로 서버를 재시작합니다.

### Q4: HTTPS를 사용할 수 있나요?
**A**: 현재 개발 환경에서는 HTTP만 지원합니다. 운영 환경에서는 리버스 프록시(nginx, Apache) 또는 로드 밸런서를 통해 HTTPS를 구성하는 것을 권장합니다.

### Q5: API 문서는 어디서 확인할 수 있나요?
**A**: 현재 기본 엔드포인트만 제공됩니다. 향후 Swagger/OpenAPI 문서가 추가될 예정입니다.
- 기본 정보: `GET /`
- 헬스체크: `GET /health`

### Q6: 성능 모니터링은 어떻게 하나요?
**A**: 기본적인 응답 시간 로깅이 포함되어 있습니다. 추가로 PM2 모니터링을 사용할 수 있습니다:
```bash
pm2 monit
```

### Q7: 백업 및 복원은 어떻게 하나요?
**A**:
- **코드 백업**: Git 저장소 사용
- **데이터베이스 백업**: Oracle export/import 도구 사용
- **설정 파일**: .env 파일 별도 보관 (주의: 민감 정보 포함)

---

## 📞 지원 및 문의

### 기술 지원
- **이슈 트래커**: GitHub Issues (설정된 경우)
- **문서**: `./docs/` 디렉토리의 기술 문서 참조
- **로그**: 문제 발생 시 로그 파일 첨부하여 문의

### 개발팀 연락처
- **개발팀**: MARU Development Team
- **Email**: [개발팀 이메일]
- **Slack**: [개발팀 채널] (설정된 경우)

---

**마지막 업데이트**: 2025-09-18
**매뉴얼 버전**: 1.0.0
**작성자**: MARU Development Team