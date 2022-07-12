// h 函数的作用 就是返回一个 虚拟节点 vNode
const h = (tag, props, children) => {
  // vNode 就是 一个 对象 {}
  return {
    tag, // 标签名
    props, // 属性
    children // 孩子
  }
}

const mount = (vNode, container) => {
  // vNode => element
  // 1. 处理 tag
  // 根据 vNode 的 标签名 tag 创建一个 真实 dom 
  // 并且添加到 vNode 对象中
  let el = vNode.el = document.createElement(vNode.tag)
  
  // 2. 处理 props
  if (vNode.props) {
    for (const key in vNode.props) {
      const value = vNode.props[key]

      //用来判断当前字符串是否以另外一个给定的子字符串开头 处理点击事件
      if (key.startsWith('on')) { 
        /* 
         + (event, function, useCapture)
          + 不要使用 "on" 前缀。例如，使用 "click" 来取代 "onclick"
          + 必需。描述了事件触发后执行的函数
          + 可选。布尔值，指定事件是否 在捕获或冒泡阶段执行
        */
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        // setAttribute() 方法创建或改变某个新属性
        el.setAttribute(key, value)
      }
    }
  }

  // 3.处理 children
  // 树状结构
  // 
  if (vNode.children) {
    // 如果是字符串
    if (typeof vNode.children === 'string') {
      el.textContent = vNode.children
    } else {
      // 如果是 一个新的节点
      vNode.children.forEach(element => {
        mount(element, el)
      });
    }
  }
  // 4. vNode 挂载到 DOM
  container.appendChild(el)
}




