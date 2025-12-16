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

    const category = node.category || 'development';

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
 * next-task 명령어 실행
 * @param {string} projectId - 프로젝트 ID (optional)
 * @param {Object} options - commander 옵션
 */
export async function nextTaskCommand(projectId, options) {
  try {
    const projectRoot = process.cwd();
    const wbsReader = new WbsReader(projectRoot);

    // 프로젝트 ID 결정
    const pid = projectId || await wbsReader.detectProjectId();
    if (!pid) {
      throw new JjibanError('PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다');
    }

    // WBS 읽기
    const nodes = await wbsReader.readWbs(pid);

    // 실행 가능한 Task 필터링
    const result = getExecutableTasks(nodes, {
      category: options.category,
    });

    // 출력
    if (options.table) {
      printTable(result);
    } else {
      console.log(JSON.stringify(result, null, 2));
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
