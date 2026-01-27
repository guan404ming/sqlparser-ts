/**
 * TypeScript type definitions for sqlparser-ts AST
 *
 * These types mirror the Rust AST structure from the sqlparser crate.
 * The AST is serialized as JSON from Rust, so these types represent
 * the JSON structure.
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * An identifier (table name, column name, etc.)
 */
export interface Ident {
  value: string;
  quoteStyle?: string | null;
}

/**
 * A compound identifier like schema.table.column
 */
export type ObjectName = Ident[];

// =============================================================================
// Expressions
// =============================================================================

/**
 * Binary operators
 */
export type BinaryOperator =
  | 'Plus'
  | 'Minus'
  | 'Multiply'
  | 'Divide'
  | 'Modulo'
  | 'StringConcat'
  | 'Gt'
  | 'Lt'
  | 'GtEq'
  | 'LtEq'
  | 'Spaceship'
  | 'Eq'
  | 'NotEq'
  | 'And'
  | 'Or'
  | 'Xor'
  | 'BitwiseOr'
  | 'BitwiseAnd'
  | 'BitwiseXor'
  | 'PGBitwiseXor'
  | 'PGBitwiseShiftLeft'
  | 'PGBitwiseShiftRight'
  | 'PGRegexMatch'
  | 'PGRegexIMatch'
  | 'PGRegexNotMatch'
  | 'PGRegexNotIMatch';

/**
 * Unary operators
 */
export type UnaryOperator = 'Plus' | 'Minus' | 'Not' | 'PGBitwiseNot' | 'PGSquareRoot' | 'PGCubeRoot' | 'PGPostfixFactorial' | 'PGPrefixFactorial' | 'PGAbs';

/**
 * SQL Value types
 */
export type Value =
  | { Number: [string, boolean] }
  | { SingleQuotedString: string }
  | { DoubleQuotedString: string }
  | { DollarQuotedString: { value: string; tag?: string } }
  | { EscapedStringLiteral: string }
  | { NationalStringLiteral: string }
  | { HexStringLiteral: string }
  | { Boolean: boolean }
  | { Null: null }
  | { Placeholder: string };

/**
 * SQL Expression
 */
export type Expr =
  | { Identifier: Ident }
  | { CompoundIdentifier: Ident[] }
  | { Value: Value }
  | { BinaryOp: { left: Expr; op: BinaryOperator; right: Expr } }
  | { UnaryOp: { op: UnaryOperator; expr: Expr } }
  | { Nested: Expr }
  | { IsNull: Expr }
  | { IsNotNull: Expr }
  | { IsTrue: Expr }
  | { IsFalse: Expr }
  | { IsUnknown: Expr }
  | { IsNotTrue: Expr }
  | { IsNotFalse: Expr }
  | { IsNotUnknown: Expr }
  | { InList: { expr: Expr; list: Expr[]; negated: boolean } }
  | { InSubquery: { expr: Expr; subquery: Query; negated: boolean } }
  | { Between: { expr: Expr; negated: boolean; low: Expr; high: Expr } }
  | { Like: { expr: Expr; negated: boolean; pattern: Expr; escapeChar?: string } }
  | { ILike: { expr: Expr; negated: boolean; pattern: Expr; escapeChar?: string } }
  | { SimilarTo: { expr: Expr; negated: boolean; pattern: Expr; escapeChar?: string } }
  | { Case: { operand?: Expr; conditions: Expr[]; results: Expr[]; elseResult?: Expr } }
  | { Cast: { expr: Expr; dataType: DataType } }
  | { TryCast: { expr: Expr; dataType: DataType } }
  | { SafeCast: { expr: Expr; dataType: DataType } }
  | { Extract: { field: DateTimeField; expr: Expr } }
  | { Substring: { expr: Expr; substringFrom?: Expr; substringFor?: Expr } }
  | { Trim: { expr: Expr; trimWhere?: TrimWhereField; trimWhat?: Expr } }
  | { Collate: { expr: Expr; collation: ObjectName } }
  | { Function: FunctionExpr }
  | { Subquery: Query }
  | { Exists: { subquery: Query; negated: boolean } }
  | { Wildcard: null }
  | { QualifiedWildcard: ObjectName }
  | { Tuple: Expr[] }
  | { Array: { elem: Expr[]; named: boolean } }
  | { MapAccess: { column: Expr; keys: Expr[] } }
  | { CompositeAccess: { expr: Expr; key: Ident } }
  | { TypedString: { dataType: DataType; value: string } }
  | { AtTimeZone: { timestamp: Expr; timeZone: string } }
  | { Interval: IntervalExpr }
  | 'Wildcard';

