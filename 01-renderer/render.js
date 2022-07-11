// h 函数的作用 就是返回一个 虚拟节点 vNode
const h = (tag, props, children) => {
  // vNode 就是 一个 对象 {}
  return {
    tag,
    props,
    children
  }
}