# MARU 통합 테스트 마스터 템플릿

## 📋 프로젝트 정보
- **프로젝트**: MARU (Master Code and Rule Management System)
- **검증 날짜**: [YYYY-MM-DD]
- **검증자**: [이름]
- **개발 버전**: [v1.0]

---

## 📚 Task별 검증 현황

### Frontend Tasks
| Task ID | Task 명 | 상태 | 완료일 | 비고 |
|---------|---------|------|--------|------|
| Task 1.1 | 데이터베이스 설계 및 마이그레이션 | ☐ | [    ] | DB 스키마 |
| Task 1.2 | 백엔드 핵심 인프라 구현 | ☐ | [    ] | Express, Repository |
| Task 1.3 | Frontend Project Initialization | ☐ | [    ] | Vue3, PrimeVue |
| Task 1.4 | 기본 레이아웃 및 네비게이션 | ☐ | [    ] | Layout, Navigation |

### Backend Tasks  
| Task ID | Task 명 | 상태 | 완료일 | 비고 |
|---------|---------|------|--------|------|
| Task 2.1 | 코드세트 API 엔드포인트 구현 | ☐ | [    ] | REST API 5개 |
| Task 2.2 | 룰세트 API 엔드포인트 구현 | ☐ | [    ] | Rule Engine |
| Task 2.3 | 데이터 검증 및 무결성 | ☐ | [    ] | Validation |
| Task 2.4 | 캐시 및 성능 최적화 | ☐ | [    ] | Caching |

---

## 🎯 통합 시나리오 테스트

### 시나리오 1: 코드세트 전체 라이프사이클

#### Frontend + Backend 통합 테스트
```bash
echo "🔄 시나리오 1: 코드세트 전체 라이프사이클"

# 1. Frontend에서 코드세트 생성 페이지 접근
echo "1️⃣ Frontend 코드세트 생성 페이지 테스트"
npx playwright test --grep "코드세트 생성" --reporter=line

# 2. Backend API로 코드세트 생성
echo "2️⃣ Backend API 코드세트 생성 테스트" 
TEST_MARU_ID="INTEGRATION_TEST_$(date +%s)"
curl -X POST "http://localhost:3000/api/v1/codesets" \
  -H "Content-Type: application/json" \
  -d '{
    "header": {
      "maruId": "'$TEST_MARU_ID'",
      "maruName": "통합테스트용 코드세트",
      "priorityUseYn": "N"
    },
    "categories": [
      {
        "categoryId": "INTEGRATION_CAT",
        "categoryName": "통합테스트 카테고리",
        "codeType": "Normal", 
        "codeDefinition": "ACTIVE,INACTIVE,PENDING"
      }
    ],
    "codes": [
      {
        "code": "ACTIVE",
        "codeName": "활성",
        "sortOrder": 1
      },
      {
        "code": "INACTIVE", 
        "codeName": "비활성",
        "sortOrder": 2
      }
    ]
  }'

# 3. Frontend에서 생성된 코드세트 확인
echo "3️⃣ Frontend에서 생성 결과 확인"
npx playwright test --grep "코드세트 목록" --reporter=line

# 4. Backend에서 상태 변경
echo "4️⃣ Backend 상태 변경 테스트"
curl -X PUT "http://localhost:3000/api/v1/codesets/$TEST_MARU_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "INUSE"}'

# 5. Frontend에서 상태 변경 결과 확인
echo "5️⃣ Frontend에서 상태 변경 확인"
npx playwright test --grep "상태 변경" --reporter=line

echo "✅ 시나리오 1 완료"
```

#### 시나리오 1 검증 체크리스트
- [ ] Frontend 코드세트 생성 페이지가 정상적으로 표시됨
- [ ] Backend API로 코드세트가 성공적으로 생성됨
- [ ] Frontend에서 생성된 코드세트가 목록에 나타남
- [ ] Backend API로 상태 변경이 성공함
- [ ] Frontend에서 변경된 상태가 반영되어 표시됨
- [ ] DB에서 이력 데이터가 정확히 생성됨

---

### 시나리오 2: 룰세트 생성 및 실행

#### Frontend + Backend 통합 테스트
```bash
echo "🧠 시나리오 2: 룰세트 생성 및 실행"

# 1. Backend API로 룰세트 생성
echo "1️⃣ 룰세트 생성"
RULE_MARU_ID="RULE_INTEGRATION_$(date +%s)"
curl -X POST "http://localhost:3000/api/v1/rulesets" \
  -H "Content-Type: application/json" \
  -d '{
    "header": {
      "maruId": "'$RULE_MARU_ID'",
      "maruName": "통합테스트 룰세트"
    },
    "variables": [
      {
        "variableName": "AMOUNT",
        "dataType": "Number",
        "variableType": "OP",
        "sequence": 1
      },
      {
        "variableName": "APPROVER", 
        "dataType": "String",
        "variableType": "RSLT",
        "sequence": 1
      }
    ],
    "rules": [
      {
        "priority": 1,
        "ruleName": "고액승인룰",
        "op1Condition": "GreaterEqual",
        "op1Value": "1000000",
        "rslt1": "CEO"
      }
    ]
  }'

# 2. Frontend에서 룰세트 목록 확인
echo "2️⃣ Frontend 룰세트 목록 확인"
npx playwright test --grep "룰세트" --reporter=line

# 3. Backend API로 룰 실행
echo "3️⃣ 룰 실행 테스트"
curl -X POST "http://localhost:3000/api/v1/rulesets/$RULE_MARU_ID/execute" \
  -H "Content-Type: application/json" \
  -d '{"AMOUNT": "1500000"}'

# 4. Frontend에서 룰 실행 기능 테스트
echo "4️⃣ Frontend 룰 실행 기능"
npx playwright test --grep "룰 실행" --reporter=line

echo "✅ 시나리오 2 완료"
```

