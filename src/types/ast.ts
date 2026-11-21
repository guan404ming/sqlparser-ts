export type AccessExpr =
  | { Dot: Expr }
  | { Subscript: Subscript };

export type Action =
  | 'AddSearchOptimization'
  | { Apply: { apply_type: ActionApplyType } }
  | 'ApplyBudget'
  | 'AttachListing'
  | 'AttachPolicy'
  | 'Audit'
  | 'BindServiceEndpoint'
  | 'Connect'
  | { Create: { obj_type?: ActionCreateObjectType } }
  | { DatabaseRole: { role: ObjectName } }
  | 'Delete'
  | 'Drop'
  | 'EvolveSchema'
  | { Exec: { obj_type?: ActionExecuteObjectType } }
  | { Execute: { obj_type?: ActionExecuteObjectType } }
  | 'Failover'
  | 'ImportedPrivileges'
  | 'ImportShare'
  | { Insert: { columns?: Ident[] } }
  | { Manage: { manage_type: ActionManageType } }
  | 'ManageReleases'
  | 'ManageVersions'
  | { Modify: { modify_type?: ActionModifyType } }
  | { Monitor: { monitor_type?: ActionMonitorType } }
  | 'Operate'
  | 'OverrideShareRestrictions'
  | 'Ownership'
  | 'PurchaseDataExchangeListing'
  | 'Read'
  | 'ReadSession'
  | { References: { columns?: Ident[] } }
  | 'Replicate'
  | 'ResolveAll'
  | { Role: { role: ObjectName } }
  | { Select: { columns?: Ident[] } }
  | 'Temporary'
  | 'Trigger'
  | 'Truncate'
  | { Update: { columns?: Ident[] } }
  | 'Usage';

export type ActionApplyType =
  | 'AggregationPolicy'
  | 'AuthenticationPolicy'
  | 'JoinPolicy'
  | 'MaskingPolicy'
  | 'PackagesPolicy'
  | 'PasswordPolicy'
  | 'ProjectionPolicy'
  | 'RowAccessPolicy'
  | 'SessionPolicy'
  | 'Tag';

export type ActionCreateObjectType =
  | 'Account'
  | 'Application'
  | 'ApplicationPackage'
  | 'ComputePool'
  | 'DataExchangeListing'
  | 'Database'
  | 'ExternalVolume'
  | 'FailoverGroup'
  | 'Integration'
  | 'NetworkPolicy'
  | 'OrganiationListing'
  | 'ReplicationGroup'
  | 'Role'
  | 'Schema'
  | 'Share'
  | 'User'
  | 'Warehouse';

export type ActionExecuteObjectType =
  | 'Alert'
  | 'DataMetricFunction'
  | 'ManagedAlert'
  | 'ManagedTask'
  | 'Task';

export type ActionManageType =
  | 'AccountSupportCases'
  | 'EventSharing'
  | 'Grants'
  | 'ListingAutoFulfillment'
  | 'OrganizationSupportCases'
  | 'UserSupportCases'
  | 'Warehouses';

export type ActionModifyType =
  | 'LogLevel'
  | 'TraceLevel'
  | 'SessionLogLevel'
  | 'SessionTraceLevel';

export type ActionMonitorType =
  | 'Execution'
  | 'Security'
  | 'Usage';

export type AddDropSync =
  | 'ADD'
  | 'DROP'
  | 'SYNC';

export type AfterMatchSkip =
  | 'PastLastRow'
  | 'ToNextRow'
  | { ToFirst: Ident }
  | { ToLast: Ident };

export type AggregateModifyKind =
  | 'ReadOnly'
  | 'Shareable'
  | 'ReadWrite';

export type Alignment =
  | 'Char'
  | 'Int2'
  | 'Int4'
  | 'Double';

export interface AlterCollation {
  name: ObjectName;
  operation: AlterCollationOperation;
}

export type AlterCollationOperation =
  | { RenameTo: { new_name: Ident } }
  | { OwnerTo: Owner }
  | { SetSchema: { schema_name: ObjectName } }
  | 'RefreshVersion';

export type AlterColumnOperation =
  | 'SetNotNull'
  | 'DropNotNull'
  | { SetDefault: { value: Expr } }
  | 'DropDefault'
  | { SetDataType: { data_type: DataType; using?: Expr; had_set: boolean } }
  | { AddGenerated: { generated_as?: GeneratedAs; sequence_options?: SequenceOptions[] } }
  | { GenericOptions: { options: AlterGenericOption[] } };

export type AlterConnectorOwner =
  | { User: Ident }
  | { Role: Ident };

export interface AlterDefaultPrivileges {
  options: DefaultPrivilegesOption[];
  operation: AlterDefaultPrivilegesOperation;
}

export type AlterDefaultPrivilegesOperation =
  | { Grant: { privileges: Privileges; object_type: DefaultPrivilegesObjectType; grantees: Grantee[]; with_grant_option: boolean } }
  | { Revoke: { grant_option_for: boolean; privileges: Privileges; object_type: DefaultPrivilegesObjectType; grantees: Grantee[]; cascade?: CascadeOption } };

export interface AlterFunction {
  kind: AlterFunctionKind;
  function: FunctionDesc;
  aggregate_order_by?: OperateFunctionArg[];
  aggregate_star: boolean;
  operation: AlterFunctionOperation;
}

export type AlterFunctionAction =
  | { CalledOnNull: FunctionCalledOnNull }
  | { Behavior: FunctionBehavior }
  | { Leakproof: boolean }
  | { Security: { external: boolean; security: FunctionSecurity } }
  | { Parallel: FunctionParallel }
  | { Cost: Expr }
  | { Rows: Expr }
  | { Support: ObjectName }
  | { Set: FunctionDefinitionSetParam }
  | { Reset: ResetConfig };

export type AlterFunctionKind =
  | 'Function'
  | 'Aggregate';

export type AlterFunctionOperation =
  | { RenameTo: { new_name: Ident } }
  | { OwnerTo: Owner }
  | { SetSchema: { schema_name: ObjectName } }
  | { DependsOnExtension: { no: boolean; extension_name: ObjectName } }
  | { Actions: { actions: AlterFunctionAction[]; restrict: boolean } };

export type AlterGenericOption =
  | { Add: { option: CreateServerOption; add_keyword: boolean } }
  | { Set: CreateServerOption }
  | { Drop: Ident };

export type AlterIndexOperation =
  | { RenameIndex: { index_name: ObjectName } };

export interface AlterOperator {
  name: ObjectName;
  left_type?: DataType;
  right_type: DataType;
  operation: AlterOperatorOperation;
}

export interface AlterOperatorClass {
  name: ObjectName;
  using: Ident;
  operation: AlterOperatorClassOperation;
}

export type AlterOperatorClassOperation =
  | { RenameTo: { new_name: ObjectName } }
  | { OwnerTo: Owner }
  | { SetSchema: { schema_name: ObjectName } };

export interface AlterOperatorFamily {
  name: ObjectName;
  using: Ident;
  operation: AlterOperatorFamilyOperation;
}

export type AlterOperatorFamilyOperation =
  | { Add: { items: OperatorFamilyItem[] } }
  | { Drop: { items: OperatorFamilyDropItem[] } }
  | { RenameTo: { new_name: ObjectName } }
  | { OwnerTo: Owner }
  | { SetSchema: { schema_name: ObjectName } };

export type AlterOperatorOperation =
  | { OwnerTo: Owner }
  | { SetSchema: { schema_name: ObjectName } }
  | { Set: { options: OperatorOption[] } };

export interface AlterPolicy {
  name: Ident;
  table_name: ObjectName;
  operation: AlterPolicyOperation;
}

export type AlterPolicyOperation =
  | { Rename: { new_name: Ident } }
  | { Apply: { to?: Owner[]; using?: Expr; with_check?: Expr } };

export type AlterRoleOperation =
  | { RenameRole: { role_name: Ident } }
  | { AddMember: { member_name: Ident } }
  | { DropMember: { member_name: Ident } }
  | { WithOptions: { options: RoleOption[] } }
  | { Set: { config_name: ObjectName; config_value: SetConfigValue; in_database?: ObjectName } }
  | { Reset: { config_name: ResetConfig; in_database?: ObjectName } };

export interface AlterSchema {
  name: ObjectName;
  if_exists: boolean;
  operations: AlterSchemaOperation[];
}

export type AlterSchemaOperation =
  | { SetDefaultCollate: { collate: Expr } }
  | { AddReplica: { replica: Ident; options?: SqlOption[] } }
  | { DropReplica: { replica: Ident } }
  | { SetOptionsParens: { options: SqlOption[] } }
  | { Rename: { name: ObjectName } }
  | { OwnerTo: { owner: Owner } };

export interface AlterTable {
  name: ObjectName;
  if_exists: boolean;
  only: boolean;
  operations: AlterTableOperation[];
  location?: HiveSetLocation;
  on_cluster?: Ident;
  table_type?: AlterTableType;
  end_token: AttachedToken;
}

export type AlterTableAlgorithm =
  | 'Default'
  | 'Instant'
  | 'Inplace'
  | 'Copy';

export type AlterTableLock =
  | 'Default'
  | 'None'
  | 'Shared'
  | 'Exclusive';

export type AlterTableOperation =
  | { AddConstraint: { constraint: TableConstraint; not_valid: boolean } }
  | { AddColumn: { column_keyword: boolean; if_not_exists: boolean; column_def: ColumnDef; column_position?: MySQLColumnPosition } }
  | { AddProjection: { if_not_exists: boolean; name: Ident; select: ProjectionSelect } }
  | { DropProjection: { if_exists: boolean; name: Ident } }
  | { MaterializeProjection: { if_exists: boolean; name: Ident; partition?: Ident } }
  | { ClearProjection: { if_exists: boolean; name: Ident; partition?: Ident } }
  | 'DisableRowLevelSecurity'
  | { DisableRule: { name: Ident } }
  | { DisableTrigger: { name: Ident } }
  | { DropConstraint: { if_exists: boolean; name: Ident; drop_behavior?: DropBehavior } }
  | { DropColumn: { has_column_keyword: boolean; column_names: Ident[]; if_exists: boolean; drop_behavior?: DropBehavior } }
  | { AttachPartition: { partition: Partition } }
  | { AttachPartitionOf: { partition: ObjectName; for_values: ForValues } }
  | { DetachPartition: { partition: Partition } }
  | { DetachPartitionOf: { partition: ObjectName; mode?: DetachPartitionMode } }
  | { FreezePartition: { partition: Partition; with_name?: Ident } }
  | { UnfreezePartition: { partition: Partition; with_name?: Ident } }
  | { DropPrimaryKey: { drop_behavior?: DropBehavior } }
  | { DropForeignKey: { name: Ident; drop_behavior?: DropBehavior } }
  | { DropIndex: { name: Ident } }
  | { EnableAlwaysRule: { name: Ident } }
  | { EnableAlwaysTrigger: { name: Ident } }
  | { EnableReplicaRule: { name: Ident } }
  | { EnableReplicaTrigger: { name: Ident } }
  | 'EnableRowLevelSecurity'
  | 'ForceRowLevelSecurity'
  | 'NoForceRowLevelSecurity'
  | { EnableRule: { name: Ident } }
  | { EnableTrigger: { name: Ident } }
  | { RenamePartitions: { old_partitions: Expr[]; new_partitions: Expr[] } }
  | { ReplicaIdentity: { identity: ReplicaIdentity } }
  | { AddPartitions: { if_not_exists: boolean; new_partitions: Partition[] } }
  | { DropPartitions: { partitions: Expr[]; if_exists: boolean } }
  | { RenameColumn: { old_column_name: Ident; new_column_name: Ident } }
  | { RenameTable: { table_name: RenameTableNameKind } }
  | { ChangeColumn: { old_name: Ident; new_name: Ident; data_type: DataType; options: ColumnOption[]; column_position?: MySQLColumnPosition } }
  | { ModifyColumn: { col_name: Ident; data_type: DataType; options: ColumnOption[]; column_position?: MySQLColumnPosition } }
  | { ModifyOrderBy: { order_by: OneOrManyWithParens<Expr> } }
  | { RenameConstraint: { old_name: Ident; new_name: Ident } }
  | { AlterColumn: { column_name: Ident; op: AlterColumnOperation } }
  | { SwapWith: { table_name: ObjectName } }
  | { SetTblProperties: { table_properties: SqlOption[] } }
  | 'SetLogged'
  | 'SetUnlogged'
  | { OwnerTo: { new_owner: Owner } }
  | { ClusterBy: { exprs: Expr[] } }
  | 'DropClusteringKey'
  | { AlterSortKey: { columns: Expr[] } }
  | 'SuspendRecluster'
  | 'ResumeRecluster'
  | { Refresh: { subpath?: string } }
  | 'Suspend'
  | 'Resume'
  | { Algorithm: { equals: boolean; algorithm: AlterTableAlgorithm } }
  | { Lock: { equals: boolean; lock: AlterTableLock } }
  | { AutoIncrement: { equals: boolean; value: ValueWithSpan } }
  | { ValidateConstraint: { name: Ident } }
  | { Inherit: { parent: ObjectName } }
  | { NoInherit: { parent: ObjectName } }
  | { SetOptionsParens: { options: SqlOption[] } }
  | { ResetOptions: { options: ObjectName[] } }
  | { GenericOptions: { options: AlterGenericOption[] } };

export type AlterTableType =
  | 'Iceberg'
  | 'Dynamic'
  | 'External'
  | 'Foreign';

export interface AlterTextSearch {
  object_type: TextSearchObjectType;
  name: ObjectName;
  operation: AlterTextSearchOperation;
}

export type AlterTextSearchOperation =
  | { RenameTo: { new_name: Ident } }
  | { OwnerTo: Owner }
  | { SetSchema: { schema_name: ObjectName } }
  | { SetOptions: { options: AlterTextSearchOption[] } };

export interface AlterTextSearchOption {
  key: Ident;
  value?: Expr;
}

export interface AlterTrigger {
  name: Ident;
  table_name: ObjectName;
  operation: AlterTriggerOperation;
}

export type AlterTriggerOperation =
  | { Rename: { new_name: Ident } }
  | { DependsOnExtension: { no: boolean; extension_name: ObjectName } };

export interface AlterType {
  name: ObjectName;
  operation: AlterTypeOperation;
}

export interface AlterTypeAddValue {
  if_not_exists: boolean;
  value: Ident;
  position?: AlterTypeAddValuePosition;
}

export type AlterTypeAddValuePosition =
  | { Before: Ident }
  | { After: Ident };

export type AlterTypeOperation =
  | { Rename: AlterTypeRename }
  | { AddValue: AlterTypeAddValue }
  | { RenameValue: AlterTypeRenameValue };

export interface AlterTypeRename {
  new_name: Ident;
}

export interface AlterTypeRenameValue {
  from: Ident;
  to: Ident;
}

export interface AlterUser {
  if_exists: boolean;
  name: Ident;
  rename_to?: Ident;
  reset_password: boolean;
  abort_all_queries: boolean;
  add_role_delegation?: AlterUserAddRoleDelegation;
  remove_role_delegation?: AlterUserRemoveRoleDelegation;
  enroll_mfa: boolean;
  set_default_mfa_method?: MfaMethodKind;
  remove_mfa_method?: MfaMethodKind;
  modify_mfa_method?: AlterUserModifyMfaMethod;
  add_mfa_method_otp?: AlterUserAddMfaMethodOtp;
  set_policy?: AlterUserSetPolicy;
  unset_policy?: UserPolicyKind;
  set_tag: KeyValueOptions;
  unset_tag: string[];
  set_props: KeyValueOptions;
  unset_props: string[];
  password?: AlterUserPassword;
}

export interface AlterUserAddMfaMethodOtp {
  count?: ValueWithSpan;
}

export interface AlterUserAddRoleDelegation {
  role: Ident;
  integration: Ident;
}

export interface AlterUserModifyMfaMethod {
  method: MfaMethodKind;
  comment: string;
}

export interface AlterUserPassword {
  encrypted: boolean;
  password?: string;
}

export interface AlterUserRemoveRoleDelegation {
  role?: Ident;
  integration: Ident;
}

export interface AlterUserSetPolicy {
  policy_kind: UserPolicyKind;
  policy: Ident;
}

export interface AlterView {
  materialized: boolean;
  name: ObjectName;
  if_exists: boolean;
  operation: AlterViewOperation;
}

export type AlterViewOperation =
  | { As: { columns: Ident[]; query: Query; with_options: SqlOption[] } }
  | { AlterColumn: { column_name: Ident; op: AlterColumnOperation } }
  | { OwnerTo: Owner }
  | { RenameColumn: { old_column_name: Ident; new_column_name: Ident } }
  | { RenameTo: { new_name: ObjectName } }
  | { SetSchema: { schema_name: ObjectName } }
  | { SetOptions: { options: SqlOption[] } }
  | { ResetOptions: { options: Ident[] } };

export interface Analyze {
  table_name?: ObjectName;
  partitions?: Expr[];
  for_columns: boolean;
  columns: Ident[];
  cache_metadata: boolean;
  noscan: boolean;
  compute_statistics: boolean;
  has_table_keyword: boolean;
}

export type AnalyzeFormat =
  | 'TEXT'
  | 'GRAPHVIZ'
  | 'JSON'
  | 'TRADITIONAL'
  | 'TREE';

export type AnalyzeFormatKind =
  | { Keyword: AnalyzeFormat }
  | { Assignment: AnalyzeFormat };

export type ArgMode =
  | 'In'
  | 'Out'
  | 'InOut'
  | 'Variadic';

export interface Array {
  elem: Expr[];
  named: boolean;
}

export type ArrayElemTypeDef =
  | 'None'
  | { AngleBracket: DataType }
  | { SquareBracket: [DataType, number | undefined] }
  | { Parenthesis: DataType }
  | { ParenthesisNotNull: DataType }
  | { Qualified: [DataType, number | undefined] };

export interface Assignment {
  target: AssignmentTarget;
  value: Expr;
}

export type AssignmentTarget =
  | { ColumnName: ObjectName }
  | { Tuple: ObjectName[] };

export type AttachDuckDBDatabaseOption =
  | { ReadOnly: boolean | undefined }
  | { Type: Ident };

export type AttachedToken = TokenWithSpan;

export interface BeginEndStatements {
  begin_token: AttachedToken;
  statements: Statement[];
  end_token: AttachedToken;
}

export type BeginTransactionKind =
  | 'Transaction'
  | 'Work'
  | 'Tran';

export type BinaryLength =
  | { IntegerLength: { length: number } }
  | 'Max';

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
  | 'DuckIntegerDivide'
  | 'MyIntegerDivide'
  | 'Match'
  | 'Regexp'
  | 'Glob'
  | { Custom: string }
  | 'PGBitwiseXor'
  | 'PGBitwiseShiftLeft'
  | 'PGBitwiseShiftRight'
  | 'PGExp'
  | 'PGOverlap'
  | 'PGRegexMatch'
  | 'PGRegexIMatch'
  | 'PGRegexNotMatch'
  | 'PGRegexNotIMatch'
  | 'PGLikeMatch'
  | 'PGILikeMatch'
  | 'PGNotLikeMatch'
  | 'PGNotILikeMatch'
  | 'PGStartsWith'
  | 'Arrow'
  | 'LongArrow'
  | 'HashArrow'
  | 'HashLongArrow'
  | 'AtAt'
  | 'AtArrow'
  | 'ArrowAt'
  | 'HashMinus'
  | 'AtQuestion'
  | 'Question'
  | 'QuestionAnd'
  | 'QuestionPipe'
  | { PGCustomBinaryOperator: string[] }
  | 'Overlaps'
  | 'DoubleHash'
  | 'LtDashGt'
  | 'AndLt'
  | 'AndGt'
  | 'LtLtPipe'
  | 'PipeGtGt'
  | 'AndLtPipe'
  | 'PipeAndGt'
  | 'LtCaret'
  | 'GtCaret'
  | 'QuestionHash'
  | 'QuestionDash'
  | 'QuestionDashPipe'
  | 'QuestionDoublePipe'
  | 'At'
  | 'TildeEq'
  | 'Assignment'
  | 'Is'
  | 'IsNot';

export type CascadeOption =
  | 'Cascade'
  | 'Restrict';

export interface CaseStatement {
  case_token: AttachedToken;
  match_expr?: Expr;
  when_blocks: ConditionalStatementBlock[];
  else_block?: ConditionalStatementBlock;
  end_case_token: AttachedToken;
}

export interface CaseWhen {
  condition: Expr;
  result: Expr;
}

export type CastFormat =
  | { Value: ValueWithSpan }
  | { ValueAtTimeZone: [ValueWithSpan, ValueWithSpan] };

