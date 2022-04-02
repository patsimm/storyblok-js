import { StoryblokComponent, StoryblokConfig } from "storyblok-js-client";
import { loadBridge } from "./modules/bridge";

export const useStoryblokBridge = (
  id: string,
  cb: (story: StoryblokComponent<string>) => void,
  options = {}
) => {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.storyblokRegisterEvent === "undefined") {
    console.error(
      "Storyblok Bridge is disabled. Please enable it to use it. Read https://github.com/storyblok/storyblok-js"
    );

    return;
  }

  if (!id) {
    console.warn("Story ID is not defined. Please provide a valid ID.");
    return;
  }

  window.storyblokRegisterEvent(() => {
    if (typeof window.StoryblokBridge === "undefined") {
      console.error(
        "Storyblok Bridge is disabled. Please enable it to use it. Read https://github.com/storyblok/storyblok-js"
      );

      return;
    }
    const sbBridge = new window.StoryblokBridge(options);

    sbBridge.on(["input", "published", "change"], (event) => {
      if (event?.action == "input" && event.story.id === id) {
        cb(event.story);
      } else {
        window.location.reload();
      }
    });
  });
};

export { default as apiPlugin } from "./modules/api";
export { default as storyblokEditable } from "./modules/editable";

export type StoryblokPlugin<R> = (options: any) => R;

export type StoryblokInitOptions<
  Plugins extends Array<StoryblokPlugin<T>>,
  T
> = {
  accessToken?: string;
  use?: Plugins;
  bridge?: boolean;
  apiOptions?: StoryblokConfig;
};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export type StoryblokInitReturn<Plugins extends Array<StoryblokPlugin<any>>> =
  UnionToIntersection<
    Plugins extends Array<infer T>
      ? T extends StoryblokPlugin<infer R>
        ? R
        : never
      : never
  >;

export const storyblokInit = <Plugins extends Array<StoryblokPlugin<T>>, T>(
  pluginOptions: StoryblokInitOptions<Plugins, T> = {}
): StoryblokInitReturn<Plugins> => {
  const { bridge, accessToken, use = [], apiOptions = {} } = pluginOptions;

  apiOptions.accessToken = apiOptions.accessToken || accessToken;

  // Initialize plugins
  const options = { bridge, apiOptions };
  let result = {};

  use.forEach((pluginFactory) => {
    result = { ...result, ...pluginFactory(options) };
  });

  // Load bridge
  if (bridge !== false) {
    loadBridge("https://app.storyblok.com/f/storyblok-v2-latest.js");
  }

  return result as UnionToIntersection<T>;
};
