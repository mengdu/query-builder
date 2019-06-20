'use strict'
import { escape, escapeId } from './index'

export default {
  $gt: (val: any): string => `> ${escape(val)}`,
  $gte: (val: any): string => `>= ${escape(val)}`,
  $lt: (val: any): string => `< ${escape(val)}`,
  $lte: (val: any): string => `<= ${escape(val)}`,
  $eq: (val: any): string => `= ${escape(val)}`,
  $neq: (val: any): string => `!= ${escape(val)}`,
  $between: (arr: [any, any]): string => `between ${escape(arr[0])} and ${escape(arr[1])}`,
  $notBetween: (arr: [any, any]): string => `not between ${escape(arr[0])} and ${escape(arr[1])}`,
  $in: (arr: any[]): string => `in(${arr.map(e => escape(e)).join(',')})`,
  $notIn: (arr: any[]): string => `not in(${arr.map(e => escape(e)).join(',')})`,
  $like: (val: string): string => `like ${escape(val)}`,
  $notLike: (val: string): string => `not like ${escape(val)}`,
  $raw: (val: string): string => `= ${val}`,
  $id: (val: string): string => `= ${escapeId(val)}`
}