export type CastKind =
  | 'Cast'
  | 'TryCast'
  | 'SafeCast'
  | 'DoubleColon';

export type CatalogSyncNamespaceMode =
  | 'Nest'
  | 'Flatten';

export type CeilFloorKind =
  | { DateTimeField: DateTimeField }
  | { Scale: ValueWithSpan };

export type CharLengthUnits =
  | 'Characters'
  | 'Octets';

export type CharacterLength =
  | { IntegerLength: { length: number; unit?: CharLengthUnits } }
  | 'Max';

export interface CheckConstraint {
  name?: Ident;
  expr: Expr;
  no_inherit: boolean;
  enforced?: boolean;
}

export type CloseCursor =
  | 'All'
  | { Specific: { name: Ident } };

export interface ClusteredBy {
  columns: Ident[];
  sorted_by?: OrderByExpr[];
  num_buckets: Value;
}

export interface ClusteredIndex {
  name: Ident;
  asc?: boolean;
}

export interface ColumnDef {
  name: Ident;
  data_type: DataType;
  options: ColumnOptionDef[];
}

export type ColumnOption =
  | 'Null'
  | 'NotNull'
  | { Default: Expr }
  | { Materialized: Expr }
  | { Ephemeral: Expr | undefined }
  | { Alias: Expr }
  | { PrimaryKey: PrimaryKeyConstraint }
  | { Unique: UniqueConstraint }
  | { ForeignKey: ForeignKeyConstraint }
  | { Check: CheckConstraint }
  | { DialectSpecific: Token[] }
  | { CharacterSet: ObjectName }
  | { Collation: ObjectName }
  | { Comment: string }
  | { OnUpdate: Expr }
  | { Generated: { generated_as: GeneratedAs; sequence_options?: SequenceOptions[]; generation_expr?: Expr; generation_expr_mode?: GeneratedExpressionMode; generated_keyword: boolean } }
  | { Options: SqlOption[] }
  | { GenericOptions: CreateServerOption[] }
  | { Identity: IdentityPropertyKind }
  | { OnConflict: Keyword }
  | { Policy: ColumnPolicy }
  | { Tags: TagsColumnOption }
  | { Srid: Expr }
  | 'Invisible';

export interface ColumnOptionDef {
  name?: Ident;
  option: ColumnOption;
}

export type ColumnOptions =
  | { CommaSeparated: ColumnOption[] }
  | { SpaceSeparated: ColumnOption[] };

export type ColumnPolicy =
  | { MaskingPolicy: ColumnPolicyProperty }
  | { ProjectionPolicy: ColumnPolicyProperty };

export interface ColumnPolicyProperty {
  with: boolean;
  policy_name: ObjectName;
  using_columns?: Ident[];
}

export type CommentDef =
  | { WithEq: string }
  | { WithoutEq: string };

export type CommentObject =
  | 'Collation'
  | 'Column'
  | 'Database'
  | 'Domain'
  | 'Extension'
  | 'ForeignTable'
  | 'Function'
  | 'Index'
  | 'MaterializedView'
  | 'Procedure'
  | 'Role'
  | 'Schema'
  | 'Sequence'
  | 'Table'
  | 'Type'
  | 'User'
  | 'View';

export interface ConditionalStatementBlock {
  start_token: AttachedToken;
  condition?: Expr;
  then_token?: AttachedToken;
  conditional_statements: ConditionalStatements;
}

export type ConditionalStatements =
  | { Sequence: { statements: Statement[] } }
  | { BeginEnd: BeginEndStatements };

export type ConflictTarget =
  | { Columns: { columns: Ident[]; predicate?: Expr } }
  | { OnConstraint: ObjectName };

export type ConnectByKind =
  | { ConnectBy: { connect_token: AttachedToken; nocycle: boolean; relationships: Expr[] } }
  | { StartWith: { start_token: AttachedToken; condition: Expr } };

export interface ConstraintCharacteristics {
  deferrable?: boolean;
  initially?: DeferrableInitial;
  enforced?: boolean;
}

export type ConstraintReferenceMatchKind =
  | 'Full'
  | 'Partial'
  | 'Simple';

export interface ConstraintUsingIndex {
  name?: Ident;
  index_name: Ident;
  characteristics?: ConstraintCharacteristics;
}

export interface ContactEntry {
  purpose: string;
  contact: string;
}

export type ContextModifier =
  | 'Local'
  | 'Session'
  | 'Global';

export type CopyIntoSnowflakeKind =
  | 'Table'
  | 'Location';

export type CopyLegacyCsvOption =
  | 'Header'
  | { Quote: string }
  | { Escape: string }
  | { ForceQuote: Ident[] }
  | { ForceNotNull: Ident[] };

export type CopyLegacyOption =
  | 'AcceptAnyDate'
  | { AcceptInvChars: string | undefined }
  | 'AddQuotes'
  | 'AllowOverwrite'
  | 'Binary'
  | 'BlankAsNull'
  | 'Bzip2'
  | 'CleanPath'
  | { CompUpdate: { preset: boolean; enabled?: boolean } }
  | { Csv: CopyLegacyCsvOption[] }
  | { DateFormat: string | undefined }
  | { Delimiter: string }
  | 'EmptyAsNull'
  | { Encrypted: { auto: boolean } }
  | 'Escape'
  | { Extension: string }
  | { FixedWidth: string }
  | 'Gzip'
  | 'Header'
  | { IamRole: IamRoleKind }
  | { IgnoreHeader: number }
  | { Json: string | undefined }
  | { Manifest: { verbose: boolean } }
  | { MaxFileSize: FileSize }
  | { Null: string }
  | { Parallel: boolean | undefined }
  | 'Parquet'
  | { PartitionBy: UnloadPartitionBy }
  | { Region: string }
  | 'RemoveQuotes'
  | { RowGroupSize: FileSize }
  | { StatUpdate: boolean | undefined }
  | { TimeFormat: string | undefined }
  | 'TruncateColumns'
  | 'Zstd'
  | { Credentials: string };

export type CopyOption =
  | { Format: Ident }
  | { Freeze: boolean }
  | { Delimiter: string }
  | { Null: string }
  | { Header: boolean }
  | { Quote: string }
  | { Escape: string }
  | { ForceQuote: Ident[] }
  | { ForceNotNull: Ident[] }
  | { ForceNull: Ident[] }
  | { Encoding: string };

export interface CopyPayload {
  data: string;
  terminated: boolean;
}

export type CopySource =
  | { Table: { table_name: ObjectName; columns: Ident[] } }
  | { Query: Query };

export type CopyTarget =
  | 'Stdin'
  | 'Stdout'
  | { File: { filename: string } }
  | { Program: { command: string } };

export interface CreateAggregate {
  or_replace: boolean;
  name: ObjectName;
  args: CreateAggregateArgs;
  options: CreateAggregateOption[];
}

export type CreateAggregateArgs =
  | 'Legacy'
  | 'Star'
  | { List: OperateFunctionArg[] }
  | { OrderedSet: { direct: OperateFunctionArg[]; aggregated: OperateFunctionArg[] } };

export type CreateAggregateOption =
  | { StateTransitionFunction: ObjectName }
  | { StateDataType: DataType }
  | { StateDataSize: number }
  | { FinalFunction: ObjectName }
  | 'FinalFunctionExtra'
  | { FinalFunctionModify: AggregateModifyKind }
  | { CombineFunction: ObjectName }
  | { SerialFunction: ObjectName }
  | { DeserialFunction: ObjectName }
  | { InitialCondition: ValueWithSpan }
  | { MovingStateTransitionFunction: ObjectName }
  | { MovingInverseTransitionFunction: ObjectName }
  | { MovingStateDataType: DataType }
  | { MovingStateDataSize: number }
  | { MovingFinalFunction: ObjectName }
  | 'MovingFinalFunctionExtra'
  | { MovingFinalFunctionModify: AggregateModifyKind }
  | { MovingInitialCondition: ValueWithSpan }
  | { SortOperator: ObjectName }
  | { Parallel: FunctionParallel }
  | 'Hypothetical'
  | { BaseType: DataType };

export interface CreateCollation {
  if_not_exists: boolean;
  name: ObjectName;
  definition: CreateCollationDefinition;
}

export type CreateCollationDefinition =
  | { From: ObjectName }
  | { Options: SqlOption[] };

export interface CreateConnector {
  name: Ident;
  if_not_exists: boolean;
  connector_type?: string;
  url?: string;
  comment?: CommentDef;
  with_dcproperties?: SqlOption[];
}

export interface CreateDatabaseBuilder {
  db_name: ObjectName;
  if_not_exists: boolean;
  location?: string;
  managed_location?: string;
  or_replace: boolean;
  transient: boolean;
  clone?: ObjectName;
  data_retention_time_in_days?: number;
  max_data_extension_time_in_days?: number;
  external_volume?: string;
  catalog?: string;
  replace_invalid_characters?: boolean;
  default_ddl_collation?: string;
  storage_serialization_policy?: StorageSerializationPolicy;
  comment?: string;
  default_charset?: string;
  default_collation?: string;
  catalog_sync?: string;
  catalog_sync_namespace_mode?: CatalogSyncNamespaceMode;
  catalog_sync_namespace_flatten_delimiter?: string;
  with_tags?: Tag[];
  with_contacts?: ContactEntry[];
}

export interface CreateDomain {
  name: ObjectName;
  data_type: DataType;
  collation?: Ident;
  default?: Expr;
  constraints: TableConstraint[];
}

export interface CreateExtension {
  name: Ident;
  if_not_exists: boolean;
  with_keyword: boolean;
  cascade: boolean;
  schema?: Ident;
  version?: Ident;
}

export interface CreateForeignDataWrapper {
  name: Ident;
  routines: ForeignDataWrapperRoutineClause[];
  options?: CreateServerOption[];
}

export interface CreateForeignTable {
  name: ObjectName;
  if_not_exists: boolean;
  columns: ColumnDef[];
  constraints: TableConstraint[];
  inherits?: ObjectName[];
  partition_of?: ObjectName;
  for_values?: ForValues;
  server_name: Ident;
  options?: CreateServerOption[];
}

export interface CreateFunction {
  or_alter: boolean;
  or_replace: boolean;
  temporary: boolean;
  if_not_exists: boolean;
  name: ObjectName;
  args?: OperateFunctionArg[];
  return_type?: FunctionReturnType;
  function_body?: CreateFunctionBody;
  behavior?: FunctionBehavior;
  called_on_null?: FunctionCalledOnNull;
  parallel?: FunctionParallel;
  security?: FunctionSecurity;
  set_params: FunctionDefinitionSetParam[];
  using?: CreateFunctionUsing;
  language?: Ident;
  determinism_specifier?: FunctionDeterminismSpecifier;
  options?: SqlOption[];
  remote_connection?: ObjectName;
}

export type CreateFunctionBody =
  | { AsBeforeOptions: { body: Expr; link_symbol?: Expr } }
  | { AsAfterOptions: Expr }
  | { AsBeginEnd: BeginEndStatements }
  | { Return: Expr }
  | { BeginAtomic: BeginEndStatements }
  | { AsReturnExpr: Expr }
  | { AsReturnSelect: Select };

export type CreateFunctionUsing =
  | { Jar: string }
  | { File: string }
  | { Archive: string };

export interface CreateIndex {
  name?: ObjectName;
  table_name: ObjectName;
  using?: IndexType;
  columns: IndexColumn[];
  unique: boolean;
  concurrently: boolean;
  async: boolean;
  if_not_exists: boolean;
  include: Ident[];
  nulls_distinct?: boolean;
  with: Expr[];
  predicate?: Expr;
  index_options: IndexOption[];
  alter_options: AlterTableOperation[];
}

export interface CreateOperator {
  name: ObjectName;
  function: ObjectName;
  is_procedure: boolean;
  left_arg?: DataType;
  right_arg?: DataType;
  options: OperatorOption[];
}

export interface CreateOperatorClass {
  name: ObjectName;
  default: boolean;
  for_type: DataType;
  using: Ident;
  family?: ObjectName;
  items: OperatorClassItem[];
}

export interface CreateOperatorFamily {
  name: ObjectName;
  using: Ident;
}

export interface CreatePolicy {
  name: Ident;
  table_name: ObjectName;
  policy_type?: CreatePolicyType;
  command?: CreatePolicyCommand;
  to?: Owner[];
  using?: Expr;
  with_check?: Expr;
}

export type CreatePolicyCommand =
  | 'All'
  | 'Select'
  | 'Insert'
  | 'Update'
  | 'Delete';

export type CreatePolicyType =
  | 'Permissive'
  | 'Restrictive';

export type CreateProcedureBody =
  | { As: ConditionalStatements }
  | { BeginAtomic: BeginEndStatements };

export interface CreateRole {
  keyword: RoleKeyword;
  names: ObjectName[];
  if_not_exists: boolean;
  login?: boolean;
  inherit?: boolean;
  bypassrls?: boolean;
  password?: Password;
  superuser?: boolean;
  create_db?: boolean;
  create_role?: boolean;
  replication?: boolean;
  connection_limit?: Expr;
  valid_until?: Expr;
  in_role: Ident[];
  in_group: Ident[];
  role: Ident[];
  user: Ident[];
  admin: Ident[];
  authorization_owner?: ObjectName;
}

export interface CreateRule {
  or_replace: boolean;
  name: Ident;
  event: CreateRuleEvent;
  table_name: ObjectName;
  condition?: Expr;
  do_kind?: CreateRuleDoKind;
  action: CreateRuleAction;
}

export type CreateRuleAction =
  | 'Nothing'
  | { Statement: Statement }
  | { Statements: Statement[] };

export type CreateRuleDoKind =
  | 'Also'
  | 'Instead';

export type CreateRuleEvent =
  | 'Select'
  | 'Insert'
  | 'Update'
  | 'Delete';

export interface CreateServerOption {
  key: Ident;
  value: Ident;
}

export interface CreateServerStatement {
  name: ObjectName;
  if_not_exists: boolean;
  server_type?: Ident;
  version?: Ident;
  foreign_data_wrapper: ObjectName;
  options?: CreateServerOption[];
}

export interface CreateTable {
  or_replace: boolean;
  temporary: boolean;
  unlogged: boolean;
  external: boolean;
  dynamic: boolean;
  global?: boolean;
  if_not_exists: boolean;
  transient: boolean;
  volatile: boolean;
  iceberg: boolean;
  snapshot: boolean;
  name: ObjectName;
  columns: ColumnDef[];
  constraints: TableConstraint[];
  hive_distribution: HiveDistributionStyle;
  hive_formats?: HiveFormat;
  table_options: CreateTableOptions;
  file_format?: FileFormat;
  location?: string;
  query?: Query;
  sqlite_table_options: SqliteTableOptions;
  like?: CreateTableLikeKind;
  clone?: ObjectName;
  version?: TableVersion;
  comment?: CommentDef;
  on_commit?: OnCommit;
  on_cluster?: Ident;
  primary_key?: Expr;
  order_by?: OneOrManyWithParens<Expr>;
  partition_by?: Expr;
  cluster_by?: WrappedCollection<Expr[]>;
  clustered_by?: ClusteredBy;
  inherits?: ObjectName[];
  partition_of?: ObjectName;
  for_values?: ForValues;
  copy_grants: boolean;
  enable_schema_evolution?: boolean;
  change_tracking?: boolean;
  data_retention_time_in_days?: number;
  max_data_extension_time_in_days?: number;
  default_ddl_collation?: string;
  with_aggregation_policy?: ObjectName;
  with_row_access_policy?: RowAccessPolicy;
  with_storage_lifecycle_policy?: StorageLifecyclePolicy;
  with_tags?: Tag[];
  external_volume?: string;
  with_connection?: ObjectName;
  base_location?: string;
  catalog?: string;
  catalog_sync?: string;
  storage_serialization_policy?: StorageSerializationPolicy;
  target_lag?: string;
  warehouse?: Ident;
  refresh_mode?: RefreshModeKind;
  initialize?: InitializeKind;
  require_user: boolean;
  diststyle?: DistStyle;
  distkey?: Expr;
  sortkey?: Expr[];
  backup?: boolean;
  multiset?: boolean;
  fallback?: boolean;
  with_data?: WithData;
}

export interface CreateTableBuilder {
  or_replace: boolean;
  temporary: boolean;
  unlogged: boolean;
  external: boolean;
  global?: boolean;
  if_not_exists: boolean;
  transient: boolean;
  volatile: boolean;
  iceberg: boolean;
  snapshot: boolean;
  dynamic: boolean;
  name: ObjectName;
  columns: ColumnDef[];
  constraints: TableConstraint[];
  hive_distribution: HiveDistributionStyle;
  hive_formats?: HiveFormat;
  file_format?: FileFormat;
  location?: string;
  query?: Query;
  sqlite_table_options: SqliteTableOptions;
  like?: CreateTableLikeKind;
  clone?: ObjectName;
  version?: TableVersion;
  comment?: CommentDef;
  on_commit?: OnCommit;
  on_cluster?: Ident;
  primary_key?: Expr;
  order_by?: OneOrManyWithParens<Expr>;
  partition_by?: Expr;
  cluster_by?: WrappedCollection<Expr[]>;
  clustered_by?: ClusteredBy;
  inherits?: ObjectName[];
  partition_of?: ObjectName;
  for_values?: ForValues;
  copy_grants: boolean;
  enable_schema_evolution?: boolean;
  change_tracking?: boolean;
  data_retention_time_in_days?: number;
  max_data_extension_time_in_days?: number;
  default_ddl_collation?: string;
  with_aggregation_policy?: ObjectName;
  with_row_access_policy?: RowAccessPolicy;
  with_storage_lifecycle_policy?: StorageLifecyclePolicy;
  with_tags?: Tag[];
  base_location?: string;
  external_volume?: string;
  with_connection?: ObjectName;
  catalog?: string;
  catalog_sync?: string;
  storage_serialization_policy?: StorageSerializationPolicy;
  table_options: CreateTableOptions;
  target_lag?: string;
  warehouse?: Ident;
  refresh_mode?: RefreshModeKind;
  initialize?: InitializeKind;
  require_user: boolean;
  diststyle?: DistStyle;
  distkey?: Expr;
  sortkey?: Expr[];
  backup?: boolean;
  multiset?: boolean;
  fallback?: boolean;
  with_data?: WithData;
}

export interface CreateTableLike {
  name: ObjectName;
  defaults?: CreateTableLikeDefaults;
}

export type CreateTableLikeDefaults =
  | 'Including'
  | 'Excluding';

export type CreateTableLikeKind =
  | { Parenthesized: CreateTableLike }
  | { Plain: CreateTableLike };

export type CreateTableOptions =
  | 'None'
  | { With: SqlOption[] }
  | { Options: SqlOption[] }
  | { Plain: SqlOption[] }
  | { TableProperties: SqlOption[] };

export interface CreateTextSearch {
  object_type: TextSearchObjectType;
  name: ObjectName;
  options: SqlOption[];
}

export interface CreateTrigger {
  or_alter: boolean;
  temporary: boolean;
  or_replace: boolean;
  is_constraint: boolean;
  name: ObjectName;
  period?: TriggerPeriod;
  period_before_table: boolean;
  events: TriggerEvent[];
  table_name: ObjectName;
  referenced_table_name?: ObjectName;
  referencing: TriggerReferencing[];
  trigger_object?: TriggerObjectKind;
  condition?: Expr;
  exec_body?: TriggerExecBody;
  statements_as: boolean;
  statements?: ConditionalStatements;
  characteristics?: ConstraintCharacteristics;
}

export interface CreateUser {
  or_replace: boolean;
  if_not_exists: boolean;
  name: Ident;
  options: KeyValueOptions;
  with_tags: boolean;
  tags: KeyValueOptions;
}

export interface CreateUserMapping {
  if_not_exists: boolean;
  user: UserMappingUser;
  server_name: Ident;
  options?: CreateServerOption[];
}

export interface CreateView {
  or_alter: boolean;
  or_replace: boolean;
  materialized: boolean;
  secure: boolean;
  name: ObjectName;
  name_before_not_exists: boolean;
  columns: ViewColumnDef[];
  query: Query;
  options: CreateTableOptions;
  cluster_by: Ident[];
  comment?: string;
  with_no_schema_binding: boolean;
  if_not_exists: boolean;
  temporary: boolean;
  copy_grants: boolean;
  to?: ObjectName;
  params?: CreateViewParams;
}

export type CreateViewAlgorithm =
  | 'Undefined'
  | 'Merge'
  | 'TempTable';

export interface CreateViewParams {
  algorithm?: CreateViewAlgorithm;
  definer?: GranteeName;
  security?: CreateViewSecurity;
}

export type CreateViewSecurity =
  | 'Definer'
  | 'Invoker';

