import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'
import TestView from '../views/TestView.vue'

describe('App', () => {
  it('renders the Kraeplin test view', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: TestView }],
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Tes Kraeplin')
  })
})
