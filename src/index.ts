import * as ts from 'typescript'
import Ast, { InterfaceDeclaration, PropertySignature, Symbol, SourceFile } from 'ts-morph'

export const APIDOC_PLUGIN_TS_CUSTOM_ELEMENT_NAME = 'apiinterface'

const definitionFilesAddedByUser = {}

namespace Apidoc {
  export enum AvailableHook {
    'parser-find-elements' = 'parser-find-elements'
  }

  export interface App {
    addHook (name: AvailableHook, func: Function, priority?: number)
  }

  export interface Element {
    source: string
    name: string
    sourceName: string
    content: string
  }

  export type ParserFindElementsHookCallback = (
    elements: Element[],
    element: Element,
    block: string,
    filename: string
  ) => void
}

const ast = new Ast()

/**
 * Initialise plugin (add app hooks)
 * @param app
 */
export function init (app: Apidoc.App) {
  app.addHook(Apidoc.AvailableHook['parser-find-elements'], parseElements.bind(app), 200)
}

/**
 * Parse elements
 * @param elements
 * @param element
 * @param block
 * @param filename
 */
function parseElements (elements: Apidoc.Element[], element: Apidoc.Element, block: string, filename: string) {
  // We only want to do things with the instance of our custom element.
  if (element.name !== APIDOC_PLUGIN_TS_CUSTOM_ELEMENT_NAME) return

  // Remove the element
  elements.pop()

  // Create array of new elements
  const newElements: ApidocsElement[] = []

  // Get object values
  const values = parse(element.content)

  // Only if there are values...
  if (!values) {
    this.log.warn(`Could not find parse values of element: ${element.content}`)
    return
  }

  // The interface we are looking for
  const namedInterface = values.interface.trim()

  // Get the file path to the interface
  const interfacePath = values.path ? values.path.trim() : filename

  // Does the interface exist in current file?
  const matchedInterface = getInterface(interfacePath, namedInterface)

  // If interface is not found, log error
  if (!matchedInterface) {
    // throw new Error(`Could not find interface «${namedInterface}» in file «${interfacePath}»`)

    this.log.warn(`Could not find interface «${namedInterface}» in file «${interfacePath}»`)
    return
  }

  // Match elements of current interface
  setInterfaceElements.call(this, matchedInterface, interfacePath, newElements, values)

  // Push new elements into existing elements
  elements.push(...newElements)
}

interface ParseResult {
  element: string
  interface: string
  path: string
}

/**
 * Parse element content
 * @param content
 */
function parse (content: string): ParseResult | null {
  if (content.length === 0) return null

  const parseRegExp = /^(?:\((.+?)\)){0,1}\s*\{(.+?)\}\s*(?:(.+))?/g
  const matches = parseRegExp.exec(content)

  if (!matches) return null

  return {
    element: matches[3] || 'apiSuccess',
    interface: matches[2],
    path: matches[1]
  }
}

/**
 *
 * @param properties
 * @param filename
 * @param new_elements
 * @param values
 * @param inttype
 */
function setInterfaceElements (
  matchedInterface: InterfaceDeclaration,
  filename: string,
  newElements: ApidocsElement[],
  values: ParseResult,
  inttype?: string
) {
  // If this is an extended interface
  extendInterface.call(this, matchedInterface, filename, newElements, values, inttype)

  // Iterate over interface properties
  matchedInterface.getProperties().forEach((prop: PropertySignature) => {
    // Set param type definition and description
    const typeDef = inttype ? `${inttype}.${prop.getName()}` : prop.getName()
    const documentationComments = prop.getJsDocs().map((node) => node.getInnerText()).join()
    const description = documentationComments
      ? `\`${typeDef}\` - ${documentationComments}`
      : `\`${typeDef}\``

    // Set property type as a string
    const propType = prop.getType().getText()

    // Determine if the type is an object
    const propTypeIsObject = !isNativeType(propType)

    // If type is an object change label
    const isArray = propTypeIsObject && propType.includes('[]')
    const propLabel = propTypeIsObject
      ? `Object${isArray ? '[]' : ''}`
      : getCapitalized(propType)

    // Set the element
    newElements.push(getApiSuccessElement(`{${propLabel}} ${typeDef} ${description}`))

    // If property is an object or interface then we need to also display the objects properties
    if (propTypeIsObject) {
      // First determine if the object is an available interface
      const typeInterface = getInterface(filename, propType.replace('[]', ''))

      const arrayType = isArray && prop.getType().getArrayType()
      const objectProperties = arrayType
        ? arrayType.getProperties()
        : prop.getType().getProperties()

      if (typeInterface) {
        setInterfaceElements.call(this, typeInterface, filename, newElements, values, typeDef)
      } else {
        setObjectElements.call(this, objectProperties, filename, newElements, values, typeDef)
      }
    }
  })
}