export interface CreateWarehouse {
  or_replace: boolean;
  if_not_exists: boolean;
  name: ObjectName;
  options: KeyValueOptions;
}

export interface Cte {
  alias: TableAlias;
  query: Query;
  from?: Ident;
  materialized?: CteAsMaterialized;
  closing_paren_token: AttachedToken;
}

export type CteAsMaterialized =
  | 'Materialized'
  | 'NotMaterialized';

export type CurrentGrantsKind =
  | 'CopyCurrentGrants'
  | 'RevokeCurrentGrants';

export type DataType =
  | { Table: ColumnDef[] | undefined }
  | { NamedTable: { name: ObjectName; columns: ColumnDef[] } }
  | { Character: CharacterLength | undefined }
  | { Char: CharacterLength | undefined }
  | { CharacterVarying: CharacterLength | undefined }
  | { CharVarying: CharacterLength | undefined }
  | { Varchar: CharacterLength | undefined }
  | { Nvarchar: CharacterLength | undefined }
  | 'Uuid'
  | { CharacterLargeObject: number | undefined }
  | { CharLargeObject: number | undefined }
  | { Clob: number | undefined }
  | { Binary: number | undefined }
  | { Varbinary: BinaryLength | undefined }
  | { Blob: number | undefined }
  | 'TinyBlob'
  | 'MediumBlob'
  | 'LongBlob'
  | { Bytes: number | undefined }
  | { Numeric: ExactNumberInfo }
  | { Decimal: ExactNumberInfo }
  | { DecimalUnsigned: ExactNumberInfo }
  | { BigNumeric: ExactNumberInfo }
  | { BigDecimal: ExactNumberInfo }
  | { Dec: ExactNumberInfo }
  | { DecUnsigned: ExactNumberInfo }
  | { Float: ExactNumberInfo }
  | { FloatUnsigned: ExactNumberInfo }
  | { TinyInt: number | undefined }
  | { TinyIntUnsigned: number | undefined }
  | 'UTinyInt'
  | { Int2: number | undefined }
  | { Int2Unsigned: number | undefined }
  | { SmallInt: number | undefined }
  | { SmallIntUnsigned: number | undefined }
  | 'USmallInt'
  | { MediumInt: number | undefined }
  | { MediumIntUnsigned: number | undefined }
  | { Int: number | undefined }
  | { Int4: number | undefined }
  | { Int8: number | undefined }
  | 'Int16'
  | 'Int32'
  | 'Int64'
  | 'Int128'
  | 'Int256'
  | { Integer: number | undefined }
  | { IntUnsigned: number | undefined }
  | { Int4Unsigned: number | undefined }
  | { IntegerUnsigned: number | undefined }
  | 'HugeInt'
  | 'UHugeInt'
  | 'UInt8'
  | 'UInt16'
  | 'UInt32'
  | 'UInt64'
  | 'UInt128'
  | 'UInt256'
  | { BigInt: number | undefined }
  | { BigIntUnsigned: number | undefined }
  | 'UBigInt'
  | { Int8Unsigned: number | undefined }
  | 'Signed'
  | 'SignedInteger'
  | 'Unsigned'
  | 'UnsignedInteger'
  | 'Float4'
  | 'Float32'
  | 'Float64'
  | 'Real'
  | 'RealUnsigned'
  | 'Float8'
  | { Double: ExactNumberInfo }
  | { DoubleUnsigned: ExactNumberInfo }
  | 'DoublePrecision'
  | 'DoublePrecisionUnsigned'
  | { Zerofill: DataType }
  | 'Bool'
  | 'Boolean'
  | 'Date'
  | 'Date32'
  | { Time: [number | undefined, TimezoneInfo] }
  | { Datetime: number | undefined }
  | { Datetime64: [number, string | undefined] }
  | { Timestamp: [number | undefined, TimezoneInfo] }
  | { TimestampNtz: number | undefined }
  | { Interval: { fields?: IntervalFields; precision?: number } }
  | 'JSON'
  | 'JSONB'
  | 'Regclass'
  | 'Text'
  | 'TinyText'
  | 'MediumText'
  | 'LongText'
  | { String: number | undefined }
  | { Collate: [DataType, ObjectName] }
  | { FixedString: number }
  | 'Bytea'
  | { Bit: number | undefined }
  | { BitVarying: number | undefined }
  | { VarBit: number | undefined }
  | { Custom: [ObjectName, TypeModifier[]] }
  | { Array: ArrayElemTypeDef }
  | { Map: [DataType, DataType, MapBracketKind] }
  | { Tuple: StructField[] }
  | { Nested: ColumnDef[] }
  | { Object: ColumnDef[] }
  | { Enum: [EnumMember[], number | undefined] }
  | { Set: string[] }
  | { Struct: [StructField[], StructBracketKind] }
  | { Union: UnionField[] }
  | { Nullable: DataType }
  | { LowCardinality: DataType }
  | 'Unspecified'
  | 'Trigger'
  | 'AnyType'
  | { GeometricType: GeometricTypeKind }
  | 'TsVector'
  | 'TsQuery';

export type DateTimeField =
  | 'Year'
  | 'Years'
  | 'Month'
  | 'Months'
  | { Week: Ident | undefined }
  | 'Weeks'
  | 'Day'
  | 'DayOfWeek'
  | 'DayOfYear'
  | 'Days'
  | 'Date'
  | 'Datetime'
  | 'Hour'
  | 'Hours'
  | 'Minute'
  | 'Minutes'
  | 'Second'
  | 'Seconds'
  | 'Century'
  | 'Decade'
  | 'Dow'
  | 'Doy'
  | 'Epoch'
  | 'Isodow'
  | 'Isoyear'
  | 'IsoWeek'
  | 'Julian'
  | 'Microsecond'
  | 'Microseconds'
  | 'Millenium'
  | 'Millennium'
  | 'Millisecond'
  | 'Milliseconds'
  | 'Nanosecond'
  | 'Nanoseconds'
  | 'Quarter'
  | 'Time'
  | 'Timezone'
  | 'TimezoneAbbr'
  | 'TimezoneHour'
  | 'TimezoneMinute'
  | 'TimezoneRegion'
  | 'NoDateTime'
  | { Custom: Ident };

export interface Declare {
  names: Ident[];
  data_type?: DataType;
  assignment?: DeclareAssignment;
  declare_type?: DeclareType;
  binary?: boolean;
  sensitive?: boolean;
  scroll?: boolean;
  hold?: boolean;
  for_query?: Query;
}

export type DeclareAssignment =
  | { Expr: Expr }
  | { Default: Expr }
  | { DuckAssignment: Expr }
  | { For: Expr }
  | { MsSqlAssignment: Expr };

export type DeclareSeparator =
  | 'Semicolon'
  | 'Comma';

export type DeclareType =
  | 'Cursor'
  | 'ResultSet'
  | 'Exception';

export type Deduplicate =
  | 'All'
  | { ByExpression: Expr };

export type DefaultPrivilegesObjectType =
  | 'Tables'
  | 'Sequences'
  | 'Functions'
  | 'Routines'
  | 'Types'
  | 'Schemas'
  | 'LargeObjects';

export type DefaultPrivilegesOption =
  | { ForRole: Ident[] }
  | { InSchema: ObjectName[] };

export type DeferrableInitial =
  | 'Immediate'
  | 'Deferred';

export interface Delete {
  delete_token: AttachedToken;
  optimizer_hints: OptimizerHint[];
  tables: ObjectName[];
  from: FromTable;
  on_cluster?: Ident;
  using?: TableWithJoins[];
  selection?: Expr;
  returning?: SelectItem[];
  output?: OutputClause;
  order_by: OrderByExpr[];
  limit?: Expr;
  settings?: Setting[];
}

export interface DenyStatement {
  privileges: Privileges;
  objects: GrantObjects;
  grantees: Grantee[];
  granted_by?: Ident;
  cascade?: CascadeOption;
}

export type DescribeAlias =
  | 'Describe'
  | 'Explain'
  | 'Desc';

export type DetachPartitionMode =
  | 'Concurrently'
  | 'Finalize';

export interface DictionaryField {
  key: Ident;
  value: Expr;
}

export type DiscardObject =
  | 'ALL'
  | 'PLANS'
  | 'SEQUENCES'
  | 'TEMP';

export type DistStyle =
  | 'Auto'
  | 'Even'
  | 'Key'
  | 'All';

export type Distinct =
  | 'All'
  | 'Distinct'
  | { On: Expr[] };

export interface DoUpdate {
  assignments: Assignment[];
  selection?: Expr;
}

export interface DollarQuotedString {
  value: string;
  tag?: string;
}

export type DropBehavior =
  | 'Restrict'
  | 'Cascade';

export interface DropDomain {
  if_exists: boolean;
  name: ObjectName;
  drop_behavior?: DropBehavior;
}

export interface DropExtension {
  names: Ident[];
  if_exists: boolean;
  cascade_or_restrict?: ReferentialAction;
}

export interface DropFunction {
  if_exists: boolean;
  func_desc: FunctionDesc[];
  drop_behavior?: DropBehavior;
}

export type DropFunctionOption =
  | 'Restrict'
  | 'Cascade';

export interface DropOperator {
  if_exists: boolean;
  operators: DropOperatorSignature[];
  drop_behavior?: DropBehavior;
}

export interface DropOperatorClass {
  if_exists: boolean;
  names: ObjectName[];
  using: Ident;
  drop_behavior?: DropBehavior;
}

export interface DropOperatorFamily {
  if_exists: boolean;
  names: ObjectName[];
  using: Ident;
  drop_behavior?: DropBehavior;
}

export interface DropOperatorSignature {
  name: ObjectName;
  left_type?: DataType;
  right_type: DataType;
}

export interface DropPolicy {
  if_exists: boolean;
  name: Ident;
  table_name: ObjectName;
  drop_behavior?: DropBehavior;
}

export interface DropRule {
  if_exists: boolean;
  name: Ident;
  table_name: ObjectName;
  drop_behavior?: DropBehavior;
}

export interface DropTrigger {
  if_exists: boolean;
  trigger_name: ObjectName;
  table_name?: ObjectName;
  option?: ReferentialAction;
}

export type DuplicateTreatment =
  | 'Distinct'
  | 'All';

export type EmptyMatchesMode =
  | 'Show'
  | 'Omit'
  | 'WithUnmatched';

export type EnumMember =
  | { Name: string }
  | { NamedValue: [string, Expr] };

export type ExactNumberInfo =
  | 'None'
  | { Precision: number }
  | { PrecisionAndScale: [number, number] };

export interface ExceptSelectItem {
  first_element: Ident;
  additional_elements: Ident[];
}

export interface ExceptionWhen {
  idents: Ident[];
  statements: Statement[];
}

export interface ExcludeConstraint {
  name?: Ident;
  index_method?: Ident;
  elements: ExcludeConstraintElement[];
  include: Ident[];
  where_clause?: Expr;
  characteristics?: ConstraintCharacteristics;
}

export interface ExcludeConstraintElement {
  column: IndexColumn;
  operator: ExcludeConstraintOperator;
}

export type ExcludeConstraintOperator =
  | { Token: string }
  | { PGOperator: string[] };

export type ExcludeSelectItem =
  | { Single: ObjectName }
  | { Multiple: ObjectName[] };

export interface ExportData {
  options: SqlOption[];
  query: Query;
  connection?: ObjectName;
}

export type Expr =
  | { Identifier: Ident }
  | { CompoundIdentifier: Ident[] }
  | { CompoundFieldAccess: { root: Expr; access_chain: AccessExpr[] } }
  | { JsonAccess: { value: Expr; path: JsonPath } }
  | { IsFalse: Expr }
  | { IsNotFalse: Expr }
  | { IsTrue: Expr }
  | { IsNotTrue: Expr }
  | { IsNull: Expr }
  | { IsNotNull: Expr }
  | { IsUnknown: Expr }
  | { IsNotUnknown: Expr }
  | { IsDistinctFrom: [Expr, Expr] }
  | { IsNotDistinctFrom: [Expr, Expr] }
  | { IsJson: { expr: Expr; kind?: JsonPredicateType; unique_keys?: JsonKeyUniqueness; negated: boolean } }
  | { IsNormalized: { expr: Expr; form?: NormalizationForm; negated: boolean } }
  | { In: { expr: Expr; target: InTarget; negated: boolean; global: boolean } }
  | { Between: { expr: Expr; negated: boolean; low: Expr; high: Expr } }
  | { BinaryOp: { left: Expr; op: BinaryOperator; right: Expr } }
  | { Like: { negated: boolean; any: boolean; expr: Expr; pattern: Expr; escape_char?: Expr } }
  | { ILike: { negated: boolean; any: boolean; expr: Expr; pattern: Expr; escape_char?: Expr } }
  | { SimilarTo: { negated: boolean; expr: Expr; pattern: Expr; escape_char?: Expr } }
  | { RLike: { negated: boolean; expr: Expr; pattern: Expr; regexp: boolean } }
  | { AnyOp: { left: Expr; compare_op: BinaryOperator; right: Expr; is_some: boolean } }
  | { AllOp: { left: Expr; compare_op: BinaryOperator; right: Expr } }
  | { UnaryOp: { op: UnaryOperator; expr: Expr } }
  | { Convert: { is_try: boolean; expr: Expr; data_type?: DataType; charset?: ObjectName; target_before_value: boolean; styles: Expr[] } }
  | { Cast: { kind: CastKind; expr: Expr; data_type: DataType; format?: CastFormat } }
  | { AtTimeZone: { timestamp: Expr; time_zone: Expr } }
  | { Extract: { field: DateTimeField; syntax: ExtractSyntax; expr: Expr } }
  | { Ceil: { expr: Expr; field: CeilFloorKind } }
  | { Floor: { expr: Expr; field: CeilFloorKind } }
  | { Position: { expr: Expr; in: Expr } }
  | { Substring: { expr: Expr; substring_from?: Expr; substring_for?: Expr; special: boolean; shorthand: boolean } }
  | { Trim: { trim_where?: TrimWhereField; trim_what?: Expr; expr: Expr; trim_characters?: Expr[] } }
  | { Overlay: { expr: Expr; overlay_what: Expr; overlay_from: Expr; overlay_for?: Expr } }
  | { Collate: { expr: Expr; collation: ObjectName } }
  | { Nested: Expr }
  | { Value: ValueWithSpan }
  | { Prefixed: { prefix: Ident; value: Expr } }
  | { TypedString: TypedString }
  | { Function: Function }
  | { Case: { case_token: AttachedToken; end_token: AttachedToken; operand?: Expr; conditions: CaseWhen[]; else_result?: Expr } }
  | { Exists: { subquery: Query; negated: boolean } }
  | { Subquery: Query }
  | { GroupingSets: Expr[][] }
  | { Cube: Expr[][] }
  | { Rollup: Expr[][] }
  | { Tuple: Expr[] }
  | { Struct: { values: Expr[]; fields: StructField[] } }
  | { Named: { expr: Expr; name: Ident } }
  | { Dictionary: DictionaryField[] }
  | { Map: Map }
  | { Array: Array }
  | { Interval: Interval }
  | { MatchAgainst: { columns: ObjectName[]; match_value: ValueWithSpan; opt_search_modifier?: SearchModifier } }
  | { Wildcard: AttachedToken }
  | { QualifiedWildcard: [ObjectName, AttachedToken] }
  | { OuterJoin: Expr }
  | { Prior: Expr }
  | { Lambda: LambdaFunction }
  | { MemberOf: MemberOf };

export interface ExprWithAlias {
  expr: Expr;
  alias?: Ident;
}

export interface ExprWithAliasAndOrderBy {
  expr: ExprWithAlias;
  order_by: OrderByOptions;
}

export type ExtractSyntax =
  | 'From'
  | 'Comma';

export interface Fetch {
  with_ties: boolean;
  percent: boolean;
  quantity?: Expr;
}

export type FetchDirection =
  | { Count: { limit: ValueWithSpan } }
  | 'Next'
  | 'Prior'
  | 'First'
  | 'Last'
  | { Absolute: { limit: ValueWithSpan } }
  | { Relative: { limit: ValueWithSpan } }
  | 'All'
  | { Forward: { limit?: ValueWithSpan } }
  | 'ForwardAll'
  | { Backward: { limit?: ValueWithSpan } }
  | 'BackwardAll';

export type FetchPosition =
  | 'From'
  | 'In';

export type FileFormat =
  | 'TEXTFILE'
  | 'SEQUENCEFILE'
  | 'ORC'
  | 'PARQUET'
  | 'AVRO'
  | 'RCFILE'
  | 'JSONFILE';

export interface FileSize {
  size: ValueWithSpan;
  unit?: FileSizeUnit;
}

export type FileSizeUnit =
  | 'MB'
  | 'GB';

export interface FileStagingCommand {
  stage: ObjectName;
  pattern?: string;
}

export type FlushLocation =
  | 'NoWriteToBinlog'
  | 'Local';

export type FlushType =
  | 'BinaryLogs'
  | 'EngineLogs'
  | 'ErrorLogs'
  | 'GeneralLogs'
  | 'Hosts'
  | 'Logs'
  | 'Privileges'
  | 'OptimizerCosts'
  | 'RelayLogs'
  | 'SlowLogs'
  | 'Status'
  | 'UserResources'
  | 'Tables';

export type ForClause =
  | 'Browse'
  | { Json: { for_json: ForJson; root?: string; include_null_values: boolean; without_array_wrapper: boolean } }
  | { Xml: { for_xml: ForXml; elements: boolean; binary_base64: boolean; root?: string; type: boolean } };

export type ForJson =
  | 'Auto'
  | 'Path';

export type ForValues =
  | { In: Expr[] }
  | { From: { from: PartitionBoundValue[]; to: PartitionBoundValue[] } }
  | { With: { modulus: number; remainder: number } }
  | 'Default';

export type ForXml =
  | { Raw: string | undefined }
  | 'Auto'
  | 'Explicit'
  | { Path: string | undefined };

export type ForeignDataWrapperRoutineClause =
  | { Handler: ObjectName }
  | 'NoHandler'
  | { Validator: ObjectName }
  | 'NoValidator';

export interface ForeignKeyConstraint {
  name?: Ident;
  index_name?: Ident;
  columns: Ident[];
  foreign_table: ObjectName;
  referred_columns: Ident[];
  on_delete?: ReferentialAction;
  on_update?: ReferentialAction;
  match_kind?: ConstraintReferenceMatchKind;
  characteristics?: ConstraintCharacteristics;
}

export type FormatClause =
  | { Identifier: Ident }
  | 'Null';

export type FromTable =
  | { WithFromKeyword: TableWithJoins[] }
  | { WithoutKeyword: TableWithJoins[] };

export interface FullTextOrSpatialConstraint {
  fulltext: boolean;
  index_type_display: KeyOrIndexDisplay;
  opt_index_name?: Ident;
  columns: IndexColumn[];
}

export interface Function {
  name: ObjectName;
  uses_odbc_syntax: boolean;
  parameters: FunctionArguments;
  args: FunctionArguments;
  within_group: OrderByExpr[];
  filter?: Expr;
  null_treatment?: NullTreatment;
  over?: WindowType;
}

export type FunctionArg =
  | { Named: { name: Ident; arg: FunctionArgExpr; operator: FunctionArgOperator } }
  | { ExprNamed: { name: Expr; arg: FunctionArgExpr; operator: FunctionArgOperator } }
  | { Unnamed: FunctionArgExpr };

export type FunctionArgExpr =
  | { Expr: Expr }
  | { QualifiedWildcard: ObjectName }
  | 'Wildcard'
  | { WildcardWithOptions: WildcardAdditionalOptions };

export type FunctionArgOperator =
  | 'Equals'
  | 'RightArrow'
  | 'Assignment'
  | 'Colon'
  | 'Value'
  | 'Space';

export type FunctionArgumentClause =
  | { IgnoreOrRespectNulls: NullTreatment }
  | { Where: Expr }
  | { OrderBy: OrderByExpr[] }
  | { Limit: Expr }
  | { OnOverflow: ListAggOnOverflow }
  | { Having: HavingBound }
  | { Separator: ValueWithSpan }
  | { JsonNullClause: JsonNullClause }
  | { JsonReturningClause: JsonReturningClause };

export interface FunctionArgumentList {
  duplicate_treatment?: DuplicateTreatment;
  args: FunctionArg[];
  clauses: FunctionArgumentClause[];
}

export type FunctionArguments =
  | 'None'
  | { Subquery: Query }
  | { List: FunctionArgumentList };

export type FunctionBehavior =
  | 'Immutable'
  | 'Stable'
  | 'Volatile';

