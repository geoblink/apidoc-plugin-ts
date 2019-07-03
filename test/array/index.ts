interface SquareConfig {
  color: string
  width: number
}

type SquareConfigsType = SquareConfig[]
interface SquareConfigsInterface {
  squares: SquareConfig[]
}
interface SquareConfigsGenericsInterface {
  squares: Array<SquareConfig>
}

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterface {SquareConfigsType}
 * @apiGroup arrayAsType
 */

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterface {SquareConfigsInterface}
 * @apiGroup arrayAsInterface
 */

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterface {Array<SquareConfig>}
 * @apiGroup arrayGenericsTest
 */

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterface {SquareConfig[]}
 * @apiGroup arrayNotGenericsTest
 */

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterface {SquareConfig}
 * @apiGroup singleObjectTest
 */
