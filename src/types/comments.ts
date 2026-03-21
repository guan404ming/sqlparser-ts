/** A source code comment extracted from parsed SQL */
export interface SourceComment {
  /** "singleLine" for -- comments, "multiLine" for block comments */
  commentType: 'singleLine' | 'multiLine'
  /** The comment text content (excluding markers) */
  content: string
  /** For single-line comments, the prefix (e.g. "--", "#") */
  prefix?: string
  /** Start line (1-based) */
  startLine: number
  /** Start column (1-based) */
  startColumn: number
  /** End line (1-based) */
  endLine: number
  /** End column (1-based) */
  endColumn: number
}

/** Result of parsing SQL with comments */
export interface ParseWithCommentsResult<T> {
  statements: T[]
  comments: SourceComment[]
}
