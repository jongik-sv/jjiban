# Backend Task 검증 템플릿

## 📋 Task 정보
- **Task ID**: [Task 2.X]
- **Task 명**: [코드세트 API 엔드포인트 구현]
- **검증 날짜**: [YYYY-MM-DD]
- **검증자**: [이름]
- **개발 완료 확인**: ☐ Yes / ☐ No

---

## 🔧 테스트 환경 설정

### 사전 준비
```bash
# 1. Backend 서버 실행 확인
npm run dev  # http://localhost:3000

# 2. 데이터베이스 상태 확인
sqlite3 data/maru.db ".tables"
sqlite3 data/maru.db "SELECT COUNT(*) FROM TB_MR_HEAD;"

# 3. Health Check
curl -f http://localhost:3000/health || echo "❌ 서버 응답 없음"
```

---

## 🌐 API 엔드포인트 검증

### 1. GET /api/v1/codesets - 목록 조회

#### TC-001: 기본 목록 조회 테스트
**📋 테스트 대상**: 코드세트 목록 조회 API (페이징 기본값)
**🔧 테스트 방법**: 
```bash
# 1. 전체 목록 조회 (페이징 기본값: page=1, size=20)
curl -X GET "http://localhost:3000/api/v1/codesets" \
  -H "Content-Type: application/json" \
  | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `200 OK`
- 응답 구조: `{"success": true, "data": [...], "meta": {...}}`
- `data`: 배열 형태, 최대 20개 항목
- `meta.pagination`: `{page, size, total, totalPages}` 포함
- 각 데이터 항목: `{maruId, maruName, status, createdDate}` 포함
- 응답 시간: < 200ms

**✅ 실행 결과**: ☐ 통과 / ☐ 실패
**응답 시간**: [  ] ms **HTTP Status**: [  ]

#### TC-002: 페이징 파라미터 테스트
**📋 테스트 대상**: 목록 조회 API의 페이징 기능
**🔧 테스트 방법**: 
```bash
# 페이징 파라미터로 제한된 목록 조회
curl -X GET "http://localhost:3000/api/v1/codesets?page=1&size=10" \
  -H "Content-Type: application/json" \
  | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `200 OK`
- `data` 배열 길이: 10개 이하
- `meta.pagination.page`: `1`
- `meta.pagination.size`: `10`
- `meta.pagination.total`: 전체 개수 (숫자)
- `meta.pagination.totalPages`: 계산된 총 페이지 수

**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### TC-003: 필터링 기능 테스트
**📋 테스트 대상**: 목록 조회 API의 상태별/이름별 필터링
**🔧 테스트 방법**: 
```bash
# 3-1. 상태별 필터링
curl -X GET "http://localhost:3000/api/v1/codesets?status=CREATED" \
  -H "Content-Type: application/json" \
  | jq .

# 3-2. 이름 검색 필터링
curl -X GET "http://localhost:3000/api/v1/codesets?name=TEST" \
  -H "Content-Type: application/json" \
  | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `200 OK`
- 상태 필터링: 모든 결과의 `status` 필드가 `"CREATED"`
- 이름 필터링: 모든 결과의 `maruName` 필드에 `"TEST"` 포함
- 필터링 결과가 없을 경우: 빈 배열 `[]` 반환

**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### TC-004: 정렬 기능 테스트
**📋 테스트 대상**: 목록 조회 API의 정렬 기능
**🔧 테스트 방법**: 
```bash
# 마루 이름 기준 내림차순 정렬
curl -X GET "http://localhost:3000/api/v1/codesets?sortBy=maruName&sortOrder=desc" \
  -H "Content-Type: application/json" \
  | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `200 OK`
- 결과가 `maruName` 기준 내림차순으로 정렬됨
- 첫 번째 항목의 `maruName` ≥ 두 번째 항목의 `maruName` (사전순)
- 빈 결과인 경우에도 정상 응답 구조 유지

