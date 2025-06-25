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
          <div @click.prevent="" href="#">
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

  @Prop
  enableUrlNav: boolean = true;

  public page: string = "";
  public pageMarkerPosition: number = 0;

  public mounted() {
    var startPage = this.defaultPage;

    if (this.enableUrlNav) {
      var initialTabMatch = window.location.pathname.match(
        "^/p/([^/]+)/([^/]+)$",
      );
      if (initialTabMatch != null && initialTabMatch.length > 2) {
        startPage = initialTabMatch[2];
      }
    }

    this.setPage(startPage);

    addEventListener("popstate", () => {
      const tabMatch = window.location.pathname.match("^/p/([^/]+)/?([^/]+)?$");
      const page = tabMatch != null ? tabMatch[1] : undefined;
      const tab = tabMatch != null ? tabMatch[2] : undefined;

      var requestedTab = tab || startPage;

      this.setPage(requestedTab, false);
    });
  }

  @Emit
  public setPage(newPage: string, setHistory: boolean = true) {
    this.page = newPage;

    // Set page marker tick position
    const element = document.getElementById("nav-" + newPage);
    if (element != null) {
      this.pageMarkerPosition =
        element.offsetLeft + element.offsetWidth / 2 - 9;
    }

    if (this.enableUrlNav && setHistory) {
      const tabMatch = window.location.pathname.match("^/p/([^/]+)/?([^/]+)?$");
      const page = tabMatch != null ? tabMatch[1] : undefined;

      const url =
        newPage != this.defaultPage ? `/p/${page}/${newPage}` : `/p/${page}`;

      window.history.pushState({}, "", url);
    }

    return newPage;
  }

  public addNav(label: string, page: string) {
    this.navItems.push({ label: label, page: page });

    this.$nextTick(() => {
      this.setPage(this.page);
    });
  }
}

export default toNative(PageHeader);
</script>
