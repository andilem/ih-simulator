// base hero class, extend this class for each hero
class hero {
	constructor(name, pos, attOrDef) {
		if (!(name in baseHeroStats)) throw 'Unknown hero: ' + name;

		this._heroName = name;
		this._heroPos = pos;
		this._attOrDef = attOrDef;
		this._heroFaction = baseHeroStats[name].heroFaction;
		this._heroClass = baseHeroStats[name].heroClass;
		this._starLevel = 0;
		this._heroLevel = 0;

		this._stats = {};
		this._stats.revive = 0;
		this._currentStats = {};
		this._attackMultipliers = {};
		this._hpMultipliers = {};
		this._armorMultipliers = {};

		// set equipment
		this._stone = 'None';
		this._artifact = 'None';
		this._weapon = 'None';
		this._armor = 'None';
		this._shoe = 'None';
		this._accessory = 'None';
		this._skin = 'None';

		// set enables
		this._enable1 = 'None';
		this._enable2 = 'None';
		this._enable3 = 'None';
		this._enable4 = 'None';
		this._enable5 = 'None';

		// dictionary to track buffs and debuffs during combat
		this._buffs = {};
		this._debuffs = {};

		this._damageDealt = 0;
		this._damageHealed = 0;
	}

	setTeams(myTeam, otherTeam) {
		this.myTeam = myTeam;
		this._allies = myTeam.heroes;
		this.otherTeam = otherTeam;
		this._enemies = otherTeam.heroes;
	}

	get alive() {
		return this._currentStats.totalHP > 0;
	}


