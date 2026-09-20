# rest-api

A RESTful API for managing notes, built with Node.js and Express.

## Features

- Full CRUD: create, read, update, and delete notes
- Route design that follows REST conventions (nouns for resources, HTTP verbs for actions)
- Input validation with clear error messages
- Correct status codes (200, 201, 204, 400, 404, 413, 500)
- Central error handling, including invalid JSON
- Search with `?search=`
- Notes are saved to a JSON file, so they survive restarts

## Project structure

```
notes-api/
├── server.js            # app setup and start
├── package.json
└── src/
    ├── store.js         # data layer (saves to data.json)
    ├── middleware.js    # validation, 404, and error handlers
    └── routes/
        └── notes.js     # the /api/notes routes
```

## Run locally

Install Node.js (version 18 or newer), then in the project folder:

```bash
npm install
npm start
```

The API runs at `http://localhost:3000`.

## Endpoints

| Method | URL | What it does | Success code |
|--------|-----|--------------|--------------|
| GET | `/api/notes` | List notes (optional `?search=word`) | 200 |
| GET | `/api/notes/:id` | Get one note | 200 |
| POST | `/api/notes` | Create a note | 201 |
| PUT | `/api/notes/:id` | Replace a note | 200 |
| PATCH | `/api/notes/:id` | Change some fields | 200 |
| DELETE | `/api/notes/:id` | Delete a note | 204 |

### Note format

```json
{
  "id": 1,
  "title": "Buy books",
  "content": "Data structures and DBMS",
  "createdAt": "2026-09-20T07:30:00.000Z",
  "updatedAt": "2026-09-20T07:30:00.000Z"
}
```

### Validation rules

- `title`: required for POST and PUT, a non-empty string, at most 100 characters
- `content`: optional, a string, at most 1000 characters
- `:id`: a positive whole number

### Error format

```json
{
  "error": "Validation failed",
  "details": ["title is required"]
}
```

## Try it

Create a note:

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy books", "content": "Data structures and DBMS"}'
```

List notes:

```bash
curl http://localhost:3000/api/notes
```

Update the content only:

```bash
curl -X PATCH http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"content": "Data structures, DBMS, and OS"}'
```

Delete a note:

```bash
curl -X DELETE http://localhost:3000/api/notes/1
```

Send bad data to see validation:

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"content": "no title"}'
```

## Design decisions

- **Layers:** routes handle HTTP, middleware handles validation and errors, and the store handles data. Each part can change without touching the others.
- **JSON file instead of a database:** it keeps the project easy to run. The store is the only file that would change if I moved to a database.
- **Validation before the route runs:** bad input is rejected early with a 400 and a list of what's wrong.
- **500 errors hide details:** the real error is logged on the server, and the client only sees a generic message.

## Live demo

_Add your deployment link here (for example on Render)._
