import './style.css';
import { Parser } from './core/parser';
import { Executor } from './core/executor';
import Papa from 'papaparse';
import type { Row, Table } from './types';

export function parseCsv(text: string): Table {
  const result = Papa.parse<Row>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  return result.data;
}

const input = `
derive total = price * quantity - discount
`;

const csvText = `product,price,quantity,discount
A,10,2,5
B,20,1,0
C,15,3,10
`;
const table = parseCsv(csvText);

const parser = new Parser(input);
const { statements } = parser.parse();
const executor = new Executor(statements, table);
executor.execute();

document.body.innerText = `${JSON.stringify(statements)}\n${JSON.stringify(table)}`;
