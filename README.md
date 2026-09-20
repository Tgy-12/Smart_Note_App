# Smart Notes — Backend API

A Node.js/Express/MongoDB backend powering a full-stack RAG (Retrieval-Augmented Generation) note-taking system — built as a portfolio project for a transition into GenAI/RAG engineering, with an emphasis on deep architectural understanding over speed of assembly.

This is the API layer. The React frontend that consumes it lives here: **[smart-notes-ui](https://www.github.com/Tgy-12/Smart_Note_UI)** 

> **Note on RAG completeness:** this API implements the **Retrieval** half of RAG end-to-end, entirely from scratch — text chunking, local embedding generation, and in-process cosine-similarity semantic search with source attribution. No third-party AI APIs and no managed vector database are used. LLM-based answer synthesis (the **Generation** half) is on the roadmap and not yet built. See [Roadmap](#roadmap).

---

## Features

- **JWT authentication** — register/login with bcrypt password hashing, user-enumeration-safe error responses
- **Multi-tenant data isolation** — every query is scoped by the authenticated user's ID; ownership violations return `404`, not `403`, to avoid leaking resource existence
- **Notes CRUD** — create (single or bulk), read (paginated, filterable), update (partial via `PATCH`), soft delete + restore
- **File upload ingestion** — PDF, TXT, and DOCX files are parsed and ingested as regular notes, reusing the full chunking/embedding pipeline
- **Local embedding pipeline** — chunks note content and generates 384-dim normalized embeddings locally via `@huggingface/transformers` (`Xenova/all-MiniLM-L6-v2`) — no external embedding API, no per-request cost
- **Semantic search** — natural-language search via in-process cosine similarity across a user's own chunks, returning ranked results with source note attribution
- **Incremental re-indexing** — updates only re-chunk/re-embed when `content` actually changes; metadata-only updates (title, tags, pin/archive) skip the embedding pipeline entirely
- **Fire-and-forget indexing** — note creation/update responds immediately; embedding runs as a non-blocking background task with error logging
- **User profiles** — editable bio and avatar upload (with automatic cleanup of the previous avatar file on replacement)
- **Robust validation & error handling** — Joi schema validation on every write path; centralized error mapping (`ValidationError` → 400, `CastError` → 400, duplicate key → 409)
- **Structured logging** — Winston (file + console) with Morgan HTTP request logging piped through it

---

## Tech Stack

- **Runtime/Framework:** Node.js, Express
- **Database:** MongoDB with Mongoose ODM (MongoDB Atlas–ready)
- **Auth:** JSON Web Tokens + bcrypt
- **Validation:** Joi
- **File handling:** Multer (memory storage), `pdf-parse` v2 (class-based API), `mammoth` (DOCX)
- **Embeddings:** `@huggingface/transformers`, model `Xenova/all-MiniLM-L6-v2`, running fully locally
- **Logging:** Winston + Morgan

---

## Architecture Notes

A few deliberate decisions worth knowing about if you're reading the code:

- **Controller/Service/Model layering** throughout — controllers only handle `req`/`res`; services own all business logic and DB access.
- **Consistent response envelope:** `{ status: true, message, data }` on success; `{ success: false, message, stack (dev only) }` on error.
- **Uploaded files become regular Notes** (tagged `["uploaded"]`) rather than a separate `Document` model — this was a deliberate reuse decision so uploaded content automatically gets the same chunking, embedding, auth, and search treatment as manually created notes, with zero duplicated logic.
- **REST semantics were corrected deliberately during development:** partial updates use `PATCH`, not `PUT`; `DELETE` returns `200` with the deleted note body (an explicit choice over `204 No Content`, made after weighing both).
- **Ownership security:** `userId` is always taken server-side from the verified JWT — never trusted from the request body — and a note that exists but belongs to another user returns the same `404` as one that doesn't exist at all.
- **pdf-parse v2 uses a class-based API**, not the older functional one — worth knowing if you're extending file parsing:
```js
  const { PDFParse } = require('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
```

---

## API Overview

All routes are prefixed `/api/v1`. Notes routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in, receive a JWT |
| PATCH | `/auth/me` | Update name/bio |
| POST | `/auth/me/avatar` | Upload/replace profile avatar |
| POST | `/notes` | Create a note (single or bulk) |
| POST | `/notes/upload` | Create a note from an uploaded file (PDF/TXT/DOCX) |
| GET | `/notes` | List notes (paginated, filterable by tag/pinned/archived/search) |
| GET | `/notes/search/semantic` | Semantic search across your notes |
| GET | `/notes/:id` | Get a single note |
| PATCH | `/notes/:id` | Partially update a note (title/content/tags/isPinned/isArchived) |
| PATCH | `/notes/:id/restore` | Restore a soft-deleted note |
| DELETE | `/notes/:id` | Soft-delete a note |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or MongoDB Atlas)

### Installation

```bash
git clone <this-repo-url>
cd smart-notes-api
npm install
```

### Environment Variables

Create a `.env` file in the project root:
