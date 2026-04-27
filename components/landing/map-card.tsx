"use client";

import { useEffect, useRef } from "react";

/**
 * Leaflet Map Card — İstanbul park pin'leri
 * CDN üzerinden Leaflet yüklenir (npm paketi gerekmez).
 */
export default function MapCard() {
  const mapRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    if (!mapRef.current) return;

    let cleanup: (() => void) | undefined;

    const ensureLeafletCss = () => {
      if (document.querySelector('link[data-leaflet="1"]')) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity =
        "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      link.setAttribute("data-leaflet", "1");
      document.head.appendChild(link);
    };

    const ensureLeafletJs = (): Promise<void> =>
      new Promise((resolve, reject) => {
        if ((window as unknown as { L?: unknown }).L) return resolve();
        const existing = document.querySelector(
          'script[data-leaflet="1"]'
        ) as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject());
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";
        script.setAttribute("data-leaflet", "1");
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });

    ensureLeafletCss();
    ensureLeafletJs()
      .then(() => {
        if (!mapRef.current) return;
        initializedRef.current = true;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L;
        const map = L.map(mapRef.current, {
          center: [41.03, 29.02],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          keyboard: false,
          boxZoom: false,
          tap: false,
        });

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
          { maxZoom: 19, subdomains: "abcd" }
        ).addTo(map);

        const pinIcon = (color: string, label: string) =>
          L.divIcon({
            className: "custom-park-pin",
            html:
              '<div style="position:relative;width:36px;height:36px;">' +
              '<div style="position:absolute;inset:0;border-radius:50%;border:2px solid ' +
              color +
              ';opacity:.4;animation:pingRing 2.4s ease-out infinite;"></div>' +
              '<div style="position:absolute;inset:8px;border-radius:50%;background:' +
              color +
              ";box-shadow:0 4px 12px " +
              color +
              'aa;display:grid;place-items:center;color:#fff;font-weight:800;font-size:10px;">' +
              label +
              "</div>" +
              "</div>",
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

        const pins = [
          { lat: 41.0426, lng: 29.0086, color: "#16a085", label: "P" },
          { lat: 41.0507, lng: 28.9938, color: "#1d7adb", label: "P" },
          { lat: 41.0369, lng: 28.985, color: "#4aa0eb", label: "P" },
          { lat: 40.9905, lng: 29.0277, color: "#16a085", label: "P" },
          { lat: 41.0214, lng: 29.0141, color: "#f4b740", label: "P" },
        ];
        pins.forEach((p) => {
          L.marker([p.lat, p.lng], {
            icon: pinIcon(p.color, p.label),
          }).addTo(map);
        });

        cleanup = () => {
          map.remove();
        };
      })
      .catch(() => {
        // Leaflet yüklenemedi — sessizce geç
      });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className="map-card">
      <div id="leaflet-map" ref={mapRef} />
      <div className="map-attrib">
        ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenStreetMap
        </a>
      </div>
    </div>
  );
}
