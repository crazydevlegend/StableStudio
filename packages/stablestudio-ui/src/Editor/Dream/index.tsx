import { Editor } from "~/Editor";
import { Generation } from "~/Generation";

import { Box } from "./Box";
import { Choose } from "./Choose";
import { Create } from "./Create";
import { Pagination } from "./Pagination";
import { Render } from "./Render";
import { Results } from "./Results";

export * from "./Dreams";

export type Dream = Editor.Entity.Definition<{
  type: "dream";
  outputID?: ID;
  choicesPage?: number;
  lastMode?: Editor.Canvas.Render.RenderMode;
}>;

export function Dream({ id }: { id: ID }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { input } = Generation.Image.Input.use(id);
  return (
    <Editor.Entity
      id={id}
      showBorder={false}
      showHandles={false}
      onSizeChange={setSize}
      resizable={false}
      sizeClamp={{
        min: { width: 768, height: 1024 },
        max: input?.model.includes("xl")
          ? { width: 768, height: 1024 }
          : { width: 1024, height: 1024 },
      }}
    >
      {Editor.Floating.use({
        id,
        ...size,
        content: <Box id={id} />,
      })}
      {Editor.Floating.use({
        id: id + "pagination",
        ...size,
        content: <Pagination id={id} />,
      })}
      {Editor.Floating.use({
        id: id + "results",
        ...size,
        content: <Results id={id} />,
      })}
    </Editor.Entity>
  );
}

export declare namespace Dream {
  export { Choose, Create, Pagination, Render, Results };
}

export namespace Dream {
  Dream.Choose = Choose;
  Dream.Create = Create;
  Dream.Pagination = Pagination;
  Dream.Render = Render;
  Dream.Results = Results;

  export const preset = (): Omit<Dream, "index"> => ({
    id: ID.create(),
    type: "dream",
    x: 0,
    y: 0,
    width: 1024,
    height: 1024,
    locked: false,
    visible: true,
    outputID: undefined,
  });

  export const use = (id: string) => Editor.Entity.useType(id, "dream");
}