	// Update current stats based on user selections.
	updateCurrentStats() {
		const arrLimits = [this._heroClass, this._heroFaction];
		let keySet = '';

		if (this._heroLevel > 310) {
			this._starLevel = 15;
		} else if (this._heroLevel > 290) {
			this._starLevel = 14;
		} else if (this._heroLevel > 270) {
			this._starLevel = 13;
		} else if (this._heroLevel > 260) {
			this._starLevel = 12;
		} else if (this._heroLevel > 250) {
			this._starLevel = 11;
		} else {
			this._starLevel = 10;
		}

		// start with base stats
		const baseStats = baseHeroStats[this._heroName].stats;
		this._stats.hp = Math.floor((baseStats.baseHP + (this._heroLevel - 1) * baseStats.growHP) * 2.2);
		this._stats.attack = Math.floor((baseStats.baseAttack + (this._heroLevel - 1) * baseStats.growAttack) * 2.2);
		this._stats.armor = Math.floor(baseStats.baseArmor + (this._heroLevel - 1) * baseStats.growArmor);
		this._stats.speed = Math.floor((baseStats.baseSpeed + (this._heroLevel - 1) * baseStats.growSpeed) * 1.6);

		this._stats.fixedAttack = 0;
		this._stats.fixedHP = 0;
		this._stats.totalHP = this._stats.hp;
		this._stats.totalAttack = this._stats.attack;
		this._stats.totalArmor = this._stats.armor;
		this._stats.energy = 50;
		this._stats.skillDamage = 0.0;
		this._stats.precision = 0.0;
		this._stats.block = 0.0;
		this._stats.crit = 0.0;
		this._stats.critDamage = 0.0;
		this._stats.armorBreak = 0.0;
		this._stats.controlImmune = 0.0;
		this._stats.damageReduce = 0.0;
		this._stats.holyDamage = 0.0;
		this._stats.warriorReduce = 0.0;
		this._stats.mageReduce = 0.0;
		this._stats.rangerReduce = 0.0;
		this._stats.assassinReduce = 0.0;
		this._stats.priestReduce = 0.0;
		this._stats.freezeImmune = 0.0;
		this._stats.petrifyImmune = 0.0;
		this._stats.stunImmune = 0.0;
		this._stats.twineImmune = 0.0;
		this._stats.critDamageReduce = 0.0;
		this._stats.unbendingWillTriggered = 0;
		this._stats.unbendingWillStacks = 0;
		this._stats.effectBeingHealed = 0.0;
		this._stats.healEffect = 0.0;
		this._stats.dotReduce = 0.0;
		this._stats.controlPrecision = 0.0;
		this._stats.damageAgainstBurning = 0.0;
		this._stats.damageAgainstBleeding = 0.0;
		this._stats.damageAgainstPoisoned = 0.0;
		this._stats.damageAgainstFrozen = 0.0;
		this._stats.damageAgainstStun = 0.0;
		this._stats.damageAgainstWarrior = 0.0;
		this._stats.damageAgainstMage = 0.0;
		this._stats.damageAgainstRanger = 0.0;
		this._stats.damageAgainstAssassin = 0.0;
		this._stats.damageAgainstPriest = 0.0;
		this._stats.allDamageReduce = 0.0;
		this._stats.allDamageTaken = 0.0;
		this._stats.allDamageDealt = 0.0;
		this._stats.controlImmunePen = 0.0;
		this._stats.firstCC = '';
		this._stats.dodge = 0.0;
		this._stats['Seal of LightImmune'] = 0.0;
		this._stats.ShapeshiftImmune = 0.0;
		this._stats.TauntImmune = 0.0;
		this._stats.DazzleImmune = 0.0;
		this._stats.HorrifyImmune = 0.0;
		this._stats.SilenceImmune = 0.0;

		this._attackMultipliers = {};
		this._hpMultipliers = {};
		this._armorMultipliers = {};


		// apply enable bonus
		if (this._starLevel > 10) {
			this.applyStatChange({ hpPercent: (this._starLevel - 10) * 0.14, attackPercent: (this._starLevel - 10) * 0.1 }, 'enableBonuses');
		}


		// apply enables
		if (this._starLevel >= 11) {
			switch (this._enable1) {
				case 'None':
					break;
				case 'Vitality':
					this.applyStatChange({ hpPercent: 0.12 }, 'enable1');
					break;
				case 'Mightiness':
					this.applyStatChange({ attackPercent: 0.08 }, 'enable1');
					break;
				case 'Growth':
					this.applyStatChange({ hpPercent: 0.05, attackPercent: 0.03, speed: 20 }, 'enable1');
					break;
				default:
					throw 'Unknown enable 1: ' + this._enable1;
			}
		}

		if (this._starLevel >= 12) {
			switch (this._enable2) {
				case 'None':
					break;
				case 'Shelter':
					this.applyStatChange({ critDamageReduce: 0.15 }, 'enable2');
					break;
				case 'LethalFightback':
					break;
				case 'Vitality2':
					this.applyStatChange({ effectBeingHealed: 0.15 }, 'enable2');
					break;
				default:
					throw 'Unknown enable 2: ' + this._enable2;
			}
		}

		if (!(['None', 'Resilience', 'SharedFate', 'Purify'].includes(this._enable3)))
			throw 'Unknown enable 3: ' + this._enable3;

		if (this._starLevel >= 14) {
			switch (this._enable4) {
				case 'None':
					break;
				case 'Vitality':
					this.applyStatChange({ hpPercent: 0.12 }, 'enable4');
					break;
				case 'Mightiness':
					this.applyStatChange({ attackPercent: 0.08 }, 'enable4');
					break;
				case 'Growth':
					this.applyStatChange({ hpPercent: 0.05, attackPercent: 0.03, speed: 20 }, 'enable4');
					break;
				default:
					throw 'Unknown enable 4: ' + this._enable4;
			}
		}

		if (!(['None', 'BalancedStrike', 'UnbendingWill'].includes(this._enable5)))
			throw 'Unknown enable 5: ' + this._enable5;


		// apply equipment and set bonus
		const sets = {};

		if (!(this._weapon in weapons)) throw 'Unknown weapon: ' + this._weapon;
		this.applyStatChange(weapons[this._weapon].stats, 'weapon');
		keySet = weapons[this._weapon].set;
		if (keySet != '') {
			if (keySet in sets) {
				sets[keySet]++;
			} else {
				sets[keySet] = 1;
			}
		}
		if (arrLimits.includes(weapons[this._weapon].limit)) {
			this.applyStatChange(weapons[this._weapon].limitStats, 'weaponLimit');
		}

		if (!(this._armor in armors)) throw 'Unknown armor: ' + this._armor;
		this.applyStatChange(armors[this._armor].stats, 'armor');
		keySet = armors[this._armor].set;
		if (keySet != '') {
			if (keySet in sets) {
				sets[keySet]++;
			} else {
				sets[keySet] = 1;
			}
		}
		if (arrLimits.includes(armors[this._armor].limit)) {
			this.applyStatChange(armors[this._armor].limitStats, 'armorLimit');
		}

		if (!(this._shoe in shoes)) throw 'Unknown shoes: ' + this._shoe;
		this.applyStatChange(shoes[this._shoe].stats, 'shoe');
		keySet = shoes[this._shoe].set;
		if (keySet != '') {
			if (keySet in sets) {
				sets[keySet]++;
			} else {
				sets[keySet] = 1;
			}
		}
		if (arrLimits.includes(shoes[this._shoe].limit)) {
			this.applyStatChange(shoes[this._shoe].limitStats, 'shoeLimit');
		}

		if (!(this._accessory in accessories)) throw 'Unknown accessory: ' + this._accessory;
		this.applyStatChange(accessories[this._accessory].stats, 'accessory');
		keySet = accessories[this._accessory].set;
		if (keySet != '') {
			if (keySet in sets) {
				sets[keySet]++;
			} else {
				sets[keySet] = 1;
			}
		}
		if (arrLimits.includes(accessories[this._accessory].limit)) {
			this.applyStatChange(accessories[this._accessory].limitStats, 'accessoryLimit');
		}


		// Set bonus multipliers seem to be applied in a specific order?
		for (var x in setBonus) {
			if (sets[x] >= 2) {
				this.applyStatChange(setBonus[x][2], 'Two piece ' + x);
			}
			if (sets[x] >= 3) {
				this.applyStatChange(setBonus[x][3], 'Three piece ' + x);
			}
			if (sets[x] >= 4) {
				this.applyStatChange(setBonus[x][4], 'Four piece ' + x);
			}
		}


		// skin
		if (this._skin != 'None') {
			const stats = skins[this._heroName][this._skin];
			if (stats === undefined) throw 'Unknown skin: ' + this._heroName + ' - ' + this._skin
			this.applyStatChange(stats, 'skin');
		}


		// get and apply guild tech
		const tech = guildTech[this._heroClass];
		if (tech === undefined) throw "Undefined guild tech: " + this._heroClass;
		for (const techName in tech) {
			const techLevel = this.myTeam.tech[this._heroClass][techName];
			if (techLevel === undefined) throw "Undefined guild tech level for " + this._heroClass + ' - ' + techName;

			for (const statToBuff in tech[techName]) {
				const techStatsToBuff = {};
				const buffAmount = tech[techName][statToBuff] * techLevel;
				techStatsToBuff[statToBuff] = buffAmount;
				this.applyStatChange(techStatsToBuff, techName);
			}
		}


		// apply passives that give stats, does nothing unless overridden in subclass
		this.passiveStats();


		// artifact
		if (!(this._artifact in artifacts)) throw 'Unknown artifact: ' + this._artifact;
		this.applyStatChange(artifacts[this._artifact].stats, 'artifact');
		if (arrLimits.includes(artifacts[this._artifact].limit)) {
			this.applyStatChange(artifacts[this._artifact].limitStats, 'artifactLimit');
		}


		// stone
		if (!(this._stone in stones)) throw 'Unknown stone: ' + this._stone;
		this.applyStatChange(stones[this._stone], 'stone');


		// avatar frame
		this.applyStatChange(this.myTeam.frame, 'avatarFrame');


		// monster
		if (!(this.myTeam.monster._monsterName in baseMonsterStats)) throw 'Unknown monster: ' + this.myTeam.monster._monsterName;
		this.applyStatChange(baseMonsterStats[this.myTeam.monster._monsterName].stats, 'monster');


		// celestial island statues
		let statueType;
		if (['Light', 'Forest', 'Fortress'].includes(this._heroFaction)) {
			statueType = 'Holy';
		} else {
			statueType = 'Evil';
		}
		const statueStats = {
			speed: 2 * this.myTeam.statues[statueType].speed,
			hpPercent: 0.01 * this.myTeam.statues[statueType].hpPercent,
			attackPercent: 0.005 * this.myTeam.statues[statueType].attackPercent,
		};
		this.applyStatChange(statueStats, 'statue');


		// aura
		const arrIdentical = {
			0: { hpPercent: 0, attackPercent: 0 },
			1: { hpPercent: 0.02, attackPercent: 0.015 },
			2: { hpPercent: 0.05, attackPercent: 0.035 },
			3: { hpPercent: 0.08, attackPercent: 0.055 },
			4: { hpPercent: 0.11, attackPercent: 0.075 },
			5: { hpPercent: 0.14, attackPercent: 0.095 },
			6: { hpPercent: 0.18, attackPercent: 0.12 },
		};

		const factionCount = {
			Shadow: 0,
			Fortress: 0,
			Abyss: 0,
			Forest: 0,
			Dark: 0,
			Light: 0,
		};

		let heroCount = 0;
		for (const h of this._allies) {
			if (h._heroFaction != '') {
				factionCount[h._heroFaction] += 1;
				heroCount++;
			}
		}

		let factionHPBonus = 0;
		let factionAttackBonus = 0;
		if (heroCount == 6) {
			for (var x in factionCount) {
				factionHPBonus += arrIdentical[factionCount[x]].hpPercent;
				factionAttackBonus += arrIdentical[factionCount[x]].attackPercent;
			}

			this.applyStatChange({ hpPercent: factionHPBonus, attackPercent: factionAttackBonus }, 'factionAura');

			const addBonuses = {
				damageReduce: 0.02 * (factionCount.Shadow + factionCount.Fortress + factionCount.Abyss + factionCount.Forest),
				controlImmune: 0.04 * (factionCount.Light + factionCount.Dark),
			};
			this.applyStatChange(addBonuses, 'auraAdditionalBonuses');
		}


		this._stats.totalHP = this.calcHP();
		this._stats.totalAttack = this.calcAttack();
		this._stats.totalArmor = this.calcArmor();
	}


	applyStatChange(arrStats, strSource) {
		for (const strStatName in arrStats) {
			if (strStatName == 'attackPercent' || strStatName == 'attackPercent2') {
				this._attackMultipliers[strSource + ':' + strStatName] = 1 + arrStats[strStatName];
			} else if (strStatName == 'hpPercent' || strStatName == 'hpPercent2') {
				this._hpMultipliers[strSource + ':' + strStatName] = 1 + arrStats[strStatName];
			} else if (strStatName == 'armorPercent') {
				this._armorMultipliers[strSource + ':' + strStatName] = 1 + arrStats[strStatName];
			} else {
				this._stats[strStatName] += arrStats[strStatName];
				if (strStatName == 'allDamageTaken' && this._stats[strStatName] < 0) throw 'allDamageTaken is now negative';
			}
		}
	}


	calcAttack() {
		let att = this._stats.attack;
		for (const x in this._attackMultipliers) {
			att = Math.floor(att * this._attackMultipliers[x]);
		}
		att += this._stats.fixedAttack;
		return att;
	}


