import type { PageProps } from "$fresh/server.ts";
import { Partial } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Minimal Media Browser</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body
        f-client-nav
        class="bg-terminal-black text-terminal-white min-h-screen flex flex-col"
      >
        <Partial name="body">
          <main class="flex-1">
            <Component />
          </main>
        </Partial>
        <Footer />
      </body>
    </html>
  );
}