export type FunctionCalledOnNull =
  | 'CalledOnNullInput'
  | 'ReturnsNullOnNullInput'
  | 'Strict';

export interface FunctionDefinitionSetParam {
  name: ObjectName;
  value: FunctionSetValue;
}

export interface FunctionDesc {
  name: ObjectName;
  args?: OperateFunctionArg[];
}

export type FunctionDeterminismSpecifier =
  | 'Deterministic'
  | 'NotDeterministic';

export type FunctionParallel =
  | 'Unsafe'
  | 'Restricted'
  | 'Safe';

export type FunctionReturnType =
  | { DataType: DataType }
  | { SetOf: DataType };

export type FunctionSecurity =
  | 'Definer'
  | 'Invoker';

export type FunctionSetValue =
  | 'Default'
  | { Values: Expr[] }
  | 'FromCurrent';

export type GeneratedAs =
  | 'Always'
  | 'ByDefault'
  | 'ExpStored';

export type GeneratedExpressionMode =
  | 'Virtual'
  | 'Stored';

export type GeometricTypeKind =
  | 'Point'
  | 'Line'
  | 'LineSegment'
  | 'GeometricBox'
  | 'GeometricPath'
  | 'Polygon'
  | 'Circle';

export interface Grant {
  privileges: Privileges;
  objects?: GrantObjects;
  grantees: Grantee[];
  with_grant_option: boolean;
  as_grantor?: Ident;
  granted_by?: Ident;
  current_grants?: CurrentGrantsKind;
}

export type GrantObjects =
  | { AllSequencesInSchema: { schemas: ObjectName[] } }
  | { AllTablesInSchema: { schemas: ObjectName[] } }
  | { AllViewsInSchema: { schemas: ObjectName[] } }
  | { AllMaterializedViewsInSchema: { schemas: ObjectName[] } }
  | { AllExternalTablesInSchema: { schemas: ObjectName[] } }
  | { AllFunctionsInSchema: { schemas: ObjectName[] } }
  | { AllProceduresInSchema: { schemas: ObjectName[] } }
  | { AllRoutinesInSchema: { schemas: ObjectName[] } }
  | { FutureSchemasInDatabase: { databases: ObjectName[] } }
  | { FutureTablesInSchema: { schemas: ObjectName[] } }
  | { FutureViewsInSchema: { schemas: ObjectName[] } }
  | { FutureExternalTablesInSchema: { schemas: ObjectName[] } }
  | { FutureMaterializedViewsInSchema: { schemas: ObjectName[] } }
  | { FutureSequencesInSchema: { schemas: ObjectName[] } }
  | { Databases: ObjectName[] }
  | { Schemas: ObjectName[] }
  | { Sequences: ObjectName[] }
  | { Tables: ObjectName[] }
  | { Views: ObjectName[] }
  | { Warehouses: ObjectName[] }
  | { Integrations: ObjectName[] }
  | { ResourceMonitors: ObjectName[] }
  | { Users: ObjectName[] }
  | { ComputePools: ObjectName[] }
  | { Connections: ObjectName[] }
  | { FailoverGroup: ObjectName[] }
  | { ReplicationGroup: ObjectName[] }
  | { ExternalVolumes: ObjectName[] }
  | { Procedures: FunctionDesc[] }
  | { Functions: FunctionDesc[] }
  | { Routines: FunctionDesc[] };

export interface GrantRole {
  roles: Ident[];
  grantees: Grantee[];
  options: RoleGrantOption[];
  granted_by?: Ident;
}

export interface Grantee {
  grantee_type: GranteesType;
  name?: GranteeName;
}

export type GranteeName =
  | { ObjectName: ObjectName }
  | { UserHost: { user: Ident; host: Ident } };

export type GranteesType =
  | 'Role'
  | 'Share'
  | 'User'
  | 'Group'
  | 'Public'
  | 'DatabaseRole'
  | 'Application'
  | 'ApplicationRole'
  | 'None';

export type GroupByExpr =
  | { All: GroupByWithModifier[] }
  | { Expressions: [Expr[], GroupByWithModifier[]] };

export type GroupByWithModifier =
  | 'Rollup'
  | 'Cube'
  | 'Totals'
  | { GroupingSets: Expr };

export type HavingBound = [HavingBoundKind, Expr];

export type HavingBoundKind =
  | 'Min'
  | 'Max';

export type HiveDelimiter =
  | 'FieldsTerminatedBy'
  | 'FieldsEscapedBy'
  | 'CollectionItemsTerminatedBy'
  | 'MapKeysTerminatedBy'
  | 'LinesTerminatedBy'
  | 'NullDefinedAs';

export type HiveDescribeFormat =
  | 'Extended'
  | 'Formatted';

export type HiveDistributionStyle =
  | { PARTITIONED: { columns: ColumnDef[] } }
  | { SKEWED: { columns: ColumnDef[]; on: ColumnDef[]; stored_as_directories: boolean } }
  | 'NONE';

export interface HiveFormat {
  row_format?: HiveRowFormat;
  serde_properties?: SqlOption[];
  storage?: HiveIOFormat;
  location?: string;
}

export type HiveIOFormat =
  | { IOF: { input_format: Expr; output_format: Expr } }
  | { FileFormat: { format: FileFormat } }
  | { Using: { format: Ident } };

export interface HiveLoadDataFormat {
  serde: Expr;
  input_format: Expr;
}

export interface HiveRowDelimiter {
  delimiter: HiveDelimiter;
  char: Ident;
}

export type HiveRowFormat =
  | { SERDE: { class: string } }
  | { DELIMITED: { delimiters: HiveRowDelimiter[] } };

export interface HiveSetLocation {
  has_set: boolean;
  location: Ident;
}

export type IamRoleKind =
  | 'Default'
  | { Arn: string };

export interface Ident {
  value: string;
  quote_style?: string;
  span: Span;
}

export interface IdentWithAlias {
  ident: Ident;
  alias: Ident;
}

export interface IdentityParameters {
  seed: Expr;
  increment: Expr;
}

export interface IdentityProperty {
  parameters?: IdentityPropertyFormatKind;
  order?: IdentityPropertyOrder;
}

export type IdentityPropertyFormatKind =
  | { FunctionCall: IdentityParameters }
  | { StartAndIncrement: IdentityParameters };

export type IdentityPropertyKind =
  | { Autoincrement: IdentityProperty }
  | { Identity: IdentityProperty };

export type IdentityPropertyOrder =
  | 'Order'
  | 'NoOrder';

export interface IfStatement {
  if_block: ConditionalStatementBlock;
  elseif_blocks: ConditionalStatementBlock[];
  else_block?: ConditionalStatementBlock;
  end_token?: AttachedToken;
}

export interface IlikeSelectItem {
  pattern: string;
}

export type InTarget =
  | { List: Expr[] }
  | { Subquery: Query }
  | { Unnest: Expr }
  | { Table: { name: ObjectName; args?: FunctionArg[] } };

export interface IndexColumn {
  column: OrderByExpr;
  operator_class?: ObjectName;
}

export interface IndexConstraint {
  display_as_key: boolean;
  name?: Ident;
  index_type?: IndexType;
  columns: IndexColumn[];
  index_options: IndexOption[];
}

export type IndexOption =
  | { Using: IndexType }
  | { Comment: string };

export type IndexType =
  | 'BTree'
  | 'Hash'
  | 'GIN'
  | 'GiST'
  | 'SPGiST'
  | 'BRIN'
  | 'Bloom'
  | { Custom: Ident };

export type InitializeKind =
  | 'OnCreate'
  | 'OnSchedule';

export interface InputFormatClause {
  ident: Ident;
  values: Expr[];
}

export interface Insert {
  insert_token: AttachedToken;
  optimizer_hints: OptimizerHint[];
  or?: SqliteOnConflict;
  ignore: boolean;
  into: boolean;
  table: TableObject;
  table_alias?: TableAliasWithoutColumns;
  columns: ObjectName[];
  by_name: boolean;
  overwrite: boolean;
  source?: Query;
  assignments: Assignment[];
  partitioned?: Expr[];
  after_columns: Ident[];
  overriding?: InsertOverriding;
  has_table_keyword: boolean;
  on?: OnInsert;
  returning?: SelectItem[];
  output?: OutputClause;
  replace_into: boolean;
  priority?: MysqlInsertPriority;
  insert_alias?: InsertAliases;
  settings?: Setting[];
  format_clause?: InputFormatClause;
  multi_table_insert_type?: MultiTableInsertType;
  multi_table_into_clauses: MultiTableInsertIntoClause[];
  multi_table_when_clauses: MultiTableInsertWhenClause[];
  multi_table_else_clause?: MultiTableInsertIntoClause[];
}

export interface InsertAliases {
  row_alias: ObjectName;
  col_aliases?: Ident[];
}

export type InsertOverriding =
  | 'System'
  | 'User';

export interface Interpolate {
  exprs?: InterpolateExpr[];
}

export interface InterpolateExpr {
  column: Ident;
  expr?: Expr;
}

export interface Interval {
  value: Expr;
  leading_field?: DateTimeField;
  leading_precision?: number;
  last_field?: DateTimeField;
  fractional_seconds_precision?: number;
}

export type IntervalFields =
  | 'Year'
  | 'Month'
  | 'Day'
  | 'Hour'
  | 'Minute'
  | 'Second'
  | 'YearToMonth'
  | 'DayToHour'
  | 'DayToMinute'
  | 'DayToSecond'
  | 'HourToMinute'
  | 'HourToSecond'
  | 'MinuteToSecond';

export interface Join {
  relation: TableFactor;
  global: boolean;
  join_operator: JoinOperator;
}

export type JoinConstraint =
  | { On: Expr }
  | { Using: ObjectName[] }
  | { UsingAlias: [ObjectName[], Ident] }
  | 'Natural'
  | 'None';

export type JoinOperator =
  | { Join: JoinConstraint }
  | { Inner: JoinConstraint }
  | { Left: JoinConstraint }
  | { LeftOuter: JoinConstraint }
  | { Right: JoinConstraint }
  | { RightOuter: JoinConstraint }
  | { FullOuter: JoinConstraint }
  | { CrossJoin: JoinConstraint }
  | { Semi: JoinConstraint }
  | { LeftSemi: JoinConstraint }
  | { RightSemi: JoinConstraint }
  | { Anti: JoinConstraint }
  | { LeftAnti: JoinConstraint }
  | { RightAnti: JoinConstraint }
  | 'CrossApply'
  | 'OuterApply'
  | { AsOf: { match_condition: Expr; constraint: JoinConstraint } }
  | { StraightJoin: JoinConstraint }
  | 'ArrayJoin'
  | 'LeftArrayJoin'
  | 'InnerArrayJoin';

export type JsonKeyUniqueness =
  | 'WithUniqueKeys'
  | 'WithoutUniqueKeys';

export type JsonNullClause =
  | 'NullOnNull'
  | 'AbsentOnNull';

export interface JsonPath {
  path: JsonPathElem[];
}

export type JsonPathElem =
  | { Dot: { key: string; quoted: boolean } }
  | { Bracket: { key: Expr } }
  | { ColonBracket: { key: Expr } };

export type JsonPredicateType =
  | 'Value'
  | 'Scalar'
  | 'Array'
  | 'Object';

export interface JsonReturningClause {
  data_type: DataType;
}

export type JsonTableColumn =
  | { Named: JsonTableNamedColumn }
  | { ForOrdinality: Ident }
  | { Nested: JsonTableNestedColumn };

export type JsonTableColumnErrorHandling =
  | 'Null'
  | { Default: ValueWithSpan }
  | 'Error';

export interface JsonTableNamedColumn {
  name: Ident;
  type: DataType;
  path: ValueWithSpan;
  exists: boolean;
  on_empty?: JsonTableColumnErrorHandling;
  on_error?: JsonTableColumnErrorHandling;
}

export interface JsonTableNestedColumn {
  path: ValueWithSpan;
  columns: JsonTableColumn[];
}

export type KeyOrIndexDisplay =
  | 'None'
  | 'Key'
  | 'Index';

export interface KeyValueOption {
  option_name: string;
  option_value: KeyValueOptionKind;
}

export type KeyValueOptionKind =
  | { Single: ValueWithSpan }
  | { Multi: ValueWithSpan[] }
  | { KeyValueOptions: KeyValueOptions };

export interface KeyValueOptions {
  options: KeyValueOption[];
  delimiter: KeyValueOptionsDelimiter;
}

export type KeyValueOptionsDelimiter =
  | 'Space'
  | 'Comma';

