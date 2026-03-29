import type { Row, Table, Value } from '../types';
import type { BinaryExpr, DeriveStmt, Expr, IdentExpr, Statement } from './ast';

export class Executor {
  statements: Statement[] = [];
  table: Table = [];

  constructor(statements: Statement[], table: Table) {
    this.statements = statements;
    this.table = table;
  }

  execute() {
    for (const statement of this.statements) {
      this.processStatement(statement);
    }
  }

  private processStatement(statement: Statement) {
    switch (statement.kind) {
      case 'derive':
        this.processDerive(statement);
        break;

      default:
        break;
    }
  }

  private processExpr(expression: Expr, row: Row): Value {
    switch (expression.kind) {
      case 'binary':
        return this.processBinaryExpr(expression, row);
      case 'ident':
        return this.processIdentExpr(expression, row);

      default:
        throw new Error('Unknown expression in processExpr');
    }
  }

  private processDerive(statement: DeriveStmt) {
    const { name, expr } = statement;
    for (const row of this.table) {
      row[name] = this.processExpr(expr, row);
    }
  }

  private processBinaryExpr(expression: BinaryExpr, row: Row): Value {
    switch (expression.op) {
      case '-':
        return (
          Number(this.processExpr(expression.left, row)) -
          Number(this.processExpr(expression.right, row))
        );
      case '+':
        return (
          Number(this.processExpr(expression.left, row)) +
          Number(this.processExpr(expression.right, row))
        );
      case '/':
        return (
          Number(this.processExpr(expression.left, row)) /
          Number(this.processExpr(expression.right, row))
        );
      case '*':
        return (
          Number(this.processExpr(expression.left, row)) *
          Number(this.processExpr(expression.right, row))
        );
      default:
        throw new Error('Unknown operation');
    }
  }

  private processIdentExpr(expression: IdentExpr, row: Row): Value {
    return row[expression.name];
  }
}
