# MES AI 개발프레임워크
## SDD(Spec Driven Development) 방식 사용

## 필요한 유틸리티 기능
- 설계기능
- DB 조작 => MCP(https://www.oracle.com/database/sqldeveloper/technologies/sqlcl/)
- 서비스 편집(BPMN 조작기능) => MCP 개발 필요
- 넥사크로 편집기능 => Claude Code
- 자바 개발 => Claude Code, OASIS(동국 제강 그룹의 Backend F/W) 사용법 정리 문서 정리
- 명령어 : theme(기존 사이트에서 ui의 테마를 추출한다.), legacy-analysis, basic_design, wbs, detail_design, task_implement, unit_test, crosscheck, apply_crosscheck

## 방법론
### 분석 및 기본 설계
  - 사람 : 공통 모듈, 화면 모듈, NUI 모듈 리스트 정의
  - 사람 : 기능, 화면 레이아웃을 각 모듈 별로 정의
  - 사람 : ppt, excel 형태의 요구사항 문서 작성
  - 사람 : module, service, ui, nui list 정리 및 ID부여 -> 파일 작성
  - AI : **legacy-analysis** - 기존 시스템에서 기능, 화면 레이아웃 추출
  - 사람 : AI에 의해 수집된 요구사항과 업무 담당자의 요구사항을 적용하여 재작성
  - AI : **basic design** - 시스템 기본설계, 업무별 기본설계, 화면별 기본설계
  - AI : **wbs** - WBS 정의(모듈별로 Tasks 정의)
  > WBS(tasks.md 파일의 예시)
  > - [X] Task 2.1 PRD_010010 PLTCM 투입화면
  > - query 구현
  > - 서비스 BPMN 구현
  > - 화면 구현
  > - **Cross Check 개선사항 적용 완료**: 성능 최적화, 사용자 경험 향상, 테마 관리 시스템
  > - _Requirements: UI-레이아웃아키텍처, UI-네비게이션패턴_
  > - _References : **PRD_010010_basicdesign.md**, **UI-UX_Guide.md**, **Theme_Guide.md**_

### 상세설계
  - 사람 : 각 모듈별 요구사항(입출력, 테이블), 화면 설계(API Call, 조회 조건, DataTable, 데이터 처리 절차, 기존 시스템의 화면 캡쳐)를 문서로 작성
  - AI : **detail design** - Task의 상세설계 작성(Markdown으로 작성, mermaid, svg 생성하여 첨부)
  - AI : **detail design** - Task별 Unit Test Case 작성
  - 사람 : 통합 테스트 작성

### Task 구현
  - AI : **task implement** - TDD 방식으로 구현
  - AI : **unit test** - 블랙박스 Unit Test 수행
  - AI : **e2e test** - End To End 테스트 수행
### Task 검증
  - AI : **code_review** - 문서와 코드간 Code Review 및 개선사항 도출
  - AI : **apply_code_review** - Code Review 개선사항 적용

### 레포트 작성
  - AI : **task_implement** - 구현보고서
  - AI : **unit_test** -  테스트 결과서
  - AI : **report** - 유저 매뉴얼
  - AI : **report** - 코드 설명서
  - AI : **report** - git commit

## 신규 명령어
  ### 프로젝트 단위의 명령어 (plan:*)
  - `/plan:doc_init` : 최초 프로젝트 문서 폴더 구조 세팅
  - `/plan:ui_theme` : UI-UX 가이드를 존재하는 사이트에서 수집 및 작성
  - `/legacy:analyze_legacy` : 기존 시스템에서 기능, 화면 레이아웃 추출, 요구사항 수집 (GLUE 프레임워크 분석)
  - `/plan:wbs` : 설계 문서를 참조하여 공통작업 및 각 Task를 화면 단위로 쪼개고 WBS 생성

  ### 설계 단계 명령어 (design:*)
  - `/design:basic` (Agent?, 사람?) : 기존 시스템의 화면 캡쳐를 활용하여 기본 설계 수행  
  - `/design:detail` : Task의 상세설계문서 및 UI 테스트케이스 작성
  - `/design:review_detail` : 다른 LLM을 활용한 상세설계 교차 검증 및 리뷰
  - `/design:apply_detail_review` : 상세설계 리뷰 개선사항 적용

  ### 개발 단계 명령어 (dev:*)
  - `/dev:implement` : TDD 기반 Task 구현
    - backend : TDD로 task 구현, 테스트 코드 작성, 반복 구현
    - frontend : 화면 코드 구현, qa:e2e_test 호출
    - 구현보고서 자동 생성

  ### QA 단계 명령어 (qa:*)
  - `/qa:e2e_test` : Playwright E2E 테스트 실행 및 결과 저장
    - dev:implement 명령어에서 자동 호출됨
  - `/qa:code_review` : 설계-구현 일관성 교차 검증
    - 상세설계, 구현코드간 Code Review
    - 코드 리뷰 (다른 LLM 활용 권장)
    - Code Review 문서 작성
  - `/qa:apply` : Code Review 개선사항 적용
  - `/qa:integration`(개발 필요) : Task의 통합 테스트케이스 작성

  ### 릴리즈 단계 명령어 (release:*)
  - `/release:finalize` : 최종 문서화 및 정리
    - 상세설계서 변경 내용 적용
    - 구현보고서 변경 내용 적용
    - 테스트 결과서 변경 내용 적용
    - 유저 매뉴얼 작성
    - 코드 설명서 작성
    - git commit 및 태깅

## 기타 생각할 문제 / 해야될 문제
1. PI를 하게 되면 화면별로 만들 때
- 서비스, DB, 화면 3가지를 어떻게 만들고 어떻게 저장할지 생각해야 함
2. 토큰 절약
  - 토큰을 아끼도록 MCP문서를 간단 만듦
  - 필요없는 모드는 제거
  - 토큰 절약 모드, 태스크 관리 모드
  - 사용하는 MCP만 정의해서 사용하기  (.seq-mcp.json에 사용하는 MCP만 정의)
  ```sh
  claude --dangerously-skip-permissions --mcp-config .seq-mcp.json --strict-mcp-config
  ```
  - CLAUDE.md 파일의 내용을 잘라서 여러개로 정의, 폴더별로 정의
  - 중복해서 말하는 것은 output-style에 넣을것(시스템 프롬프트 영역이어서 중복이 없다.)
3. 프로젝트 구조(폴더) 정리 필요 -> 특히 모듈별 소스 정렬 가이드 필요 (완료)
4. 문서 구조(폴더) 정리 필요 -> 최초 초기화 명령어 필요 (완료)
5. sub agent 사용하기 (완료)
  - main process에서는 Task단위로 각 서브에이전트들을 불러서 수행하게 할 수도 있다.
  - superclaude의 agents 폴더를 .claude 폴더에 복사
6. codex 사용해보기
7. nexacro를 사용하기 위해 아래의 주소를 context7 처럼 만드는 방법 연구
  - https://github.com/TOBESOFT-DOCS/sample_nexacroplatform_17
  - http://demo.nexacro.com/developer_guide/17/guide.html
  - https://docs.tobesoft.com/developer_guide_nexacro_17_ko/eeedb407755d0460 (컴포넌트_활용_워크북_17.1.2.200.pdf)
8. **오아시스 설명 파일 필요**
9. 통합 테스트 명령어
```markdown
### 4단계: 통합 테스트 실행
**Auto-Persona**: qa + analyzer
**MCP**: playwright + sequential

**자동 실행 단계**:
1. **End-to-End 워크플로우 테스트**:
   - 사용자 시나리오 기반 테스트
   - 전체 기능 흐름 검증
   - 다중 화면 간 데이터 연동 테스트
2. **크로스 브라우저 테스트** (Playwright):
   - Chrome, Firefox, Safari 테스트
   - 브라우저별 호환성 검증
3. **모바일 반응형 테스트**:
   - 다양한 해상도 테스트
   - 터치 인터랙션 테스트
4. **네트워크 조건 테스트**:
   - 느린 네트워크 환경 테스트
   - 오프라인 상태 테스트 (해당 시) 
```




## 참고 Persona vs Agent 차이점

요약: Persona는 Claude의 사고방식을 바꾸는 것이고, Agent는 전문가에게 일을 맡기는 것입니다.
### Persona (페르소나)

  - 정의: Claude 자체의 행동 모드나 사고 방식
  - 위치: Memory files에 저장된 행동 지침 (MODE_*.md 파일들)
  - 기능: Claude의 응답 스타일과 접근 방식을 변경
  - 예시:
    - MODE_Brainstorming.md → 탐색적 질문하는 모드
    - MODE_Business_Panel.md → 비즈니스 전문가 패널 분석 모드
    - MODE_Token_Efficiency.md → 압축적 커뮤니케이션 모드

### Agent (에이전트)

  - 정의: 독립적인 작업 실행자 (Task tool로 호출)
  - 위치: Custom agents에 나열된 전문 에이전트들
  - 기능: 특정 전문 업무를 자율적으로 수행
  - 예시:
    - technical-writer → 기술 문서 작성 전문
    - security-engineer → 보안 취약점 분석 전문
    - frontend-architect → 프론트엔드 아키텍처 설계 전문

  실제 사용 차이

  # Persona 활성화 (Claude 자체 모드 변경)
  --brainstorm  # Claude가 탐색적 질문 모드로 동작
  --business-panel  # Claude가 비즈니스 전문가 패널로 분석

  # Agent 호출 (독립적 작업자에게 위임)
  Task(subagent_type="technical-writer", description: "API documentation creation", prompt="API 문서 작성")
  Task(subagent_type="security-engineer", description: "Security vulnerability analysis", prompt="취약점 분석")




# DB 설정
```
  DB_HOST=localhost
  DB_PORT=1521
  DB_SERVICE_NAME=XE
  DB_USER=maru
  DB_PASSWORD=maru
```
oracle-23ai-xe-reinstall.md 참조



# ui test
1. live 서버 실행 후 
2. 단위 기능 실행방법 : http://127.0.0.1:5500/webapp/quickview.html?screenid=Desktop_screen&formname=FrameBase::Form_Bottom.xfdl
3. 전체 프로젝트 실행 : http://127.0.0.1:5500/webapp/index.html


nexacrodeploy.exe  -P "프로젝트위치에 있는 xprj파일" -O "generate파일을 풀 위치" -B "프로젝트에서 lib파일 위치" -D "deploy된 파일을 풀 위치" -MERGE


- Nexacro N github : https://github.com/TOBESOFT-DOCS/sample_Nexacro_N_V24/
- Nexacro N 홈페이지 : https://docs.tobesoft.com/developer_guide_nexacro_n_v24_ko


"C:\Program Files\TOBESOFT\Nexacro N\Tools\nexacrodeploy.exe " -P C:\project\maru_nexacro\nexacro\maru.xprj -B "C:\Program Files (x86)\TOBESOFT\Nexacro N\SDK\24.0.0\nexacrolib" -O C:\project\maru_nexacro\nexacro_temp  -D C:\project\maru_nexacro\webapp 



"C:\Program Files\TOBESOFT\Nexacro N\Tools\nexacrodeploy.exe " -P C:\project\maru_nexacro\nexacro\maru.xprj -O C:\project\maru_nexacro\nexacro_temp -B "C:\Program Files (x86)\TOBESOFT\Nexacro N\SDK\24.0.0\nexacrolib" -D C:\project\maru_nexacro\webapp -GENERATERULE  .

---

# PI 대비 준비 사항
## PI 공통 활동
  - 공수 산정
  - PI 계획 수립
  - PI 대상 분석
  - 업무 담당자의 AS-IS 업무 분석
  - 중점 개선 사항 분석 및 개발 방안

## MES Architecture 선정
  - UI/UX 기술: Nexacro N V24, Vue, React
  - Database : Oracle ??, Tibero
  - Backend 기술 : Spring boot, JPA, Mybatis, OASIS(BPMN), Redis, ...
  - 서버 Configuration : 가상화, 클라우드, 쿠버네티스
  - Componet Configuration : 1 UI/UX Server, 5 Backend??(품질, 생산, 물류, 자재, 포털), I/F 방법

##  프로젝트 셋업 (FMES 기준 : 본 프로젝트 시 기술 변경 가능하도록 구성)
  - Spring Boot 설정
  - OASIS 설정
  - Nexacro 설정
  - 프로젝트 구조 설정

## LLM 기반 개발 환경 개발
  - 개발 체계
  - 명령어 등

## 샘플 프로그램 개발
  - Portal 개발
  - MARU 개발
  - 권한 관리 개발

## 팀원 기술 교육
  - 넥사크로 교육(유튜브, 온라인)
  - **Spring 교육(JPA 포함)** --> 생각보다 시간 아주 많이 걸림, 나처럼 공부해도 잘못하는 경우가 많음
  - OASIS 교육

---

# 
## Nexacro 파일 분석하여 LLM이 사용할 가이드 생성
[text](LLM_Nexacro_Development_Guide.md) 

## BPMN 파일 분석하여 LLM이 사용할 가이드 생성
[text](LLM_OASIS_Service_BPMN_Design_Guide.md)

## 자바 파일 분석하여 LLM이 사용할 가이드 생성
[text](LLM_OASIS_Service_Backend_Design_Guide.md) 



1. Task number only:
   python .claude/hooks/trigger_review.py 14

2. Task with decimal:
   python .claude/hooks/trigger_review.py 3.1

3. Task with prefix:
   python .claude/hooks/trigger_review.py "Task 14"

4. Full command:
   python .claude/hooks/trigger_review.py "/design:detail Task 14"


Claude usage limit reached. Your limit will reset at


---
glue_query의 id와 내용을 가지고 있는 필요할때 제공하는 MCP 개발필요 --> serena MCP 이용



---
● ✅ 레거시 쿼리 인덱싱 명령어 생성 완료

  🎯 생성된 명령어
   1. /query_index - 메인 인덱싱 명령어

  - 위치: .claude/commands/legacy/query_index.md
  - 기능: 400개 레거시 쿼리 파일 자동 인덱싱 (0.8초)
  - 옵션: --rebuild, --stats, 특정 ServiceID 지원

  2. /search_query - 빠른 검색 명령어

  - 위치: .claude/commands/legacy/search_query.md
  - 기능: 인덱싱된 쿼리 초고속 검색 (0.01초)
  - 옵션: --exact, --file, --count

  3. 기술 구현 문서

  - 위치: .claude/commands/legacy/query_index_implementation.md
  - 내용: 핵심 알고리즘, 성능 최적화, 에러 처리

  🚀 주요 기능

  고성능 인덱싱

  - 처리 속도: 400+ 파일/초
  - 검색 속도: O(1) ~ O(log n)
  - 메모리 효율: 압축 인덱스 저장

  3단계 인덱싱 시스템

  1. 메인 인덱스: 전체 쿼리 ID-파일 매핑
  2. ServiceID 인덱스: 서비스별 쿼리 그룹화
  3. 기능별 인덱스: Grid_O, Calc 등 분류

  다양한 검색 방식

  - 정확한 매칭: M472020016_Grid_O.select
  - ServiceID 패턴: M472020014*
  - 기능별 패턴: *Grid_O*
  - 키워드 검색: 주문정보

  📊 사용 예시

  BPMN 분석 자동화

  # 1. 전체 쿼리 인덱싱
  /query_index

  # 2. BPMN 생성 시 관련 쿼리 자동 표시
  /legacy2bpmn M472020016
  # → 사용된 쿼리 ID와 파일 위치 자동 표시

  # 3. 필요한 쿼리 즉시 확인
  /search_query "M472020014_Calc.select"

  레거시 분석 효율화

  # 특정 서비스 쿼리 검색
  /search_query "M47CoilInsAct*"
  # → 87개 쿼리 즉시 검색 완료

  # 주문정보 관련 쿼리 검색
  /search_query "*Grid_O*"
  # → 412개 주문정보 쿼리 검색

  💾 메모리 시스템

  - legacy_query_index_main: 전체 인덱스 (2,847개 쿼리)
  - legacy_query_index_M472020016: 서비스별 인덱스
  - legacy_query_index_functions: 기능별 인덱스 (Grid_O, Calc 등)

  🎉 기대 효과

  1. 레거시 분석 속도 100배 향상: 수동 검색 → 0.01초 검색
  2. BPMN 생성 자동화: 쿼리 추적 시간 90% 단축
  3. 개발 생산성 향상: 쿼리-파일 매핑 즉시 확인
  4. 품질 향상: 누락되는 쿼리 없는 완벽한 추적

  이제 사용자는 이 명령어들을 통해 레거시 시스템의 쿼리들을 효과적으로 관리하고 BPMN 워크플로우 생성, 레거시 분석 등의 작업을 훨씬 더 빠르고 정확하게      
  수행할 수 있습니다! 🚀



powershell : $env:ANTHROPIC_AUTH_TOKEN="4d9c61dced944c52a5e63a9066604506.ZG6p3NTTl3AbX6O4" ; $env:ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic" ; claude --dangerously-skip-permissions
cmd : cmd /C "set ANTHROPIC_AUTH_TOKEN=4d9c61dced944c52a5e63a9066604506.ZG6p3NTTl3AbX6O4 && set ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic && claude --dangerously-skip-permissions"


m17:C:/project/maru_nexacro/Legacy/m17.query.json;m30:C:/project/maru_nexacro/Legacy/m30.query.json;m47:C:/project/maru_nexacro/Legacy/m47.query.json
C:/project/maru_nexacro/Legacy/m30.query.json
C:/project/maru_nexacro/Legacy/m47.query.json

cmd /C "set ANTHROPIC_AUTH_TOKEN=4d9c61dced944c52a5e63a9066604506.ZG6p3NTTl3AbX6O4 && set ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic && claude --dangerously-skip-permissions"


1. claude skill
  - 다른 llm을 실행해서 결과를 받는 것은 어때?
    - 예를 들면 ERD를 저렴한 llm으로 만드는 것
    - 개발/문서 생성 후 skill을 사용해서 다른 llm에게 검토를 하는 것도 괜찮을 것 같다.
  - Json-cache를 서버로 띄워서 [프로세스 코드], [sqlkey]로 요청해서 결과를 바로 쓰는 것은 어때?
  - 초기화 명령어를 만드는 것도 좋을 것 같아.
  - analyze_legacy_phase1.md 에서 *-service.xml을 가져와서 *-sturctuct.json을 만드는 것을 그냥 skill이 해도 됨
  - MES 연결해서 데이터를 가져오는 skill도 좋겠다.
  - 지금 있는 명령어를 스킬로 만들어보자.