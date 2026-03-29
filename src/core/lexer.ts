export type TokenType =
  | "LOAD"
  | "SELECT"
  | "FILTER"
  | "DERIVE"
  | "GROUP"
  | "BY"
  | "AGGREGATE"
  | "SORT"
  | "TAKE"
  | "PLOT"
  | "IDENT"
  | "NUMBER"
  | "STRING"
  | "EQEQ"
  | "NEQ"
  | "GT"
  | "GTE"
  | "LT"
  | "LTE"
  | "EQ"
  | "BANG"
  | "STAR"
  | "PLUS"
  | "MINUS"
  | "SLASH"
  | "COMMA"
  | "LPAREN"
  | "RPAREN"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const KEYWORDS: Record<string, TokenType> = {
  load: "LOAD",
  select: "SELECT",
  filter: "FILTER",
  derive: "DERIVE",
  group: "GROUP",
  by: "BY",
  aggregate: "AGGREGATE",
  sort: "SORT",
  take: "TAKE",
  plot: "PLOT",
};

export class Lexer {
  private pos = 0;
  private readonly src: string;

  constructor(src: string) {
    this.src = src;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    while (true) {
      const tok = this.next();
      tokens.push(tok);
      if (tok.type === "EOF") break;
    }
    return tokens;
  }

  private next(): Token {
    this.skipWhitespace();
    if (this.pos >= this.src.length) return this.tok("EOF", "", this.pos);

    const start = this.pos;
    const ch = this.src[start];

    if (ch === '"') return this.readString();
    if (this.isAlpha(ch)) return this.readIdent();
    if (this.isDigit(ch)) return this.readNumber();

    this.pos++;
    switch (ch) {
      case "=":
        if (this.src[this.pos] === "=") { this.pos++; return this.tok("EQEQ", "==", start); }
        return this.tok("EQ", "=", start);
      case "!":
        if (this.src[this.pos] === "=") { this.pos++; return this.tok("NEQ", "!=", start); }
        return this.tok("BANG", "!", start);
      case ">":
        if (this.src[this.pos] === "=") { this.pos++; return this.tok("GTE", ">=", start); }
        return this.tok("GT", ">", start);
      case "<":
        if (this.src[this.pos] === "=") { this.pos++; return this.tok("LTE", "<=", start); }
        return this.tok("LT", "<", start);
      case "*": return this.tok("STAR", "*", start);
      case "+": return this.tok("PLUS", "+", start);
      case "-": return this.tok("MINUS", "-", start);
      case "/": return this.tok("SLASH", "/", start);
      case ",": return this.tok("COMMA", ",", start);
      case "(": return this.tok("LPAREN", "(", start);
      case ")": return this.tok("RPAREN", ")", start);
    }

    throw new SyntaxError(`Unexpected character '${ch}' at position ${start}`);
  }

  private readIdent(): Token {
    const start = this.pos;
    while (this.pos < this.src.length && this.isAlphaNum(this.src[this.pos])) {
      this.pos++;
    }
    const value = this.src.slice(start, this.pos);
    const type = KEYWORDS[value] ?? "IDENT";
    return this.tok(type, value, start);
  }

  private readNumber(): Token {
    const start = this.pos;
    while (this.pos < this.src.length && this.isDigit(this.src[this.pos])) {
      this.pos++;
    }
    if (this.pos < this.src.length && this.src[this.pos] === ".") {
      this.pos++;
      while (this.pos < this.src.length && this.isDigit(this.src[this.pos])) {
        this.pos++;
      }
    }
    return this.tok("NUMBER", this.src.slice(start, this.pos), start);
  }

  private readString(): Token {
    const start = this.pos;
    this.pos++; // skip opening "
    while (this.pos < this.src.length && this.src[this.pos] !== '"') {
      this.pos++;
    }
    if (this.pos >= this.src.length) {
      throw new SyntaxError(`Unterminated string starting at position ${start}`);
    }
    this.pos++; // skip closing "
    const value = this.src.slice(start + 1, this.pos - 1);
    return this.tok("STRING", value, start);
  }

  private skipWhitespace(): void {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) {
      this.pos++;
    }
  }

  private isAlpha(ch: string): boolean {
    return /[a-zA-Z_]/.test(ch);
  }

  private isAlphaNum(ch: string): boolean {
    return /[a-zA-Z0-9_]/.test(ch);
  }

  private isDigit(ch: string): boolean {
    return /[0-9]/.test(ch);
  }

  private tok(type: TokenType, value: string, pos: number): Token {
    return { type, value, pos };
  }
}
