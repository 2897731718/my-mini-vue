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
  // dep.depend()
  // effect 默认执行一次
  effect()
  activeEffect = null
}

/* 
+ 因为要对每一个值都收集依赖 
  + 这里使用 weakMap 弱引用
  + map 里面存的是 监听的 对象
    + 
+ 定义一个 get 
*/
const targetMap = new WeakMap()
/* 
weakMap
target: {
  depsMap
  'objName' => {
    keyName => dep(),
    keyName => dep(),
    }
  }
}
*/
function getDep(target, key) {
  // 1.根据监听的对象 取出对应的 map 如果没有就添加
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  // 2. map 里面存的是 根据属性名生成的 dep 实例
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

// 数据劫持 
// vue2 对 raw 进行数据劫持
function reactive(raw) {
/* 
+ 数据劫持主要是为了 收集依赖
  + 对 raw 里面的每一个 key 进行监听
+ Object.defineProperties
  + 获取数据的时候 调用 get
  + 设置数据的时候 调用 set
+ 执行流程
  + watchEffect 监听到后 会默认执行一次副作用函数 effect
  + effect 执行后会 获取值进行操作 就会调用 get 方法
  + 执行 dep.depend() 后 
  + 会将当前的函数 添加进 set 中
*/
  Object.keys(raw).forEach(key => {

    const dep = getDep(raw, key)
    let value = raw[key]
    // 传入 raw 对象 key 键
    Object.defineProperty(raw, key, {
      get() {
        console.log('第一次收集依赖', key)
        dep.depend()
        return value
      },
      set(newValue) {
        console.log(dep)
        if (newValue !== value) {
          // 因为引用赋值
          value = newValue
          // 变量修改 执行副作用函数
          dep.notify()
        }
      }
    })
  })
  
  return raw
}


// 测试代码
const info = { counter: 100, name: 'pop' }
reactive(info)

const dep = new Dep()

watchEffect(() => {
  console.log('watchEffect1', info.counter * 2)
})

watchEffect(() => {
  console.log('watchEffect2', info.counter * info.counter)
})

watchEffect(() => {
  console.log('watchEffect3', info.name)
})

// info.counter++
// info.name = 'show-go'
// dep.notify()