	calcHP() {
		let ehp = this._stats.hp;
		for (const x in this._hpMultipliers) {
			ehp = Math.floor(ehp * this._hpMultipliers[x]);
		}
		ehp += this._stats.fixedHP;
		return ehp;
	}


	calcArmor() {
		let armor = this._stats.armor;
		for (const x in this._armorMultipliers) {
			armor = Math.floor(armor * this._armorMultipliers[x]);
		}
		return armor;
	}


	// Get hero stats for display.
	getHeroSheet() {
		console.log('Get stats summary for ' + this._heroName);
		let heroSheet = '';

		const arrIntStats = [
			'hp', 'attack', 'speed', 'armor',
			'totalHP', 'totalAttack', 'totalArmor',
			'unbendingWillTriggered', 'unbendingWillStacks',
			'revive', 'fixedAttack', 'fixedHP', 'energy', 'isCharging',
		];

		const arrStrStats = ['firstCC'];

		heroSheet += 'Level ' + this._heroLevel + ' ' + this._heroName + '<br/>';
		heroSheet += this._starLevel + '* ' + this._heroFaction + ' ' + this._heroClass + '<br/>';

		for (const statName in this._stats) {
			if (arrIntStats.includes(statName)) {
				heroSheet += '<br/>' + translate[statName] + ': ' + this._stats[statName].toLocaleString();
			} else if (arrStrStats.includes(statName)) {
				heroSheet += '<br/>' + translate[statName] + ': ' + this._stats[statName];
			} else {
				heroSheet += '<br/>' + translate[statName] + ': ' + (this._stats[statName] * 100).toFixed() + '%';
			}
		}

		return heroSheet;
	}

	heroDesc() {
		if (this._heroName == 'None') {
			return '';
		} else if (!detailDesc) {
			return this._attOrDef + '-' + (this._heroPos + 1) + '-' + this._heroName;
		} else {
			const pos1 = parseInt(this._heroPos) + 1;
			return '<span class=\'' + this._attOrDef + '\'>' + this._heroName + '-' + pos1 + ' (' + this._currentStats.totalHP.toLocaleString() + ' hp, ' + this._currentStats.totalAttack.toLocaleString() + ' attack, ' + this._currentStats.energy + ' energy)</span>';
		}
	}


	// Snapshot stats for combat
	snapshotStats() {
		this._currentStats = Object.assign({}, this._stats);
		this._currentStats.damageDealt = 0;
		this._currentStats.damageHealed = 0;
	}


	// utility functions for combat

	hasStatus(strStatus) {
		if (!this.alive) { return false; }
		if (strStatus in this._debuffs) { return true; }
		if (strStatus in this._buffs) { return true; }
		return false;

		/*
	var result = false;
	
	for (let [b, ob] of Object.entries(this._debuffs)) {
	  if (b == strStatus) {
		return true;
	  } else {
		for (let s of Object.values(ob)) {
		  for (let e of Object.keys(s["effects"])) {
			if (e == strStatus) { return true; }
		  }
		}
	  }
	}
	
	
	for (let [b, ob] of Object.entries(this._buffs)) {
	  if (b == strStatus) {
		return true;
	  } else {
		for (let s of Object.values(ob)) {
		  for (let e of Object.keys(s["effects"])) {
			if (e == strStatus) { return true; }
		  }
		}
	  }
	}
	
	return result;
	*/
	}


	isUnderStandardControl() {
		if (!this.alive) { return false; }
		if (this.hasStatus('petrify') || this.hasStatus('stun') || this.hasStatus('twine') || this.hasStatus('freeze') || this.hasStatus('Shapeshift')) {
			return true;
		} else {
			return false;
		}
	}


	isNotSealed() {
		if (!this.alive) { return false; }

		if ('Seal of Light' in this._debuffs || 'Shapeshift' in this._debuffs) {
			return false;
		} else {
			return true;
		}
	}


	// can further extend this to account for new mechanics by adding parameters to the end
	// supply a default value so as to not break other calls to this function
	calcDamage(target, attackDamage, damageSource, damageType, skillDamage = 1, canCrit = 1, dotRounds = 0, canBlock = 1, armorReduces = 1) {
		if (attackDamage < 0) throw "calcDamage called with negative attackDamage";

		// Get damage related stats
		let critChance = canCrit * this._currentStats.crit;
		let critDamage = 2 * this._currentStats.critDamage + 1.5;
		let precision = this._currentStats.precision;
		let precisionDamageIncrease = 1;
		let holyDamageIncrease = this._currentStats.holyDamage * 0.7;
		let damageAgainstBurning = 1;
		let damageAgainstBleeding = 1;
		let damageAgainstPoisoned = 1;
		let damageAgainstFrozen = 1;
		let damageAgainstStun = 1;
		let damageAgainstClass = 1;
		let allDamageDealt = 1 + this._currentStats.allDamageDealt;
		let armorBreak = this._currentStats.armorBreak;
		let allDamageTaken = 1 + target._currentStats.allDamageTaken;

		// mitigation stats
		const critDamageReduce = target._currentStats.critDamageReduce;
		let classDamageReduce = target._currentStats[this._heroClass.toLowerCase() + 'Reduce'];
		let damageReduce = target._currentStats.damageReduce;
		let allDamageReduce = target._currentStats.allDamageReduce;
		let dotReduce = 0;
		let armorMitigation = armorReduces * ((1 - armorBreak) * target._currentStats.totalArmor / (180 + 20 * (target._heroLevel)));


		// faction advantage
		const factionA = this._heroFaction;
		const factionB = target._heroFaction;

		if (
			(factionA == 'Abyss' && factionB == 'Forest') ||
			(factionA == 'Forest' && factionB == 'Shadow') ||
			(factionA == 'Shadow' && factionB == 'Fortress') ||
			(factionA == 'Fortress' && factionB == 'Abyss') ||
			(factionA == 'Dark' && factionB == 'Light') ||
			(factionA == 'Light' && factionB == 'Dark')
		) {
			damageReduce -= 0.3;
			precision += 0.15;
		}
		precisionDamageIncrease = 1 + precision * 0.3;


		// caps and min
		if (critDamage > 4.5) { critDamage = 4.5; }
		if (critChance < 0) { critChance = 0; }
		if (precision < 0) { precision = 0; }
		if (precisionDamageIncrease < 1) { precisionDamageIncrease = 1; }
		if (precisionDamageIncrease > 1.45) { precisionDamageIncrease = 1.45; }
		if (armorBreak > 1) { armorBreak = 1; }
		if (damageReduce > 0.75) { damageReduce = 0.75; }
		if (allDamageReduce < 0) { allDamageReduce = 0; }
		if (allDamageDealt < 0) { allDamageDealt = 0; }

		let blockChance = canBlock * (target._currentStats.block - precision);
		if (blockChance < 0) { blockChance = 0; }


		// status modifiers
		if (target.hasStatus('Burn') || target.hasStatus('Burn True')) {
			damageAgainstBurning += this._currentStats.damageAgainstBurning;
		}

		if (target.hasStatus('Bleed') || target.hasStatus('Bleed True')) {
			damageAgainstBleeding += this._currentStats.damageAgainstBleeding;
		}

		if (target.hasStatus('Poison') || target.hasStatus('Poison True')) {
			damageAgainstPoisoned += this._currentStats.damageAgainstPoisoned;
		}

		if (target.hasStatus('freeze')) {
			damageAgainstFrozen += this._currentStats.damageAgainstFrozen;
		}

		if (target.hasStatus('stun')) {
			damageAgainstStun += this._currentStats.damageAgainstStun;
		}

		if (isDot(damageType)) {
			dotReduce = target._currentStats.dotReduce;
		}

		damageAgainstClass += this._currentStats['damageAgainst' + target._heroClass];


		// damage source and damage type overrides
		if (damageSource == 'active') {
			if (isDot(damageType)) {
				skillDamage += (this._currentStats.skillDamage + ((this._currentStats.energySnapshot - 100) / 100)) / (dotRounds + 1);
			} else if (!['energy', 'true'].includes(damageType)) {
				skillDamage += this._currentStats.skillDamage + ((this._currentStats.energySnapshot - 100) / 100);
			}
		} else if (isDot(damageType) && !['burnTrue', 'bleedTrue', 'poisonTrue'].includes(damageType)) {
			skillDamage += this._currentStats.skillDamage / (dotRounds + 1);
		}

		if (['passive', 'mark'].includes(damageSource) || isDot(damageType)) {
			critChance = 0;
			blockChance = 0;
		}

		if (['energy', 'true', 'burnTrue', 'bleedTrue', 'poisonTrue'].includes(damageType)) {
			precisionDamageIncrease = 1;
			damageAgainstBurning = 1;
			damageAgainstBleeding = 1;
			damageAgainstPoisoned = 1;
			damageAgainstFrozen = 1;
			damageAgainstStun = 1;
			allDamageDealt = 1;
			holyDamageIncrease = 0;
			armorMitigation = 0;
			damageReduce = 0;
			classDamageReduce = 0;
			allDamageTaken = 1;
			critChance = 0;
			blockChance = 0;
		}

		if (canCrit == 2) {
			critChance = 1;
		}


		// calculate damage
		attackDamage = attackDamage * skillDamage * precisionDamageIncrease * damageAgainstBurning * damageAgainstBleeding * damageAgainstPoisoned * damageAgainstFrozen * damageAgainstStun * damageAgainstClass * allDamageDealt;
		attackDamage = attackDamage * (1 - allDamageReduce) * (1 - damageReduce) * (1 - armorMitigation + holyDamageIncrease) * (1 - classDamageReduce) * (1 - dotReduce) * allDamageTaken;

		let blocked = false;
		let critted = false;
		const critRoll = random();
		//const blockRoll = random();
		const blockRoll = critRoll; // seems to be only one roll

		if (critRoll < critChance && blockRoll < blockChance) {
			// blocked crit
			attackDamage = attackDamage * 0.56 * (1 - critDamageReduce) * critDamage;
			blocked = true;
			critted = true;
		} else if (critRoll < critChance) {
			// crit
			attackDamage = attackDamage * (1 - critDamageReduce) * critDamage;
			critted = true;
		} else if (blockRoll < blockChance) {
			// blocked normal
			attackDamage = attackDamage * 0.7;
			blocked = true;
		}


		if (roundNum > 15) {
			attackDamage = attackDamage * (1.15 ** (roundNum - 15));
		}


		if (attackDamage == 0 && this._currentStats.totalAttack == 0) {
			attackDamage = 1;
		}

		if (attackDamage < 0) throw "calcDamage result negative attackDamage";

		return {
			'damageAmount': Math.floor(attackDamage),
			'critted': critted,
			'blocked': blocked,
			'damageSource': damageSource,
			'damageType': damageType,
		};
	}


