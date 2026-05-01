import { NextRequest, NextResponse } from "next/server";
import { EDUCATION_TOPICS, searchEducationArticles, type EducationTopic } from "@/lib/education-feed";

export async function GET(request: NextRequest) {
  const topicParam = request.nextUrl.searchParams.get("topic");
  const query = request.nextUrl.searchParams.get("query") ?? "";
  const pageParam = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const topic = EDUCATION_TOPICS.includes((topicParam as EducationTopic) ?? "All")
    ? ((topicParam as EducationTopic) ?? "All")
    : "All";

  try {
    const { articles, hasMore } = await searchEducationArticles(topic, query, page);
    return NextResponse.json({ articles, hasMore, page });
  } catch (error) {
    console.error("Education article fetch error:", error);
    return NextResponse.json({ articles: [], hasMore: false, page, error: "Unable to load educational articles right now." }, { status: 200 });
  }
}
