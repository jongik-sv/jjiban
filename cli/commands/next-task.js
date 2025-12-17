/**
 * next-task 명령어 핸들러
 *
 * 실행 가능한 Task 목록 조회 (의존관계 분석)
 * - JSON 출력 (기본)
 * - 표 형식 출력 (--table)
 */

import { WbsReader } from '../core/WbsReader.js';
import { JjibanError } from '../errors/JjibanError.js';

/**
 * 우선순위 정렬 순서
 */
const PRIORITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * 카테고리별 다음 액션 매핑
 */
const NEXT_ACTION_MAP = {
  development: {
    '[ ]': 'start',
    '[bd]': 'draft',
    '[dd]': 'build',
    '[im]': 'verify',
    '[vf]': 'done',
    '[xx]': '-',
  },
  defect: {
    '[ ]': 'start',
    '[an]': 'fix',
    '[fx]': 'verify',
    '[vf]': 'done',
    '[xx]': '-',
  },
  infrastructure: {
    '[ ]': 'start',
    '[ds]': 'build',
    '[im]': 'done',
    '[xx]': '-',
  },
};

/**
 * 상태 코드 추출
 */
function extractStatusCode(status) {
  if (!status) return '[ ]';
  const match = status.match(/\[([^\]]+)\]/);
  return match ? `[${match[1]}]` : '[ ]';
}

/**
 * 다음 액션 결정
 */
function getNextAction(category, statusCode) {
  const categoryMap = NEXT_ACTION_MAP[category];
  if (!categoryMap) return 'start';
  return categoryMap[statusCode] || 'start';
}

/**
 * Task 정렬 (우선순위 → ID)
 */
function sortTasks(tasks) {
  return tasks.sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.priority] ?? 2;
    const priorityB = PRIORITY_ORDER[b.priority] ?? 2;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return a.id.localeCompare(b.id);
  });
}

/**
 * 실행 가능한 Task 필터링
 * @param {Array} nodes - WBS 노드 목록
 * @param {Object} options - 옵션
 * @param {string} options.category - 카테고리 필터
 * @param {boolean} options.ignoreDeps - 의존관계 무시 (설계 단계용)
 */
function getExecutableTasks(nodes, options = {}) {
  // Task ID → Node 맵
  const taskMap = new Map();
  for (const node of nodes) {
    if (node.type === 'task') {
      taskMap.set(node.id, node);
    }
  }

  const executable = [];
  const waiting = [];

  for (const node of nodes) {
    if (node.type !== 'task') continue;

    const statusCode = extractStatusCode(node.status);

    // 완료된 Task 제외
    if (statusCode === '[xx]') continue;

    // 카테고리 필터
    if (options.category && node.category !== options.category) continue;

    const category = node.category || 'development';

    // 의존관계 무시 옵션 (설계 단계용)
    if (options.ignoreDeps) {
      executable.push({
        id: node.id,
        title: node.title,
        category,
        status: statusCode,
        priority: node.priority || 'medium',
        nextAction: getNextAction(category, statusCode),
      });
      continue;
    }

    // 의존성 검사
    const blockedBy = [];
    if (node.attributes?.depends) {
      const depIds = node.attributes.depends.split(',').map(id => id.trim());
      for (const depId of depIds) {
        const depTask = taskMap.get(depId);
        if (depTask) {
          const depStatus = extractStatusCode(depTask.status);
          if (depStatus !== '[xx]') {
            blockedBy.push(depId);
          }
        }
      }
    }

    if (blockedBy.length === 0) {
      executable.push({
        id: node.id,
        title: node.title,
        category,
        status: statusCode,
        priority: node.priority || 'medium',
        nextAction: getNextAction(category, statusCode),
      });
    } else {
      waiting.push({
        id: node.id,
        title: node.title,
        blockedBy,
        priority: node.priority || 'medium',
      });
    }
  }

  return {
    executable: sortTasks(executable),
    waiting: sortTasks(waiting).map(({ priority, ...rest }) => rest),
  };
}

/**
 * 표 형식 출력
 */
function printTable(result) {
  const { executable, waiting } = result;

  console.log(`\n🎯 실행 가능한 Task (${executable.length}개)\n`);

  if (executable.length > 0) {
    console.log('  #  | Task ID        | 카테고리       | 우선순위 | 다음 액션');
    console.log(' ----+----------------+---------------+---------+----------');

    executable.forEach((task, i) => {
      const num = String(i + 1).padStart(2, ' ');
      const id = task.id.padEnd(14, ' ');
      const cat = task.category.padEnd(13, ' ');
      const pri = task.priority.padEnd(7, ' ');
      console.log(`  ${num} | ${id} | ${cat} | ${pri} | ${task.nextAction}`);
    });
  } else {
    console.log('  (없음)');
  }

  if (waiting.length > 0) {
    console.log(`\n⏳ 대기 중 (${waiting.length}개)`);
    for (const task of waiting) {
      console.log(`  - ${task.id}: ${task.blockedBy.join(', ')} 완료 대기`);
    }
  }

  console.log('');
}

