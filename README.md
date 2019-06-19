
# vue2.x-vuex-typescript-demo
>  A demo for explaining how to integrate typescript into a vue2.x project with vuex

案例源代码: https://github.com/danielhuoo/vue2.x-vuex-typescript-demo

## 前言
相信很多人都像我一样，学习使用了`vuex`后，想把项目改写成`Typescript`。但是官方教程要么晦涩难懂，要么缺少鲜活的例子。我花了一天时间，总结出了一些经验。在此分享出来。

本教程通过编写一个简单的demo讲解`vuex`的实现方式，以及如何对基于`vue2.x`的已有项目进行Typescript重构。

## 项目初始化

现在都9012了，所以我们直接使用[vue-cli 3.x](https://cli.vuejs.org/zh/guide/installation.html)快速搭建系统。

```bash
# 搭建项目
vue create vue2.x-vuex-typescript-demo

cd vue2.x-vuex-typescript-demo
# 引入vuex
vue add vuex
# 由于我实在不想写任何样式，所以我又加一个element
vue add element
```

## 模块说明

为了用实际的代码解释`vuex`是如何搭建的，以及模块间的通讯方式，我用了一个很浅显的例子（应该比官方的例子明朗很多）

### 情景
男孩给女孩送花。

1. 男孩每送出10朵花，女孩会表达感谢。
2. 女孩的感谢会增加男孩的勇气值。
3. 男孩可以向花店买花。

### 目录结构
你会发现默认的目录结构是这样的：

<pre>
.
├── README.md
├── babel.config.js
├── package.json
├── public
│   ├── favicon.ico
│   └── index.html
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── HelloWorld.vue
│   ├── main.js
│   ├── plugins
│   │   └── element.js
│   └── store.js
└── yarn.lock
</pre>

但是我们想让vuex变得模块化。所以我们改成以下的结构：

<pre>
.
├── README.md
├── babel.config.js
├── package.json
├── public
│   ├── favicon.ico
│   └── index.html
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── HelloWorld.vue
│   ├── main.js
│   ├── plugins
│   │   └── element.js
│   └── store
│       ├── index.js
│       └── module
│           ├── boy.js
│           └── girl.js
└── yarn.lock
</pre>

1. `index.js` 是`store`的主文件
2. `/module` 下存放模块文件。 `boy.js` 是男孩模块，`girl.js` 是女孩模块

### 模块定义

#### boy.js

该模块定义了三个`action`方法。`action`通俗来说就是你想让模块做的事情，它们可以是异步或者同步的。所有对`state`的增删查改的逻辑都应该在这里，而`mutation`仅仅负责执行增删查改。

```js
import { Message } from 'element-ui';
export default {
    namespaced: true,
    // state 的属性只能通过 mutation的方法进行修改
    state: {
        currentFlower: 50,
        braveScore: 0
    },
    mutations: {
        // 修改 state 的 currentFlower 的值
        updateCurrentFlower(state, payload) {
            state.currentFlower = state.currentFlower + payload
        },
        // 修改 state 的 braveScore 的值
        updateBraveScore(state, payload) {
            state.braveScore = state.braveScore + payload.score
        }
    },
    actions: {
        // 送花
        // 方法里 调用了 commit 和 state，需要在传参时声明
        sendFlower({ commit, state }, params) {
            if (!state.currentFlower) {
                Message({
                    showClose: true,
                    message: "没花可送了",
                    type: "warning"
                });
            } else {
                // 送出一朵花，自己的库存减 1
                commit('updateCurrentFlower', -params.sendNumber)
                // 女孩收到一朵花，女孩库存加 1。
                // 注意这里是跨模块调用，所以需要加上模块前缀 'girl/',并且 传入参数 {root:true} 表明通过根路径寻找目标函数。
                commit('girl/updateCurrentFlower', params.sendNumber, { root: true })
            }
        },
        // 受到鼓励
        beEncouraged({ commit }) {
            commit('updateBraveScore', { score: 10 })
        },
        // 买花
        // 方法里调用了 commit, dispatch。 dispatch跨模块调用根store的action，跟送花的commit一样，需要加上前缀和传入{root:true}
        buyFlower({ commit, dispatch }, params) {
            setTimeout(() => {
                dispatch('sellFlower', null, { root: true }).then(() => {
                    commit('updateCurrentFlower', params.buyNumber)
                }).catch(() => {
                    Message({
                        showClose: true,
                        message: "库存不足",
                        type: "warning"
                    });
                })
            }, 100)
        }
    }
}
```

#### girl.js
```js
export default {
    namespaced: true,
    state: {
        currentFlower: 0
    },
    mutations: {
        updateCurrentFlower(state, payload) {
            state.currentFlower = state.currentFlower + payload
        }
    },
    actions: {
        // 对男孩进行鼓舞
        encourage({ dispatch }, params) {
            dispatch('boy/beEncouraged', null, { root: true })
        }
    }
}
```

#### index.js
```js
import Vue from 'vue'
import Vuex from 'vuex'
// 引入模块
import boy from './module/boy'
import girl from './module/girl'
Vue.use(Vuex)

export default new Vuex.Store({
    // 根 state
    state: {
        flowersInStock: 10
    },
    // 根 mutations
    mutations: {
        updateFlowersInStock(state, payload) {
            state.flowersInStock = state.flowersInStock + payload
        }
    },
    // 根 actions
    actions: {
        sellFlower({ commit, state }, params) {
            return new Promise((resolve, reject) => {
                if (state.flowersInStock > 0) {
                    commit('updateFlowersInStock', -1)
                    resolve()
                } else {
                    reject()
                }
            })
        }
    },
    // 注册模块
    modules: {
        boy,
        girl
    }
})
```

### 连接到vue组件

现在仓库的逻辑已经写好了，我们就可以在组件上使用了。实际上`vuex`仓库早在`main.js`被引入了`vue`实例里了。例如，`this.$store.state.flowersInStock`即代表根`state`的属性值。但是这种写法太过繁琐，我们引入了`vuex`提供的 `mapState`、`mapActions` 和 `mapMutations` 进行映射。

#### boy.vue

```html
<template>
    <div>
        <div>男孩</div>
        <div>手上有{{currentFlower}}朵花</div>
        <div>
            <el-button @click="sendFlower({sendNumber:1})">送花</el-button>
            <el-button @click="buyFlower({buyNumber:1})">买花</el-button>
        </div>
        <div>勇气值:{{braveScore}}</div>
    </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
    computed: {
        // 你会发现state的映射放在了computed里面。这么做的好处是由于 Vuex 的状态存储是响应式的，从 store 实例中读取状态最简单的方法就是在计算属性中返回某个状态。
        // 通过映射，this.$store.state.currentFlower 就可以表示为 this.currentFlower
        ...mapState("boy", {
            currentFlower: state => state.currentFlower,
            braveScore: state => state.braveScore
        })
    },

    methods: {
        // actions 放在了methods里面。这不奇怪，因为actions跟mutations一样，都是vuex里面的方法。
        ...mapActions("boy", ["sendFlower", "buyFlower"])
    }
};
</script>
<style>
</style>
```

很多人在刚开始用`vuex`都会记不住，究竟`state`、`actions`和`mutations`放哪里。其实很好记：
* `state`是属性，放`computed`里。
* `actions`和`mutations`是方法，放`methods`里。

`girl.vue` 同理，就不赘述了。下一步，我们开始用`Typescript`改写代码。

## 安装`Typescript`

在安装之前，请一定要先做备份。因为安装后`App.vue`会被改写。
```bash
yarn add vuex-class
vue add typescript
? Use class-style component syntax? (Y/n)  Yes
? Use Babel alongside TypeScript for auto-detected polyfills? (Y/n) Yes
```

## 改写开始

你会发现所有`.js`文件都被改成`.ts`后缀了。这时候整个项目是跑不起来的。命令行控制台会爆出几十个`error`。事实上，在你没有把所有该改的地方改好之前，项目是不会跑通的。

### index.ts
被改写的地方:

* 引入`module`的方式。改为`import`对象中的一个属性
* 定义了`store`的类别。 
* 新增了一个`RootState`。
```ts
import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { boy } from './module/boy'
import { girl } from './module/girl'
import { RootState } from './root-types';
Vue.use(Vuex)
const store: StoreOptions<RootState> = {
    // 里面的内容不用修改
    state: {
        flowersInStock: 10
    },
    modules: {
        boy,
        girl
    },
    mutations: {
        updateFlowersInStock(state, payload) {
            state.flowersInStock = state.flowersInStock + payload
        }
    },
    actions: {
        sellFlower({ commit, state }) {
            return new Promise((resolve, reject) => {
                if (state.flowersInStock > 0) {
                    commit('updateFlowersInStock', -1)
                    resolve()
                } else {
                    reject()
                }
            })
        }
    }
}
export default new Vuex.Store<RootState>(store)
```

### root-types.ts
这是对根`state`的约束
```ts
export interface RootState {
    flowersInStock: number
}
```


### boy.ts
模块的改动是巨大的。

* 新增了模块的`State`接口
* 定义`mutations`的类为 `MutationTree`
* 定义`actions`的类为 `ActionTree`
* 定义模块的类为 `Module`
```ts
import { Message } from 'element-ui';
import { BoyState } from './module-types';
import { MutationTree, ActionTree, Module } from 'vuex';
import { RootState } from '../root-types';
const state: BoyState = {
    currentFlower: 50,
    braveScore: 0
}

// 传入的泛型可以通过查看源代码得知。
const mutations: MutationTree<BoyState> = {
    updateCurrentFlower(state, payload) {
        state.currentFlower = state.currentFlower + payload
    },

    updateBraveScore(state, payload) {
        state.braveScore = state.braveScore + payload.score
    }
}
const actions: ActionTree<BoyState, RootState> = {
    sendFlower({ commit, state }, params) {
        if (!state.currentFlower) {
            Message({
                showClose: true,
                message: "没花可送了",
                type: "warning"
            });
        } else {
            commit('updateCurrentFlower', -params.sendNumber)
            commit('girl/updateCurrentFlower', params.sendNumber, { root: true })
        }

    },
    buyFlower({ commit, dispatch }, params) {
        setTimeout(() => {
            dispatch('sellFlower', null, { root: true }).then(() => {
                commit('updateCurrentFlower', params.buyNumber)
            }).catch(() => {
                Message({
                    showClose: true,
                    message: "库存不足",
                    type: "warning"
                });
            })
        }, 100)
    },
    beEncouraged({ commit }) {
        commit('updateBraveScore', { score: 10 })
    }
}
export const boy: Module<BoyState, RootState> = {
    namespaced: true,
    state,
    mutations,
    actions
}
```

### boy.vue
`vue`文件改动的地方也是很多的:

* `script`标签指定了`ts`语言
* 使用`Component`修饰组件
* `export` 组件 从 对象变为 类
* 弃用 `mapState` 等方法，使用 `State`、`Action`、`Mutation` 修饰器绑定 `vuex`
* 弃用`computed`、`methods`、`data` 等写法，使用`get + 方法`表示 `computed`，`methods`里的方法直接被抽出来，`data`的属性直接被抽出来。
```html
<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import { BoyState } from "../store/module/module-types";
@Component
export default class boyComponent extends Vue {
    @State("boy") 
    // 感叹号不能省略
    boyState!: BoyState;

    @Action("sendFlower", { namespace: "boy" })
    sendFlower: any;

    @Action("buyFlower", { namespace: "boy" })
    buyFlower: any;

    get currentFlower(): number {
        return this.boyState.currentFlower;
    }

    get braveScore(): number {
        return this.boyState.braveScore;
    }
}
</script>
```
其他文件也是用类似的方法去改写。换汤不换药。

以上就是`Typescript`改写的例子。有些地方没有解释得很清楚，因为我也是一个小白啊，不懂的地方还是不要误导大家了。如果你的项目的逻辑比这个更复杂（肯定吧），而本项目没有覆盖到你的疑惑，你可以去看我的另一个改好的项目[Jessic](https://github.com/danielhuoo/Jessic)。