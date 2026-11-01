# Glossary — Web development terms in plain words

Terms are grouped by topic. Each entry answers *"what is it?"*, and many also say *"why should I care?"*.

### The Web and HTTP
| Term | Plain explanation |
|------|-------------------|
| **Client** | The program that *asks* for something, usually a browser. Think of a customer in a restaurant. |
| **Server** | The program that *answers*. It's the kitchen. One machine can run many servers, each on its own port. |
| **HTTP** | The "language" clients and servers use to talk: plain text messages made of a request line, headers and an optional body. |
| **HTTPS** | HTTP sent inside an encrypted TLS tunnel, so nobody in between can read or change it. |
| **URL** | The address of a resource: `scheme://host:port/path?query#fragment`. |
| **DNS** | The Internet's phone book. It turns `example.com` into an IP address such as `93.184.216.34`. |
| **IP address** | The numeric address of a machine on the network. |
| **Port** | A "door number" on a machine. Port 80 is used for HTTP, 443 for HTTPS, and in this course we use 3000 for our app. |
| **localhost / 127.0.0.1** | "This very computer". |
| **Request** | A message from the client: a method, a path, headers and a body. |
| **Response** | The server's reply: a status code, headers and a body. |
| **Method (verb)** | What the client wants to do: `GET` (read), `POST` (create or act), `PUT`/`PATCH` (update), `DELETE` (remove). |
| **Status code** | A three-digit result: 2xx means OK, 3xx means "go elsewhere", 4xx means you (the client) made a mistake, 5xx means the server failed. |
| **Header** | A `Name: value` line of metadata, for example `Content-Type: text/html`. |
| **Body** | The actual content, such as HTML, JSON or form data. |
| **Stateless** | Every request stands alone. The server doesn't remember you unless you send a cookie. |
| **Cookie** | A small piece of data the server asks the browser to store and send back with every request. |
| **Session** | Server-side memory about a user, found through an id stored in a cookie. |
| **Cache** | A stored copy of a response that can be reused to save time. |
| **Redirect** | A 3xx response with a `Location` header telling the browser "go to this URL instead". |

### Front end
| Term | Plain explanation |
|------|-------------------|
| **HTML** | Describes the *structure and meaning* of content (headings, lists, forms). |
| **CSS** | Describes the *look* (colours, spacing, layout). |
| **JavaScript (JS)** | Adds *behaviour* in the browser. On the server it runs in Node.js. |
| **DOM** | The live tree of objects the browser builds from HTML. JS changes the page by changing the DOM. |
| **Element / tag / attribute** | `<a href="/x">Hi</a>`: `a` is the tag, `href` is an attribute, and the whole thing is an element. |
| **Semantic HTML** | Choosing tags by meaning (`<nav>`, `<button>`) rather than looks. |
| **Accessibility (a11y)** | Making pages usable for everyone, including screen-reader and keyboard users. |
| **Responsive design** | A layout that adapts to the screen width. |
| **Bootstrap** | A CSS library of ready-made classes (`btn`, `card`, `row`, `col`). |
| **HTMX** | A small JS library that lets HTML attributes (`hx-get`, `hx-post`) send requests and swap parts of a page. |
| **Hypermedia** | Content with built-in controls (links, forms) that tell the client what it can do next. |
| **Partial** | A fragment of HTML (not a whole page) returned for HTMX to insert. |
| **Event** | Something that happened, such as a click, a key press or a form submit. |
| **fetch** | The browser API for sending HTTP requests from JS. |
| **CDN** | A network of servers that hosts files (like Bootstrap) close to users. |
| **DevTools** | The browser's built-in developer tools (F12): Elements, Console, Network. |

### Back end and Node.js
| Term | Plain explanation |
|------|-------------------|
| **Node.js** | A program that runs JavaScript outside the browser, used for servers and tools. |
| **npm** | Node's package manager. It downloads libraries listed in `package.json`. |
| **Package / dependency** | Somebody else's code that your project uses. |
| **Module (ESM)** | A JS file that `export`s things others can `import`. |
| **Event loop** | The mechanism that lets one Node thread juggle many requests by never waiting idly. |
| **Callback / Promise / async-await** | Three ways to say "run this when the slow thing finishes". |
| **Router** | Code that picks which function handles a given method + path. |
| **Handler** | A function that receives a request and produces a response. |
| **Middleware** | A function that runs *before* (or around) handlers, doing things like logging, parsing or checking login. |
| **Framework** | A library that provides the structure (router, middleware…) for you. In this course we write those parts ourselves. |
| **Template** | HTML with placeholders that get filled in with data. |
| **Escaping** | Turning `<` into `&lt;` and so on, so that user text is shown as text and never run as code. |
| **Environment variable** | Configuration passed from outside the code, for example `DATABASE_URL`. |
| **`.env` file** | A file holding environment variables for local development. Never commit it. |

### Databases
| Term | Plain explanation |
|------|-------------------|
| **Database (DB)** | A program that stores data safely and lets you query it. |
| **Relational DB** | Stores data in tables (rows and columns) that are linked by keys. PostgreSQL is one. |
| **SQL** | The language for talking to relational DBs (`SELECT`, `INSERT`, `UPDATE`, `DELETE`). |
| **Table / row / column** | A spreadsheet sheet, one line in it, and one field. |
| **Primary key (PK)** | A column that uniquely identifies a row, usually `id`. |
| **Foreign key (FK)** | A column pointing at another table's PK (`task.boardId → board.id`). |
| **Relation** | How tables connect: one-to-one, one-to-many or many-to-many. |
| **Join** | Combining rows from several tables in one query. |
| **Index** | A lookup structure that makes searching by a column fast, like the index in a book. |
| **Transaction** | A group of changes that succeed or fail *together*. |
| **SQL injection** | An attack where user input gets run as SQL. You prevent it with parameterised queries. |
| **ORM** | Object-Relational Mapper. You work with objects and methods (`prisma.task.findMany()`) instead of writing SQL strings. |
| **Prisma schema** | The `schema.prisma` file describing your models. Prisma generates the client and migrations from it. |
| **Migration** | A versioned script that changes the DB structure step by step. |
| **Seed** | A script that fills the DB with sample data. |
| **N+1 problem** | Running 1 query for a list plus N extra queries for each item, which is slow. |

### Security and quality
| Term | Plain explanation |
|------|-------------------|
| **Authentication** | *Who are you?* (logging in). |
| **Authorization** | *What are you allowed to do?* |
| **Hashing** | A one-way scramble. Passwords are stored as hashes, never as plain text. |
| **Salt** | Random data added before hashing, so two equal passwords get different hashes. |
| **XSS** | Cross-Site Scripting: an attacker's script runs in other users' browsers. Prevent it by escaping output. |
| **CSRF** | Cross-Site Request Forgery: another site makes your browser send a request you didn't intend. Prevent it with tokens and `SameSite` cookies. |
| **OWASP Top 10** | A well-known list of the most common web security risks. |
| **Validation** | Checking that input has the expected shape before using it. |
| **Unit / integration test** | A test of one small function, or of several parts working together. |
| **Logging** | Writing down what the app did, to help with debugging and monitoring. |
| **Deployment** | Putting the app on a server where users can reach it. |
