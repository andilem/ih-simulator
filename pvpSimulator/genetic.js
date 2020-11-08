class Task {
	constructor(id, action, data, onProgress) {
		this.id = id;
		this.action = action;
		this.data = data;
		this.onProgress = onProgress;
		this.result = undefined;
		this.error = undefined;
		this.resolve = undefined;
		this.reject = undefined;
		this.promise = new Promise((resolve, reject) => {
			if (this.result !== undefined) {
				resolve(result);
			} else if (this.error !== undefined) {
				reject(result);
			} else {
				this.resolve = resolve;
				this.reject = reject;
			}
		})
	}

	finish(result) {
		if (this.resolve !== undefined) {
			this.resolve(result);
		} else {
			this.result = result;
		}
	}

	fail(error) {
		if (this.reject !== undefined) {
			this.reject(error);
		} else {
			this.error = error;
		}
	}
}

const workerPool = {
	id: 0,
	maxSize: navigator.hardwareConcurrency,
	workers: [],
	available: [],
	tasks: {},
	queue: [],

	submit: function (action, data, onProgress) {
		const task = new Task(this.id++, action, data, onProgress);
		this.tasks[task.id] = task;

		let worker;
		if (this.available.length > 0) {
			worker = this.available.pop();
		} else if (this.workers.length < this.maxSize) {
			worker = new Worker('geneticWorker.js');
			worker.onmessage = e => this.onMessage(worker, e);
			this.workers.push(worker);
		} else {
			this.queue.push(task);
		}
		if (worker) {
			this.runTask(worker, task);
		}
		return task.promise;
	},

	runTask: function (worker, task) {
		console.debug('Start task ' + task.id);
		worker.postMessage({
			id: task.id,
			action: task.action,
			data: task.data
		});
	},

	onMessage: function (worker, e) {
		const id = e.data.id;
		const task = this.tasks[id];
		const type = e.data.type;
		if (type == 'progress') {
			if (task.onProgress !== undefined) {
				task.onProgress(e.data.data);
			}
			return;
		}
		delete this.tasks[id];
		if (type == 'result') {
			console.debug('Task ' + id + ' finished');
			task.finish(e.data.data);
		} else if (type == 'error') {
			console.warn('Task ' + id + ' error: ' + e.data.data);
			task.fail(e.data.data);
		}
		const nextTask = this.queue.shift();
		if (nextTask) {
			this.runTask(worker, nextTask);
		} else {
			this.available.push(worker);
		}
	}
};

//random = rng(1);

function randomTeam() {
	return {
		heroes: Array.from({ length: 6 }, () => randomHero()),
		monster: randomMonster(),
		fights: 0,
		wins: 0,
	}
}

function randomMonster() {
	const keys = Object.keys(baseMonsterStats).filter(s => s != 'None');
	return keys[randInt(keys.length)];
}

function randomHero() {
	const keys = Object.keys(baseHeroStats).filter(s => s != 'None');
	const name = keys[randInt(keys.length)];
	const hero = {
		name: name,
		gear: randomGear(),
		stone: randomStone(),
		artifact: randomArtifact(baseHeroStats[name].heroFaction),
		skin: randomSkin(name),
		E1: randomEnable(3),
		E2: randomEnable(3),
		E3: randomEnable(3),
		E4: randomEnable(3),
		E5: randomEnable(2),
	};
	return hero;
}

function randomGear() {
	const gearOptions = ['ClassGear', 'SplitHP', 'SplitATK'];
	return gearOptions[randInt(gearOptions.length)];
}

function randomStone() {
	const keys = Object.keys(stones).filter(s => s != 'None');
	return keys[randInt(keys.length)];
}

function randomArtifact(faction) {
	// no enhanced P2W artifacts
	const keys = Object.keys(artifacts).filter(s =>
		s != 'None'
		&& (artifacts[s].limit == '' || artifacts[s].limit == faction)
		&& !s.startsWith('Glittery ')
		&& !s.startsWith('Radiant ')
		&& !s.startsWith('Splendid ')
	);
	return keys[randInt(keys.length)];
}

function randomSkin(name) {
	const heroSkins = skins[name];
	if (heroSkins === undefined || Object.keys(heroSkins).length == 0) return 'None';
	const keys = Object.keys(heroSkins);
	const legendary = keys.filter(s => s.startsWith('Legendary'));
	if (legendary.length > 0) {
		return legendary[randInt(legendary.length)]
	} else {
		return keys[randInt(keys.length)];
	}
}

function randomEnable(options) {
	return randInt(options) + 1;
}

