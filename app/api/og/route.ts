import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  if (!domain) return NextResponse.json({ error: "Domain required" }, { status: 400 });

  const supabase = await createClient();
  const { data: website } = await supabase
    .from("websites")
    .select("title, description, domain")
    .eq("domain", decodeURIComponent(domain))
    .eq("status", "approved")
    .single();

  if (!website) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "1200px", height: "630px", background: "#000", color: "#fff", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "60px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
          <div style={{ fontSize: "72px", fontWeight: "bold", letterSpacing: "-2px" }}>{website.title}</div>
          <div style={{ fontSize: "32px", color: "#999" }}>{website.domain}</div>
          <div style={{ fontSize: "24px", color: "#ccc", lineHeight: "1.5" }}>{website.description?.slice(0, 120)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold" }}>OTW</div>
            <div style={{ fontSize: "20px", color: "#666" }}>Website of the Week</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
