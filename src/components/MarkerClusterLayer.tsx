import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { MapPin } from "./MapView.types";

interface MarkerClusterLayerProps {
  pins: MapPin[];
  makeIcon: (pin: MapPin) => L.DivIcon;
  onPinClick?: (pin: MapPin) => void;
}

export function MarkerClusterLayer({ pins, makeIcon, onPinClick }: MarkerClusterLayerProps) {
  const map = useMap();
  const clusterRef = useRef<any>(null);

  useEffect(() => {
    if (!clusterRef.current) {
      clusterRef.current = (L as any).markerClusterGroup({
        maxClusterRadius: 45,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,
        chunkedLoading: true,
        chunkInterval: 100,
        chunkDelay: 10,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          let size = "small";
          let diameter = 36;
          if (count >= 100) { size = "large"; diameter = 52; }
          else if (count >= 10) { size = "medium"; diameter = 44; }

          return new L.DivIcon({
            className: "",
            html: `<div class="wayfare-cluster wayfare-cluster-${size}" style="
              width: ${diameter}px;
              height: ${diameter}px;
              border-radius: 50%;
              background: hsl(43 72% 52% / 0.85);
              border: 2px solid hsl(43 80% 60%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Cinzel', serif;
              font-weight: 700;
              font-size: ${count >= 100 ? 14 : 12}px;
              color: hsl(225 60% 7%);
              box-shadow: 0 2px 12px hsl(43 72% 52% / 0.4), 0 0 20px hsl(43 72% 52% / 0.15);
              transition: transform 0.2s ease;
            ">${count}</div>`,
            iconSize: [diameter, diameter],
            iconAnchor: [diameter / 2, diameter / 2],
          });
        },
      });
      map.addLayer(clusterRef.current);
    }

    const group = clusterRef.current;
    group.clearLayers();

    const markers = pins.map((pin) => {
      const marker = L.marker([pin.lat, pin.lng], { icon: makeIcon(pin) });
      marker.bindPopup(
        `<div class="text-xs"><strong>${pin.title}</strong>${pin.subtitle ? `<p style="opacity:0.7">${pin.subtitle}</p>` : ""}</div>`
      );
      if (onPinClick) {
        marker.on("click", () => onPinClick(pin));
      }
      return marker;
    });

    group.addLayers(markers);

    return () => {
      group.clearLayers();
    };
  }, [pins, makeIcon, onPinClick, map]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
    };
  }, [map]);

  return null;
}
