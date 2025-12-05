# Oracle 23ai XE 설치 매뉴얼

## 개요
- 기존 Oracle XE 환경을 완전히 제거한 뒤 23ai Express Edition을 재설치하여, CDB `FREE`, PDB `FREEPDB1` 기반으로 새 PDB `XE`와 계정 `maru`를 구성한다.
- 설치 및 설정 과정에서 사용하는 모든 비밀번호는 `maru`로 통일한다.

## 1. 사전 정리
- 제어판 → 프로그램 제거에서 Oracle Database 23ai Express Edition을 삭제한다.
- 관리자 권한 PowerShell에서 잔여 서비스를 제거한다.
  ```powershell
  sc delete OracleServiceFREE
  sc delete OracleOraDB23ai_home1TNSListener
  ```
- `C:\app\oracle` 이하 Oracle 관련 폴더를 수동 삭제하거나 백업한다.
- PC를 재부팅한다.

## 2. Oracle 23ai XE 재설치
- 설치 파일을 관리자 권한으로 실행하고, 설치 마법사가 요구하는 모든 패스워드를 `maru`로 입력한다.
- 설치 완료 후 Windows 서비스 목록에 `OracleServiceFREE`가 등록되었는지 확인한다.

## 3. 설치 직후 기본 점검
1. 관리자 권한 명령 프롬프트에서 `sqlplus / as sysdba`로 접속한다.
2. 컨테이너 상태를 확인한다.
   ```sql
   SHOW CON_NAME;  -- CDB$ROOT 이어야 한다.
   SHOW PDBS;      -- FREEPDB1 의 OPEN MODE 가 READ WRITE 인지 확인.
   ```
3. 리스너 상태를 확인한다.
   ```cmd
   lsnrctl status
   ```
   출력 하단 Services Summary에서 `FREE`, `FREEXDB`, `freepdb1`이 `READY`인지 확인한다.

## 4. PDB 복제 경로 준비
- 루트 컨테이너에서 PDB$SEED 데이터파일 경로를 조회한다.
  ```sql
  SELECT name FROM v$datafile WHERE con_id = 2;
  ```
- 새 PDB 파일을 둘 디렉터리를 만든다.
  ```powershell
  New-Item -ItemType Directory -Force -Path "C:\APP\USER1\PRODUCT\23AI\ORADATA\XE"
  ```

## 5. 새 PDB `XE` 생성 및 오픈
1. 루트 컨테이너(CDB$ROOT)에서 다음을 실행한다.
   ```sql
   CREATE PLUGGABLE DATABASE XE
     ADMIN USER xe_admin IDENTIFIED BY "maru"
     FILE_NAME_CONVERT =
       ('C:\APP\USER1\PRODUCT\23AI\ORADATA\FREE\PDBSEED\',
        'C:\APP\USER1\PRODUCT\23AI\ORADATA\XE\');

   ALTER PLUGGABLE DATABASE XE OPEN;
   ALTER PLUGGABLE DATABASE XE SAVE STATE;
   ```
2. 새 PDB로 이동한다.
   ```sql
   ALTER SESSION SET CONTAINER = XE;
   SHOW CON_NAME;  -- XE
   ```

## 6. 테이블스페이스 및 계정 구성
1. 전용 테이블스페이스를 생성한다.
   ```sql
   CREATE TABLESPACE maru01
     DATAFILE 'C:\APP\USER1\PRODUCT\23AI\ORADATA\XE\maru01.dbf'
     SIZE 200M
     AUTOEXTEND ON NEXT 50M MAXSIZE UNLIMITED;
   ```
2. 로컬 사용자 `maru`를 생성하고 권한을 부여한다.
   ```sql
   CREATE USER maru IDENTIFIED BY "maru"
     DEFAULT TABLESPACE maru01
     QUOTA UNLIMITED ON maru01;

   GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW TO maru;
   ```
   필요 시 추가 권한(`CREATE SEQUENCE`, `CREATE TRIGGER` 등)을 부여한다.

## 7. 서비스 이름 `XE` 등록
1. 루트 컨테이너로 돌아간다.
   ```sql
   ALTER SESSION SET CONTAINER = CDB$ROOT;
   ```
2. 서비스 이름을 설정하고 리스너에 등록한다.
   ```sql
   ALTER SYSTEM SET service_names = 'FREEPDB1,XE' SID='free' SCOPE=BOTH;
   ALTER SYSTEM REGISTER;
   ```
3. `lsnrctl status`를 실행해 Services Summary에 `XE`가 `READY`로 표시되는지 확인한다.

## 8. 접속 테스트
- 새 계정으로 접속한다.
  ```cmd
  sqlplus maru/maru@localhost:1521/XE
  ```
- 로그인 후 기본 쿼리로 확인한다.
  ```sql
  SELECT * FROM dual;
  SELECT default_tablespace FROM user_users;
  ```
- 오류가 발생하면 `lsnrctl status`, `tnsping XE`, 방화벽 1521 포트 상태를 점검한다.

## 9. 애플리케이션 환경설정
- `.env` 예시:
  ```
  DB_HOST=localhost
  DB_PORT=1521
  DB_SERVICE_NAME=XE
  DB_USER=maru
  DB_PASSWORD=maru
  ```
- `npm run migrate`, `npm run seed` 등 애플리케이션 초기화 스크립트로 연결을 검증한다.

## 10. 유지보수 체크리스트
- 재부팅 후 `sqlplus / as sysdba` → `SHOW PDBS;`로 `XE`가 `READ WRITE` 상태인지 확인한다.
- `PDB$SEED`는 템플릿이므로 수정하지 않는다.
- 모든 계정 비밀번호가 `maru`이므로 외부 노출에 주의한다.
- 문제 발생 시 `C:\app\USER1\product\23ai\diag\tnslsnr\ODT-2201-0002\listener\alert\log.xml` 등 알럿 로그를 확인한다.
