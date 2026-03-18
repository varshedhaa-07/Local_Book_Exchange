import Book from '../models/Book.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCityToken = (value = '') => value.split(',')[0]?.trim();

export const createBook = asyncHandler(async (req, res) => {
  const { title, author, genre, condition, image, location } = req.body;

  if (!title || !author || !genre || !condition || !location) {
    res.status(400);
    throw new Error('Missing required book fields');
  }

  const book = await Book.create({
    title,
    author,
    genre,
    condition,
    image,
    location,
    ownerId: req.user._id,
  });

  await book.populate({ path: 'ownerId', select: 'name email location' });

  res.status(201).json(book);
});

export const getBooks = asyncHandler(async (req, res) => {
  const { genre, location, nearby, mine, interested } = req.query;
  const query = {};

  if (genre) {
    query.genre = new RegExp(`^${genre}$`, 'i');
  }

  if (location) {
    query.location = new RegExp(location, 'i');
  }

  if (nearby === 'true' && req.user?.location) {
    const userCity = getCityToken(req.user.location);

    if (userCity) {
      const escapedCity = escapeRegex(userCity);
      query.location = new RegExp(`^\\s*${escapedCity}(\\s*,.*)?$`, 'i');
    }
  }

  if (mine === 'true' && req.user?._id) {
    query.ownerId = req.user._id;
  }

  if (interested === 'true' && req.user?._id) {
    query.interestedUserIds = req.user._id;
  }

  if (mine !== 'true') {
    query.isAvailable = { $ne: false };
  }

  const books = await Book.find(query)
    .populate('ownerId', 'name email location')
    .sort({ createdAt: -1 });

  const visibleBooks =
    req.user?._id && mine !== 'true'
      ? books.filter((book) => book.ownerId?._id?.toString() !== req.user._id.toString())
      : books;

  res.json(visibleBooks);
});

export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate('ownerId', 'name email location');

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.json(book);
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (book.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only edit your own books');
  }

  const fields = ['title', 'author', 'genre', 'condition', 'image', 'location'];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      book[field] = req.body[field];
    }
  }

  await book.save();
  await book.populate('ownerId', 'name email location');

  res.json(book);
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (book.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own books');
  }

  await book.deleteOne();
  res.json({ message: 'Book deleted successfully' });
});
