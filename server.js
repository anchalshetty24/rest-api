const express = require('express');
const notesRouter = require('./src/routes/notes');
const { notFound, errorHandler } = require('./src/middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Read JSON request bodies (max 10 KB)
app.use(express.json({ limit: '10kb' }));

// Simple request log: METHOD /path -> status
app.use((req, res, next) => {
  res.on('finish', () => console.log(req.method + ' ' + req.originalUrl + ' -> ' + res.statusCode));
  next();
});

// Welcome and health check
app.get('/', (req, res) => {
  res.json({
    name: 'Notes API',
    endpoints: [
      'GET    /api/notes',
      'GET    /api/notes/:id',
      'POST   /api/notes',
      'PUT    /api/notes/:id',
      'PATCH  /api/notes/:id',
      'DELETE /api/notes/:id'
    ]
  });
});
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// The notes resource
app.use('/api/notes', notesRouter);

// These two must come last
app.use(notFound);
app.use(errorHandler);

// Start the server only when this file is run directly
if (require.main === module) {
  app.listen(PORT, () => console.log('Notes API running at http://localhost:' + PORT));
}

module.exports = app;