	calcHeal(target, healAmount) {
		const healEffect = this._currentStats.healEffect + 1;
		return Math.floor(healAmount * healEffect);
	}


	getHeal(source, amountHealed) {
		if (amountHealed < 0) throw "getHeal called with negative amountHealed";

		if (!this.alive) { return ''; }

		let result;
		let effectBeingHealed = 1 + this._currentStats.effectBeingHealed;
		if (effectBeingHealed < 0) { effectBeingHealed = 0; }

		amountHealed = Math.floor(amountHealed * effectBeingHealed);

		if (!isMonster(source) && 'Healing Curse' in this._debuffs) {
			const debuffKey = Object.keys(this._debuffs['Healing Curse'])[0];
			const debuffStack = this._debuffs['Healing Curse'][debuffKey];
			const damageResult = {};

			result = '<div>Heal from ' + source.heroDesc() + ' blocked by <span class=\'skill\'>Healing Curse</span>.</div>';
			result += this.removeDebuff('Healing Curse', debuffKey);

			triggerQueue.push([debuffStack.source, 'addHurt', this, amountHealed, 'Healing Curse']);

		} else {
			amountHealed = Math.min(amountHealed, this._stats.totalHP - this._currentStats.totalHP);
			this._currentStats.totalHP += amountHealed;
			source._currentStats.damageHealed += amountHealed;

			result = '<div>' + source.heroDesc() + ' healed ' + (this === source ? 'self' : this.heroDesc()) + ' for ' + formatNum(amountHealed) + '.</div>';
		}

		return result;
	}


	getEnergy(source, amount) {
		if (!this.alive) { return ''; }

		this._currentStats.energy += amount;

		let result = '';
		if (this === source) {
			result = '<div>' + this.heroDesc() + ' gained ';
		} else {
			result = '<div>' + source.heroDesc() + ' gave ' + this.heroDesc() + ' ';
		}
		result += formatNum(amount) + ' energy. Energy at ' + formatNum(this._currentStats.energy) + '.</div>';

		if (this._currentStats.energy >= 100 && 'Devouring Mark' in this._debuffs) {
			for (const s in this._debuffs['Devouring Mark']) {
				triggerQueue.push([this._debuffs['Devouring Mark'][s].source, 'devouringMark', this, this._debuffs['Devouring Mark'][s].effects.attackAmount, this._currentStats.energy]);
			}
			result += this.removeDebuff('Devouring Mark');
		}

		return result;
	}


	loseEnergy(source, amount) {
		if (!this.alive) { return ''; }

		this._currentStats.energy = Math.max(this._currentStats.energy - amount, 0);

		return '<div>' + source.heroDesc() + ' drained from ' + this.heroDesc() + ' ' + formatNum(amount) + ' energy. Energy at ' + formatNum(this._currentStats.energy) + '.</div>';
	}


	calcCombatAttack() {
		let att = this._currentStats.attack;

		for (const x in this._attackMultipliers) {
			att = Math.floor(att * this._attackMultipliers[x]);
		}

		// apply buffs
		for (const b of Object.values(this._buffs)) {
			for (const s of Object.values(b)) {
				for (const [e, oe] of Object.entries(s.effects)) {
					if (e == 'attackPercent') {
						att = Math.floor(att * (1 + oe));
					}
				}
			}
		}

		// apply debuffs
		for (const b of Object.values(this._debuffs)) {
			for (const s of Object.values(b)) {
				for (const [e, oe] of Object.entries(s.effects)) {
					if (e == 'attackPercent') {
						att = Math.floor(att * (1 - oe));
					}
				}
			}
		}

		att += this._currentStats.fixedAttack;
		if (att < 0) att = 0;
		return att;
	}


	calcCombatArmor() {
		let armr = this._currentStats.armor;

		for (const x in this._armorMultipliers) {
			armr = Math.floor(armr * this._armorMultipliers[x]);
		}

		// apply buffs
		for (const b of Object.values(this._debuffs)) {
			for (const s of Object.values(b)) {
				for (const [e, oe] of Object.entries(s.effects)) {
					if (e == 'armorPercent') {
						armr = Math.floor(armr * (1 + oe));
					}
				}
			}
		}

		// apply debuffs
		for (const b of Object.values(this._debuffs)) {
			for (const s of Object.values(b)) {
				for (const [e, oe] of Object.entries(s.effects)) {
					if (e == 'armorPercent') {
						armr = Math.floor(armr * (1 - oe));
					}
				}
			}
		}

		return armr;
	}