/**
 * Function expression
 */
export interface FunctionExpr {
  name: ObjectName;
  args: FunctionArg[];
  over?: WindowSpec;
  distinct: boolean;
  special: boolean;
  orderBy: OrderByExpr[];
}

/**
 * Function argument
 */
export type FunctionArg =
  | { Unnamed: FunctionArgExpr }
  | { Named: { name: Ident; arg: FunctionArgExpr } };

export type FunctionArgExpr = { Expr: Expr } | { QualifiedWildcard: ObjectName } | 'Wildcard';

/**
 * Interval expression
 */
export interface IntervalExpr {
  value: Expr;
  leadingField?: DateTimeField;
  leadingPrecision?: number;
  lastField?: DateTimeField;
  fractionalSecondsPrecision?: number;
}

/**
 * Date/time field for EXTRACT
 */
export type DateTimeField =
  | 'Year'
  | 'Month'
  | 'Week'
  | 'Day'
  | 'Hour'
  | 'Minute'
  | 'Second'
  | 'Millisecond'
  | 'Microsecond'
  | 'Nanosecond'
  | 'Century'
  | 'Decade'
  | 'Dow'
  | 'Doy'
  | 'Epoch'
  | 'Isodow'
  | 'Isoyear'
  | 'Julian'
  | 'Quarter'
  | 'Timezone'
  | 'TimezoneHour'
  | 'TimezoneMinute';

/**
 * Trim where field
 */
export type TrimWhereField = 'Both' | 'Leading' | 'Trailing';

// =============================================================================
// Data Types
// =============================================================================

/**
 * SQL Data types
 */
export type DataType =
  | 'Boolean'
  | 'TinyInt'
  | 'SmallInt'
  | 'Int'
  | 'Integer'
  | 'BigInt'
  | { Float: number | null }
  | 'Real'
  | 'Double'
  | { Decimal: [number | null, number | null] }
  | { Numeric: [number | null, number | null] }
  | { Varchar: number | null }
  | { Char: number | null }
  | 'Text'
  | 'Uuid'
  | 'Date'
  | { Time: [number | null, boolean] }
  | { Timestamp: [number | null, boolean] }
  | 'Interval'
  | 'Binary'
  | { Varbinary: number | null }
  | 'Blob'
  | 'Bytes'
  | 'Json'
  | 'Jsonb'
  | { Array: DataType }
  | { Custom: [ObjectName, string[]] }
  | 'Regclass'
  | 'String';

// =============================================================================
// Query Components
// =============================================================================

/**
 * Window specification
 */
export interface WindowSpec {
  partitionBy: Expr[];
  orderBy: OrderByExpr[];
  windowFrame?: WindowFrame;
}

/**
 * Window frame
 */
export interface WindowFrame {
  units: WindowFrameUnits;
  startBound: WindowFrameBound;
  endBound?: WindowFrameBound;
}

export type WindowFrameUnits = 'Rows' | 'Range' | 'Groups';

export type WindowFrameBound =
  | 'CurrentRow'
  | 'UnboundedPreceding'
  | 'UnboundedFollowing'
  | { Preceding: Expr | null }
  | { Following: Expr | null };

/**
 * ORDER BY expression
 */
export interface OrderByExpr {
  expr: Expr;
  asc?: boolean;
  nullsFirst?: boolean;
}

/**
 * SELECT item
 */
export type SelectItem =
  | 'UnnamedExpr'
  | { UnnamedExpr: Expr }
  | { ExprWithAlias: { expr: Expr; alias: Ident } }
  | { QualifiedWildcard: [ObjectName, WildcardAdditionalOptions] }
  | { Wildcard: WildcardAdditionalOptions };

export interface WildcardAdditionalOptions {
  optExclude?: ExcludeSelectItem;
  optExcept?: ExceptSelectItem;
  optRename?: RenameSelectItem;
  optReplace?: ReplaceSelectItem;
}

export interface ExcludeSelectItem {
  items: Ident[];
}

export interface ExceptSelectItem {
  firstElement: Ident;
  additionalElements: Ident[];
}

