/**
 * Movie business logic service stub.
 */
export function buildSearchFilter(query) {
  const filter = {};
  if (query.q) filter.$text = { $search: query.q };
  if (query.genre && query.genre !== 'All') filter.genres = query.genre;
  if (query.year) filter.year = Number(query.year);
  if (query.minRating) filter.rating = { $gte: Number(query.minRating) };
  return filter;
}
