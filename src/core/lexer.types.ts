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
