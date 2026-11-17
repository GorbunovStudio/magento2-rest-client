var util = require('util');
var buildSearchCriteriaQuery = require('./search_criteria').buildSearchCriteriaQuery;

module.exports = function (restClient) {
    var module = {};

    module.list = function (searchCriteria) {
        var query = buildSearchCriteriaQuery(searchCriteria);
        var endpointUrl = util.format('/products/attributes?%s', query);
        return restClient.get(endpointUrl);
    }
    
    module.create = function (categoryAttributes) {
        return restClient.post('/products/attributes', categoryAttributes);
    }

    module.update = function (attributeId, categoryAttributes) {
        var endpointUrl = util.format('/products/attributes/%d', attributeId);
        return restClient.put(endpointUrl, categoryAttributes);
    }

    module.delete = function (attributeId) {
        var endpointUrl = util.format('/products/attributes/%d', attributeId);
        return restClient.delete(endpointUrl);
    }

    return module;
}
