export function paginate({ page = 1, limit = 10 }) {
  const currentPage = Math.max(1, parseInt(page, 10));
  const pageSize = Math.max(1, parseInt(limit, 10));

  const skip = (currentPage - 1) * pageSize;
  const take = pageSize;

  return {
    skip,
    take,
    paginationMeta: {
      currentPage,
      pageSize,
    },
  };
}
