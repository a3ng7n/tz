import { Banner } from "./components/banner";
import { ThemeProvider } from "./components/theme-provider";
import { Map } from "./map";
import { Times } from "./times";
import { Timezones } from "./components/timezones";

export const Main = () => {
  return (
    <ThemeProvider>
      <div className="h-svh w-svw flex flex-col">
        <Banner>
          <Times />
        </Banner>
        <Timezones />
        <Map />
      </div>
    </ThemeProvider>
  );
};
