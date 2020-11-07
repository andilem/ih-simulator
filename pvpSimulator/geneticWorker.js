importScripts(
	'utilityFunctions.js',
	'heroes.js',
	'heroSubclasses.js',
	'baseHeroStats.js',
	'monsters.js',
	'baseMonsterStats.js',
	'guildTech.js',
	'equipment.js',
	'stone.js',
	'artifact.js',
	'skin.js',
	'avatarFrame.js',
	'simulation.js',
	'genetic.js', // only for randoms
);

const combatLog = {};

onmessage = function (e) {
	const id = e.data.id;
	const action = e.data.action;
	const data = e.data.data;
	console.debug('Message received from main script: ' + action);
	if (action == improveTeam.name) {
		const team = deserializeTeam(data.team);
		const refs = deserializeTeams(data.refs);
		const generations = data.generations;
		improveTeam(team, refs, generations, team => postMessage({
			id: id,
			type: 'progress',
			data: serializeTeam(team)
		}));
		postMessage({
			id: id,
			type: 'result',
			data: null
		});
	} else {
		const msg = 'Unknown action: ' + action;
		console.warn(msg);
		postMessage({
			id: id,
			type: 'error',
			data: msg
		});
	}
}


const tech = {
	'Warrior': {
		hpPercent: 60,
		attackPercent: 50,
		crit: 40,
		block: 30,
		skillDamage: 20,
		speed: 20,
		constitution: 20,
		mind: 20,
		antiMage: 20,
		antiRanger: 20,
		antiAssassin: 20,
		antiPriest: 20,
		blessingOfPurification: 10,
		spellOfAgility: 5,
		immortalRoar: 5,
		heartOfCrystal: 10,
	},
	'Mage': {
		hpPercent: 60,
		attackPercent: 50,
		crit: 40,
		precision: 30,
		skillDamage: 20,
		speed: 20,
		constitution: 20,
		mind: 20,
		antiWarrior: 20,
		antiRanger: 20,
		antiAssassin: 20,
		antiPriest: 20,
		blessingOfPurification: 10,
		spellOfAgility: 5,
		immortalRoar: 5,
		heartOfCrystal: 10,
	},
	'Ranger': {
		hpPercent: 60,
		attackPercent: 50,
		block: 40,
		precision: 30,
		skillDamage: 20,
		speed: 20,
		constitution: 20,
		mind: 20,
		antiWarrior: 20,
		antiMage: 20,
		antiAssassin: 20,
		antiPriest: 20,
		blessingOfPurification: 10,
		spellOfAgility: 5,
		immortalRoar: 5,
		heartOfCrystal: 10,
	},
	'Assassin': {
		hpPercent: 60,
		critDamage: 50,
		crit: 40,
		armorBreak: 30,
		skillDamage: 20,
		speed: 20,
		constitution: 20,
		mind: 20,
		antiWarrior: 20,
		antiMage: 20,
		antiRanger: 20,
		antiPriest: 20,
		blessingOfPurification: 10,
		spellOfAgility: 5,
		immortalRoar: 5,
		heartOfCrystal: 10,
	},
	'Priest': {
		hpPercent: 60,
		block: 50,
		crit: 40,
		speed: 30,
		skillDamage: 20,
		speed2: 20,
		constitution: 20,
		mind: 20,
		antiWarrior: 20,
		antiMage: 20,
		antiRanger: 20,
		antiAssassin: 20,
		blessingOfPurification: 10,
		spellOfAgility: 5,
		immortalRoar: 5,
		heartOfCrystal: 10,
	},
};

const statues = {
	'Holy': {
		speed: 25,
		hpPercent: 8,
		attackPercent: 8,
	},
	'Evil': {
		speed: 25,
		hpPercent: 8,
		attackPercent: 8,
	},
};

function Team() {
	this.heroes = [];
	this.monster = undefined;
	this.tech = tech;
	this.statues = statues;
	this.frame = avatarFrames['IDA Maverick +7'];

	this.fights = 0;
	this.wins = 0;
	this.winRate = function () {
		return this.wins / this.fights;
	};

	this.resetStats = function () {
		this.fights = 0;
		this.wins = 0;
	};

	this.desc = function () {
		let result = '';
		for (const h of this.heroes) {
			result += h._heroName + ' (' + h.gear + '; ' + h._stone + '; ' + h._artifact + '; ' + h._skin + '; ' + (E1.indexOf(h._enable1) + 1)
				+ (E2.indexOf(h._enable2) + 1) + (E3.indexOf(h._enable3) + 1) + (E1.indexOf(h._enable4) + 1) + (E5.indexOf(h._enable5) + 1) + '),\n';
		}
		result += this.monster._monsterName;
		if (this.fights > 0) {
			result += '\n  win ' + this.wins + '/' + this.fights + ' = ' + (this.winRate() * 100).toFixed(1) + ' %';
		}
		return result;
	};

	this.shortDesc = function () {
		let result = '';
		for (const h of this.heroes) {
			result += h._heroName + ', ';
		}
		result += this.monster._monsterName;
		if (this.fights > 0) {
			result += ' -  win ' + this.wins + '/' + this.fights + ' = ' + (this.winRate() * 100).toFixed(1) + ' %';
		}
		return result;
	};
}

