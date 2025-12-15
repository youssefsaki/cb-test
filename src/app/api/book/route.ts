import { NextRequest, NextResponse } from 'next/server';
import { cloudbedsFetch, CloudbedsError } from '@/lib/cloudbeds';

const DEFAULT_BOOK_ENDPOINT = '/createReservation';

type BookInput = {
  endpoint?: string;
  payload?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  let body: BookInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const path = body.endpoint || DEFAULT_BOOK_ENDPOINT;
  const payload = body.payload ?? body;

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: false, error: 'payload is required' }, { status: 400 });
  }

  try {
    const data = await cloudbedsFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return NextResponse.json({ ok: true, path, payload, data });
  } catch (error) {
    if (error instanceof CloudbedsError) {
      return NextResponse.json(
        { ok: false, path, payload, status: error.status, error: error.body ?? error.message },
        { status: error.status }
      );
    }
    return NextResponse.json({ ok: false, path, error: 'Unexpected error' }, { status: 500 });
  }
}