**✅ 실행 결과**: ☐ 통과 / ☐ 실패

---

### 2. GET /api/v1/codesets/{maruId} - 상세 조회

#### TC-005: 정상 상세 조회 테스트
**📋 테스트 대상**: 특정 코드세트의 상세 정보 조회 (헤더+카테고리+코드)
**🔧 테스트 방법**: 
```bash
# 존재하는 코드세트의 전체 정보 조회
curl -X GET "http://localhost:3000/api/v1/codesets/TEST_CODESET" \
  -H "Content-Type: application/json" \
  | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `200 OK`
- 응답 구조: `{"success": true, "data": {...}}`
- `data.header`: `{maruId, maruName, status, version, createdDate, ...}`
- `data.categories`: 배열, 각 항목에 `{categoryId, categoryName, codeType, codeDefinition}`
- `data.codes`: 배열, 각 항목에 `{code, codeName, sortOrder, alterName1-5}`
- 응답 시간: < 200ms

**✅ 실행 결과**: ☐ 통과 / ☐ 실패
**응답 시간**: [  ] ms

#### TC-006: 버전별 조회 테스트
**📋 테스트 대상**: 특정 버전의 코드세트 정보 조회
**🔧 테스트 방법**: 
```bash
# 특정 버전(v1) 코드세트 조회
curl -X GET "http://localhost:3000/api/v1/codesets/TEST_CODESET?version=1" \
  -H "Content-Type: application/json" \
  | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `200 OK`
- `data.header.version`: `1`
- 해당 버전의 정확한 데이터 반환
- 존재하지 않는 버전 요청 시: `404 Not Found`

**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### TC-007: 시점별 조회 테스트 (AsOf)
**📋 테스트 대상**: 특정 시점의 코드세트 상태 조회
**🔧 테스트 방법**: 
```bash
# 특정 시점(2025-01-01) 기준 코드세트 조회
curl -X GET "http://localhost:3000/api/v1/codesets/TEST_CODESET?asOf=2025-01-01" \
  -H "Content-Type: application/json" \
  | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `200 OK`
- 해당 시점에 유효했던 버전의 데이터 반환
- 시점 이전 데이터가 없는 경우: `404 Not Found`
- asOf 날짜 형식 오류 시: `400 Bad Request`

**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### TC-008: 존재하지 않는 코드세트 조회 테스트
**📋 테스트 대상**: 404 오류 처리 및 친화적 오류 메시지
**🔧 테스트 방법**: 
```bash
# 존재하지 않는 마루ID로 조회 시도
curl -X GET "http://localhost:3000/api/v1/codesets/NOT_EXIST_ID" \
  -H "Content-Type: application/json" \
  | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `404 Not Found`
- 응답 구조: `{"success": false, "error": {...}}`
- `error.message`: 사용자 친화적 메시지 (예: "코드세트를 찾을 수 없습니다")
- `error.code`: 오류 코드 (예: "CODESET_NOT_FOUND")

**✅ 실행 결과**: ☐ 통과 / ☐ 실패

---

### 3. POST /api/v1/codesets - 생성

