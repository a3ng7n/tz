import { Size } from "maplibre-gl";
import { Dispatch, SetStateAction } from "react";
import { create, StateCreator } from "zustand";

export interface LatLng {
  lat: number;
  lng: number;
}

interface UIState {
  time: Date;
  setTime: Dispatch<SetStateAction<Date>>;
  center: LatLng;
  setCenter: Dispatch<SetStateAction<LatLng>>;
  mapZoom: number;
  setMapZoom: Dispatch<SetStateAction<number>>;
  bounds: [LatLng, LatLng];
  setBounds: Dispatch<SetStateAction<[LatLng, LatLng]>>;
  canvasSize: Size;
  setCanvasSize: Dispatch<SetStateAction<Size>>;
}

const uiStateCreator: StateCreator<UIState, [], []> = (set, _) => ({
  time: new Date(Date.now()),
  setTime: (payload) => {
    set((prev) => {
      if (typeof payload === "function") {
        return { time: payload(prev.time) };
      } else {
        return { time: payload };
      }
    });
  },
  center: { lat: 0, lng: 0 },
  setCenter: (payload) => {
    set((prev) => {
      if (typeof payload === "function") {
        return { center: payload(prev.center) };
      } else {
        return { center: payload };
      }
    });
  },
  mapZoom: 0,
  setMapZoom: (payload) => {
    set((prev) => {
      if (typeof payload === "function") {
        return { mapZoom: payload(prev.mapZoom) };
      } else {
        return { mapZoom: payload };
      }
    });
  },
  bounds: [
    { lat: 0, lng: 0 },
    { lat: 0, lng: 0 },
  ],
  setBounds: (payload) => {
    set((prev) => {
      if (typeof payload === "function") {
        return { bounds: payload(prev.bounds) };
      } else {
        return { bounds: payload };
      }
    });
  },
  canvasSize: { width: 0, height: 0 },
  setCanvasSize: (payload) => {
    set((prev) => {
      if (typeof payload === "function") {
        return { canvasSize: payload(prev.canvasSize) };
      } else {
        return { canvasSize: payload };
      }
    });
  },
});

export const useUIState = create(uiStateCreator);
