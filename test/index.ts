interface SquareConfig {
  color: string
  width: number
}

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterface {SquareConfig}
 * @apiGroup localInterfaceTest
 */
export function localInterfaceTest (): SquareConfig {
  return { color: 'red', width: 20 }
}

/**
 * @api {get} /api/:id
 * @apiParam {Number} id Unique ID.
 * @apiInterface (./test/interfaces.ts) { InnerSquare }
 * @apiGroup extendInterfaceTest
 */
export function extendInterfaceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {Number} id Unique ID.
 * @apiInterface (./test/interfaces.ts) { Employer }
 * @apiGroup importedInterfaceTest
 */
export function importedInterfaceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {Number} id Unique ID.
 * @apiInterface (./test/interfaces.ts) { TeamPicks }
 * @apiGroup deepExtendsInterfaceTest
 */
export function deepExtendsInterfaceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {Number} id Unique ID.
 * @apiInterface (./test/interfaces.ts) { SearchResult }
 * @apiGroup deepExternalInterfaceTest
 */
export function deepExternalInterfaceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {Number} id Unique ID.
 * @apiInterface (./test/interfaces.ts) {ShapedSkill}
 * @apiGroup multipleInheritanceTest
 */
export function multipleInheritanceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {Number} id Unique ID.
 * @apiInterface (./test/interfaces.ts) {CustomNamespace.ComposedInterface}
 * @apiGroup namespacedInterfaceTest
 */
export function namespacedInterfaceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {Number} id Unique ID.
 * @apiInterface {X}
 * @apiGroup notFoundTest
 */
export function notFoundTest () {
  return false
}
