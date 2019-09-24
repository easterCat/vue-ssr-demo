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