	getBuff(source, buffName, duration, effects = {}, unstackable = false) {
		if (!this.alive) { return ''; }

		let result = '';
		let healResult = '';

		if (duration > 15) {
			result += '<div>' + this.heroDesc() + ' gained buff <span class=\'skill\'>' + buffName + '</span>.';
		} else if (duration == 1) {
			result += '<div>' + this.heroDesc() + ' gained buff <span class=\'skill\'>' + buffName + '</span> for ' + formatNum(1) + ' round.';
		} else {
			result += '<div>' + this.heroDesc() + ' gained buff <span class=\'skill\'>' + buffName + '</span> for ' + formatNum(duration) + ' rounds.';
		}


		if (unstackable && buffName in this._buffs) {
			const stackObj = Object.values(this._buffs[buffName])[0];
			stackObj.duration = duration;

		} else {
			const keyAt = uuid();
			if (buffName in this._buffs) {
				this._buffs[buffName][keyAt] = { 'source': source, 'duration': duration, 'effects': effects };
			} else {
				this._buffs[buffName] = {};
				this._buffs[buffName][keyAt] = { 'source': source, 'duration': duration, 'effects': effects };
			}


			for (const strStatName in effects) {
				result += ' ' + translate[strStatName] + ': ' + formatNum(effects[strStatName]) + '.';

				if (strStatName == 'attackPercent') {
					this._currentStats.totalAttack = this.calcCombatAttack();

				} else if (strStatName == 'armorPercent') {
					this._currentStats.totalArmor = this.calcCombatArmor();

				} else if (strStatName == 'heal') {
					//TODO why heal directly?
					healResult = this.getHeal(source, effects[strStatName]);

				} else if (strStatName == 'attackAmount') {
					// ignore, used for snapshotting attack

				} else {
					this._currentStats[strStatName] += effects[strStatName];

					if (strStatName == 'attack' || strStatName == 'fixedAttack') {
						this._currentStats.totalAttack = this.calcCombatAttack();
					} else if (strStatName == 'armor') {
						this._currentStats.totalArmor = this.calcCombatArmor();
					}
				}
			}
		}

		return result + '</div>' + healResult;
	}


	getDebuff(source, debuffName, duration, effects = {}, bypassControlImmune = false, damageSource = 'passive', ccChance = 1, unstackable = false) {
		if (!this.alive) { return ''; }

		let damageResult = {};
		const strDamageResult = '';
		let result = '';
		let controlImmune;
		let controlImmunePen;
		const isControl = isControlEffect(debuffName, effects);
		let rollCCHit;
		let rollCCPen;


		if (isControl) {
			controlImmune = this._currentStats.controlImmune;
			controlImmunePen = source._currentStats.controlImmunePen;
			controlImmune -= controlImmunePen;
			if (controlImmune < 0) { controlImmune = 0; }

			if ((debuffName + 'Immune') in this._currentStats) {
				controlImmune = 1 - (1 - controlImmune) * (1 - this._currentStats[debuffName + 'Immune']);
			}

			ccChance = ccChance * (1 + source._currentStats.controlPrecision);
			rollCCHit = random();
			rollCCPen = random();
		}

		if (isControl && rollCCHit >= ccChance) {
			// failed CC roll
		} else if (isControl && rollCCPen < controlImmune && !(bypassControlImmune)) {
			result += '<div>' + this.heroDesc() + ' resisted debuff <span class=\'skill\'>' + debuffName + '</span>.</div>';
		} else if (
			isControl &&
			(rollCCPen >= controlImmune || bypassControlImmune) &&
			this._artifact.includes(' Lucky Candy Bar') &&
			(this._currentStats.firstCC == '' || this._currentStats.firstCC == debuffName)
		) {
			this._currentStats.firstCC = debuffName;
			result += '<div>' + this.heroDesc() + ' resisted debuff <span class=\'skill\'>' + debuffName + '</span> using <span class=\'skill\'>' + this._artifact + '</span>.</div>';
		} else {
			if (duration == 1) {
				result += '<div>' + this.heroDesc() + ' gained debuff <span class=\'skill\'>' + debuffName + '</span> for ' + formatNum(1) + ' round.';
			} else {
				result += '<div>' + this.heroDesc() + ' gained debuff <span class=\'skill\'>' + debuffName + '</span> for ' + formatNum(duration) + ' rounds.';
			}


			if (unstackable && debuffName in this._debuffs) {
				const stackObj = Object.values(this._debuffs[debuffName])[0];
				stackObj.duration = duration;

				if (debuffName == 'Shapeshift') {
					stackObj.effects.stacks = effects.stacks;
				}

			} else {
				const keyAt = uuid();
				if (debuffName in this._debuffs) {
					this._debuffs[debuffName][keyAt] = { 'source': source, 'duration': duration, 'effects': effects };
				} else {
					this._debuffs[debuffName] = {};
					this._debuffs[debuffName][keyAt] = { 'source': source, 'duration': duration, 'effects': effects };
				}


				// process effects
				for (const strStatName in effects) {
					result += ' ' + translate[strStatName] + ': ' + formatNum(effects[strStatName]) + '.';

					if (strStatName == 'attackPercent') {
						this._currentStats.totalAttack = this.calcCombatAttack();

					} else if (strStatName == 'armorPercent') {
						this._currentStats.totalArmor = this.calcCombatArmor();

					} else if (isDot(strStatName)) {
						//TODO why dot directly?
						if (this.alive) {
							damageResult = {
								damageAmount: effects[strStatName],
								damageSource: damageSource,
								damageType: strStatName,
								critted: false,
								blocked: false,
							};
							result += '<div>' + this.takeDamage(source, 'Debuff ' + debuffName, damageResult) + '</div>';
						}

					} else if (['rounds', 'stacks', 'attackAmount', 'damageAmount'].includes(strStatName)) {
						// ignore, used to track other stuff

					} else {
						this._currentStats[strStatName] -= effects[strStatName];

						if (strStatName == 'attack' || strStatName == 'fixedAttack') {
							this._currentStats.totalAttack = this.calcCombatAttack();
						} else if (strStatName == 'armor') {
							this._currentStats.totalArmor = this.calcCombatArmor();
						} else if (['dodge', 'crit', 'block'].includes(strStatName)) {
							if (this._currentStats[strStatName] < 0) {
								this._currentStats[strStatName] = 0;
							}
						}
					}
				}

				if (isControl) {
					triggerQueue.push([this, 'eventGotCC', source, debuffName, keyAt]);
				}

				result += '</div>';


				// handle special debuffs
				if (debuffName == 'Devouring Mark' && this._currentStats.energy >= 100) {
					triggerQueue.push([source, 'devouringMark', this, effects.attackAmount, this._currentStats.energy]);
					result += this.removeDebuff('Devouring Mark');
				} else if (debuffName == 'Power of Light' && Object.keys(this._debuffs[debuffName]).length >= 2) {
					result += this.removeDebuff('Power of Light');
					result += this.getDebuff(source, 'Seal of Light', 2);
				} else if (debuffName == 'twine') {
					for (var h of source._allies) {
						if (h._heroName == 'Oberon') {
							triggerQueue.push([h, 'eventTwine']);
						}
					}
				} else if (debuffName == 'Horrify') {
					for (var h of this._enemies) {
						triggerQueue.push([h, 'enemyHorrified']);
					}
				}
			}
		}

		return result + strDamageResult;
	}


	removeBuff(strBuffName, stack = '') {
		let result = '';

		if (strBuffName in this._buffs) {
			result = '<div>' + this.heroDesc() + ' lost buff <span class=\'skill\'>' + strBuffName + '</span>.</div>';

			// for each stack
			for (const s in this._buffs[strBuffName]) {
				// remove the effects
				if (stack == '' || stack == s) {
					const oStack = this._buffs[strBuffName][s];
					delete this._buffs[strBuffName][s];

					for (const strStatName in oStack.effects) {
						result += ' ' + translate[strStatName] + ': ' + formatNum(oStack.effects[strStatName]) + '.';

						if (strStatName == 'attackPercent') {
							this._currentStats.totalAttack = this.calcCombatAttack();

						} else if (strStatName == 'armorPercent') {
							this._currentStats.totalArmor = this.calcCombatArmor();

						} else if (['heal', 'attackAmount'].includes(strStatName)) {
							// do nothing

						} else {
							this._currentStats[strStatName] -= oStack.effects[strStatName];

							if (strStatName == 'attack' || strStatName == 'fixedAttack') {
								this._currentStats.totalAttack = this.calcCombatAttack();
							} else if (strStatName == 'armor') {
								this._currentStats.totalArmor = this.calcCombatArmor();
							}
						}
					}
				}
			}

			if (Object.keys(this._buffs[strBuffName]).length == 0) {
				delete this._buffs[strBuffName];
			}
		}

		return result;
	}


	removeDebuff(strDebuffName, stack = '') {
		let result = '';

		if (strDebuffName in this._debuffs) {
			result = '<div>' + this.heroDesc() + ' lost debuff <span class=\'skill\'>' + strDebuffName + '</span>.</div>';

			// for each stack
			for (const s in this._debuffs[strDebuffName]) {
				// remove the effects
				if (stack == '' || stack == s) {
					const oStack = this._debuffs[strDebuffName][s];
					delete this._debuffs[strDebuffName][s];

					for (const strStatName in oStack.effects) {
						result += ' ' + translate[strStatName] + ': ' + formatNum(oStack.effects[strStatName]) + '.';

						if (strStatName == 'attackPercent') {
							this._currentStats.totalAttack = this.calcCombatAttack();

						} else if (strStatName == 'armorPercent') {
							this._currentStats.totalArmor = this.calcCombatArmor();

						} else if (['rounds', 'stacks', 'attackAmount', 'damageAmount'].includes(strStatName)) {
							// do nothing, used to track other stuff

						} else if (isDot(strStatName)) {
							// do nothing

						} else {
							this._currentStats[strStatName] += oStack.effects[strStatName];

							if (strStatName == 'attack' || strStatName == 'fixedAttack') {
								this._currentStats.totalAttack = this.calcCombatAttack();
							} else if (strStatName == 'armor') {
								this._currentStats.totalArmor = this.calcCombatArmor();
							}
						}
					}
				}
			}

			if (Object.keys(this._debuffs[strDebuffName]).length == 0) {
				delete this._debuffs[strDebuffName];
			}
		}

		return result;
	}


	tickBuffs() {
		if (!this.alive) return '';

		let result = '';

		// for each buff name
		for (const b in this._buffs) {
			// for each stack id
			for (const s in this._buffs[b]) {
				const stack = this._buffs[b][s];

				const heal = stack.effects.heal;
				if (heal !== undefined) {
					result += '<div>' + this.heroDesc() + ' stack of buff <span class=\'skill\'>' + b + '</span> ticked.</div>';
					result += '<div>' + this.getHeal(stack.source, heal) + '</div>';
				}

				if (--stack.duration < 1) {
					result += '<div>' + this.heroDesc() + ' stack of buff (<span class=\'skill\'>' + b + '</span>) ended.</div>';
					result += this.removeBuff(b, s);
				}
			}
		}

		return result;
	}


	tickDebuffs() {
		let result = '';

		if (!this.alive) return result;

		// for each buff name
		for (const b in this._debuffs) {
			if (!this.alive) break;

			// for each stack id
			for (const s in this._debuffs[b]) {
				if (!this.alive) break;

				const stack = this._debuffs[b][s];

				for (var strStatName in stack.effects) {
					if (isDot(strStatName)) {
						if (this.alive) {
							const damageResult = {
								damageAmount: stack.effects[strStatName],
								damageSource: 'passive',
								damageType: strStatName,
								critted: false,
								blocked: false,
							};

							result += '<div>' + this.heroDesc() + ' stack of debuff <span class=\'skill\'>' + b + '</span> ticked.</div>';
							result += '<div>' + this.takeDamage(stack.source, 'Debuff ' + b, damageResult) + '</div>';
						}
					}
				}

				if (b == 'Revenging Wraith') {
					const damageCap = stack.effects.attackAmount * 25;
					let damageAmount = Math.min(Math.floor(this._stats.totalHP * 0.30), damageCap);
					let damageResult = stack.source.calcDamage(this, damageAmount, 'passive', 'true');
					result += this.takeDamage(stack.source, 'Revenging Wraith', damageResult);

					//TODO wrong - this must be called for every kind of death
					if (!this.alive) {
						for (const h of this._allies) {
							if (h.alive) {
								damageAmount = Math.min(Math.floor(h._stats.totalHP * 0.30), damageCap);
								damageResult = stack.source.calcDamage(h, damageAmount, 'passive', 'true');
								result += h.takeDamage(stack.source, 'Revenging Wraith', damageResult);
							}
						}
					}
				}

				if (--stack.duration < 1) {
					result += '<div>' + this.heroDesc() + ' stack of debuff (<span class=\'skill\'>' + b + '</span>) ended.</div>';

					if (b == 'Sow Seeds') {
						result += this.getDebuff(stack.source, 'twine', stack.effects.rounds);
					} else if (b == 'Black Hole Mark') {
						let damageAmount = stack.effects.damageAmount;
						if (damageAmount > stack.effects.attackAmount) { damageAmount = stack.effects.attackAmount; }
						const damageResult = stack.source.calcDamage(this, damageAmount, 'mark', 'true');
						result += '<div>' + this.takeDamage(stack.source, 'Black Hole Mark', damageResult) + '</div>';
					} else if (b == 'Round Mark') {
						const damageResult = stack.effects.attackAmount;
						result += '<div>' + this.takeDamage(stack.source, 'Round Mark', damageResult) + '</div>';
					}

					result += this.removeDebuff(b, s);
				}
			}
		}

		return result;
	}


	tickEnable3() {
		let result = '';

		if (this._enable3 == 'Resilience') {
			const healAmount = this.calcHeal(this, 0.15 * (this._stats.totalHP - this._currentStats.totalHP));
			if (healAmount > 0) {
				result += '<div>' + this.heroDesc() + ' Resilience triggered.</div>';
				result += this.getHeal(this, healAmount);
			}
		} else if (this._enable3 == 'SharedFate') {
			let numLiving = 0;
			for (const h of this._allies) {
				if (h.alive) { numLiving++; }
			}
			for (const h of this._enemies) {
				if (h.alive) { numLiving++; }
			}
			const attBuff = numLiving * 0.012;
			if (numLiving > 0) {
				result += '<div>' + this.heroDesc() + ' gained Shared Fate. Increased attack by ' + formatNum(attBuff * 100) + '%.</div>';
				this.getBuff(this, 'Attack Percent', 1, { attackPercent: attBuff });
			}
		} else if (this._enable3 == 'Purify') {
			const listDebuffs = [];
			for (const d in this._debuffs) {
				if (isDispellable(d)) {
					listDebuffs.push(d);
				}
			}
			if (listDebuffs.length > 0) {
				result += '<div>' + this.heroDesc() + ' <span class=\'skill\'>Purify</span> removed debuff.</div>';
				const idx = Math.floor(random() * listDebuffs.length);
				result += this.removeDebuff(listDebuffs[idx]);
			}
		}

		return result;
	}


	// a bunch of functions for override by hero subclasses as needed to trigger special abilities.
	// usually you'll want to check that the hero is still alive before triggering their effect

