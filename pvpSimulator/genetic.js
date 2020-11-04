random = rng(1);

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

function createTeam() {
	const team = {
		heroes: [],
		monster: randomMonster(),
		tech: tech,
		frame: avatarFrames['IDA Maverick +7'],
		statues: {},

		fights: 0,
		wins: 0,
		winRate: function () {
			return this.wins / this.fights;
		},
		resetStats: function () {
			this.fights = 0;
			this.wins = 0;
		},
		desc: function () {
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
		},
	}
	for (let i = 0; i < 6; i++) {
		team.heroes[i] = createHero(i);
	}
	for (const type of ['Holy', 'Evil']) {
		team.statues[type] = {};
		team.statues[type].speed = 28;
		team.statues[type].hpPercent = 8;
		team.statues[type].attackPercent = 8;
	}
	console.log('Created team:\n' + team.desc());
	return team;
}

function randomMonster() {
	const keys = Object.keys(baseMonsterStats).filter(s => s != 'None');
	const name = keys[Math.floor(random() * keys.length)];
	return new baseMonsterStats[name]['className'](name, '');
}

function createHero(pos) {
	const keys = Object.keys(baseHeroStats).filter(s => s != 'None');
	const name = keys[Math.floor(random() * keys.length)];
	const hero = new baseHeroStats[name]['className'](name, pos, '');
	hero._heroLevel = 345;
	assignGear(hero);
	hero._stone = randomStone();
	hero._artifact = randomArtifact(hero);
	hero._skin = randomSkin(hero);
	hero._enable1 = randomE1();
	hero._enable2 = randomE2();
	hero._enable3 = randomE3();
	hero._enable4 = randomE1();
	hero._enable5 = randomE5();
	return hero;
}

function assignGear(hero) {
	const options = ['ClassGear', 'SplitHP', 'SplitATK'];
	const option = options[Math.floor(random() * 3)];
	hero.gear = option; // for debug/output
	if (option == 'ClassGear') {
		hero._weapon = classGearMapping[hero._heroClass].weapon;
		hero._armor = classGearMapping[hero._heroClass].armor;
		hero._shoe = classGearMapping[hero._heroClass].shoe;
		hero._accessory = classGearMapping[hero._heroClass].accessory;
	} else if (option == 'SplitHP') {
		hero._weapon = '6* Thorny Flame Whip';
		hero._armor = classGearMapping[hero._heroClass].armor;
		hero._shoe = classGearMapping[hero._heroClass].shoe;
		hero._accessory = '6* Flame Necklace';
	} else {
		hero._weapon = classGearMapping[hero._heroClass].weapon;
		hero._armor = '6* Flame Armor';
		hero._shoe = '6* Flame Boots';
		hero._accessory = '6* Flame Necklace';
	}
}

function randomStone() {
	const keys = Object.keys(stones).filter(s => s != 'None');
	return keys[Math.floor(random() * keys.length)];
}

function randomArtifact(hero) {
	const keys = Object.keys(artifacts).filter(s => s != 'None' && (artifacts[s].limit == '' || artifacts[s].limit == hero._heroFaction));
	return keys[Math.floor(random() * keys.length)];
}

function randomSkin(hero) {
	const heroSkins = skins[hero._heroName];
	if (heroSkins === undefined || Object.keys(heroSkins).length == 0) return 'None';
	const keys = Object.keys(heroSkins);
	return keys[Math.floor(random() * keys.length)];
}

const E1 = ['Vitality', 'Mightiness', 'Growth'];
const E2 = ['Shelter', 'LethalFightback', 'Vitality2'];
const E3 = ['Resilience', 'SharedFate', 'Purify'];
const E5 = ['BalancedStrike', 'UnbendingWill'];

function randomE1() {
	return E1[Math.floor(random() * E1.length)];
}

function randomE2() {
	return E2[Math.floor(random() * E2.length)];
}

function randomE3() {
	return E3[Math.floor(random() * E3.length)];
}

function randomE5() {
	return E5[Math.floor(random() * E5.length)];
}


