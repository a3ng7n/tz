import { Map as MapImpl, NavigationControl, Marker } from "maplibre-gl";
import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import timezoneData from "./ne_10m_time_zones.json";

export const Map = () => {
  const mapContainerRef = useRef(null!);

  useEffect(() => {
    const map = new MapImpl({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json", // style URL
      center: [139.753, 35.6844],
      zoom: 14,
      attributionControl: false,
    });

    map.addControl(new NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("timezones", {
        type: "geojson",
        data: timezoneData as any,
      });

      map.addLayer({
        id: "timezone-boundaries",
        type: "fill",
        source: "timezones",
        paint: {
          "fill-color": "#88888800",
          "fill-opacity": 1.0,
          "fill-outline-color": "#000000",
        },
        filter: ["==", "$type", "Polygon"],
      });
    });

    new Marker({ color: "#FF0000" }).setLngLat([139.7525, 35.6846]).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapContainerRef} className="absolute size-full" />;
};
