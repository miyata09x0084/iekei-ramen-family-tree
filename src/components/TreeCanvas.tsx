"use client";

import { useEffect, useImperativeHandle, useLayoutEffect, useRef, type Ref } from "react";
import * as d3 from "d3";
import { LINEAGES, SHOP_BY_ID } from "@/data/shops";
import { LEVEL, MARK, PAD_TOP, CH, SUBCH, SIB, labelHeight, type Layout, type PlacedShop, type Link } from "@/lib/layout";
import { ancestry, matches, type FilterState } from "@/lib/ancestry";

export interface TreeHandle {
  fit: (animate: boolean) => void;
  focus: (id: string) => void;
  zoomBy: (k: number) => void;
}

interface Props {
  ref: Ref<TreeHandle>;
  layout: Layout;
  filter: FilterState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

type SvgSel = d3.Selection<SVGSVGElement, unknown, null, undefined>;
type GSel = d3.Selection<SVGGElement, unknown, null, undefined>;

/** 全体表示で、屋号の読みやすさを譲ってでも系図全体を画面に収める下限の倍率 */
const FIT_ALL_MIN = 0.58;

/**
 * D3 が SVG を専有する描画面。React は props の変化を class の付け替えとして伝えるだけで、
 * SVG の再構築は行わない（初回マウント時のみ構築）。
 */
export function TreeCanvas({ ref, layout, filter, selectedId, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  // D3 のハンドラは初回構築時に束縛するため、最新の onSelect を ref 経由で参照する
  const onSelectRef = useRef(onSelect);
  useLayoutEffect(() => { onSelectRef.current = onSelect; });

  // D3 側で保持する参照（React の再レンダリングと無関係）
  const d3Ref = useRef<{
    svg: SvgSel; g: GSel;
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
    nodeSel: d3.Selection<SVGGElement, PlacedShop, SVGGElement, unknown>;
    linkSel: d3.Selection<SVGPathElement, Link, SVGGElement, unknown>;
  } | null>(null);

  const reducedMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── 初回構築 ──
  useEffect(() => {
    const svgEl = svgRef.current, stage = stageRef.current;
    if (!svgEl || !stage) return;
    const svg = d3.select(svgEl);
    const g = svg.append("g");
    const gLinks = g.append("g");
    const gNodes = g.append("g");

    const linkSel = gLinks.selectAll<SVGPathElement, Link>("path").data(layout.links, (d) => d.id).join("path")
      .attr("class", (d) => `link ${d.kind} ${d.kind === "drop" ? d.child.edge ?? "" : ""}`)
      .attr("data-id", (d) => d.id)
      .attr("d", (d) => d.d)
      .attr("stroke", (d) => (d.kind === "drop" ? LINEAGES[d.child.lineage].color : null));

    const nodeSel = gNodes.selectAll<SVGGElement, PlacedShop>("g.node").data(layout.nodes, (d) => d.id).join("g")
      .attr("class", "node")
      .attr("data-id", (d) => d.id)
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    nodeSel.append("rect").attr("class", "hit")
      .attr("x", -SIB / 2 + 2).attr("y", -MARK - 6).attr("width", SIB - 4).attr("height", (d) => labelHeight(d) + 12);
    nodeSel.append("circle").attr("class", "halo").attr("r", MARK + 8);
    nodeSel.filter((d) => d.edge === "direct" || d.edge === "former").append("circle").attr("class", "ring")
      .attr("r", MARK + 4).attr("stroke", (d) => LINEAGES[d.lineage].color)
      .attr("stroke-dasharray", (d) => (d.edge === "former" ? "2.5 2.5" : null));
    nodeSel.append("circle").attr("class", "mark").attr("r", MARK)
      .attr("fill", (d) => (d.status === "open" ? LINEAGES[d.lineage].color : "var(--bg)"))
      .attr("stroke", (d) => LINEAGES[d.lineage].color);

    // 縦書き：1文字ずつ tspan を dy で積む（ブラウザ差を避け、高さを確定計算できる）
    nodeSel.append("text").attr("class", "name").attr("text-anchor", "middle").attr("y", MARK + PAD_TOP)
      .selectAll("tspan").data((d) => [...d.name]).join("tspan").attr("x", 0).attr("dy", CH).text((c) => c);
    nodeSel.filter((d) => !!d.sub).append("text").attr("class", "sub").attr("text-anchor", "middle")
      .attr("y", (d) => MARK + PAD_TOP + d.name.length * CH + 6)
      .selectAll("tspan").data((d) => [...d.sub]).join("tspan").attr("x", 0).attr("dy", SUBCH).text((c) => c);

    if (layout.capitals.length) {
      const cx0 = layout.capitals[0].x - SIB / 2, cx1 = layout.capitals[layout.capitals.length - 1].x + SIB / 2;
      g.append("path").attr("class", "outside-rule").attr("d", `M${cx0},${LEVEL - 26} H${cx1}`);
      g.append("text").attr("class", "outside-label").attr("x", (cx0 + cx1) / 2).attr("y", LEVEL - 36)
        .attr("text-anchor", "middle").text("系譜に属さない店（資本系）");
    }

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.25, 3]).on("zoom", (e) => g.attr("transform", e.transform));
    svg.call(zoom).on("dblclick.zoom", null);

    // ホバー：吉村家までの系譜を浮かび上がらせる
    nodeSel.on("mouseenter", (_e, d) => {
      const ids = ancestry(d.id, SHOP_BY_ID);
      g.classed("has-lit", true);
      nodeSel.classed("lit", (n) => ids.has(n.id));
      linkSel.classed("lit", (l) => l.kind === "drop" ? ids.has(l.child.id) : ids.has(l.parent.id) && l.children.some((c) => ids.has(c.id)));
    }).on("mouseleave", () => {
      g.classed("has-lit", false);
      nodeSel.classed("lit", false);
      linkSel.classed("lit", false);
    }).on("click", (e, d) => { e.stopPropagation(); onSelectRef.current(d.id); });
    svg.on("click", () => onSelectRef.current(null));

    d3Ref.current = { svg, g, zoom, nodeSel, linkSel };

    const onResize = () => fit(false);
    addEventListener("resize", onResize);
    fit(false);

    return () => {
      removeEventListener("resize", onResize);
      svg.on(".zoom", null).on("click", null);
      g.remove();
      d3Ref.current = null;
    };
    // layout はマウント時に確定している前提（データ変更時はキーで再マウントする）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  // ── フィルタ・年 → class の付け替えのみ ──
  useEffect(() => {
    const d = d3Ref.current;
    if (!d) return;
    const hidden = new Set<string>(), dim = new Set<string>();
    layout.nodes.forEach((n) => {
      if (n.founded > filter.year) hidden.add(n.id);
      else if (!matches(n, filter)) dim.add(n.id);
    });
    d.nodeSel.classed("future", (n) => hidden.has(n.id)).classed("dim", (n) => dim.has(n.id));
    d.linkSel
      .classed("future", (l) => l.kind === "drop" ? hidden.has(l.child.id) : l.children.every((c) => hidden.has(c.id)))
      .classed("dim", (l) => l.kind === "drop" ? dim.has(l.child.id) && dim.has(l.parent.id) : l.children.every((c) => dim.has(c.id)));
  }, [layout, filter]);

  // ── 選択 ──
  useEffect(() => {
    d3Ref.current?.nodeSel.classed("selected", (n) => n.id === selectedId);
  }, [selectedId]);

  function fit(animate: boolean) {
    const d = d3Ref.current, stage = stageRef.current;
    if (!d || !stage) return;
    const bb = d.g.node()!.getBBox();
    const W = stage.clientWidth, H = stage.clientHeight;
    const ideal = Math.min((W - 60) / bb.width, (H - 60) / bb.height, 1.1);
    // 屋号が読める下限は 0.72。ただし FIT_ALL_MIN までの縮小で全体が収まるなら、
    // 読みやすさより一覧性を採る。それ以上縮むなら吉村家を上中央に置いて下へ辿らせる
    const s = ideal >= FIT_ALL_MIN ? ideal : 0.72;
    const fitsAll = bb.height * s <= H - 60;
    const t = d3.zoomIdentity
      .translate(W / 2 - (fitsAll ? bb.x + bb.width / 2 : layout.root.x) * s, fitsAll ? H / 2 - (bb.y + bb.height / 2) * s : 36 - bb.y * s)
      .scale(s);
    if (animate && !reducedMotion()) d.svg.transition().duration(600).call(d.zoom.transform, t);
    else d.svg.call(d.zoom.transform, t);
  }

  function focus(id: string) {
    const d = d3Ref.current, stage = stageRef.current;
    const n = layout.nodes.find((x) => x.id === id);
    if (!d || !stage || !n) return;
    const W = stage.clientWidth, H = stage.clientHeight;
    // 詳細パネルが開く分だけ避けて中央に置く：PC は右パネル分を左へ、スマホは下部シート分を上へ
    const mobile = W <= 640;
    const panelW = mobile ? 0 : 370;
    const cy = mobile ? H * 0.21 : H / 2;
    const s = Math.max(d3.zoomTransform(d.svg.node()!).k, 1.1);
    const t = d3.zoomIdentity.translate((W - panelW) / 2 - n.x * s, cy - (n.y + labelHeight(n) / 2) * s).scale(s);
    if (reducedMotion()) d.svg.call(d.zoom.transform, t);
    else d.svg.transition().duration(600).call(d.zoom.transform, t);
  }

  function zoomBy(k: number) {
    const d = d3Ref.current;
    if (!d) return;
    d.svg.transition().duration(250).call(d.zoom.scaleBy, k);
  }

  useImperativeHandle(ref, () => ({ fit, focus, zoomBy }));

  return (
    <div className="stage" ref={stageRef}>
      <svg className="tree" ref={svgRef} role="img" aria-label="家系ラーメンの系図" />
    </div>
  );
}