export interface RenameSelectItem {
  items: IdentWithAlias[];
}

export interface ReplaceSelectItem {
  items: ReplaceSelectElement[];
}

export interface IdentWithAlias {
  ident: Ident;
  alias: Ident;
}

export interface ReplaceSelectElement {
  expr: Expr;
  columnName: Ident;
  asKeyword: boolean;
}

/**
 * FROM clause table reference
 */
export type TableFactor =
  | {
      Table: {
        name: ObjectName;
        alias?: TableAlias;
        args?: FunctionArg[];
        withHints: Expr[];
      };
    }
  | { Derived: { lateral: boolean; subquery: Query; alias?: TableAlias } }
  | { TableFunction: { expr: Expr; alias?: TableAlias } }
  | { NestedJoin: { tableWithJoins: TableWithJoins; alias?: TableAlias } }
  | { UNNEST: { alias?: TableAlias; arrayExprs: Expr[]; withOffset: boolean; withOffsetAlias?: Ident } };

/**
 * Table alias
 */
export interface TableAlias {
  name: Ident;
  columns: Ident[];
}

/**
 * Table with joins
 */
export interface TableWithJoins {
  relation: TableFactor;
  joins: Join[];
}

/**
 * JOIN clause
 */
export interface Join {
  relation: TableFactor;
  joinOperator: JoinOperator;
}

export type JoinOperator =
  | { Inner: JoinConstraint }
  | { LeftOuter: JoinConstraint }
  | { RightOuter: JoinConstraint }
  | { FullOuter: JoinConstraint }
  | 'CrossJoin'
  | { LeftSemi: JoinConstraint }
  | { RightSemi: JoinConstraint }
  | { LeftAnti: JoinConstraint }
  | { RightAnti: JoinConstraint }
  | 'CrossApply'
  | 'OuterApply';

export type JoinConstraint =
  | { On: Expr }
  | { Using: Ident[] }
  | 'Natural'
  | 'None';

/**
 * SELECT statement
 */
export interface Select {
  distinct?: Distinct;
  top?: Top;
  projection: SelectItem[];
  into?: SelectInto;
  from: TableWithJoins[];
  lateralViews: LateralView[];
  selection?: Expr;
  groupBy: GroupByExpr;
  clusterBy: Expr[];
  distributeBy: Expr[];
  sortBy: Expr[];
  having?: Expr;
  namedWindow: NamedWindowDefinition[];
  qualify?: Expr;
}

export type Distinct = boolean | { On: Expr[] };

export interface Top {
  withTies: boolean;
  percent: boolean;
  quantity?: Expr;
}

export interface SelectInto {
  temporary: boolean;
  unlogged: boolean;
  table: boolean;
  name: ObjectName;
}

export interface LateralView {
  lateralViewExpr: Expr;
  lateralViewName: ObjectName;
  lateralColAlias: Ident[];
  outer: boolean;
}

export type GroupByExpr = { Expressions: Expr[] } | 'All';

export interface NamedWindowDefinition {
  name: Ident;
  windowSpec: WindowSpec;
}

/**
 * Set expression (UNION, INTERSECT, EXCEPT)
 */
export type SetExpr =
  | { Select: Select }
  | { Query: Query }
  | {
      SetOperation: {
        op: SetOperator;
        setQuantifier: SetQuantifier;
        left: SetExpr;
        right: SetExpr;
      };
    }
  | { Values: Values }
  | { Insert: Statement };

export type SetOperator = 'Union' | 'Except' | 'Intersect';
export type SetQuantifier = 'All' | 'Distinct' | 'None';

export interface Values {
  explicit_row: boolean;
  rows: Expr[][];
}

/**
 * WITH clause (CTE)
 */
export interface With {
  recursive: boolean;
  cteTables: Cte[];
}

export interface Cte {
  alias: TableAlias;
  query: Query;
  from?: Ident;
}

/**
 * Query (top-level SELECT)
 */
export interface Query {
  with?: With;
  body: SetExpr;
  orderBy: OrderByExpr[];
  limit?: Expr;
  offset?: Offset;
  fetch?: Fetch;
  locks: LockClause[];
}

export interface Offset {
  value: Expr;
  rows: OffsetRows;
}

export type OffsetRows = 'None' | 'Row' | 'Rows';

export interface Fetch {
  withTies: boolean;
  percent: boolean;
  quantity?: Expr;
}

