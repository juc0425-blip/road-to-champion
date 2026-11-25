const assert=require('node:assert/strict'), L=require('./logic.js');global.window={};require('./data.js');const production=window.ROAD_DATA;const D={...production,training:[],rounds:[],matches:[]};const copy=()=>structuredClone(D);assert.equal(L.today(new Date('2026-11-23T15:01:00Z')),'2026-11-24');assert.equal(L.dday('2027-01-16','2026-11-24'),53);assert.equal(L.dday('2027-01-16','2027-01-16'),0);assert.deepEqual(L.week('2026-11-29'),{start:'2026-11-23',end:'2026-11-29'});assert.deepEqual(L.week('2026-11-30'),{start:'2026-11-30',end:'2026-12-06'});assert.equal(L.weekly(D,'2026-11-24').count,0);const d=copy();d.training=[{id:'t1',player:'cjw',date:'2026-11-23',type:'스크린 라운드',score:84,par:72,sessionId:'x'},{id:'t2',player:'cjw',date:'2026-11-24',type:'퍼팅',minutes:30},{id:'t3',player:'cjw',date:'2026-11-22',type:'기타 연습'}];d.rounds=[{id:'r1',player:'cjw',date:'2026-11-23',score:84,par:72,sessionId:'x'}];assert.equal(L.weekly(d,'2026-11-24').count,2);assert.equal(L.weekly(d,'2026-11-24').total,3);assert.equal(L.growth(d,d.players[3],'2026-11-24').avg,null);const all=copy();all.training=Array.from({length:5},(_,i)=>({id:'r'+i,player:'cjw',date:'2026-11-'+(20+i),type:'스크린 라운드',score:82+i,par:72}));assert.equal(L.growth(all,all.players[3],'2026-11-24').avg,12);assert.equal(L.growth(all,all.players[3],'2026-11-24').best.score,82);const pars=Array(18).fill(4);const scores={lhj:Array(18).fill(4),khs:Array(18).fill(4),pcb:Array(18).fill(5),cjw:Array(18).fill(5)};let m=L.match({pars,scores},D.players);assert.equal(m.total,234);assert.equal(m.over,18);assert.equal(m.contribution.pcb,9);assert.equal(m.contribution.cjw,9);assert.equal(Object.values(m.contribution).reduce((a,b)=>a+b),54);assert.equal(m.rate,0);assert.equal(L.match({pars,scores:{...scores,cjw:[4]}},D.players),null);const example=structuredClone(scores);for(let i=0;i<10;i++){example.lhj[i]=5;example.cjw[i]=6;example.pcb[i]=5;}m=L.match({pars,scores:example},D.players);assert.equal(m.total,244);assert.equal(m.over,28);assert.deepEqual(L.points([12,12,13,14,15]),[5,5,3,2,1]);assert.equal(L.points([12,13]),null);const tie=L.match({pars,scores:Object.fromEntries(D.players.map(p=>[p.id,Array(18).fill(4)]))},D.players);assert.equal(tie.contribution.cjw,13.5);assert.equal(tie.total,216);assert.equal(D.training.length+D.rounds.length+D.matches.length,0);console.log('PASS: KST, D-day, week boundary, empty data, dedupe, growth, Best 3 244/+28, tie weights, incomplete match, point ties.');

const weekDate = '2026-11-24';
const currentWeek = L.weekly(production, weekDate);
const expectedTeamGoal = production.event.goal * production.players.length;
assert.equal(currentWeek.count, 2);
assert.equal(currentWeek.goal, expectedTeamGoal);
assert.equal(currentWeek.rate, 2 / expectedTeamGoal * 100);
for (const row of currentWeek.rows) {
  assert.equal(row.rate, row.count / production.event.goal * 100);
}

for (const [personalGoal, teamGoal, teamRate, playerRate] of [
  [2, 8, 25, 100],
  [3, 12, 2 / 12 * 100, 2 / 3 * 100]
]) {
  const week = L.weekly({...d, event: {...d.event, goal: personalGoal}}, weekDate);
  assert.equal(week.goal, teamGoal);
  assert.equal(week.rate, teamRate);
  assert.equal(week.rows.find(player => player.id === 'cjw').rate, playerRate);
}
console.log('PASS: individual and team weekly targets, including a changed target.');

for(const r of production.training){assert.equal(r.holeScores.reduce((a,b)=>a+b,0),r.score);assert.equal(r.pars.reduce((a,b)=>a+b,0),r.par);assert.equal(r.putts.reduce((a,b)=>a+b,0),r.puttTotal)}assert.equal(production.matches[0].date,'2026-11-29');assert.equal(L.results(production,'2026-11-24').length,0);console.log('PASS: actual records, totals, schedule, no fabricated match result.');

const {forecast, previousForecast} = production;
assert.deepEqual(forecast.map(({id, rank, chance, points}) => [id, rank, chance, points]), [
  [5, 1, 36, 65.9], [3, 2, 32, 65.2], [2, 3, 20, null],
  [4, 4, 7, null], [1, 5, 4, null]
]);
assert.deepEqual(previousForecast.map(team => team.chance), ['1% 미만', '11%', '48%', '1% 미만', '40%']);
assert.deepEqual(production.players.map(player => player.initial), [7.1, 2.8, 2.8, 8.0]);
for (const team of forecast) {
  assert.equal(team.scores.length, previousForecast.find(entry => entry.id === team.id).names.length);
  for (const [low, high] of team.scores) assert.ok(Number.isInteger(low) && Number.isInteger(high) && low <= high);
}
console.log('PASS: current forecasts, withheld points, historical probabilities, initial averages, score ranges.');
