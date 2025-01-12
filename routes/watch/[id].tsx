import type { Handlers, PageProps } from "$fresh/server.ts";
import { TMDB_API_KEY } from "../../utils/config.ts";

interface Content {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path?: string }[];
  status: string;
  tagline?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  created_by?: { id: number; name: string; profile_path?: string }[];
}

interface StreamResponse {
  url: string;
  error?: string;
}

interface PageData {
  content: Content;
  contentType: "movies" | "shows";
  streamUrl?: string;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path?: string;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path?: string;
    }[];
  };
}

export const handler: Handlers<PageData> = {
  async GET(req, ctx) {
    const contentType =
      new URL(req.url).searchParams.get("type") as "movies" | "shows" ||
      "movies";
    const { id } = ctx.params;

    const baseUrl = "https://api.themoviedb.org/3";
    const mediaType = contentType === "movies" ? "movie" : "tv";

    // Fetch main content with additional details
    const [contentRes, creditsRes] = await Promise.all([
      fetch(`${baseUrl}/${mediaType}/${id}?api_key=${TMDB_API_KEY}`),
      fetch(`${baseUrl}/${mediaType}/${id}/credits?api_key=${TMDB_API_KEY}`),
    ]);

    const [content, credits] = await Promise.all([
      contentRes.json(),
      creditsRes.json(),
    ]);

    // Fetch the stream URL
    const streamRes = await fetch(
      `${new URL(req.url).origin}/api/stream/${id}?tmdb=1${
        contentType === "shows" ? "&s=1&e=1" : ""
      }`,
    );
    const streamData: StreamResponse = await streamRes.json();

    return ctx.render({
      content,
      contentType,
      streamUrl: streamData.url,
      credits,
    });
  },
};

export default function Watch({ data }: PageProps<PageData>) {
  const { content, streamUrl, credits } = data;
  const releaseDate = content.release_date || content.first_air_date;
  const director = credits?.crew.find((person) => person.job === "Director");
  const mainCast = credits?.cast.slice(0, 6) || [];

  return (
    <div class="min-h-screen bg-terminal-black font-mono text-terminal-white">
      <div class="container mx-auto px-6 py-6">
        <a
          href="/"
          class="inline-block mb-8 text-terminal-gray-200 hover:text-terminal-white 
                 transition-colors duration-150 ease-mechanical"
        >
          [Back]
        </a>

        <div class="border border-terminal-gray-300 bg-terminal-black">
          <div class="relative" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={streamUrl}
              class="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              title={`Watch ${content.title || content.name}`}
            />
          </div>

          <div class="p-6 border-t border-terminal-gray-300">
            <div class="flex flex-col gap-4">
              <h1 class="text-2xl font-bold tracking-tight">
                {content.title || content.name}
              </h1>

              {content.tagline && (
                <p class="text-terminal-gray-200 italic">
                  {content.tagline}
                </p>
              )}

              <div class="flex gap-4 text-sm text-terminal-gray-200">
                {releaseDate && (
                  <span>{new Date(releaseDate).getFullYear()}</span>
                )}
                {content.runtime && <span>{content.runtime} min</span>}
                {content.episode_run_time?.[0] && (
                  <span>~{content.episode_run_time[0]} min per episode</span>
                )}
                <span>{content.status}</span>
                <span>★ {content.vote_average.toFixed(1)}</span>
              </div>

              <div class="flex flex-wrap gap-2">
                {content.genres.map((genre) => (
                  <a
                    key={genre.id}
                    href={`/?genre=${genre.id}`}
                    class="px-3 py-1 border border-terminal-gray-300 text-sm 
                           hover:text-terminal-white hover:border-terminal-white 
                           transition-colors duration-150 ease-mechanical"
                  >
                    {genre.name}
                  </a>
                ))}
              </div>

              {content.number_of_seasons && (
                <div class="text-terminal-gray-200">
                  {content.number_of_seasons} Seasons •{" "}
                  {content.number_of_episodes} Episodes
                </div>
              )}

              <p class="text-terminal-gray-200 mt-4">
                {content.overview}
              </p>

              {mainCast.length > 0 && (
                <div class="mt-4">
                  <h2 class="text-sm font-bold mb-2">Cast</h2>
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {mainCast.map((actor) => (
                      <a
                        key={actor.id}
                        href={`/?with_people=${actor.id}&person_name=${actor.name}`}
                        class="group text-center hover:border-terminal-white 
                               border border-terminal-gray-300 p-2"
                      >
                        {actor.profile_path
                          ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                              alt={actor.name}
                              class="w-full aspect-square object-cover mb-2 
                                   opacity-80 group-hover:opacity-100 
                                   transition-opacity duration-150 ease-mechanical"
                            />
                          )
                          : (
                            <div class="w-full aspect-square bg-terminal-gray-300/10 
                                     flex items-center justify-center mb-2">
                              <span class="text-xs text-terminal-gray-200">
                                No Image
                              </span>
                            </div>
                          )}
                        <div class="text-sm font-bold truncate group-hover:text-terminal-white">
                          {actor.name}
                        </div>
                        <div class="text-xs text-terminal-gray-200 truncate">
                          {actor.character}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {content.production_companies.length > 0 && (
                <div class="mt-6 text-terminal-gray-200">
                  <h2 class="text-lg font-bold mb-2">Production</h2>
                  {content.production_companies.map((company) => (
                    <span key={company.id} class="mr-4">
                      {company.name}
                    </span>
                  ))}
                </div>
              )}

              {content.created_by && content.created_by.length > 0 && (
                <div class="mt-4 text-terminal-gray-200">
                  <h2 class="text-lg font-bold mb-2">Created by</h2>
                  {content.created_by.map((creator) => (
                    <span key={creator.id} class="mr-4">
                      {creator.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