function logRanking(teams, heroRankings, generation, combatLog) {
	let msg = '===== GENERATION ' + generation + ' RANKINGS =====';
	console.log(msg);
	if (combatLog) combatLog.innerText = msg;

	msg = '===== TEAM RANKING =====';
	console.log(msg);
	if (combatLog) combatLog.innerText += '\n\n' + msg;

	for (var i = 0; i < teams.length; i++) {
		msg = (i + 1) + '. ' + desc(teams[i]);
		console.log(msg);
		if (combatLog) combatLog.innerText += '\n\n' + msg;
	}

	msg = '===== HERO RANKING =====';
	console.log(msg);
	if (combatLog) combatLog.innerText += '\n\n' + msg;

	for (var i = 0; i < heroRankings.length; i++) {
		msg = (i + 1) + '. ' + descHero(heroRankings[i].best) + ' - ' + heroRankings[i].score;
		console.log(msg);
		if (combatLog) combatLog.innerText += '\n' + msg;
	}
}

async function findBestTeams() {
	const generations = 100;
	const population = 50;
	const keepBest = 20;
	const generationsImprove = 5;

	const combatLog = document.getElementById('combatLog');

	let teams = loadTeams('teams');
	if (!teams) {
		teams = Array.from({ length: keepBest }, () => randomTeam());
		console.log('Created ' + teams.length + ' random teams');
		saveTeams('teams', teams);
	} else {
		if (teams.length > keepBest) {
			teams.length = keepBest;
			saveTeams('teams', teams);
		}
		console.log('Loaded ' + teams.length + ' teams');
	}

	let heroRankings = getHeroRankings(teams);
	logRanking(teams, heroRankings, 0, combatLog);

	let newGen = loadTeams('newGen');
	if (newGen) {
		if (newGen.length > population) newGen.length = population;
		console.log('Loaded generation 1 with ' + newGen.length + ' teams');
	}

	// evolve
	for (var n = 1; n <= generations; n++) {
		if (!newGen) {
			const bestHeroes = {};
			heroRankings.forEach(r => bestHeroes[r.hero] = r.best);
			newGen = newGeneration(teams, population, keepBest, bestHeroes);
			console.log('Created generation ' + n + ' with ' + newGen.length + ' teams');
		}
		saveTeams('newGen', newGen);

		const timeStart = Date.now();

		const promises = [];
		for (let i = newGen.length - 1; i >= 0; i--) {
			if (newGen[i].fights == 0) {
				promises.push(workerPool.submit('improveTeam', { team: newGen[i], refs: teams, generations: generationsImprove }, data => {
					newGen[i] = data;
					saveTeams('newGen', newGen);
				}));
			}
		}
		await Promise.all(promises);

		console.log('Generation ' + n + ' optimized in ' + ((Date.now() - timeStart) / 60_000).toFixed(1) + ' min');

		teams = selectBest(newGen, keepBest);
		newGen = undefined;
		deleteStorage('newGen');
		saveTeams('teams', teams);

		heroRankings = getHeroRankings(teams);
		logRanking(teams, heroRankings, n, combatLog);
	}
}


function newGeneration(teams, size, keepBest, bestHeroes) {
	if (keepBest > teams.length) keepBest = teams.length;

	const newGen = [];
	// first keepBest individuals: best teams
	for (var c = 0; c < keepBest; c++) {
		newGen[c] = crossoverTeams(teams[c], teams[c], 0, bestHeroes);
	}
	// remaining individuals: recombinations/mutations of best 
	for (var c = keepBest; c < size + 3; c++) { // generate some more because duplicates are removed afterwards
		newGen[c] = crossoverTeams(teams[randExp(teams.length, 0.9)], teams[randExp(teams.length, 0.9)], 1.2, bestHeroes);
	}

	const result = [];
	for (const t of newGen) {
		if (result.length < size && result.every(r => isDiverse(r, t, 1))) result.push(t);
	}

	return result;
}

function selectBest(teams, num) {
	const result = [];
	const penalties = {};

	while (result.length < num && teams.length > 0) {
		for (const t of teams) {
			let penalty = 0;
			for (const h of t.heroes) {
				const p = penalties[h.name];
				if (p) penalty += p;
			}
			t.penalty = penalty;
		}
		teams.sort((a, b) => b.wins / b.fights - b.penalty - a.wins / a.fights + a.penalty);
		const team = teams.shift();
		result.push(team);
		for (const h of team.heroes) {
			if (h.name in penalties) {
				penalties[h.name] += 0.01;
			} else {
				penalties[h.name] = 0.01;
			}
		}
		teams = teams.filter(t => isDiverse(t, team, 2));
	}
	result.sort((a, b) => b.wins / b.fights - a.wins / a.fights);

	return result;
}

