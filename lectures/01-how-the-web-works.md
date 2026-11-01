# Lecture 1 — How the Web works

**Goals:** understand what happens between typing a URL and seeing a page; read and write raw HTTP.

### In plain words
Think of the Web as a **restaurant**. You (the *browser*) are a customer, the waiter carries your **order** (the *HTTP request*) to the kitchen (the *server*), and comes back with a **dish** (the *HTTP response*). The menu address — "Table 7, Main Street Restaurant" — is the **URL**. The road network that gets the waiter there is **TCP/IP**, and HTTPS is the waiter carrying your order in a **sealed envelope** so nobody can read it on the way.

The important idea: the kitchen **does not remember you** between orders (HTTP is *stateless*). If you want the waiter to recognise you, you show a **loyalty card** each time — that is a **cookie**. Words you will meet are explained in the [glossary](../resources/glossary.md).

### 1. Clients, servers and protocols
The Web is a **client–server** system. A *user agent* (browser, `curl`) sends a **request**; a server returns a **response**. HTTP is a text-based (HTTP/1.1) application protocol on top of TCP (or QUIC for HTTP/3).

```mermaid
graph TB
  App[HTTP] --> TLS[TLS - optional, HTTPS]
  TLS --> TCP[TCP]
  TCP --> IP[IP]
  IP --> Link[Ethernet / Wi-Fi]
```

### 2. Anatomy of a URL
```
https://user@shop.example.com:8443/products/42?sort=price&dir=asc#reviews
\___/   \__/ \______________/ \__/\__________/ \_________________/ \_____/
scheme  user      host        port    path            query         fragment
```
- The **fragment** is never sent to the server.
- Query values must be **percent-encoded** (`space` → `%20` or `+` in forms).

### 3. From URL to page
```mermaid
sequenceDiagram
  participant U as User
  participant B as Browser
  participant D as DNS resolver
  participant S as Server
  U->>B: types https://example.com/
  B->>D: A/AAAA example.com?
  D-->>B: 93.184.216.34
  B->>S: TCP handshake + TLS handshake
  B->>S: GET / HTTP/1.1
  S-->>B: 200 OK + HTML
  B->>S: GET /style.css, /app.js, /logo.png
  S-->>B: 200 OK (assets)
  B->>U: renders page
```

### 4. HTTP messages
Request:
```http
POST /tasks HTTP/1.1
Host: localhost:3000
Content-Type: application/x-www-form-urlencoded
Content-Length: 24

title=Buy+milk&done=false
```
Response:
```http
HTTP/1.1 303 See Other
Location: /tasks
Set-Cookie: flash=Created; HttpOnly; Path=/
Content-Length: 0
```

**Methods:** `GET` (safe, idempotent), `HEAD`, `POST` (create/action), `PUT` (replace, idempotent), `PATCH` (partial), `DELETE` (idempotent), `OPTIONS`.

**Status classes:**
| Class | Meaning | Examples |
|-------|---------|----------|
| 1xx | informational | 101 Switching Protocols |
| 2xx | success | 200 OK, 201 Created, 204 No Content |
| 3xx | redirection | 301, 302, 303 See Other, 304 Not Modified |
| 4xx | client error | 400, 401, 403, 404, 405, 409, 422, 429 |
| 5xx | server error | 500, 502, 503 |

**Important headers:** `Host`, `Content-Type`, `Content-Length`, `Accept`, `Cookie`/`Set-Cookie`, `Cache-Control`, `ETag`/`If-None-Match`, `Location`, `Authorization`.

### 5. Statelessness and cookies
HTTP itself keeps no state between requests. State is added with **cookies**: the server sends `Set-Cookie`, the browser echoes `Cookie` on later requests to the same site (more in lecture 13).

### 6. Caching (preview)
```mermaid
sequenceDiagram
  Browser->>Server: GET /app.css
  Server-->>Browser: 200, ETag: "abc", Cache-Control: max-age=60
  Note over Browser: 60 s later
  Browser->>Server: GET /app.css, If-None-Match: "abc"
  Server-->>Browser: 304 Not Modified (no body)
```

### 7. Try it
```bash
curl -v http://example.com/
curl -i -X POST -d 'title=Test' https://httpbin.org/post
printf 'GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n' | nc example.com 80
```

### 8. HTTP versions
- **HTTP/1.1** — text, one request at a time per connection (keep-alive).
- **HTTP/2** — binary framing, multiplexing, header compression.
- **HTTP/3** — over QUIC (UDP), faster handshakes.
Semantics (methods, status codes, headers) are the same in all of them.

