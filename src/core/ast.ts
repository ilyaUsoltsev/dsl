export type Expr =
  | BinaryExpr
  | UnaryExpr
  | NumberExpr
  | StringExpr
  | IdentExpr
  | CallExpr;

export interface BinaryExpr {
  kind: 'binary';
  op: string;
  left: Expr;
  right: Expr;
}

export interface UnaryExpr {
  kind: 'unary';
  op: '!' | '-';
  operand: Expr;
}

export interface NumberExpr {
  kind: 'number';
  value: number;
}

export interface StringExpr {
  kind: 'string';
  value: string;
}

export interface IdentExpr {
  kind: 'ident';
  name: string;
}

export interface CallExpr {
  kind: 'call';
  callee: string;
  args: Expr[];
}

export interface LoadStmt {
  kind: 'load';
  path: string;
}

export interface SelectStmt {
  kind: 'select';
  columns: string[];
}

export interface FilterStmt {
  kind: 'filter';
  expr: Expr;
}

export interface DeriveStmt {
  kind: 'derive';
  name: string;
  expr: Expr;
}

export interface GroupStmt {
  kind: 'group';
  by: string[];
}

export interface AggItem {
  name: string;
  fn: string;
  arg: string;
}

export interface AggregateStmt {
  kind: 'aggregate';
  items: AggItem[];
}

export interface SortStmt {
  kind: 'sort';
  by: string;
  direction?: 'asc' | 'desc';
}

export interface TakeStmt {
  kind: 'take';
  count: number;
}

export type PlotType = 'bar' | 'line' | 'scatter';

export interface PlotArg {
  key: 'x' | 'y' | 'color' | 'title';
  value: string;
}

export interface PlotStmt {
  kind: 'plot';
  plotType: PlotType;
  args: PlotArg[];
}

export type Statement =
  | LoadStmt
  | SelectStmt
  | FilterStmt
  | DeriveStmt
  | GroupStmt
  | AggregateStmt
  | SortStmt
  | TakeStmt
  | PlotStmt;

export interface Program {
  statements: Statement[];
}