#### 시나리오 2 검증 체크리스트
- [ ] Backend API로 룰세트가 성공적으로 생성됨
- [ ] Frontend에서 룰세트 목록이 정상 표시됨
- [ ] Backend 룰 실행 API가 올바른 결과를 반환함
- [ ] Frontend 룰 실행 기능이 정상 동작함
- [ ] 룰 실행 결과가 Frontend에 정확히 표시됨

---

### 시나리오 3: 전체 시스템 부하 테스트

#### 동시성 및 성능 테스트
```bash
echo "⚡ 시나리오 3: 전체 시스템 부하 테스트"

# 1. Frontend 부하 테스트 (Playwright 동시 실행)
echo "1️⃣ Frontend 동시 접속 테스트"
for i in {1..5}; do
  npx playwright test --workers=1 &
done
wait

# 2. Backend API 부하 테스트
echo "2️⃣ Backend API 동시 요청 테스트"
for i in {1..10}; do
  curl -s "http://localhost:3000/api/v1/codesets" > /dev/null &
done
wait

# 3. 혼합 부하 테스트 (Frontend + Backend)
echo "3️⃣ 혼합 부하 테스트"
# Frontend 접속
npx playwright test --workers=2 &
# 동시에 Backend API 호출
for i in {1..5}; do
  curl -s "http://localhost:3000/api/v1/codesets" > /dev/null &
  curl -s "http://localhost:3000/api/v1/rulesets" > /dev/null &
done
wait

echo "✅ 시나리오 3 완료"
```

#### 시나리오 3 검증 체크리스트
- [ ] Frontend 동시 접속 시 응답 시간 3초 이내
- [ ] Backend API 동시 요청 처리 정상
- [ ] 혼합 부하 상황에서 시스템 안정성 유지
- [ ] 메모리 사용량 512MB 이하 유지
- [ ] CPU 사용률 80% 이하 유지

---

## 🔍 크로스 브라우저 통합 테스트

### 브라우저별 전체 기능 테스트
```bash
# Chrome에서 전체 시나리오
echo "🌐 Chrome 통합 테스트"
npx playwright test --project=chromium --reporter=html

# Firefox에서 전체 시나리오  
echo "🌐 Firefox 통합 테스트"
npx playwright test --project=firefox --reporter=html

# Safari에서 전체 시나리오
echo "🌐 Safari 통합 테스트" 
npx playwright test --project=webkit --reporter=html
```

### 브라우저 호환성 결과
| 브라우저 | 기본 기능 | 코드세트 관리 | 룰세트 관리 | 전체 상태 |
|----------|-----------|---------------|-------------|-----------|
| Chrome | ☐ | ☐ | ☐ | ☐ |
| Firefox | ☐ | ☐ | ☐ | ☐ |
| Safari | ☐ | ☐ | ☐ | ☐ |
| Edge | ☐ | ☐ | ☐ | ☐ |

---

## 📊 전체 시스템 검증 결과

### 기능적 요구사항 충족도
| 기능 영역 | 요구사항 | 구현 완료 | 테스트 통과 | 완성도 |
|----------|----------|-----------|-------------|--------|
| 데이터베이스 | SQLite 스키마, 이력관리 | ☐ | ☐ | [  ]% |
| Backend API | 10개+ REST API | ☐ | ☐ | [  ]% |
| Frontend UI | Vue3 + PrimeVue | ☐ | ☐ | [  ]% |
| 코드세트 관리 | CRUD + 상태관리 | ☐ | ☐ | [  ]% |
| 룰세트 관리 | 룰 생성/실행 | ☐ | ☐ | [  ]% |
| 이력 추적 | 선분이력, 버전관리 | ☐ | ☐ | [  ]% |
| 캐시 시스템 | Node-cache 5분 TTL | ☐ | ☐ | [  ]% |
| 성능 요구사항 | <200ms API, <3s UI | ☐ | ☐ | [  ]% |

