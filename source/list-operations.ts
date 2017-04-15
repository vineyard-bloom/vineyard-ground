export enum Operation_Type {
  add,
  clear,
  remove
}

export interface Operation {
  type: Operation_Type
  item?
}

export function Add(item): Operation {
  return {
    type: Operation_Type.add,
    item: item
  }
}

export function Clear(): Operation {
  return {
    type: Operation_Type.clear
  }
}

export function Remove(item): Operation {
  return {
    type: Operation_Type.remove,
    item: item
  }
}
