// src/MapStage.jsx
import { useRef, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BrandLogo, PropertyCard } from "./UiBits";
import HomeLanding from "./HomeLanding";

function rafThrottle(fn, fps = 30) {
  const frame = 1000 / fps;
  let last = 0, scheduled = false, ctxArgs;
  return (...args) => {
    ctxArgs = args;
    const now = performance.now();
    if (now - last >= frame) {
      last = now; fn(...ctxArgs); scheduled = false;
    } else if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => { last = performance.now(); fn(...ctxArgs); scheduled = false; });
    }
  };
}

const EPS = { center: 0.00003, zoom: 0.001, pitch: 0.2, bearing: 0.2 };
function camChanged(a, b) {
  return (
    Math.abs(a.center[0] - b.center[0]) > EPS.center ||
    Math.abs(a.center[1] - b.center[1]) > EPS.center ||
    Math.abs(a.zoom - b.zoom) > EPS.zoom ||
    Math.abs(a.pitch - b.pitch) > EPS.pitch ||
    Math.abs(a.bearing - b.bearing) > EPS.bearing
  );
}

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const DELHI_CENTER = { lng: 77.209, lat: 28.6139 };
const SCENE_0 = { center: [DELHI_CENTER.lng, DELHI_CENTER.lat], zoom: 8.0, pitch: 0, bearing: 0 };
const CROWN_CENTRAL_PARK = { lng: 77.11039, lat: 28.71963 };
const SCENE_1 = { center: [CROWN_CENTRAL_PARK.lng, CROWN_CENTRAL_PARK.lat], zoom: 14.6, pitch: 65, bearing: -20 };

const UI_SCALE = 0.5;
const BASE = {
  cardW: 208, cardH: 190, sideShift: 70, stemLift: -130,
  entry: [
    { x: -36, y: 0 }, { x: 36, y: 0 }, { x: 0, y: -28 }, { x: 0, y: 28 },
    { x: -28, y: -18 }, { x: 28, y: -18 }, { x: -28, y: 18 }, { x: 28, y: 18 },
  ],
};
const UI = {
  scale: UI_SCALE,
  cardW: Math.round(BASE.cardW * UI_SCALE),
  cardH: Math.round(BASE.cardH * UI_SCALE),
  sideShift: Math.round(BASE.sideShift * UI_SCALE),
  stemLift: Math.round(BASE.stemLift * UI_SCALE),
  entry: BASE.entry.map(d => ({ x: Math.round(d.x * UI_SCALE), y: Math.round(d.y * UI_SCALE) })),
};

