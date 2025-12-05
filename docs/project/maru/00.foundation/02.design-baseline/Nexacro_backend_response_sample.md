# Nexacro Backend Response XML 샘플

MARU 프로젝트용 표준 응답 구조 가이드입니다.

## 기본 구조

1. **기본 응답**: ErrorCode, ErrorMsg, SuccessRowCount
2. **데이터셋**: ColumnInfo + Rows
3. **에러 처리**: 음수 ErrorCode로 오류 표시

## 1. 성공 응답 예제 (조회)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Dataset>
  <!-- 에러 정보 -->
  <ErrorCode>0</ErrorCode>
  <ErrorMsg></ErrorMsg>
  <SuccessRowCount>2</SuccessRowCount>

  <!-- 컬럼 정보 정의 -->
  <ColumnInfo>
    <Column id="HEAD_ID" type="STRING" size="10"/>
    <Column id="HEAD_NAME" type="STRING" size="100"/>
    <Column id="VERSION" type="INT" size="4"/>
    <Column id="STATUS" type="STRING" size="1"/>
    <Column id="CREATE_DATE" type="STRING" size="14"/>
    <Column id="UPDATE_DATE" type="STRING" size="14"/>
  </ColumnInfo>

  <!-- 실제 데이터 -->
  <Rows>
    <Row>
      <Col id="HEAD_ID">CODE001</Col>
      <Col id="HEAD_NAME">사용자권한코드</Col>
      <Col id="VERSION">1</Col>
      <Col id="STATUS">A</Col>
      <Col id="CREATE_DATE">20241122130000</Col>
      <Col id="UPDATE_DATE">20241122130000</Col>
    </Row>
    <Row>
      <Col id="HEAD_ID">CODE002</Col>
      <Col id="HEAD_NAME">부서코드</Col>
      <Col id="VERSION">1</Col>
      <Col id="STATUS">A</Col>
      <Col id="CREATE_DATE">20241122130000</Col>
      <Col id="UPDATE_DATE">20241122130000</Col>
    </Row>
  </Rows>
</Dataset>
```

## 2. 에러 응답 예제

```xml
<Dataset>
  <ErrorCode>-1</ErrorCode>
  <ErrorMsg>데이터를 찾을 수 없습니다.</ErrorMsg>
  <SuccessRowCount>0</SuccessRowCount>

  <ColumnInfo>
    <Column id="HEAD_ID" type="STRING" size="10"/>
    <Column id="HEAD_NAME" type="STRING" size="100"/>
  </ColumnInfo>

  <Rows>
  </Rows>
</Dataset>
```

## 3. 저장 성공 응답 예제

```xml
<Dataset>
  <ErrorCode>0</ErrorCode>
  <ErrorMsg></ErrorMsg>
  <SuccessRowCount>1</SuccessRowCount>

  <ColumnInfo>
    <Column id="RESULT" type="STRING" size="10"/>
    <Column id="MESSAGE" type="STRING" size="200"/>
    <Column id="NEW_ID" type="STRING" size="10"/>
  </ColumnInfo>

  <Rows>
    <Row>
      <Col id="RESULT">SUCCESS</Col>
      <Col id="MESSAGE">정상적으로 저장되었습니다.</Col>
      <Col id="NEW_ID">CODE003</Col>
    </Row>
  </Rows>
</Dataset>
```

## 4. 비즈니스 로직 에러 응답 예제

```xml
<Dataset>
  <ErrorCode>-100</ErrorCode>
  <ErrorMsg>중복된 코드가 존재합니다.</ErrorMsg>
  <SuccessRowCount>0</SuccessRowCount>

  <ColumnInfo>
    <Column id="ERROR_FIELD" type="STRING" size="50"/>
    <Column id="ERROR_VALUE" type="STRING" size="100"/>
  </ColumnInfo>

  <Rows>
    <Row>
      <Col id="ERROR_FIELD">HEAD_ID</Col>
      <Col id="ERROR_VALUE">CODE001</Col>
    </Row>
  </Rows>
