class Task {
	constructor(id, action, data, onResult, onProgress) {
		this.id = id;
		this.action = action;
		this.data = data;
		this.onResult = onResult;
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

	progress(result) {
		if (this.onProgress) {
			this.onProgress(result);
		}
	}

	finish(result) {
		if (this.onResult) {
			this.onResult(result);
		}
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

	submit: function (action, data, onResult, onProgress) {
		const task = new Task(this.id++, action, data, onResult, onProgress);
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
			task.progress(e.data.data);
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

function createExpandableDiv(parent, caption, expanded = false) {
	const div = document.createElement('div');
	div.innerText = caption;
	div.className = 'accordion';
	const expand = document.createElement('div');
	expand.className = 'panel';
	if (expanded) {
		expand.style.maxHeight = 'none';
		div.classList.toggle('activeC');
	}

	div.onclick = () => {
		div.classList.toggle('activeC');
		expand.style.maxHeight = expand.style.maxHeight ? null : 'none';
	};
	parent.appendChild(div);
	parent.appendChild(expand);
	return expand;
}

function logRanking(rankings, refs, generation, combatLog) {
	combatLog.innerHTML = '';
	let msg = '===== GENERATION ' + generation + ' RANKINGS =====';
	let logMsg = msg;
	const expandGen = createExpandableDiv(combatLog, msg, true);

	msg = '===== HERO RANKING =====';
	logMsg += '\n' + msg;
	const expandHeroes = createExpandableDiv(expandGen, msg, true);

	for (var i = 0; i < rankings.heroes.length; i++) {
		const heroRanking = rankings.heroes[i];
		msg = (i + 1) + '. ' + heroRanking.hero + ' - ' + heroRanking.points;
		logMsg += '\n' + msg;
		const expandHero = createExpandableDiv(expandHeroes, msg);
		msg = 'Gear: ' + heroRanking.gears[0].name;
		//logMsg += '\n' + msg;
		let expandDetails = createExpandableDiv(expandHero, msg);
		for (var j = 0; j < heroRanking.gears.length; j++) {
			msg = (j + 1) + '. ' + heroRanking.gears[j].name + ' - ' + heroRanking.gears[j].points;
			//logMsg += '\n' + msg;
			expandDetails.innerText += msg + '\n';
		}
		msg = 'Stone: ' + heroRanking.stones[0].name;
		//logMsg += '\n' + msg;
		expandDetails = createExpandableDiv(expandHero, msg);
		for (var j = 0; j < heroRanking.stones.length; j++) {
			msg = (j + 1) + '. ' + heroRanking.stones[j].name + ' - ' + heroRanking.stones[j].points;
			//logMsg += '\n' + msg;
			expandDetails.innerText += msg + '\n';
		}
		msg = 'Artifact: ' + heroRanking.artifacts[0].name;
		//logMsg += '\n' + msg;
		expandDetails = createExpandableDiv(expandHero, msg);
		for (var j = 0; j < heroRanking.artifacts.length; j++) {
			msg = (j + 1) + '. ' + heroRanking.artifacts[j].name + ' - ' + heroRanking.artifacts[j].points;
			//logMsg += '\n' + msg;
			expandDetails.innerText += msg + '\n';
		}
		msg = 'Skin: ' + heroRanking.skins[0].name;
		//logMsg += '\n' + msg;
		expandDetails = createExpandableDiv(expandHero, msg);
		for (var j = 0; j < heroRanking.skins.length; j++) {
			msg = (j + 1) + '. ' + heroRanking.skins[j].name + ' - ' + heroRanking.skins[j].points;
			//logMsg += '\n' + msg;
			expandDetails.innerText += msg + '\n';
		}
		msg = 'Enables: ' + heroRanking.enables[0].name;
		//logMsg += '\n' + msg;
		expandDetails = createExpandableDiv(expandHero, msg);
		for (var j = 0; j < heroRanking.enables.length; j++) {
			msg = (j + 1) + '. ' + heroRanking.enables[j].name + ' - ' + heroRanking.enables[j].points;
			//logMsg += '\n' + msg;
			expandDetails.innerText += msg + '\n';
		}
	}

	msg = '===== ARTIFACT RANKING =====';
	logMsg += '\n' + msg;
	const expandArtifacts = createExpandableDiv(expandGen, msg);
	for (var i = 0; i < rankings.artifacts.length; i++) {
		msg = (i + 1) + '. ' + rankings.artifacts[i].name + ' - ' + rankings.artifacts[i].points;
		logMsg += '\n' + msg;
		expandArtifacts.innerText += msg + '\n';
	}

	msg = '===== SOME DIVERSE TEAMS =====';
	logMsg += '\n' + msg;
	const expandTeams = createExpandableDiv(expandGen, msg);
	for (var i = 0; i < refs.length; i++) {
		msg = (i + 1) + '. ' + shortDesc(refs[i]);
		logMsg += '\n' + msg;
		const expandTeam = createExpandableDiv(expandTeams, msg);
		expandTeam.innerText = desc(refs[i]);
	}

	console.log(logMsg);
}

async function findBestTeams() {
	const generations = 100;
	const population = 100;
	const numRefs = 20;
	const generationsImprove = 5;

	const combatLog = document.getElementById('combatLog');

	let refs = loadTeams('refs');
	if (!refs) {
		refs = Array.from({ length: numRefs }, () => randomTeam());
		console.log('Created ' + refs.length + ' random reference teams');
		saveTeams('refs', refs);
	} else {
		if (refs.length > numRefs) {
			refs.length = numRefs;
			saveTeams('refs', refs);
		}
		console.log('Loaded ' + refs.length + ' reference teams');
	}

	let rankings;
	let teams = loadTeams('teams');
	if (teams) {
		if (teams.length > population) teams.length = population;
		console.log('Loaded generation 0 with ' + teams.length + ' teams');
		rankings = getRankings(refs);
		logRanking(rankings, refs, 0, combatLog);
	}

	{
		const teamsNew = loadTeams('teams.new');
		if (teamsNew) {
			teams = teamsNew;
			if (teams.length > population) teams.length = population;
			console.log('Loaded generation 1 with ' + teams.length + ' teams');
		}
	}

	// evolve
	for (var n = 1; n <= generations; n++) {
		if (n > 1 || !teams) {
			teams = newGeneration(teams || refs, population, 3, rankings);
			console.log('Created generation ' + n + ' with ' + teams.length + ' teams');
			saveTeams('teams.new', teams);
		}

		const timeStart = Date.now();

		const promises = [];
		let count = 0;
		for (let i = 0; i < teams.length; i++) {
			if (teams[i].fights == 0) {
				promises.push(workerPool.submit('improveTeam', {
					team: teams[i], refs: refs, options: { generations: generationsImprove }
				}, () => {
					console.log(++count + ' / ' + teams.length + ' teams optimized');
				}, data => {
					teams[i] = data;
					saveTeams('teams.new', teams);
				}));
			} else {
				count++;
			}
		}
		console.log(count + ' / ' + teams.length + ' teams optimized');
		await Promise.all(promises);

		console.log('Generation ' + n + ' optimized in ' + ((Date.now() - timeStart) / 60_000).toFixed(1) + ' min');

		teams.sort((a, b) => b.wins / b.fights - a.wins / a.fights);

		// ensure diversity 2
		const newTeams = [];
		for (const t of teams) {
			if (newTeams.every(n => isDiverse(n, t, 2))) newTeams.push(t);
		}
		teams = newTeams;

		saveTeams('teams', teams);
		deleteStorage('teams.new');
		rankings = getRankings(teams);

		refs = getRefs(teams, numRefs);
		saveTeams('refs', refs);
		logRanking(rankings, refs, n, combatLog);
	}
}

function newGeneration(teams, size, keepBest, rankings) {
	if (keepBest > teams.length) keepBest = teams.length;

	const newGen = [];
	// first keepBest individuals: best teams
	for (var c = 0; c < keepBest; c++) {
		newGen[c] = crossoverTeams(teams[c], teams[c], 0, rankings);
	}
	// remaining individuals: recombinations/mutations of best 
	for (var c = keepBest; c < size * 1.5; c++) { // generate some more because duplicates are removed below
		newGen[c] = crossoverTeams(teams[randExp(teams.length, 0.9)], teams[randExp(teams.length, 0.9)], 1, rankings);
	}

	const result = [];
	for (const t of newGen) {
		if (result.length < size && result.every(r => isDiverse(r, t, 1))) result.push(t);
	}

	return result;
}

function getRefs(teams, num) {
	teams = teams.slice();
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

function getSortedRankings(scores) {
	const result = [];
	for (const key in scores) {
		result.push({ name: key, points: scores[key] });
	}
	result.sort((a, b) => b.points - a.points);
	return result;
}

function getRankings(teams) {
	const heroScores = {};
	const artifactScores = {};
	for (var i = 0; i < teams.length; i++) {
		const points = teams.length - i;
		for (const h of teams[i].heroes) {
			if (h.artifact in artifactScores) artifactScores[h.artifact] += points; else artifactScores[h.artifact] = points;
			let heroScore = heroScores[h.name];
			if (!heroScore) {
				heroScore = {
					points: 0,
					gears: {},
					stones: {},
					artifacts: {},
					skins: {},
					enables: {},
				};
				heroScores[h.name] = heroScore;
			}
			heroScore.points += points;
			if (h.gear in heroScore.gears) heroScore.gears[h.gear] += points; else heroScore.gears[h.gear] = points;
			if (h.stone in heroScore.stones) heroScore.stones[h.stone] += points; else heroScore.stones[h.stone] = points;
			if (h.artifact in heroScore.artifacts) heroScore.artifacts[h.artifact] += points; else heroScore.artifacts[h.artifact] = points;
			if (h.skin in heroScore.skins) heroScore.skins[h.skin] += points; else heroScore.skins[h.skin] = points;
			const enables = '' + h.E1 + h.E2 + h.E3 + h.E4 + h.E5;
			if (enables in heroScore.enables) heroScore.enables[enables] += points; else heroScore.enables[enables] = points;
		}
	}

	const heroRankings = [];
	for (const h in heroScores) {
		const s = heroScores[h];
		heroRankings.push({
			hero: h,
			points: s.points,
			gears: getSortedRankings(s.gears),
			stones: getSortedRankings(s.stones),
			artifacts: getSortedRankings(s.artifacts),
			skins: getSortedRankings(s.skins),
			enables: getSortedRankings(s.enables),
		});
	}
	heroRankings.sort((a, b) => b.points - a.points);

	const artifactRankings = getSortedRankings(artifactScores);

	return {
		heroes: heroRankings,
		artifacts: artifactRankings,
	};
}


function crossoverTeams(team1, team2, mutations, rankings) {
	const result = {
		heroes: [],
		monster: random() < 0.5 ? team1.monster : team2.monster,
		fights: 0,
		wins: 0,
	};
	for (var i = 0; i < 6; i++) {
		if (random() < mutations / 6) {
			const hero = randomHero();
			const heroRanking = rankings ? rankings.heroes[hero.name] : null;
			if (heroRanking && random() < 0.5) {
				hero.gear = heroRanking.gears[randExp(heroRanking.gears.length, 0.7)].name;
				hero.stone = heroRanking.stones[randExp(heroRanking.stones.length, 0.7)].name;
				hero.artifact = heroRanking.artifacts[randExp(heroRanking.artifacts.length, 0.7)].name;
				hero.skin = heroRanking.skins[randExp(heroRanking.skins.length, 0.7)].name;
				const enables = heroRanking.enables[randExp(heroRanking.enables.length, 0.7)].name;
				hero.E1 = parseInt(enables.charAt(0));
				hero.E2 = parseInt(enables.charAt(1));
				hero.E3 = parseInt(enables.charAt(2));
				hero.E4 = parseInt(enables.charAt(3));
				hero.E5 = parseInt(enables.charAt(4));
			}
			result.heroes[i] = hero;
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
		['refs', 'teams', 'teams.new'].forEach(k => localStorage.removeItem(k));
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

function showTeams(key) {
	const combatLog = document.getElementById('combatLog');
	const teams = loadTeams(key);
	if (teams) {
		combatLog.innerText = JSON.stringify(teams, null, 4);
	} else {
		combatLog.innerText = 'Not found';
	}
}

function parseTeams(key) {
	const combatLog = document.getElementById('combatLog');
	try {
		const teams = JSON.parse(combatLog.innerText);
		saveTeams(key, teams);
	} catch (e) {
		combatLog.innerText = e;
	}
}


async function optimizeTeam() {
	const combatLog = document.getElementById('combatLog');
	const teamInput = document.getElementById('teamInput');

	let refs = loadTeams('refs');
	if (!refs) {
		combatLog.innerText = 'No reference teams found. Please import first.'
		return;
	} else {
		console.log('Loaded ' + refs.length + ' teams');
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
		await workerPool.submit('improveTeam', {
			team: team, refs: refs, options: {
				generations: 10,
				population: 10,
				fightsPerMatchup: 20,
				fixedPosition: true,
				fixedMonster: true,
				fixedGear: true,
				fixedSkin: true,
			}
		}, data => {
			team = data;
			const msg = 'Generation ' + (++n) + ' best team:\n' + desc(team);
			console.log(msg);
			combatLog.innerText = msg;
		});
	}
}
