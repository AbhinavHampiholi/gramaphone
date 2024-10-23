import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

// Add CORS headers to response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoUrl, content, metadata } = body;

    const stmt = db.prepare(`
      INSERT INTO changelogs (id, repoUrl, content, generatedAt, periodStart, periodEnd)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const changelog = stmt.run(
      randomUUID(),
      repoUrl,
      content,
      new Date(metadata.generatedAt).toISOString(),
      new Date(metadata.period.start).toISOString(),
      new Date(metadata.period.end).toISOString()
    );

    return NextResponse.json(changelog, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating changelog:', error);
    return NextResponse.json(
      { error: 'Failed to create changelog' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get('repoUrl');

    let stmt;
    if (repoUrl) {
      stmt = db.prepare('SELECT * FROM changelogs WHERE repoUrl = ? ORDER BY generatedAt DESC');
      return NextResponse.json(stmt.all(repoUrl), { headers: corsHeaders });
    } else {
      stmt = db.prepare('SELECT * FROM changelogs ORDER BY generatedAt DESC');
      return NextResponse.json(stmt.all(), { headers: corsHeaders });
    }
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelogs' },
      { status: 500, headers: corsHeaders }
    );
  }
}