import './style.css';
import { Parser } from './core/parser';

const input = `load "data.csv"
derive total = price * quantity - discount
group by category
aggregate x = sum(total)
`;

const parser = new Parser(input);

document.body.innerText = `${JSON.stringify(parser.parse(), null, 2)}`;
