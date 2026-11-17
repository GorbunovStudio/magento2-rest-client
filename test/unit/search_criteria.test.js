var assert = require('assert');

var buildSearchCriteriaQuery = require('../../lib/search_criteria').buildSearchCriteriaQuery;
var customers = require('../../lib/customers');
var products = require('../../lib/products');
var taxRules = require('../../lib/tax_rules');
var attributes = require('../../lib/attributes');
var reviews = require('../../lib/reviews');

var SKU_CRITERIA = '&searchCriteria[filter_groups][0][filters][0][field]=sku&' +
    'searchCriteria[filter_groups][0][filters][0][value]=sku-1%2Csku-2&' +
    'searchCriteria[filter_groups][0][filters][0][condition_type]=in';

function createRestClient(requestedUrls) {
    return {
        get: function (url) {
            if (url === '/customers/me') {
                return Promise.resolve({ id: 42 });
            }

            requestedUrls.push(url);
            return Promise.resolve({});
        }
    };
}

function assertNoEmptySearchCriteria(url) {
    var params = url.split('?')[1].split('&');

    assert.ok(params.indexOf('searchCriteria=') === -1, 'empty searchCriteria parameter in ' + url);
    assert.ok(params.indexOf('') === -1, 'empty query parameter in ' + url);
}

suite('search criteria query', function () {
    test('sends bracketed criteria without an empty searchCriteria parameter', function () {
        assert.strictEqual(
            buildSearchCriteriaQuery('&searchCriteria[pageSize]=5'),
            'searchCriteria[pageSize]=5'
        );
        assert.strictEqual(
            buildSearchCriteriaQuery('searchCriteria[pageSize]=5'),
            'searchCriteria[pageSize]=5'
        );
    });

    test('keeps other criteria as the searchCriteria value', function () {
        assert.strictEqual(buildSearchCriteriaQuery(''), 'searchCriteria=');
        assert.strictEqual(buildSearchCriteriaQuery('Test'), 'searchCriteria=Test');
    });

    test('order history request has no empty searchCriteria parameter', function () {
        var urls = [];

        return customers(createRestClient(urls)).orderHistory('token', 5, 2).then(function () {
            assert.strictEqual(urls[0],
                '/orders?searchCriteria[filterGroups][0][filters][0][field]=customer_id&' +
                'searchCriteria[filterGroups][0][filters][0][value]=42&' +
                'searchCriteria[filterGroups][0][filters][0][condition_type]=eq&' +
                'searchCriteria[pageSize]=5&searchCriteria[currentPage]=2&' +
                'searchCriteria[sortOrders][0][field]=entity_id&searchCriteria[sortOrders][0][direction]=desc');
            assertNoEmptySearchCriteria(urls[0]);
        });
    });

    test('list requests have no empty searchCriteria parameter', function () {
        var urls = [];
        var restClient = createRestClient(urls);
        var criteria = SKU_CRITERIA.substring(1);

        return Promise.all([
            products(restClient).list(SKU_CRITERIA),
            products(restClient).renderList(SKU_CRITERIA, 'USD', 3),
            taxRules(restClient).list(SKU_CRITERIA),
            attributes(restClient).list(SKU_CRITERIA),
            reviews(restClient).list(SKU_CRITERIA)
        ]).then(function () {
            assert.deepStrictEqual(urls, [
                '/products?' + criteria,
                '/products-render-info?' + criteria + '&storeId=3&currencyCode=USD',
                '/taxRules/search?' + criteria,
                '/products/attributes?' + criteria,
                '/reviews/?' + criteria
            ]);
            urls.forEach(assertNoEmptySearchCriteria);
        });
    });
});