const E1 = ['Vitality', 'Mightiness', 'Growth'];
const E2 = ['Shelter', 'LethalFightback', 'Vitality2'];
const E3 = ['Resilience', 'SharedFate', 'Purify'];
const E5 = ['BalancedStrike', 'UnbendingWill'];

function serializeTeam(team) {
	const teamData = {};
	teamData.monster = team.monster._monsterName;
	teamData.heroes = Array.from(team.heroes, h => {
		return {
			name: h._heroName,
			gear: h.gear,
			stone: h._stone,
			artifact: h._artifact,
			skin: h._skin,
			E1: E1.indexOf(h._enable1) + 1,
			E2: E2.indexOf(h._enable2) + 1,
			E3: E3.indexOf(h._enable3) + 1,
			E4: E1.indexOf(h._enable4) + 1,
			E5: E5.indexOf(h._enable5) + 1,
		};
	});
	teamData.fights = team.fights;
	teamData.wins = team.wins;
	return teamData;
}

function serializeTeams(teams) {
	return Array.from(teams, t => serializeTeam(t));
}


function deserializeTeam(teamData) {
	const team = new Team();
	team.monster = new baseMonsterStats[teamData.monster]['className'](teamData.monster, '');
	for (const i in teamData.heroes) {
		const h = teamData.heroes[i];
		const hero = new baseHeroStats[h.name]['className'](h.name, i, '');
		hero._heroLevel = 345;
		assignGear(hero, h.gear);
		hero._stone = h.stone;
		hero._artifact = h.artifact;
		hero._skin = h.skin;
		hero._enable1 = E1[h.E1 - 1];
		hero._enable2 = E2[h.E2 - 1];
		hero._enable3 = E3[h.E3 - 1];
		hero._enable4 = E1[h.E4 - 1];
		hero._enable5 = E5[h.E5 - 1];
		team.heroes[i] = hero;
	}
	team.fights = teamData.fights;
	team.wins = teamData.wins;
	return team;
}

function deserializeTeams(data) {
	return Array.from(data, d => deserializeTeam(d));
}


function improveTeam(team, refs, generations, onNextGen) {
	console.log('-- Improve team ' + team.shortDesc() + ' with ' + generations + ' generations');
	const population = 10;
	const eliteNum = 2;

	let teams = [team];

	for (var n = 1; n <= generations; n++) {
		const numElite = Math.min(eliteNum, teams.length);
		const newGen = [];
		// first eliteNum individuals: best teams
		for (var c = 0; c < numElite; c++) {
			newGen[c] = combineTeam(teams[c], teams[c], 0);
		}
		// remaining individuals: recombinations/mutations of best 
		for (var c = numElite; c < population; c++) {
			newGen[c] = combineTeam(teams[randExp(teams.length, 0.8)], teams[randExp(teams.length, 0.8)], 3);
		}

		teams = newGen;

		// matchup vs refs
		// don't matchup teams vs each other, this would prefer speed
		let count = 0;
		const num = teams.length * (2 * refs.length);
		for (var i = 0; i < teams.length; i++) {
			for (var j = 0; j < refs.length; j++) {
				matchup(teams[i], refs[j]);
				matchup(refs[j], teams[i]);
				count += 2;
			}
			console.debug('Generation ' + n + ': ' + count + ' / ' + num + ' matchups done');
		}

		teams.sort((a, b) => b.winRate() - a.winRate());
		console.debug('--  Generation ' + n + ' ranking --');
		for (var i = 0; i < eliteNum; i++) {
			console.debug((i + 1) + '. ' + teams[i].desc());
		}
		if (onNextGen) {
			onNextGen(teams[0]);
		}
	}

	// find best positions
	teams.length = 1;
	teams[0].resetStats();
	for (var i = 1; i < population; i++) {
		const newTeam = combineTeam(teams[0], teams[0], 0);
		shuffle(newTeam.heroes);
		for (const i in newTeam.heroes) {
			newTeam.heroes[i]._heroPos = i;
		}
		teams[i] = newTeam;
	}
	let count = 0;
	const num = teams.length * refs.length * 2;
	for (var i = 0; i < teams.length; i++) {
		for (var j = 0; j < refs.length; j++) {
			matchup(teams[i], refs[j]);
			matchup(refs[j], teams[i]);
			count += 2;
		}
		console.debug('Improve positions: ' + count + ' / ' + num + ' matchups done');
	}

	teams.sort((a, b) => b.winRate() - a.winRate());
	console.log('-- Final team --\n' + teams[0].desc());
	if (onNextGen) {
		onNextGen(teams[0]);
	}

	Object.assign(team, teams[0]);
}


