"use client";

import { useState } from "react";

type ApiResponse = {
  ok: boolean;
  [key: string]: unknown;
};

const pretty = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export default function Home() {
  const [pingPath, setPingPath] = useState("/getProperties");
  const [pingResult, setPingResult] = useState<ApiResponse | null>(null);

  const [availabilityInput, setAvailabilityInput] = useState({
    startDate: "",
    endDate: "",
    adults: 2,
    children: 0,
    propertyId: "",
    endpoint: "/getAvailability",
    extra: "",
  });
  const [availabilityResult, setAvailabilityResult] = useState<ApiResponse | null>(null);

  const [bookEndpoint, setBookEndpoint] = useState("/createReservation");
  const [bookPayload, setBookPayload] = useState('{\n  "payload": {}\n}');
  const [bookResult, setBookResult] = useState<ApiResponse | null>(null);

  const callApi = async (url: string, init?: RequestInit) => {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    const json = (await res.json().catch(() => null)) as ApiResponse | null;
    return json ?? { ok: false, error: "Failed to parse response" };
  };

  const handlePing = async () => {
    const result = await callApi(`/api/ping?path=${encodeURIComponent(pingPath)}`);
    setPingResult(result);
  };

  const handleAvailability = async () => {
    let extraJson: Record<string, unknown> = {};
    if (availabilityInput.extra.trim()) {
      try {
        extraJson = JSON.parse(availabilityInput.extra);
      } catch {
        setAvailabilityResult({ ok: false, error: "extra must be valid JSON" });
        return;
      }
    }
    const result = await callApi("/api/availability", {
      method: "POST",
      body: JSON.stringify({
        startDate: availabilityInput.startDate,
        endDate: availabilityInput.endDate,
        adults: Number(availabilityInput.adults),
        children: Number(availabilityInput.children),
        propertyId: availabilityInput.propertyId || undefined,
        endpoint: availabilityInput.endpoint,
        extra: extraJson,
      }),
    });
    setAvailabilityResult(result);
  };

  const handleBook = async () => {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(bookPayload);
    } catch {
      setBookResult({ ok: false, error: "Booking payload must be valid JSON" });
      return;
    }
    const result = await callApi("/api/book", {
      method: "POST",
      body: JSON.stringify({
        endpoint: bookEndpoint,
        ...payload,
      }),
    });
    setBookResult(result);
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Cloudbeds Integration Tester</h1>
          <p className="text-sm text-zinc-600">
            Configure your env vars, then use these forms to call the proxy API routes.
            All requests stay server-side; no secrets are exposed to the browser.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Ping</h2>
            <button
              onClick={handlePing}
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Run
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <label className="text-sm font-medium text-zinc-700">
              Endpoint path (default: /getProperties)
              <input
                value={pingPath}
                onChange={(e) => setPingPath(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="/getProperties"
              />
            </label>
            <pre className="mt-2 max-h-80 overflow-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
              {pretty(pingResult)}
            </pre>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Availability</h2>
            <button
              onClick={handleAvailability}
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Search
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-zinc-700">
              Start date (YYYY-MM-DD)
              <input
                value={availabilityInput.startDate}
                onChange={(e) => setAvailabilityInput({ ...availabilityInput, startDate: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="2025-12-20"
              />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              End date (YYYY-MM-DD)
              <input
                value={availabilityInput.endDate}
                onChange={(e) => setAvailabilityInput({ ...availabilityInput, endDate: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="2025-12-22"
              />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Adults
              <input
                type="number"
                value={availabilityInput.adults}
                onChange={(e) =>
                  setAvailabilityInput({ ...availabilityInput, adults: Number(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Children
              <input
                type="number"
                value={availabilityInput.children}
                onChange={(e) =>
                  setAvailabilityInput({ ...availabilityInput, children: Number(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Property ID (optional)
              <input
                value={availabilityInput.propertyId}
                onChange={(e) => setAvailabilityInput({ ...availabilityInput, propertyId: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="your property id"
              />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Endpoint path (default: /getAvailability)
              <input
                value={availabilityInput.endpoint}
                onChange={(e) => setAvailabilityInput({ ...availabilityInput, endpoint: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium text-zinc-700">
            Extra JSON (merged into payload)
            <textarea
              value={availabilityInput.extra}
              onChange={(e) => setAvailabilityInput({ ...availabilityInput, extra: e.target.value })}
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              rows={4}
              placeholder='{"room_type_id": "...", "rate_plan_id": "..."}'
            />
          </label>
          <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
            {pretty(availabilityResult)}
          </pre>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Book (create reservation)</h2>
            <button
              onClick={handleBook}
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Submit
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <label className="text-sm font-medium text-zinc-700">
              Endpoint path (default: /createReservation)
              <input
                value={bookEndpoint}
                onChange={(e) => setBookEndpoint(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Booking payload (JSON)
              <textarea
                value={bookPayload}
                onChange={(e) => setBookPayload(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                rows={10}
                placeholder='{"payload": {"property_id": "...", "room_type_id": "...", "start_date": "...", "end_date": "...", "guest": {...}}}'
              />
            </label>
            <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
              {pretty(bookResult)}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
