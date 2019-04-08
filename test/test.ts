import { expect } from 'chai'
import 'mocha'

/*tslint:disable*/
const fixtureJson = require('./fixture.json')
const outputJson = require('./out/api_data.json')
/*tslint:enable*/

describe('Apidoc TS Plugin', () => {
  it('Should include TS info in compiled api docs', () => {
    expect(outputJson).to.deep.equal(fixtureJson)
  })
})
