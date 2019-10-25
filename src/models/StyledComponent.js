import css from '../constructors/css'
import normalizeProps from '../utils/normalizeProps'
import { createComponent, computed, watch, inject, createElement as h, ref } from '@vue/composition-api'

export default (ComponentStyle) => {
  const createStyledComponent = (target, rules, props) => {
    const componentStyle = new ComponentStyle(rules)

    // handle array-declaration props
    const currentProps = normalizeProps(props)
    const prevProps = normalizeProps(target.props)

    const StyledComponent = createComponent({
      props: {
        value: null,
        ...currentProps,
        ...prevProps
      },
      setup (initProps, setupContext) {
        const localValue = ref(initProps.value)
        const injectedTheme = inject('$theme', () => ({}))
        const theme = computed(() => injectedTheme())
        const generatedClassName = computed(() => {
          const componentProps = { theme: theme.value, ...initProps }
          return componentStyle.generateAndInjectStyles(componentProps)
        })

        watch(() => setupContext.emit('input', localValue.value))

        return () => {
          const children = []

          for (const slot in setupContext.slots) {
            if (slot === 'default') {
              children.push(setupContext.slots[slot]())
            } else {
              children.push(h('template', { slot }, setupContext.slots[slot]()))
            }
          }

          return h(target, {
            class: [generatedClassName.value],
            props: initProps,
            domProps: {
              value: localValue.value
            },
            on: {
              ...setupContext.listeners,
              input: event => {
                if (event && event.target) {
                  localValue.value = event.target.value
                }
              }
            },
            scopedSlots: setupContext.slots
          },
          children)
        }
      },

      extend (cssRules, ...interpolations) {
        const extendedRules = css(cssRules, ...interpolations)
        return createStyledComponent(target, rules.concat(extendedRules), props)
      },

      withComponent (newTarget) {
        return createStyledComponent(newTarget, rules, props)
      }
    })

    return StyledComponent
  }

  return createStyledComponent
}
