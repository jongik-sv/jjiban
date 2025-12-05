# update_task_status()

## 목적
tasks.md에서 Task 상태 업데이트

## 호출
```javascript
update_task_status(task_number, status)
```

## 입력
- `task_number`: "3.1", "4.2"
- `status`: pending | in_progress | detail_design | implementation | cross_check | completed

## 상태 기호
| status | 기호 | 의미 |
|--------|------|------|
| pending | `[ ]` | 미착수 |
| in_progress | `[-]` | 진행중 |
| detail_design | `[d]` | 설계완료 |
| implementation | `[i]` | 구현완료 |
| cross_check | `[c]` | 검증완료 |
| completed | `[x]` | 완료 |

## 실행
1. tasks.md에서 Task 라인 찾기
2. 체크박스 기호 교체
3. 파일 저장

## 예시
```javascript
update_task_status("3.1", "detail_design")
// - [-] 3.1 ... → - [d] 3.1 ...
```
