function injectStyles() {
  if (window) {
    let isInjected
    if (!isInjected) {
      const head = document.head
      const style = document.createElement('style')
  
      style.type = 'text/css'

      style.appendChild(document.createTextNode(require('./styles.sass')))
      head.appendChild(style)
      isInjected = true
    }
  }
}

injectStyles() // add styles to head

function style(el, value) {
  el.style['transform'] = value
}

const RippleDataAttribute = 'data-ripple'

const RippleShow = (e, el, { value = {} }) => {
  if (el.getAttribute(RippleDataAttribute) !== 'true') return

  const container = document.createElement('span')
  const animation = document.createElement('span')

  container.appendChild(animation)
  container.className = '__vue__ripple__container'

  if (value.class) container.className += ` ${value.class}`

  const size = el.clientWidth > el.clientHeight
    ? el.clientWidth
    : el.clientHeight

  animation.className = '__vue__ripple__animation'
  animation.style.width = `${size * (value.center ? 1 : 2)}px`
  animation.style.height = animation.style.width

  el.appendChild(container)
  const computed = window.getComputedStyle(el)
  if (computed.position !== 'absolute' && computed.position !== 'fixed') el.style.position = 'relative'

  const offset = el.getBoundingClientRect()
  const x = value.center ? '50%' : `${e.clientX - offset.left}px`
  const y = value.center ? '50%' : `${e.clientY - offset.top}px`

  animation.classList.add('__vue__ripple__animation--enter')
  animation.classList.add('__vue__ripple__animation--visible')
  style(animation, `translate(-50%, -50%) translate(${x}, ${y}) scale3d(0.01,0.01,0.01)`)
  animation.dataset.activated = Date.now()

  setTimeout(() => {
    animation.classList.remove('__vue__ripple__animation--enter')
    style(animation, `translate(-50%, -50%) translate(${x}, ${y})  scale3d(0.99,0.99,0.99)`)
  }, 0)
}

const RippleHide = (el) => {
  if (el.getAttribute(RippleDataAttribute) !== 'true') return

  const ripples = el.getElementsByClassName('__vue__ripple__animation')
  if (ripples.length === 0) return

  const animation = ripples[ripples.length - 1]
  const diff = Date.now() - Number(animation.dataset.activated)
  let delay = 400 - diff

  delay = delay < 0 ? 0 : delay

  setTimeout(() => {
    animation.classList.remove('__vue__ripple__animation--visible')

    setTimeout(() => {
      try{
        if (ripples.length < 1) el.style.position = null
        animation.parentNode && el.removeChild(animation.parentNode)
      } catch(e) {}
    }, 100)
  }, delay)
}

function isRippleEnabled(binding) {
  return typeof binding.value === 'undefined' || !!binding.value
}

function directive(el, binding) {
  el.setAttribute(RippleDataAttribute, isRippleEnabled(binding))

  if ('ontouchstart' in window) {
    el.addEventListener('touchend', () => RippleHide(el), false)
    el.addEventListener('touchcancel', () => RippleHide(el), false)
  }

  el.addEventListener('mousedown', e => RippleShow(e, el, binding), false)

  el.addEventListener('mouseup', () => RippleHide(el), false)
  el.addEventListener('mouseleave', () => RippleHide(el), false)
  el.addEventListener('dragstart', () => RippleHide(el), false)
}

function unbind(el, binding) {
  el.removeEventListener('touchstart', e => RippleShow(e, el, binding), false)
  el.removeEventListener('mousedown', e => RippleShow(e, el, binding), false)

  el.removeEventListener('touchend', () => RippleHide(el), false)
  el.removeEventListener('touchcancel', () => RippleHide(el), false)
  el.removeEventListener('mouseup', () => RippleHide(el), false)
  el.removeEventListener('mouseleave', () => RippleHide(el), false)
  el.removeEventListener('dragstart', () => RippleHide(el), false)
}

function update(el, binding) {
  if (binding.value === binding.oldValue) {
    return
  }

  el.setAttribute(RippleDataAttribute, isRippleEnabled(binding))
}

export default {
  name: 'ripple',
  bind: directive,
  unbind: unbind,
  update: update
}