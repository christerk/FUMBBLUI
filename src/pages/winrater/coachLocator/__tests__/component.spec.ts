import { mount, VueWrapper } from '@vue/test-utils'
// @ts-ignore
import Component from '../Component.vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { load } from '../service'
import { Store } from '../../rating/store'
import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMatchStore } from '../../pinia/store'

vi.mock('../service')

describe('Coach locator component', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(Component, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })]
      }
    })
    vi.restoreAllMocks()
  })

  it('shows error if coach data could not be loaded', async () => {
    const matchStore = useMatchStore()
    const { stores } = storeToRefs(matchStore)

    const mockedErrorMessage = 'mocked error message'
    vi.mocked(load).mockImplementation((store: Store, errorMessage: Ref<string>): Promise<void> => {
      errorMessage.value = mockedErrorMessage
      return Promise.resolve()
    })

    const textField = wrapper.find('#coachName')
    await wrapper.find('.addButton').trigger('click')

    expect(wrapper.find('.error').text()).toBe(mockedErrorMessage)
    expect(textField.text()).toBe('')
    expect(stores.value.size).toBe(0)
  })

  it('adds new store for coach data', async () => {
    const coachName = 'givenCoachName'

    vi.mocked(load).mockImplementation((): Promise<void> => {
      return Promise.resolve()
    })

    const textField = wrapper.find('#coachName')
    await textField.setValue(coachName)
    await wrapper.find('.addButton').trigger('click')

    expect(wrapper.find('.error').text()).toBe('')
    expect(textField.text()).toBe('')
  })

  it('aborts for duplicate coach', async () => {
    const { stores } = storeToRefs(useMatchStore())
    const coachName = 'givenCoachName'

    stores.value.set(coachName, new Store(coachName))

    const textField = wrapper.find('#coachName')
    await textField.setValue(coachName)
    await wrapper.find('.addButton').trigger('click')

    expect(load).toHaveBeenCalledTimes(0)
    expect(wrapper.find('.error').text()).toBe('')
    expect(textField.text()).toBe('')
    expect(stores.value.size).toBe(1)
    expect(stores.value.has(coachName))
    expect(stores.value.get(coachName)?.coachName).toBe(coachName)
  })
})
