import { serve } from "https://deno.land/std@0.155.0/http/server.ts";

const allowedMethods = ["POST", "GET", "PUT"];

const CONTENT = {
  ANY: "*/*",
  HTML: "text/html",
  JSON: "application/json",
  PLAIN: "text/plain",
};

const allowedContentTypes = [
  CONTENT.JSON,
  CONTENT.HTML,
  CONTENT.ANY,
  CONTENT.PLAIN,
];

const charset = "charset=utf-8";

const status = {
  200: "OK",
  405: "Method Not Allowed",
  406: "Not Accepted",

  toJson(code: number): string {
    return JSON.stringify({ status: code, message: this[code] });
  },
  response(code: number, accept: string): string {
    if (code === 406) {
      accept = CONTENT.PLAIN;
    }

    return new Response(
      accept === CONTENT.JSON ? this.toJson(code) : this[code],
      headers(accept)
    );
  },
};

let content = ["Hello, World!"];

// We are using `baserow.io`
async function fetchQuotes() {
  const response = await fetch(Deno.env.get("DATABASE_URL"), {
    headers: { Authorization: `TOKEN ${Deno.env.get("DATABASE_TOKEN")}` },
  });
  const json = await response.json();
  content = json.results.map((r) => r.text);
}

function html(text: string): string {
  return `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Stuff Zelia Says</title>
    </head>
    <style>
    body {
      color: 010203;
      font-family: Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif;
      font-size: 14px; font-style: normal; font-variant: normal; font-weight: 400; line-height: 23px;
    }
    h1 { font-size: 23px; font-style: normal; font-variant: normal; font-weight: 700; line-height: 23px; } 
    blockquote { font-size: 12vw; font-style: normal; font-variant: normal; font-weight: 400; line-height: 10vw; }
    blockquote:before { content: "\\275D"; color: #ff007f}
    blockquote:after { content: "\\275E"; color: #ff007f}
    </style>
    <body>
      <main>
        <header><h1>Zelia says:</h1></header>
        <blockquote>${text}</blockquote/>
      </main>
    </body>
</html>`;
}

function pick(array: [string]): string {
  return array[Math.floor(Math.random() * array.length)];
}

function headers(type: string): string {
  return {
    headers: {
      "content-type": `${
        type === CONTENT.ANY ? CONTENT.PLAIN : type
      }; ${charset}`,
    },
  };
}

// Load the data in memory
await fetchQuotes();

serve(async (req: Request) => {
  const accept = req.headers.get("accept");
  const type = allowedContentTypes.find((t) => accept.indexOf(t) > -1);

  if (allowedMethods.indexOf(req.method) === -1) {
    return status.response(405, type);
  }
  if (allowedContentTypes.indexOf(type) === -1) {
    return status.response(406, type);
  }
  if (req.method === "PUT" || req.url.indexOf("update") > -1) {
    await fetchQuotes();
    return status.response(200, type);
  }

  const text = pick(content);

  switch (type) {
    case CONTENT.JSON:
      return Response.json({
        response_type: "in_channel",
        text,
      });
    case CONTENT.HTML:
      return new Response(html(text), headers(type));
    default:
      return new Response(text, headers(type));
  }
});
