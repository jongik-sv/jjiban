/**
 * AppLayout 컴포넌트 단위 테스트
 * Task: TSK-08-03
 * Test Spec: 026-test-specification.md
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppLayout from '~/components/layout/AppLayout.vue'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'

describe('AppLayout', () => {
  // ==================== TC-UNIT-01: Props 유효성 검증 ====================

  describe('Props Validation', () => {
    describe('TC-UNIT-01-A: leftWidth 하한 제한 (30%)', () => {
      it('leftWidth < 30일 때 validatedLeftWidth는 30을 반환해야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 20 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.validatedLeftWidth).toBe(30)
      })

      it('leftWidth = 10일 때 validatedLeftWidth는 30을 반환해야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 10 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.validatedLeftWidth).toBe(30)
      })
    })

    describe('TC-UNIT-01-B: leftWidth 상한 제한 (80%)', () => {
      it('leftWidth > 80일 때 validatedLeftWidth는 80을 반환해야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 90 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.validatedLeftWidth).toBe(80)
      })

      it('leftWidth = 100일 때 validatedLeftWidth는 80을 반환해야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 100 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.validatedLeftWidth).toBe(80)
      })
    })

    describe('TC-UNIT-01-C: leftWidth 정상 범위', () => {
      it('leftWidth = 60일 때 validatedLeftWidth는 60을 반환해야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 60 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.validatedLeftWidth).toBe(60)
      })

      it('leftWidth = 50일 때 validatedLeftWidth는 50을 반환해야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 50 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.validatedLeftWidth).toBe(50)
      })

      it('leftWidth = 30일 때 validatedLeftWidth는 30을 반환해야 함 (경계값)', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 30 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.validatedLeftWidth).toBe(30)
      })

      it('leftWidth = 80일 때 validatedLeftWidth는 80을 반환해야 함 (경계값)', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 80 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.validatedLeftWidth).toBe(80)
      })
    })

    describe('TC-UNIT-01-D: rightWidth 계산', () => {
      it('leftWidth = 60일 때 rightWidth는 40이어야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 60 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.rightWidth).toBe(40)
      })

      it('leftWidth = 70일 때 rightWidth는 30이어야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 70 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.rightWidth).toBe(30)
      })

      it('leftWidth = 30일 때 rightWidth는 70이어야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { leftWidth: 30 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.rightWidth).toBe(70)
      })
    })
  })

  // ==================== TC-UNIT-02: minSize 변환 로직 ====================

  describe('minSize Conversion', () => {
    describe('TC-UNIT-02-A: minLeftWidth px → % 변환', () => {
      it('minLeftWidth = 400px일 때 minLeftSizePercent는 33.33%이어야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { minLeftWidth: 400 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.minLeftSizePercent).toBeCloseTo(33.33, 2)
      })

      it('minLeftWidth = 600px일 때 minLeftSizePercent는 50%이어야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { minLeftWidth: 600 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.minLeftSizePercent).toBeCloseTo(50, 2)
      })

      it('minLeftWidth = 240px일 때 minLeftSizePercent는 20%이어야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { minLeftWidth: 240 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.minLeftSizePercent).toBeCloseTo(20, 2)
      })
    })

    describe('TC-UNIT-02-B: minRightWidth px → % 변환', () => {
      it('minRightWidth = 300px일 때 minRightSizePercent는 25%이어야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { minRightWidth: 300 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.minRightSizePercent).toBeCloseTo(25, 2)
      })

      it('minRightWidth = 480px일 때 minRightSizePercent는 40%이어야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { minRightWidth: 480 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.minRightSizePercent).toBeCloseTo(40, 2)
      })

      it('minRightWidth = 360px일 때 minRightSizePercent는 30%이어야 함', () => {
        const wrapper = mount(AppLayout, {
          props: { minRightWidth: 360 },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        expect(vm.minRightSizePercent).toBeCloseTo(30, 2)
      })
    })

    describe('TC-UNIT-02-C: minSize 합계 계산', () => {
      it('minSize 합계가 100% 초과하는 경우 올바르게 계산됨', () => {
        const wrapper = mount(AppLayout, {
          props: {
            minLeftWidth: 800,   // 66.67%
            minRightWidth: 600   // 50%
          },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        const totalMinPercent = vm.minLeftSizePercent + vm.minRightSizePercent

        // 합계가 116.67%로 올바르게 계산됨
        expect(totalMinPercent).toBeCloseTo(116.67, 2)
      })

      it('minSize 합계가 100% 이하인 경우 올바르게 계산됨', () => {
        const wrapper = mount(AppLayout, {
          props: {
            minLeftWidth: 400,   // 33.33%
            minRightWidth: 300   // 25%
          },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        const totalMinPercent = vm.minLeftSizePercent + vm.minRightSizePercent

        // 합계가 58.33%로 올바르게 계산됨
        expect(totalMinPercent).toBeCloseTo(58.33, 2)
      })

      it('minSize 합계가 정확히 100%인 경우 올바르게 계산됨', () => {
        const wrapper = mount(AppLayout, {
          props: {
            minLeftWidth: 600,   // 50%
            minRightWidth: 600   // 50%
          },
          global: {
            components: { Splitter, SplitterPanel }
          }
        })

        const vm = wrapper.vm as any
        const totalMinPercent = vm.minLeftSizePercent + vm.minRightSizePercent

        // 합계가 100%로 올바르게 계산됨
        expect(totalMinPercent).toBeCloseTo(100, 2)
      })
    })
  })

  // ==================== TC-UNIT-03: resize 이벤트 ====================

  describe('resize Event', () => {
    it('TC-UNIT-03: Splitter @resize 이벤트 시 emit 발생', async () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const splitter = wrapper.findComponent(Splitter)

      // Splitter @resize 이벤트 시뮬레이션
      await splitter.vm.$emit('resize', {
        originalEvent: new Event('resize'),
        sizes: [55, 45]
      })

      // resize 이벤트 emit 확인
      expect(wrapper.emitted('resize')).toBeTruthy()
      expect(wrapper.emitted('resize')!.length).toBe(1)
      expect(wrapper.emitted('resize')![0]).toEqual([
        { leftWidth: 55 }
      ])
    })

    it('TC-UNIT-03-B: 여러 번 리사이즈 시 모든 이벤트 emit', async () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const splitter = wrapper.findComponent(Splitter)

      // 첫 번째 리사이즈
      await splitter.vm.$emit('resize', {
        originalEvent: new Event('resize'),
        sizes: [50, 50]
      })

      // 두 번째 리사이즈
      await splitter.vm.$emit('resize', {
        originalEvent: new Event('resize'),
        sizes: [70, 30]
      })

      // 세 번째 리사이즈
      await splitter.vm.$emit('resize', {
        originalEvent: new Event('resize'),
        sizes: [35, 65]
      })

      expect(wrapper.emitted('resize')!.length).toBe(3)
      expect(wrapper.emitted('resize')![0]).toEqual([{ leftWidth: 50 }])
      expect(wrapper.emitted('resize')![1]).toEqual([{ leftWidth: 70 }])
      expect(wrapper.emitted('resize')![2]).toEqual([{ leftWidth: 35 }])
    })

    it('TC-UNIT-03-C: resize 이벤트에서 sizes가 undefined일 때 기본값 사용', async () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const splitter = wrapper.findComponent(Splitter)

      // sizes가 비정상적인 경우
      await splitter.vm.$emit('resize', {
        originalEvent: new Event('resize'),
        sizes: []
      })

      expect(wrapper.emitted('resize')!.length).toBe(1)
      expect(wrapper.emitted('resize')![0]).toEqual([{ leftWidth: 60 }])
    })
  })

  // ==================== TC-UNIT-04: Pass Through API ====================

  describe('Pass Through API', () => {
    it('TC-UNIT-04: Splitter에 Pass Through 객체 전달', () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const splitter = wrapper.findComponent(Splitter)

      expect(splitter.props('pt')).toEqual({
        root: { class: 'app-layout-splitter' },
        gutter: { class: 'app-layout-gutter' },
        gutterHandle: { class: 'app-layout-gutter-handle' }
      })
    })

    it('TC-UNIT-04-B: Pass Through 객체가 일관된 값을 반환', () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const vm = wrapper.vm as any

      const pt1 = vm.splitterPassThrough
      const pt2 = vm.splitterPassThrough

      // Computed가 동일한 구조를 반환
      expect(pt1).toEqual(pt2)
      expect(pt1.root.class).toBe('app-layout-splitter')
      expect(pt1.gutter.class).toBe('app-layout-gutter')
      expect(pt1.gutterHandle.class).toBe('app-layout-gutter-handle')
    })
  })

  // ==================== TC-UNIT-05: Splitter 속성 전달 ====================

  describe('Splitter Properties', () => {
    it('TC-UNIT-05-A: Splitter layout이 horizontal로 설정됨', () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const splitter = wrapper.findComponent(Splitter)
      expect(splitter.props('layout')).toBe('horizontal')
    })

    it('TC-UNIT-05-B: SplitterPanel에 올바른 size 전달', () => {
      const wrapper = mount(AppLayout, {
        props: { leftWidth: 65 },
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const panels = wrapper.findAllComponents(SplitterPanel)
      expect(panels.length).toBe(2)

      // 좌측 패널
      expect(panels[0].props('size')).toBe(65)
      expect(panels[0].props('minSize')).toBeCloseTo(33.33, 2)

      // 우측 패널
      expect(panels[1].props('size')).toBe(35)
      expect(panels[1].props('minSize')).toBeCloseTo(25, 2)
    })

    it('TC-UNIT-05-C: Props 변경 시 SplitterPanel에 반영됨', async () => {
      const wrapper = mount(AppLayout, {
        props: { leftWidth: 60 },
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const panels = wrapper.findAllComponents(SplitterPanel)
      expect(panels[0].props('size')).toBe(60)
      expect(panels[1].props('size')).toBe(40)

      // Props 변경
      await wrapper.setProps({ leftWidth: 70 })

      expect(panels[0].props('size')).toBe(70)
      expect(panels[1].props('size')).toBe(30)
    })
  })

  // ==================== TC-UNIT-06: 슬롯 렌더링 ====================

  describe('Slot Rendering', () => {
    it('TC-UNIT-06-A: header 슬롯이 렌더링됨', () => {
      const wrapper = mount(AppLayout, {
        slots: {
          header: '<div class="custom-header">Custom Header</div>'
        },
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const header = wrapper.find('.custom-header')
      expect(header.exists()).toBe(true)
      expect(header.text()).toBe('Custom Header')
    })

    it('TC-UNIT-06-B: left 슬롯이 렌더링됨', () => {
      const wrapper = mount(AppLayout, {
        slots: {
          left: '<div class="custom-left">WBS Tree</div>'
        },
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const leftContent = wrapper.find('.custom-left')
      expect(leftContent.exists()).toBe(true)
      expect(leftContent.text()).toBe('WBS Tree')
    })

    it('TC-UNIT-06-C: right 슬롯이 렌더링됨', () => {
      const wrapper = mount(AppLayout, {
        slots: {
          right: '<div class="custom-right">Task Detail</div>'
        },
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const rightContent = wrapper.find('.custom-right')
      expect(rightContent.exists()).toBe(true)
      expect(rightContent.text()).toBe('Task Detail')
    })

    it('TC-UNIT-06-D: 슬롯 미제공 시 기본 콘텐츠 표시', () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      // 기본 header 콘텐츠
      expect(wrapper.text()).toContain('jjiban')

      // 기본 left 콘텐츠
      expect(wrapper.text()).toContain('Left Panel (WBS Tree)')

      // 기본 right 콘텐츠
      expect(wrapper.text()).toContain('Right Panel (Task Detail)')
    })
  })

  // ==================== TC-UNIT-07: ARIA 및 접근성 ====================

  describe('ARIA and Accessibility', () => {
    it('TC-UNIT-07-A: 루트 요소에 data-testid 존재', () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const root = wrapper.find('[data-testid="app-layout"]')
      expect(root.exists()).toBe(true)
    })

    it('TC-UNIT-07-B: Header에 적절한 role 속성', () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const header = wrapper.find('[data-testid="app-header-container"]')
      expect(header.attributes('role')).toBe('banner')
    })

    it('TC-UNIT-07-C: Left panel에 적절한 role 속성', () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const leftPanel = wrapper.find('[data-testid="left-panel"]')
      expect(leftPanel.attributes('role')).toBe('complementary')
      expect(leftPanel.attributes('aria-label')).toBe('WBS Tree Panel')
    })

    it('TC-UNIT-07-D: Right panel에 적절한 role 속성', () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const rightPanel = wrapper.find('[data-testid="right-panel"]')
      expect(rightPanel.attributes('role')).toBe('region')
      expect(rightPanel.attributes('aria-label')).toBe('Task Detail')
    })

    it('TC-UNIT-07-E: Main 영역에 적절한 role 속성', () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const main = wrapper.find('[data-testid="app-content"]')
      expect(main.attributes('role')).toBe('main')
    })
  })

  // ==================== TC-UNIT-08: 기본 Props 값 ====================

  describe('Default Props', () => {
    it('TC-UNIT-08-A: Props 미제공 시 기본값 사용', () => {
      const wrapper = mount(AppLayout, {
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const vm = wrapper.vm as any

      // 기본 leftWidth = 60
      expect(vm.validatedLeftWidth).toBe(60)
      expect(vm.rightWidth).toBe(40)

      // 기본 minLeftWidth = 400
      expect(vm.minLeftSizePercent).toBeCloseTo(33.33, 2)

      // 기본 minRightWidth = 300
      expect(vm.minRightSizePercent).toBeCloseTo(25, 2)
    })

    it('TC-UNIT-08-B: 일부 Props만 제공 시 나머지는 기본값 사용', () => {
      const wrapper = mount(AppLayout, {
        props: {
          leftWidth: 55
          // minLeftWidth, minRightWidth는 기본값 사용
        },
        global: {
          components: { Splitter, SplitterPanel }
        }
      })

      const vm = wrapper.vm as any

      expect(vm.validatedLeftWidth).toBe(55)
      expect(vm.minLeftSizePercent).toBeCloseTo(33.33, 2)
      expect(vm.minRightSizePercent).toBeCloseTo(25, 2)
    })
  })
})
