import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { getISO2, conflictFill, conflictColor } from "../utils/helpers";
import { CONFLICT_BASELINE, COUNTRY_PROFILES } from "../config";

export default function WorldMap({ topology, conflictData, selectedISO, onCountryClick }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(null);

  const merged = useMemo(() => ({ ...CONFLICT_BASELINE, ...conflictData }), [conflictData]);

  useEffect(() => {
    if (!topology || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const W = container.clientWidth || 900;
    const H = container.clientHeight || 500;

    const svg = d3.select(svgRef.current)
      .attr("width", W)
      .attr("height", H);

    svg.selectAll("*").remove();

    // Definitions: gradients, filters
    const defs = svg.append("defs");

    // Ocean gradient
    const oceanGrad = defs.append("radialGradient").attr("id", "ocean-grad")
      .attr("cx", "50%").attr("cy", "50%").attr("r", "70%");
    oceanGrad.append("stop").attr("offset", "0%").attr("stop-color", "#081428");
    oceanGrad.append("stop").attr("offset", "100%").attr("stop-color", "#04060f");

    // Conflict glow filter
    const glow = defs.append("filter").attr("id", "conflict-glow");
    glow.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", "3").attr("result", "blur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Graticule filter
    const graticuleFilter = defs.append("filter").attr("id", "graticule-blur");
    graticuleFilter.append("feGaussianBlur").attr("stdDeviation", "0.3");

    // Background
    svg.append("rect").attr("width", W).attr("height", H).attr("fill", "url(#ocean-grad)");

    // Graticule (lat/lon grid lines)
    const projection = d3.geoNaturalEarth1()
      .scale((W / 640) * 153)
      .translate([W / 2, H / 2]);

    const path = d3.geoPath().projection(projection);
    const graticule = d3.geoGraticule();

    svg.append("path")
      .datum(graticule())
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.04)")
      .attr("stroke-width", 0.3)
      .attr("d", path);

    // Sphere (ocean boundary)
    svg.append("path")
      .datum({ type: "Sphere" })
      .attr("fill", "url(#ocean-grad)")
      .attr("stroke", "rgba(0,245,196,0.08)")
      .attr("stroke-width", 0.5)
      .attr("d", path);

    // Main group for zooming
    const g = svg.append("g").attr("class", "map-g");
    gRef.current = g;

    const countries = topojson.feature(topology, topology.objects.countries);
    const borders = topojson.mesh(topology, topology.objects.countries, (a, b) => a !== b);

    // Country fills
    const countryPaths = g.selectAll(".country")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", d => {
        const iso2 = getISO2(d.id);
        if (iso2 === selectedISO) return "rgba(123,104,238,0.6)";
        const level = merged[iso2];
        return conflictFill(level);
      })
      .attr("stroke", d => {
        const iso2 = getISO2(d.id);
        if (iso2 === selectedISO) return "#7b68ee";
        const level = merged[iso2];
        return conflictColor(level, 0.3);
      })
      .attr("stroke-width", d => {
        const iso2 = getISO2(d.id);
        return iso2 === selectedISO ? 1.5 : 0.3;
      })
      .style("cursor", "pointer")
      .style("transition", "fill 0.3s, stroke 0.3s");

    // Hover interactions
    countryPaths
      .on("mousemove", function (event, d) {
        const iso2 = getISO2(d.id);
        const level = merged[iso2] || "unknown";
        const [x, y] = d3.pointer(event, svgRef.current);

        d3.select(this)
          .attr("fill", iso2 === selectedISO ? "rgba(123,104,238,0.85)" : (() => {
            if (level === "conflict") return "#4a1010";
            if (level === "medium") return "#2e2000";
            if (level === "stable") return "#003325";
            return "#1a2040";
          })());

        setTooltip({ iso2, level, x, y });
      })
      .on("mouseleave", function (event, d) {
        const iso2 = getISO2(d.id);
        d3.select(this)
          .attr("fill", iso2 === selectedISO ? "rgba(123,104,238,0.6)" : conflictFill(merged[iso2]));
        setTooltip(null);
      })
      .on("click", function (event, d) {
        const iso2 = getISO2(d.id);
        if (iso2 && onCountryClick) onCountryClick(iso2);
      });

    // Country borders
    g.append("path")
      .datum(borders)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.07)")
      .attr("stroke-width", 0.4)
      .attr("d", path);

    // Conflict pulse circles on hotspots
    const conflictCountries = countries.features.filter(d => {
      const iso2 = getISO2(d.id);
      return merged[iso2] === "conflict";
    });

    conflictCountries.forEach(d => {
      const centroid = path.centroid(d);
      if (isNaN(centroid[0]) || isNaN(centroid[1])) return;

      // Static red dot
      g.append("circle")
        .attr("cx", centroid[0]).attr("cy", centroid[1])
        .attr("r", 2.5)
        .attr("fill", "#ff3b3b")
        .attr("opacity", 0.9)
        .style("pointer-events", "none");

      // Animated pulse
      const pulse = g.append("circle")
        .attr("cx", centroid[0]).attr("cy", centroid[1])
        .attr("r", 2.5)
        .attr("fill", "none")
        .attr("stroke", "#ff3b3b")
        .attr("stroke-width", 1)
        .attr("opacity", 0.8)
        .style("pointer-events", "none");

      function animate() {
        pulse
          .attr("r", 2.5)
          .attr("opacity", 0.8)
          .transition().duration(1600)
          .attr("r", 12)
          .attr("opacity", 0)
          .on("end", animate);
      }
      animate();
    });

    // Medium risk dots
    const mediumCountries = countries.features.filter(d => {
      const iso2 = getISO2(d.id);
      return merged[iso2] === "medium";
    });

    mediumCountries.forEach(d => {
      const centroid = path.centroid(d);
      if (isNaN(centroid[0]) || isNaN(centroid[1])) return;
      g.append("circle")
        .attr("cx", centroid[0]).attr("cy", centroid[1])
        .attr("r", 2)
        .attr("fill", "#ff8c00")
        .attr("opacity", 0.7)
        .style("pointer-events", "none");
    });

    // Zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);
    zoomRef.current = zoomBehavior;

    // Resize observer
    const observer = new ResizeObserver(() => {
      const W2 = container.clientWidth;
      const H2 = container.clientHeight;
      svg.attr("width", W2).attr("height", H2);
    });
    observer.observe(container);
    return () => observer.disconnect();

  }, [topology, merged, selectedISO]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
    }
  };
  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.67);
    }
  };
  const handleReset = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg ref={svgRef} style={{ width: "100%", height: "100%", display: "block" }} />

      {/* Hover Tooltip */}
      {tooltip && tooltip.iso2 && (
        <MapTooltip iso2={tooltip.iso2} level={tooltip.level} x={tooltip.x} y={tooltip.y} />
      )}

      {/* Zoom controls */}
      <div style={{
        position: "absolute", bottom: 60, right: 16,
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        {[
          { icon: "+", fn: handleZoomIn, title: "Zoom In" },
          { icon: "−", fn: handleZoomOut, title: "Zoom Out" },
          { icon: "⊙", fn: handleReset, title: "Reset View" },
        ].map(btn => (
          <button key={btn.icon} onClick={btn.fn} title={btn.title} style={{
            width: 30, height: 30, background: "rgba(10,14,28,0.9)",
            border: "1px solid var(--border-bright)", borderRadius: 4,
            color: "var(--text)", fontSize: 16, lineHeight: 1,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => e.target.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.target.style.borderColor = "var(--border-bright)"}
          >{btn.icon}</button>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 16, left: 16,
        background: "rgba(7,10,20,0.9)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "10px 14px",
      }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, marginBottom: 8 }}>
          CONFLICT STATUS
        </div>
        {[
          { color: "#ff3b3b", label: "Active Conflict", icon: "●" },
          { color: "#ff8c00", label: "Elevated Risk", icon: "●" },
          { color: "#00f5c4", label: "Stable", icon: "●" },
          { color: "#7b68ee", label: "Selected", icon: "●" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: l.color, fontSize: 10 }}>{l.icon}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Conflict counter */}
      <div style={{
        position: "absolute", top: 12, right: 16,
        background: "rgba(7,10,20,0.9)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "8px 14px",
        display: "flex", gap: 20,
      }}>
        {[
          { color: "#ff3b3b", label: "CONFLICT", count: Object.values({ ...CONFLICT_BASELINE, ...conflictData }).filter(v => v === "conflict").length },
          { color: "#ff8c00", label: "AT RISK", count: Object.values({ ...CONFLICT_BASELINE, ...conflictData }).filter(v => v === "medium").length },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</div>
            <div className="mono" style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Zoom level */}
      <div style={{
        position: "absolute", bottom: 60, left: 16,
        background: "rgba(7,10,20,0.85)", border: "1px solid var(--border)",
        borderRadius: 4, padding: "4px 8px",
      }}>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
          ZOOM {zoom.toFixed(1)}x
        </span>
      </div>
    </div>
  );
}

// Tooltip component
function MapTooltip({ iso2, level, x, y }) {

  const profile = COUNTRY_PROFILES[iso2];

  const levelLabel = level === "conflict" ? "ACTIVE CONFLICT" : level === "medium" ? "ELEVATED RISK" : level === "stable" ? "STABLE" : "MONITORING";
  const levelColor = level === "conflict" ? "#ff3b3b" : level === "medium" ? "#ff8c00" : level === "stable" ? "#00f5c4" : "var(--text-muted)";

  // Smart tooltip positioning
  const tw = 200, th = profile ? 160 : 80;
  const svgW = window.innerWidth;
  const svgH = window.innerHeight;
  const left = x + tw + 20 > svgW ? x - tw - 10 : x + 16;
  const top = y + th + 10 > svgH ? y - th : y;

  return (
    <div className="animate-up" style={{
      position: "absolute", left, top,
      background: "rgba(7,10,20,0.97)",
      border: `1px solid ${levelColor}33`,
      borderLeft: `2px solid ${levelColor}`,
      borderRadius: 6,
      padding: "10px 14px",
      pointerEvents: "none",
      zIndex: 100,
      minWidth: 180,
      boxShadow: `0 4px 24px rgba(0,0,0,0.6)`,
    }}>
      {profile ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{profile.flag}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", lineHeight: 1.2 }}>{profile.name}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-muted)" }}>{profile.region}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              ["Capital", profile.capital],
              ["Population", profile.pop],
              ["GDP", profile.gdp],
              ["Military", profile.military],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{k}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--text)", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 8, paddingTop: 8,
            borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: levelColor, display: "inline-block" }} />
            <span className="mono" style={{ fontSize: 10, color: levelColor, letterSpacing: 1 }}>{levelLabel}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-dim)", fontStyle: "italic" }}>
            Click for full intelligence report
          </div>
        </>
      ) : (
        <>
          <div className="mono" style={{ fontSize: 12, color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>
            {iso2 || "Unknown Country"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: levelColor, display: "inline-block" }} />
            <span className="mono" style={{ fontSize: 10, color: levelColor, letterSpacing: 1 }}>{levelLabel}</span>
          </div>
        </>
      )}
    </div>
  );
}
