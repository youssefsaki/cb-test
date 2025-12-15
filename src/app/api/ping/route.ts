import { NextRequest, NextResponse } from 'next/server';
import { cloudbedsFetch, CloudbedsError } from '@/lib/cloudbeds';

const DEFAULT_PING_ENDPOINT = '/getProperties';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') || DEFAULT_PING_ENDPOINT;
  try {
    const data = await cloudbedsFetch(path, { method: 'GET' });
    return NextResponse.json({ ok: true, path, data });
  } catch (error) {
    if (error instanceof CloudbedsError) {
      return NextResponse.json(
        { ok: false, path, status: error.status, error: error.body ?? error.message },
        { status: error.status }
      );
    }
    return NextResponse.json({ ok: false, path, error: 'Unexpected error' }, { status: 500 });
  }
}