export interface LockClause {
  lockType: LockType;
  of?: ObjectName;
  nonblock?: NonBlock;
}

export type LockType = 'Share' | 'Update';
export type NonBlock = 'Wait' | 'Nowait' | 'SkipLocked';

// =============================================================================
// Statements
// =============================================================================

/**
 * Column definition for CREATE TABLE
 */
export interface ColumnDef {
  name: Ident;
  dataType: DataType;
  collation?: ObjectName;
  options: ColumnOptionDef[];
}

export interface ColumnOptionDef {
  name?: Ident;
  option: ColumnOption;
}

export type ColumnOption =
  | 'Null'
  | 'NotNull'
  | { Default: Expr }
  | { Unique: { isPrimary: boolean } }
  | { ForeignKey: ForeignKeyOption }
  | { Check: Expr }
  | 'AutoIncrement'
  | { OnUpdate: Expr }
  | { Generated: GeneratedAs }
  | { Comment: string };

export interface ForeignKeyOption {
  foreignTable: ObjectName;
  referredColumns: Ident[];
  onDelete?: ReferentialAction;
  onUpdate?: ReferentialAction;
}

export type ReferentialAction = 'Restrict' | 'Cascade' | 'SetNull' | 'NoAction' | 'SetDefault';

export interface GeneratedAs {
  generationType?: GeneratedExpressionMode;
  expr: Expr;
}

export type GeneratedExpressionMode = 'Virtual' | 'Stored';

/**
 * Table constraint
 */
export type TableConstraint =
  | { Unique: { name?: Ident; columns: Ident[]; isPrimary: boolean } }
  | { ForeignKey: { name?: Ident; columns: Ident[]; foreignTable: ObjectName; referredColumns: Ident[]; onDelete?: ReferentialAction; onUpdate?: ReferentialAction } }
  | { Check: { name?: Ident; expr: Expr } }
  | { Index: { displayAsKey: boolean; name?: Ident; indexType?: IndexType; columns: Ident[] } };

export type IndexType = 'BTree' | 'Hash';

/**
 * All SQL statement types
 */
