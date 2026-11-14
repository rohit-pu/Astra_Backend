/**
 * Reusable pagination utility for Knex queries.
 */
export async function paginateQuery(query, page = 1, limit = 10) {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (currentPage - 1) * pageSize;

  // Clone query for total records count without ordering or specific selects
  const countQuery = query.clone().clearSelect().clearOrder().count('* as total');
  const countResult = await countQuery;
  const totalRecords = countResult && countResult[0] ? parseInt(countResult[0].total, 10) : 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const data = await query.offset(offset).limit(pageSize);

  return {
    data,
    pagination: {
      current_page: currentPage,
      page_size: pageSize,
      total_records: totalRecords,
      total_pages: totalPages,
      has_next: currentPage < totalPages,
      has_previous: currentPage > 1
    }
  };
}

