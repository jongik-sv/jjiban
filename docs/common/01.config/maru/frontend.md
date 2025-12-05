# MARU 프로젝트 Frontend 설정

## Framework
**Nexacro N v24**

## 컴파일 설정

### 컴파일 명령어
```bash
"C:/Program Files/TOBESOFT/Nexacro N/Tools/nexacrodeploy.exe" \
  -P "C:/project/maru_nexacro/nexacro/maru.xprj" \
  -O "C:/project/maru_nexacro/nexacro_temp" \
  -B "C:/Program Files (x86)/TOBESOFT/Nexacro N/SDK/24.0.0/nexacrolib" \
  -D "C:/project/maru_nexacro/webapp" \
  -GENERATERULE .
```
"C:\Program Files\TOBESOFT\Nexacro N\Tools\nexacrodeploy.exe" -P C:\project\maru_nexacro\nexacro\maru.xprj -O C:\project\maru_nexacro\nexacro_temp -B "C:\Program Files (x86)\TOBESOFT\Nexacro N\SDK\24.0.0\nexacrolib" -D "C:\project\maru_nexacro\webapp" -GENERATERULE .

## 개발 서버 설정

### Live Server
```yaml
type: "Live Server"
base_path: "./webapp/index.html"
port: 5500
```

### 접속 URL
- **전체 프로젝트**: `http://127.0.0.1:5500/webapp/index.html`
- **단위 기능 (QuickView)**: `http://127.0.0.1:5500/webapp/quickview.html?screenid=Desktop_screen&formname={package}::{filename}`
  - 예시: `http://127.0.0.1:5500/webapp/quickview.html?screenid=Desktop_screen&formname=FrameBase::Form_Bottom.xfdl`

## 컴포넌트 패턴

### Nexacro 전용 패턴
```yaml
file_extension: ".xfdl"
data_binding: "Dataset"
grid_component: "Grid"
form_component: "Form"
transaction: "Transaction"
```

### 주요 컴포넌트
- **Dataset**: 데이터 저장 및 관리
- **Grid**: 데이터 그리드 표시
- **Form**: 화면 단위
- **Div**: 레이아웃 컨테이너
- **Button/Edit/Combo**: 기본 입력 컴포넌트

## 페르소나
**frontend-developer** (Nexacro N 전문)
- Nexacro N V24 컴포넌트 활용
- xfdl 파일 구조 이해
- Dataset 기반 데이터 바인딩
- Transaction 처리

## 개발 가이드 참조
- **구현 가이드**: `./docs/common/06.guide/LLM_Nexacro_Development_Guide.md`
- **컴포넌트 레퍼런스**: `./docs/common/06.guide/Nexacro_N_V24_Components.md`
- **예제 코드**: `./docs/common/06.guide/Nexacro_Examples.md`
- **예제 프로젝트**: `../nexacro_study/sample_Nexacro_N_V24/Sample` 없으면 `https://github.com/TOBESOFT-DOCS/sample_Nexacro_N_V24/tree/master/Sample`

## 프로젝트 구조
```
nexacro/
├── maru.xprj                    # 프로젝트 파일
└── FrameBase/                   # 화면 폴더
    └── *.xfdl                   # 화면 파일

webapp/                          # 컴파일 결과물
├── index.html                   # 전체 실행
└── quickview.html               # 단위 화면 실행
```

## Backend 연동
- **Backend 서버**: Node.js (포트 3000)
- **API 호출**: Transaction 컴포넌트 사용
- **데이터 형식**: JSON
- **인코딩**: UTF-8



"C:/Program Files/TOBESOFT/Nexacro N/Tools/nexacrodeploy.exe" -P C:/project/maru_nexacro/nexacro/maru.xprj -O C:/project/maru_nexacro/nexacro_temp -B "C:/Program Files (x86)/TOBESOFT/Nexacro N/SDK/24.0.0/nexacrolib" -D "C:/project/maru_nexacro/webapp" -GENERATERULE