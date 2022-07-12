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
  // 并且动态添加到 vNode 对象中 { tag, props, children, el, }
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
    // 如果是字符串 直接挂载
    if (typeof vNode.children === 'string') {
      el.textContent = vNode.children
    } else {
      // 如果是数组 遍历后递归调用
      vNode.children.forEach(element => {
        mount(element, el)
      });
    }
  }
  // 4. vNode 挂载到 DOM
  container.appendChild(el)
}

// diff 算法
// 传入两个 vNode {}
const patch = function (n1, n2) {
  // 如果标签名不一样 n2 替换 n1
  if (n1.tag !== n2.tag) {
    /* 
      + 因为 n1 是 vNode 其中 el 是 DOM
      + 所以要记录 当前 vNode 的 父节点 使用下方语句
    */
    const n1ElParent = n1.el.parentElement

    console.log(n1ElParent, n1.el, n1.tag, n2.tag)
    // 移除当前 vNode
    /* 
      这里会造成一个结果 如果不相等的话
      之后的元素位置都会上移一位
    */
    n1ElParent.removeChild(n1.el)
    // 重新挂载 vNode
    mount(n2, n1ElParent)
  } 
  // tag 相同
  else {
    // 1. 取出 element对象 并在 n2 种保存
    /* 
      + 为什么将 n1 的真实 dom 在 n2 种保存 ？
        + 因为 n2 是新的 vNode 里面没有 真实 dom
        + 这个步骤相当于 直接在 n2 上面创建真实 dom
        相当于 createElement
        + 创建出一个新的节点 DOM 最后
    */
    const el = n2.el = n1.el
    console.log(n1.el, n2.el)

    // 2.处理 props 更新属性
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    // console.log(n1.props, n2.props)

    // 2.1 获取新的 newProps 添加到 el
    for (const key in newProps) {
      const oldValue = oldProps[key]
      const newValue = newProps[key]
      // 新旧进行对比 
      if (newValue !== oldValue) {
        if (key.startsWith('on')) { 
          el.addEventListener(key.slice(2).toLowerCase(), newValue)
        } else {
          // key: newValue => class: show-go
          el.setAttribute(key, newValue)
        }
      }
    }
    // 2.2 删除旧的 props
    for (const key in oldProps) {
      // 遍历旧的 如果旧的不在新的里面
      if (!(key in newProps)) {
        if (key.startsWith('on')) {
          const value = oldProps[key]
          el.removeEventListener(key.slice(2).toLowerCase(), value)
        } else {
          el.removeAttribute(key)
        }
      }
    }

    // 3.处理 children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []

    // 边界判断
    if (typeof newChildren === 'string') {
      /* 
        + 因为新的为 string 
          + 不管如何都是直接覆盖的
          + 旧的为 string 只需要使用 textContent 修改内容
          + 旧的为 array 就要使用 innerHTML 添加
      */
      // 情况一: 如果新的是 string 旧的也是 string
      if (typeof oldChildren === 'string') {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren
        }
      } else {
        el.innerHTML = newChildren
      }
    } else { 
      // 情况二: newChildren 是一个 []
      if (typeof oldChildren === 'string') {
        // 先把原来的字符串清空
        el.innerHTML = ''
        newChildren.forEach(item => {
          mount(item, el)
        })
      } else {
        // 旧的也是一个数组
        /* 
         + oldChildren: [v2]
         + newChildren: [v1, v2]
         + 这里会有三种情况
          + 新的长度 大于 旧的长度
          + 旧的长度 大于 新的长度
          + 两者相等
        */
        // 这时就会进行 diff 算法

        // 先提取出前面公共的部分
        const commonLength = Math.min(oldChildren.length, newChildren.length)
        for (let i = 0; i < commonLength; i++) {
          // 递归调用 数组里面的值进行比较
          console.log(oldChildren[i], newChildren[i], 'child')
          patch(oldChildren[i], newChildren[i])
        }

        if (newChildren.length > oldChildren.length) {
          // 新的长 截取新的后面部分添加进去
          newChildren.slice(oldChildren.length).forEach(item => {
            // 
            mount(item, el)
          })
        }

        if (newChildren < oldChildren.length) {
          // 旧的长 把旧的后面部分移除
          oldChildren.slice(newChildren.length).forEach(item => {
            el.removeChild(item.el)
          })
        }
      }
    }
  }
}


