import { Lexer } from './lexer';
import type { Token, TokenType } from './lexer.types';
export type {
  Expr,
  BinaryExpr,
  UnaryExpr,
  NumberExpr,
  StringExpr,
  IdentExpr,
  CallExpr,
  LoadStmt,
  SelectStmt,
  FilterStmt,
  DeriveStmt,
  GroupStmt,
  AggItem,
  AggregateStmt,
  SortStmt,
  TakeStmt,
  PlotType,
  PlotArg,
  PlotStmt,
  Statement,
  Program,
} from './ast';
import type {
  Expr,
  LoadStmt,
  SelectStmt,
  FilterStmt,
  DeriveStmt,
  GroupStmt,
  AggItem,
  AggregateStmt,
  SortStmt,
  TakeStmt,
  PlotType,
  PlotArg,
  PlotStmt,
  Statement,
  Program,
} from './ast';

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
      case 'SELECT':
        return this.parseSelect();
      case 'FILTER':
        return this.parseFilter();
      case 'DERIVE':
        return this.parseDerive();
      case 'GROUP':
        return this.parseGroup();
      case 'AGGREGATE':
        return this.parseAggregate();
      case 'SORT':
        return this.parseSort();
      case 'TAKE':
        return this.parseTake();
      case 'PLOT':
        return this.parsePlot();
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

  // select_stmt := "select" ident_list
  private parseSelect(): SelectStmt {
    this.expect('SELECT');
    const columns = this.parseIdentList();
    return { kind: 'select', columns };
  }

  // filter_stmt := "filter" expr
  private parseFilter(): FilterStmt {
    this.expect('FILTER');
    const expr = this.parseExpr();
    return { kind: 'filter', expr };
  }

  // derive_stmt := "derive" ident "=" expr
  private parseDerive(): DeriveStmt {
    this.expect('DERIVE');
    const name = this.expect('IDENT').value;
    this.expect('EQ');
    const expr = this.parseExpr();
    return { kind: 'derive', name, expr };
  }

  // group_stmt := "group" "by" ident_list
  private parseGroup(): GroupStmt {
    this.expect('GROUP');
    this.expect('BY');
    const by = this.parseIdentList();
    return { kind: 'group', by };
  }

  // aggregate_stmt := "aggregate" agg_item ("," agg_item)*
  private parseAggregate(): AggregateStmt {
    this.expect('AGGREGATE');
    const items: AggItem[] = [this.parseAggItem()];
    while (this.peek().type === 'COMMA') {
      this.advance();
      items.push(this.parseAggItem());
    }
    return { kind: 'aggregate', items };
  }

  // agg_item := ident "=" agg_func "(" ident ")"
  private parseAggItem(): AggItem {
    const name = this.expect('IDENT').value;
    this.expect('EQ');
    const fn = this.expect('IDENT').value;
    this.expect('LPAREN');
    const arg = this.expect('IDENT').value;
    this.expect('RPAREN');
    return { name, fn, arg };
  }

  // sort_stmt := "sort" "by" ident ("asc" | "desc")?
  private parseSort(): SortStmt {
    this.expect('SORT');
    this.expect('BY');
    const by = this.expect('IDENT').value;
    let direction: 'asc' | 'desc' | undefined;
    if (this.peek().type === 'IDENT') {
      const val = this.peek().value;
      if (val === 'asc' || val === 'desc') {
        this.advance();
        direction = val;
      }
    }
    return { kind: 'sort', by, direction };
  }

  // take_stmt := "take" number
  private parseTake(): TakeStmt {
    this.expect('TAKE');
    const tok = this.expect('NUMBER');
    return { kind: 'take', count: parseFloat(tok.value) };
  }

  // plot_stmt := "plot" plot_type plot_arg+
  private parsePlot(): PlotStmt {
    this.expect('PLOT');
    const plotTypeStr = this.expect('IDENT').value;
    if (
      plotTypeStr !== 'bar' &&
      plotTypeStr !== 'line' &&
      plotTypeStr !== 'scatter'
    ) {
      throw new SyntaxError(`Unknown plot type '${plotTypeStr}'`);
    }
    const plotType = plotTypeStr as PlotType;
    const args: PlotArg[] = [this.parsePlotArg()];
    while (this.peek().type === 'IDENT') {
      const val = this.peek().value;
      if (val === 'x' || val === 'y' || val === 'color' || val === 'title') {
        args.push(this.parsePlotArg());
      } else {
        break;
      }
    }
    return { kind: 'plot', plotType, args };
  }

  // plot_arg := ("x" | "y" | "color") "=" ident | "title" "=" string
  private parsePlotArg(): PlotArg {
    const key = this.expect('IDENT').value;
    if (key !== 'x' && key !== 'y' && key !== 'color' && key !== 'title') {
      throw new SyntaxError(`Unknown plot argument '${key}'`);
    }
    this.expect('EQ');
    const value =
      key === 'title'
        ? this.expect('STRING').value
        : this.expect('IDENT').value;
    return { key: key as PlotArg['key'], value };
  }

  // ident_list := ident ("," ident)*
  private parseIdentList(): string[] {
    const idents: string[] = [this.expect('IDENT').value];
    while (this.peek().type === 'COMMA') {
      this.advance();
      idents.push(this.expect('IDENT').value);
    }
    return idents;
  }

  // expr := equality
  private parseExpr(): Expr {
    return this.parseEquality();
  }

  // equality := comparison (("==" | "!=") comparison)*
  private parseEquality(): Expr {
    let left = this.parseComparison();
    while (this.peek().type === 'EQEQ' || this.peek().type === 'NEQ') {
      const op = this.advance().value;
      const right = this.parseComparison();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  }

  // comparison := term ((">" | ">=" | "<" | "<=") term)*
  private parseComparison(): Expr {
    let left = this.parseTerm();
    while (['GT', 'GTE', 'LT', 'LTE'].includes(this.peek().type)) {
      const op = this.advance().value;
      const right = this.parseTerm();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  }

  // term := factor (("+" | "-") factor)*
  private parseTerm(): Expr {
    let left = this.parseFactor();
    while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.advance().value;
      const right = this.parseFactor();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  }

  // factor := unary (("*" | "/") unary)*
  private parseFactor(): Expr {
    let left = this.parseUnary();
    while (this.peek().type === 'STAR' || this.peek().type === 'SLASH') {
      const op = this.advance().value;
      const right = this.parseUnary();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  }

  // unary := ("!" | "-") unary | primary
  private parseUnary(): Expr {
    if (this.peek().type === 'BANG' || this.peek().type === 'MINUS') {
      const op = this.advance().value as '!' | '-';
      const operand = this.parseUnary();
      return { kind: 'unary', op, operand };
    }
    return this.parsePrimary();
  }

  // primary := number | string | ident | "(" expr ")" | call
  // call := ident "(" arg_list? ")"
  private parsePrimary(): Expr {
    const tok = this.peek();

    if (tok.type === 'NUMBER') {
      this.advance();
      return { kind: 'number', value: parseFloat(tok.value) };
    }

    if (tok.type === 'STRING') {
      this.advance();
      return { kind: 'string', value: tok.value };
    }

    if (tok.type === 'IDENT') {
      this.advance();
      if (this.peek().type === 'LPAREN') {
        this.advance(); // consume '('
        const args: Expr[] = [];
        if (this.peek().type !== 'RPAREN') {
          args.push(this.parseExpr());
          while (this.peek().type === 'COMMA') {
            this.advance();
            args.push(this.parseExpr());
          }
        }
        this.expect('RPAREN');
        return { kind: 'call', callee: tok.value, args };
      }
      return { kind: 'ident', name: tok.value };
    }

    if (tok.type === 'LPAREN') {
      this.advance();
      const expr = this.parseExpr();
      this.expect('RPAREN');
      return expr;
    }

    throw new SyntaxError(
      `Unexpected token '${tok.value}' at position ${tok.pos}`,
    );
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
