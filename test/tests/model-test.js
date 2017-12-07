"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utility_1 = require("../../source/utility");
require('source-map-support').install();
var chai_1 = require("chai");
var schema_1 = require("../../source/schema");
var source_1 = require("../../source");
var bignumber_js_1 = require("bignumber.js");
var config = require('../config/config.json');
var mainWorld, dangerousTag, flyingTag;
var contexts = [
    {
        name: 'Sequelize',
        client: new source_1.SequelizeClient(config.database),
    }
];
// createSuite('Sequelize', new SequelizeClient(config.database))
// createSuite('Postgres', new PostgresClient(config.database))
// for (let i = 0; i < contexts.length; ++i) {
var _a = contexts[0], name = _a.name, client = _a.client;
describe('Sequelize Test', function () {
    this.timeout(5000);
    describe('Game Test', function () {
        var model;
        before(function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, initializeModel(client, 'game')];
                        case 1:
                            model = _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('game', function () {
            return __awaiter(this, void 0, void 0, function () {
                var heroicTag, ogre, creature, world, hero, hero2, rawHero;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, model.Tag.create({
                                name: "flying"
                            })];
                        case 1:
                            flyingTag = _a.sent();
                            return [4 /*yield*/, model.Tag.create({
                                    name: "heroic"
                                })];
                        case 2:
                            heroicTag = _a.sent();
                            return [4 /*yield*/, model.World.create({})];
                        case 3:
                            mainWorld = _a.sent();
                            return [4 /*yield*/, model.Creature.create({
                                    name: "ogre",
                                    world: mainWorld,
                                    health: 5
                                })];
                        case 4:
                            ogre = _a.sent();
                            return [4 /*yield*/, model.Tag.create({
                                    name: "dangerous"
                                })];
                        case 5:
                            dangerousTag = _a.sent();
                            return [4 /*yield*/, model.Creature.update(ogre, {
                                    health: 10,
                                    tags: source_1.Add(dangerousTag)
                                })];
                        case 6:
                            creature = _a.sent();
                            chai_1.assert.equal(creature.health, 10);
                            return [4 /*yield*/, model.Creature.first().expand('tags')];
                        case 7:
                            creature = _a.sent();
                            chai_1.assert(Array.isArray(creature.tags));
                            chai_1.assert.equal(1, creature.tags.length);
                            chai_1.assert.equal('dangerous', creature.tags[0].name);
                            return [4 /*yield*/, model.Creature.update(ogre, {
                                    tags: source_1.Remove(dangerousTag)
                                })];
                        case 8:
                            _a.sent();
                            return [4 /*yield*/, model.Creature.first().expand('tags')];
                        case 9:
                            creature = _a.sent();
                            chai_1.assert(Array.isArray(creature.tags));
                            chai_1.assert.equal(0, creature.tags.length);
                            return [4 /*yield*/, model.Creature.create({
                                    name: "hero",
                                    world: mainWorld,
                                    health: 4,
                                    tags: [source_1.Add(flyingTag), heroicTag]
                                })];
                        case 10:
                            _a.sent();
                            return [4 /*yield*/, model.World.first().expand('creatures')];
                        case 11:
                            world = _a.sent();
                            chai_1.assert(Array.isArray(world.creatures));
                            chai_1.assert.equal(2, world.creatures.length);
                            return [4 /*yield*/, model.Creature.first({ name: "hero" }).expand('tags')];
                        case 12:
                            hero = _a.sent();
                            chai_1.assert.equal(hero.tags.length, 2);
                            return [4 /*yield*/, model.Creature.remove(hero)];
                        case 13:
                            _a.sent();
                            return [4 /*yield*/, model.Creature.first({ name: "hero" })];
                        case 14:
                            hero2 = _a.sent();
                            chai_1.assert.isNull(hero2);
                            return [4 /*yield*/, model.ground.querySingle("SELECT * FROM creatures WHERE name = 'hero'")];
                        case 15:
                            rawHero = _a.sent();
                            chai_1.assert.equal(rawHero.name, 'hero');
                            chai_1.assert(rawHero.deleted instanceof Date);
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe('Arbitrary Test', function () {
        var model;
        before(function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, initializeModel(client, 'arbitrary')];
                        case 1:
                            model = _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('arbitrary general', function () {
            return __awaiter(this, void 0, void 0, function () {
                var original, results, records;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, model.OddRecord.create({
                                strange: 10,
                                unknown: "mist",
                                vast: "1000000000000000000000000000021",
                                sampleDate: new Date("June 15, 2016"),
                                sampleDatetime: new Date("2017-10-23T18:24:05.026Z"),
                                veryBig: new bignumber_js_1.BigNumber("1023.1334"),
                                data: {
                                    frogs: [
                                        { name: "Froggy" },
                                        { name: "Pac Frog" }
                                    ]
                                }
                            })];
                        case 1:
                            original = _a.sent();
                            return [4 /*yield*/, model.OddRecord.create({
                                    strange: 11,
                                    unknown: "mist2",
                                    vast: new bignumber_js_1.BigNumber("1000000000000000000000000000021"),
                                    sampleDate: new Date("August 3, 2002"),
                                    sampleDatetime: new Date("2017-10-23T18:24:05.026Z"),
                                    veryBig: "819715.15157",
                                    data: {
                                        "nothing": null
                                    }
                                })];
                        case 2:
                            _a.sent();
                            chai_1.assert(original.vast.isBigNumber);
                            return [4 /*yield*/, model.OddRecord.all()];
                        case 3:
                            results = _a.sent();
                            console.log('result', results);
                            chai_1.assert(new bignumber_js_1.BigNumber(results[0].vast).equals(results[1].vast));
                            chai_1.assert(results[0].sampleDate instanceof Date);
                            chai_1.assert.equal(results[0].data.frogs.length, 2);
                            chai_1.assert(results[0].sampleDatetime instanceof Date);
                            chai_1.assert.equal(results[0].sampleDatetime.toISOString(), "2017-10-23T18:24:05.026Z");
                            chai_1.assert(results[0].veryBig instanceof bignumber_js_1.BigNumber);
                            chai_1.assert(results[1].veryBig instanceof bignumber_js_1.BigNumber);
                            chai_1.assert(results[0].veryBig.equals("1023.1334"));
                            chai_1.assert(results[1].veryBig.equals("819715.15157"));
                            return [4 /*yield*/, model.ground.query("SELECT * FROM odd_records")];
                        case 4:
                            records = _a.sent();
                            chai_1.expect(records).lengthOf(2);
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('Supports custom table names', function () {
            return __awaiter(this, void 0, void 0, function () {
                var record;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, model.RenamedRecord.create({
                                unknown: 16,
                            })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, model.ground.querySingle("SELECT * FROM mysteries")];
                        case 2:
                            record = _a.sent();
                            chai_1.expect(record.unknown).equal(16);
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
});
describe('Simple unit tests', function () {
    it('camelCase to snake_case', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                chai_1.assert.equal(utility_1.to_lower_snake_case('first'), 'first');
                chai_1.assert.equal(utility_1.to_lower_snake_case('firstSecond'), 'first_second');
                chai_1.assert.equal(utility_1.to_lower_snake_case('firstIP'), 'first_ip');
                chai_1.assert.equal(utility_1.to_lower_snake_case('FirstSecond'), 'first_second');
                return [2 /*return*/];
            });
        });
    });
});
// }
function initializeModel(client, schemaName) {
    return __awaiter(this, void 0, void 0, function () {
        var schema, modeler, model;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    schema = new schema_1.Schema(require('../schema/' + schemaName + '.json'));
                    modeler = new source_1.DevModeler(schema, client);
                    model = modeler.collections;
                    model.ground = modeler;
                    return [4 /*yield*/, modeler.regenerate()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, model];
            }
        });
    });
}
//# sourceMappingURL=model-test.js.map