	passiveStats() { return {}; }
	eventSelfBasic(e) { return ''; }
	eventAllyBasic(e) { return ''; }
	eventEnemyBasic(e) { return ''; }
	eventAllyActive(e) { return ''; }
	eventEnemyActive(e) { return ''; }
	eventSelfDied(e) { return ''; }
	eventAllyDied(e) { return ''; }
	eventEnemyDied(e) { return ''; }
	eventGotCC(source, ccName, ccStackID) { return ''; }
	startOfBattle() { return ''; }
	endOfRound(roundNum) { return ''; }
	eventHPlte50() { return ''; }
	eventHPlte30() { return ''; }


	handleTrigger(trigger) {
		if (trigger[1] == 'addHurt' && this.alive) {
			if (trigger[2].alive) {
				const damageResult = this.calcDamage(trigger[2], trigger[3], 'passive', 'true');
				return trigger[2].takeDamage(this, trigger[4], damageResult);
			}

		} else if (trigger[1] == 'getHP' && this.alive) {
			return this.getHP(trigger[2], Math.floor(trigger[3]));

		} else if (trigger[1] == 'getHeal' && this.alive) {
			return this.getHeal(trigger[2], Math.floor(trigger[3]));

		} else if (['eventSelfBasic', 'eventSelfActive'].includes(trigger[1]) && 'Bloodthirsty' in this._buffs && this.alive) {
			return this.eventBloodthirsty(trigger[2]);

		}

		return '';
	}


	takeDamage(source, strAttackDesc, damageResult) {
		if (damageResult.damageAmount < 0) throw "takeDamage called with negative damageAmount";

		if (!this.alive) { return ''; }

		let result = '';
		let dotAmount = 0;
		const beforeHP = this._currentStats.totalHP;

		damageResult.damageAmount = Math.floor(damageResult.damageAmount);


		strAttackDesc = '<span class=\'skill\'>' + strAttackDesc + '</span>';
		result = '<div>' + source.heroDesc() + ' used ' + strAttackDesc + ' against ' + this.heroDesc() + '.</div>';


		if (this._artifact.includes(' Magic Stone Sword') && strAttackDesc != 'Healing Curse' && !(isMonster(source))) {
			const maxDamage = Math.floor(this._stats.totalHP * artifacts[this._artifact].enhance);
			if (damageResult.damageAmount > maxDamage) {
				result += '<div><span class=\'skill\'>' + this._artifact + '</span> prevented some damage.</div>';
				damageResult.damageAmount = maxDamage;
			}
		}


		if (this._artifact.includes(' Augustus Magic Ball') && strAttackDesc != 'Healing Curse' && !(isMonster(source))) {
			const damMit = Math.floor(this._stats.totalAttack * artifacts[this._artifact].enhance);

			if (damageResult.damageAmount > 1) {
				result += '<div><span class=\'skill\'>' + this._artifact + '</span> prevented some damage.</div>';

				if (damageResult.damageAmount <= damMit) {
					damageResult.damageAmount = 1;
				} else {
					damageResult.damageAmount -= damMit;
				}
			}
		}


		if (this._artifact.includes(' Wildfire Torch') && ['basic', 'active'].includes(damageResult.damageSource) && damageResult.damageAmount > 1) {
			dotAmount = Math.floor(damageResult.damageAmount * artifacts[this._artifact].enhance * 0.20);
			damageResult.damageAmount = Math.floor(damageResult.damageAmount * (1 - artifacts[this._artifact].enhance));
			result += '<div><span class=\'skill\'>' + this._artifact + '</span> converted damage to dot.</div>';
		}


		// Inosuke's Swordwind Shield
		if ('Swordwind Shield' in this._buffs && (['basic', 'active'].includes(damageResult.damageSource) || (damageResult.damageSource == 'passive' && ['true', 'bleedTrue', 'burnTrue', 'poisonTrue'].includes(damageResult.damageType)))) {
			const buffStack = Object.values(this._buffs['Swordwind Shield'])[0];
			let damagePrevented = 0;

			if (damageResult.damageAmount > buffStack.effects.attackAmount) {
				damagePrevented = buffStack.effects.attackAmount;
				damageResult.damageAmount -= damagePrevented;
				result += this.removeBuff('Swordwind Shield');
			} else {
				damagePrevented = Math.floor(damageResult.damageAmount);
				damageResult.damageAmount = 0;
			}

			this._currentStats.damageHealed += damagePrevented;
			// eslint-disable-next-line no-undef
			result += `<div><span class='skill'>Swordwind Shield</span> prevented <span class='num'>${formatNum(damagePrevented)}</span> damage.</div>`;
		}


		// amenra shields
		if ('Guardian Shadow' in this._buffs && !(['passive', 'mark'].includes(damageResult.damageSource)) && !(isMonster(source)) && damageResult.damageAmount > 0) {
			const keyDelete = Object.keys(this._buffs['Guardian Shadow']);

			result += '<div>Damage prevented by <span class=\'skill\'>Guardian Shadow</span>.</div>';
			this._buffs['Guardian Shadow'][keyDelete[0]].source._currentStats.damageHealed += damageResult.damageAmount;
			triggerQueue.push([this, 'getHP', this._buffs['Guardian Shadow'][keyDelete[0]].source, damageResult.damageAmount]);

			damageResult.damageAmount = 0;
			damageResult.critted = false;
			damageResult.blocked = false;

			delete this._buffs['Guardian Shadow'][keyDelete[0]];

			if (keyDelete.length <= 1) {
				result += this.removeBuff('Guardian Shadow');
			}
		}

		if (this._currentStats.unbendingWillStacks > 0 && damageResult.damageSource != 'mark') {
			this._currentStats.unbendingWillStacks -= 1;
			this._currentStats.damageHealed += damageResult.damageAmount;
			result += '<div>' + formatNum(damageResult.damageAmount) + ' damage prevented by <span class=\'skill\'>Unbending Will</span>.</div>';

			if (this._currentStats.unbendingWillStacks == 0) {
				result += '<div><span class=\'skill\'>Unbending Will</span> ended.</div>';
			}

		} else if (this._currentStats.totalHP <= damageResult.damageAmount) {
			// hero would die, check for unbending will
			if (this._enable5 == 'UnbendingWill' && this._currentStats.unbendingWillTriggered == 0 && damageResult.damageSource != 'mark') {
				this._currentStats.unbendingWillTriggered = 1;
				this._currentStats.unbendingWillStacks = 3;
				this._currentStats.damageHealed += damageResult.damageAmount;
				result += '<div>' + formatNum(damageResult.damageAmount) + ' damage prevented by <span class=\'skill\'>Unbending Will</span>.</div>';

			} else {
				// hero died
				this._currentStats.totalHP = this._currentStats.totalHP - damageResult.damageAmount;
				source._currentStats.damageDealt += damageResult.damageAmount;

				if (damageResult.critted == true && damageResult.blocked == true) {
					result += '<div>Blocked crit ' + strAttackDesc + ' dealt ' + formatNum(damageResult.damageAmount) + ' damage.</div>';
				} else if (damageResult.critted == true && damageResult.blocked == false) {
					result += '<div>Crit ' + strAttackDesc + ' dealt ' + formatNum(damageResult.damageAmount) + ' damage.</div>';
				} else if (damageResult.critted == false && damageResult.blocked == true) {
					result += '<div>Blocked ' + strAttackDesc + ' dealt ' + formatNum(damageResult.damageAmount) + ' damage.</div>';
				} else {
					result += '<div>' + strAttackDesc + ' dealt ' + formatNum(damageResult.damageAmount) + ' damage.</div>';
				}

				result += '<div>Enemy health dropped from ' + formatNum(beforeHP) + ' to ' + formatNum(0) + '.</div><div>' + this.heroDesc() + ' died.</div>';

				triggerQueue.push([this, 'eventSelfDied', source, this]);

				for (var h of this._allies) {
					if (this != h) {
						triggerQueue.push([h, 'eventAllyDied', source, this]);
					}
				}

				for (var h of this._enemies) {
					triggerQueue.push([h, 'eventEnemyDied', source, this]);
				}
			}

		} else {
			this._currentStats.totalHP = this._currentStats.totalHP - damageResult.damageAmount;
			source._currentStats.damageDealt += damageResult.damageAmount;

			if (damageResult.critted == true && damageResult.blocked == true) {
				result += '<div>Blocked crit ' + strAttackDesc + ' dealt ' + formatNum(damageResult.damageAmount) + ' damage.</div>';
			} else if (damageResult.critted == true && damageResult.blocked == false) {
				result += '<div>Crit ' + strAttackDesc + ' dealt ' + formatNum(damageResult.damageAmount) + ' damage.</div>';
			} else if (damageResult.critted == false && damageResult.blocked == true) {
				result += '<div>Blocked ' + strAttackDesc + ' dealt ' + formatNum(damageResult.damageAmount) + ' damage.</div>';
			} else {
				result += '<div>' + strAttackDesc + ' dealt ' + formatNum(damageResult.damageAmount) + ' damage.</div>';
			}

			result += '<div>Enemy health dropped from ' + formatNum(beforeHP) + ' to ' + formatNum(this._currentStats.totalHP) + '.</div>';
		}


		if (dotAmount > 0) {
			result += this.getDebuff(source, 'Wildfire Torch Dot', 4, { dot: dotAmount });
		}


		// E2 Lethal Fightback
		if (
			source._enable2 == 'LethalFightback' &&
			source._currentStats.totalHP < this._currentStats.totalHP &&
			damageResult.damageType != 'true' &&
			!(isDot(damageResult.damageType)) &&
			['active', 'basic'].includes(damageResult.damageSource)
		) {
			triggerQueue.push([source, 'addHurt', this, damageResult.damageAmount * 0.12, 'Lethal Fightback']);
		}


		// E5 balanced strike
		if (source._enable5 == 'BalancedStrike' && ['active', 'basic'].includes(damageResult.damageSource)) {
			if (damageResult.critted == true) {
				const healAmount = source.calcHeal(source, 0.15 * (damageResult.damageAmount));
				result += '<div><span class=\'skill\'>Balanced Strike</span> triggered heal on crit.</div>';
				triggerQueue.push([source, 'getHeal', source, healAmount]);
			} else if (damageResult.damageType != 'true' && !isDot(damageResult.damageType)) {
				triggerQueue.push([source, 'addHurt', this, damageResult.damageAmount * 0.30, 'Balanced Strike']);
			}
		}


		if (damageResult.critted && 'Crit Mark' in this._debuffs) {
			for (const s in this._debuffs['Crit Mark']) {
				triggerQueue.push([this._debuffs['Crit Mark'][s].source, 'critMark', this, this._debuffs['Crit Mark'][s].effects.attackAmount]);
			}

			result += this.removeDebuff('Crit Mark');
		}


		if (this.alive && 'Shapeshift' in this._debuffs && damageResult.damageAmount > 0 && ['active', 'basic'].includes(damageResult.damageSource)) {
			const shapeshiftKey = Object.keys(this._debuffs.Shapeshift)[0];
			if (this._debuffs.Shapeshift[shapeshiftKey].effects.stacks > 1) {
				this._debuffs.Shapeshift[shapeshiftKey].effects.stacks--;
			} else {
				result += this.removeDebuff('Shapeshift', shapeshiftKey);
			}
		}


		if ('Black Hole Mark' in this._debuffs && ['active', 'basic'].includes(damageResult.damageSource)) {
			const key = Object.keys(this._debuffs['Black Hole Mark'])[0];
			this._debuffs['Black Hole Mark'][key].effects.damageAmount += Math.floor(0.60 * damageResult.damageAmount);
		}


		const beforePercent = beforeHP / this._stats.totalHP;
		const afterPercent = this._currentStats.totalHP / this._stats.totalHP;

		if (this.alive && beforePercent > 0.50 && afterPercent <= 0.50) {
			triggerQueue.push([this, 'eventHPlte50']);
		}

		if (this.alive && beforePercent > 0.30 && afterPercent <= 0.30) {
			triggerQueue.push([this, 'eventHPlte30']);

			if ('Rescue Mark' in this._buffs) {
				for (const s in this._buffs['Rescue Mark']) {
					triggerQueue.push([this, 'getHeal', this._buffs['Rescue Mark'][s].source, this._buffs['Rescue Mark'][s].effects.attackAmount]);
				}

				result += this.removeBuff('Rescue Mark');
			}
		}


		return result;
	}


