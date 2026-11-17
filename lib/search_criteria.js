'use strict';

/**
 * Builds the `searchCriteria` part of a query string.
 *
 * Criteria given as bracketed keys (`searchCriteria[...]`, optionally prefixed with `&`)
 * are sent without an empty `searchCriteria=` parameter: Magento 2.4.8+ drops that
 * parameter when it builds the OAuth signature base string, so the signatures differ.
 * Magento builds the search criteria from the bracketed keys alone.
 */
module.exports.buildSearchCriteriaQuery = function (searchCriteria) {
    var criteria = typeof searchCriteria === 'string' ? searchCriteria.replace(/^&+/, '') : '';

    if (criteria.indexOf('searchCriteria[') === 0) {
        return criteria;
    }

    return 'searchCriteria=' + searchCriteria;
}