### 비기능적 요구사항 충족도
| 항목 | 목표 | 측정값 | 달성여부 |
|------|------|--------|---------|
| API 응답시간 | <200ms | [  ]ms | ☐ |
| UI 로딩시간 | <3s | [  ]s | ☐ |
| 메모리 사용량 | <512MB | [  ]MB | ☐ |
| 동시 사용자 | 100명 | [  ]명 | ☐ |
| 브라우저 호환성 | 4개 주요 브라우저 | [  ]/4 | ☐ |
| 반응형 지원 | 모바일~데스크톱 | [  ]/3 | ☐ |

### 품질 지표
| 지표 | 목표 | 측정값 | 상태 |
|------|------|--------|------|
| 버그 밀도 | <5개/KLOC | [  ]개 | ☐ |
| 코드 커버리지 | >80% | [  ]% | ☐ |
| API 오류율 | <1% | [  ]% | ☐ |
| 사용자 만족도 | >4.0/5.0 | [  ]/5.0 | ☐ |

---

## 🚨 이슈 및 리스크 관리

### Critical Issues (시스템 중단급)
1. [이슈 설명]
   - **발견 위치**: [Frontend/Backend/DB]
   - **재현 단계**: [단계별 설명]
   - **해결 방안**: [구체적 수정 사항]
   - **담당자**: [이름]
   - **목표 해결일**: [날짜]

### Major Issues (주요 기능 영향)
1. [이슈 설명]
2. [이슈 설명]

### Minor Issues (개선 사항)
1. [이슈 설명]
2. [이슈 설명]

### 향후 개발 고려사항
1. **확장성**: Oracle 마이그레이션 대비
2. **보안**: 인증/권한 시스템 도입
3. **모니터링**: APM 도구 연동
4. **다국어**: i18n 지원 준비

---

## ✅ 최종 승인 결정

### 승인 기준별 평가

#### 기술적 완성도
- [ ] 모든 핵심 기능 구현 완료
- [ ] API 설계서 요구사항 100% 충족
- [ ] UI/UX 설계서 요구사항 90% 이상 충족
- [ ] 데이터베이스 무결성 검증 통과
- [ ] 성능 요구사항 달성

#### 품질 보증
- [ ] 모든 자동화 테스트 통과
- [ ] 수동 테스트 90% 이상 통과
- [ ] Critical/Major 이슈 0건
- [ ] 브라우저 호환성 확보
- [ ] 보안 기본 요구사항 충족

#### 운영 준비도
- [ ] 배포 스크립트 준비
- [ ] 운영 문서 작성
- [ ] 사용자 매뉴얼 작성
- [ ] 백업/복구 절차 준비

### 최종 결정
```
MARU 시스템 PoC 개발 결과 최종 평가

[개발 완성도]: ____%
- Frontend: ____%  
- Backend: ____%
- Integration: ____%

[품질 수준]: ☐ 우수 ☐ 양호 ☐ 보통 ☐ 미흡

[승인 결정]
☐ 최종 승인 (운영 배포 승인)
  - 조건: 없음
  
☐ 조건부 승인 (명시된 이슈 해결 후 승인)
  - 조건: [구체적 조건 명시]
  - 재검토 일정: [날짜]
  
☐ 재개발 필요 (주요 이슈로 인한 추가 개발)
  - 사유: [구체적 사유]
  - 재개발 범위: [범위]
  - 재검토 일정: [날짜]

[특이사항]
- 
- 
```

**최종 검수자**: _________________ **날짜**: _________________  
**프로젝트 책임자**: _________________ **날짜**: _________________

---

## 🚀 실행 스크립트

### 전체 통합 테스트 실행
```bash
#!/bin/bash
echo "🎯 MARU 전체 통합 테스트 시작..."

# 1. 환경 확인
echo "🔍 환경 확인..."
curl -f http://localhost:3000/health && echo "✅ Backend OK" || echo "❌ Backend 실행 필요"
curl -f http://localhost:5173 && echo "✅ Frontend OK" || echo "❌ Frontend 실행 필요"

# 2. 시나리오별 테스트 실행
echo "📋 시나리오 1: 코드세트 라이프사이클"
./test-scenario-1-codeset.sh

echo "🧠 시나리오 2: 룰세트 생성 및 실행" 
./test-scenario-2-ruleset.sh

echo "⚡ 시나리오 3: 부하 테스트"
./test-scenario-3-load.sh

# 3. 크로스 브라우저 테스트
echo "🌐 크로스 브라우저 테스트"
npx playwright test --reporter=html

# 4. 최종 보고서 생성
echo "📊 최종 보고서 생성"
./generate-integration-report.sh

echo "🏁 MARU 통합 테스트 완료!"
echo "📝 상세 결과는 reports/integration-test-report.html을 확인하세요."
```

### 개별 시나리오 스크립트
```bash
# 개별 시나리오 실행
./test-scenario-1-codeset.sh      # 코드세트 전체 흐름
./test-scenario-2-ruleset.sh      # 룰세트 전체 흐름  
./test-scenario-3-load.sh         # 성능/부하 테스트
./test-cross-browser.sh           # 브라우저 호환성
./test-mobile-responsive.sh       # 모바일 반응형
```