export type Keyword =
  | 'NoKeyword'
  | 'ABORT'
  | 'ABS'
  | 'ABSENT'
  | 'ABSOLUTE'
  | 'ACCEPTANYDATE'
  | 'ACCEPTINVCHARS'
  | 'ACCESS'
  | 'ACCOUNT'
  | 'ACTION'
  | 'ADD'
  | 'ADDQUOTES'
  | 'ADMIN'
  | 'AFTER'
  | 'AGAINST'
  | 'AGGREGATE'
  | 'AGGREGATION'
  | 'ALERT'
  | 'ALGORITHM'
  | 'ALIAS'
  | 'ALIGNMENT'
  | 'ALL'
  | 'ALLOCATE'
  | 'ALLOWOVERWRITE'
  | 'ALSO'
  | 'ALTER'
  | 'ALWAYS'
  | 'ANALYZE'
  | 'AND'
  | 'ANTI'
  | 'ANY'
  | 'APPLICATION'
  | 'APPLY'
  | 'APPLYBUDGET'
  | 'APPROXIMATE'
  | 'ARCHIVE'
  | 'ARE'
  | 'ARRAY'
  | 'ARRAY_MAX_CARDINALITY'
  | 'AS'
  | 'ASC'
  | 'ASENSITIVE'
  | 'ASOF'
  | 'ASSERT'
  | 'ASYMMETRIC'
  | 'ASYNC'
  | 'AT'
  | 'ATOMIC'
  | 'ATTACH'
  | 'AUDIT'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'AUTHORIZATIONS'
  | 'AUTO'
  | 'AUTOEXTEND_SIZE'
  | 'AUTOINCREMENT'
  | 'AUTO_INCREMENT'
  | 'AVG'
  | 'AVG_ROW_LENGTH'
  | 'AVRO'
  | 'BACKUP'
  | 'BACKWARD'
  | 'BASE64'
  | 'BASETYPE'
  | 'BASE_LOCATION'
  | 'BEFORE'
  | 'BEGIN'
  | 'BEGIN_FRAME'
  | 'BEGIN_PARTITION'
  | 'BERNOULLI'
  | 'BETWEEN'
  | 'BIGDECIMAL'
  | 'BIGINT'
  | 'BIGNUMERIC'
  | 'BINARY'
  | 'BIND'
  | 'BINDING'
  | 'BIT'
  | 'BLANKSASNULL'
  | 'BLOB'
  | 'BLOCK'
  | 'BLOOM'
  | 'BLOOMFILTER'
  | 'BOOL'
  | 'BOOLEAN'
  | 'BOOST'
  | 'BOTH'
  | 'BOX'
  | 'BRIN'
  | 'BROWSE'
  | 'BTREE'
  | 'BUCKET'
  | 'BUCKETS'
  | 'BY'
  | 'BYPASSRLS'
  | 'BYTEA'
  | 'BYTES'
  | 'BZIP2'
  | 'CACHE'
  | 'CALL'
  | 'CALLED'
  | 'CANONICAL'
  | 'CARDINALITY'
  | 'CASCADE'
  | 'CASCADED'
  | 'CASE'
  | 'CASES'
  | 'CAST'
  | 'CATALOG'
  | 'CATALOGS'
  | 'CATALOG_SYNC'
  | 'CATALOG_SYNC_NAMESPACE_FLATTEN_DELIMITER'
  | 'CATALOG_SYNC_NAMESPACE_MODE'
  | 'CATCH'
  | 'CATEGORY'
  | 'CEIL'
  | 'CEILING'
  | 'CENTURY'
  | 'CHAIN'
  | 'CHANGE'
  | 'CHANGES'
  | 'CHANGE_TRACKING'
  | 'CHANNEL'
  | 'CHAR'
  | 'CHARACTER'
  | 'CHARACTERISTICS'
  | 'CHARACTERS'
  | 'CHARACTER_LENGTH'
  | 'CHARSET'
  | 'CHAR_LENGTH'
  | 'CHECK'
  | 'CHECKSUM'
  | 'CIRCLE'
  | 'CLASS'
  | 'CLEANPATH'
  | 'CLEAR'
  | 'CLOB'
  | 'CLONE'
  | 'CLOSE'
  | 'CLUSTER'
  | 'CLUSTERED'
  | 'CLUSTERING'
  | 'COALESCE'
  | 'COLLATABLE'
  | 'COLLATE'
  | 'COLLATION'
  | 'COLLECT'
  | 'COLLECTION'
  | 'COLUMN'
  | 'COLUMNS'
  | 'COLUMNSTORE'
  | 'COMBINEFUNC'
  | 'COMMENT'
  | 'COMMIT'
  | 'COMMITTED'
  | 'COMMUTATOR'
  | 'COMPATIBLE'
  | 'COMPRESS'
  | 'COMPRESSION'
  | 'COMPUPDATE'
  | 'COMPUTE'
  | 'CONCURRENTLY'
  | 'CONDITION'
  | 'CONFIGURATION'
  | 'CONFLICT'
  | 'CONNECT'
  | 'CONNECTION'
  | 'CONNECTOR'
  | 'CONNECT_BY_ROOT'
  | 'CONSTRAINT'
  | 'CONTACT'
  | 'CONTAINS'
  | 'CONTINUE'
  | 'CONVERT'
  | 'COPY'
  | 'COPY_OPTIONS'
  | 'CORR'
  | 'CORRESPONDING'
  | 'COST'
  | 'COUNT'
  | 'COVAR_POP'
  | 'COVAR_SAMP'
  | 'CREATE'
  | 'CREATEDB'
  | 'CREATEROLE'
  | 'CREDENTIALS'
  | 'CROSS'
  | 'CSV'
  | 'CUBE'
  | 'CUME_DIST'
  | 'CURRENT'
  | 'CURRENT_CATALOG'
  | 'CURRENT_DATE'
  | 'CURRENT_DEFAULT_TRANSFORM_GROUP'
  | 'CURRENT_PATH'
  | 'CURRENT_ROLE'
  | 'CURRENT_ROW'
  | 'CURRENT_SCHEMA'
  | 'CURRENT_TIME'
  | 'CURRENT_TIMESTAMP'
  | 'CURRENT_TRANSFORM_GROUP_FOR_TYPE'
  | 'CURRENT_USER'
  | 'CURSOR'
  | 'CYCLE'
  | 'DATA'
  | 'DATABASE'
  | 'DATABASES'
  | 'DATA_RETENTION_TIME_IN_DAYS'
  | 'DATE'
  | 'DATE32'
  | 'DATEFORMAT'
  | 'DATETIME'
  | 'DATETIME64'
  | 'DAY'
  | 'DAYOFWEEK'
  | 'DAYOFYEAR'
  | 'DAYS'
  | 'DCPROPERTIES'
  | 'DEALLOCATE'
  | 'DEC'
  | 'DECADE'
  | 'DECIMAL'
  | 'DECLARE'
  | 'DEDUPLICATE'
  | 'DEFAULT'
  | 'DEFAULTS'
  | 'DEFAULT_DDL_COLLATION'
  | 'DEFAULT_MFA_METHOD'
  | 'DEFAULT_SECONDARY_ROLES'
  | 'DEFERRABLE'
  | 'DEFERRED'
  | 'DEFINE'
  | 'DEFINED'
  | 'DEFINER'
  | 'DELAY'
  | 'DELAYED'
  | 'DELAY_KEY_WRITE'
  | 'DELEGATED'
  | 'DELETE'
  | 'DELIMITED'
  | 'DELIMITER'
  | 'DELTA'
  | 'DENSE_RANK'
  | 'DENY'
  | 'DEPENDS'
  | 'DEREF'
  | 'DESC'
  | 'DESCRIBE'
  | 'DESERIALFUNC'
  | 'DETACH'
  | 'DETAIL'
  | 'DETERMINISTIC'
  | 'DICTIONARY'
  | 'DIMENSIONS'
  | 'DIRECTORY'
  | 'DISABLE'
  | 'DISCARD'
  | 'DISCONNECT'
  | 'DISTINCT'
  | 'DISTINCTROW'
  | 'DISTKEY'
  | 'DISTRIBUTE'
  | 'DISTSTYLE'
  | 'DIV'
  | 'DO'
  | 'DOMAIN'
  | 'DOUBLE'
  | 'DOW'
  | 'DOWNSTREAM'
  | 'DOY'
  | 'DROP'
  | 'DRY'
  | 'DUO'
  | 'DUPLICATE'
  | 'DYNAMIC'
  | 'EACH'
  | 'ELEMENT'
  | 'ELEMENTS'
  | 'ELSE'
  | 'ELSEIF'
  | 'EMPTY'
  | 'EMPTYASNULL'
  | 'ENABLE'
  | 'ENABLE_SCHEMA_EVOLUTION'
  | 'ENCODING'
  | 'ENCRYPTED'
  | 'ENCRYPTION'
  | 'END'
  | 'END_EXEC'
  | 'ENDPOINT'
  | 'END_FRAME'
  | 'END_PARTITION'
  | 'ENFORCED'
  | 'ENGINE'
  | 'ENGINE_ATTRIBUTE'
  | 'ENROLL'
  | 'ENUM'
  | 'ENUM16'
  | 'ENUM8'
  | 'EPHEMERAL'
  | 'EPOCH'
  | 'EQUALS'
  | 'ERROR'
  | 'ESCAPE'
  | 'ESCAPED'
  | 'ESTIMATE'
  | 'EVEN'
  | 'EVENT'
  | 'EVERY'
  | 'EVOLVE'
  | 'EXCEPT'
  | 'EXCEPTION'
  | 'EXCHANGE'
  | 'EXCLUDE'
  | 'EXCLUDING'
  | 'EXCLUSIVE'
  | 'EXEC'
  | 'EXECUTE'
  | 'EXECUTION'
  | 'EXISTS'
  | 'EXP'
  | 'EXPANSION'
  | 'EXPLAIN'
  | 'EXPLICIT'
  | 'EXPORT'
  | 'EXTEND'
  | 'EXTENDED'
  | 'EXTENSION'
  | 'EXTERNAL'
  | 'EXTERNAL_VOLUME'
  | 'EXTRACT'
  | 'FACTS'
  | 'FAIL'
  | 'FAILOVER'
  | 'FALLBACK'
  | 'FALSE'
  | 'FAMILY'
  | 'FETCH'
  | 'FIELDS'
  | 'FILE'
  | 'FILES'
  | 'FILE_FORMAT'
  | 'FILL'
  | 'FILTER'
  | 'FINAL'
  | 'FINALFUNC'
  | 'FINALFUNC_EXTRA'
  | 'FINALFUNC_MODIFY'
  | 'FINALIZE'
  | 'FIRST'
  | 'FIRST_VALUE'
  | 'FIXEDSTRING'
  | 'FIXEDWIDTH'
  | 'FLATTEN'
  | 'FLOAT'
  | 'FLOAT32'
  | 'FLOAT4'
  | 'FLOAT64'
  | 'FLOAT8'
  | 'FLOOR'
  | 'FLUSH'
  | 'FN'
  | 'FOLLOWING'
  | 'FOR'
  | 'FORCE'
  | 'FORCE_NOT_NULL'
  | 'FORCE_NULL'
  | 'FORCE_QUOTE'
  | 'FOREIGN'
  | 'FORMAT'
  | 'FORMATTED'
  | 'FORWARD'
  | 'FRAME_ROW'
  | 'FREE'
  | 'FREEZE'
  | 'FROM'
  | 'FSCK'
  | 'FULFILLMENT'
  | 'FULL'
  | 'FULLTEXT'
  | 'FUNCTION'
  | 'FUNCTIONS'
  | 'FUSION'
  | 'FUTURE'
  | 'GB'
  | 'GENERAL'
  | 'GENERATE'
  | 'GENERATED'
  | 'GEOGRAPHY'
  | 'GET'
  | 'GIN'
  | 'GIST'
  | 'GLOB'
  | 'GLOBAL'
  | 'GRANT'
  | 'GRANTED'
  | 'GRANTS'
  | 'GRAPHVIZ'
  | 'GROUP'
  | 'GROUPING'
  | 'GROUPS'
  | 'GZIP'
  | 'HANDLER'
  | 'HASH'
  | 'HASHES'
  | 'HAVING'
  | 'HEADER'
  | 'HEAP'
  | 'HIGH_PRIORITY'
  | 'HISTORY'
  | 'HIVEVAR'
  | 'HOLD'
  | 'HOSTS'
  | 'HOUR'
  | 'HOURS'
  | 'HUGEINT'
  | 'HYPOTHETICAL'
  | 'IAM_ROLE'
  | 'ICEBERG'
  | 'ID'
  | 'IDENTIFIED'
  | 'IDENTITY'
  | 'IDENTITY_INSERT'
  | 'IF'
  | 'IGNORE'
  | 'IGNOREHEADER'
  | 'ILIKE'
  | 'IMMEDIATE'
  | 'IMMUTABLE'
  | 'IMPORT'
  | 'IMPORTED'
  | 'IN'
  | 'INCLUDE'
  | 'INCLUDE_NULL_VALUES'
  | 'INCLUDING'
  | 'INCREMENT'
  | 'INCREMENTAL'
  | 'INDEX'
  | 'INDEXED'
  | 'INDICATOR'
  | 'INHERIT'
  | 'INHERITS'
  | 'INITCOND'
  | 'INITIALIZE'
  | 'INITIALLY'
  | 'INNER'
  | 'INOUT'
  | 'INPATH'
  | 'INPLACE'
  | 'INPUT'
  | 'INPUTFORMAT'
  | 'INSENSITIVE'
  | 'INSERT'
  | 'INSERT_METHOD'
  | 'INSTALL'
  | 'INSTANT'
  | 'INSTEAD'
  | 'INT'
  | 'INT128'
  | 'INT16'
  | 'INT2'
  | 'INT256'
  | 'INT32'
  | 'INT4'
  | 'INT64'
  | 'INT8'
  | 'INTEGER'
  | 'INTEGRATION'
  | 'INTERNALLENGTH'
  | 'INTERPOLATE'
  | 'INTERSECT'
  | 'INTERSECTION'
  | 'INTERVAL'
  | 'INTO'
  | 'INVISIBLE'
  | 'INVOKER'
  | 'IO'
  | 'IS'
  | 'ISODOW'
  | 'ISOLATION'
  | 'ISOWEEK'
  | 'ISOYEAR'
  | 'ITEMS'
  | 'JAR'
  | 'JOIN'
  | 'JSON'
  | 'JSONB'
  | 'JSONFILE'
  | 'JSON_TABLE'
  | 'JULIAN'
  | 'KEY'
  | 'KEYS'
  | 'KEY_BLOCK_SIZE'
  | 'KILL'
  | 'LAG'
  | 'LAMBDA'
  | 'LANGUAGE'
  | 'LARGE'
  | 'LAST'
  | 'LAST_VALUE'
  | 'LATERAL'
  | 'LEAD'
  | 'LEADING'
  | 'LEAKPROOF'
  | 'LEAST'
  | 'LEFT'
  | 'LEFTARG'
  | 'LEVEL'
  | 'LIFECYCLE'
  | 'LIKE'
  | 'LIKE_REGEX'
  | 'LIMIT'
  | 'LINE'
  | 'LINES'
  | 'LIST'
  | 'LISTEN'
  | 'LISTING'
  | 'LN'
  | 'LOAD'
  | 'LOCAL'
  | 'LOCALTIME'
  | 'LOCALTIMESTAMP'
  | 'LOCATION'
  | 'LOCK'
  | 'LOCKED'
  | 'LOG'
  | 'LOGGED'
  | 'LOGIN'
  | 'LOGS'
  | 'LONG'
  | 'LONGBLOB'
  | 'LONGTEXT'
  | 'LOWCARDINALITY'
  | 'LOWER'
  | 'LOW_PRIORITY'
  | 'LS'
  | 'LSEG'
  | 'MACRO'
  | 'MAIN'
  | 'MANAGE'
  | 'MANAGED'
  | 'MANAGEDLOCATION'
  | 'MANIFEST'
  | 'MAP'
  | 'MAPPING'
  | 'MASKING'
  | 'MATCH'
  | 'MATCHED'
  | 'MATCHES'
  | 'MATCH_CONDITION'
  | 'MATCH_RECOGNIZE'
  | 'MATERIALIZE'
  | 'MATERIALIZED'
  | 'MAX'
  | 'MAXFILESIZE'
  | 'MAXVALUE'
  | 'MAX_DATA_EXTENSION_TIME_IN_DAYS'
  | 'MAX_ROWS'
  | 'MB'
  | 'MEASURES'
  | 'MEDIUMBLOB'
  | 'MEDIUMINT'
  | 'MEDIUMTEXT'
  | 'MEMBER'
  | 'MERGE'
  | 'MERGES'
  | 'MESSAGE'
  | 'METADATA'
  | 'METHOD'
  | 'METRIC'
  | 'METRICS'
  | 'MFA'
  | 'MFINALFUNC'
  | 'MFINALFUNC_EXTRA'
  | 'MFINALFUNC_MODIFY'
  | 'MICROSECOND'
  | 'MICROSECONDS'
  | 'MILLENIUM'
  | 'MILLENNIUM'
  | 'MILLISECOND'
  | 'MILLISECONDS'
  | 'MIN'
  | 'MINITCOND'
  | 'MINUS'
  | 'MINUTE'
  | 'MINUTES'
  | 'MINVALUE'
  | 'MINVFUNC'
  | 'MIN_ROWS'
  | 'MOD'
  | 'MODE'
  | 'MODIFIES'
  | 'MODIFY'
  | 'MODULE'
  | 'MODULUS'
  | 'MONITOR'
  | 'MONTH'
  | 'MONTHS'
  | 'MSCK'
  | 'MSFUNC'
  | 'MSSPACE'
  | 'MSTYPE'
  | 'MULTIRANGE_TYPE_NAME'
  | 'MULTISET'
  | 'MUTATION'
  | 'NAME'
  | 'NAMES'
  | 'NANOSECOND'
  | 'NANOSECONDS'
  | 'NATIONAL'
  | 'NATURAL'
  | 'NCHAR'
  | 'NCLOB'
  | 'NEGATOR'
  | 'NEST'
  | 'NESTED'
  | 'NETWORK'
  | 'NEW'
  | 'NEXT'
  | 'NFC'
  | 'NFD'
  | 'NFKC'
  | 'NFKD'
  | 'NO'
  | 'NOBYPASSRLS'
  | 'NOCOMPRESS'
  | 'NOCREATEDB'
  | 'NOCREATEROLE'
  | 'NOCYCLE'
  | 'NOINHERIT'
  | 'NOLOGIN'
  | 'NONE'
  | 'NOORDER'
  | 'NOREPLICATION'
  | 'NORMALIZE'
  | 'NORMALIZED'
  | 'NOSCAN'
  | 'NOSUPERUSER'
  | 'NOT'
  | 'NOTHING'
  | 'NOTIFY'
  | 'NOTNULL'
  | 'NOWAIT'
  | 'NO_WRITE_TO_BINLOG'
  | 'NTH_VALUE'
  | 'NTILE'
  | 'NULL'
  | 'NULLABLE'
  | 'NULLIF'
  | 'NULLS'
  | 'NUMBER'
  | 'NUMERIC'
  | 'NVARCHAR'
  | 'OBJECT'
  | 'OBJECTS'
  | 'OCCURRENCES_REGEX'
  | 'OCTETS'
  | 'OCTET_LENGTH'
  | 'OF'
  | 'OFF'
  | 'OFFSET'
  | 'OFFSETS'
  | 'OLD'
  | 'OMIT'
  | 'ON'
  | 'ONE'
  | 'ONLY'
  | 'ON_CREATE'
  | 'ON_SCHEDULE'
  | 'OPEN'
  | 'OPENJSON'
  | 'OPERATE'
  | 'OPERATOR'
  | 'OPTIMIZATION'
  | 'OPTIMIZE'
  | 'OPTIMIZED'
  | 'OPTIMIZER_COSTS'
  | 'OPTION'
  | 'OPTIONS'
  | 'OR'
  | 'ORC'
  | 'ORDER'
  | 'ORDINALITY'
  | 'ORGANIZATION'
  | 'OTHER'
  | 'OTP'
  | 'OUT'
  | 'OUTER'
  | 'OUTPUT'
  | 'OUTPUTFORMAT'
  | 'OVER'
  | 'OVERFLOW'
  | 'OVERLAPS'
  | 'OVERLAY'
  | 'OVERRIDE'
  | 'OVERRIDING'
  | 'OVERWRITE'
  | 'OWNED'
  | 'OWNER'
  | 'OWNERSHIP'
  | 'PACKAGE'
  | 'PACKAGES'
  | 'PACK_KEYS'
  | 'PARALLEL'
  | 'PARAMETER'
  | 'PARQUET'
  | 'PARSER'
  | 'PART'
  | 'PARTIAL'
  | 'PARTITION'
  | 'PARTITIONED'
  | 'PARTITIONS'
  | 'PASSEDBYVALUE'
  | 'PASSING'
  | 'PASSKEY'
  | 'PASSWORD'
  | 'PAST'
  | 'PATH'
  | 'PATTERN'
  | 'PCTFREE'
  | 'PER'
  | 'PERCENT'
  | 'PERCENTILE_CONT'
  | 'PERCENTILE_DISC'
  | 'PERCENT_RANK'
  | 'PERIOD'
  | 'PERMISSIVE'
  | 'PERSISTENT'
  | 'PIVOT'
  | 'PLACING'
  | 'PLAIN'
  | 'PLAN'
  | 'PLANS'
  | 'POINT'
  | 'POLICY'
  | 'POLYGON'
  | 'POOL'
  | 'PORTION'
  | 'POSITION'
  | 'POSITION_REGEX'
  | 'POWER'
  | 'PRAGMA'
  | 'PRECEDES'
  | 'PRECEDING'
  | 'PRECISION'
  | 'PREFERRED'
  | 'PREPARE'
  | 'PRESERVE'
  | 'PRESET'
  | 'PREWHERE'
  | 'PRIMARY'
  | 'PRINT'
  | 'PRIOR'
  | 'PRIVILEGES'
  | 'PROC'
  | 'PROCEDURE'
  | 'PROCEDURES'
  | 'PROCESSLIST'
  | 'PROFILE'
  | 'PROGRAM'
  | 'PROJECTION'
  | 'PUBLIC'
  | 'PURCHASE'
  | 'PURGE'
  | 'PUT'
  | 'QUALIFY'
  | 'QUARTER'
  | 'QUERIES'
  | 'QUERY'
  | 'QUOTE'
  | 'RAISE'
  | 'RAISERROR'
  | 'RANGE'
  | 'RANK'
  | 'RAW'
  | 'RCFILE'
  | 'READ'
  | 'READS'
  | 'READ_ONLY'
  | 'READ_WRITE'
  | 'REAL'
  | 'RECEIVE'
  | 'RECLUSTER'
  | 'RECURSIVE'
  | 'REF'
  | 'REFERENCES'
  | 'REFERENCING'
  | 'REFRESH'
  | 'REFRESH_MODE'
  | 'REGCLASS'
  | 'REGEXP'
  | 'REGION'
  | 'REGR_AVGX'
  | 'REGR_AVGY'
  | 'REGR_COUNT'
  | 'REGR_INTERCEPT'
  | 'REGR_R2'
  | 'REGR_SLOPE'
  | 'REGR_SXX'
  | 'REGR_SXY'
  | 'REGR_SYY'
  | 'REINDEX'
  | 'RELATIVE'
  | 'RELAY'
  | 'RELEASE'
  | 'RELEASES'
  | 'REMAINDER'
  | 'REMOTE'
  | 'REMOVE'
  | 'REMOVEQUOTES'
  | 'RENAME'
  | 'REORG'
  | 'REPAIR'
  | 'REPEATABLE'
  | 'REPLACE'
  | 'REPLACE_INVALID_CHARACTERS'
  | 'REPLICA'
  | 'REPLICATE'
  | 'REPLICATION'
  | 'REQUIRE'
  | 'RESET'
  | 'RESOLVE'
  | 'RESOURCE'
  | 'RESPECT'
  | 'RESTART'
  | 'RESTRICT'
  | 'RESTRICTED'
  | 'RESTRICTIONS'
  | 'RESTRICTIVE'
  | 'RESULT'
  | 'RESULTSET'
  | 'RESUME'
  | 'RETAIN'
  | 'RETURN'
  | 'RETURNING'
  | 'RETURNS'
  | 'REVOKE'
  | 'RIGHT'
  | 'RIGHTARG'
  | 'RLIKE'
  | 'RM'
  | 'ROLE'
  | 'ROLES'
  | 'ROLLBACK'
  | 'ROLLUP'
  | 'ROOT'
  | 'ROUTINE'
  | 'ROUTINES'
  | 'ROW'
  | 'ROWGROUPSIZE'
  | 'ROWID'
  | 'ROWS'
  | 'ROW_FORMAT'
  | 'ROW_NUMBER'
  | 'RULE'
  | 'RUN'
  | 'SAFE'
  | 'SAFE_CAST'
  | 'SAMPLE'
  | 'SAVEPOINT'
  | 'SCALAR'
  | 'SCHEMA'
  | 'SCHEMAS'
  | 'SCOPE'
  | 'SCROLL'
  | 'SEARCH'
  | 'SECOND'
  | 'SECONDARY'
  | 'SECONDARY_ENGINE_ATTRIBUTE'
  | 'SECONDS'
  | 'SECRET'
  | 'SECURE'
  | 'SECURITY'
  | 'SEED'
  | 'SELECT'
  | 'SEMANTIC_VIEW'
  | 'SEMI'
  | 'SEND'
  | 'SENSITIVE'
  | 'SEPARATOR'
  | 'SEQUENCE'
  | 'SEQUENCEFILE'
  | 'SEQUENCES'
  | 'SERDE'
  | 'SERDEPROPERTIES'
  | 'SERIALFUNC'
  | 'SERIALIZABLE'
  | 'SERVER'
  | 'SERVICE'
  | 'SESSION'
  | 'SESSION_USER'
  | 'SET'
  | 'SETERROR'
  | 'SETOF'
  | 'SETS'
  | 'SETTINGS'
  | 'SFUNC'
  | 'SHARE'
  | 'SHAREABLE'
  | 'SHARED'
  | 'SHARING'
  | 'SHOW'
  | 'SIGNED'
  | 'SIMILAR'
  | 'SIMPLE'
  | 'SIZE'
  | 'SKIP'
  | 'SLOW'
  | 'SMALLINT'
  | 'SNAPSHOT'
  | 'SOME'
  | 'SORT'
  | 'SORTED'
  | 'SORTKEY'
  | 'SORTOP'
  | 'SOURCE'
  | 'SPATIAL'
  | 'SPECIFIC'
  | 'SPECIFICTYPE'
  | 'SPGIST'
  | 'SQL'
  | 'SQLEXCEPTION'
  | 'SQLSTATE'
  | 'SQLWARNING'
  | 'SQL_BIG_RESULT'
  | 'SQL_BUFFER_RESULT'
  | 'SQL_CALC_FOUND_ROWS'
  | 'SQL_NO_CACHE'
  | 'SQL_SMALL_RESULT'
  | 'SQRT'
  | 'SRID'
  | 'SSPACE'
  | 'STABLE'
  | 'STAGE'
  | 'START'
  | 'STARTS'
  | 'STATEMENT'
  | 'STATIC'
  | 'STATISTICS'
  | 'STATS_AUTO_RECALC'
  | 'STATS_PERSISTENT'
  | 'STATS_SAMPLE_PAGES'
  | 'STATUPDATE'
  | 'STATUS'
  | 'STDDEV_POP'
  | 'STDDEV_SAMP'
  | 'STDIN'
  | 'STDOUT'
  | 'STEP'
  | 'STORAGE'
  | 'STORAGE_INTEGRATION'
  | 'STORAGE_SERIALIZATION_POLICY'
  | 'STORED'
  | 'STRAIGHT_JOIN'
  | 'STREAM'
  | 'STRICT'
  | 'STRING'
  | 'STRUCT'
  | 'STYPE'
  | 'SUBMULTISET'
  | 'SUBSCRIPT'
  | 'SUBSTR'
  | 'SUBSTRING'
  | 'SUBSTRING_REGEX'
  | 'SUBTYPE'
  | 'SUBTYPE_DIFF'
  | 'SUBTYPE_OPCLASS'
  | 'SUCCEEDS'
  | 'SUM'
  | 'SUPER'
  | 'SUPERUSER'
  | 'SUPPORT'
  | 'SUSPEND'
  | 'SWAP'
  | 'SYMMETRIC'
  | 'SYNC'
  | 'SYNONYM'
  | 'SYSTEM'
  | 'SYSTEM_TIME'
  | 'SYSTEM_USER'
  | 'TABLE'
  | 'TABLES'
  | 'TABLESAMPLE'
  | 'TABLESPACE'
  | 'TAG'
  | 'TARGET'
  | 'TARGET_LAG'
  | 'TASK'
  | 'TBLPROPERTIES'
  | 'TEMP'
  | 'TEMPLATE'
  | 'TEMPORARY'
  | 'TEMPTABLE'
  | 'TERMINATED'
  | 'TERSE'
  | 'TEXT'
  | 'TEXTFILE'
  | 'THEN'
  | 'THROW'
  | 'TIES'
  | 'TIME'
  | 'TIMEFORMAT'
  | 'TIMESTAMP'
  | 'TIMESTAMPTZ'
  | 'TIMESTAMP_NTZ'
  | 'TIMETZ'
  | 'TIMEZONE'
  | 'TIMEZONE_ABBR'
  | 'TIMEZONE_HOUR'
  | 'TIMEZONE_MINUTE'
  | 'TIMEZONE_REGION'
  | 'TINYBLOB'
  | 'TINYINT'
  | 'TINYTEXT'
  | 'TO'
  | 'TOP'
  | 'TOTALS'
  | 'TOTP'
  | 'TRACE'
  | 'TRAILING'
  | 'TRAN'
  | 'TRANSACTION'
  | 'TRANSIENT'
  | 'TRANSLATE'
  | 'TRANSLATE_REGEX'
  | 'TRANSLATION'
  | 'TREAT'
  | 'TREE'
  | 'TRIGGER'
  | 'TRIM'
  | 'TRIM_ARRAY'
  | 'TRUE'
  | 'TRUNCATE'
  | 'TRUNCATECOLUMNS'
  | 'TRY'
  | 'TRY_CAST'
  | 'TRY_CONVERT'
  | 'TSQUERY'
  | 'TSVECTOR'
  | 'TUPLE'
  | 'TYPE'
  | 'TYPES'
  | 'TYPMOD_IN'
  | 'TYPMOD_OUT'
  | 'UBIGINT'
  | 'UESCAPE'
  | 'UHUGEINT'
  | 'UINT128'
  | 'UINT16'
  | 'UINT256'
  | 'UINT32'
  | 'UINT64'
  | 'UINT8'
  | 'UNBOUNDED'
  | 'UNCACHE'
  | 'UNCOMMITTED'
  | 'UNDEFINED'
  | 'UNFREEZE'
  | 'UNION'
  | 'UNIQUE'
  | 'UNKNOWN'
  | 'UNLISTEN'
  | 'UNLOAD'
  | 'UNLOCK'
  | 'UNLOGGED'
  | 'UNMATCHED'
  | 'UNNEST'
  | 'UNPIVOT'
  | 'UNSAFE'
  | 'UNSET'
  | 'UNSIGNED'
  | 'UNTIL'
  | 'UPDATE'
  | 'UPPER'
  | 'URL'
  | 'USAGE'
  | 'USE'
  | 'USER'
  | 'USER_RESOURCES'
  | 'USING'
  | 'USMALLINT'
  | 'UTINYINT'
  | 'UUID'
  | 'VACUUM'
  | 'VALID'
  | 'VALIDATE'
  | 'VALIDATION_MODE'
  | 'VALIDATOR'
  | 'VALUE'
  | 'VALUES'
  | 'VALUE_OF'
  | 'VARBINARY'
  | 'VARBIT'
  | 'VARCHAR'
  | 'VARCHAR2'
  | 'VARIABLE'
  | 'VARIABLES'
  | 'VARIADIC'
  | 'VARYING'
  | 'VAR_POP'
  | 'VAR_SAMP'
  | 'VERBOSE'
  | 'VERSION'
  | 'VERSIONING'
  | 'VERSIONS'
  | 'VIEW'
  | 'VIEWS'
  | 'VIRTUAL'
  | 'VOLATILE'
  | 'VOLUME'
  | 'WAITFOR'
  | 'WAREHOUSE'
  | 'WAREHOUSES'
  | 'WEEK'
  | 'WEEKS'
  | 'WHEN'
  | 'WHENEVER'
  | 'WHERE'
  | 'WHILE'
  | 'WIDTH_BUCKET'
  | 'WINDOW'
  | 'WITH'
  | 'WITHIN'
  | 'WITHOUT'
  | 'WITHOUT_ARRAY_WRAPPER'
  | 'WORK'
  | 'WORKLOAD_IDENTITY'
  | 'WRAPPER'
  | 'WRITE'
  | 'XML'
  | 'XMLNAMESPACES'
  | 'XMLTABLE'
  | 'XOR'
  | 'YEAR'
  | 'YEARS'
  | 'YES'
  | 'ZEROFILL'
  | 'ZONE'
  | 'ZORDER'
  | 'ZSTD';

export type KillType =
  | 'Connection'
  | 'Query'
  | 'Mutation';

export interface LambdaFunction {
  params: OneOrManyWithParens<LambdaFunctionParameter>;
  body: Expr;
  syntax: LambdaSyntax;
}

export interface LambdaFunctionParameter {
  name: Ident;
  data_type?: DataType;
}

export type LambdaSyntax =
  | 'Arrow'
  | 'LambdaKeyword';

export interface LateralView {
  lateral_view: Expr;
  lateral_view_name: ObjectName;
  lateral_col_alias: Ident[];
  outer: boolean;
}

export type LimitClause =
  | { LimitOffset: { limit?: Expr; offset?: Offset; limit_by: Expr[] } }
  | { OffsetCommaLimit: { offset: Expr; limit: Expr } };

export type ListAggOnOverflow =
  | 'Error'
  | { Truncate: { filler?: Expr; with_count: boolean } };

export interface Location {
  line: number;
  column: number;
}

export interface Lock {
  tables: LockTableTarget[];
  lock_mode?: LockTableMode;
  nowait: boolean;
}

export interface LockClause {
  lock_type: LockType;
  of?: ObjectName;
  nonblock?: NonBlock;
}

export interface LockTable {
  table: Ident;
  alias?: Ident;
  lock_type: LockTableType;
}

export type LockTableMode =
  | 'AccessShare'
  | 'RowShare'
  | 'RowExclusive'
  | 'ShareUpdateExclusive'
  | 'Share'
  | 'ShareRowExclusive'
  | 'Exclusive'
  | 'AccessExclusive';

export interface LockTableTarget {
  name: ObjectName;
  only: boolean;
  has_asterisk: boolean;
}

export type LockTableType =
  | { Read: { local: boolean } }
  | { Write: { low_priority: boolean } };

export type LockType =
  | 'Share'
  | 'Update';

export interface MacroArg {
  name: Ident;
  default_expr?: Expr;
}

export type MacroDefinition =
  | { Expr: Expr }
  | { Table: Query };

export interface Map {
  entries: MapEntry[];
}

export type MapBracketKind =
  | 'Parentheses'
  | 'ParenthesesNotNull'
  | 'AngleBrackets';

export interface MapEntry {
  key: Expr;
  value: Expr;
}

export type MatchRecognizePattern =
  | { Symbol: MatchRecognizeSymbol }
  | { Exclude: MatchRecognizeSymbol }
  | { Permute: MatchRecognizeSymbol[] }
  | { Concat: MatchRecognizePattern[] }
  | { Group: MatchRecognizePattern }
  | { Alternation: MatchRecognizePattern[] }
  | { Repetition: [MatchRecognizePattern, RepetitionQuantifier] };

export type MatchRecognizeSymbol =
  | { Named: Ident }
  | 'Start'
  | 'End';

export interface Measure {
  expr: Expr;
  alias: Ident;
}

export interface MemberOf {
  value: Expr;
  array: Expr;
}

export interface Merge {
  merge_token: AttachedToken;
  optimizer_hints: OptimizerHint[];
  into: boolean;
  table: TableFactor;
  source: TableFactor;
  on: Expr;
  clauses: MergeClause[];
  output?: OutputClause;
}

export type MergeAction =
  | { Insert: MergeInsertExpr }
  | { Update: MergeUpdateExpr }
  | { Delete: { delete_token: AttachedToken } }
  | { DoNothing: { do_token: AttachedToken; nothing_token: AttachedToken } };

export interface MergeClause {
  when_token: AttachedToken;
  clause_kind: MergeClauseKind;
  predicate?: Expr;
  action: MergeAction;
}

export type MergeClauseKind =
  | 'Matched'
  | 'NotMatched'
  | 'NotMatchedByTarget'
  | 'NotMatchedBySource';

export interface MergeInsertExpr {
  insert_token: AttachedToken;
  columns: ObjectName[];
  kind_token: AttachedToken;
  kind: MergeInsertKind;
  insert_predicate?: Expr;
}

export type MergeInsertKind =
  | { Values: Values }
  | 'Row'
  | 'Wildcard';

export interface MergeUpdateExpr {
  update_token: AttachedToken;
  kind: MergeUpdateKind;
  update_predicate?: Expr;
  delete_predicate?: Expr;
}

export type MergeUpdateKind =
  | { Set: Assignment[] }
  | 'Wildcard';

export interface Method {
  expr: Expr;
  method_chain: Function[];
}

export type MfaMethodKind =
  | 'PassKey'
  | 'Totp'
  | 'Duo';

export type MinMaxValue =
  | 'Empty'
  | 'None'
  | { Some: Expr };

export interface Msck {
  table_name: ObjectName;
  repair: boolean;
  partition_action?: AddDropSync;
}

export interface MultiTableInsertIntoClause {
  table_name: ObjectName;
  columns: Ident[];
  values?: MultiTableInsertValues;
}

export type MultiTableInsertType =
  | 'All'
  | 'First';

export type MultiTableInsertValue =
  | { Expr: Expr }
  | 'Default';

export interface MultiTableInsertValues {
  values: MultiTableInsertValue[];
}

export interface MultiTableInsertWhenClause {
  condition: Expr;
  into_clauses: MultiTableInsertIntoClause[];
}

export type MySQLColumnPosition =
  | 'First'
  | { After: Ident };

export type MysqlInsertPriority =
  | 'LowPriority'
  | 'Delayed'
  | 'HighPriority';

export interface NamedParenthesizedList {
  key: Ident;
  name?: Ident;
  values: Ident[];
}

export type NamedWindowDefinition = [Ident, NamedWindowExpr];

export type NamedWindowExpr =
  | { NamedWindow: Ident }
  | { WindowSpec: WindowSpec };

export type NonBlock =
  | 'Nowait'
  | 'SkipLocked';

export type NormalizationForm =
  | 'NFC'
  | 'NFD'
  | 'NFKC'
  | 'NFKD';

export type NullInclusion =
  | 'IncludeNulls'
  | 'ExcludeNulls';

export type NullTreatment =
  | 'IgnoreNulls'
  | 'RespectNulls';

export type NullsDistinctOption =
  | 'None'
  | 'Distinct'
  | 'NotDistinct';

export type ObjectName = ObjectNamePart[];

export type ObjectNamePart =
  | { Identifier: Ident }
  | { Function: ObjectNamePartFunction };

export interface ObjectNamePartFunction {
  name: Ident;
  args: FunctionArg[];
}

export type ObjectType =
  | 'Collation'
  | 'Table'
  | 'ForeignTable'
  | 'View'
  | 'MaterializedView'
  | 'Index'
  | 'Schema'
  | 'Database'
  | 'Role'
  | 'Group'
  | 'Sequence'
  | 'Stage'
  | 'Type'
  | 'User'
  | 'Stream'
  | 'Warehouse';

export interface Offset {
  value: Expr;
  rows: OffsetRows;
}

export type OffsetRows =
  | 'None'
  | 'Row'
  | 'Rows';

export type OnCommit =
  | 'DeleteRows'
  | 'PreserveRows'
  | 'Drop';

export interface OnConflict {
  conflict_target?: ConflictTarget;
  action: OnConflictAction;
}

export type OnConflictAction =
  | 'DoNothing'
  | { DoUpdate: DoUpdate };

export type OnInsert =
  | { DuplicateKeyUpdate: Assignment[] }
  | { OnConflict: OnConflict };

export type OneOrManyWithParens<T> =
  | { One: T }
  | { Many: T[] };

export interface OpenJsonTableColumn {
  name: Ident;
  type: DataType;
  path?: string;
  as_json: boolean;
}

export interface OpenStatement {
  cursor_name: Ident;
}

export interface OperateFunctionArg {
  mode?: ArgMode;
  name?: Ident;
  data_type: DataType;
  default_expr?: Expr;
}

export interface OperatorArgTypes {
  left: DataType;
  right: DataType;
}

export type OperatorClassItem =
  | { Operator: { strategy_number: number; operator_name: ObjectName; op_types?: OperatorArgTypes; purpose?: OperatorPurpose } }
  | { Function: { support_number: number; op_types?: DataType[]; function_name: ObjectName; argument_types: DataType[] } }
  | { Storage: { storage_type: DataType } };

export type OperatorFamilyDropItem =
  | { Operator: { strategy_number: number; op_types: DataType[] } }
  | { Function: { support_number: number; op_types: DataType[] } };

export type OperatorFamilyItem =
  | { Operator: { strategy_number: number; operator_name: ObjectName; op_types: DataType[]; purpose?: OperatorPurpose } }
  | { Function: { support_number: number; op_types?: DataType[]; function_name: ObjectName; argument_types: DataType[] } };

export type OperatorOption =
  | { Restrict: ObjectName | undefined }
  | { Join: ObjectName | undefined }
  | { Commutator: ObjectName }
  | { Negator: ObjectName }
  | 'Hashes'
  | 'Merges';

export type OperatorPurpose =
  | 'ForSearch'
  | { ForOrderBy: { sort_family: ObjectName } };

export interface OptimizerHint {
  prefix: string;
  text: string;
  style: OptimizerHintStyle;
}

export type OptimizerHintStyle =
  | { SingleLine: { prefix: string } }
  | 'MultiLine';

export interface OrderBy {
  kind: OrderByKind;
  interpolate?: Interpolate;
}

export interface OrderByExpr {
  expr: Expr;
  options: OrderByOptions;
  with_fill?: WithFill;
}

export type OrderByKind =
  | { All: OrderByOptions }
  | { Expressions: OrderByExpr[] };

export interface OrderByOptions {
  sort?: OrderBySort;
  nulls_first?: boolean;
}

export type OrderBySort =
  | 'Asc'
  | 'Desc'
  | { Using: ObjectName };

export type OutputClause =
  | { Output: { output_token: AttachedToken; select_items: SelectItem[]; into_table?: SelectInto } }
  | { Returning: { returning_token: AttachedToken; select_items: SelectItem[] } };

export type Owner =
  | { Ident: Ident }
  | 'CurrentRole'
  | 'CurrentUser'
  | 'SessionUser';

export interface Parens<T> {
  opening_token: AttachedToken;
  content: T;
  closing_token: AttachedToken;
}

export type Partition =
  | { Identifier: Ident }
  | { Expr: Expr }
  | { Part: Expr }
  | { Partitions: Expr[] };

export type PartitionBoundValue =
  | { Expr: Expr }
  | 'MinValue'
  | 'MaxValue';

export type PartitionRangeDirection =
  | 'Left'
  | 'Right';

export type Password =
  | { Password: Expr }
  | 'NullPassword';

export type PipeOperator =
  | { Limit: { expr: Expr; offset?: Expr } }
  | { Where: { expr: Expr } }
  | { OrderBy: { exprs: OrderByExpr[] } }
  | { Select: { exprs: SelectItem[] } }
  | { Extend: { exprs: SelectItem[] } }
  | { Set: { assignments: Assignment[] } }
  | { Drop: { columns: Ident[] } }
  | { As: { alias: Ident } }
  | { Aggregate: { full_table_exprs: ExprWithAliasAndOrderBy[]; group_by_expr: ExprWithAliasAndOrderBy[] } }
  | { TableSample: { sample: TableSample } }
  | { Rename: { mappings: IdentWithAlias[] } }
  | { Union: { set_quantifier: SetQuantifier; queries: Query[] } }
  | { Intersect: { set_quantifier: SetQuantifier; queries: Query[] } }
  | { Except: { set_quantifier: SetQuantifier; queries: Query[] } }
  | { Call: { function: Function; alias?: Ident } }
  | { Pivot: { aggregate_functions: ExprWithAlias[]; value_column: Ident[]; value_source: PivotValueSource; alias?: Ident } }
  | { Unpivot: { value_column: Ident; name_column: Ident; unpivot_columns: Ident[]; alias?: Ident } }
  | { Join: Join };

export type PivotValueSource =
  | { List: ExprWithAlias[] }
  | { Any: OrderByExpr[] }
  | { Subquery: Query };

export interface PrimaryKeyConstraint {
  name?: Ident;
  index_name?: Ident;
  index_type?: IndexType;
  columns: IndexColumn[];
  include: Ident[];
  index_options: IndexOption[];
  characteristics?: ConstraintCharacteristics;
}

export interface PrintStatement {
  message: Expr;
}

export type Privileges =
  | { All: { with_privileges_keyword: boolean } }
  | { Actions: Action[] };

export interface ProcedureParam {
  name: Ident;
  data_type: DataType;
  mode?: ArgMode;
  default?: Expr;
}

export interface ProjectionSelect {
  projection: SelectItem[];
  order_by?: OrderBy;
  group_by?: GroupByExpr;
}

export interface Query {
  with?: With;
  body: SetExpr;
  order_by?: OrderBy;
  limit_clause?: LimitClause;
  fetch?: Fetch;
  locks: LockClause[];
  for_clause?: ForClause;
  settings?: Setting[];
  format_clause?: FormatClause;
  pipe_operators: PipeOperator[];
}

export interface QuoteDelimitedString {
  start_quote: string;
  value: string;
  end_quote: string;
}

export type RaisErrorOption =
  | 'Log'
  | 'NoWait'
  | 'SetError';

export interface RaiseStatement {
  value?: RaiseStatementValue;
}

export type RaiseStatementValue =
  | { UsingMessage: Expr }
  | { Expr: Expr };

export type ReferentialAction =
  | 'Restrict'
  | 'Cascade'
  | 'SetNull'
  | 'NoAction'
  | 'SetDefault';

export interface RefreshMaterializedView {
  concurrently: boolean;
  name: ObjectName;
  with_data?: boolean;
}

export type RefreshModeKind =
  | 'Auto'
  | 'Full'
  | 'Incremental';

export type RenameSelectItem =
  | { Single: IdentWithAlias }
  | { Multiple: IdentWithAlias[] };

export interface RenameTable {
  old_name: ObjectName;
  new_name: ObjectName;
}

export type RenameTableNameKind =
  | { As: ObjectName }
  | { To: ObjectName };

export type RepetitionQuantifier =
  | 'ZeroOrMore'
  | 'OneOrMore'
  | 'AtMostOne'
  | { Exactly: number }
  | { AtLeast: number }
  | { AtMost: number }
  | { Range: [number, number] }
  | { Reluctant: RepetitionQuantifier };

export interface ReplaceSelectElement {
  expr: Expr;
  column_name: Ident;
  as_keyword: boolean;
}

export interface ReplaceSelectItem {
  items: ReplaceSelectElement[];
}

export type ReplicaIdentity =
  | 'Nothing'
  | 'Full'
  | 'Default'
  | { Index: Ident };

export type Reset =
  | 'ALL'
  | 'SessionAuthorization'
  | { ConfigurationParameter: ObjectName };

export type ResetConfig =
  | 'ALL'
  | { ConfigName: ObjectName };

export interface ResetStatement {
  reset: Reset;
}

export interface ReturnStatement {
  value?: ReturnStatementValue;
}

export type ReturnStatementValue =
  | { Expr: Expr };

export interface Revoke {
  grant_option_for: boolean;
  privileges: Privileges;
  objects?: GrantObjects;
  grantees: Grantee[];
  granted_by?: Ident;
  cascade?: CascadeOption;
}

export interface RevokeRole {
  option_for?: Ident;
  roles: Ident[];
  grantees: Grantee[];
  granted_by?: Ident;
  cascade?: CascadeOption;
}

export interface RoleGrantOption {
  name: Ident;
  value: RoleGrantOptionValue;
}

export type RoleGrantOptionValue =
  | 'Option'
  | 'True'
  | 'False';

export type RoleKeyword =
  | 'Role'
  | 'Group';

export type RoleOption =
  | { BypassRLS: boolean }
  | { ConnectionLimit: Expr }
  | { CreateDB: boolean }
  | { CreateRole: boolean }
  | { Inherit: boolean }
  | { Login: boolean }
  | { Password: Password }
  | { Replication: boolean }
  | { SuperUser: boolean }
  | { ValidUntil: Expr };

export interface RowAccessPolicy {
  policy: ObjectName;
  on: Ident[];
}

export type RowsPerMatch =
  | 'OneRow'
  | { AllRows: EmptyMatchesMode | undefined };

