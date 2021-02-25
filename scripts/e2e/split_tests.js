const glob = require('glob');
const suite = require('../../tests/conf').config.suites.web[0];
const fs = require('fs');
console.log(suite);

console.log('here');
const list = glob.sync(`tests/${suite}`);
const runner_count = list.length / 10;
const split = [];


for (let i = 0, j = list.length; i < j; i += runner_count) {
  split.push(list.slice(i, i + runner_count)); 
}
console.log('here1');
const base = { 'include': [] };

console.log();
console.log('here2');
split.forEach((list) => {
  base.include.push({ 'node': '8','specs': list.join()});
  base.include.push({ 'node': '10','specs': list.join()});
  base.include.push({ 'node': '12','specs': list.join()});
});
console.log('here3');

console.log(base);
fs.writeFileSync('./test_matrix.json', JSON.stringify(base), 'utf8');
console.log('here4');
