import { Map } from "./map";
import { Times } from "./times";
import { Timezones } from "./timezones";

export const Main = () => {
  return (
    <div className="h-svh w-svw flex flex-col">
      <Times />
      <Timezones />
      <Map />
    </div>
  );
};
