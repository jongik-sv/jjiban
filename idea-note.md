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
- **병렬수행** : 기본설계, 상세설계를 할 때 agent를 지정한다. --> WP/ACT 단위 명령어는 TASK 전체를 병렬로 수행
- **자동모드**를 지정하면 순서대로 다음 명령어를 자동으로 수행하도록 명령어를 바꾸자. 
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
- **test** 
  - build 명령어에서 tdd, e2e를 수행할 때 테스트롤 통과하도록 바꿔야해. 그리고 테스트 시도를 너무 많이 해서 무한 루프에 빠지는것도 막아야해.
  - test 명령어도 마찬가지...
  - 토큰이 많이 들지만 위의 방법으로 하던지. 테스트 결과를 바탕으로 오류난 것만 반복해서 오류를 수정하게 하던지...
- **프로젝트 단계 확장** : 1차 구축 후 추가 예정, .jjiban의 폴더 구조만 먼저 바꿀까?
- claude code rule : 사용법 익히자.
- 상세설계에 코드가 많네. 
- 워크플로우 명령어를 사용할 때 작업이 돌고 있다는 표시가 필요(빙글빙글 도는 progress)
- WP 밑에 따라오는 ACT, TASK를 어떻게 보여줄래?
  - 각각의 카드가 있어서 거기에 알맞게 카드를 랜더링 하면 된다.
- 그냥 위의 방식 보다는 프로젝트 뷰를 보여주고 거기서 수정하면 되잖아. 이런 복잡한 뷰체계를 가져갈 필요가 없어. 카드는 확다 없애버리자. 정보 확인/수정용 프로퍼티 창만 필요해.
- wbs 파일은 WP 단위로 분할해서 넣는다. 이말은 WP 단위로 프로젝트를 옮길 수 있다는 말이다. WP 단위로 PL이 관리를 해라 이런 말이다. 완전히 밀고 새로 하자.


## 참고 사항
- continuous-claude : 생각이 나랑 같네. 알아서 순서대로 명령어를 계속 수행
- **명령행 실행방법** : claude --model opus --dangerously-skip-permissions -p "/wf:draft TSK-01-01-03
- **명령어 저장 없이 수행** : @.claude/commands/wf/review.md 명령어를 읽어서 절차 대로 `ACT-01-01`을 수행해. 현재 LLM은 gemini-2.5를 사용중이야.
- context에서 mcp를 내려버리는 방법 (MCP 검색 도구를 사용해서 컨텍스트에는 없지만 똑똑하게 알아서 사용.)
   - export ENABLE_EXPERIMENTAL_MCP_CLI=true # MAC, LINU
   - $env:ENABLE_EXPERIMENTAL_MCP_CLI="true" # WINDOWS powershell
   - set ENABLE_EXPERIMENTAL_MCP_CLI=true # WINDOWS command shell
   - claude code 내부 명령어 : mcp-cli -V 명령어 실행해줘.





## 디렉토리 구조 개선
- 홈 디렉토리 : .jjiban , 
- 설정 폴더 : .jjiban/settings
  - 설정 파일 : 전체 프로젝트 목록, 칸반 컬럼 정의, 카테고리 정의, 워크플로우 규칙, 상태 내 액션
- 템플릿 폴더 : .jjiban/templates
- 프로젝트 폴더 : .jjiban/[project-id]
  - 프로젝트 폴더 내부 구조
  - WP 폴더 : .jjiban/[project-id]/[WP-id]
    - WP 폴더 내부에 ACT, TASK 폴더가 있음
    - ACT 폴더 내부에 TASK 폴더가 있음
    - 3단계 구조는 WP 폴더 내부에 ACT 없이 TASK 폴더가 있음
    - 4단계 구조는 WP 폴더 내부에 ACT 폴더가 있고   그 밑에 TASK 폴더가 있음




@.jjiban\projects\jjiban\tasks\TSK-01-02-01\ui-assets\ @.jjiban\projects\jjiban\tasks\TSK-01-02-02\ui-assets\ 안의 설계 이미지가 전체 생각하고 있는 모습인 @.jjiban\projects\jjiban\wbs-tree-mockup-compact.svg 를 잘 반영하고 잇는지 확인해줘.

```
claude --model opus --dangerously-skip-permissions -p "/wf:audit TSK-01-02-01"
claude --model opus --dangerously-skip-permissions -p "/wf:patch TSK-01-02-01"
claude --model opus --dangerously-skip-permissions -p "/wf:build TSK-01-02-02"
claude --model opus --dangerously-skip-permissions -p "/wf:audit TSK-01-02-02"
claude --model opus --dangerously-skip-permissions -p "/wf:patch TSK-01-02-02"
```

