<template>
  <modal
    v-show="isVisible"
    :exclude-header="false"
    :exclude-buttons="true"
    @cancel="hide()"
    @confirm="confirm()"
  >
    <template v-slot:header> Icon editor </template>

    <template v-slot:body>
      <div>
        <div
          v-for="colourTheme in colourThemes"
          class="themebutton"
          @mouseenter="submenu = colourTheme"
          @mouseleave="submenu = ''"
          :key="colourTheme"
        >
          {{ colourTheme }}
          <div v-if="submenu == colourTheme" class="submenu">
            <div
              class="item"
              v-for="(data, theme) in themes[colourTheme]"
              @click="setTheme(colourTheme, theme)"
              @mouseenter="previewCol(colourTheme, theme)"
              @mouseleave="resetCol(colourTheme)"
              :key="theme"
            >
              <div
                class="themebutton"
                :style="buttonBackground(colourTheme, theme)"
              >
                {{ theme }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="icon">
          <canvas id="front" width="300" height="300" ref="frontCanvas">
          </canvas>
        </div>

        <div class="icon">
          <canvas id="side" width="300" height="300" ref="sideCanvas"> </canvas>
        </div>
      </div>

      <template v-if="frontSkeleton.slots != null">
        <template
          v-for="(slot, slotIndex) in frontSkeleton.slots"
          :key="slot.id"
        >
          <div
            class="component"
            v-if="slot.diagrams.length > 1"
            @click="showSelector(slotIndex)"
          >
            <div class="componentname">{{ slot.name }}</div>
          </div>
        </template>
      </template>

      <Transition>
        <div class="selectorwrap" v-show="selectorVisible">
          <div class="componentselectorhead">
            Select
            {{ selector >= 0 ? frontSkeleton.slots[selector].name : "" }}
          </div>
          <div class="componentselector">
            <template
              v-for="(diagram, index) in getDiagrams(selector)"
              :key="diagram.id"
            >
              <div
                :class="{
                  componentitem: true,
                  current:
                    index == diagrams[frontSkeleton.slots[selector].name],
                }"
                :value="index"
                @click="set(frontSkeleton.slots[selector].name, index)"
                @mouseenter="preview(frontSkeleton.slots[selector].name, index)"
                @mouseleave="resetPreview(frontSkeleton.slots[selector].name)"
              >
                <img
                  :style="
                    'image-rendering: pixelated; width:' +
                    4 * diagram.width +
                    'px'
                  "
                  :src="'https://fumbbl.com/i/' + diagram.image"
                />
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </template>
  </modal>
</template>

<style scoped>
@import "@pages/team/style/iconeditor.less";
</style>

<script lang="ts">
import {
  Prop,
  Component,
  Vue,
  toNative,
  Emit,
  Ref,
} from "vue-facing-decorator";
import ModalComponent from "../Modal.vue";
import Player from "../../include/Player";
import FumbblApi from "../../include/FumbblApi";
import { PropType } from "vue";

@Component({
  components: {
    modal: ModalComponent,
  },
})
class IconEditor extends Vue {
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({ required: true })
  public player!: Player;

  public diagrams: any = {};
  public previewDiagrams: any = {};

  public isVisible: boolean = false;

  public result: any | undefined = undefined;

  public skeletons: any = "";
  public frontSkeleton: any = "";
  public sideSkeleton: any = "";
  public selector: number = -1;
  public selectorVisible: boolean = false;
  public frontCtx: any = {};
  public canvasKey: number = 0;

  public colours: any = {};
  public currentTheme: { [key: string]: string } = {
    Primary: "Default",
    Secondary: "Default",
    Skin: "Default",
    Hair: "Default",
  };
  public previewTheme: { [key: string]: string | null } = {
    Primary: null,
    Secondary: null,
    Skin: null,
    Hair: null,
  };

  public imageCache: { [key: string]: any } = {};
  public submenu: string = "";

  public colourThemes = ["Primary", "Secondary", "Skin", "Hair"];