	doBasic() {
		let result = '';
		let damageResult = {};
		const targets = getAllTargets(this, this._enemies, 1);
		let targetLock;

		for (const i in targets) {
			targetLock = targets[i].getTargetLock(this);
			result += targetLock;

			if (targetLock == '') {
				damageResult = this.calcDamage(targets[i], this._currentStats.totalAttack, 'basic', 'normal');
				result += targets[i].takeDamage(this, 'Basic Attack', damageResult);
				basicQueue.push([this, targets[i], damageResult.damageAmount, damageResult.critted]);
			}
		}

		return result;
	}


	doActive() {
		let result = '';
		let damageResult = {};
		const targets = getAllTargets(this, this._enemies, 2);
		let targetLock;

		for (const i in targets) {
			targetLock = targets[i].getTargetLock(this);
			result += targetLock;

			if (targetLock == '') {
				damageResult = this.calcDamage(targets[i], this._currentStats.totalAttack, 'active', 'normal', 1.5);
				result += targets[i].takeDamage(this, 'Active Template', damageResult);
				activeQueue.push([this, targets[i], damageResult.damageAmount, damageResult.critted]);
			}
		}

		return result;
	}


	getTargetLock(source) {
		if (random() < this._currentStats.dodge) {
			return '<div>' + source.heroDesc() + ' attack against ' + this.heroDesc() + ' was dodged.</div>';
		} else {
			return '';
		}
	}


	isUnderControl() {
		for (const d in this._debuffs) {
			if (isControlEffect(d)) {
				return true;
			}
		}

		return false;
	}


	getHP(source, amountHealed) {
		if (!this.alive) { return ''; }

		let result = '';
		result = '<div>' + source.heroDesc() + ' healed ';

		// prevent overheal
		if (this._currentStats.totalHP + amountHealed > this._stats.totalHP) {
			this._currentStats.totalHP = this._stats.totalHP;
		} else {
			this._currentStats.totalHP += amountHealed;
		}

		source._currentStats.damageHealed += amountHealed;

		if (this === source) {
			result += ' themself for ' + formatNum(amountHealed) + '.</div>';
		} else {
			result += this.heroDesc() + ' for ' + formatNum(amountHealed) + '.</div>';
		}

		return result;
	}


	eventBloodthirsty(targets) {
		let result = '';
		const maxDamage = 15 * this._currentStats.totalAttack;

		for (const i in targets) {
			const target = targets[i][1];
			if (!target.alive || target._currentStats.totalHP >= target._stats.totalHP) continue;

			let hpDamage = 0.20 * (target._stats.totalHP - target._currentStats.totalHP);
			if (hpDamage > maxDamage) { hpDamage = maxDamage; }

			const damageResult = this.calcDamage(target, hpDamage, 'passive', 'true');
			result += target.takeDamage(this, 'Bloodthirsty', damageResult);

			const healAmount = this.calcHeal(this, 0.30 * damageResult.damageAmount);
			result += this.getHeal(this, healAmount);
		}

		return result;
	}
}