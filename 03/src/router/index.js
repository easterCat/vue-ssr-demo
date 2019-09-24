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
