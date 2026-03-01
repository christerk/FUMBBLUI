<template>
  <div class="container themeinfo" id="vuecontent">
    <PageHeader
      ref="nav"
      :navItems="navItems"
      defaultPage="toplist"
      @setPage="setPage"
    >
      <template #pagename>Theme Info</template>
    </PageHeader>

    <div class="swatches">
      <div class="primarybg">asdf</div>
      <div class="secondarybg"></div>
      <div class="tertiarybg"></div>
    </div>
  </div>
</template>

<style scoped>
@import "./themeinfo.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref, Watch } from "vue-facing-decorator";

@Component({})
class ThemeInfo extends Vue {
  public navItems: any = [];
  public page: string = "main";

  public async mounted() {}

  public setPage(page: string) {}
}

export default toNative(ThemeInfo);
</script>
