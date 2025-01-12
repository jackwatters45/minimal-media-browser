# minimal-media-browser

A Minimalist Movie & TV Show Browser that allows users to browse, search, and watch movies and TV shows. It was created to provide a better experience to browse and stream movies. It boasts improved searching capabilities and can easily be self-hosted.

## Features

- **Universal Search**: Search across both movies and TV shows simultaneously
- **Advanced Filtering**:
  - Filter by content type (Movies/TV Shows)
  - Filter by release year
  - Filter by genre
  - Filter by cast/crew members
  - Sort by popularity, rating, or release date
- **Detailed Information**:
  - Cast and crew details
  - Production information
  - Ratings and runtime
  - Episode counts for TV shows
- **Responsive Design**: Works on both desktop and mobile devices
- **Server-Side Rendering**: Fast initial page loads and SEO-friendly
- **Brutalist Design**: Terminal-inspired, high-contrast interface

## How It Works (Non-Technical)

1. **Homepage**:
   - The main page shows a grid of popular movies/shows
   - Use the search bar to find specific titles
   - Use filters to narrow down results:
     - Type: Choose between movies, TV shows, or both
     - Year: Filter by release year
     - Genre: Filter by specific genres
     - Cast/Crew: Search for movies/shows with specific actors or directors
     - Sort: Arrange results by popularity, rating, or date

2. **Search & Navigation**:
   - Type in the search bar to find content
   - Results update automatically
   - Use pagination at the bottom to view more results
   - Click on any poster to view detailed information

3. **Content Details**:
   - Click any title to see detailed information
   - View cast, crew, ratings, and production details
   - Watch content directly in the browser
   - Return to search results using the back button

## Technical Details

### Architecture

- **Framework**: Fresh (Deno)
- **Styling**: Tailwind CSS
- **Data Source**: TMDB API
- **State Management**: Preact Signals
- **Rendering**: Server-side with interactive islands

### Key Components

1. **Routes**:
   - `/routes/index.tsx`: Main page with search and filters
   - `/routes/watch/[id].tsx`: Content detail page
   - `/routes/api/stream/[id].ts`: Streaming API endpoint

2. **Islands** (Interactive Components):
   - `PersonSearch.tsx`: Cast/crew search with autocomplete

### Setup & Installation

1. **Prerequisites**:
   - Install Deno: [https://deno.land/manual/getting_started/installation](https://deno.land/manual/getting_started/installation)

2. **Environment Setup**:
   - Create a `.env` file in the project root
   - Add your TMDB API key:

     ```
     TMDB_API_KEY=your_api_key_here
     ```

3. **Running the Project**:

   ```bash
   # Clone the repository
   git clone [repository-url]
cd minimal-media-browser

   # Start the development server
   deno task start
   ```

4. **Building for Production**:

   ```bash
   deno task build
   ```

### API Integration

The application uses the TMDB (The Movie Database) API for:

- Movie and TV show metadata
- Cast and crew information
- Images (posters, backdrops)
- Search functionality

### Design System

The interface follows a brutalist design philosophy:

- Monospace typography (font-mono)
- High contrast black/white/gray color scheme
- Sharp borders and minimal decoration
- Terminal-inspired UI elements
- Mechanical transitions and interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license information here]

## Credits

- TMDB API for providing movie and TV show data
- [ambr0sial/nova](https://github.com/ambr0sial/nova) - Original inspiration for this project
- [superembed.stream](https://www.superembed.stream/index.html) for streaming
- Fresh framework and Deno runtime
