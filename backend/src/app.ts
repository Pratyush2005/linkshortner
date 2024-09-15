import Fastify from 'fastify';
import cors from '@fastify/cors';
import crypto from 'crypto';

const fastify = Fastify();
fastify.register(cors);

interface URLDatabase {
  [key: string]: { longUrl: string };
}

const urlDatabase: URLDatabase = {};

function generateShortId(): string {
  return crypto.randomBytes(3).toString('hex');
}

interface ShortenRequestBody {
  longUrl: string;
}

fastify.post<{ Body: ShortenRequestBody }>('/shorten', async (request, reply) => {
  const { longUrl } = request.body;

  if (!longUrl) {
    return reply.status(400).send({ message: 'URL is required' });
  }

  const shortId = generateShortId();
  const shortUrl = `http://localhost:5000/${shortId}`;

  urlDatabase[shortId] = { longUrl };

  reply.send({ shortUrl });
});

fastify.get<{ Params: { shortId: string } }>('/:shortId', async (request, reply) => {
  const { shortId } = request.params;
  const record = urlDatabase[shortId];

  if (record) {
    reply.redirect(record.longUrl);
  } else {
    reply.status(404).send('Short URL not found');
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 5000 });
    console.log('Server is running on http://localhost:5000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();