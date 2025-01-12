import type { Handlers } from "$fresh/server.ts";

interface StreamResponse {
  url: string;
  error?: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const { id } = ctx.params;
    const url = new URL(req.url);
    const tmdb = url.searchParams.get("tmdb") || "0";
    const season = url.searchParams.get("s") || "0";
    const episode = url.searchParams.get("e") || "0";

    // Configure player settings similar to the PHP script
    const playerSettings = {
      player_font: "Poppins",
      player_bg_color: "000000",
      player_font_color: "ffffff",
      player_primary_color: "34cfeb",
      player_secondary_color: "6900e0",
      player_loader: "1",
      preferred_server: "0",
      player_sources_toggle_type: "2",
    };

    try {
      const params = new URLSearchParams({
        video_id: id,
        tmdb,
        season,
        episode,
        ...playerSettings,
      });

      const response = await fetch(
        `https://getsuperembed.link/?${params.toString()}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        },
      );

      const text = await response.text();

      // Check if response is a URL
      if (text.startsWith("https://")) {
        return new Response(JSON.stringify({ url: text } as StreamResponse), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: text } as StreamResponse), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (_error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch stream" } as StreamResponse),
        {
          headers: { "Content-Type": "application/json" },
          status: 500,
        },
      );
    }
  },
};
