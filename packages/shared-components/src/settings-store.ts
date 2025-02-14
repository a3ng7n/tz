import { create, StateCreator } from "zustand";
import { DSSA } from "./lib/utils";

interface SettingsState {
  mapTexture: "colorful" | "terrain";
  setMapTexture: DSSA<SettingsState["mapTexture"]>;
  showTZOutlines: boolean;
  setShowTZOutlines: DSSA<SettingsState["showTZOutlines"]>;
  showHourBands: boolean;
  setShowHourBands: DSSA<SettingsState["showHourBands"]>;
  zoneTimeFormat: "12h" | "24h";
  setZoneTimeFormat: DSSA<SettingsState["zoneTimeFormat"]>;
  timeSource: "system" | "manual";
  setTimeSource: DSSA<SettingsState["timeSource"]>;
}

const settingsStateCreator: StateCreator<SettingsState, [], []> = (set, _) => ({
  mapTexture: "colorful",
  setMapTexture: (payload) => {
    set((prev) => {
      if (typeof payload === "function") {
        return { mapTexture: payload(prev.mapTexture) };
      } else {
        return { mapTexture: payload };
      }
    });
  },

  showTZOutlines: true,
  setShowTZOutlines: (payload) => {
    set((prev) => {
      if (typeof payload === "function") {
        return { showTZOutlines: payload(prev.showTZOutlines) };
      } else {
        return { showTZOutlines: payload };
      }
    });
  },

  showHourBands: false,
  setShowHourBands: (payload) => {
    set((prev) => {
      if (typeof payload === "function") {
        return { showHourBands: payload(prev.showHourBands) };
      } else {
        return { showHourBands: payload };
      }
    });
  },

  zoneTimeFormat: "24h",
  setZoneTimeFormat: (payload) => {
    set((prev) => {
      if (typeof payload === "function") {
        return { zoneTimeFormat: payload(prev.zoneTimeFormat) };
      } else {
        return { zoneTimeFormat: payload };
      }
    });
  },

  timeSource: "system",
  setTimeSource: (payload) => {
    set((prev) => {
      if (typeof payload === "function") {
        return { timeSource: payload(prev.timeSource) };
      } else {
        return { timeSource: payload };
      }
    });
  },
});

export const useSettings = create(settingsStateCreator);
