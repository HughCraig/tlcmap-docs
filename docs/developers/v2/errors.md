# Errors

Every v2 response that is not a success carries the same JSON body and a status code that
means what it says. No v2 response is a redirect. Check the status code first.

::: warning Unstable
v2 is unstable until declared stable. See the [overview](./).
:::

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The parameter 'per_page' must be between 1 and 5000.",
    "details": {
      "parameter": "per_page",
      "rule": "range",
      "accepts": "1–5000"
    }
  }
}
```

| Field | Meaning |
| --- | --- |
| `code` | A stable, upper-case name for the error. Program against this. |
| `message` | A sentence for a person reading a log. It may change; do not match on it. |
| `details` | An object holding what a client needs to act on. It is `{}` when there is nothing. |

| Status | Code | Raised when | `details` |
| --- | --- | --- | --- |
| 400 | [`INVALID_PARAMETER`](#_400-invalid-parameter) | A parameter is unknown, repeated, empty, of the wrong type or out of range; a combination is invalid; a cursor is bad | `parameter`, `rule`, `accepts` |
| 400 | [`INVALID_GEOMETRY`](#_400-invalid-geometry) | `polygon` is not valid | `parameter`, `reason` |
| 400 | [`FILTER_REJECTED`](#_400-filter-rejected) | `extended_data` does not parse, or a value is the wrong kind | `expression`, `position`, `expected` |
| 403 | [`LAYER_PRIVATE`](#_403-layer-private) | A requested layer exists and is not public | `layer_id` |
| 404 | [`LAYER_NOT_FOUND`](#_404-layer-not-found) | A requested layer does not exist | `layer_id` |
| 404 | [`NOT_FOUND`](#_404-not-found) | No v2 route matches | `path` |
| 405 | [`METHOD_NOT_ALLOWED`](#_405-method-not-allowed) | The method is not `GET` or `OPTIONS` | `method` |
| 429 | [`RATE_LIMITED`](#_429-rate-limited) | The rate limit is exceeded | `limit`, `retry_after` |
| 500 | [`INTERNAL_ERROR`](#_500-internal-error) | Anything else | none |

A `413` is reserved and never returned: every v2 request is bounded by `per_page` or `sample`,
so none can be too large to answer. An oversized `per_page` is a `400`.

The examples below were produced by sending the request shown to a development copy of the
TLCMap application.

## 400 INVALID_PARAMETER

The request broke a [strict parameter rule](./#strict-parameters). `details.parameter` names
the parameter, `details.rule` is the rule it broke, and `details.accepts` says what is allowed.

| `rule` | Meaning |
| --- | --- |
| `unknown` | The endpoint has no such parameter. `accepts` lists the ones it has. |
| `repeated` | The parameter appears more than once or as an array. |
| `empty` | The value is empty. |
| `encoding` | The name or value is not UTF-8 text, or contains a NUL character. |
| `integer`, `boolean`, `one_of`, `range`, `max_length`, `format`, `order`, `date` | The value is not of the right type, form or size. |
| `requires`, `conflicts` | The parameter needs, or cannot be combined with, another. |
| `invalid` | A `cursor` that was not returned by a previous page of this query. |

An unknown parameter:

```
GET /api/v2/places?nme=Wollombi
```

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The parameter 'nme' is not recognised.",
    "details": {
      "parameter": "nme",
      "rule": "unknown",
      "accepts": "name, match, sources, layers, bbox, polygon, date_from, date_to, include_undated, state, lga, parish, feature_term, record_type, extended_data, summary_only, sort, direction, nulls, limit, sample, seed, cursor, per_page"
    }
  }
}
```

An empty value, which is an error and not an absent filter:

```
GET /api/v2/places?bbox=
```

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The parameter 'bbox' must not be empty.",
    "details": {
      "parameter": "bbox",
      "rule": "empty",
      "accepts": "a non-empty value"
    }
  }
}
```

A `per_page` above the maximum:

```
GET /api/v2/places?per_page=5001
```

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The parameter 'per_page' must be between 1 and 5000.",
    "details": {
      "parameter": "per_page",
      "rule": "range",
      "accepts": "1–5000"
    }
  }
}
```

A repeated parameter:

```
GET /api/v2/places?sources=anps&sources=ncg
```

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The parameter 'sources' must appear only once and must not be an array.",
    "details": {
      "parameter": "sources",
      "rule": "repeated",
      "accepts": "a single value"
    }
  }
}
```

A parameter that needs another:

```
GET /api/v2/places?match=fuzzy
```

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The parameter 'match' can only be given with 'name'.",
    "details": {
      "parameter": "match",
      "rule": "requires",
      "accepts": "name"
    }
  }
}
```

