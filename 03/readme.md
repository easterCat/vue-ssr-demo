### vue 的服务端渲染

将同一个组件渲染为服务器端的 HTML 字符串,将它们直接发送到浏览器,最后将这些静态标记"激活"为客户端上完全可交互的应用程序.服务器渲染的 Vue.js 应用程序也可以被认为是"同构"或"通用",因为应用程序的大部分代码都可以在服务器和客户端上运行.

> 服务端渲染就是使用后台语言按照模板语法生成 html 文件返回到浏览器 jsp/php/node+ejs 就是这种

#### vue 的服务端渲染优缺点

优点

- 更好的 SEO,由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面.如果 SEO 对你的站点至关重要,而你的页面又是异步获取内容,则你可能需要服务器端渲染(SSR)解决此问题.
- 更快的首屏渲染,特别是对于缓慢的网络情况或运行缓慢的设备.无需等待所有的 JavaScript 都完成下载并执行,才显示服务器渲染的标记,所以你的用户将会更快速地看到完整渲染的页面.

缺点

- 开发条件所限.浏览器特定的代码,只能在某些生命周期钩子函数 (lifecycle hook) 中使用；一些外部扩展库 (external library) 可能需要特殊处理,才能在服务器渲染应用程序中运行.
- 涉及构建设置和部署的更多要求.与可以部署在任何静态文件服务器上的完全静态单页面应用程序 (SPA) 不同,服务器渲染应用程序,需要处于 Node.js server 运行环境.
- 更多的服务器端负载.在 Node.js 中渲染完整的应用程序,显然会比仅仅提供静态文件的 server 更加大量占用 CPU 资源 (CPU-intensive - CPU 密集),因此如果你预料在高流量环境 (high traffic) 下使用,请准备相应的服务器负载,并明智地采用缓存策略.

> 如果项目中只是少数几个页面需要 seo,那么你可能需要预渲染.优点是设置预渲染更简单,并可以将你的前端作为一个完全静态的站点.在 webpack 中使用 prerender-spa-plugin

### 基本用法

```
npm install vue vue-server-renderer express --save
```

> vue-server-renderer 依赖一些 Node.js 原生模块,因此只能在 Node.js 中使用

#### 渲染一个 vue 实例并与 express 集成

新建 01/ssr.js

```
const Vue = require("vue");
const server = require("express")();
// 创建一个 renderer
const renderer = require("vue-server-renderer").createRenderer();

server.get("*", (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>Hello World</div>`
  });

  // 将 Vue 实例渲染为 HTML
  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end("Internal Server Error");
      return;
    }

    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <body>
        <div>today is a good day</div>
        <div>${html}</div>
        </body>
      </html>
    `);
  });
});

server.listen(3333);
```

修改 package.json

```
"scripts": {
    "ssr": "node ssr.js"
  },
```

执行`npm run ssr`之后打开 localhost:3333 就可以看到效果(代码在 01 文件夹)

#### 使用页面模板

当你在渲染 Vue 应用程序时,renderer 只从应用程序生成 HTML 标记.我们必须用一个额外的 HTML 页面包裹容器,来包裹生成的 HTML 标记

新建 02/index.template.html

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>template</title>
  </head>
  <body>
    <div>this is template</div>
    <!--vue-ssr-outlet-->
  </body>
</html>
```

> vue-ssr-outlet 注释 -- 这里将是应用程序 HTML 标记注入的地方.

修改 ssr.js 中的 renderer , 使用 fs 同步读取模板文件

```
const renderer = require("vue-server-renderer").createRenderer({
  template: require("fs").readFileSync("./index.template.html", "utf-8")
});
```

开启服务`npm run start`,然后 localhost:3333

#### 使用模板插值

修改 02/index.tempalte.html

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- 使用双花括号(double-mustache)进行 HTML 转义插值(HTML-escaped interpolation) -->
    <title>{{ title }}</title>

    <!-- 使用三花括号(triple-mustache)进行 HTML 不转义插值(non-HTML-escaped interpolation) -->
    {{{ meta }}}
  </head>
  <body>
    <div>this is template</div>
    <!--vue-ssr-outlet-->
    {{ inner }}
    {{ color }}
  </body>
</html>
```

