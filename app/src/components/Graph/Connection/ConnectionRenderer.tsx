import { DataInput, ExecInput, ExecOutput } from "@macrograph/core";
import clsx from "clsx";
import { createMemo, For, Match, Show, Switch } from "solid-js";

import { useUIStore } from "~/UIStore";
import { useGraph } from "../Graph";
import { colour } from "../util";

export const ConnectionRender = () => {
  const graph = useGraph();
  const UI = useUIStore();

  const dragState = () => {
    if (UI.state.mouseDragLocation && UI.state.draggingPin) {
      return {
        mouseDragLocation: UI.state.mouseDragLocation,
        draggingPin: UI.state.draggingPin,
      };
    }
    return null;
  };

  const graphOffset = () => UI.state.graphOffset;
  const scale = () => UI.state.scale;

  return (
    <svg class="w-full h-full transform">
      <g>
        <For each={[...graph().nodes.values()]}>
          {(n) => (
            <For each={n.inputs}>
              {(i) => {
                const connectionData = () => {
                  const inputPosition = UI.state.pinPositions.get(i);

                  if (!i.connection) return null;

                  const outputPosition = UI.state.pinPositions.get(
                    i.connection!
                  );

                  if (!inputPosition || !outputPosition) return null;

                  return {
                    input: inputPosition,
                    output: outputPosition,
                  };
                };

                return (
                  <Show when={connectionData()}>
                    {(positions) => (
                      <Switch>
                        <Match when={i instanceof DataInput && i}>
                          {(input) => (
                            <line
                              class={clsx(
                                "stroke-mg-current",
                                colour(input().type)
                              )}
                              x1={positions().input.x - graphOffset().x}
                              y1={positions().input.y - graphOffset().y}
                              x2={positions().output.x - graphOffset().x}
                              y2={positions().output.y - graphOffset().y}
                              stroke-opacity={0.75}
                              stroke-width={2 * scale()}
                            />
                          )}
                        </Match>
                        <Match when={i instanceof ExecInput}>
                          <line
                            x1={positions().input.x - graphOffset().x}
                            y1={positions().input.y - graphOffset().y}
                            x2={positions().output.x - graphOffset().x}
                            y2={positions().output.y - graphOffset().y}
                            stroke={"white"}
                            stroke-opacity={0.75}
                            stroke-width={2 * scale()}
                          />
                        </Match>
                      </Switch>
                    )}
                  </Show>
                );
              }}
            </For>
          )}
        </For>
        <Show when={dragState()}>
          {(state) => {
            const pinPos = () => UI.state.pinPositions.get(state().draggingPin);

            const diffs = () => ({
              x: state().mouseDragLocation.x - graphOffset().x,
              y: state().mouseDragLocation.y - graphOffset().y,
            });

            const colourClass = createMemo(() => {
              const draggingPin = state().draggingPin;

              if (
                draggingPin instanceof ExecInput ||
                draggingPin instanceof ExecOutput
              )
                return "[--mg-current:white]";

              return colour(draggingPin.type);
            });

            return (
              <Show when={pinPos()}>
                {(pos) => (
                  <line
                    class={clsx("stroke-mg-current", colourClass())}
                    x1={pos().x - graphOffset().x}
                    y1={pos().y - graphOffset().y}
                    x2={diffs().x}
                    y2={diffs().y}
                    stroke-opacity={0.75}
                    stroke-width={2 * scale()}
                  />
                )}
              </Show>
            );
          }}
        </Show>
      </g>
    </svg>
  );
};
