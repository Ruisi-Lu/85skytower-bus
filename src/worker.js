"use strict";

const ETA_ENDPOINT = "https://citygpt.foxconn.com/data/abfs/dal/v_stg_tdx_estimatedtimeofarrival_pt1m";
const ALLOWED_STOP_IDS = new Set([
  "10010095771",
  "1001007571",
  "10060168381",
  "10060168791",
  "100083105661",
  "1000837611",
  "1000839081",
  "1000707552",
  "1000707582",
  "1007017552",
  "1007017582",
  "1007037552",
  "1007037582",
  "10082110981",
  "1001009092",
  "100601121902",
  "100839102",
  "10007012811",
  "10070112811",
  "10070312811",
  "100829143172",
  "10082915532",
  "100830143171",
  "10083020591",
  "10033143171",
  "1003343161",
  "10015181325202",
  "10015181325212",
  "10015182301661",
  "10015182301671",
  "10082920491",
  "10083020492",
  "1003320512",
  "10026139671",
  "100260139671",
  "10015181327911",
  "10015182325962"
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return handleOptions(request, env);
    }

    if (url.pathname === "/api/eta") {
      return handleEta(request, env);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return json(request, env, { error: "not_found" }, 404);
  }
};

async function handleEta(request, env) {
  if (request.method !== "GET") {
    return json(request, env, { error: "method_not_allowed" }, 405, {
      Allow: "GET, OPTIONS"
    });
  }

  const url = new URL(request.url);
  const stopId = url.searchParams.get("stopId");

  if (!ALLOWED_STOP_IDS.has(stopId)) {
    return json(request, env, { error: "bad_stop_id" }, 400);
  }

  const subscriptionKey = env.IBUS_SUBSCRIPTION_KEY;
  if (!subscriptionKey) {
    return json(request, env, { error: "missing_subscription_key" }, 500);
  }

  const upstream = new URL(ETA_ENDPOINT);
  upstream.searchParams.set("top", "1");
  upstream.searchParams.set("filter", `stopid eq '${stopId}'`);

  const upstreamResponse = await fetch(upstream, {
    headers: {
      "Ocp-Apim-Subscription-Key": subscriptionKey
    }
  });

  const body = await upstreamResponse.text();

  if (!upstreamResponse.ok) {
    return json(request, env, {
      error: "upstream_failed",
      status: upstreamResponse.status
    }, 502);
  }

  try {
    return json(request, env, JSON.parse(body), 200);
  } catch {
    return json(request, env, { error: "bad_upstream_payload" }, 502);
  }
}

function handleOptions(request, env) {
  const headers = {
    ...corsHeaders(request, env),
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "content-type",
    "Access-Control-Max-Age": "86400"
  };

  return new Response(null, { status: 204, headers });
}

function json(request, env, payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(request, env),
      ...extraHeaders
    }
  });
}

function corsHeaders(request, env) {
  const origin = allowedOrigin(request, env);
  if (!origin) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin"
  };
}

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return "";

  const requestOrigin = new URL(request.url).origin;
  if (origin === requestOrigin) return origin;

  const configured = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return configured.includes(origin) ? origin : "";
}
