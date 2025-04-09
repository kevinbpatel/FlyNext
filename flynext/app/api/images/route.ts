// app/api/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // Grab the 'p' query param: e.g. /api/images?p=upload/user_pictures/abc.png
    const { searchParams } = new URL(request.url);
    const relativePath = searchParams.get("p"); 
    if (!relativePath) {
      return NextResponse.json({ error: "No path specified" }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), "public");
    const fullPath = path.join(baseDir, relativePath);

    if (!fullPath.startsWith(baseDir)) {
      return NextResponse.json({ error: "Invalid path." }, { status: 400 });
    }
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullPath);

    let contentType = "application/octet-stream";
    const ext = path.extname(fullPath).toLowerCase();
    if (ext === ".png") contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    if (ext === ".gif") contentType = "image/gif";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    console.error("Error serving file:", err);
    return NextResponse.json({ error: "Could not serve file" }, { status: 500 });
  }
}
