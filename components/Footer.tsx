export default function Footer() {
  return (
    <footer class="border-t border-terminal-gray-300 bg-terminal-black mt-12">
      <div class="container mx-auto px-6 py-3">
        <div class="flex items-center justify-between text-xs text-terminal-gray-200">
          <div class="flex items-center space-x-3">
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-terminal-white transition-colors duration-150 ease-mechanical"
            >
              [TMDB]
            </a>
            <a
              href="https://github.com/your-username/minimal-media-browser"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-terminal-white transition-colors duration-150 ease-mechanical"
            >
              [GitHub]
            </a>
          </div>
          <div class="text-terminal-gray-200/80">
            All content is provided by non-affiliated third parties
          </div>
        </div>
      </div>
    </footer>
  );
}
