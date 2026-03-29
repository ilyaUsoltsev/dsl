# DSL grammar

## Statements

program := statement\*

statement := load_stmt
| select_stmt
| filter_stmt
| derive_stmt
| group_stmt
| aggregate_stmt
| sort_stmt
| take_stmt
| plot_stmt

load_stmt := "load" string
select_stmt := "select" ident_list
filter_stmt := "filter" expr
derive_stmt := "derive" ident "=" expr
group_stmt := "group" "by" ident_list
aggregate_stmt:= "aggregate" agg_item ("," agg_item)\*
agg_item := ident "=" agg_func "(" ident ")"
sort_stmt := "sort" "by" ident ("asc" | "desc")?
take_stmt := "take" number
plot_stmt := "plot" plot_type plot_args

plot_type := "bar" | "line" | "scatter"
plot_args := plot_arg+
plot_arg := "x" "=" ident
| "y" "=" ident
| "color" "=" ident
| "title" "=" string

## Expressions

expr := equality
equality := comparison (("==" | "!=") comparison)_
comparison := term ((">" | ">=" | "<" | "<=") term)_
term := factor (("+" | "-") factor)_
factor := unary (("_" | "/") unary)\*
unary := ("!" | "-") unary | primary
primary := number | string | ident | "(" expr ")" | call

call := ident "(" arg_list? ")"
arg_list := expr ("," expr)\*
