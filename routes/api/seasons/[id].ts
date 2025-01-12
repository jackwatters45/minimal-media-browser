import type { Handlers } from "$fresh/server.ts";

const API_KEY = "1070730380f5fee0d87cf0382670b255";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const { id } = ctx.params;
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`,
    );
    const data = await response.json();
    return new Response(JSON.stringify(data));
  },
};
