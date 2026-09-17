import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import TestView from '../views/TestView.vue'

describe('TestView', () => {
  it('checks the units digit immediately and updates the running score', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const wrapper = mount(TestView)
    const input = wrapper.get('input')

    await input.setValue('2')

    expect(wrapper.text()).toContain('Benar')
    expect(wrapper.text()).toMatch(/Benar\s*1/)
    expect(wrapper.text()).toMatch(/Salah\s*0/)

    vi.restoreAllMocks()
  })

  it('does not apply one digit to the next pair', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const wrapper = mount(TestView)
    await wrapper.get('input').setValue('9')

    expect(wrapper.text()).toMatch(/Salah\s*1/)
    expect(wrapper.text()).toMatch(/Benar\s*0/)
    expect(wrapper.text()).toContain('1 + 1 = ?')

    vi.restoreAllMocks()
  })

  it('ignores non-numeric answer input', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const wrapper = mount(TestView)
    const input = wrapper.get('input')

    await input.setValue('a')
    await nextTick()

    expect((input.element as HTMLInputElement).value).toBe('')
    expect(wrapper.text()).toMatch(/Benar\s*0/)
    expect(wrapper.text()).toMatch(/Salah\s*0/)

    vi.restoreAllMocks()
  })

  it('starts a new column at the end and keeps the running score', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const wrapper = mount(TestView)

    for (let i = 0; i < 11; i++) {
      await wrapper.get('input').setValue('2')
      await nextTick()
      await nextTick()
    }

    expect(wrapper.text()).toMatch(/Benar\s*11/)
    expect(wrapper.text()).toContain('11/11')
    expect(wrapper.text()).toContain('1 + 1 = ?')
    expect(wrapper.find('input').exists()).toBe(true)

    vi.restoreAllMocks()
  })
})