/**
 * 입력 문자열 파싱 (project/task-id 또는 task-id)
 * @param {string} input - 입력 문자열
 * @returns {{ projectId: string|null, taskId: string|null }}
 */
function parseInput(input) {
  if (!input) return { projectId: null, taskId: null };

  if (input.includes('/')) {
    const [projectId, taskId] = input.split('/');
    return { projectId, taskId };
  }

  // Task ID 패턴: TSK-XX-XX 또는 TSK-XX-XX-XX
  if (/^TSK-\d{2}(-\d{2}){1,2}$/.test(input)) {
    return { projectId: null, taskId: input };
  }

  // 그 외는 프로젝트 ID로 간주
  return { projectId: input, taskId: null };
}

/**
 * 선택지 출력 (여러 프로젝트에서 Task 발견 시)
 * @param {string} taskId - Task ID
 * @param {Array<{projectId: string, task: Object}>} found - 발견된 결과
 */
function printProjectSelection(taskId, found) {
  console.log(`\n[INFO] Task '${taskId}'가 여러 프로젝트에 존재합니다:\n`);
  found.forEach((r, i) => {
    const title = r.task.title || '(제목 없음)';
    console.log(`  ${i + 1}. ${r.projectId} - ${r.task.id}: ${title}`);
  });
  console.log(`\n다음 형식으로 재실행하세요: npx jjiban next-task {project}/${taskId}\n`);
}

/**
 * next-task 명령어 실행
 * @param {string} input - 입력 (project/task-id, task-id, 또는 project-id)
 * @param {Object} options - commander 옵션
 */
export async function nextTaskCommand(input, options) {
  try {
    const projectRoot = process.cwd();
    const wbsReader = new WbsReader(projectRoot);

    // 입력 파싱
    let { projectId, taskId } = parseInput(input);

    // --project 옵션 우선
    if (options.project) {
      projectId = options.project;
    }

    // 프로젝트 목록 조회
    const projects = await wbsReader.getAllProjects();

    if (projects.length === 0) {
      throw new JjibanError('PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다');
    }

    // 프로젝트 해결 로직
    if (projects.length === 1) {
      // 프로젝트 1개 → 자동 선택
      projectId = projects[0];
    } else if (!projectId && taskId) {
      // 여러 개 + Task ID만 → 전체 검색
      const found = await wbsReader.searchTaskInAllProjects(taskId);

      if (found.length === 0) {
        throw new JjibanError('TASK_NOT_FOUND', `Task '${taskId}'를 찾을 수 없습니다`);
      } else if (found.length === 1) {
        // 1개 발견 → 자동 선택
        projectId = found[0].projectId;
      } else {
        // 여러 개 발견 → 선택지 출력
        printProjectSelection(taskId, found);
        process.exitCode = 0;
        return;
      }
    } else if (!projectId) {
      // 프로젝트 여러 개 + 입력 없음 → 기존 방식 (첫 번째 또는 default)
      projectId = await wbsReader.detectProjectId();
      if (!projectId) {
        throw new JjibanError('PROJECT_NOT_FOUND', '프로젝트를 지정하세요');
      }
    }

    // 프로젝트 존재 확인
    if (!projects.includes(projectId)) {
      throw new JjibanError('PROJECT_NOT_FOUND', `프로젝트 '${projectId}'를 찾을 수 없습니다`);
    }

    // WBS 읽기
    const nodes = await wbsReader.readWbs(projectId);

    // 실행 가능한 Task 필터링
    const result = getExecutableTasks(nodes, {
      category: options.category,
      ignoreDeps: options.ignoreDeps,
    });

    // 출력
    if (options.table) {
      console.log(`\n📁 프로젝트: ${projectId}\n`);
      printTable(result);
    } else {
      console.log(JSON.stringify({ projectId, ...result }, null, 2));
    }

    process.exitCode = 0;
  } catch (error) {
    handleError(error);
  }
}

/**
 * 에러 핸들링
 */
function handleError(error) {
  if (error instanceof JjibanError) {
    console.error(JSON.stringify({ error: error.code, message: error.message }));
    process.exitCode = 1;
  } else {
    console.error(JSON.stringify({ error: 'UNKNOWN', message: error.message }));
    process.exitCode = 1;
  }
}
