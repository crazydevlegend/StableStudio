import { Generation } from "~/Generation";
import { Plugin } from "~/Plugin";

export namespace StableDiffusionV1 {
  type Image = ({ base64: string } | { src: string }) & {
    weight: number;
    mask?: boolean;
  };

  export type Init = Image & { mask: false };
  export type Mask = Image & { mask: true };

  export type Input = {
    id: ID;
    prompts: Generation.Image.Prompts;
    sampler: Generation.Image.Input.Sampler;
    cfgScale?: number;
    height: number;
    width: number;
    steps: number;
    seed: number;
    guidance: boolean;
    model: string;
    strength: number;
    mask: Mask | null;
    init: Init | null;
    extras?: {
      $IPC?: { preset?: string };
      mode?: "multistage";
    };
  };

  export namespace Input {
    export const initialWithStyle = (id: ID): Input =>
      Generation.Image.Style.apply({ input: initial(id) });

    export const initial = (id: ID): Input => {
      const pluginDefaultInput =
        Plugin.get().getStableDiffusionDefaultInput?.();

      const pluginDefaultInputDefaultPrompts = pluginDefaultInput?.prompts?.map(
        ({ text, weight }) => ({
          text: text ?? Generation.Image.Prompt.Random.get(),
          weight: weight ?? 1,
        })
      );

      return {
        id,

        prompts: pluginDefaultInputDefaultPrompts ?? [
          { text: Generation.Image.Prompt.Random.get(), weight: 1 },
          { text: "", weight: -0.75 },
        ],

        model: pluginDefaultInput?.model ?? "stable-diffusion-xl-beta-v2-2-2",
        sampler: pluginDefaultInput?.sampler ?? { id: "0", name: "DDIM" },
        height: pluginDefaultInput?.width ?? 1024,
        width: pluginDefaultInput?.height ?? 1024,
        steps: pluginDefaultInput?.steps ?? 50,
        seed: pluginDefaultInput?.seed ?? 0,
        guidance: false,
        strength: 1,
        mask: null,
        init: null,
        extras: {
          $IPC: {
            preset: "enhance",
          },
        },
      };
    };
  }

  export type Output = { objectURL: string };

  export const price = (input: Input): number => {
    if (Generation.Image.Input.isUpscaling(input)) return 0.2;

    const { steps, width, height } = input;

    if (input.model.includes("-xl-")) {
      // XL models are 2.5 times more expensive
      return (((width * height - 169527) * steps) / 30) * 5.4e-8 * 100;
    } else {
      return (((width * height - 169527) * steps) / 30) * 2.16e-8 * 100;
    }
  };

  export const baseResolution = (model: string) => {
    if (model.includes("1024")) return 1024;
    if (model.includes("768")) return 768;

    switch (model) {
      case "stable-diffusion-v1-5":
        return 1024;
      case "stable-diffusion-v1-4":
        return 1024;
    }

    return 1024;
  };

  export const validate = ({
    height,
    width,
    steps,
    mask,
    init,
    prompts,
  }: Input): boolean =>
    height > 0 &&
    height <= 2048 &&
    width > 0 &&
    width <= 2048 &&
    steps > 0 &&
    steps <= 150 &&
    (mask === null || mask.mask) &&
    (init === null || !init.mask) &&
    ((mask && init) || !mask) &&
    prompts.filter(({ weight, text }) => weight > 0 && text && text !== "")
      .length > 0 &&
    (prompts.filter(({ text }) => text && text.length > 0).length > 0 ||
      init !== null);
}
