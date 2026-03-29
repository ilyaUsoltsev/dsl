import './style.css';
import { Parser } from './core/parser';

const input = `load "data.csv"
derive total = price * quantity
group by category
aggregate x = sum(total)
export total`;

const parser = new Parser(input);

document.body.innerText = `${JSON.stringify(parser.parse(), null, 2)}`;
