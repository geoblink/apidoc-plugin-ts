interface SquareConfig {
  color: string
  width: number
}

interface SquareConfigsInterface {
  squares: Array<SquareConfig>
}

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterface {SquareConfigsInterface}
 * @apiGroup arrayGenericsTest
 */

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterface {SquareConfig[]}
 * @apiGroup arrayAsInterface
 */

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterface {Array<SquareConfig>}
 * @apiGroup arrayGenericsTest
 */
