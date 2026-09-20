// ---------- Input validation ----------
// Checks the request body and puts the cleaned values in req.validated.
// requireAll = true  -> title is required (used by POST and PUT)
// requireAll = false -> any field may be left out (used by PATCH)
function validateNote(requireAll) {
  return (req, res, next) => {
    const body = req.body;
    const errors = [];
    const clean = {};

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['Request body must be a JSON object']
      });
    }

    // title
    if (body.title === undefined) {
      if (requireAll) errors.push('title is required');
    } else if (typeof body.title !== 'string' || body.title.trim() === '') {
      errors.push('title must be a non-empty string');
    } else if (body.title.trim().length > 100) {
      errors.push('title must be 100 characters or fewer');
    } else {
      clean.title = body.title.trim();
    }

    // content
    if (body.content === undefined) {
      if (requireAll) clean.content = '';
    } else if (typeof body.content !== 'string') {
      errors.push('content must be a string');
    } else if (body.content.length > 1000) {
      errors.push('content must be 1000 characters or fewer');
    } else {
      clean.content = body.content.trim();
    }

    // PATCH with nothing to change
    if (!requireAll && errors.length === 0 && Object.keys(clean).length === 0) {
      errors.push('provide at least one field to update (title or content)');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    req.validated = clean;
    next();
  };
}

// ---------- Unknown routes ----------
function notFound(req, res) {
  res.status(404).json({ error: 'Route not found: ' + req.method + ' ' + req.originalUrl });
}

// ---------- Errors ----------
// Express recognises this as an error handler because it takes 4 arguments.
function errorHandler(err, req, res, next) {
  // Malformed JSON sent by the client
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  // Body larger than the limit set in server.js
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }
  // Anything else is our fault: log the details, but don't leak them to the client
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
}

module.exports = { validateNote, notFound, errorHandler };