### Deeper dive: what happens when you press Enter
1. **Parse the URL** — the browser splits it into scheme, host, port, path, query.
2. **DNS lookup** — the host name `shop.example.com` is translated into an IP address, like looking up a phone number in a contact list.
3. **TCP connection** — a "phone call" is opened to that IP and port (three-way handshake).
4. **TLS handshake** (HTTPS only) — both sides agree on encryption keys and the browser checks the server's certificate.
5. **Send the request** — method, path, headers, optional body.
6. **Server processes** it and returns a status line, headers and a body.
7. **Browser renders** the HTML, then discovers CSS, JS and images and sends **more requests** for each of them.

```mermaid
sequenceDiagram
  participant B as Browser
  participant D as DNS resolver
  participant S as Web server
  B->>D: "What is the IP of shop.example.com?"
  D-->>B: "93.184.216.34"
  B->>S: TCP handshake + TLS handshake
  B->>S: GET /products/42 HTTP/1.1
  S-->>B: 200 OK + HTML
  B->>S: GET /style.css
  S-->>B: 200 OK + CSS
```

### Worked example: talking HTTP by hand
Step 1 — start any tiny server (we build our own in lecture 6). Here we use Node's one-liner:
```js
// server.mjs — run with: node server.mjs
import { createServer } from 'node:http'; // built-in module, no npm install needed

createServer((req, res) => {
  // req.method and req.url come from the request line, e.g. "GET /hello"
  console.log(req.method, req.url, req.headers['user-agent']);
  // writeHead sets the status code and response headers
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  // end() sends the body and finishes the response
  res.end(`You asked for ${req.url}\n`);
}).listen(3000, () => console.log('http://localhost:3000'));
```
Step 2 — send a request with `curl -v` and read **every** line:
```bash
curl -v "http://localhost:3000/hello?name=Ann"
# > GET /hello?name=Ann HTTP/1.1      <- request line: method, target, version
# > Host: localhost:3000              <- required header in HTTP/1.1
# > User-Agent: curl/8.5.0
# > Accept: */*
# >                                   <- empty line = end of headers
# < HTTP/1.1 200 OK                   <- status line
# < Content-Type: text/plain; charset=utf-8
# < Content-Length: 27
# <
# You asked for /hello?name=Ann
```
Step 3 — try a POST with a form body:
```bash
curl -v -X POST -d "title=Buy milk" http://localhost:3000/tasks
# Note the extra header: Content-Type: application/x-www-form-urlencoded
```

### Worked example: a cookie round trip
```mermaid
sequenceDiagram
  participant B as Browser
  participant S as Server
  B->>S: POST /login
  S-->>B: 303 See Other + Set-Cookie sid=abc123
  B->>S: GET /dashboard + Cookie sid=abc123
  S-->>B: 200 OK "Hello, Ann"
```
The browser stores the cookie and **automatically** attaches it to every later request to the same site.

### Status code families at a glance
```mermaid
graph LR
  R["Response status"] --> A["1xx Informational"]
  R --> B["2xx Success - 200, 201, 204"]
  R --> C["3xx Redirect - 301, 303, 304"]
  R --> D["4xx Client error - 400, 404, 422"]
  R --> E["5xx Server error - 500, 503"]
```

### Common beginner mistakes
- **Thinking the fragment `#reviews` reaches the server.** It never does — it is only for the browser.
- **Using GET for actions that change data** (e.g. `GET /delete/5`). Crawlers and prefetchers may "click" it. Use POST.
- **Confusing 401 and 403.** 401 = "who are you?" (not logged in); 403 = "I know you, but no".
- **Returning 200 for errors** with an error message in the body. Clients and caches rely on the status code.
- **Forgetting that HTTP is stateless** and expecting the server to "remember" the previous request without a cookie/session.
- **Not encoding query values** — `?q=a&b` means two parameters; you need `?q=a%26b`.

### Try it yourself
1. Run `curl -v https://example.com` and label each line: request line, header, status line, body.
2. Open DevTools → Network, reload any site and count how many requests one page makes.
3. Use `new URL('https://a.com:8080/x?y=1#z')` in the browser console and print `host`, `port`, `search`, `hash`.
4. Make the worked-example server return `404` for every path except `/`.
5. Find a site that sets cookies; inspect `HttpOnly`, `Secure` and `SameSite` flags in DevTools → Application.

### Recap questions
1. Which part of a URL is not sent to the server, and why?
2. What is the difference between *safe* and *idempotent* methods? Give examples.
3. Why does a successful form `POST` usually answer with `303 See Other`?
4. What does DNS return and when is it consulted?
5. How does a `304 Not Modified` response save bandwidth?
6. HTTP is stateless — how do websites remember logged-in users?
