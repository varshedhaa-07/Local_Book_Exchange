const jwtSecret = process.env.JWT_SECRET || 'local_book_exchange_dev_secret';

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Using the local development fallback secret.');
}

export default jwtSecret;