function copyHero(hero, mutations) {
	const copy = new baseHeroStats[hero._heroName]['className'](hero._heroName, hero._heroPos, '');
	copy._heroLevel = hero._heroLevel;

	// possible mutations: gear, stone, artifact, skin, enable1..5
	// mutate each with 12% (~1/8) probability per desired mutation
	const mutationProb = mutations * 0.12;
	let c = 0;
	if (random() < mutationProb * 3 / 2) {
		c++;
		assignGear(copy);
	} else {
		copy.gear = hero.gear;
		copy._weapon = hero._weapon;
		copy._armor = hero._armor;
		copy._shoe = hero._shoe;
		copy._accessory = hero._accessory;
	}
	if (random() < mutationProb) { copy._stone = randomStone(); c++; } else copy._stone = hero._stone;
	if (random() < mutationProb) { copy._artifact = randomArtifact(copy); c++; } else copy._artifact = hero._artifact;
	if (random() < mutationProb * 4 / 3) { copy._skin = randomSkin(copy); c++; } else copy._skin = hero._skin;
	if (random() < mutationProb * 3 / 2) { copy._enable1 = randomE1(); c++; } else copy._enable1 = hero._enable1;
	if (random() < mutationProb * 3 / 2) { copy._enable2 = randomE2(); c++; } else copy._enable2 = hero._enable2;
	if (random() < mutationProb * 3 / 2) { copy._enable3 = randomE3(); c++; } else copy._enable3 = hero._enable3;
	if (random() < mutationProb * 3 / 2) { copy._enable4 = randomE1(); c++; } else copy._enable4 = hero._enable4;
	if (random() < mutationProb * 2 / 1) { copy._enable5 = randomE5(); c++; } else copy._enable5 = hero._enable5;

	//console.log('Created hero with ' + c + ' mutations');

	return copy;
}

function copyTeam(team, mutations) {
	const copy = Object.assign({}, team);
	copy.resetStats();

	// mutate each hero with 1/6 of desired mutations
	copy.heroes = Array.from(team.heroes, h => copyHero(h, mutations / 6));

	// mutate monster with 1/6 probability per desired mutation
	if (random() < mutations / 6) {
		copy.monster = randomMonster()
	} else {
		copy.monster = new baseMonsterStats[team.monster._monsterName]['className'](copy.monster._monsterName, '');
	}

	// x %: swap 2 heroes
	/*if (random() < 0.5) {
		const i = Math.floor(random() * 6);
		let j = Math.floor(random() * 5);
		if (j >= i) j++;
		const h = copy.heroes[i];
		copy.heroes[i] = copy.heroes[j];
		copy.heroes[j] = h;
	}*/

	//console.log('copyTeam:\n' + copy.desc());
	return copy;
}


function improveTeam(team, refs) {
	console.log('----- Improve team ' + team.desc());
	const teamMutations = Array.from({ length: 10 }, (v, k) => copyTeam(team, k > 0 ? 10 : 0));

	let count = 0;
	const num = teamMutations.length * refs.length * 2;
	for (var i = 0; i < teamMutations.length; i++) {
		for (var j = 0; j < refs.length; j++) {
			matchup(teamMutations[i], refs[j]);
			matchup(refs[j], teamMutations[i]);
			count += 2;
		}
		console.log(count + ' / ' + num + ' matchups done');
	}

	teamMutations.sort((a, b) => b.winRate() - a.winRate());
	console.log('----- Ranking -----');
	for (var i = 0; i < teamMutations.length; i++) {
		console.log((i + 1) + '. ' + teamMutations[i].desc());
	}
}


function findBestTeams() {
	console.log('----- FIND BEST TEAMS -----');
	const teams = Array.from({ length: 10 }, x => createTeam());

	let count = 0;
	const num = teams.length * (teams.length - 1);
	for (var i = 0; i < teams.length; i++) {
		for (var j = 0; j < teams.length; j++) {
			if (i != j) {
				matchup(teams[i], teams[j]);
				count++;
			}
		}
		console.log(count + ' / ' + num + ' matchups done');
	}

	teams.sort((a, b) => b.winRate() - a.winRate());
	console.log('----- Ranking -----');
	for (var i = 0; i < teams.length; i++) {
		console.log((i + 1) + '. ' + teams[i].desc());
	}

	improveTeam(teams[0], teams);
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