#### TC-009: 정상 코드세트 생성 테스트
**📋 테스트 대상**: 완전한 코드세트 생성 (헤더+카테고리+코드)
**🔧 테스트 방법**: 
```bash
# 헤더, 카테고리, 코드를 포함한 완전한 코드세트 생성
curl -X POST "http://localhost:3000/api/v1/codesets" \
  -H "Content-Type: application/json" \
  -d '{
    "header": {
      "maruId": "AUTO_TEST_001",
      "maruName": "자동테스트 코드세트",
      "priorityUseYn": "N"
    },
    "categories": [
      {
        "categoryId": "STATUS_CD",
        "categoryName": "상태코드",
        "codeType": "Normal",
        "codeDefinition": "A,B,C,D"
      }
    ],
    "codes": [
      {
        "code": "A",
        "codeName": "활성",
        "sortOrder": 1,
        "alterName1": "Active"
      },
      {
        "code": "B", 
        "codeName": "비활성",
        "sortOrder": 2,
        "alterName1": "Inactive"
      }
    ]
  }' | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `201 Created`
- 응답 구조: `{"success": true, "data": {...}}`
- `data`: 생성된 코드세트의 완전한 정보 (헤더+카테고리+코드)
- DB에서 실제 데이터 생성 확인 가능
- 초기 상태: `status = "CREATED"`
- 응답 시간: < 500ms

**✅ 실행 결과**: ☐ 통과 / ☐ 실패
**응답 시간**: [  ] ms **HTTP Status**: [  ]

#### TC-010: 필수값 누락 검증 테스트
**📋 테스트 대상**: 입력 데이터 유효성 검증 (필수값 누락)
**🔧 테스트 방법**: 
```bash
# 필수값(maruId) 누락된 요청
curl -X POST "http://localhost:3000/api/v1/codesets" \
  -H "Content-Type: application/json" \
  -d '{
    "header": {
      "maruName": "이름만 있는 테스트"
    }
  }' | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `400 Bad Request`
- 응답 구조: `{"success": false, "error": {...}}`
- `error.details`: 검증 실패한 필드 정보 배열
- `error.message`: "필수 입력값이 누락되었습니다" 등 친화적 메시지

**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### TC-011: 중복 마루ID 검증 테스트
**📋 테스트 대상**: 마루ID 중복 검증 (유니크 제약조건)
**🔧 테스트 방법**: 
```bash
# 이미 존재하는 마루ID로 중복 생성 시도
curl -X POST "http://localhost:3000/api/v1/codesets" \
  -H "Content-Type: application/json" \
  -d '{
    "header": {
      "maruId": "AUTO_TEST_001",
      "maruName": "중복 테스트"
    },
    "categories": [],
    "codes": []
  }' | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `409 Conflict`
- `error.code`: "DUPLICATE_MARU_ID" 등
- `error.message`: "이미 존재하는 마루 ID입니다" 등 명확한 메시지

**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### TC-012: 카테고리-코드 정합성 검증 테스트
**📋 테스트 대상**: 카테고리 정의와 코드 값의 일치성 검증
**🔧 테스트 방법**: 
```bash
# 카테고리 정의(A,B,C)에 없는 코드(X) 포함하여 생성 시도
curl -X POST "http://localhost:3000/api/v1/codesets" \
  -H "Content-Type: application/json" \
  -d '{
    "header": {
      "maruId": "VALIDATION_TEST",
      "maruName": "검증 테스트"
    },
    "categories": [
      {
        "categoryId": "STATUS_CD",
        "categoryName": "상태코드", 
        "codeType": "Normal",
        "codeDefinition": "A,B,C"
      }
    ],
    "codes": [
      {
        "code": "X",
        "codeName": "허용되지않은코드",
        "sortOrder": 1
      }
    ]
  }' | jq .
```

**✅ 테스트 통과조건**:
- HTTP Status Code: `422 Unprocessable Entity`
- `error.code`: "VALIDATION_FAILED" 등
- `error.details`: 부일치하는 코드 정보
- `error.message`: "카테고리 정의에 없는 코드가 포함되었습니다" 등

**✅ 실행 결과**: ☐ 통과 / ☐ 실패

---

### 4. PUT /api/v1/codesets/{maruId}/status - 상태 변경

#### CREATED → INUSE 변경
```bash
# 1. 정상 상태 변경
curl -X PUT "http://localhost:3000/api/v1/codesets/AUTO_TEST_001/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INUSE",
    "effectiveDate": "2025-09-11T00:00:00Z"
  }' | jq .

# 예상: 200 OK + 업데이트된 헤더 정보
```
**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### INUSE → DEPRECATED 변경
```bash
# 2. DEPRECATED로 변경
curl -X PUT "http://localhost:3000/api/v1/codesets/AUTO_TEST_001/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DEPRECATED",
    "effectiveDate": "2025-12-31T23:59:59Z"
  }' | jq .
