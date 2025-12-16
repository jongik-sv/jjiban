@projects\jjiban\jjiban-prd.md 지금 명령어가 꼬인것 같아. start 명령어는 기본 설계까지 완성하는        
것이고 draft명령어가 상세설계 완성하는 명령어인데 지금 잘못 되어 있어. 바로 잡아줘. start 명령어를       
실행할때 비즈니스 위주의 기본 설계서가 만들어지면 된다. 그렇게 적용해줘. 명령어도 그렇게 적용해줘.


## 일반적인 Phase별 필수 산출물

| Phase | 필수 문서                          |
|-------|--------------------------------|
| 요구사항  | SRS, 요구사항 추적 매트릭스, 용어집         |
| 설계    | SAD, SDD, 인터페이스 명세, DB 설계서     |
| 구현    | 소스코드, 단위테스트 결과, 코딩 표준 준수 체크리스트 |
| 테스트   | 테스트 계획서, 테스트 케이스, 테스트 결과 보고서   |
| 배포    | 배포 가이드, 운영 매뉴얼, 교육 자료          |


##  AI 코딩 착수 프롬프트 

### 핵심 규칙

1. **스택 준수**: TRD.md에 명시된 라이브러리와 버전만 사용
2. **추측 금지**: 요구사항이 불명확하면 명확화 요청
3. **편법 금지**: 완전하고 프로덕션 레디 코드 구현
4. **아키텍처 우선**: 기능 코드 작성 전 프로젝트 구조 설정
5. **테스트 커버리지**: 구현과 함께 테스트 작성

### 실행 순서

1. TRD.md의 정확한 버전으로 프로젝트 초기화
2. 명시된 대로 디렉토리 구조 설정
3. 린팅, 포매팅, pre-commit 훅 설정
4. 우선순위 순서로 기능 구현 (P0 먼저)
5. 각 기능에 대한 테스트 작성
6. 모든 이탈 사항이나 결정 문서화


---


