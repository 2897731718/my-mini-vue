/* 
+ 实现响应式
  + 因为变量改变了 对应的数据需要发生改变
  + 而这些改变就是使用了这个变量的函数
    + 这种函数就被称为副作用函数
  + 那么就应该收集这些变量对应的函数 到时候自动调用这些副作用函数
  + 这里使用一个 Dep 类来收集
    + 里面使用 set 来收集 可以去重
    + 然后可以向类里面添加方法
  + 

*/

// 用于收集 副作用函数
class Dep {
  constructor() {
    // 使用 set 去重
    this.subscribes = new Set()
  }

  // 用于向 set 中添加 副作用函数
  // addEffect(effect) {
  //   this.subscribes.add(effect)
  // }

  depend() {
    if (activeEffect) {
      this.subscribes.add(activeEffect)
    }
  }

  // 通知执行所有 副作用函数
  notify() {
    this.subscribes.forEach(effect => {
      effect()
    })
  }
}

// 使用 watchEffect 函数收集副作用函数 添加依赖

/* 
+ 但是 addEffect 这种方法有弊端
  + 他要传递依赖函数才能够添加进去
+ 所以要进行一个 升级
  + 不需要依赖 effect 
  + 只需要调用 dep 中的一个方法 就能够自动收集
*/
// function watchEffect(effect) {
//   dep.addEffect(effect)
// }

/* 
+ 使用 activeEffect 来判断
  + 刚开始为 null 把 effect 赋值给 activeEffect
  + 调用 dep.depend() 里面会判断 effect 是否有值
  + 有值就添加进去 就不需要知道 effect 是什么了 只要不为 null 就添加
  + 最后重新把 activeEffect 赋值为 null 用于下一轮收集
*/
let activeEffect = null
function watchEffect(effect) {
  activeEffect = effect
  // 调用函数 自动收集
  dep.depend()
  // effect 默认执行一次
  effect()
  activeEffect = null
}

const info = { counter: 100 }

const dep = new Dep()

watchEffect(() => {
  console.log(info.counter * 2)
})

watchEffect(() => {
  console.log(info.counter * info.counter)
})

info.counter++
dep.notify()