  public themes: { [key: string]: { [key: string]: any } } = {
    Primary: {
      Default: {
        HI: [255, 255, 255],
        BASE: [255, 255, 255],
        LO: [255, 255, 255],
        LINE: [255, 255, 255],
      },
      Red: {
        HI: [255, 128, 128],
        BASE: [254, 0, 0],
        LO: [179, 0, 0],
        LINE: [84, 0, 0],
      },
      Blue: {
        HI: [128, 128, 255],
        BASE: [0, 0, 254],
        LO: [0, 0, 179],
        LINE: [0, 0, 84],
      },
      Green: {
        HI: [96, 220, 96],
        BASE: [0, 200, 0],
        LO: [0, 124, 0],
        LINE: [0, 62, 0],
      },
    },
    Secondary: {
      Default: {
        HI: [255, 255, 255],
        BASE: [255, 255, 255],
        LO: [255, 255, 255],
        LINE: [255, 255, 255],
      },
      Gold: {
        HI: [255, 255, 13],
        BASE: [255, 216, 9],
        LO: [152, 132, 0],
        LINE: [92, 80, 0],
      },
      Silver: {
        HI: [255, 255, 255],
        BASE: [216, 216, 230],
        LO: [152, 152, 160],
        LINE: [92, 92, 105],
      },
    },
    Skin: {
      Default: {
        HI: [255, 255, 255],
        BASE: [255, 255, 255],
        LO: [255, 255, 255],
        LINE: [255, 255, 255],
      },
      Dark: {
        HI: [175, 110, 81],
        BASE: [132, 55, 34],
        LO: [61, 12, 2],
        LINE: [38, 7, 1],
      },
      Golden: {
        HI: [198, 144, 118],
        BASE: [175, 110, 81],
        LO: [132, 55, 34],
        LINE: [61, 12, 2],
      },
      Pale: {
        HI: [255, 232, 208],
        BASE: [224, 188, 160],
        LO: [184, 132, 96],
        LINE: [78, 37, 24],
      },
    },
    Hair: {
      Default: {
        HI: [255, 255, 255],
        BASE: [255, 255, 255],
        LO: [255, 255, 255],
        LINE: [255, 255, 255],
      },
      Black: {
        HI: [140, 140, 140],
        BASE: [72, 72, 72],
        LO: [42, 42, 42],
        LINE: [34, 34, 34],
      },
      Sand: {
        HI: [200, 160, 36],
        BASE: [144, 116, 28],
        LO: [112, 88, 20],
        LINE: [84, 68, 1],
      },
      White: {
        HI: [240, 240, 240],
        BASE: [200, 200, 200],
        LO: [140, 140, 140],
        LINE: [60, 60, 60],
      },
    },
  };

  @Ref
  public frontCanvas: any;

  @Ref
  public sideCanvas: any;

  public mounted() {}

  @Emit("cancelled")
  public cancel() {
    this.hide();
  }

  @Emit("confirmed")
  public confirm() {
    this.hide();
  }

  public show() {
    this.$nextTick(async () => {
      await this.load();
    });
    this.isVisible = true;
  }

  public hide() {
    this.isVisible = false;
  }

  public async load() {
    const positionId = this.player.getPositionId();

    if (!positionId) {
      return;
    }
    const iconData = (
      await this.fumbblApi?.getIconData(this.player.getPositionId())
    )?.data;

    this.colours = iconData.data;

    iconData.skeletons.forEach(async (skeleton: any) => {
      if (skeleton.perspective == "Front") {
        this.frontSkeleton = skeleton;
      }
      if (skeleton.perspective == "Side") {
        this.sideSkeleton = skeleton;
      }
    });

    this.frontSkeleton.slots.forEach((s: any) => {
      this.diagrams[s.name] = 0;

      s.diagrams.forEach((d: any) => {
        const id = "img-" + d.image;

        this.addImage(id, d.image);
      });
    });

    this.sideSkeleton.slots.forEach((s: any) => {
      s.diagrams.forEach((d: any) => {
        const id = "img-" + d.image;

        this.addImage(id, d.image);
      });
    });

    this.redrawIcons();
  }

  public showSelector(slot: number) {
    this.selector = slot;
    this.selectorVisible = true;
  }

  public addImage(id: string, imageId: number): any {
    if (!this.imageCache[id]) {
      let img = document.createElement("img");
      img.id = id;
      img.crossOrigin = "anonymous";
      img.src = "https://fumbbl.com/i/" + imageId;

      this.imageCache[id] = img;

      return img;
    }

    return false;
  }

  public set(diagram: string, index: number) {
    this.diagrams[diagram] = index;
    this.selectorVisible = false;
    let imageId = this.frontSkeleton.slots[this.selector].diagrams[index].image;
    let id = "front-" + imageId;

    this.addImage(id, imageId);
    this.redrawIcons();
  }

  public preview(diagram: string, index: number) {
    if (!this.selectorVisible) {
      return;
    }
    this.previewDiagrams[diagram] = index;
    this.redrawIcons();
  }

  public resetPreview(diagram: string) {
    this.previewDiagrams[diagram] = null;
    this.redrawIcons();
  }

  public getDiagrams(selector: number): any[] {
    if (!this.frontSkeleton.slots) {
      return [];
    }

    return this.frontSkeleton.slots[selector]?.diagrams ?? [];
  }

  public redrawIcons() {
    this.redrawIcon(this.frontCanvas, this.frontSkeleton);
    this.redrawIcon(this.sideCanvas, this.sideSkeleton);
  }

