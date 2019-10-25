import Vue from 'vue'
import { assert } from 'chai'

import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import { resetStyled } from './utils'

let styled

describe('extending styled', () => {
  beforeEach(() => {
    styled = resetStyled()
  })

  it('should change the target element', () => {
    const OldTarget = styled.div`color: blue;`
    const NewTarget = OldTarget.withComponent('a')

    const o = new Vue(OldTarget).$mount()
    const n = new Vue(NewTarget).$mount()

    assert(o._vnode.tag === 'div');
    assert(n._vnode.tag === 'a');
  })
})