function isDiverse(team1, team2, minDiversity) {
	const heroCount = {};
	for (const h of team1.heroes) {
		if (h.name in heroCount) {
			heroCount[h.name]++;
		} else {
			heroCount[h.name] = 1;
		}
	}
	for (const h of team2.heroes) {
		if (h.name in heroCount) {
			heroCount[h.name]--;
		} else {
			heroCount[h.name] = -1;
		}
	}
	let result = 0;
	for (const count of Object.values(heroCount)) {
		if (count > 0) result += count;
	}
	return result >= minDiversity;
}


function getHeroRankings(teams) {
	const score = {};
	for (var i = 0; i < teams.length; i++) {
		for (const h of teams[i].heroes) {
			if (h.name in score) score[h.name].score += teams.length - i;
			else score[h.name] = { best: h, score: teams.length - i };
		}
	}
	const rankings = [];
	for (const s in score) {
		rankings.push({ hero: s, score: score[s].score, best: score[s].best });
	}
	rankings.sort((a, b) => b.score - a.score);
	return rankings;
}


function crossoverTeams(team1, team2, mutations, bestHeroes) {
	const result = {
		heroes: [],
		monster: random() < 0.5 ? team1.monster : team2.monster,
		fights: 0,
		wins: 0,
	};
	for (var i = 0; i < 6; i++) {
		if (random() < mutations / 6) {
			const hero = randomHero();
			const best = bestHeroes[hero.name];
			result.heroes[i] = best ? Object.assign({}, best) : hero;
		} else {
			result.heroes[i] = Object.assign({}, random() < 0.5 ? team1.heroes[i] : team2.heroes[i]);
		}
	}
	return result;
}


function saveTeams(key, data) {
	if (typeof (Storage) === undefined) {
		console.warn('Storage not available');
		return;
	}

	localStorage.setItem(key, JSON.stringify(data));
	console.debug('Saved ' + data.length + ' teams at ' + key);
}

function loadTeams(key) {
	if (typeof (Storage) === undefined) {
		console.warn('Storage not available');
		return null;
	}

	const json = localStorage.getItem(key);
	if (json === null) {
		console.info('No teams found in storage at ' + key);
		return null;
	}

	const data = JSON.parse(json);
	console.log('Loaded ' + data.length + ' teams from ' + key);
	return data;
}

function deleteStorage(key) {
	if (typeof (Storage) === undefined) {
		console.warn('Storage not available');
		return;
	}

	if (key) {
		localStorage.removeItem(key);
	}
	else {
		['teams', 'newGen'].forEach(k => localStorage.removeItem(k));
	}
	console.info('Storage deleted at ' + key);
}


function descHero(hero) {
	return hero.name + ' (' + hero.gear + '; ' + hero.stone + '; ' + hero.artifact + '; ' + hero.skin + '; '
		+ hero.E1 + hero.E2 + hero.E3 + hero.E4 + hero.E5 + ')';
}

function desc(team) {
	let result = '';
	for (const h of team.heroes) {
		result += descHero(h) + ',\n';
	}
	result += team.monster;
	if (team.fights > 0) {
		result += '\n  win ' + team.wins + '/' + team.fights + ' = ' + (team.wins / team.fights * 100).toFixed(1) + ' %';
	}
	return result;
}

function shortDesc(team) {
	let result = '';
	for (const h of team.heroes) {
		result += h.name + ', ';
	}
	result += team.monster;
	if (team.fights > 0) {
		result += ' -  win ' + team.wins + '/' + team.fights + ' = ' + (team.wins / team.fights * 100).toFixed(1) + ' %';
	}
	return result;
}

function showTeams() {
	const combatLog = document.getElementById('combatLog');
	const teams = loadTeams('teams');
	if (teams) {
		combatLog.innerText = JSON.stringify(teams, null, 4);
	} else {
		combatLog.innerText = 'Not found';
	}
}

function parseTeams() {
	const combatLog = document.getElementById('combatLog');
	try {
		const teams = JSON.parse(combatLog.innerText);
		saveTeams('teams', teams);
	} catch (e) {
		combatLog.innerText = e;
	}
}


async function optimizeTeam() {
	const generationsImprove = 20;

	const combatLog = document.getElementById('combatLog');
	const teamInput = document.getElementById('teamInput');

	let teams = loadTeams('teams');
	if (!teams) {
		combatLog.innerText = 'No teams found. Please import first.'
		return;
	} else {
		console.log('Loaded ' + teams.length + ' teams');
	}

	let team;
	try {
		team = JSON.parse(teamInput.innerText);
	} catch (e) {
		combatLog.innerText = 'Cannot parse team: ' + e;
		return;
	}

	let n = 0;
	while (true) {
		await workerPool.submit('improveTeam', { team: team, refs: teams, generations: generationsImprove }, data => {
			team = data;
			const msg = 'Generation ' + (++n) + ' best team:\n' + desc(team);
			console.log(msg);
			combatLog.innerText = msg;
		});
	}
}
