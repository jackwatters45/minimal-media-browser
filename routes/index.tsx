import type { Handlers, PageProps } from "$fresh/server.ts";
import { TMDB_API_KEY } from "../utils/config.ts";

interface Content {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  video_qualities?: {
    name: string;
    quality: string;
  }[];
}

interface Genre {
  id: number;
  name: string;
}

interface PageData {
  content: Content[];
  contentType?: "movies" | "shows";
  query?: string;
  sortBy: string;
  year?: string;
  genres: Genre[];
  selectedGenre?: string;
  withPeople?: string;
  personName?: string;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  currentSearchParams: string;
  countries: { iso_3166_1: string; english_name: string }[];
  selectedCountry?: string;
  yearOptions: number[];
  selectedQuality?: string;
}

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: "movie" | "tv" | "person";
  poster_path?: string;
  overview: string;
}

export const handler: Handlers<PageData> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const contentType = (url.searchParams.get("type") || "movies") as
      | "movies"
      | "shows";
    const query = url.searchParams.get("q") || "";
    const sortBy = url.searchParams.get("sort") || "popularity.desc";
    const year = url.searchParams.get("year") || "";
    const genreId = url.searchParams.get("genre") || "";
    const withPeople = url.searchParams.get("with_people") || "";
    const personName = url.searchParams.get("person_name") || "";
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const selectedCountry = url.searchParams.get("country") || "";
    const selectedQuality = url.searchParams.get("quality") || "";

    const baseUrl = "https://api.themoviedb.org/3";

    // Fetch countries
    const countriesRes = await fetch(
      `${baseUrl}/configuration/countries?api_key=${TMDB_API_KEY}`
    );
    const countries = await countriesRes.json();

    // Generate year options (from 1900 to current year)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(
      { length: currentYear - 1900 + 1 },
      (_, i) => currentYear - i
    );

    // If searching by person ID, use discover endpoint
    if (withPeople && !query) {
      console.log("contentType", contentType);
      const mediaType = contentType === "movies" ? "movie" : "tv";
      const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        sort_by: sortBy,
        with_cast: withPeople, // This will search in both cast and crew
        page: page.toString(),
      });

      if (year) {
        const dateField = contentType === "movies"
          ? "release_date"
          : "first_air_date";
        params.append(`${dateField}.gte`, `${year}-01-01`);
        params.append(`${dateField}.lte`, `${year}-12-31`);
      }

      if (genreId) {
        params.append("with_genres", genreId);
      }

      const response = await fetch(
        `${baseUrl}/discover/${mediaType}?${params.toString()}`,
      );
      const data = await response.json();

      // Fetch genres for the filter dropdown
      const genresRes = await fetch(
        `${baseUrl}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}`,
      );
      const genresData = await genresRes.json();

      return ctx.render({
        content: data.results,
        contentType,
        query,
        sortBy,
        year,
        genres: genresData.genres,
        selectedGenre: genreId,
        withPeople,
        personName,
        currentPage: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
        currentSearchParams: url.search,
        countries,
        selectedCountry,
        yearOptions,
        selectedQuality,
      });
    }

    // If searching without a content type, search both movies and TV shows
    if (query && !contentType) {
      const searchRes = await fetch(
        `${baseUrl}/search/multi?api_key=${TMDB_API_KEY}&query=${query}&include_adult=false`,
      );
      const searchData = await searchRes.json();

      // Filter to only movies and TV shows (excluding people and other media types)
      const allResults = searchData.results
        .filter((item: SearchResult) =>
          item.media_type === "movie" || item.media_type === "tv"
        )
        .map((item: SearchResult) => ({
          ...item,
          title: item.title || item.name,
          mediaType: item.media_type,
        }));

      // Still need to fetch genres for the filter dropdown
      const [movieGenres, tvGenres] = await Promise.all([
        fetch(`${baseUrl}/genre/movie/list?api_key=${TMDB_API_KEY}`),
        fetch(`${baseUrl}/genre/tv/list?api_key=${TMDB_API_KEY}`),
      ]);

      const [movieGenresData, tvGenresData] = await Promise.all([
        movieGenres.json(),
        tvGenres.json(),
      ]);

      const allGenres = Array.from(
        new Set([
          ...movieGenresData.genres,
          ...tvGenresData.genres,
        ].map((g) => JSON.stringify(g))),
      ).map((g) => JSON.parse(g));

      return ctx.render({
        content: allResults,
        contentType,
        query,
        sortBy,
        year,
        genres: allGenres,
        selectedGenre: genreId,
        currentPage: page,
        totalPages: Math.ceil(
          searchData.total_results / searchData.results.length,
        ),
        totalResults: searchData.total_results,
        currentSearchParams: url.search,
        countries,
        selectedCountry,
        yearOptions,
        selectedQuality,
      });
    }

    // If a specific content type is selected, use the original logic
    const mediaType = contentType === "movies" ? "movie" : "tv";

    // Fetch genres for the selected type
    const genresRes = await fetch(
      `${baseUrl}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}`,
    );
    const genresData = await genresRes.json();

    let endpoint: string;
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      sort_by: sortBy,
      page: page.toString(),
    });

    if (year) {
      const dateField = contentType === "movies"
        ? "release_date"
        : "first_air_date";
      params.append(`${dateField}.gte`, `${year}-01-01`);
      params.append(`${dateField}.lte`, `${year}-12-31`);
    }

    if (genreId) {
      params.append("with_genres", genreId);
    }

    if (query) {
      endpoint = `search/${mediaType}?${params.toString()}&query=${query}`;
    } else {
      endpoint = `discover/${mediaType}?${params.toString()}`;
    }

    const response = await fetch(`${baseUrl}/${endpoint}`);
    const data = await response.json();

    // Fetch additional details for movies to get runtime
    const contentWithDetails = await Promise.all(
      data.results.map(async (item: Content) => {
        if (contentType === "movies") {
          const detailsRes = await fetch(
            `${baseUrl}/movie/${item.id}?api_key=${TMDB_API_KEY}`
          );
          const details = await detailsRes.json();
          return { ...item, runtime: details.runtime };
        }
        return item;
      })
    );

    return ctx.render({
      content: contentWithDetails,
      contentType,
      query,
      sortBy,
      year,
      genres: genresData.genres,
      selectedGenre: genreId,
      withPeople,
      personName,
      currentPage: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      currentSearchParams: url.search,
      countries,
      selectedCountry,
      yearOptions,
      selectedQuality,
    });
  },
};

