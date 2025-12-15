import { NextRequest, NextResponse } from 'next/server';
import { cloudbedsFetch, CloudbedsError } from '@/lib/cloudbeds';

const DEFAULT_AVAILABILITY_ENDPOINT = '/getAvailability';

type AvailabilityInput = {
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
  propertyId?: string;
  endpoint?: string;
  extra?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  let body: AvailabilityInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    startDate,
    endDate,
    adults = 2,
    children = 0,
    propertyId,
    endpoint,
    extra = {},
  } = body;

  if (!startDate || !endDate) {
    return NextResponse.json(
      { ok: false, error: 'startDate and endDate are required (YYYY-MM-DD)' },
      { status: 400 }
    );
  }

  const path = endpoint || DEFAULT_AVAILABILITY_ENDPOINT;
  const payload = {
    start_date: startDate,
    end_date: endDate,
    number_of_adults: adults,
    number_of_children: children,
    property_id: propertyId,
    ...extra,
  };

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

