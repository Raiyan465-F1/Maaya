import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/src/db";

type TagSortMode = "usage" | "popular";

function parseSort(value: string | null): TagSortMode {
  return value === "popular" ? "popular" : "usage";
}

function parseLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 100;
  return Math.max(1, Math.min(250, Math.floor(parsed)));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = parseSort(searchParams.get("sort"));
  const limit = parseLimit(searchParams.get("limit"));

  try {
    const rows =
      sort === "popular"
        ? await sql`
            with active_posts as (
              select post_id, tags
              from forum_posts
              where status = 'active' and tags is not null and array_length(tags, 1) > 0
            ),
            post_vote_counts as (
              select post_id, count(*)::int as vote_count
              from forum_post_votes
              group by post_id
            ),
            comment_counts as (
              select post_id, count(*)::int as comment_count
              from comments
              where status = 'active'
              group by post_id
            ),
            comment_vote_counts as (
              select c.post_id, count(*)::int as comment_vote_count
              from comment_votes cv
              join comments c on c.comment_id = cv.comment_id
              where c.status = 'active'
              group by c.post_id
            ),
            post_interactions as (
              select
                p.post_id,
                (coalesce(pvc.vote_count, 0) + coalesce(cc.comment_count, 0) + coalesce(cvc.comment_vote_count, 0))::int as interaction
              from active_posts p
              left join post_vote_counts pvc on pvc.post_id = p.post_id
              left join comment_counts cc on cc.post_id = p.post_id
              left join comment_vote_counts cvc on cvc.post_id = p.post_id
            )
            select
              t.tag as tag,
              count(*)::int as usageCount,
              coalesce(sum(pi.interaction), 0)::int as interactionCount
            from active_posts p
            join post_interactions pi on pi.post_id = p.post_id
            cross join unnest(p.tags) as t(tag)
            group by t.tag
            order by coalesce(sum(pi.interaction), 0) desc, t.tag asc
            limit ${limit};
          `
        : await sql`
            with active_posts as (
              select post_id, tags
              from forum_posts
              where status = 'active' and tags is not null and array_length(tags, 1) > 0
            ),
            post_vote_counts as (
              select post_id, count(*)::int as vote_count
              from forum_post_votes
              group by post_id
            ),
            comment_counts as (
              select post_id, count(*)::int as comment_count
              from comments
              where status = 'active'
              group by post_id
            ),
            comment_vote_counts as (
              select c.post_id, count(*)::int as comment_vote_count
              from comment_votes cv
              join comments c on c.comment_id = cv.comment_id
              where c.status = 'active'
              group by c.post_id
            ),
            post_interactions as (
              select
                p.post_id,
                (coalesce(pvc.vote_count, 0) + coalesce(cc.comment_count, 0) + coalesce(cvc.comment_vote_count, 0))::int as interaction
              from active_posts p
              left join post_vote_counts pvc on pvc.post_id = p.post_id
              left join comment_counts cc on cc.post_id = p.post_id
              left join comment_vote_counts cvc on cvc.post_id = p.post_id
            )
            select
              t.tag as tag,
              count(*)::int as usageCount,
              coalesce(sum(pi.interaction), 0)::int as interactionCount
            from active_posts p
            join post_interactions pi on pi.post_id = p.post_id
            cross join unnest(p.tags) as t(tag)
            group by t.tag
            order by count(*) desc, t.tag asc
            limit ${limit};
          `;

    const tags = rows
      .map((row: any) => ({
        tag: typeof row.tag === "string" ? row.tag : "",
        usageCount: Number(row.usagecount ?? row.usageCount ?? 0),
        interactionCount: Number(row.interactioncount ?? row.interactionCount ?? 0),
      }))
      .filter((row) => Boolean(row.tag));

    return NextResponse.json({ sort, tags });
  } catch (error) {
    console.error("Forum tags GET error:", error);
    return NextResponse.json({ error: "Failed to load tags." }, { status: 500 });
  }
}

