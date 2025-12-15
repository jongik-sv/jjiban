import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountWithPinia, findByTestId, flushPromises } from '../../../helpers/component-helpers';
import WbsTreePanel from '../../../../app/components/wbs/WbsTreePanel.vue';
import { useWbsStore } from '../../../../app/stores/wbs';
import { complexWbsTree, emptyWbsTree } from '../../../fixtures/mock-data/wbs-nodes';

describe('WbsTreePanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('TC-200: 초기 마운트 시 fetchWbs 호출', async () => {
      // Given: Mock store
      const wrapper = mountWithPinia(WbsTreePanel, {
        props: { projectId: 'test-project' }
      });
      const store = useWbsStore();
      const fetchSpy = vi.spyOn(store, 'fetchWbs');

      // When: 컴포넌트 마운트
      await flushPromises();

      // Then: fetchWbs 호출됨
      expect(fetchSpy).toHaveBeenCalledWith('test-project');
    });

    it('TC-201: 로딩 상태 표시', async () => {
      // Given: 로딩 중 store
      const wrapper = mountWithPinia(WbsTreePanel, {
        props: { projectId: 'test-project' }
      });
      const store = useWbsStore();
      store.loading = true;

      await wrapper.vm.$nextTick();

      // Then: 로딩 스피너 표시
      const loadingEl = findByTestId(wrapper, 'wbs-loading');
      expect(loadingEl.exists()).toBe(true);
      expect(loadingEl.isVisible()).toBe(true);
    });

    it('TC-202: 에러 상태 표시', async () => {
      // Given: 에러 상태 store
      const wrapper = mountWithPinia(WbsTreePanel, {
        props: { projectId: 'test-project' }
      });
      const store = useWbsStore();
      store.error = 'Failed to load WBS';
      store.loading = false;

      await wrapper.vm.$nextTick();

      // Then: 에러 메시지 표시
      const errorEl = findByTestId(wrapper, 'wbs-error');
      expect(errorEl.exists()).toBe(true);
      expect(errorEl.text()).toContain('Failed to load WBS');
    });

    it('TC-203: 빈 데이터 상태 표시', async () => {
      // Given: 빈 트리 store
      const wrapper = mountWithPinia(WbsTreePanel, {
        props: { projectId: 'test-project' }
      });
      const store = useWbsStore();
      store.tree = [];
      store.loading = false;
      store.error = null;

      await wrapper.vm.$nextTick();

      // Then: 빈 상태 메시지 표시
      const emptyEl = findByTestId(wrapper, 'wbs-empty');
      expect(emptyEl.exists()).toBe(true);
    });

    it('TC-204: 정상 데이터 렌더링', async () => {
      // Given: 데이터 있는 store
      const wrapper = mountWithPinia(WbsTreePanel, {
        props: { projectId: 'test-project' }
      });
      const store = useWbsStore();
      store.tree = [complexWbsTree];
      store.loading = false;
      store.error = null;

      await wrapper.vm.$nextTick();

      // Then: 헤더와 트리 콘텐츠 표시
      expect(findByTestId(wrapper, 'wbs-tree-header').exists()).toBe(true);
      expect(findByTestId(wrapper, 'wbs-tree-content').exists()).toBe(true);
      expect(wrapper.find('[data-testid="wbs-loading"]').exists()).toBe(false);
    });
  });

  describe('컴포넌트 통합', () => {
    it('TC-205: WbsTreeHeader 포함', async () => {
      // Given: 마운트
      const wrapper = mountWithPinia(WbsTreePanel, {
        props: { projectId: 'test-project' }
      });
      const store = useWbsStore();
      store.tree = [complexWbsTree];
      store.loading = false;

      await wrapper.vm.$nextTick();

      // Then: 헤더 컴포넌트 존재
      const header = wrapper.findComponent({ name: 'WbsTreeHeader' });
      expect(header.exists()).toBe(true);
    });

    it('TC-206: WbsSummaryCards 포함', async () => {
      // Given: 마운트
      const wrapper = mountWithPinia(WbsTreePanel, {
        props: { projectId: 'test-project' }
      });
      const store = useWbsStore();
      store.tree = [complexWbsTree];
      store.loading = false;

      await wrapper.vm.$nextTick();

      // Then: 요약 카드 컴포넌트 존재
      const cards = wrapper.findComponent({ name: 'WbsSummaryCards' });
      expect(cards.exists()).toBe(true);
    });
  });
});
