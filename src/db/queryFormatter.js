class formatQuery {
  /**
   * format the base query using the function that matchs the user permission and filter the values array for only values that will be necesary in the query
   * @param {string} baseQuery - the base query that will be modified acording to the level of user permission
   * @param {string} permission - the user permission
   * @param {Array} values - the values that will be inserted into the query
   * @returns an array containing two values, first the formatted query, second the values that will be needed for this query
   */
  format(baseQuery, permission, values) {
    console.log(permission);
    return this[`${permission}`](baseQuery, values);
  }

  readAll(baseQuery, values) {
    const placeholderN = baseQuery.split('').findLastIndex((c) => c === '$');
    if (placeholderN < 0) return [baseQuery];

    return [baseQuery, values.slice(0, +baseQuery[placeholderN + 1])];
  }

  readCreatedOnly(baseQuery, values) {
    const index = baseQuery.split('').findLastIndex((c) => c === '$');
    const existWhereClause = baseQuery.indexOf('WHERE') < 0 ? 'WHERE' : 'AND';
    const placeholderN = index < 0 ? 0 : +baseQuery[index + 1];
    return [
      `${baseQuery} ${existWhereClause} created_by = $${placeholderN + 1}`,
      values.slice(0, placeholderN + 1),
    ];
  }
}

export default formatQuery;
