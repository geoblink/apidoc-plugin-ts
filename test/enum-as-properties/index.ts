enum Color {
  Red = 'red',
  Blue = 'blue'
}

interface SquareEnumConfig {
  color: Color
  width: number
}

interface SquareEnumConfigsInterface {
  squares: SquareEnumConfig[]
}

interface EnumInterface {
  color: Color
}

/**
 * @api {get} /api/:id
 * @apiParam {SquareEnumConfig} id Unique ID.
 * @apiInterface {SquareEnumConfigsInterface}
 * @apiGroup enumAsProperties
 */

/**
 * @api {get} /api/:id
 * @apiParam {SquareEnumConfig} id Unique ID.
 * @apiInterface {EnumInterface}
 * @apiGroup enumAsProperties
 */