export type Statement =
  | { Query: Query }
  | {
      Insert: {
        orConflict?: SqliteOnConflict;
        into: boolean;
        tableName: ObjectName;
        columns: Ident[];
        overwrite: boolean;
        source: Query;
        partitioned?: Expr[];
        afterColumns: Ident[];
        table: boolean;
        on?: OnInsert;
        returning?: SelectItem[];
      };
    }
  | {
      Update: {
        table: TableWithJoins;
        assignments: Assignment[];
        from?: TableWithJoins;
        selection?: Expr;
        returning?: SelectItem[];
      };
    }
  | {
      Delete: {
        tables: ObjectName[];
        from: TableWithJoins[];
        using?: TableWithJoins[];
        selection?: Expr;
        returning?: SelectItem[];
      };
    }
  | {
      CreateTable: {
        orReplace: boolean;
        temporary: boolean;
        external: boolean;
        global?: boolean;
        ifNotExists: boolean;
        transient: boolean;
        name: ObjectName;
        columns: ColumnDef[];
        constraints: TableConstraint[];
        hiveDistribution: HiveDistributionStyle;
        hiveFormats?: HiveFormat;
        tableProperties: SqlOption[];
        withOptions: SqlOption[];
        fileFormat?: FileFormat;
        location?: string;
        query?: Query;
        withoutRowid: boolean;
        like?: ObjectName;
        cloneClause?: ObjectName;
        engine?: string;
        defaultCharset?: string;
        collation?: string;
        onCommit?: OnCommit;
        onCluster?: string;
        orderBy?: Ident[];
        strict: boolean;
      };
    }
  | {
      CreateView: {
        orReplace: boolean;
        materialized: boolean;
        name: ObjectName;
        columns: Ident[];
        query: Query;
        withOptions: SqlOption[];
        clusterBy: Ident[];
      };
    }
  | {
      CreateIndex: {
        name?: ObjectName;
        tableName: ObjectName;
        using?: Ident;
        columns: OrderByExpr[];
        unique: boolean;
        concurrently: boolean;
        ifNotExists: boolean;
        include: Ident[];
        nullsDistinct?: boolean;
        predicate?: Expr;
      };
    }
  | {
      AlterTable: {
        name: ObjectName;
        ifExists: boolean;
        only: boolean;
        operations: AlterTableOperation[];
      };
    }
  | { Drop: DropStatement }
  | {
      Truncate: {
        tableName: ObjectName;
        partitions?: Expr[];
        table: boolean;
      };
    }
  | {
      SetVariable: {
        local: boolean;
        hivevar: boolean;
        variable: ObjectName;
        value: Expr[];
      };
    }
  | { ShowVariable: { variable: Ident[] } }
  | { ShowCreate: { objType: ShowCreateObject; objName: ObjectName } }
  | { ShowTables: { extended: boolean; full: boolean; dbName?: Ident; filter?: ShowStatementFilter } }
  | { ShowColumns: { extended: boolean; full: boolean; tableName: ObjectName; filter?: ShowStatementFilter } }
  | {
      StartTransaction: {
        modes: TransactionMode[];
        begin: boolean;
      };
    }
  | { Commit: { chain: boolean } }
  | { Rollback: { chain: boolean; savepoint?: Ident } }
  | { Savepoint: { name: Ident } }
  | { ReleaseSavepoint: { name: Ident } }
  | {
      CreateSchema: {
        schemaName: SchemaName;
        ifNotExists: boolean;
      };
    }
  | {
      CreateDatabase: {
        dbName: ObjectName;
        ifNotExists: boolean;
        location?: string;
        managedLocation?: string;
      };
    }
  | {
      Grant: {
        privileges: Privileges;
        objects: GrantObjects;
        grantees: Ident[];
        withGrantOption: boolean;
        grantedBy?: Ident;
      };
    }
  | {
      Revoke: {
        privileges: Privileges;
        objects: GrantObjects;
        grantees: Ident[];
        grantedBy?: Ident;
        cascade: boolean;
      };
    }
  | { Explain: { describeAlias: DescribeAlias; analyze: boolean; verbose: boolean; statement: Statement } }
  | {
      Copy: {
        source: CopySource;
        to: boolean;
        target: CopyTarget;
        options: CopyOption[];
        legacyOptions: CopyLegacyOption[];
        values: string[][];
      };
    }
  | { Close: { cursor: CloseCursor } }
  | { Declare: { name: Ident; binary: boolean; sensitive?: boolean; scroll?: boolean; hold?: boolean; query: Query } }
  | { Fetch: { name: Ident; direction: FetchDirection; into?: ObjectName } }
  | { Discard: { objectType: DiscardObject } }
  | 'ExplainTable'
  | { Analyze: { tableName: ObjectName; partitions?: Expr[]; forColumns: boolean; columns: Ident[]; cacheMetadata: boolean; noscan: boolean; computeStatistics: boolean } }
  | {
      Merge: {
        into: boolean;
        table: TableFactor;
        source: TableFactor;
        on: Expr;
        clauses: MergeClause[];
      };
    }
  | { Execute: { name: ObjectName; parameters: Expr[] } }
  | { Prepare: { name: Ident; dataTypes: DataType[]; statement: Statement } }
  | { Deallocate: { name: Ident; prepare: boolean } }
  | { Comment: { objectType: CommentObject; objectName: ObjectName; comment?: string; ifExists: boolean } }
  | { Assert: { condition: Expr; message?: Expr } }
  | 'Kill'
  | 'Use';

// Supporting types for statements
export type SqliteOnConflict = 'Rollback' | 'Abort' | 'Fail' | 'Ignore' | 'Replace';

export type OnInsert =
  | { DoUpdate: DoUpdate }
  | 'DoNothing';

export interface DoUpdate {
  assignments: Assignment[];
  selection?: Expr;
}

export interface Assignment {
  id: Ident[];
  value: Expr;
}

export type HiveDistributionStyle =
  | 'PARTITIONED'
  | 'CLUSTERED'
  | 'SKEWED'
  | 'NONE';

export interface HiveFormat {
  rowFormat?: HiveRowFormat;
  storage?: HiveIOFormat;
  location?: string;
}

export type HiveRowFormat =
  | { Serde: { class: string } }
  | { Delimited: null };

export interface HiveIOFormat {
  inputFormat: string;
  outputFormat: string;
}

export interface SqlOption {
  name: Ident;
  value: Value;
}

export type FileFormat =
  | 'TEXTFILE'
  | 'SEQUENCEFILE'
  | 'ORC'
  | 'PARQUET'
  | 'AVRO'
  | 'RCFILE'
  | 'JSONFILE';

