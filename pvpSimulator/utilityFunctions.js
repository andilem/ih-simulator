// eslint-disable-next-line no-unused-vars
function formatNum(num) {
	return '<span class =\'num\'>' + num + '</span>';
}


// replacement seedable prng
// eslint-disable-next-line prefer-const
const randInt = max => Math.floor(random() * max);
const randExp = (max, a) => Math.min(Math.floor(max * Math.log(random() * (a ** max - 1) + 1) / Math.log((a ** max - 1) + 1)), max - 1);
let random = rng();
function rng(seed = 0) {
	if (seed == 0) {
		const dt = new Date();
		seed = dt.valueOf();
	}

	const strSeed = seed.toString();
	let a, b, c, d, i, h;

	for (i = 0, h = 1779033703 ^ strSeed.length; i < strSeed.length; i++) {
		h = Math.imul(h ^ strSeed.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	}

	h = Math.imul(h ^ h >>> 16, 2246822507);
	h = Math.imul(h ^ h >>> 13, 3266489909);
	h ^= h >>> 16;
	a = h >>> 0;

	h = Math.imul(h ^ h >>> 16, 2246822507);
	h = Math.imul(h ^ h >>> 13, 3266489909);
	h ^= h >>> 16;
	b = h >>> 0;

	h = Math.imul(h ^ h >>> 16, 2246822507);
	h = Math.imul(h ^ h >>> 13, 3266489909);
	h ^= h >>> 16;
	c = h >>> 0;

	h = Math.imul(h ^ h >>> 16, 2246822507);
	h = Math.imul(h ^ h >>> 13, 3266489909);
	h ^= h >>> 16;
	d = h >>> 0;

	return function () {
		const t = b << 9;
		let r = a * 5;

		r = (r << 7 | r >>> 25) * 9;
		c ^= a;
		d ^= b;
		b ^= c;
		a ^= d;
		c ^= t;
		d = d << 11 | d >>> 21;

		return (r >>> 0) / 4294967296;
	};
}


// stack ids for buffs and debuffs
{
	let uniqID = 0;
	function uuid() {
		return uniqID++;
	}
}


function speedSort(heroA, heroB) {
	if (heroA._currentStats['speed'] > heroB._currentStats['speed']) {
		return -1;
	} else if (heroA._currentStats['speed'] < heroB._currentStats['speed']) {
		return 1;
	} else if (heroA._attOrDef == 'att' && heroB._attOrDef == 'def') {
		return -1;
	} else if (heroA._attOrDef == 'def' && heroB._attOrDef == 'att') {
		return 1;
	} else if (heroA._heroPos < heroB._heroPos) {
		return -1;
	} else {
		return 1;
	}
}


function slotSort(heroA, heroB) {
	if (heroA._attOrDef == 'att' && heroB._attOrDef == 'def') {
		return -1;
	} else if (heroA._attOrDef == 'def' && heroB._attOrDef == 'att') {
		return 1;
	} else if (heroA._heroPos < heroB._heroPos) {
		return -1;
	} else {
		return 1;
	}
}


function isMonster(source) {
	return '_monsterName' in source;
}


{
	const arrNotDispellable = [
		'Seal of Light', 'Power of Light', 'Ghost Possessed', 'Link of Souls',
		'Demon Totem', 'Shrink', 'Shield', 'Feather Blade', 'Drake Break Defense',
		'Wildfire Torch Dot', 'Revenging Wraith', 'Swordwind Shield',
	];

	function isDispellable(strName) {
		return !arrNotDispellable.includes(strName);
	}
}


{
	const arrControls = ['stun', 'petrify', 'freeze', 'twine', 'Silence', 'Seal of Light', 'Horrify', 'Shapeshift', 'Taunt', 'Dazzle'];

	function isControlEffect(strName, effects = {}) {
		if (arrControls.includes(strName)) {
			return true;
		} else {
			for (const e in effects) {
				if (arrControls.includes(e)) {
					return true;
				}
			}
			return false;
		}
	}
}


{
	const arrDots = [
		'Burn', 'Bleed', 'Poison', 'Dot',
		'burn', 'bleed', 'poison', 'dot',
		'Burn True', 'Bleed True', 'Poison True',
		'burnTrue', 'bleedTrue', 'poisonTrue',
	];

	function isDot(strName, effects = {}) {
		if (arrDots.includes(strName)) {
			return true;
		} else {
			for (const e in effects) {
				if (arrDots.includes(e)) {
					return true;
				}
			}
			return false;
		}
	}
}


{
	const arrAttributes = [
		'attack', 'attackPercent', 'armor', 'armorPercent', 'hp', 'hpPercent', 'speed',
		'energy', 'precision', 'block', 'crit', 'critDamage', 'holyDamage', 'armorBreak',
		'controlImmune', 'skillDamage', 'damageReduce', 'allDamageReduce', 'controlPrecision',
		'healEffect', 'effectBeingHealed', 'critDamageReduce', 'dotReduce', 'fixedAttack',
		'fixedHP', 'allDamageTaken', 'allDamageDealt', 'damageAgainstBurning', 'damageAgainstBleeding',
		'damageAgainstPoisoned', 'damageAgainstFrozen', 'dodge', 'controlImmunePen',
		'warriorReduce', 'mageReduce', 'rangerReduce', 'assassinReduce', 'priestReduce',
		'freezeImmune', 'petrifyImmune', 'stunImmune', 'twineImmune', 'Seal of LightImmune',
		'ShapeshiftImmune', 'TauntImmune', 'DazzleImmune', 'HorrifyImmune', 'SilenceImmune',
		'damageAgainstWarrior', 'damageAgainstMage', 'damageAgainstRanger', 'damageAgainstAssassin',
		'damageAgainstPriest',
	];

	function isAttribute(strName, effects = {}) {
		if (arrAttributes.includes(strName)) {
			return true;
		} else {
			for (const e in effects) {
				if (arrAttributes.includes(e)) {
					return true;
				}
			}
			return false;
		}
	}
}


function isFrontLine(target, arrTargets) {
	return target._heroPos < 2 || !arrTargets[0].alive && !arrTargets[1].alive;
}


function isBackLine(target, arrTargets) {
	return target._heroPos > 1
		|| !arrTargets[2].alive
		&& !arrTargets[3].alive
		&& !arrTargets[4].alive
		&& !arrTargets[5].alive;
}


function getFrontTargets(source, arrTargets) {
	const copyTargets = getTauntedTargets(source, arrTargets);
	if (copyTargets.length > 0) { return copyTargets; }

	for (var h = 0; h < 2; h++) {
		if (arrTargets[h].alive) {
			copyTargets.push(arrTargets[h]);
		}
	}

	if (copyTargets.length == 0) {
		for (let h = 2; h < arrTargets.length; h++) {
			if (arrTargets[h].alive) {
				copyTargets.push(arrTargets[h]);
			}
		}
	}

	return copyTargets;
}


function getBackTargets(source, arrTargets) {
	const copyTargets = getTauntedTargets(source, arrTargets);
	if (copyTargets.length > 0) { return copyTargets; }

	for (var h = 2; h < arrTargets.length; h++) {
		if (arrTargets[h].alive) {
			copyTargets.push(arrTargets[h]);
		}
	}

	if (copyTargets.length == 0) {
		for (var h = 0; h < 2; h++) {
			if (arrTargets[h].alive) {
				copyTargets.push(arrTargets[h]);
			}
		}
	}

	return copyTargets;
}


function getAllTargets(source, arrTargets) {
	return getSortedTargets(source, arrTargets, null);
}


function getNearestTargets(source, arrTargets, num = 6) {
	return getSortedTargets(source, arrTargets, (a, b) => {
		const dA = Math.abs(source._heroPos - a._heroPos);
		const dB = Math.abs(source._heroPos - b._heroPos);
		return dA > dB ? 1 : dA < dB ? -1 : a._heroPos - b._heroPos;
	}, num);
}


function getLowestHPTargets(source, arrTargets, num = 6) {
	// get living targets with lowest current HP
	return getSortedTargets(source, arrTargets,
		(a, b) => a._currentStats.totalHP > b._currentStats.totalHP ? 1 : a._currentStats.totalHP < b._currentStats.totalHP ? -1 : a._heroPos - b._heroPos,
		num);
}


function getLowestHPPercentTargets(source, arrTargets, num = 6) {
	// get living targets with lowest current HP percent
	return getSortedTargets(source, arrTargets, (a, b) => {
		const pA = a._currentStats.totalHP / a._stats.totalHP;
		const pB = b._currentStats.totalHP / b._stats.totalHP;
		return pA > pB ? 1 : pA < pB ? -1 : a._heroPos - b._heroPos;
	}, num);
}


function getHighestHPTargets(source, arrTargets, num = 6) {
	// get living target with highest current HP
	return getSortedTargets(source, arrTargets,
		(a, b) => a._currentStats.totalHP > b._currentStats.totalHP ? - 1 : a._currentStats.totalHP < b._currentStats.totalHP ? 1 : a._heroPos - b._heroPos,
		num);
}


function getHighestAttackTargets(source, arrTargets, num = 6) {
	// get living target with highest current attack
	return getSortedTargets(source, arrTargets,
		(a, b) => a._currentStats.totalAttack > b._currentStats.totalAttack ? - 1 : a._currentStats.totalAttack < b._currentStats.totalAttack ? 1 : a._heroPos - b._heroPos,
		num);
}


function getSortedTargets(source, arrTargets, sort, num = 6) {
	if (arrTargets.length == 0) {
		return [];
	}
	const targets = getTauntedTargets(source, arrTargets, num);
	if (targets.length > 0) return targets;

	for (const t of arrTargets) {
		if (t.alive) {
			targets.push(t);
		}
	}

	if (sort) targets.sort(sort);
	if (targets.length > num) targets.length = num;
	return targets;
}


function getRandomTargets(source, arrTargets, num = 6, dazzleBypass = false) {
	if (arrTargets.length == 0) {
		return [];
	}
	if (!dazzleBypass) {
		const tauntedTargets = getTauntedTargets(source, arrTargets, num);
		if (tauntedTargets.length > 0) {
			return tauntedTargets;
		}
	}

	const copyTargets = [];
	for (const t of arrTargets) {
		if (t.alive) {
			copyTargets.push(t);
		}
	}
	if (copyTargets.length <= num) return copyTargets;
	shuffle(copyTargets, num);
	copyTargets.length = num;
	return copyTargets;
}


function getTauntedTargets(source, arrTargets, num = 6) {
	if (arrTargets.length == 0 || isMonster(source) || source._attOrDef == arrTargets[0]._attOrDef) {
		return [];
	}

	if ('Taunt' in source._debuffs) {
		// find first living "taunter"
		for (const stack in source._debuffs.Taunt) {
			const h = source._debuffs.Taunt[stack].source;
			if (h.alive) return [h];
		}
	}

	if ('Dazzle' in source._debuffs) {
		return getRandomTargets(source, arrTargets, 1, true);
	}

	return [];
}


/**
 * Shuffles an array in place.
 * @param {Array} a array containing the items.
 * @param {Number} n number of items to shuffle or -1 for all items.
 */
function shuffle(a, n = -1) {
	const l = a.length;
	if (n == -1 || n >= l) {
		n = l - 1; // no need to shuffle the last element, it will be the last remaining
	}
	for (var i = 0; i < n; i++) {
		const j = i + Math.floor(random() * (l - i));
		const x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}


const translate = {
	'hp': 'Pre-Multiplier HP',
	'attack': 'Pre-Multiplier Attack',
	'armor': 'Pre-Multiplier Armor',
	'totalHP': 'Total HP',
	'totalAttack': 'Total Attack',
	'totalArmor': 'Total Armor',
	'speed': 'Speed',
	'hpPercent': 'HP Percent Multiplier',
	'hpPercent2': 'HP Percent Multiplier',
	'attackPercent': 'Attack Percent Multiplier',
	'attackPercent2': 'Attack Percent Multiplier',
	'armorPercent': 'Armor Percent Multiplier',
	'energy': 'Energy',
	'skillDamage': 'Skill Damage',
	'precision': 'Precision',
	'block': 'Block Chance',
	'crit': 'Crit Chance',
	'critDamage': 'Crit Damage',
	'armorBreak': 'Armor Break',
	'controlImmune': 'CC Resist Chance',
	'damageReduce': 'Damage Reduce',
	'holyDamage': 'Holy Damage',
	'warriorReduce': 'Reduce Damage Taken from Warrior',
	'mageReduce': 'Reduce Damage Taken from Mage',
	'rangerReduce': 'Reduce Damage Taken from Ranger',
	'assassinReduce': 'Reduce Damage Taken from Assassin',
	'priestReduce': 'Reduce Damage Taken from Priest',
	'freezeImmune': 'Chance to Resist Freeze',
	'petrifyImmune': 'Chance to Resist Petrify',
	'stunImmune': 'Chance to Resist Stun',
	'twineImmune': 'Chance to Resist Twine',
	'critDamageReduce': 'Reduce Damage Taken from Crit',
	'unbendingWillTriggered': 'Unbending Will Triggered This Battle',
	'unbendingWillStacks': 'Unbending Will Stacks Left',
	'effectBeingHealed': 'Increase Heal Received',
	'healEffect': 'Increase Heals Given',
	'dotReduce': 'Reduced Damage from DoT',
	'controlPrecision': 'Increase Chance to Apply CC',
	'fixedAttack': 'Fixed Attack',
	'fixedHP': 'Fixed HP',
	'damageAgainstBurning': 'Damage Dealt to Burning Targets',
	'damageAgainstBleeding': 'Damage Dealt to Bleeding Targets',
	'damageAgainstPoisoned': 'Damage Dealt to Poisoned Targets',
	'damageAgainstFrozen': 'Damage Dealt to Frozen Targets',
	'allDamageReduce': 'Reduce All Damage Taken',
	'allDamageTaken': 'Increase All Damage Taken',
	'allDamageDealt': 'Increase All Damage Dealt',
	'controlImmunePen': 'Reduce Target CC Resistance',
	'firstCC': 'First CC Received During Battle',
	'revive': 'Resurrecter',
	'spiritPowerStacks': 'Spirit Power Stacks',
	'courageousTriggered': 'Courageous Triggered This Battle',
	'linkCount': 'Number of Link Activations This Round',
	'blockCount': 'Number of Blocks',
	'flameInvasionTriggered': 'Flame Invasion Triggered This Battle',
	'wellCalculatedStacks': 'Well Calculated Stacks',
	'burn': 'Burn',
	'burnTrue': 'Burn (True Damage)',
	'bleed': 'Bleed',
	'bleedTrue': 'Bleed (True Damage)',
	'poison': 'Poison',
	'poisonTrue': 'Poison (True Damage)',
	'dot': 'Generic DoT',
	'heal': 'Heal',
	'attackAmount': 'Snapshot Attack Amount',
	'rounds': 'Number of Rounds',
	'stacks': 'Number of Stacks',
	'dodge': 'Dodge',
	'isCharging': 'Charging Attack',
	'damageAmount': 'Snapshot Damage Amount',
	'damageAgainstWarrior': 'Damage Against Warrior',
	'damageAgainstMage': 'Damage Against Mage',
	'damageAgainstRanger': 'Damage Against Ranger',
	'damageAgainstAssassin': 'Damage Against Assassin',
	'damageAgainstPriest': 'Damage Against Priest',
	'Seal of LightImmune': 'Chance to Resist Seal of Light',
	'ShapeshiftImmune': 'Chance to Resist Shapeshift',
	'TauntImmune': 'Chance to Resist Taunt',
	'DazzleImmune': 'Chance to Resist Dazzle',
	'HorrifyImmune': 'Chance to Resist Horrify',
	'SilenceImmune': 'Chance to Resist Silence',
	'damageDealt': 'Damage Dealt',
	'damageHealed': 'Damage Healed or Prevented',
	'energySnapshot': 'Amount of Energy on Active',
	'demonTotemStacks': 'Demon Totem Stacks',
	'heartOfOrmusTriggered': 'Heart of Ormus Triggered',
	'reflectAmount': 'Link Damage Tracker',
	'damageAgainstStun': 'Damage Dealt to Stunned Targets',
};
