import xssFilters from 'xss-filters';

/**
 * Função recursiva para filtrar XSS em objetos e arrays.
 * @param {object|string[]|object[]} maybeObj - O objeto ou array a ser sanitizado.
 * @return {object|string[]|object[]} - O objeto ou array sanitizado.
 */
function filterXss(maybeObj) {
  if (!Array.isArray(maybeObj)) {
    for (let key in maybeObj) {
      if (typeof maybeObj[key] === 'string') {
        maybeObj[key] = xssFilters.inHTMLData(maybeObj[key]);
      } else if (Array.isArray(maybeObj[key])) {
        filterXss(maybeObj[key]);
      }
    }
  } else {
    return maybeObj.map((el) => {
      if (typeof el === 'string') {
        return xssFilters.inHTMLData(el);
      } else if (typeof el === 'object' && !Array.isArray(el)) {
        return filterXss(el);
      }
    });
  }
}

export const sanitizeXss = (req, res, next) => {
  // Sanitizar todas as querie
  for (const key in req.query) {
    req.query[key] = xssFilters.inHTMLData(req.query[key]);
  }

  // Sanitizar o body
  filterXss(req.body);

  // Sanitizar todos os parametros
  for (const key in req.params) {
    req.params[key] = xssFilters.inHTMLData(req.params[key]);
  }

  next();
};