export type OnCommit = 'DeleteRows' | 'PreserveRows' | 'Drop';

export type AlterTableOperation =
  | { AddConstraint: TableConstraint }
  | { AddColumn: { columnKeyword: boolean; ifNotExists: boolean; columnDef: ColumnDef } }
  | { DropConstraint: { ifExists: boolean; name: Ident; cascade: boolean } }
  | { DropColumn: { columnName: Ident; ifExists: boolean; cascade: boolean } }
  | { RenameColumn: { oldColumnName: Ident; newColumnName: Ident } }
  | { RenameTable: { tableName: ObjectName } }
  | { ChangeColumn: { oldName: Ident; newName: Ident; dataType: DataType; options: ColumnOption[] } }
  | { AlterColumn: { columnName: Ident; op: AlterColumnOperation } }
  | { RenameConstraint: { oldName: Ident; newName: Ident } };

export type AlterColumnOperation =
  | { SetNotNull: null }
  | { DropNotNull: null }
  | { SetDefault: Expr }
  | { DropDefault: null }
  | { SetDataType: DataType };

export interface DropStatement {
  objectType: ObjectType;
  ifExists: boolean;
  names: ObjectName[];
  cascade: boolean;
  restrict: boolean;
  purge: boolean;
}

export type ObjectType =
  | 'Table'
  | 'View'
  | 'Index'
  | 'Schema'
  | 'Role'
  | 'Sequence'
  | 'Stage';

export type ShowCreateObject = 'Event' | 'Function' | 'Procedure' | 'Table' | 'Trigger' | 'View';

export type ShowStatementFilter =
  | { Like: string }
  | { ILike: string }
  | { Where: Expr };

export type TransactionMode =
  | { AccessMode: TransactionAccessMode }
  | { IsolationLevel: TransactionIsolationLevel };

export type TransactionAccessMode = 'ReadOnly' | 'ReadWrite';

export type TransactionIsolationLevel =
  | 'ReadUncommitted'
  | 'ReadCommitted'
  | 'RepeatableRead'
  | 'Serializable';

export type SchemaName =
  | { Simple: ObjectName }
  | { UnnamedAuthorization: Ident }
  | { NamedAuthorization: [ObjectName, Ident] };

export type Privileges = { Actions: Action[] } | 'All';

export type Action =
  | 'Select'
  | { Select: Ident[] }
  | 'Insert'
  | { Insert: Ident[] }
  | 'Update'
  | { Update: Ident[] }
  | 'Delete'
  | 'Truncate'
  | 'References'
  | { References: Ident[] }
  | 'Trigger'
  | 'Connect'
  | 'Create'
  | 'Execute'
  | 'Temporary'
  | 'Usage';

export type GrantObjects =
  | { AllSequencesInSchema: ObjectName[] }
  | { AllTablesInSchema: ObjectName[] }
  | { Schemas: ObjectName[] }
  | { Sequences: ObjectName[] }
  | { Tables: ObjectName[] };

export type DescribeAlias = 'Describe' | 'Explain' | 'Desc';

export type CopySource = { Table: ObjectName; columns: Ident[] } | { Query: Query };

export type CopyTarget = { File: { filename: string } } | { Program: { command: string } } | 'Stdout' | 'Stdin';

export interface CopyOption {
  key: string;
  value?: string;
}

export interface CopyLegacyOption {
  key: string;
  value?: string;
}

export type CloseCursor = 'All' | { Specific: { name: Ident } };

export type FetchDirection =
  | { Count: Expr }
  | 'Next'
  | 'Prior'
  | 'First'
  | 'Last'
  | 'Absolute'
  | 'Relative'
  | { Absolute: Expr }
  | { Relative: Expr }
  | 'All'
  | 'Forward'
  | { Forward: Expr }
  | 'ForwardAll'
  | 'Backward'
  | { Backward: Expr }
  | 'BackwardAll';

export type DiscardObject = 'All' | 'Plans' | 'Sequences' | 'Temp';

export type MergeClause =
  | { MatchedUpdate: { predicate?: Expr; assignments: Assignment[] } }
  | { MatchedDelete: { predicate?: Expr } }
  | { NotMatched: { predicate?: Expr; columns: Ident[]; values: Values } };

export type CommentObject = 'Column' | 'Table';