</Dataset>
```

## 5. 다중 Dataset 응답 예제

```xml
<Datasets>
  <!-- 메인 데이터 -->
  <Dataset id="dsMain">
    <ErrorCode>0</ErrorCode>
    <ErrorMsg></ErrorMsg>
    <SuccessRowCount>1</SuccessRowCount>

    <ColumnInfo>
      <Column id="HEAD_ID" type="STRING" size="10"/>
      <Column id="HEAD_NAME" type="STRING" size="100"/>
    </ColumnInfo>

    <Rows>
      <Row>
        <Col id="HEAD_ID">CODE001</Col>
        <Col id="HEAD_NAME">사용자권한코드</Col>
      </Row>
    </Rows>
  </Dataset>

  <!-- 상세 데이터 -->
  <Dataset id="dsDetail">
    <ErrorCode>0</ErrorCode>
    <ErrorMsg></ErrorMsg>
    <SuccessRowCount>3</SuccessRowCount>

    <ColumnInfo>
      <Column id="HEAD_ID" type="STRING" size="10"/>
      <Column id="CODE_VALUE" type="STRING" size="10"/>
      <Column id="CODE_NAME" type="STRING" size="100"/>
      <Column id="SORT_ORDER" type="INT" size="4"/>
    </ColumnInfo>

    <Rows>
      <Row>
        <Col id="HEAD_ID">CODE001</Col>
        <Col id="CODE_VALUE">ADMIN</Col>
        <Col id="CODE_NAME">관리자</Col>
        <Col id="SORT_ORDER">1</Col>
      </Row>
      <Row>
        <Col id="HEAD_ID">CODE001</Col>
        <Col id="CODE_VALUE">USER</Col>
        <Col id="CODE_NAME">일반사용자</Col>
        <Col id="SORT_ORDER">2</Col>
      </Row>
      <Row>
        <Col id="HEAD_ID">CODE001</Col>
        <Col id="CODE_VALUE">GUEST</Col>
        <Col id="CODE_NAME">게스트</Col>
        <Col id="SORT_ORDER">3</Col>
      </Row>
    </Rows>
  </Dataset>
</Datasets>
```

## 에러 코드 정의

| 코드 | 설명 | 예시 |
|------|------|------|
| 0 | 성공 | 정상 처리 완료 |
| -1 | 일반 에러 | 데이터 없음, 조회 결과 없음 |
| -100 | 비즈니스 로직 에러 | 중복 데이터, 유효성 검사 실패 |
| -200 | 시스템 에러 | DB 연결 실패, 서버 오류 |
| -300 | 권한 에러 | 접근 권한 없음 |
| -400 | 파라미터 에러 | 필수값 누락, 형식 오류 |

## Node.js에서 XML 생성 예제

```javascript
// XML 응답 생성 헬퍼 함수
function createNexacroResponse(data, columns, errorCode = 0, errorMsg = '') {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';

  const columnInfo = columns.map(col =>
    `    <Column id="${col.id}" type="${col.type}" size="${col.size}"/>`
  ).join('\n');

  const rows = data.map(row => {
    const cols = columns.map(col =>
      `      <Col id="${col.id}">${row[col.id] || ''}</Col>`
    ).join('\n');
    return `    <Row>\n${cols}\n    </Row>`;
  }).join('\n');

  return `${xmlHeader}
<Dataset>
  <ErrorCode>${errorCode}</ErrorCode>
  <ErrorMsg>${errorMsg}</ErrorMsg>
  <SuccessRowCount>${data.length}</SuccessRowCount>

  <ColumnInfo>
${columnInfo}
  </ColumnInfo>

  <Rows>
${rows}
  </Rows>
</Dataset>`;
}

// 사용 예제
const columns = [
  { id: 'HEAD_ID', type: 'STRING', size: '10' },
  { id: 'HEAD_NAME', type: 'STRING', size: '100' }
];

const data = [
  { HEAD_ID: 'CODE001', HEAD_NAME: '사용자권한코드' },
  { HEAD_ID: 'CODE002', HEAD_NAME: '부서코드' }
];

const xmlResponse = createNexacroResponse(data, columns);
```

## Express 라우터에서 사용

```javascript
app.get('/api/codes', (req, res) => {
  try {
    const data = [
      { HEAD_ID: 'CODE001', HEAD_NAME: '사용자권한코드' },
      { HEAD_ID: 'CODE002', HEAD_NAME: '부서코드' }
    ];

    const columns = [
      { id: 'HEAD_ID', type: 'STRING', size: '10' },
      { id: 'HEAD_NAME', type: 'STRING', size: '100' }
    ];

    const xmlResponse = createNexacroResponse(data, columns);

    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.send(xmlResponse);

  } catch (error) {
    const errorXml = createNexacroResponse([], [], -200, '시스템 오류가 발생했습니다.');
    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.status(500).send(errorXml);
  }
});
```