function combineTeam(team1, team2, mutations) {
	const result = new Team();

	for (var i = 0; i < 6; i++) {
		result.heroes[i] = copyHero(random() < 0.5 ? team1.heroes[i] : team2.heroes[i], mutations / 6);
	}

	let monsterName;
	if (random() < mutations / 6) {
		monsterName = randomMonster();
	} else {
		monsterName = random() < 0.5 ? team1.monster._monsterName : team2.monster._monsterName;
	}
	result.monster = new baseMonsterStats[monsterName]['className'](monsterName, '');

	return result;
}


function copyHero(hero, mutations) {
	const copy = new baseHeroStats[hero._heroName]['className'](hero._heroName, hero._heroPos, '');
	copy._heroLevel = hero._heroLevel;

	// possible mutations: gear, stone, artifact, skin, enable1..5
	// mutate each with 12% (~1/8) probability per desired mutation
	const mutationProb = mutations * 0.12;
	if (random() < mutationProb * 3 / 2) {
		assignGear(copy, randomGear());
	} else {
		assignGear(copy, hero.gear);
	}
	if (random() < mutationProb) copy._stone = randomStone(); else copy._stone = hero._stone;
	if (random() < mutationProb) copy._artifact = randomArtifact(copy._heroFaction); else copy._artifact = hero._artifact;
	if (random() < mutationProb * 3 / 2) copy._skin = randomSkin(copy._heroName); else copy._skin = hero._skin;
	if (random() < mutationProb * 3 / 2) copy._enable1 = E1[randInt(3)]; else copy._enable1 = hero._enable1;
	if (random() < mutationProb * 3 / 2) copy._enable2 = E2[randInt(3)]; else copy._enable2 = hero._enable2;
	if (random() < mutationProb * 3 / 2) copy._enable3 = E3[randInt(3)]; else copy._enable3 = hero._enable3;
	if (random() < mutationProb * 3 / 2) copy._enable4 = E1[randInt(3)]; else copy._enable4 = hero._enable4;
	if (random() < mutationProb * 2 / 1) copy._enable5 = E5[randInt(2)]; else copy._enable5 = hero._enable5;

	return copy;
}

function assignGear(hero, gear) {
	hero.gear = gear; // for debug/output
	if (gear == 'ClassGear') {
		hero._weapon = classGearMapping[hero._heroClass].weapon;
		hero._armor = classGearMapping[hero._heroClass].armor;
		hero._shoe = classGearMapping[hero._heroClass].shoe;
		hero._accessory = classGearMapping[hero._heroClass].accessory;
	} else if (gear == 'SplitHP') {
		hero._weapon = '6* Thorny Flame Whip';
		hero._armor = classGearMapping[hero._heroClass].armor;
		hero._shoe = classGearMapping[hero._heroClass].shoe;
		hero._accessory = '6* Flame Necklace';
	} else if (gear == 'SplitATK') {
		hero._weapon = classGearMapping[hero._heroClass].weapon;
		hero._armor = '6* Flame Armor';
		hero._shoe = '6* Flame Boots';
		hero._accessory = '6* Flame Necklace';
	} else {
		throw 'Unknown gear: ' + gear;
	}
}


function matchup(attTeam, defTeam) {
	const numFights = 10;

	if (attTeam === defTeam) throw 'A team cannot fight against itself';

	for (const h of attTeam.heroes) {
		h.setTeams(attTeam, defTeam);
		h.updateCurrentStats(); // aura might have changed
		h._attOrDef = 'att';
	}
	attTeam.monster.setTeams(attTeam, defTeam);
	attTeam.monster._attOrDef = 'att';

	for (const h of defTeam.heroes) {
		h.setTeams(defTeam, attTeam);
		h.updateCurrentStats(); // aura might have changed
		h._attOrDef = 'def';
	}
	defTeam.monster.setTeams(defTeam, attTeam);
	defTeam.monster._attOrDef = 'def';

	const wins = runSims(attTeam, defTeam, numFights);
	attTeam.fights += numFights;
	attTeam.wins += wins;
	defTeam.fights += numFights;
	defTeam.wins += numFights - wins;
}