  public redrawIcon(canvas: any, skeleton: any) {
    let ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, 300, 300);
    ctx.fillStyle = "red";
    for (const slotIndex in skeleton.slots) {
      const slot = skeleton.slots[slotIndex];

      const diagram =
        this.previewDiagrams[slot.name] ?? this.diagrams[slot.name] ?? 0;

      if (slot.diagrams.length == 0) {
        continue;
      }

      if (slot.name == "root") {
        continue;
      }

      const x = slot.diagrams[diagram].x - slot.x + 8;
      const y = slot.diagrams[diagram].y - slot.y + 8;
      const w = slot.diagrams[diagram].width;
      const h = slot.diagrams[diagram].height;

      const image = slot.diagrams[diagram].image;
      const img = this.imageCache["img-" + image]; //document.getElementById("img-" + image);
      ctx.drawImage(img, 5 * x, 5 * y, 5 * w, 5 * h);
    }
    this.recolorImage(canvas);
  }

  public recolorImage(canvas: any) {
    let ctx = canvas.getContext("2d");
    let img = ctx.getImageData(0, 0, 300, 300);
    let pixels = img.data;

    let colmap: any = {};

    const primaryTheme = this.previewTheme.Primary ?? this.currentTheme.Primary;
    const secondaryTheme =
      this.previewTheme.Secondary ?? this.currentTheme.Secondary;
    const skinTheme = this.previewTheme.Skin ?? this.currentTheme.Skin;
    const hairTheme = this.previewTheme.Hair ?? this.currentTheme.Hair;

    if (primaryTheme != "Default") {
      colmap[this.colours["PRIMARYHI"]] = this.themes.Primary[primaryTheme].HI;
      colmap[this.colours["PRIMARY"]] =
        this.themes["Primary"][primaryTheme].BASE;
      colmap[this.colours["PRIMARYLO"]] =
        this.themes["Primary"][primaryTheme].LO;
      colmap[this.colours["PRIMARYLINE"]] =
        this.themes["Primary"][primaryTheme].LINE;
    }
    if (secondaryTheme != "Default") {
      colmap[this.colours["SECONDARYHI"]] =
        this.themes.Secondary[secondaryTheme].HI;
      colmap[this.colours["SECONDARY"]] =
        this.themes.Secondary[secondaryTheme].BASE;
      colmap[this.colours["SECONDARYLO"]] =
        this.themes.Secondary[secondaryTheme].LO;
      colmap[this.colours["SECONDARYLINE"]] =
        this.themes.Secondary[secondaryTheme].LINE;
    }
    if (skinTheme != "Default") {
      colmap[this.colours["SKINHI"]] = this.themes.Skin[skinTheme].HI;
      colmap[this.colours["SKIN"]] = this.themes.Skin[skinTheme].BASE;
      colmap[this.colours["SKINLO"]] = this.themes.Skin[skinTheme].LO;
      colmap[this.colours["SKINLINE"]] = this.themes.Skin[skinTheme].LINE;
    }
    if (hairTheme != "Default") {
      colmap[this.colours["HAIRHI"]] = this.themes.Hair[hairTheme].HI;
      colmap[this.colours["HAIR"]] = this.themes.Hair[hairTheme].BASE;
      colmap[this.colours["HAIRLO"]] = this.themes.Hair[hairTheme].LO;
      colmap[this.colours["HAIRLINE"]] = this.themes.Hair[hairTheme].LINE;
    }

    for (var i = 0, n = pixels.length; i < n; i += 4) {
      let col = this.decimalToHex(
        (img.data[i] << 16) + (img.data[i + 1] << 8) + img.data[i + 2],
      );

      let newCol = colmap[col];

      if (newCol) {
        img.data[i] = newCol[0];
        img.data[i + 1] = newCol[1];
        img.data[i + 2] = newCol[2];
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  public decimalToHex(d: number) {
    var hex = Number(d).toString(16);
    while (hex.length < 6) {
      hex = "0" + hex;
    }

    return "#" + hex;
  }

  public setTheme(group: string, theme: string | number) {
    this.currentTheme[group] = theme as string;
    this.redrawIcons();
    this.submenu = "";
  }

  public previewCol(group: string, theme: string | number) {
    this.previewTheme[group] = theme as string;
    this.redrawIcons();
  }

  public resetCol(group: string) {
    this.previewTheme[group] = null;
    this.redrawIcons();
  }

  public buttonBackground(group: string, col: string | number): string {
    const cols = this.themes[group][col];
    const col1 = "rgb(" + cols["LINE"].join(",") + ")";
    const col2 = "rgb(" + cols["LO"].join(",") + ")";
    const col3 = "rgb(" + cols["BASE"].join(",") + ")";
    const col4 = "rgb(" + cols["HI"].join(",") + ")";

    const style =
      "background: linear-gradient( 90deg, " +
      col1 +
      " 0%," +
      col1 +
      " 25%," +
      col2 +
      " 25%," +
      col2 +
      " 50%," +
      col3 +
      " 50%," +
      col3 +
      " 75%," +
      col4 +
      " 75%," +
      col4 +
      " 100%" +
      ")";

    return style;
  }
}
export default toNative(IconEditor);
</script>
