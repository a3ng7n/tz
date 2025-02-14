import { cn } from "@/lib/utils";
import { ComponentProps, FC } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useSettings } from "@/settings-store";
import { useShallow } from "zustand/react/shallow";

export const Settings: FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  const {
    zoneTimeFormat,
    setZoneTimeFormat,
    mapTexture,
    setMapTexture,
    showTZOutlines,
    setShowTZOutlines,
  } = useSettings(
    useShallow((state) => ({
      zoneTimeFormat: state.zoneTimeFormat,
      setZoneTimeFormat: state.setZoneTimeFormat,
      mapTexture: state.mapTexture,
      setMapTexture: state.setMapTexture,
      showTZOutlines: state.showTZOutlines,
      setShowTZOutlines: state.setShowTZOutlines,
    })),
  );

  return (
    <div className={cn("", className)} {...props}>
      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sticky="always"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Zone Time Format</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={zoneTimeFormat}
                  onValueChange={setZoneTimeFormat as any}
                >
                  <DropdownMenuRadioItem
                    value="12h"
                    onSelect={(e) => e.preventDefault()}
                  >
                    12H
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="24h"
                    onSelect={(e) => e.preventDefault()}
                  >
                    24H
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Map Texture</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={mapTexture}
                  onValueChange={setMapTexture as any}
                >
                  <DropdownMenuRadioItem
                    value="colorful"
                    onSelect={(e) => e.preventDefault()}
                  >
                    Default
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="terrain"
                    onSelect={(e) => e.preventDefault()}
                  >
                    Terrain
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuCheckboxItem
            checked={showTZOutlines}
            onCheckedChange={setShowTZOutlines}
            onSelect={(e) => e.preventDefault()}
          >
            Show Zone Outlines
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
