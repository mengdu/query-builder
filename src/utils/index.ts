import SqlString from 'sqlstring'

export function escapeId (value: string, dotQualifier?: boolean) : string {
  return SqlString.escapeId(value, dotQualifier)
}

export function escape (value: any): string {
  return SqlString.escape(value)
}

export function format (sql: string, args: { [ key: string  ]: any; [key: number]: any } | Array<any>): string {
  // Support :arg and :?arg placeholder
  const result = sql.replace(/\:\??(\w+)/g, function (txt: string, key: any) {
    if (args.hasOwnProperty(key)) {
      // :?arg use escapeId
      return txt.indexOf('?') > -1 ? escapeId(args[key]) : escape(args[key])
    }
    return txt
  })
  // Support ? placeholder
  return SqlString.format(result, args)
}

export function raw (sql: string): { toSqlString: () => string } {
  return SqlString.raw(sql)
}

// Remove the blanks at both ends of the string
export function trim (str: string): string {
  return str.replace(/^\s*|\s*$/g, '')
}

export function alias (field: string, aliasName: string, isRaw?: boolean): string {
  return (isRaw ? trim(field) : escapeId(trim(field))) + ' as ' + escapeId(trim(aliasName))
}

export function escapeField (value: string, isRaw?: boolean): string {
  const [field, aliasName] = value.split(/\s+as\s+/)
  return alias(field, aliasName, isRaw)
}

export function isArr (value: any): boolean {
  return Object.prototype.toString.call(value) === '[object Array]'
}