```
**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### 잘못된 상태 전환 테스트
```bash
# 3. DEPRECATED → CREATED (불가능한 전환)
curl -X PUT "http://localhost:3000/api/v1/codesets/AUTO_TEST_001/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CREATED"
  }' | jq .

# 예상: 409 Conflict + 상태 전환 오류
```
**✅ 실행 결과**: ☐ 통과 / ☐ 실패

---

### 5. GET /api/v1/codesets/{maruId}/history - 이력 조회

#### 전체 이력 조회
```bash
# 1. 전체 이력 조회
curl -X GET "http://localhost:3000/api/v1/codesets/AUTO_TEST_001/history" \
  -H "Content-Type: application/json" \
  | jq .

# ✅ 확인사항:
# - 모든 버전 정보 포함
# - 시간순 정렬
# - START_DATE/END_DATE 정확함
```
**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### 기간별 이력 조회
```bash
# 2. 특정 기간 이력 조회
curl -X GET "http://localhost:3000/api/v1/codesets/AUTO_TEST_001/history?fromDate=2025-01-01&toDate=2025-12-31" \
  -H "Content-Type: application/json" \
  | jq .
```
**✅ 실행 결과**: ☐ 통과 / ☐ 실패

---

## 💾 데이터베이스 무결성 검증

### 1. 선분 이력 검증
```sql
-- 버전별 이력 데이터 확인
sqlite3 data/maru.db "
SELECT 
    MARU_ID,
    VERSION,
    START_DATE,
    END_DATE,
    STATUS
FROM TB_MR_HEAD 
WHERE MARU_ID = 'AUTO_TEST_001'
ORDER BY VERSION;
"
```
**✅ 확인사항**:
- [ ] 각 버전의 END_DATE가 다음 버전의 START_DATE와 일치
- [ ] 현재 버전의 END_DATE가 '9999-12-31'
- [ ] VERSION이 순차적으로 증가

### 2. 참조 무결성 검증
```sql
-- 카테고리-코드 관계 확인
sqlite3 data/maru.db "
SELECT 
    h.MARU_ID,
    cat.CATEGORY_ID,
    cat.CODE_DEFINITION,
    GROUP_CONCAT(cb.CODE) as ACTUAL_CODES
FROM TB_MR_HEAD h
JOIN TB_MR_CODE_CATE cat ON h.MARU_ID = cat.MARU_ID 
LEFT JOIN TB_MR_CODE_BASE cb ON h.MARU_ID = cb.MARU_ID
WHERE h.MARU_ID = 'AUTO_TEST_001'
  AND h.END_DATE = '9999-12-31'
GROUP BY h.MARU_ID, cat.CATEGORY_ID;
"
```
**✅ 확인사항**:
- [ ] 실제 코드가 카테고리 정의와 일치
- [ ] 외래키 관계가 올바름

---

## ⚡ 성능 및 부하 테스트

### 응답 시간 측정
```bash
# 1. 목록 조회 성능 (목표: <200ms)
for i in {1..10}; do
  echo "Test $i:"
  time curl -s "http://localhost:3000/api/v1/codesets" > /dev/null
done

# 2. 상세 조회 성능 (목표: <200ms)  
for i in {1..10}; do
  echo "Detail Test $i:"
  time curl -s "http://localhost:3000/api/v1/codesets/AUTO_TEST_001" > /dev/null
done

# 3. 생성 성능 (목표: <500ms)
echo "Creation Test:"
time curl -s -X POST "http://localhost:3000/api/v1/codesets" \
  -H "Content-Type: application/json" \
  -d '{"header":{"maruId":"PERF_TEST","maruName":"성능테스트"},"categories":[],"codes":[]}' > /dev/null
