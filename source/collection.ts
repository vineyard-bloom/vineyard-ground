import {Trellis} from 'vineyard-schema'

export class Collection {
  trellis: Trellis
  sequelize_model

  constructor(trellis: Trellis, sequelize_model) {
    this.trellis = trellis
    this.sequelize_model = sequelize_model
  }

  create(seed): Promise<any> {
    const new_seed = Object.assign({}, seed)
    for (let i in new_seed) {
      const value = new_seed[i]
      if (typeof value === 'object' && value.id) {
        new_seed [i] = value.id
      }
    }

    return this.sequelize_model.create(new_seed)
      .then(result => {
        new_seed[this.trellis.primary_key.name = result.get(this.trellis.primary_key.name)
        return new_seed
      })
  }
}
