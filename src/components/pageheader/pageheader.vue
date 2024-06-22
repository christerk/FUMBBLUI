<template>
  <div class="pageheader">
    <div class="title">
      <slot name="pagename"></slot>
    </div>
    <slot name="center"></slot>

    <div class="left"></div>
    <div class="right"></div>

    <ul class="pagenav">
      <template v-for="navItem in navItems" :key="navItem.page">
        <li :id="'nav-' + navItem.page" @click.prevent="setPage(navItem.page)">
          <a v-if="navItem.page != page" @click.prevent="" href="#">{{
            navItem.label
          }}</a>
          <div v-if="navItem.page == page" @click.prevent="" href="#">
            {{ navItem.label }}
          </div>
        </li>
      </template>

      <img
        v-if="pageMarkerPosition != 0"
        class="pagemarker"
        src="https://fumbbl.com/FUMBBL/Images/Icons/pagemarker.png"
        :style="{ display: 'block', left: pageMarkerPosition + 'px' }"
      />
    </ul>
  </div>
</template>

<style scoped>
@import "./pageheader.less";
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from "vue-facing-decorator";

@Component
class PageHeader extends Vue {
  @Prop
  navItems: any = [];

  @Prop
  defaultPage: string = "";

  public page: string = "";
  public pageMarkerPosition: number = 0;

  public mounted() {
    this.setPage(this.defaultPage);
  }

  @Emit
  public setPage(newPage: string) {
    this.page = newPage;

    const element = document.getElementById("nav-" + newPage);

    if (element != null) {
      this.pageMarkerPosition =
        element.offsetLeft + element.offsetWidth / 2 - 9;
    }
    return newPage;
  }
}

export default toNative(PageHeader);
</script>