export default function Home({ data }: PageProps<PageData>) {
  const { content, contentType, query, sortBy, year, genres, selectedGenre } =
    data;

  return (
    <div class="min-h-screen bg-terminal-black font-mono text-terminal-white">
      <nav class="fixed w-full z-50 border-b border-terminal-gray-300 bg-terminal-black">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center">
            <span class="text-2xl font-bold tracking-tight">
              {">"} minimal-media-browser
            </span>
          </div>
        </div>
      </nav>

      <div class="pt-24 pb-12 px-6">
        <div class="container mx-auto">
          <div class="mb-12 border border-terminal-gray-300 p-6">
            <form method="get" class="space-y-4">
              {/* Search and Type Row */}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-1">
                  <label for="search" class="block text-xs text-terminal-gray-200">
                    Search
                  </label>
                  <input
                    id="search"
                    type="text"
                    name="q"
                    value={query}
                    placeholder="Search titles..."
                    class="w-full bg-terminal-black border border-terminal-gray-300 px-3 py-1.5 
                           text-sm text-terminal-white placeholder-terminal-gray-200 
                           focus:outline-none focus:border-terminal-white"
                  />
                </div>

                <div class="space-y-1">
                  <label for="type" class="block text-xs text-terminal-gray-200">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    class="w-full bg-terminal-black border border-terminal-gray-300 px-3 py-1.5 
                           text-sm text-terminal-gray-200 focus:outline-none 
                           focus:border-terminal-white"
                    value={contentType}
                  >
                    <option value="movies">Movies</option>
                    <option value="shows">TV Shows</option>
                    <option value="">All Content</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label for="quality" class="block text-xs text-terminal-gray-200">
                    Quality
                  </label>
                  <select
                    id="quality"
                    name="quality"
                    class="w-full bg-terminal-black border border-terminal-gray-300 px-3 py-1.5 
                           text-sm text-terminal-gray-200 focus:outline-none 
                           focus:border-terminal-white"
                    value={data.selectedQuality}
                  >
                    <option value="">Any Quality</option>
                    <option value="HD">HD</option>
                    <option value="FHD">Full HD</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
              </div>

              {/* Filters Row */}
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="space-y-1">
                  <label for="year" class="block text-xs text-terminal-gray-200">
                    Year
                  </label>
                  <select
                    id="year"
                    name="year"
                    class="w-full bg-terminal-black border border-terminal-gray-300 px-3 py-1.5 
                           text-sm text-terminal-gray-200 focus:outline-none 
                           focus:border-terminal-white"
                    value={year}
                  >
                    <option value="">Any Year</option>
                    {data.yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="space-y-1">
                  <label for="genre" class="block text-xs text-terminal-gray-200">
                    Genre
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    class="w-full bg-terminal-black border border-terminal-gray-300 px-3 py-1.5 
                           text-sm text-terminal-gray-200 focus:outline-none 
                           focus:border-terminal-white"
                    value={selectedGenre}
                  >
                    <option value="">Any Genre</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="space-y-1">
                  <label for="country" class="block text-xs text-terminal-gray-200">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    class="w-full bg-terminal-black border border-terminal-gray-300 px-3 py-1.5 
                           text-sm text-terminal-gray-200 focus:outline-none 
                           focus:border-terminal-white"
                    value={data.selectedCountry}
                  >
                    <option value="">Any Country</option>
                    {data.countries.map((country) => (
                      <option key={country.iso_3166_1} value={country.iso_3166_1}>
                        {country.english_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="space-y-1">
                  <label for="sort" class="block text-xs text-terminal-gray-200">
                    Sort By
                  </label>
                  <select
                    id="sort"
                    name="sort"
                    class="w-full bg-terminal-black border border-terminal-gray-300 px-3 py-1.5 
                           text-sm text-terminal-gray-200 focus:outline-none 
                           focus:border-terminal-white"
                    value={sortBy}
                  >
                    <option value="popularity.desc">Most Popular</option>
                    <option value="vote_average.desc">Highest Rated</option>
                    <option value="primary_release_date.desc">Newest</option>
                    <option value="primary_release_date.asc">Oldest</option>
                    <option value="revenue.desc">Highest Revenue</option>
                  </select>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  class="px-4 py-1.5 text-sm border border-terminal-gray-300 
                         text-terminal-gray-200 hover:text-terminal-white 
                         hover:border-terminal-white transition-colors duration-150 
                         ease-mechanical"
                >
                  [Apply Filters]
                </button>
              </div>
            </form>
          </div>

          <div class="mb-8 flex items-center justify-between">
            <h2 class="text-2xl font-bold tracking-tight">
              {query
                ? `Search Results: "${query}"`
                : `Popular ${contentType === "movies" ? "Movies" : "TV Shows"}`}
            </h2>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
            {content.map((item) => (
              <a
                key={item.id}
                href={`/watch/${item.id}?type=${contentType}`}
                class="group border border-terminal-gray-300 bg-terminal-black flex flex-col"
              >
                <div class="relative">
                  <div class="aspect-[2/3] relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                      alt={item.title || item.name}
                      class="absolute inset-0 w-full h-full object-cover opacity-80 
                             group-hover:opacity-100 transition-opacity duration-150 
                             ease-mechanical"
                    />
                    <span class="absolute top-1 right-1 text-xs border 
                                 border-terminal-gray-300 bg-terminal-black/90 px-1.5 py-0.5">
                      HD
                    </span>
                    {item.overview && (
                      <div class="absolute bottom-0 left-0 right-0 p-2 bg-terminal-black/95 
                                  hidden group-hover:block border-t border-terminal-gray-300 
                                  max-h-[70%] overflow-y-auto">
                        <p class="text-xs text-terminal-gray-200">
                          {item.overview}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div class="p-1.5 border-t border-terminal-gray-300">
                  <h3 class="font-bold tracking-tight text-xs mb-0.5 truncate">
                    {item.title || item.name}
                  </h3>
                  <div class="flex items-center gap-1 text-xs text-terminal-gray-200">
                    <span>
                      {new Date(item.release_date || item.first_air_date || "")
                        .getFullYear()}
                    </span>
                    {contentType !== "shows" && item.runtime && (
                      <>
                        <span>•</span>
                        <span>{item.runtime}m</span>
                      </>
                    )}
                    {contentType === "shows" && (
                      <>
                        <span>•</span>
                        <span>{item.number_of_seasons || "?"}S</span>
                      </>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div class="mt-8 flex items-center justify-between border border-terminal-gray-300 p-4">
            <div class="text-terminal-gray-200">
              Page {data.currentPage} of {data.totalPages} ({data.totalResults}
              {" "}
              total)
            </div>
            <div class="flex gap-2">
              {data.currentPage > 1 && (
                <a
                  href={`?${new URLSearchParams({
                    ...Object.fromEntries(
                      new URLSearchParams(data.currentSearchParams),
                    ),
                    page: (data.currentPage - 1).toString(),
                  })}`}
                  class="px-4 py-2 border border-terminal-gray-300 text-terminal-gray-200 
                         hover:text-terminal-white hover:border-terminal-white 
                         transition-colors duration-150 ease-mechanical"
                >
                  [Previous]
                </a>
              )}
              {data.currentPage < data.totalPages && (
                <a
                  href={`?${new URLSearchParams({
                    ...Object.fromEntries(
                      new URLSearchParams(data.currentSearchParams),
                    ),
                    page: (data.currentPage + 1).toString(),
                  })}`}
                  class="px-4 py-2 border border-terminal-gray-300 text-terminal-gray-200 
                         hover:text-terminal-white hover:border-terminal-white 
                         transition-colors duration-150 ease-mechanical"
                >
                  [Next]
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
