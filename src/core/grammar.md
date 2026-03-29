# DSL grammar

program := statement\*

statement := load_stmt
| derive_stmt
| group_stmt
| aggregate_stmt
| export_stmt

load_stmt := "load" string

derive_stmt := "derive" ident "=" expr

group_stmt := "group" "by" ident

aggregate_stmt:= "aggregate" ident "=" "sum" "(" ident ")"

export_stmt := "export" ident_list

ident_list := ident ("," ident)\*

expr := ident (("\*" | "+" | "-" | "/") ident)?
