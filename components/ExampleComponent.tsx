import { PluginContext } from "molstar/lib/mol-plugin/context";
import { UUID } from "molstar/lib/mol-util";
import { Asset } from "molstar/lib/mol-util/assets";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function ChartExample({ plugin }: { plugin: PluginContext }) {
  const [inputValue, setInputValue] = useState<string>();

  return <></>;
}
