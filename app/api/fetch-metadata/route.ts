import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    const response = await fetch(url, {
      headers: { "User-Agent": "OTW-Scraper/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error("Failed to fetch URL");

    const html = await response.text();
    const getTag = (name: string) => {
      const patterns = [
        new RegExp(`<meta[^>]*property=["']og:${name}["'][^>]*content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${name}["']`, "i"),
      ];
      for (const p of patterns) {
        const m = html.match(p);
        if (m) return m[1];
      }
      return null;
    };

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = getTag("title") || titleMatch?.[1] || "";
    const description = getTag("description") || "";
    const image = getTag("image") || null;
    const domain = new URL(url).hostname.replace("www.", "");
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    return NextResponse.json({ title: title.slice(0, 100), description: description.slice(0, 300), faviconUrl, domain, image });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
