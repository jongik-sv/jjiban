# analyze_project_context()

## 목적
Task 번호로 프로젝트 정보 및 참조 문서 수집

## 호출
```javascript
analyze_project_context(task_number)
```

## 실행
1. **tasks.md**에서 Task 정보 읽기
2. **파일명 생성**: `Task-{id}.{명}(상세설계).md`
3. **참조 문서 수집**: PRD, 기본설계, 템플릿
4. **상태 업데이트**: `[ ]` → `[-]`

## 입력
- `task_number`: "3.1", "4.2"

## 출력
```json
{
  "task_id": "Task-3-1",
  "task_name": "MR0100 Backend API 구현",
  "output_file": "Task-3-1.MR0100-Backend-API-구현(상세설계).md",
  "reference_docs": ["business-requirements.md", "api-design.md", "template.md"]
}
```

## 상태 기호
- `[ ]` 미착수 → `[-]` 진행중 → `[d]` 설계완료 → `[i]` 구현완료 → `[c]` 검증완료 → `[x]` 완료