整体修改 02/ssr.js

```
const Vue = require("vue");
const server = require("express")();
// 创建一个 renderer
const renderer = require("vue-server-renderer").createRenderer({
  template: require("fs").readFileSync("./index.template.html", "utf-8")
});

server.get("*", (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>Hello World</div>`
  });

  const context = {
    title: "template insert",
    meta: `
    <meta name="keywords" content="HTML,ASP,PHP,SQL">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    `,
    inner: "<p>日照香炉生紫烟</p>",
    color: "<p style='color:red;background:blue'>遥看瀑布挂前川</p>"
  };

  // 将 Vue 实例渲染为 HTML
  renderer.renderToString(app, context, (err, html) => {
    if (err) {
      res.status(500).end("Internal Server Error");
      return;
    }

    console.log(html);

    res.end(html);
  });
});

server.listen(3333);
```

开启服务`npm run start`,然后 localhost:3333.每次更改都要重启开启服务影响测试效率

```
npm install nodemon --save-dev
```

修改 02/package.json

```
scripts": {
    "ssr": "nodemon ssr.js"
}
```

此时测试修改的时候会自动重启 node 服务了(代码在 02 文件夹)

### 添加 webpack 构建应用

我们需要使用 webpack 来打包我们的 Vue 应用程序。对于客户端应用程序和服务器应用程序，我们都要使用 webpack 打包 - 服务器需要「服务器 bundle」然后用于服务器端渲染(SSR)，而「客户端 bundle」会发送给浏览器，用于混合静态标记。

![构建流程](https://cloud.githubusercontent.com/assets/499550/17607895/786a415a-5fee-11e6-9c11-45a2cfdf085c.png)

#### 将项目构建为 webpack 源码结构

```
src
├── components
│   ├── Foo.vue
│   ├── Bar.vue
│   └── Baz.vue
├── App.vue
├── app.js # 通用 entry(universal entry)
├── entry-client.js # 仅运行于浏览器
└── entry-server.js # 仅运行于服务器
```

- app.js 在纯客户端应用程序中，我们将在此文件中创建根 Vue 实例，并直接挂载到 DOM。但是，对于服务器端渲染(SSR)，责任转移到纯客户端 entry 文件。简单地使用 export 导出一个 createApp 函数

```
import Vue from 'vue'
import App from './App.vue'

// 导出一个工厂函数，用于创建新的
// 应用程序、router 和 store 实例
export function createApp () {
  const app = new Vue({
    // 根实例简单的渲染应用程序组件。
    render: h => h(App)
  })
  return { app }
}
```

- entry-client.js 客户端 entry 只需创建应用程序，并且将其挂载到 DOM 中

```
import { createApp } from './app'

// 客户端特定引导逻辑……

const { app } = createApp()

// 这里假定 App.vue 模板中根元素具有 `id="app"`
app.$mount('#app')
```

- entry-server.js 服务器 entry 使用 default export 导出函数，并在每次渲染中重复调用此函数。

```
import { createApp } from './app'

export default context => {
  const { app } = createApp()
  return app
}
```

#### 添加路由

新建 03/src/router/index.js

```
import Vue from "vue";
import Router from "vue-router";

const Home = () => import("../views/Home.vue");
const Hello = () => import("../views/Hello.vue");
const World = () => import("../views/World.vue");

Vue.use(Router);

export function createRouter() {
  return new Router({
    mode: "history",
    routes: [
      {
        path: "/home",
        component: Home
      },
      {
        path: "/hello",
        component: Hello
      },
      {
        path: "/world",
        component: World
      }
    ]
  });
}

