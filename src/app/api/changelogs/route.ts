import { NextResponse } from 'next/server';
import dbHelpers from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoUrl, content, metadata } = body;

    const id = await dbHelpers.saveChangelog({
      repourl: repoUrl,              // lowercase for DB
      content: content,
      generatedat: metadata.generatedAt,    // lowercase for DB
      periodstart: metadata.period.start,   // lowercase for DB
      periodend: metadata.period.end        // lowercase for DB
    });

    return NextResponse.json({ id }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating changelog:', error);
    return NextResponse.json(
      { error: 'Failed to create changelog' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  try {
    const changelogs = await dbHelpers.getAllChangelogs();
    
    // Transform the data to match the expected format in the frontend
    const transformedChangelogs = changelogs.map(changelog => ({
      id: changelog.id,
      repoUrl: changelog.repourl,
      content: changelog.content,
      generatedAt: changelog.generatedat,
      periodStart: changelog.periodstart,
      periodEnd: changelog.periodend,
      createdAt: changelog.createdat
    }));

    return NextResponse.json(transformedChangelogs, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelogs' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Changelog ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const success = await dbHelpers.deleteChangelog(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Changelog not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting changelog:', error);
    return NextResponse.json(
      { error: 'Failed to delete changelog' },
      { status: 500, headers: corsHeaders }
    );
  }
}