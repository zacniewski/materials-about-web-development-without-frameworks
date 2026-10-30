# Lab 1 — HTTP by hand

**Lecture:** [1 — How the Web works](../lectures/01-how-the-web-works.md) · **Time:** 2 h

### Goals
- Inspect real HTTP traffic with `curl`, `nc` and browser DevTools.
- Recognise methods, status codes and headers.
- Set up the Git repository you will use for all labs.

### Steps
1. **Repository.** Create a repo `webdev-labs` with a `README.md`; commit it. Every lab ends with a commit `lab-NN`.
2. **curl basics.**
   ```bash
   curl -v http://example.com/                 # request + response headers
   curl -I https://www.wikipedia.org/          # HEAD only
   curl -i "https://httpbin.org/get?course=web&lab=1"
   curl -i -X POST -d 'title=Buy+milk&done=false' https://httpbin.org/post
   curl -i -H 'Accept: application/json' https://httpbin.org/headers
   curl -i https://httpbin.org/status/404
   curl -iL https://httpbin.org/redirect/2     # follow redirects
   ```
3. **Raw TCP.** Talk HTTP/1.1 yourself:
   ```bash
   printf 'GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n' | nc example.com 80
   ```
4. **DNS.** `dig +short example.com`, `dig +short www.github.com CNAME`.
5. **DevTools.** Open a news site, Network tab, *Disable cache*, then reload. Sort by size and find the HTML document, the largest asset and a request answered with `304` (reload again without disabling the cache).
6. **Cookies.** `curl -i -c jar.txt https://httpbin.org/cookies/set?lab=1` then `curl -b jar.txt https://httpbin.org/cookies`.

### Checkpoints (graded)
- [ ] `lab01.md` in your repo with the answers below (1 pt)
  1. The full request line and headers sent by step 3.
  2. Status code and `Location` for each hop of `/redirect/2`.
  3. How many requests did the news page need? Total transferred size?
  4. What does `Set-Cookie` look like in step 6? Which attributes are present?
- [ ] Explain to the instructor the difference between a `301`, a `303` and a `304` (1 pt)

### Extra tasks
- Use `curl --http2 -v https://www.google.com` and compare the output with HTTP/1.1.
- Write a URL that uses every URL part (scheme, user, host, port, path, query, fragment) and explain which parts the server receives.
