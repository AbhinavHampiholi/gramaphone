import { NextResponse } from 'next/server';
import dbHelpers from '@/lib/db';
import { transformDbToChangelog } from '@/types/changelog';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoUrl, content, metadata } = body;

    const id = await dbHelpers.saveChangelog({
      repourl: repoUrl,
      content: content,
      generatedat: metadata.generatedAt,
      periodstart: metadata.period.start,
      periodend: metadata.period.end
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating changelog:', error);
    return NextResponse.json(
      { error: 'Failed to create changelog' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dbChangelogs = await dbHelpers.getAllChangelogs();
    const changelogs = dbChangelogs.map(transformDbToChangelog);
    return NextResponse.json(changelogs);
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelogs' },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const success = await dbHelpers.deleteChangelog(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Changelog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting changelog:', error);
    return NextResponse.json(
      { error: 'Failed to delete changelog' },
      { status: 500 }
    );
  }
}