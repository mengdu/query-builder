import SqlString from 'sqlstring'

export function escapeId (value: string, dotQualifier?: boolean) : string {
  return SqlString.escapeId(value, dotQualifier)
}

export function escape (value: string): string {
  return SqlString.escape(value)
}

export function format (sql: string, args: { [key: string]: any } | Array<string | string>): string {
  return sql.replace(/\:(\w+)/g, function (txt: string, key: string | number) {
    if (args.hasOwnProperty(key)) {
      // return SqlString.escape(args[key])
    }
    return txt
  })
}

export function raw (sql: string): { toSqlString: () => string } {
  return SqlString.raw(sql)
}

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
