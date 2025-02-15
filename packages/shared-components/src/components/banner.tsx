import { cn } from "@/lib/utils";
import { ComponentProps, FC } from "react";
import { ModeToggle } from "./mode-toggle";
import { Settings } from "./settings";
import { Button } from "./ui/button";
import { SiGithub } from "@icons-pack/react-simple-icons";

export const Banner: FC<ComponentProps<"div">> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("flex flex-row p-3 space-x-3", className)} {...props}>
      <Settings className="mr-auto" />
      {children}
      <ModeToggle className="ml-auto" />

      <Button size="icon" variant="outline" className="rounded-full" asChild>
        <a href="https://github.com/a3ng7n/tz" target="_blank">
          <SiGithub />
        </a>
      </Button>
    </div>
  );
};