A date v2 cannot read:

```
GET /api/v2/layers?date_from=banana
```

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The parameter 'date_from' is not a date TLCMap can read.",
    "details": {
      "parameter": "date_from",
      "rule": "date",
      "accepts": "a year or date such as 1820, 1820-03 or 1820-03-15; negative years are BCE"
    }
  }
}
```

A cursor that was not returned by this query:

```
GET /api/v2/places?cursor=abc
```

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The parameter 'cursor' is not a cursor returned by a previous page of this query.",
    "details": {
      "parameter": "cursor",
      "rule": "invalid",
      "accepts": "a cursor returned by a previous page of this query"
    }
  }
}
```

A cursor from one query used with another query is the same error.

## 400 INVALID_GEOMETRY

`polygon` was well formed, but PostGIS says the shape is not valid. `details.reason` is
PostGIS's own reason, and may include the point of the fault.

```
GET /api/v2/places?polygon=0 0,10 10,10 0,0 10
```

```json
{
  "error": {
    "code": "INVALID_GEOMETRY",
    "message": "The geometry in 'polygon' is not valid: Self-intersection[5 5]",
    "details": {
      "parameter": "polygon",
      "reason": "Self-intersection[5 5]"
    }
  }
}
```

## 400 FILTER_REJECTED

`extended_data` did not parse, or a value was the wrong kind for its operator. Nothing is
discarded. `details.expression` is what you sent, `details.position` is the character position
(counting from 0) where parsing failed, and `details.expected` says what should have been
there.

```
GET /api/v2/places?extended_data=Years > many
```

```json
{
  "error": {
    "code": "FILTER_REJECTED",
    "message": "The extended_data filter was rejected at position 8; expected a number.",
    "details": {
      "expression": "Years > many",
      "position": 8,
      "expected": "a number"
    }
  }
}
```

An expression that stops short:

```
GET /api/v2/places?extended_data=Years =
```

```json
{
  "error": {
    "code": "FILTER_REJECTED",
    "message": "The extended_data filter was rejected at position 7; expected a value.",
    "details": {
      "expression": "Years =",
      "position": 7,
      "expected": "a value"
    }
  }
}
```

(Spaces in a query are percent-encoded in the request actually sent.)

## 403 LAYER_PRIVATE

A layer you asked for, through `layers` or by id, exists and is not public. It is never
silently left out of a result.

```
GET /api/v2/places?layers=33
```

```json
{
  "error": {
    "code": "LAYER_PRIVATE",
    "message": "Layer 33 exists but is not public.",
    "details": {
      "layer_id": 33
    }
  }
}
```

The same error comes from `GET /api/v2/layers/33` and `GET /api/v2/layers/33/features`. When
several layers are named, the first offending one, in the order given, is reported.

## 404 LAYER_NOT_FOUND

A layer you asked for does not exist.

```
GET /api/v2/places?layers=1
```

```json
{
  "error": {
    "code": "LAYER_NOT_FOUND",
    "message": "Layer 1 does not exist.",
    "details": {
      "layer_id": 1
    }
  }
}
```

## 404 NOT_FOUND

No v2 route matches. Layer ids are digits only, so a non-numeric id lands here.

```
GET /api/v2/layers/abc
```

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "No such v2 endpoint.",
    "details": {
      "path": "api/v2/layers/abc"
    }
  }
}
```

## 405 METHOD_NOT_ALLOWED

Only `GET` is routed. `OPTIONS` is answered with `204` and the cross-origin headers.

```
POST /api/v2/places
```

```json
{
  "error": {
    "code": "METHOD_NOT_ALLOWED",
    "message": "Only GET and OPTIONS are accepted.",
    "details": {
      "method": "POST"
    }
  }
}
```

## 429 RATE_LIMITED

More than 60 requests a minute from one address. The response carries a `Retry-After` header
with the same number of seconds as `details.retry_after`.

This response was produced by sending more than 60 requests inside a minute to a development
copy; `retry_after` is the seconds left in that minute's window.

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Wait before trying again.",
    "details": {
      "limit": 60,
      "retry_after": 19
    }
  }
}
```

Response headers:

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
Retry-After: 19
X-RateLimit-Reset: 1793869553
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
```

The limit is interim. See [Rate limit](./#rate-limit).

## 500 INTERNAL_ERROR

An error on the server. The body carries a fixed message and no detail, never the exception text or a stack trace, and the
error is logged on the server. It could not be triggered on the development copy, so there is
no recorded example; the body has this shape:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred.",
    "details": {}
  }
}
```

This body is written from the source, not captured from a response. A `500` is not caused by
your request being wrong; retrying later is reasonable.
