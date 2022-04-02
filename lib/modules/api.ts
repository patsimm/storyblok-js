import { StoryblokPlugin } from "../index";
import StoryblokClient, { StoryblokConfig } from "storyblok-js-client";

const apiPlugin: StoryblokPlugin<{
  storyblokApi: StoryblokClient;
}> = (options: { apiOptions: StoryblokConfig }) => {
  const { apiOptions } = options;
  if (!apiOptions.accessToken) {
    throw new Error(
      "You need to provide an access token to interact with Storyblok API. Read https://www.storyblok.com/docs/api/content-delivery#topics/authentication"
    );
  }

  const storyblokApi = new StoryblokClient(apiOptions);
  return { storyblokApi };
};

export default apiPlugin;