export type SchemaName =
  | { Simple: ObjectName }
  | { UnnamedAuthorization: Ident }
  | { NamedAuthorization: [ObjectName, Ident] };

export type SearchModifier =
  | 'InNaturalLanguageMode'
  | 'InNaturalLanguageModeWithQueryExpansion'
  | 'InBooleanMode'
  | 'WithQueryExpansion';

export type SecondaryRoles =
  | 'All'
  | 'None'
  | { List: Ident[] };

export interface SecretOption {
  key: Ident;
  value: Ident;
}

export interface Select {
  select_token: AttachedToken;
  optimizer_hints: OptimizerHint[];
  distinct?: Distinct;
  select_modifiers?: SelectModifiers;
  top?: Top;
  top_before_distinct: boolean;
  projection: SelectItem[];
  exclude?: ExcludeSelectItem;
  into?: SelectInto;
  from: TableWithJoins[];
  lateral_views: LateralView[];
  prewhere?: Expr;
  selection?: Expr;
  connect_by: ConnectByKind[];
  group_by: GroupByExpr;
  cluster_by: Expr[];
  distribute_by: Expr[];
  sort_by: OrderByExpr[];
  having?: Expr;
  named_window: NamedWindowDefinition[];
  qualify?: Expr;
  window_before_qualify: boolean;
  value_table_mode?: ValueTableMode;
  flavor: SelectFlavor;
}

export type SelectFlavor =
  | 'Standard'
  | 'FromFirst'
  | 'FromFirstNoSelect';

export interface SelectInto {
  temporary: boolean;
  unlogged: boolean;
  table: boolean;
  targets: Expr[];
}

export type SelectItem =
  | { UnnamedExpr: Expr }
  | { ExprWithAlias: { expr: Expr; alias: Ident } }
  | { ExprWithAliases: { expr: Expr; aliases: Ident[] } }
  | { QualifiedWildcard: [SelectItemQualifiedWildcardKind, WildcardAdditionalOptions] }
  | { Wildcard: WildcardAdditionalOptions };

export type SelectItemQualifiedWildcardKind =
  | { ObjectName: ObjectName }
  | { Expr: Expr };

export interface SelectModifiers {
  high_priority: boolean;
  straight_join: boolean;
  sql_small_result: boolean;
  sql_big_result: boolean;
  sql_buffer_result: boolean;
  sql_no_cache: boolean;
  sql_calc_found_rows: boolean;
}

export type SequenceOptions =
  | { DataType: DataType }
  | { IncrementBy: [Expr, boolean] }
  | { MinValue: Expr | undefined }
  | { MaxValue: Expr | undefined }
  | { StartWith: [Expr, boolean] }
  | { Cache: Expr }
  | { Cycle: boolean }
  | { OwnedBy: ObjectName | undefined };

export type SessionParamStatsTopic =
  | 'IO'
  | 'Profile'
  | 'Time'
  | 'Xml';

export type SessionParamValue =
  | 'On'
  | 'Off';

export type Set =
  | { SingleAssignment: { scope?: ContextModifier; hivevar: boolean; variable: ObjectName; values: Expr[] } }
  | { ParenthesizedAssignments: { variables: ObjectName[]; values: Expr[] } }
  | { MultipleAssignments: { assignments: SetAssignment[] } }
  | { SetSessionAuthorization: SetSessionAuthorizationParam }
  | { SetSessionParam: SetSessionParamKind }
  | { SetRole: { context_modifier?: ContextModifier; role_name?: Ident } }
  | { SetTimeZone: { local: boolean; value: Expr } }
  | { SetNames: { charset_name: Ident; collation_name?: string } }
  | { SetNamesDefault: Record<string, never> }
  | { SetTransaction: { modes: TransactionMode[]; snapshot?: ValueWithSpan; session: boolean } };

export interface SetAssignment {
  scope?: ContextModifier;
  name: ObjectName;
  value: Expr;
}

export type SetConfigValue =
  | 'Default'
  | 'FromCurrent'
  | { Value: Expr };

export type SetExpr =
  | { Select: Select }
  | { Query: Query }
  | { SetOperation: { left: SetExpr; op: SetOperator; set_quantifier: SetQuantifier; right: SetExpr } }
  | { Values: Values }
  | { Insert: Statement }
  | { Update: Statement }
  | { Delete: Statement }
  | { Merge: Statement }
  | { Table: Table };

export type SetOperator =
  | 'Union'
  | 'Except'
  | 'Intersect'
  | 'Minus';

export type SetQuantifier =
  | 'All'
  | 'Distinct'
  | 'ByName'
  | 'AllByName'
  | 'DistinctByName'
  | 'None';

export interface SetSessionAuthorizationParam {
  scope: ContextModifier;
  kind: SetSessionAuthorizationParamKind;
}

export type SetSessionAuthorizationParamKind =
  | 'Default'
  | { User: Ident };

export interface SetSessionParamGeneric {
  names: string[];
  value: string;
}

export interface SetSessionParamIdentityInsert {
  obj: ObjectName;
  value: SessionParamValue;
}

export type SetSessionParamKind =
  | { Generic: SetSessionParamGeneric }
  | { IdentityInsert: SetSessionParamIdentityInsert }
  | { Offsets: SetSessionParamOffsets }
  | { Statistics: SetSessionParamStatistics };

export interface SetSessionParamOffsets {
  keywords: string[];
  value: SessionParamValue;
}

export interface SetSessionParamStatistics {
  topic: SessionParamStatsTopic;
  value: SessionParamValue;
}

export interface Setting {
  key: Ident;
  value: Expr;
}

export interface ShowCharset {
  is_shorthand: boolean;
  filter?: ShowStatementFilter;
}

export type ShowCreateObject =
  | 'Event'
  | 'Function'
  | 'Procedure'
  | 'Table'
  | 'Trigger'
  | 'View';

export interface ShowObjects {
  terse: boolean;
  show_options: ShowStatementOptions;
}

export type ShowStatementFilter =
  | { Like: string }
  | { ILike: string }
  | { Where: Expr }
  | { NoKeyword: string };

export type ShowStatementFilterPosition =
  | { Infix: ShowStatementFilter }
  | { Suffix: ShowStatementFilter };

export interface ShowStatementIn {
  clause: ShowStatementInClause;
  parent_type?: ShowStatementInParentType;
  parent_name?: ObjectName;
}

export type ShowStatementInClause =
  | 'IN'
  | 'FROM';

export type ShowStatementInParentType =
  | 'Account'
  | 'Database'
  | 'Schema'
  | 'Table'
  | 'View';

export interface ShowStatementOptions {
  show_in?: ShowStatementIn;
  starts_with?: ValueWithSpan;
  limit?: Expr;
  limit_from?: ValueWithSpan;
  filter_position?: ShowStatementFilterPosition;
}

export interface Span {
  start: Location;
  end: Location;
}

export type SqlOption =
  | { Clustered: TableOptionsClustered }
  | { Ident: ObjectName }
  | { KeyValue: { key: ObjectName; value: Expr } }
  | { Partition: { column_name: Ident; range_direction?: PartitionRangeDirection; for_values: Expr[] } }
  | { Comment: CommentDef }
  | { TableSpace: TablespaceOption }
  | { NamedParenthesizedList: NamedParenthesizedList };

export type SqliteOnConflict =
  | 'Rollback'
  | 'Abort'
  | 'Fail'
  | 'Ignore'
  | 'Replace';

export type SqliteTableOption =
  | 'WithoutRowid'
  | 'Strict';

export interface SqliteTableOptions {
  leading_comma: boolean;
  options: SqliteTableOption[];
}

export interface StageLoadSelectItem {
  alias?: Ident;
  file_col_num: number;
  element?: Ident;
  item_as?: Ident;
}

export type StageLoadSelectItemKind =
  | { SelectItem: SelectItem }
  | { StageLoadSelectItem: StageLoadSelectItem };

export interface StageParamsObject {
  url?: string;
  encryption: KeyValueOptions;
  endpoint?: string;
  storage_integration?: string;
  credentials: KeyValueOptions;
}

export type Statement =
  | { Analyze: Analyze }
  | { Set: Set }
  | { Truncate: Truncate }
  | { Msck: Msck }
  | { Query: Query }
  | { Insert: Insert }
  | { Install: { extension_name: Ident } }
  | { Load: { extension_name: Ident } }
  | { Directory: { overwrite: boolean; local: boolean; path: string; file_format?: FileFormat; source: Query } }
  | { Case: CaseStatement }
  | { If: IfStatement }
  | { While: WhileStatement }
  | { Raise: RaiseStatement }
  | { Call: Function }
  | { Copy: { source: CopySource; to: boolean; target: CopyTarget; options: CopyOption[]; legacy_options: CopyLegacyOption[]; payload?: CopyPayload } }
  | { CopyIntoSnowflake: { kind: CopyIntoSnowflakeKind; into: ObjectName; into_columns?: Ident[]; from_obj?: ObjectName; from_obj_alias?: Ident; stage_params: StageParamsObject; from_transformations?: StageLoadSelectItemKind[]; from_query?: Query; files?: string[]; pattern?: string; file_format: KeyValueOptions; copy_options: KeyValueOptions; validation_mode?: string; partition?: Expr } }
  | { Open: OpenStatement }
  | { Close: { cursor: CloseCursor } }
  | { Update: Update }
  | { Delete: Delete }
  | { CreateView: CreateView }
  | { CreateTable: CreateTable }
  | { CreateVirtualTable: { name: ObjectName; if_not_exists: boolean; module_name: Ident; module_args: Ident[] } }
  | { CreateIndex: CreateIndex }
  | { CreateRole: CreateRole }
  | { CreateSecret: { or_replace: boolean; temporary?: boolean; if_not_exists: boolean; name?: Ident; storage_specifier?: Ident; secret_type: Ident; options: SecretOption[] } }
  | { CreateServer: CreateServerStatement }
  | { CreateForeignTable: CreateForeignTable }
  | { CreateForeignDataWrapper: CreateForeignDataWrapper }
  | { CreateUserMapping: CreateUserMapping }
  | { CreatePolicy: CreatePolicy }
  | { CreateRule: CreateRule }
  | { CreateConnector: CreateConnector }
  | { CreateOperator: CreateOperator }
  | { CreateOperatorFamily: CreateOperatorFamily }
  | { CreateOperatorClass: CreateOperatorClass }
  | { CreateTextSearch: CreateTextSearch }
  | { CreateAggregate: CreateAggregate }
  | { AlterTable: AlterTable }
  | { AlterSchema: AlterSchema }
  | { AlterIndex: { name: ObjectName; operation: AlterIndexOperation } }
  | { AlterView: AlterView }
  | { AlterFunction: AlterFunction }
  | { AlterType: AlterType }
  | { AlterCollation: AlterCollation }
  | { AlterOperator: AlterOperator }
  | { AlterOperatorFamily: AlterOperatorFamily }
  | { AlterOperatorClass: AlterOperatorClass }
  | { AlterTextSearch: AlterTextSearch }
  | { AlterRole: { name: Ident; operation: AlterRoleOperation } }
  | { AlterPolicy: AlterPolicy }
  | { AlterTrigger: AlterTrigger }
  | { AlterConnector: { name: Ident; properties?: SqlOption[]; url?: string; owner?: AlterConnectorOwner } }
  | { AlterSession: { set: boolean; session_params: KeyValueOptions } }
  | { AttachDatabase: { schema_name: Ident; database_file_name: Expr; database: boolean } }
  | { AttachDuckDBDatabase: { if_not_exists: boolean; database: boolean; database_path: Ident; database_alias?: Ident; attach_options: AttachDuckDBDatabaseOption[] } }
  | { DetachDuckDBDatabase: { if_exists: boolean; database: boolean; database_alias: Ident } }
  | { Drop: { object_type: ObjectType; if_exists: boolean; names: ObjectName[]; cascade: boolean; restrict: boolean; purge: boolean; temporary: boolean; table?: ObjectName } }
  | { DropFunction: DropFunction }
  | { DropDomain: DropDomain }
  | { DropProcedure: { if_exists: boolean; proc_desc: FunctionDesc[]; drop_behavior?: DropBehavior } }
  | { DropSecret: { if_exists: boolean; temporary?: boolean; name: Ident; storage_specifier?: Ident } }
  | { DropPolicy: DropPolicy }
  | { DropRule: DropRule }
  | { DropConnector: { if_exists: boolean; name: Ident } }
  | { Declare: { stmts: Declare[]; separator: DeclareSeparator } }
  | { CreateExtension: CreateExtension }
  | { CreateCollation: CreateCollation }
  | { DropExtension: DropExtension }
  | { DropOperator: DropOperator }
  | { DropOperatorFamily: DropOperatorFamily }
  | { DropOperatorClass: DropOperatorClass }
  | { Fetch: { name: Ident; direction: FetchDirection; position: FetchPosition; into?: ObjectName } }
  | { Flush: { object_type: FlushType; location?: FlushLocation; channel?: string; read_lock: boolean; export: boolean; tables: ObjectName[] } }
  | { Discard: { object_type: DiscardObject } }
  | { ShowFunctions: { filter?: ShowStatementFilter } }
  | { ShowVariable: { variable: Ident[] } }
  | { ShowStatus: { filter?: ShowStatementFilter; global: boolean; session: boolean } }
  | { ShowVariables: { filter?: ShowStatementFilter; global: boolean; session: boolean } }
  | { ShowCreate: { obj_type: ShowCreateObject; obj_name: ObjectName } }
  | { ShowColumns: { extended: boolean; full: boolean; show_options: ShowStatementOptions } }
  | { ShowCatalogs: { terse: boolean; history: boolean; show_options: ShowStatementOptions } }
  | { ShowDatabases: { terse: boolean; history: boolean; show_options: ShowStatementOptions } }
  | { ShowProcessList: { full: boolean } }
  | { ShowSchemas: { terse: boolean; history: boolean; show_options: ShowStatementOptions } }
  | { ShowCharset: ShowCharset }
  | { ShowObjects: ShowObjects }
  | { ShowTables: { terse: boolean; history: boolean; extended: boolean; full: boolean; external: boolean; show_options: ShowStatementOptions } }
  | { ShowViews: { terse: boolean; materialized: boolean; show_options: ShowStatementOptions } }
  | { ShowCollation: { filter?: ShowStatementFilter } }
  | { Use: Use }
  | { StartTransaction: { modes: TransactionMode[]; begin: boolean; transaction?: BeginTransactionKind; modifier?: TransactionModifier; statements: Statement[]; exception?: ExceptionWhen[]; has_end_keyword: boolean } }
  | { Comment: { object_type: CommentObject; object_name: ObjectName; comment?: string; if_exists: boolean } }
  | { Commit: { chain: boolean; end: boolean; modifier?: TransactionModifier } }
  | { Rollback: { chain: boolean; savepoint?: Ident } }
  | { CreateSchema: { schema_name: SchemaName; or_replace: boolean; if_not_exists: boolean; with?: SqlOption[]; options?: SqlOption[]; default_collate_spec?: Expr; clone?: ObjectName } }
  | { CreateDatabase: { db_name: ObjectName; if_not_exists: boolean; location?: string; managed_location?: string; or_replace: boolean; transient: boolean; clone?: ObjectName; data_retention_time_in_days?: number; max_data_extension_time_in_days?: number; external_volume?: string; catalog?: string; replace_invalid_characters?: boolean; default_ddl_collation?: string; storage_serialization_policy?: StorageSerializationPolicy; comment?: string; default_charset?: string; default_collation?: string; catalog_sync?: string; catalog_sync_namespace_mode?: CatalogSyncNamespaceMode; catalog_sync_namespace_flatten_delimiter?: string; with_tags?: Tag[]; with_contacts?: ContactEntry[] } }
  | { CreateFunction: CreateFunction }
  | { CreateTrigger: CreateTrigger }
  | { DropTrigger: DropTrigger }
  | { CreateProcedure: { or_alter: boolean; name: ObjectName; params?: ProcedureParam[]; language?: Ident; body: CreateProcedureBody } }
  | { CreateMacro: { or_replace: boolean; temporary: boolean; name: ObjectName; args?: MacroArg[]; definition: MacroDefinition } }
  | { CreateStage: { or_replace: boolean; temporary: boolean; if_not_exists: boolean; name: ObjectName; stage_params: StageParamsObject; directory_table_params: KeyValueOptions; file_format: KeyValueOptions; copy_options: KeyValueOptions; comment?: string } }
  | { CreateFileFormat: { or_replace: boolean; temporary: boolean; volatile: boolean; if_not_exists: boolean; name: ObjectName; options: KeyValueOptions; comment?: string } }
  | { CreateWarehouse: CreateWarehouse }
  | { Assert: { condition: Expr; message?: Expr } }
  | { Grant: Grant }
  | { GrantRole: GrantRole }
  | { Deny: DenyStatement }
  | { Revoke: Revoke }
  | { RevokeRole: RevokeRole }
  | { AlterDefaultPrivileges: AlterDefaultPrivileges }
  | { Deallocate: { name: Ident; prepare: boolean } }
  | { Execute: { name?: ObjectName; parameters: Expr[]; has_parentheses: boolean; immediate: boolean; into: Ident[]; using: ExprWithAlias[]; output: boolean; default: boolean } }
  | { Prepare: { name: Ident; data_types: DataType[]; statement: Statement } }
  | { Kill: { modifier?: KillType; id: number } }
  | { ExplainTable: { describe_alias: DescribeAlias; hive_format?: HiveDescribeFormat; has_table_keyword: boolean; table_name: ObjectName } }
  | { Explain: { describe_alias: DescribeAlias; analyze: boolean; verbose: boolean; query_plan: boolean; estimate: boolean; statement: Statement; format?: AnalyzeFormatKind; options?: UtilityOption[] } }
  | { Savepoint: { name: Ident } }
  | { ReleaseSavepoint: { name: Ident } }
  | { Merge: Merge }
  | { Cache: { table_flag?: ObjectName; table_name: ObjectName; has_as: boolean; options: SqlOption[]; query?: Query } }
  | { UNCache: { table_name: ObjectName; if_exists: boolean } }
  | { CreateSequence: { temporary: boolean; if_not_exists: boolean; name: ObjectName; sequence_options: SequenceOptions[] } }
  | { CreateDomain: CreateDomain }
  | { CreateType: { name: ObjectName; representation?: UserDefinedTypeRepresentation } }
  | { Pragma: { name: ObjectName; value?: ValueWithSpan; is_eq: boolean } }
  | { Lock: Lock }
  | { LockTables: { tables: LockTable[] } }
  | 'UnlockTables'
  | { Unload: { query?: Query; query_text?: string; to: Ident; auth?: IamRoleKind; with: SqlOption[]; options: CopyLegacyOption[] } }
  | { OptimizeTable: { name: ObjectName; has_table_keyword: boolean; on_cluster?: Ident; partition?: Partition; include_final: boolean; deduplicate?: Deduplicate; predicate?: Expr; zorder?: Expr[] } }
  | { LISTEN: { channel: Ident } }
  | { UNLISTEN: { channel: Ident } }
  | { NOTIFY: { channel: Ident; payload?: string } }
  | { LoadData: { local: boolean; inpath: string; overwrite: boolean; table_name: ObjectName; partitioned?: Expr[]; table_format?: HiveLoadDataFormat } }
  | { RenameTable: RenameTable[] }
  | { List: FileStagingCommand }
  | { Put: { source: string; stage: ObjectName; options: KeyValueOptions } }
  | { Remove: FileStagingCommand }
  | { RaisError: { message: Expr; severity: Expr; state: Expr; arguments: Expr[]; options: RaisErrorOption[] } }
  | { Throw: ThrowStatement }
  | { Print: PrintStatement }
  | { WaitFor: WaitForStatement }
  | { Return: ReturnStatement }
  | { ExportData: ExportData }
  | { CreateUser: CreateUser }
  | { AlterUser: AlterUser }
  | { Vacuum: VacuumStatement }
  | { Reset: ResetStatement }
  | { RefreshMaterializedView: RefreshMaterializedView };

export interface StorageLifecyclePolicy {
  policy: ObjectName;
  on: Ident[];
}

export type StorageSerializationPolicy =
  | 'Compatible'
  | 'Optimized';

export type StorageType =
  | 'Disk'
  | 'Memory';

export type StructBracketKind =
  | 'Parentheses'
  | 'AngleBrackets';

export interface StructField {
  field_name?: Ident;
  field_type: DataType;
  options?: SqlOption[];
}

export type Subscript =
  | { Index: { index: Expr } }
  | { Slice: { lower_bound?: Expr; upper_bound?: Expr; stride?: Expr } };

export interface SymbolDefinition {
  symbol: Ident;
  definition: Expr;
}

