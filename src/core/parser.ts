import { Lexer } from './lexer';
import type { Token, TokenType } from './lexer';

// AST node types

export type BinOp = '*' | '+' | '-' | '/';

export interface Expr {
  left: string;
  op?: BinOp;
  right?: string;
}

export interface LoadStmt {
  kind: 'load';
  path: string;
}

export interface DeriveStmt {
  kind: 'derive';
  name: string;
  expr: Expr;
}

export interface GroupStmt {
  kind: 'group';
  by: string;
}

export interface AggregateStmt {
  kind: 'aggregate';
  name: string;
  fn: 'sum';
  arg: string;
}

export interface ExportStmt {
  kind: 'export';
  idents: string[];
}

export type Statement =
  | LoadStmt
  | DeriveStmt
  | GroupStmt
  | AggregateStmt
  | ExportStmt;

export interface Program {
  statements: Statement[];
}

export class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(src: string) {
    this.tokens = new Lexer(src).tokenize();
  }

  parse(): Program {
    const statements: Statement[] = [];
    while (this.peek().type !== 'EOF') {
      statements.push(this.parseStatement());
    }
    return { statements };
  }

  private parseStatement(): Statement {
    const tok = this.peek();
    switch (tok.type) {
      case 'LOAD':
        return this.parseLoad();
      case 'DERIVE':
        return this.parseDerive();
      case 'GROUP':
        return this.parseGroup();
      case 'AGGREGATE':
        return this.parseAggregate();
      case 'EXPORT':
        return this.parseExport();
      default:
        throw new SyntaxError(
          `Unexpected token '${tok.value}' at position ${tok.pos}`,
        );
    }
  }

  // load_stmt := "load" string
  private parseLoad(): LoadStmt {
    this.expect('LOAD');
    const path = this.expect('STRING').value;
    return { kind: 'load', path };
  }

  // derive_stmt := "derive" ident "=" expr
  private parseDerive(): DeriveStmt {
    this.expect('DERIVE');
    const name = this.expect('IDENT').value;
    this.expect('EQ');
    const expr = this.parseExpr();
    return { kind: 'derive', name, expr };
  }

  // group_stmt := "group" "by" ident
  private parseGroup(): GroupStmt {
    this.expect('GROUP');
    this.expect('BY');
    const by = this.expect('IDENT').value;
    return { kind: 'group', by };
  }

  // aggregate_stmt := "aggregate" ident "=" "sum" "(" ident ")"
  private parseAggregate(): AggregateStmt {
    this.expect('AGGREGATE');
    const name = this.expect('IDENT').value;
    this.expect('EQ');
    this.expect('SUM');
    this.expect('LPAREN');
    const arg = this.expect('IDENT').value;
    this.expect('RPAREN');
    return { kind: 'aggregate', name, fn: 'sum', arg };
  }

  // export_stmt := "export" ident_list
  // ident_list  := ident ("," ident)*
  private parseExport(): ExportStmt {
    this.expect('EXPORT');
    const idents: string[] = [this.expect('IDENT').value];
    while (this.peek().type === 'COMMA') {
      this.advance();
      idents.push(this.expect('IDENT').value);
    }
    return { kind: 'export', idents };
  }

  // expr := ident (("*" | "+" | "-" | "/") ident)?
  private parseExpr(): Expr {
    const left = this.expect('IDENT').value;
    const opMap: Partial<Record<TokenType, BinOp>> = {
      STAR: '*',
      PLUS: '+',
      MINUS: '-',
      SLASH: '/',
    };
    const op = opMap[this.peek().type];
    if (op !== undefined) {
      this.advance();
      const right = this.expect('IDENT').value;
      return { left, op, right };
    }
    return { left };
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType): Token {
    const tok = this.peek();
    if (tok.type !== type) {
      throw new SyntaxError(
        `Expected ${type} but got '${tok.value}' (${tok.type}) at position ${tok.pos}`,
      );
    }
    return this.advance();
  }
}
