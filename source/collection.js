"use strict";
var Collection = (function () {
    function Collection(trellis, sequelize_model) {
        this.trellis = trellis;
        this.sequelize_model = sequelize_model;
    }
    Collection.prototype.create = function (seed) {
        var _this = this;
        var new_seed = Object.assign({}, seed);
        for (var i in new_seed) {
            var value = new_seed[i];
            if (typeof value === 'object' && value.id) {
                new_seed[i] = value.id;
            }
        }
        return this.sequelize_model.create(new_seed)
            .then(function (result) {
            new_seed[_this.trellis.primary_key.name = result.get(_this.trellis.primary_key.name)];
            return new_seed;
        });
    };
    return Collection;
}());
exports.Collection = Collection;
//# sourceMappingURL=Collection.js.map