/**
 * Set element if type object
 */
function setObjectElements<NodeType extends ts.Node = ts.Node> (
  properties: Symbol[],
  filename: string,
  newElements: ApidocsElement[],
  values: ParseResult,
  typeDef: string
) {
  properties.forEach((property) => {
    const valueDeclaration = property.getValueDeclaration()
    if (!valueDeclaration) return

    const propName = property.getName()
    const typeDefLabel = `${typeDef}.${propName}`
    const propType = valueDeclaration.getType().getText(valueDeclaration)

    const isUserDefinedProperty = isUserDefinedSymbol(property.compilerSymbol)
    if (!isUserDefinedProperty) return // We don't want to include default members in the docs

    const documentationComments = property.compilerSymbol.getDocumentationComment(undefined).map((node) => node.text).join()

    const desc = documentationComments
      ? `\`${typeDef}.${propName}\` - ${documentationComments}`
      : `\`${typeDef}.${propName}\``

    // Nothing to do if prop is of native type
    if (isNativeType(propType)) {
      newElements.push(getApiSuccessElement(`{${getCapitalized(propType)}} ${typeDefLabel} ${desc}`))
      return
    }

    const newElement = getApiSuccessElement(`{Object${propType.includes('[]') ? '[]' : ''}} ${typeDefLabel} ${desc}`)
    newElements.push(newElement)

    // If property is an object or interface then we need to also display the objects properties
    const typeInterface = getInterface(filename, propType)

    if (typeInterface) {
      setInterfaceElements.call(this, typeInterface, filename, newElements, values, typeDefLabel)
    } else {

      const externalFileTypeSymbol = valueDeclaration.getType().getSymbol()
      if (!externalFileTypeSymbol) {
        setObjectElements.call(
          this,
          property.getValueDeclarationOrThrow().getType().getProperties(),
          filename,
          newElements,
          values,
          typeDef
        )
        return
      }

      const externalFileDeclaration = externalFileTypeSymbol.getDeclarations()[0]
      const externalFileInterface = externalFileDeclaration.getSourceFile().getInterface(propType)

      if (!externalFileInterface) {
        setObjectElements.call(
          this,
          property.getValueDeclarationOrThrow().getType().getProperties(),
          filename,
          newElements,
          values,
          typeDefLabel
        )
        return
      }

      setObjectElements.call(
        this,
        externalFileInterface.getType().getProperties(),
        filename,
        newElements,
        values,
        typeDefLabel
      )
    }
  })
}

/**
 * Extends the current interface
 * @param matchedInterface
 * @param interfacePath
 * @param newElements
 * @param values
 */
function extendInterface (
  matchedInterface: InterfaceDeclaration,
  interfacePath: string,
  newElements: ApidocsElement[],
  values: ParseResult,
  inttype?: string
) {
  const extendedInterface = matchedInterface.getExtends()[0]
  if (!extendedInterface) return

  const extendedInterfaceName = extendedInterface.compilerNode.expression.getText()
  const matchedExtendedInterface = getInterface(interfacePath, extendedInterfaceName)

  if (!matchedExtendedInterface) {
    this.log.warn(`Could not find interface to be extended ${extendedInterfaceName}`)
    return
  }

  extendInterface.call(this, matchedExtendedInterface, interfacePath, newElements, values)
  setInterfaceElements.call(this, matchedExtendedInterface, interfacePath, newElements, values, inttype)
}

interface ApidocsElement {
  content: string
  name: string
  source: string
  sourceName: string
}

function getApiSuccessElement (param: string | number): ApidocsElement {
  return {
    content: `${param}\n`,
    name: 'apisuccess',
    source: `@apiSuccess ${param}\n`,
    sourceName: 'apiSuccess'
  }
}

function getInterface (interfacePath: string, interfaceName: string): InterfaceDeclaration | undefined {
  const interfaceFile = ast.addExistingSourceFile(interfacePath)
  if (!interfaceFile) return

  trackUserAddedDefinitionFile(interfaceFile)
  for (const file of ast.resolveSourceFileDependencies()) {
    trackUserAddedDefinitionFile(file)
  }

  return interfaceFile.getInterface(interfaceName)
}

function trackUserAddedDefinitionFile (file: SourceFile) {
  definitionFilesAddedByUser[file.getFilePath()] = true
}

function getCapitalized (text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

function isNativeType (propType: string): boolean {
  const nativeTypes = ['boolean', 'string', 'number', 'Date', 'any']
  return nativeTypes.indexOf(propType) >= 0
}

function isUserDefinedSymbol (symbol: ts.Symbol): boolean {
  const declarationFile = symbol.valueDeclaration.parent.getSourceFile()
  return definitionFilesAddedByUser[declarationFile.fileName]
}
