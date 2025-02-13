import {
  Map as MapImpl,
  NavigationControl,
  CameraUpdateTransformFunction,
} from "maplibre-gl";
import { useCallback, useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import timezoneData from "./ne_10m_time_zones.json";
import ShadeMap from "mapbox-gl-shadow-simulator";
import { useUIState } from "./store";
import { useShallow } from "zustand/react/shallow";

export function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null!);

  const { time, setMapZoom, setCenter, setBounds, setCanvasSize } = useUIState(
    useShallow((state) => ({
      time: state.time,
      setMapZoom: state.setMapZoom,
      setCenter: state.setCenter,
      setBounds: state.setBounds,
      setCanvasSize: state.setCanvasSize,
    })),
  );

  const camUpdate: CameraUpdateTransformFunction = useCallback(
    (next) => {
      setMapZoom(next.zoom);
      setCenter(next.center);
      return next;
    },
    [setMapZoom, setCenter],
  );

  useEffect(() => {
    const map = new MapImpl({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json", // style URL
      center: [139.753, 35.6844],
      zoom: 14,
      attributionControl: false,
      transformCameraUpdate: camUpdate,
    });

    map.addControl(new NavigationControl(), "top-right");

    const shadeMap = new ShadeMap({
      date: new Date(), // display shadows for current date
      color: "#01112f", // shade color
      opacity: 0.7, // opacity of shade color
      apiKey: "XXXXXX", // obtain from https://shademap.app/about/
      terrainSource: {
        tileSize: 256, // DEM tile size
        maxZoom: 15, // Maximum zoom of DEM tile set
        getSourceUrl: ({ x, y, z }: { x: any; y: any; z: any }) => {
          // return DEM tile url for given x,y,z coordinates
          return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
        },
        getElevation: ({ r, g, b, a }: { r: any; g: any; b: any; a: any }) => {
          // return elevation in meters for a given DEM tile pixel
          return r * 256 + g + b / 256 - 32768;
        },
      } as any,
    });

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

      shadeMap.addTo(map);

      // advance shade by 1 hour
      shadeMap.setDate(time);

      // sometime later
      // ...remove layer
      // shadeMap.remove();
    });

    map.on("move", () => {
      const bounds = map.getBounds();
      const [lng1, lat1] = [bounds.getWest(), bounds.getSouth()];
      const [lng2, lat2] = [bounds.getEast(), lat1]; // Use same latitude
      setBounds([
        { lng: lng1, lat: lat1 },
        { lng: lng2, lat: lat2 },
      ]);
      const canvas = map.getCanvas();
      setCanvasSize({ width: canvas.width, height: canvas.height });
    });

    return () => {
      map.remove();
    };
  }, []);

  mapContainerRef.current;

  return (
    <>
      <div ref={mapContainerRef} className="absolute size-full" />
    </>
  );
}
