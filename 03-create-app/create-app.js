/* 
+ 根据平时挂载 vue
  + const app = createApp(App)
  + app.mount('#app')
+ 所以传入一个根组件 然后一定会返回一个挂载函数
+ 
*/

function createApp(rootComponent) {
  return {
    // 传入选择器
    mount(selector) {
      // 根据选择器获取真实 DOM
      const container = document.querySelector(selector)
      /* 
      + 第一次进入页面的时候 是对跟组件进行挂载
      + 第二次进入的时候就只需要刷新 那么应该做 patch 操作
      + 
      */
      let isMounted = false
      let oldVNode = null

      watchEffect(function() {
        // 第一次挂载 调用 render 时 会使用 变量 那么 watchEffect 会收集依赖函数 
        if (!isMounted) {
          // 记录旧的 VNode
          oldVNode = rootComponent.render()
          mount(oldVNode, container)
          isMounted = true
        } else {
          const newVNode = rootComponent.render()
          patch(oldVNode, newVNode)
          oldVNode = newVNode
        }
      })
    }
  }
}