```

修改 03/src/app.js

```
import Vue from "vue";
import App from "./App.vue";
import { createRouter } from "./router/index";

// 导出一个工厂函数，用于创建新的
// 应用程序、router 和 store 实例
export function createApp() {
  // create the router instance
  const router = createRouter();

  const app = new Vue({
    // 根实例简单的渲染应用程序组件。
    router,
    render: h => h(App)
  });
  return { app, router };
}
```

修改 03/src/entry-server.js

```
import { createApp } from './app'

export default context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
    // 以便服务器能够等待所有的内容在渲染前，
    // 就已经准备就绪。
  return new Promise((resolve, reject) => {
    const { app, router } = createApp()

    // 设置服务器端 router 的位置
    router.push(context.url)

    // 等到 router 将可能的异步组件和钩子函数解析完
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // 匹配不到的路由，执行 reject 函数，并返回 404
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }

      // Promise 应该 resolve 应用程序实例，以便它可以渲染
      resolve(app)
    }, reject)
  })
}
```

修改 03/src/entry-server.js

```
import { createApp } from './app'

const { app, router } = createApp()

router.onReady(() => {
  app.$mount('#app')
})
```

#### 添加 vuex

新建 03/src/store/index.js

```
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import { request } from "../api";

export function createStore() {
  return new Vuex.Store({
    state: {
      lists: []
    },
    mutations: {
      updateList(state, lists) {
        state.lists = lists;
      }
    },
    actions: {
      getList({ commit }) {
        let list = [
          {
            text: "今天是个好日子"
          },
          {
            text: "我们一起上街去"
          },
          {
            text: "没事买个红薯吃"
          }
        ];
        commit("updateList", list);
      }
    }
  });
}
```

再次修改 03/src/app.js

```
import Vue from "vue";
import App from "./App.vue";
import { createRouter } from "./router/index";
import { createStore } from "./store/index";
import { sync } from "vuex-router-sync";

// 导出一个工厂函数，用于创建新的
// 应用程序、router 和 store 实例
export function createApp() {
  // create the router instance
  const router = createRouter();
  const store = createStore();

  sync(store, router);

  const app = new Vue({
    // 根实例简单的渲染应用程序组件。
    router,
    store,
    render: h => h(App)
  });
  return { app, router, store };
}
```

引入 store 的组件 03/src/components/Hello.vue

```
<template>
  <div>
    hello world
    <div v-for="(item,index) in lists" :key="index">
      <p>{{ item.text }}</p>
    </div>
  </div>
</template>
<script>
export default {
  asyncData({ store, route }) {
    return store.dispatch("getList");
  },

  computed: {
    lists() {
      return this.$store.state.lists;
    }
  }
};
</script>
```

修改 03/src/entry-client.js

```
import { createApp } from './app'

// 客户端特定引导逻辑……

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
  // 这里假定 App.vue 模板中根元素具有 id="app"
  app.$mount('#app')

  // Add router hook for handling asyncData.
  // Doing it after initial route is resolved so that we don't double-fetch the data that we already have. // Using `router.beforeResolve()` so that all async components are resolved.

  router.beforeResolve((to, from , next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)

    // we only care about non-previously-rendered components,
    // so we compare them until the two matched lists differ
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })

    if (!activated.length) {
      return next()
    }

    // this is where we should trigger a loading indicator if there is one
    Promise.all(activated.map(c => {
      if (c.asyncData) {
        alert('fetch data in client side')
        return c.asyncData({ store, route: to })
      }
    })).then(() => {
      // stop loading indicator
      next()
    }).catch(next)
  })
})

```

修改 03/src/entry-server.js

```
import { createApp } from './app'