```

### 동시 요청 테스트
```bash
# Apache Bench 또는 curl을 이용한 동시성 테스트
# (ab가 설치되어 있다면)
ab -n 100 -c 10 http://localhost:3000/api/v1/codesets

# 또는 curl로 간단한 동시성 테스트
for i in {1..5}; do
  curl -s "http://localhost:3000/api/v1/codesets" > /dev/null &
done
wait
```

---

## 📊 검증 결과 요약

### API 엔드포인트 결과
| 엔드포인트 | 기능 테스트 | 성능 테스트 | 오류 처리 | 상태 |
|------------|-------------|-------------|-----------|------|
| GET /codesets | ☐ | ☐ | ☐ | ☐ |
| GET /codesets/{id} | ☐ | ☐ | ☐ | ☐ |
| POST /codesets | ☐ | ☐ | ☐ | ☐ |
| PUT /codesets/{id}/status | ☐ | ☐ | ☐ | ☐ |
| GET /codesets/{id}/history | ☐ | ☐ | ☐ | ☐ |

### 성능 지표
- **평균 응답시간**: [  ] ms
- **최대 응답시간**: [  ] ms  
- **에러율**: [  ] %
- **처리량**: [  ] req/sec

### 데이터 무결성
- **선분 이력**: ☐ 정상 / ☐ 오류
- **참조 무결성**: ☐ 정상 / ☐ 오류
- **트랜잭션**: ☐ 정상 / ☐ 오류

### 발견된 이슈
1. **Critical**: 
2. **Major**: 
3. **Minor**: 

### 최종 검수 결과
**종합 평가**: ☐ 승인 / ☐ 조건부 승인 / ☐ 재개발 필요

**검수자 서명**: _________________ **날짜**: _________________

---

## 🚀 빠른 실행 스크립트

### 전체 API 테스트 실행
```bash
#!/bin/bash
echo "🔧 Backend API 검증 시작..."

BASE_URL="http://localhost:3000/api/v1"

# Health Check
curl -f http://localhost:3000/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ 서버가 응답하지 않습니다."
    exit 1
fi

echo "✅ 서버 연결 확인"

# 1. 목록 조회 테스트
echo "📋 목록 조회 테스트..."
curl -f "$BASE_URL/codesets" > /dev/null && echo "✅ 목록 조회 OK" || echo "❌ 목록 조회 FAIL"

# 2. 생성 테스트
echo "📝 생성 테스트..."
curl -f -X POST "$BASE_URL/codesets" \
  -H "Content-Type: application/json" \
  -d '{"header":{"maruId":"QUICK_TEST","maruName":"빠른테스트"},"categories":[],"codes":[]}' > /dev/null \
  && echo "✅ 생성 OK" || echo "❌ 생성 FAIL"

# 3. 상세 조회 테스트
echo "🔍 상세 조회 테스트..."
curl -f "$BASE_URL/codesets/QUICK_TEST" > /dev/null && echo "✅ 상세 조회 OK" || echo "❌ 상세 조회 FAIL"

# 4. 상태 변경 테스트
echo "🔄 상태 변경 테스트..."
curl -f -X PUT "$BASE_URL/codesets/QUICK_TEST/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"INUSE"}' > /dev/null \
  && echo "✅ 상태 변경 OK" || echo "❌ 상태 변경 FAIL"

# 5. 이력 조회 테스트
echo "📚 이력 조회 테스트..."
curl -f "$BASE_URL/codesets/QUICK_TEST/history" > /dev/null && echo "✅ 이력 조회 OK" || echo "❌ 이력 조회 FAIL"

echo "🏁 Backend API 검증 완료"
```

### 개별 테스트 스크립트
```bash
# 특정 API만 테스트
./test-api-list.sh      # 목록 조회만
./test-api-create.sh    # 생성만  
./test-api-detail.sh    # 상세 조회만
./test-api-status.sh    # 상태 변경만
./test-api-history.sh   # 이력 조회만
```