## 수정 고려 사항
- Todo list에 계속 해서 다음 명령어를 수록해서 자동으로 다음 명령어를 수행하는 체계 연구
- 서브에이전트로 WP/ACT 단위 명령어를 수행할 수 있도록 수정하면?? (유튜브 참고 https://www.youtube.com/watch?v=bcmmkSEW7VI)
- **상세 설계** : LLM용(jjiban) 과 사람용(DMES팀) 2가지가 있어야 하겠다.**
- **칸반에서 WP/ACT 그룹 구분** 칸반에는 Task만 표시하고, 같은 WP/ACT는 동일 색으로 구분한다.
- **유연한 워크플로우**  -> 수정함
  - WP-02_core-workflow-engine를 보면 Task category별로 각각의 워크플로우를 구현하고 있는데 이를 수정하고 싶어.
  - 카테고리 테이블 정의 (카테고리명, 설명) --> 이 테이블을 바탕으로 Task 카테고리 지정
  - 카테고리별 워크플로우 처리를 위한 룰 테이블 정의
  - 각 룰마다 실행해야 하는 카테고리, 현재상태, 칸반상태, 사용 명령어, 다음상태, LLM 실행 명령어 등
  - 이를 바탕으로 유연한 워크 플로우 체계를 만듦
  - 칸반상태(Todo, Design, Detail, Implement, Verify, Done) 정의 테이블
  - 카테고리 관리, 워크플로우 관리 화면이 필요
- **프로그래스 상태** : 워크플로우 실행중일때 빙글빙글 돌아야됨

- **프로젝트 단계 확장** : 1차 구축 후 추가 예정, .jjiban의 폴더 구조만 먼저 바꿀까?
- claude code rule : 사용법 익히자.
- 상세설계에 코드가 많네. 
- 070 테스트에 관련된 문서를 다시 정리해야함
- 각 개발 에이전트가 실행되고 있는 동안 발생하는 정보는 serena를 이용해서 수집하고 요약 관리 한다.
- **설계 결과 승인 단계 또는 플래그**를 둘까 한다. 설계완료 승인된 Task만 개발 가능하도록 변경한다.
- tech-stack 명령어에 ruby on rails 사용 추가(가장 간단한 프로젝트인 경우)
- 일반 프로젝트에서는 prd, trd, dbd를 다른 task의 input으로 사용한다.
- wf-hierarchy-input.md을 skill로 바꾸면 시간과 토큰을 아낄 수 있다.
- auto 를 skill로 변환하면 프롬프트를 알아서 판별해서 명령어를 수행할 수 있다.
- test 결과에 오류가 있으면 wbs에 표시해서 테스트 결과를 확인할 수 있도록 한다. [결과 없음, 정상, 오류] - 다시 테스트를 수행할 수 있도록 한다.
- verify 단계의 정의를 다시 세우고 필요 없는 단계이면 삭제하자. 그럼 test 명령어로 대체. test 성공하면 vf 단계로 넘어가자.

## 참고 사항
- continuous-claude : 생각이 나랑 같네. 알아서 순서대로 명령어를 계속 수행
- **명령행 실행방법** : claude --model opus --dangerously-skip-permissions -p "/wf:draft TSK-01-01-03
- **명령어 저장 없이 수행** : @.claude/commands/wf/review.md 명령어를 읽어서 절차 대로 `ACT-01-01`을 수행해. 현재 LLM은 gemini-2.5를 사용중이야.
- context에서 mcp를 내려버리는 방법 (MCP 검색 도구를 사용해서 컨텍스트에는 없지만 똑똑하게 알아서 사용.)
   - export ENABLE_EXPERIMENTAL_MCP_CLI=true # MAC, LINU
   - $env:ENABLE_EXPERIMENTAL_MCP_CLI="true" # WINDOWS powershell
   - set ENABLE_EXPERIMENTAL_MCP_CLI=true # WINDOWS command shell
   - claude code 내부 명령어 : mcp-cli -V 명령어 실행해줘.



## 전체 프로세스
- prd 문서를 작성한다. 대략적 화면 설계를 한다. (기능 스펙 정의, 화면 정의)
- Google AI Studio에서 react로 화면 설계를 뽑는다.
- trd 문서를 작성한다.(기술 스택 정의, 환경 설정)
- 로컬에서 prd 문서, 화면 리스트를 바탕으로 wbs 문서를 작성한다.
- wbs, prd, trd를 바탕으로 각 태스크의 기본 설계 후 기본 설계 승인
- 기본 설계 승인 후 상세설계 수행 및 상세설계 승인
- 이 후 자동 개발을 통해 전체 프로젝트를 완성한다. 각 Task 종료 시 테스트(e2e 포함)가 모두 통과하게 한다.
- 중간 중간 개발 화면을 확인하여 프로젝트의 진행 방향 검증


@.jjiban\projects\jjiban\tasks\TSK-01-02-01\ui-assets\ @.jjiban\projects\jjiban\tasks\TSK-01-02-02\ui-assets\ 안의 설계 이미지가 전체 생각하고 있는 모습인 @.jjiban\projects\jjiban\wbs-tree-mockup-compact.svg 를 잘 반영하고 잇는지 확인해줘.




  | 실패 테스트 파일                       | 실패 원인                                        | 담당 Task                                     |
  |----------------------------------------|--------------------------------------------------|-----------------------------------------------|
  | NodeIcon.test.ts (4 failed)            | icon 클래스 assertion 방식 오류                  | TSK-08-01 (WbsTreePanel + NodeIcon Migration) |
  | projectsListService.test.ts (7 failed) | getProjectsBasePath mock 누락                    | TSK-03-01 (Project API)                       |
  | service.test.ts (Settings, 9 failed)   | refreshCache is not a function                   | TSK-02-03-02 (설정 서비스 구현)               |
  | parser.test.ts (1 failed)              | progress 계산 로직 변경됨 (expected 0%, got 27%) | TSK-02-02-01 (wbs.md 파서 구현)               |
  | TaskDocuments.test.ts (4 failed)       | CSS 클래스 마이그레이션 후 style 함수 제거됨     | TSK-08-02 (WBS UI Components Migration)       |
  | integration.test.ts (1 failed)         | WP 개수 변경 (expected 6, got 8)                 | TSK-02-02-01 (테스트 데이터 업데이트 필요)    |
  | TaskHistory.test.ts (5 failed)         | getEntryColor 함수 제거, icon 변경               | TSK-08-05 (TaskDetailPanel Dialog Migration)  |
  | taskService.test.ts (2 failed)         | 테스트 데이터 Task ID 불일치                     | TSK-03-02 (WBS API)                           |


 | 담당 Task    | 실패 테스트                                 | 원인                    |
  |--------------|---------------------------------------------|-------------------------|
  | TSK-08-01    | NodeIcon.test.ts (4)                        | CSS 클래스 마이그레이션 |
  | TSK-08-02    | TaskDocuments.test.ts (4)                   | style 함수 제거         |
  | TSK-08-05    | TaskHistory.test.ts (5)                     | getEntryColor 함수 제거 |
  | TSK-03-01    | projectsListService.test.ts (7)             | mock 함수 누락          |
  | TSK-02-03-02 | service.test.ts (9)                         | refreshCache 함수 변경  |
  | TSK-02-02-01 | parser.test.ts (1), integration.test.ts (1) | 로직/데이터 변경        |
  | TSK-03-02    | taskService.test.ts (2)                     | 테스트 데이터 불일치    |