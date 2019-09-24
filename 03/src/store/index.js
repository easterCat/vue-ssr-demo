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