const LISTINGS = [
  { id: "pg-01", title: "Premium PG near Rohini West", price: 12500, distanceKm: 0.55, verified: true,
    photoUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400&auto=format&fit=crop", lng: 77.10639, lat: 28.72313 },
  { id: "pg-02", title: "Cozy Studio Apartment", price: 15000, distanceKm: 0.45, verified: true,
    photoUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=400&auto=format&fit=crop", lng: 77.11489, lat: 28.72163 },
  { id: "pg-03", title: "Girls’ Hostel • Sector 5", price: 11000, distanceKm: 0.6, verified: true,
    photoUrl: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=400&auto=format&fit=crop", lng: 77.10689, lat: 28.71663 },
  { id: "pg-04", title: "Shared 2BHK • Budh Vihar", price: 9800, distanceKm: 0.5, verified: false,
    photoUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=400&auto=format&fit=crop", lng: 77.11419, lat: 28.71693 },
  { id: "pg-05", title: "Sunrise Co-Living • N Block", price: 11200, distanceKm: 1.35, verified: true,
    photoUrl: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=400&auto=format&fit=crop", lng: 77.11568, lat: 28.73087 },
  { id: "pg-06", title: "Modern Studio • Near Sector 7", price: 13900, distanceKm: 1.45, verified: true,
    photoUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400&auto=format&fit=crop", lng: 77.1241, lat: 28.71462 },
  { id: "pg-07", title: "Girls’ PG • Pocket C", price: 10500, distanceKm: 1.55, verified: false,
    photoUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400&auto=format&fit=crop", lng: 77.10432, lat: 28.70674 },
  { id: "pg-08", title: "Shared Room • Avantika", price: 9800, distanceKm: 1.65, verified: true,
    photoUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400&auto=format&fit=crop", lng: 77.09478, lat: 28.72532 },
];

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const lerp  = (a, b, t) => a + (b - a) * t;
const smooth = (x) => x * x * (3 - 2 * x);
function lngLatToScreen(map, lng, lat) { try { const p = map.project([lng, lat]); return { x: p.x, y: p.y }; } catch { return null; } }

const HOLD_START = 0.85;
const WIPE_START = 0.85;
const WIPE_END   = 1.0;
const MAX_BLUR_PX = 6;

export default function MapStage({ scrollContainerRef, onWipeStart }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const symbolLayerIdsRef = useRef([]);
  const [loaded, setLoaded]   = useState(false);
  const [scene, setScene]     = useState(0);
  const [cardPos, setCardPos] = useState({});
  const [cardOffset, setCardOffset] = useState({});
  const [scrollP, setScrollP] = useState(0);

  const cardPosRef = useRef({});   useEffect(() => { cardPosRef.current = cardPos; }, [cardPos]);
  const cardOffsetRef = useRef({}); useEffect(() => { cardOffsetRef.current = cardOffset; }, [cardOffset]);

  const lastCamRef = useRef(SCENE_0);
  const setCameraImmediate = useCallback((cam) => {
    const map = mapRef.current; if (!map) return;
    if (!camChanged(lastCamRef.current, cam)) return;
    map.jumpTo({ center: cam.center, zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing });
    lastCamRef.current = cam;
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("over-hero");
    return () => root.classList.remove("over-hero");
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current, style: MAP_STYLE, ...SCENE_0,
      attributionControl: false, interactive: false, antialias: false,
      fadeDuration: 0, renderWorldCopies: false, pitchWithRotate: false,
      pixelRatio: Math.min(1.25, window.devicePixelRatio || 1),
    });
    mapRef.current = map;
    map.on("load", () => {
      setLoaded(true);
      try { map.setPaintProperty("background", "background-color", "#0a0a0a"); } catch {}
      try {
        const layers = map.getStyle()?.layers || [];
        symbolLayerIdsRef.current = layers.filter(l => l.type === "symbol").map(l => l.id);
      } catch {}
      setupMap(map);
      requestAnimationFrame(() => map.resize());
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const onResize = () => map.resize();
    requestAnimationFrame(onResize);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [loaded, scene]);

  const setupMap = useCallback((map) => {
    const updateCardPositions = () => {
      try {
        const pos = {}, off = {};
        const container = map.getContainer();
        const vw = container.clientWidth, vh = container.clientHeight;
        const CARD_W = UI.cardW, CARD_H = UI.cardH;
        const STEM_LIFT = UI.stemLift, SIDE_SHIFT = UI.sideShift;
        const SAFE = { x: 12, y: 10 };
        const chooseOffset = (s) => {
          const cands = [{ ox: SIDE_SHIFT, oy: STEM_LIFT }, { ox: -SIDE_SHIFT, oy: STEM_LIFT }];
          let best = cands[0], bestCost = Infinity;
          for (const cand of cands) {
            const left = s.x + cand.ox - CARD_W / 2, right = s.x + cand.ox + CARD_W / 2;
            const top = s.y + cand.oy - CARD_H, bottom = s.y + cand.oy;
            const overflowX = Math.max(0, SAFE.x - left) + Math.max(0, right - (vw - SAFE.x));
            const overflowY = Math.max(0, SAFE.y - top) + Math.max(0, bottom - (vh - SAFE.y));
            let cost = overflowX * 1.0 + overflowY * 1.2;
            if (overflowY > 0) {
              const oyAdjusted = Math.min(-80, cand.oy + overflowY);
              const top2 = s.y + oyAdjusted - CARD_H, bottom2 = s.y + oyAdjusted;
              const overflowY2 = Math.max(0, SAFE.y - top2) + Math.max(0, bottom2 - (vh - SAFE.y));
              const cost2 = overflowX * 1.0 + overflowY2 * 1.2 + 8;
              if (cost2 < cost) { cand.oy = oyAdjusted; cost = cost2; }
            }
            if (cost < bestCost) { bestCost = cost; best = { ...cand }; }
          }
          let ox = best.ox, oy = best.oy;
          const targetX = s.x + ox, minX = SAFE.x + CARD_W / 2, maxX = vw - (SAFE.x + CARD_W / 2);
          if (targetX < minX) ox += (minX - targetX);
          if (targetX > maxX) ox -= (targetX - maxX);
          const cardTop = s.y + oy - CARD_H;
          if (cardTop < SAFE.y) oy += (SAFE.y - cardTop);
          return { x: ox, y: oy };
        };
        LISTINGS.forEach((l) => {
          const s = lngLatToScreen(map, l.lng, l.lat); if (!s) return;
          pos[l.id] = s; off[l.id] = chooseOffset(s);
        });
        let changed = false;
        const keys = Object.keys(pos), oldKeys = Object.keys(cardPosRef.current);
        if (keys.length !== oldKeys.length) changed = true;
        else {
          for (const id of keys) {
            const a = cardPosRef.current[id], b = pos[id], ao = cardOffsetRef.current[id], bo = off[id];
            if (!a || !ao || !b || !bo || Math.abs(a.x - b.x) > 0.75 || Math.abs(a.y - b.y) > 0.75 || Math.abs(ao.x - bo.x) > 0.75 || Math.abs(ao.y - bo.y) > 0.75) {
              changed = true; break;
            }
          }
        }
        if (changed) { setCardPos(pos); setCardOffset(off); }
      } catch (e) { console.error("updateCardPositions failed:", e); }
    };
    const throttled = rafThrottle(updateCardPositions, 20);
    map.on("move", throttled); map.on("resize", throttled); throttled();
  }, []);

  const setSymbolVisibility = useCallback((visible) => {
    const map = mapRef.current; if (!map) return;
    symbolLayerIdsRef.current.forEach(id => {
      try { map.setPaintProperty(id, "text-opacity", visible ? 1 : 0.15); } catch {}
      try { map.setPaintProperty(id, "icon-opacity", visible ? 1 : 0.15); } catch {}
    });
  }, []);
  useEffect(() => { if (!loaded || !mapRef.current) return; setSymbolVisibility(scene !== 0); }, [loaded, scene, setSymbolVisibility]);

  useEffect(() => {
    if (!mapRef.current || !loaded || !scrollContainerRef.current) return;
    const map = mapRef.current;
    const scrollContainer = scrollContainerRef.current;
    let raf;
    let wipeStarted = false;

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!scrollContainer) return;
        const scrollableHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const p = scrollableHeight > 0 ? scrollContainer.scrollTop / scrollableHeight : 0;
        let targetCam;
        if (p < 0.3) {
          if (scene !== 0) setScene(0);
          const t = p / 0.3;
          targetCam = {
            center: [lerp(SCENE_0.center[0], SCENE_1.center[0], t), lerp(SCENE_0.center[1], SCENE_1.center[1], t)],
            zoom:   lerp(SCENE_0.zoom, SCENE_1.zoom * 0.72, t),
            pitch:  lerp(SCENE_0.pitch, SCENE_1.pitch * 0.35, t),
            bearing: lerp(SCENE_0.bearing, SCENE_1.bearing * 0.5, t),
          };
        } else if (p < HOLD_START) {
          if (scene !== 1) setScene(1);
          const t = (p - 0.3) / (HOLD_START - 0.3);
          targetCam = {
            center: SCENE_1.center,
            zoom:   lerp(SCENE_1.zoom * 0.85, SCENE_1.zoom, t),
            pitch:  lerp(SCENE_1.pitch * 0.8, SCENE_1.pitch, t),
            bearing: SCENE_1.bearing,
          };
        } else {
          targetCam = { center: SCENE_1.center, zoom: SCENE_1.zoom, pitch: SCENE_1.pitch, bearing: SCENE_1.bearing };
        }
        setCameraImmediate(targetCam);
        setScrollP(p);

        if (p >= WIPE_START && !wipeStarted) {
          onWipeStart();
          wipeStarted = true;
        }
      });
    };
    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { scrollContainer.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [loaded, scene, setCameraImmediate, scrollContainerRef, onWipeStart]);

  const rawWipeT = clamp((scrollP - WIPE_START) / (WIPE_END - WIPE_START), 0, 1);
  const wipeT = smooth(rawWipeT);
  const blurT = clamp((wipeT - 0.2) / 0.8, 0, 1);
  const mapBlurPx = blurT * MAX_BLUR_PX;
  const isSettled = scrollP >= 0.7;
  const maxCards = isSettled ? 8 : 6;
  const visibleListings = LISTINGS.slice(0, maxCards);

  return (
    <div className="relative w-screen h-[350vh]">
      <div className="sticky top-0 w-full" style={{ height: "100dvh" }}>
        <div ref={containerRef} className="absolute inset-0 bg-black" style={{
            width: "100%", height: "100%",
            filter: blurT > 0 ? `blur(${mapBlurPx.toFixed(2)}px)` : "none",
            transition: "filter 0.06s linear", willChange: "filter",
          }} />
        <div className={`absolute inset-0 bg-gradient-radial from-transparent via-transparent ${scene === 0 ? "to-black/60" : "to-black/40"} pointer-events-none z-10`}
          style={{ opacity: 1 - wipeT }} />
        <div className="absolute inset-0 bg-black pointer-events-none z-10" style={{ opacity: blurT * 0.45 }} />
        <BrandLogo isVisible={scene === 0} />
        <AnimatePresence>
          {scene === 1 && loaded && wipeT < 0.1 && (
            <>
              {visibleListings.map((l, i) => {
                const firstVisibleAt = 0.35, perCardStagger = 0.1, ramp = 0.4;
                const localStart = firstVisibleAt + i * perCardStagger;
                const t = clamp((scrollP - localStart) / ramp, 0, 1);
                const MIN_ALPHA = 0.5, base = (MIN_ALPHA + (1 - MIN_ALPHA) * t);
                const cardFade = clamp((wipeT - 0.5) / 0.5, 0, 1);
                const extOpacity = base * (1 - cardFade);
                const dir = UI.entry[i % UI.entry.length];
                const slideX = (1 - t) * dir.x, slideY = (1 - t) * dir.y;
                return (
                  <PropertyCard key={l.id} listing={l} position={cardPos[l.id]} offset={cardOffset[l.id]}
                    extOpacity={extOpacity} slide={{ x: slideX, y: slideY }} tilt={{ x: 12, y: -10 }}
                    size={{ w: UI.cardW, h: UI.cardH }} fontScale={UI.scale} />
                );
              })}
            </>
          )}
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 z-[20] bg-white" style={{
            height: "100%", transform: `translateY(${(1 - wipeT) * 100}%)`,
            willChange: "transform", contain: "layout paint size",
          }}>
          <div className="absolute inset-0" style={{
              opacity: wipeT, transition: "opacity 0.06s linear",
              pointerEvents: wipeT > 0.98 ? "auto" : "none",
              overflow: "auto", WebkitOverflowScrolling: "touch",
            }}>
            <HomeLanding isActive={wipeT > 0.98} />
          </div>
        </div>
        {scene === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
            <div className="flex flex-col items-center text-white/60">
              <span className="text-sm mb-2">Scroll to explore</span>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}