import {
  Map as MapImpl,
  NavigationControl,
  CameraUpdateTransformFunction,
} from "maplibre-gl";
import { useCallback, useEffect, useRef } from "react";
import "maplibre-theme/icons.lucide.css";
import "maplibre-theme/modern.css";
import timezoneData from "./ne_10m_time_zones.json";
import ShadeMap from "mapbox-gl-shadow-simulator";
import { useUIState } from "./ui-store";
import { useSettings } from "./settings-store";
import { useShallow } from "zustand/react/shallow";
import { useTheme } from "./components/theme-provider";
import { darkStyle, lightStyle } from "./lib/map-styles";

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

  const { showTZOutlines } = useSettings(
    useShallow((state) => ({ showTZOutlines: state.showTZOutlines })),
  );

  const { resolvedTheme } = useTheme();

  const camUpdate: CameraUpdateTransformFunction = useCallback(
    (next) => {
      setMapZoom(next.zoom);
      setCenter(next.center);
      return next;
    },
    [setMapZoom, setCenter],
  );

  const mapRef = useRef<MapImpl>(null!);
  const shadeRef = useRef<ShadeMap>(null!);

  useEffect(() => {
    mapRef.current = new MapImpl({
      container: mapContainerRef.current,
      style: lightStyle,
      center: [0, 0],
      zoom: 0,
      attributionControl: false,
      transformCameraUpdate: camUpdate,
    });

    shadeRef.current = new ShadeMap({
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
        getElevation: ({
          r,
          g,
          b,
          a: _,
        }: {
          r: any;
          g: any;
          b: any;
          a: any;
        }) => {
          // return elevation in meters for a given DEM tile pixel
          return r * 256 + g + b / 256 - 32768;
        },
      } as any,
    });

    const map = mapRef.current;
    const shadeMap = shadeRef.current;

    map.addControl(new NavigationControl(), "top-right");

    map.on("move", () => {
      const bounds = map.getBounds();
      const [lng1, lat1] = [bounds.getWest(), bounds.getSouth()];
      const [lng2, lat2] = [bounds.getEast(), bounds.getNorth()];
      setBounds([
        { lng: lng1, lat: lat1 },
        { lng: lng2, lat: lat2 },
      ]);
      const canvas = map.getCanvas();
      setCanvasSize({ width: canvas.width, height: canvas.height });
    });

    return () => {
      shadeMap.remove();
      map.remove();
    };
  }, []);

  if (shadeRef.current !== null) {
    shadeRef.current.setDate(time);
  }

  useEffect(() => {
    if (mapRef.current !== null) {
      const baseStyle = { light: lightStyle, dark: darkStyle }[resolvedTheme];

      const prevOutlineVisibility = mapRef.current.getLayer(
        "timezone-boundaries",
      )?.visibility;

      const addAfter = () => {
        mapRef.current.off("styledata", addAfter);
        shadeRef.current.addTo(mapRef.current);
        shadeRef.current.setColor(
          { light: "#01112f", dark: "#01082d" }[resolvedTheme],
        ); // shade color
        shadeRef.current.setOpacity({ light: 0.7, dark: 0.8 }[resolvedTheme]); // opacity of shade color
        mapRef.current.setLayoutProperty(
          "timezone-boundaries",
          "visibility",
          prevOutlineVisibility,
        );
      };

      shadeRef.current.remove();
      mapRef.current.on("styledata", addAfter);

      mapRef.current.setStyle(
        {
          ...baseStyle,
          layers: [
            ...baseStyle.layers,
            {
              id: "timezone-boundaries",
              type: "fill",
              source: "timezones",
              paint: {
                "fill-color": "#88888800",
                "fill-opacity": { light: 1.0, dark: 0.35 }[resolvedTheme],
                "fill-outline-color": { light: "#000000", dark: "#FFFFFF" }[
                  resolvedTheme
                ],
              },
              filter: ["==", "$type", "Polygon"],
            },
          ],
          sources: {
            ...baseStyle.sources,
            timezones: {
              type: "geojson",
              data: timezoneData as any,
            },
          },
        },

        { diff: true },
      );
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (mapRef.current !== null) {
      if (mapRef.current.getLayer("timezone-boundaries"))
        mapRef.current.setLayoutProperty(
          "timezone-boundaries",
          "visibility",
          showTZOutlines ? "visible" : "none",
        );
    }
  }, [showTZOutlines]);

  return (
    <>
      <div ref={mapContainerRef} className="absolute size-full" />
    </>
  );
}
