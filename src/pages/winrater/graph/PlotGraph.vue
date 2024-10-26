<script setup lang="ts">
import * as Plot from "@observablehq/plot";
import { computed, h, ref, withDirectives } from "vue";
import type { BaseType } from "d3";
import * as d3 from "d3";
import Color from "color";
import tippy, { Content, Instance } from "tippy.js";
import { DataPoint } from "../rating/store";

const props = defineProps(["options"]);

const lines = new Map<string, BaseType>();

let stroke = ref("rgb(0, 0,0)");
const tooltipGradient = computed(() => {
  return (
    "linear-gradient(to bottom, " +
    new Color(stroke.value).darken(0.2).rgb() +
    ", " +
    stroke.value +
    ")"
  );
});

const tooltipColor = computed(() => {
  return new Color(stroke.value).isLight() ? "black" : "white";
});

const dummy: GraphDataPoint = {
  x: 0,
  y: 0,
  title: "",
  index: 0,
  ratio: 0,
  id: 0,
  dateTime: new Date(),
};

let closest = ref(dummy);

type GraphDataPoint = {
  x: number;
  y: number;
  title: string;
  index: number;
  ratio: number;
  id: number;
  dateTime: Date;
};

let tooltip: Instance;

// this allows to create the plot using the render tag in template
// noinspection JSUnusedGlobalSymbols
const render = () => {
  return withDirectives(h("div"), [
    [
      {
        unmounted() {
          if (tooltip) {
            tooltip.destroy();
          }
        },
        mounted(el) {
          const tooltipContent = document.getElementById("tooltip-content");

          const plot = Plot.plot(props.options);
          el.append(plot);

          const plotDom = d3.select(plot);
          plotDom
            .attr(
              "style",
              "background:#f8f5e7; border-radius: 5px; border: 1px solid #999",
            )
            .attr("font-size", "1em");
          const dot = plotDom.append("g").attr("display", "none");
          dot
            .append("circle")
            .attr("r", "0.3em")
            .attr("stroke-width", "0.15em")
            .attr("id", "dot");

          const xPx = plot.scale("x")?.apply;
          const yPx = plot.scale("y")?.apply;
          const dataPx: GraphDataPoint[] = props.options.marks
            .filter((mark: any) => mark.z)
            .flatMap((mark: any) => {
              return mark.data.map((data: DataPoint) => {
                const x = xPx ? xPx(data.index) : 0;
                const y = yPx ? yPx(data.ratio * 100) : 0;
                return {
                  x: x,
                  y: y,
                  title: data.title,
                  index: data.index,
                  ratio: data.ratio,
                  dateTime: data.dateTime,
                  id: data.id,
                };
              });
            });

          tooltip = tippy("#dot")[0];

          plotDom
            .selectAll("title")
            .nodes()
            .forEach((node) => {
              const d3Node = d3.select(node).nodes()[0];
              if (
                d3Node &&
                "parentNode" in d3Node &&
                d3Node.parentNode &&
                "parentNode" in d3Node.parentNode &&
                d3Node.parentNode.parentNode
              ) {
                // noinspection TypeScriptValidateTypes
                lines.set(
                  d3.select(node).text(),
                  d3Node.parentNode.parentNode as BaseType,
                );
              }
            });

          let mouseHasMoved = false;
          let tippyEnabled = false;

          function showTippy() {
            tippyEnabled = true;
            dot.attr("display", null);
            tooltip.show();
          }

          tooltip.props.onShow = () => {
            if (!tippyEnabled) {
              return false;
            }
          };

          tooltip.props.onHide = () => {
            if (
              tippyEnabled ||
              (tooltip && tooltip.state && tooltip.state.isDestroyed)
            ) {
              return false;
            }
          };

          plotDom.on("pointerenter", () => {
            if (mouseHasMoved) {
              showTippy();
            }
          });

          plotDom.on("pointerleave", () => {
            tippyEnabled = false;
            tooltip.hide();
            dot.attr("display", "none");
            lines.forEach((line) => {
              d3.select(line).attr("stroke-opacity", "1");
            });
          });

          plotDom.on("pointermove", (event: MouseEvent) => {
            if (!mouseHasMoved) {
              mouseHasMoved = true;
              showTippy();
            }
            const [ex, ey] = d3.pointer(event);
            const foundPoint = d3.least(dataPx, (dataPoint) =>
              Math.hypot(dataPoint.x - ex, dataPoint.y - ey),
            );
            if (foundPoint) {
              closest.value = foundPoint;
            }

            lines.forEach((line, title) => {
              if (title === closest.value.title) {
                const graphLine = d3.select(line);
                stroke.value = graphLine.attr("stroke");
                graphLine.attr("stroke-opacity", "1").raise();
              } else {
                d3.select(line).attr("stroke-opacity", "0.2");
              }
            });

            dot
              .attr(
                "transform",
                `translate(${closest.value.x},${closest.value.y})`,
              )
              .attr("stroke", stroke.value)
              .attr("fill", Color(stroke.value).lighten(0.25).rgb().string())
              .attr("display", null)
              .raise();

            tooltip.setProps({ content: tooltipContent as Content });
          });

          dot.on("click", () => {
            window.open(
              "https://fumbbl.com/FUMBBL.php?page=match&id=" + closest.value.id,
              "_blank",
            );
          });
        },
      },
    ],
  ]);
};
</script>
<template>
  <div id="tooltip">
    <div id="tooltip-content">
      <div
        id="title"
        :style="{ background: tooltipGradient, color: tooltipColor }"
      >
        {{ closest.title }}
      </div>
      <div id="content">
        <div class="content-item odd">
          <span class="item-part">Win%</span>
          <span class="item-part">{{
            (closest.ratio * 100).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }}</span>
        </div>
        <div class="even">
          <div class="multi-content-item">
            <span class="item-part">Match#</span>
            <span class="item-part">{{ closest.index }}</span>
          </div>
          <div class="explanation item-part">
            (Click dot on the graph to open)
          </div>
        </div>
        <div class="content-item odd last">
          <span id="time-label" class="item-part">Time</span>
          <span id="time" class="item-part">
            <span>{{
              closest.dateTime.toLocaleDateString(undefined, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            }}</span>
            <span>{{ closest.dateTime.toLocaleTimeString() }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
  <!--suppress HtmlUnknownTag -->
  <render />
</template>

<style scoped>
@import "./plot.less";
</style>