export interface Table {
  table_name?: Ident;
  schema_name?: Ident;
}

export interface TableAlias {
  explicit: boolean;
  name: Ident;
  columns: TableAliasColumnDef[];
  at?: Ident;
}

export interface TableAliasColumnDef {
  name: Ident;
  data_type?: DataType;
}

export interface TableAliasWithoutColumns {
  explicit: boolean;
  alias: Ident;
}

export type TableConstraint =
  | { Unique: UniqueConstraint }
  | { PrimaryKey: PrimaryKeyConstraint }
  | { ForeignKey: ForeignKeyConstraint }
  | { Check: CheckConstraint }
  | { Index: IndexConstraint }
  | { FulltextOrSpatial: FullTextOrSpatialConstraint }
  | { PrimaryKeyUsingIndex: ConstraintUsingIndex }
  | { UniqueUsingIndex: ConstraintUsingIndex }
  | { Exclude: ExcludeConstraint };

export type TableFactor =
  | { Table: { name: ObjectName; alias?: TableAlias; args?: TableFunctionArgs; with_hints: Expr[]; version?: TableVersion; with_ordinality: boolean; partitions: Ident[]; json_path?: JsonPath; sample?: TableSampleKind; index_directives: TableIndexDirective[]; inheritance?: TableInheritance } }
  | { Derived: { lateral: boolean; subquery: Query; alias?: TableAlias; sample?: TableSampleKind } }
  | { TableFunction: { expr: Expr; alias?: TableAlias } }
  | { Function: { lateral: boolean; name: ObjectName; args: FunctionArg[]; with_ordinality: boolean; alias?: TableAlias } }
  | { UNNEST: { alias?: TableAlias; array_exprs: Expr[]; with_offset: boolean; with_offset_alias?: Ident; with_ordinality: boolean } }
  | { JsonTable: { json_expr: Expr; json_path: ValueWithSpan; columns: JsonTableColumn[]; alias?: TableAlias } }
  | { OpenJsonTable: { json_expr: Expr; json_path?: ValueWithSpan; columns: OpenJsonTableColumn[]; alias?: TableAlias } }
  | { NestedJoin: { table_with_joins: TableWithJoins; alias?: TableAlias } }
  | { Pivot: { table: TableFactor; aggregate_functions: ExprWithAlias[]; value_column: Expr[]; value_source: PivotValueSource; default_on_null?: Expr; alias?: TableAlias } }
  | { Unpivot: { table: TableFactor; value: Expr; name: Ident; columns: ExprWithAlias[]; null_inclusion?: NullInclusion; alias?: TableAlias } }
  | { UnpivotExpr: { expression: Expr; value_alias: Ident; attribute_alias?: Ident } }
  | { MatchRecognize: { table: TableFactor; partition_by: Expr[]; order_by: OrderByExpr[]; measures: Measure[]; rows_per_match?: RowsPerMatch; after_match_skip?: AfterMatchSkip; pattern: MatchRecognizePattern; symbols: SymbolDefinition[]; alias?: TableAlias } }
  | { XmlTable: { namespaces: XmlNamespaceDefinition[]; row_expression: Expr; passing: XmlPassingClause; columns: XmlTableColumn[]; alias?: TableAlias } }
  | { SemanticView: { name: ObjectName; dimensions: Expr[]; metrics: Expr[]; facts: Expr[]; where_clause?: Expr; alias?: TableAlias } };

export interface TableFunctionArgs {
  args: FunctionArg[];
  settings?: Setting[];
}

export type TableIndexDirective =
  | { MySql: TableIndexHints }
  | { IndexedBy: Ident }
  | 'NotIndexed';

export type TableIndexHintForClause =
  | 'Join'
  | 'OrderBy'
  | 'GroupBy';

export type TableIndexHintType =
  | 'Use'
  | 'Ignore'
  | 'Force';

export interface TableIndexHints {
  hint_type: TableIndexHintType;
  index_type: TableIndexType;
  for_clause?: TableIndexHintForClause;
  index_names: Ident[];
}

export type TableIndexType =
  | 'Index'
  | 'Key';

export type TableInheritance =
  | { Only: { parenthesized: boolean } }
  | 'IncludeDescendants';

export type TableObject =
  | { TableName: ObjectName }
  | { TableFunction: Function }
  | { TableQuery: Query };

export type TableOptionsClustered =
  | 'ColumnstoreIndex'
  | { ColumnstoreIndexOrder: Ident[] }
  | { Index: ClusteredIndex[] };

export interface TableSample {
  modifier: TableSampleModifier;
  name?: TableSampleMethod;
  quantity?: TableSampleQuantity;
  seed?: TableSampleSeed;
  bucket?: TableSampleBucket;
  offset?: Expr;
}

export interface TableSampleBucket {
  bucket: ValueWithSpan;
  total: ValueWithSpan;
  on?: Expr;
}

export type TableSampleKind =
  | { BeforeTableAlias: TableSample }
  | { AfterTableAlias: TableSample };

export type TableSampleMethod =
  | 'Row'
  | 'Bernoulli'
  | 'System'
  | 'Block';

export type TableSampleModifier =
  | 'Sample'
  | 'TableSample';

export interface TableSampleQuantity {
  parenthesized: boolean;
  value: Expr;
  unit?: TableSampleUnit;
}

export interface TableSampleSeed {
  modifier: TableSampleSeedModifier;
  value: ValueWithSpan;
}

export type TableSampleSeedModifier =
  | 'Repeatable'
  | 'Seed';

export type TableSampleUnit =
  | 'Rows'
  | 'Percent';

export type TableVersion =
  | { ForSystemTimeAsOf: Expr }
  | { TimestampAsOf: Expr }
  | { VersionAsOf: Expr }
  | { Function: Expr }
  | { Changes: { changes: Expr; at: Expr; end?: Expr } };

export interface TableWithJoins {
  relation: TableFactor;
  joins: Join[];
}

export interface TablespaceOption {
  name: string;
  storage?: StorageType;
}

export interface Tag {
  key: ObjectName;
  value: string;
}

export interface TagsColumnOption {
  with: boolean;
  tags: Tag[];
}

export type TextSearchObjectType =
  | 'Dictionary'
  | 'Configuration'
  | 'Template'
  | 'Parser';

export interface ThrowStatement {
  error_number?: Expr;
  message?: Expr;
  state?: Expr;
}

export type TimezoneInfo =
  | 'None'
  | 'WithTimeZone'
  | 'WithoutTimeZone'
  | 'Tz';

export type Token =
  | 'EOF'
  | { Word: Word }
  | { Number: [string, boolean] }
  | { Char: string }
  | { SingleQuotedString: string }
  | { DoubleQuotedString: string }
  | { TripleSingleQuotedString: string }
  | { TripleDoubleQuotedString: string }
  | { DollarQuotedString: DollarQuotedString }
  | { SingleQuotedByteStringLiteral: string }
  | { DoubleQuotedByteStringLiteral: string }
  | { TripleSingleQuotedByteStringLiteral: string }
  | { TripleDoubleQuotedByteStringLiteral: string }
  | { SingleQuotedRawStringLiteral: string }
  | { DoubleQuotedRawStringLiteral: string }
  | { TripleSingleQuotedRawStringLiteral: string }
  | { TripleDoubleQuotedRawStringLiteral: string }
  | { NationalStringLiteral: string }
  | { QuoteDelimitedStringLiteral: QuoteDelimitedString }
  | { NationalQuoteDelimitedStringLiteral: QuoteDelimitedString }
  | { EscapedStringLiteral: string }
  | { UnicodeStringLiteral: string }
  | { HexStringLiteral: string }
  | 'Comma'
  | { Whitespace: Whitespace }
  | 'DoubleEq'
  | 'Eq'
  | 'Neq'
  | 'Lt'
  | 'Gt'
  | 'LtEq'
  | 'GtEq'
  | 'Spaceship'
  | 'Plus'
  | 'Minus'
  | 'Mul'
  | 'Div'
  | 'DuckIntDiv'
  | 'Mod'
  | 'StringConcat'
  | 'LParen'
  | 'RParen'
  | 'Period'
  | 'Colon'
  | 'DoubleColon'
  | 'Assignment'
  | 'SemiColon'
  | 'Backslash'
  | { CopyData: { data: string; terminated: boolean } }
  | 'LBracket'
  | 'RBracket'
  | 'Ampersand'
  | 'Pipe'
  | 'Caret'
  | 'LBrace'
  | 'RBrace'
  | 'RArrow'
  | 'Sharp'
  | 'DoubleSharp'
  | 'Tilde'
  | 'TildeAsterisk'
  | 'ExclamationMarkTilde'
  | 'ExclamationMarkTildeAsterisk'
  | 'DoubleTilde'
  | 'DoubleTildeAsterisk'
  | 'ExclamationMarkDoubleTilde'
  | 'ExclamationMarkDoubleTildeAsterisk'
  | 'ShiftLeft'
  | 'ShiftRight'
  | 'Overlap'
  | 'ExclamationMark'
  | 'DoubleExclamationMark'
  | 'AtSign'
  | 'CaretAt'
  | 'PGSquareRoot'
  | 'PGCubeRoot'
  | { Placeholder: string }
  | 'Arrow'
  | 'LongArrow'
  | 'HashArrow'
  | 'AtDashAt'
  | 'QuestionMarkDash'
  | 'AmpersandLeftAngleBracket'
  | 'AmpersandRightAngleBracket'
  | 'AmpersandLeftAngleBracketVerticalBar'
  | 'VerticalBarAmpersandRightAngleBracket'
  | 'TwoWayArrow'
  | 'LeftAngleBracketCaret'
  | 'RightAngleBracketCaret'
  | 'QuestionMarkSharp'
  | 'QuestionMarkDashVerticalBar'
  | 'QuestionMarkDoubleVerticalBar'
  | 'TildeEqual'
  | 'ShiftLeftVerticalBar'
  | 'VerticalBarShiftRight'
  | 'VerticalBarRightAngleBracket'
  | 'HashLongArrow'
  | 'AtArrow'
  | 'ArrowAt'
  | 'HashMinus'
  | 'AtQuestion'
  | 'AtAt'
  | 'Question'
  | 'QuestionAnd'
  | 'QuestionPipe'
  | { CustomBinaryOperator: string };

export interface TokenWithSpan {
  token: Token;
  span: Span;
}

export interface Top {
  with_ties: boolean;
  percent: boolean;
  quantity?: TopQuantity;
}

export type TopQuantity =
  | { Expr: Expr }
  | { Constant: number };

export type TransactionAccessMode =
  | 'ReadOnly'
  | 'ReadWrite';

export type TransactionIsolationLevel =
  | 'ReadUncommitted'
  | 'ReadCommitted'
  | 'RepeatableRead'
  | 'Serializable'
  | 'Snapshot';

export type TransactionMode =
  | { AccessMode: TransactionAccessMode }
  | { IsolationLevel: TransactionIsolationLevel };

export type TransactionModifier =
  | 'Deferred'
  | 'Immediate'
  | 'Exclusive'
  | 'Try'
  | 'Catch';

export type TriggerEvent =
  | 'Insert'
  | { Update: Ident[] }
  | 'Delete'
  | 'Truncate';

export interface TriggerExecBody {
  exec_type: TriggerExecBodyType;
  func_desc: FunctionDesc;
}

export type TriggerExecBodyType =
  | 'Function'
  | 'Procedure';

export type TriggerObject =
  | 'Row'
  | 'Statement';

export type TriggerObjectKind =
  | { For: TriggerObject }
  | { ForEach: TriggerObject };

export type TriggerPeriod =
  | 'For'
  | 'After'
  | 'Before'
  | 'InsteadOf';

export interface TriggerReferencing {
  refer_type: TriggerReferencingType;
  is_as: boolean;
  transition_relation_name: ObjectName;
}

export type TriggerReferencingType =
  | 'OldTable'
  | 'NewTable';

export type TrimWhereField =
  | 'Both'
  | 'Leading'
  | 'Trailing';

export interface Truncate {
  table_names: TruncateTableTarget[];
  partitions?: Expr[];
  table: boolean;
  if_exists: boolean;
  identity?: TruncateIdentityOption;
  cascade?: CascadeOption;
  on_cluster?: Ident;
}

export type TruncateIdentityOption =
  | 'Restart'
  | 'Continue';

export interface TruncateTableTarget {
  name: ObjectName;
  only: boolean;
  has_asterisk: boolean;
}

export type TypeModifier =
  | { Identifier: Ident }
  | { Number: [string, boolean] }
  | { String: string };

export interface TypedString {
  data_type: DataType;
  value: ValueWithSpan;
  uses_odbc_syntax: boolean;
}

export type UnaryOperator =
  | 'AtDashAt'
  | 'BangNot'
  | 'BitwiseNot'
  | 'DoubleAt'
  | 'Hash'
  | 'Plus'
  | 'Minus'
  | 'Not'
  | 'PGAbs'
  | 'PGCubeRoot'
  | 'PGPostfixFactorial'
  | 'PGPrefixFactorial'
  | 'PGSquareRoot'
  | 'QuestionDash'
  | 'QuestionPipe';

export interface UnionField {
  field_name: Ident;
  field_type: DataType;
}

export interface UniqueConstraint {
  name?: Ident;
  index_name?: Ident;
  index_type_display: KeyOrIndexDisplay;
  index_type?: IndexType;
  columns: IndexColumn[];
  include: Ident[];
  index_options: IndexOption[];
  characteristics?: ConstraintCharacteristics;
  nulls_distinct: NullsDistinctOption;
}

export interface UnloadPartitionBy {
  columns: Ident[];
  include: boolean;
}

export interface Update {
  update_token: AttachedToken;
  optimizer_hints: OptimizerHint[];
  table: TableWithJoins;
  on_cluster?: Ident;
  assignments: Assignment[];
  from?: UpdateTableFromKind;
  selection?: Expr;
  returning?: SelectItem[];
  output?: OutputClause;
  or?: SqliteOnConflict;
  order_by: OrderByExpr[];
  limit?: Expr;
  settings?: Setting[];
}

export type UpdateTableFromKind =
  | { BeforeSet: TableWithJoins[] }
  | { AfterSet: TableWithJoins[] };

export type Use =
  | { Catalog: ObjectName }
  | { Schema: ObjectName }
  | { Database: ObjectName }
  | { Warehouse: ObjectName }
  | { Role: ObjectName }
  | { SecondaryRoles: SecondaryRoles }
  | { Object: ObjectName }
  | 'Default';

export interface UserDefinedTypeCompositeAttributeDef {
  name: Ident;
  data_type: DataType;
  collation?: ObjectName;
}

export type UserDefinedTypeInternalLength =
  | { Fixed: number }
  | 'Variable';

export type UserDefinedTypeRangeOption =
  | { Subtype: DataType }
  | { SubtypeOpClass: ObjectName }
  | { Collation: ObjectName }
  | { Canonical: ObjectName }
  | { SubtypeDiff: ObjectName }
  | { MultirangeTypeName: ObjectName };

export type UserDefinedTypeRepresentation =
  | { Composite: { attributes: UserDefinedTypeCompositeAttributeDef[] } }
  | { Enum: { labels: Ident[] } }
  | { Range: { options: UserDefinedTypeRangeOption[] } }
  | { SqlDefinition: { options: UserDefinedTypeSqlDefinitionOption[] } };

export type UserDefinedTypeSqlDefinitionOption =
  | { Input: ObjectName }
  | { Output: ObjectName }
  | { Receive: ObjectName }
  | { Send: ObjectName }
  | { TypmodIn: ObjectName }
  | { TypmodOut: ObjectName }
  | { Analyze: ObjectName }
  | { Subscript: ObjectName }
  | { InternalLength: UserDefinedTypeInternalLength }
  | 'PassedByValue'
  | { Alignment: Alignment }
  | { Storage: UserDefinedTypeStorage }
  | { Like: ObjectName }
  | { Category: string }
  | { Preferred: boolean }
  | { Default: Expr }
  | { Element: DataType }
  | { Delimiter: string }
  | { Collatable: boolean };

export type UserDefinedTypeStorage =
  | 'Plain'
  | 'External'
  | 'Extended'
  | 'Main';

export type UserMappingUser =
  | { Name: Ident }
  | 'User'
  | 'CurrentRole'
  | 'CurrentUser'
  | 'SessionUser'
  | 'Public';

export type UserPolicyKind =
  | 'Authentication'
  | 'Password'
  | 'Session';

export interface UtilityOption {
  name: Ident;
  arg?: Expr;
}

export interface VacuumStatement {
  full: boolean;
  sort_only: boolean;
  delete_only: boolean;
  reindex: boolean;
  recluster: boolean;
  table_name?: ObjectName;
  threshold?: ValueWithSpan;
  boost: boolean;
}

export type Value =
  | { Number: [string, boolean] }
  | { SingleQuotedString: string }
  | { DollarQuotedString: DollarQuotedString }
  | { TripleSingleQuotedString: string }
  | { TripleDoubleQuotedString: string }
  | { EscapedStringLiteral: string }
  | { UnicodeStringLiteral: string }
  | { SingleQuotedByteStringLiteral: string }
  | { DoubleQuotedByteStringLiteral: string }
  | { TripleSingleQuotedByteStringLiteral: string }
  | { TripleDoubleQuotedByteStringLiteral: string }
  | { SingleQuotedRawStringLiteral: string }
  | { DoubleQuotedRawStringLiteral: string }
  | { TripleSingleQuotedRawStringLiteral: string }
  | { TripleDoubleQuotedRawStringLiteral: string }
  | { NationalStringLiteral: string }
  | { QuoteDelimitedStringLiteral: QuoteDelimitedString }
  | { NationalQuoteDelimitedStringLiteral: QuoteDelimitedString }
  | { HexStringLiteral: string }
  | { DoubleQuotedString: string }
  | { Boolean: boolean }
  | 'Null'
  | { Placeholder: string };

export type ValueTableMode =
  | 'AsStruct'
  | 'AsValue'
  | 'DistinctAsStruct'
  | 'DistinctAsValue';

export interface ValueWithSpan {
  value: Value;
  span: Span;
}

export interface Values {
  explicit_row: boolean;
  value_keyword: boolean;
  rows: Parens<Expr[]>[];
}

export interface ViewColumnDef {
  name: Ident;
  data_type?: DataType;
  options?: ColumnOptions;
}

export interface WaitForStatement {
  wait_type: WaitForType;
  expr: Expr;
}

export type WaitForType =
  | 'Delay'
  | 'Time';

export interface WhileStatement {
  while_block: ConditionalStatementBlock;
}

export type Whitespace =
  | 'Space'
  | 'Newline'
  | 'Tab'
  | { SingleLineComment: { comment: string; prefix: string } }
  | { MultiLineComment: string };

export interface WildcardAdditionalOptions {
  wildcard_token: AttachedToken;
  opt_ilike?: IlikeSelectItem;
  opt_exclude?: ExcludeSelectItem;
  opt_except?: ExceptSelectItem;
  opt_replace?: ReplaceSelectItem;
  opt_rename?: RenameSelectItem;
  opt_alias?: Ident;
}

export interface WindowFrame {
  units: WindowFrameUnits;
  start_bound: WindowFrameBound;
  end_bound?: WindowFrameBound;
}

export type WindowFrameBound =
  | 'CurrentRow'
  | { Preceding: Expr | undefined }
  | { Following: Expr | undefined };

export type WindowFrameUnits =
  | 'Rows'
  | 'Range'
  | 'Groups';

export interface WindowSpec {
  window_name?: Ident;
  partition_by: Expr[];
  order_by: OrderByExpr[];
  window_frame?: WindowFrame;
}

export type WindowType =
  | { WindowSpec: WindowSpec }
  | { NamedWindow: Ident };

export interface With {
  with_token: AttachedToken;
  recursive: boolean;
  cte_tables: Cte[];
}

export interface WithData {
  data: boolean;
  statistics?: boolean;
}

export interface WithFill {
  from?: Expr;
  to?: Expr;
  step?: Expr;
}

export interface Word {
  value: string;
  quote_style?: string;
  keyword: Keyword;
}

export type WrappedCollection<T> =
  | { NoWrapping: T }
  | { Parentheses: T };

export interface XmlNamespaceDefinition {
  uri: Expr;
  name: Ident;
}

export interface XmlPassingArgument {
  expr: Expr;
  alias?: Ident;
  by_value: boolean;
}

export interface XmlPassingClause {
  arguments: XmlPassingArgument[];
}

export interface XmlTableColumn {
  name: Ident;
  option: XmlTableColumnOption;
}

export type XmlTableColumnOption =
  | { NamedInfo: { type: DataType; path?: Expr; default?: Expr; nullable: boolean } }
  | 'ForOrdinality';