export default context => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp()
    router.push(context.url)

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // 匹配不到的路由，执行 reject 函数，并返回 404
      if (!matchedComponents.length) {
        reject({ code: 404 })
      }

      // 执行所有组件的 asyncData 方法, 从而预期数据
      Promise.all(matchedComponents.map(Component => {
        if (Component.asyncData) {
          return Component.asyncData({
            store,
            route: router.currentRoute
          })
        } else {
          return new Promise(resolve => {
            resolve()
          })
        }
      })).then(() => {
        // 在所有预取钩子(preFetch hook) resolve 后，
        // 我们的 store 现在已经填充入渲染应用程序所需的状态。
        // 当我们将状态附加到上下文，
        // 并且 `template` 选项用于 renderer 时，
        // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
        context.state = store.state

        //Promise 应该 resolve 应用程序实例，以便它可以渲染
        resolve(app)
      })
    }, reject)
  })
}
```

#### 添加 webpack

新建 03/build/webpack.base.conf

```
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist/',
  },
  module: {
    noParse: /es6-promise\.js$/, // avoid webpack shimming process
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ],
}
```

新建 03/build/webpack.client.conf

```
const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.conf')

const isProd = process.env.NODE_ENV === 'production'

const config = merge(base, {
  entry: {
    app: './src/entry-client.js'
  },
  output: {
    filename: 'client-bundle.js'
  },
  mode: isProd ? 'production' : 'development',
  plugins: [
    // strip dev-only code in Vue source
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"client"'
    }),
  ]
})

module.exports = config
```

新建 03/build/webpack.server.conf

```
const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.conf')

const isProd = process.env.NODE_ENV === 'production'

module.exports = merge(base, {
  target: 'node',
  entry: './src/entry-server.js',
  output: {
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2'
  },
  mode: isProd ? 'production' : 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"server"'
    }),
  ]
})
```

修改 03/ssr.js

```
const Vue = require("vue");
const express = require("express");
const server = express();
const createRenderer = require("vue-server-renderer").createRenderer;
const createApp = require("./dist/server-bundle").default;

const renderer = createRenderer({
  template: require("fs").readFileSync("./index.template.html", "utf-8")
});

server.use(express.static("dist"));
server.use("/dist", express.static("dist"));

server.get("*", (req, res) => {
  const context = {
    title: "hello",
    meta: `
      <meta charset="utf8">
    `,
    url: req.url
  };

  createApp(context) // context 会被 createApp 添加一个 store 属性，renderToString 的时候 init store 会被注入到 html 页面中
    .then(app => {
      renderer.renderToString(app, context, (err, html) => {
        if (err) {
          if (err.code === 404) {
            res.status(404).end("Page not found");
          } else {
            res.status(500).end("Internal Server Error");
          }
          return;
        }

        res.send(html);
      });
    })
    .catch(error => {
      res.status(404).end("Page not found");
    });
});

server.listen(8089, () => {
  console.log(`server started at localhost:8080`);
});

```

最后修改 package.json

```
  "scripts": {
    "build:client": "cross-env NODE_ENV=dev webpack --config build/webpack.client.conf.js --progress --hide-modules",
    "build:server": "cross-env NODE_ENV=dev webpack --config build/webpack.server.conf.js --progress --hide-modules",
    "build": "rimraf dist && npm run build:client && npm run build:server",
    "start": "nodemon server"
  },
```

执行`npm run build`再执行`npm run start`

参考

[Vue.js 服务器端渲染指南](https://ssr.vuejs.org/zh/)
[vue-hackernews-2.0 官方 demo](https://github.com/vuejs/vue-hackernews-2.0/)
[带你走近 Vue 服务器端渲染（VUE SSR）](https://juejin.im/post/5b72d3d7518825613c02abd6#heading-13)
[从零开始搭建 Vue SSR DEMO 3 - 加入路由支持](https://www.njleonzhang.com/2018/08/04/vue-ssr-3.html)
[包教会的 vue 服务端渲染课程](https://github.com/Neveryu/vue-ssr-lessons)
[vue-ssr-demo](https://github.com/LNoe-lzy/vue-ssr-demo/tree/vue-ssr-without-vuex)
