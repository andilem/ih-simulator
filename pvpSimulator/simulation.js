const basicQueue = [];
const activeQueue = [];
let triggerQueue = [];
let logColor = 0;
let roundNum = 0;
let detailDesc = false;

function runSims(attTeam, defTeam, numSims, seed) {
	detailDesc = numSims == 1;
	const oCombatLog = document.getElementById('combatLog');
	let winCount = 0;
	let monsterResult = '';
	let someoneWon = '';
	let endingRoundSum = 0;

	const attHeroes = attTeam.heroes;
	const attMonster = attTeam.monster;

	const defHeroes = defTeam.heroes;
	const defMonster = defTeam.monster;

	if (seed === undefined) {
		// don't change random
	} else if (seed === null) {
		random = rng();
	} else {
		random = rng(seed);
	}

	logColor = 0;
	oCombatLog.innerHTML = '';

	for (const h of attHeroes) {
		h._damageDealt = 0;
		h._damageHealed = 0;
	}
	attMonster.reset();

	for (const h of defHeroes) {
		h._damageDealt = 0;
		h._damageHealed = 0;
	}
	defMonster.reset();

	for (let simIterNum = 1; simIterNum <= numSims; simIterNum++) {
		// @ start of single simulation

		if (numSims == 1) { oCombatLog.innerHTML += '<p class =\'logSeg\'>Simulation #' + formatNum(simIterNum) + ' started.</p>'; }
		someoneWon = '';
		uniqID = 0;
		attMonster._energy = 0;
		defMonster._energy = 0;

		// snapshot stats as they are
		for (const h of attHeroes) {
			if (h._heroName != 'None') {
				h.snapshotStats();
				h._buffs = {};
				h._debuffs = {};
			}
		}

		for (const h of defHeroes) {
			if (h._heroName != 'None') {
				h.snapshotStats();
				h._buffs = {};
				h._debuffs = {};
			}
		}

		// trigger start of battle abilities
		for (const h of attHeroes) {
			if (h.isNotSealed() && h.alive || h._currentStats.revive == 1) {
				temp = h.startOfBattle();
				if (numSims == 1 && temp.length > 0) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + temp + '</div>'; }
				logColor = (logColor + 1) % 2;
			}


			if (h._artifact.includes(' Golden Crown')) {
				temp = h.getBuff(h, 'Golden Crown', 5, { allDamageReduce: artifacts[h._artifact].enhance });
				if (numSims == 1 && temp.length > 0) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + temp + '</div>'; }
				logColor = (logColor + 1) % 2;
			}
		}

		for (const h of defHeroes) {
			if (h.isNotSealed() && h.alive) {
				temp = h.startOfBattle();
				if (numSims == 1 && temp.length > 0) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + temp + '</div>'; }
				logColor = (logColor + 1) % 2;
			}


			if (h._artifact.includes(' Golden Crown')) {
				temp = h.getBuff(h, 'Golden Crown', 5, { allDamageReduce: artifacts[h._artifact].enhance });
				if (numSims == 1 && temp.length > 0) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + temp + '</div>'; }
				logColor = (logColor + 1) % 2;
			}
		}

		roundNum = 1;
		while (true) {
			// @ start of round

			// Output detailed combat log only if running a single simulation
			if (numSims == 1) { oCombatLog.innerHTML += '<p class=\'logSeg log' + logColor + '\'>Round ' + formatNum(roundNum) + ' Start</p>'; }
			logColor = (logColor + 1) % 2;


			const orderOfAttack = attHeroes.concat(defHeroes);

			while (orderOfAttack.length > 0) {
				// @ start of hero action
				basicQueue.length = 0;
				activeQueue.length = 0;
				triggerQueue.length = 0; // shouldn't be necessary


				orderOfAttack.sort(speedSort);
				const currentHero = orderOfAttack.shift();

				if (currentHero.alive) {
					if (currentHero.isUnderStandardControl()) {
						if (numSims == 1) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + currentHero.heroDesc() + ' is under control effect, turn skipped.</div>'; }
					} else {

						let isRussellCharging = false;
						if (currentHero._heroName == 'Russell') {
							if (currentHero._currentStats['isCharging']) {
								isRussellCharging = true;
							}
						}


						// decide on action
						if ((currentHero._currentStats['energy'] >= 100 && !('Silence' in currentHero._debuffs)) || isRussellCharging) {

							// set hero energy to 0
							if (this._heroName != 'Russell') {
								currentHero._currentStats['energySnapshot'] = currentHero._currentStats['energy'];
								currentHero._currentStats['energy'] = 0;
							}

							// do active
							const result = currentHero.doActive();
							if (numSims == 1) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + result + '</div>'; }

							// monster gains energy from hero active
							if (currentHero._attOrDef == 'att') {
								if (attMonster._monsterName != 'None') {
									monsterResult = '<div>' + attMonster.heroDesc() + ' gained ' + formatNum(10) + ' energy. ';
									attMonster._energy += 10;
									monsterResult += 'Energy at ' + formatNum(attMonster._energy) + '.</div>';
									if (numSims == 1) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + monsterResult + '</div>'; }
								}

							} else if (defMonster._monsterName != 'None') {
								monsterResult = '<div>' + defMonster.heroDesc() + ' gained ' + formatNum(10) + ' energy. ';
								defMonster._energy += 10;
								monsterResult += 'Energy at ' + formatNum(defMonster._energy) + '.</div>';
								if (numSims == 1) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + monsterResult + '</div>'; }
							}

							// check for Aida's Balance Mark debuffs
							if ('Balance Mark' in currentHero._debuffs) {
								const firstKey = Object.keys(currentHero._debuffs['Balance Mark'])[0];
								triggerQueue.push([currentHero._debuffs['Balance Mark'][firstKey]['source'], 'balanceMark', currentHero, currentHero._debuffs['Balance Mark'][firstKey]['effects']['attackAmount']]);
							}


							triggerQueue.push([currentHero, 'eventSelfActive', activeQueue]);

							for (const h of currentHero._allies) {
								if (currentHero !== h) {
									triggerQueue.push([h, 'eventAllyActive', currentHero, activeQueue]);
								}
							}

							for (const h of currentHero._enemies) {
								triggerQueue.push([h, 'eventEnemyActive', currentHero, activeQueue]);
							}


							// get energy after getting hit by active
							temp = '';
							for (var i = 0; i < activeQueue.length; i++) {
								if (activeQueue[i][1].alive) {
									if (activeQueue[i][2] > 0) {
										if (activeQueue[i][3] == true) {
											// double energy on being critted
											temp += activeQueue[i][1].getEnergy(activeQueue[i][1], 20);
										} else {
											temp += activeQueue[i][1].getEnergy(activeQueue[i][1], 10);
										}
									}
								}
							}
							if (numSims == 1) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + temp + '</div>'; }

						} else if ('Horrify' in currentHero._debuffs) {
							if (numSims == 1) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + currentHero.heroDesc() + ' is Horrified, basic attack skipped.</div>'; }

						} else {
							// do basic
							let result = currentHero.doBasic();
							if (numSims == 1) {
								result = '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + result + '</div>';
								oCombatLog.innerHTML += result;
							}

							// hero gains 50 energy after doing basic
							temp = currentHero.getEnergy(currentHero, 50);
							if (numSims == 1) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + temp + '</div>'; }


							triggerQueue.push([currentHero, 'eventSelfBasic', basicQueue]);

							for (const h of currentHero._allies) {
								if (currentHero !== h) {
									triggerQueue.push([h, 'eventAllyBasic', currentHero, basicQueue]);
								}
							}

							for (const h of currentHero._enemies) {
								triggerQueue.push([h, 'eventEnemyBasic', currentHero, basicQueue]);
							}

							// get energy after getting hit by basic
							temp = '';
							for (var i = 0; i < basicQueue.length; i++) {
								if (basicQueue[i][1].alive) {
									if (basicQueue[i][2] > 0) {
										if (basicQueue[i][3] == true) {
											// double energy on being critted
											temp += basicQueue[i][1].getEnergy(basicQueue[i][1], 20);
										} else {
											temp += basicQueue[i][1].getEnergy(basicQueue[i][1], 10);
										}
									}
								}
							}
							if (numSims == 1) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + temp + '</div>'; }
						}
					}


					// process triggers and events
					temp = processQueue();
					if (numSims == 1 && temp.length > 0) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'>' + temp + '</div>'; }
					someoneWon = checkForWin(attHeroes, defHeroes);
					if (someoneWon != '') { break; }

					logColor = (logColor + 1) % 2;
				}
			}

			if (someoneWon != '') { break; }

			// trigger end of round stuff
			if (numSims == 1) { oCombatLog.innerHTML += '<p class=\'logSeg log' + logColor + '\'>End of round ' + formatNum(roundNum) + '.</p>'; }
			logColor = (logColor + 1) % 2;


			// handle monster stuff
			if (attMonster._monsterName != 'None') {
				monsterResult = '<div>' + attMonster.heroDesc() + ' gained ' + formatNum(20) + ' energy. ';
				attMonster._energy += 20;
				monsterResult += 'Energy at ' + formatNum(attMonster._energy) + '.</div>';

				if (attMonster._energy >= 100) {
					monsterResult += attMonster.doActive();
				}

				if (numSims == 1) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + monsterResult + '</div>'; }
				logColor = (logColor + 1) % 2;
			}

			if (defMonster._monsterName != 'None') {
				monsterResult = '<div>' + defMonster.heroDesc() + ' gained ' + formatNum(20) + ' energy. ';
				defMonster._energy += 20;
				monsterResult += 'Energy at ' + formatNum(defMonster._energy) + '.</div>';

				if (defMonster._energy >= 100) {
					monsterResult += defMonster.doActive();
				}

				if (numSims == 1) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + monsterResult + '</div>'; }
				logColor = (logColor + 1) % 2;
			}

			temp = processQueue();
			if (numSims == 1 && temp.length > 0) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'>' + temp + '</div>'; }
			someoneWon = checkForWin(attHeroes, defHeroes);
			if (someoneWon != '') { break; }


			// handle end of round abilities
			if (roundNum < 127) {
				temp = '';

				for (const h of attHeroes) {
					if (h.alive) {
						temp += h.tickBuffs();
						temp += h.tickDebuffs();
					}
				}

				for (const h of defHeroes) {
					if (h.alive) {
						temp += h.tickBuffs();
						temp += h.tickDebuffs();
					}
				}


				for (const h of attHeroes) {
					if (h.alive && h.isNotSealed() || h._currentStats.revive == 1) {
						temp += h.endOfRound(roundNum);
					}


					if (h._artifact.includes(' Golden Crown') && roundNum < 5) {
						temp += h.removeBuff('Golden Crown');
						const buffAmount = artifacts[h._artifact].enhance * (5 - roundNum) * 0.2;
						temp += h.getBuff(h, 'Golden Crown', 5 - roundNum, { allDamageReduce: buffAmount });
					}


					if (h.alive && h.isNotSealed()) {
						temp += h.tickEnable3();


						if (h._artifact.includes(' Antlers Cane')) {
							temp += '<div>' + h.heroDesc() + ' gained increased damage from <span class=\'skill\'>' + h._artifact + '</span>.</div>';
							temp += h.getBuff(h, 'All Damage Dealt', 15, { allDamageDealt: artifacts[h._artifact]['enhance'] });
						}


						if (['Radiant Lucky Candy Bar', 'Splendid Lucky Candy Bar'].includes(h._artifact) && h.isUnderControl()) {
							temp += '<div><span class=\'skill\'>' + h._artifact + '</span> triggered.</div>';
							temp += h.getBuff(h, 'Hand of Fate', 1, { allDamageReduce: artifacts[h._artifact]['enhance'] }, true);
						}
					}
				}

				for (const h of defHeroes) {
					if ((h.alive && h.isNotSealed()) || h._currentStats.revive == 1) {
						temp += h.endOfRound(roundNum);
					}


					if (h._artifact.includes(' Golden Crown') && roundNum < 5) {
						temp += h.removeBuff('Golden Crown');
						const buffAmount = artifacts[h._artifact].enhance * (5 - roundNum) * 0.2;
						temp += h.getBuff(h, 'Golden Crown', 5 - roundNum, { allDamageReduce: buffAmount });
					}


					if (h.alive && h.isNotSealed()) {
						temp += h.tickEnable3();


						if (h._artifact.includes(' Antlers Cane')) {
							temp += '<div>' + h.heroDesc() + ' gained increased damage from <span class=\'skill\'>' + h._artifact + '</span>.</div>';
							temp += h.getBuff(h, 'All Damage Dealt', 15, { allDamageDealt: artifacts[h._artifact]['enhance'] });
						}


						if (['Radiant Lucky Candy Bar', 'Splendid Lucky Candy Bar'].includes(h._artifact) && h.isUnderControl()) {
							temp += '<div><span class=\'skill\'>' + h._artifact + '</span> triggered.</div>';
							temp += h.getBuff(h, 'Hand of Fate', 1, { allDamageReduce: artifacts[h._artifact]['enhance'] }, true);
						}
					}
				}


				if (numSims == 1 && temp.length > 0) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'><p></p></div><div class=\'log' + logColor + '\'>' + temp + '</div>'; }
				logColor = (logColor + 1) % 2;


				temp = processQueue();
				if (numSims == 1 && temp.length > 0) { oCombatLog.innerHTML += '<div class=\'log' + logColor + '\'>' + temp + '</div>'; }
				someoneWon = checkForWin(attHeroes, defHeroes);
				if (someoneWon != '') { break; }
			} else {
				break;
			}


			// @ end of round
			roundNum++;
		}

		if (someoneWon == 'att') {
			winCount++;
			if (numSims == 1) { oCombatLog.innerHTML += '<p class=\'logSeg\'>Attacker wins!</p>'; }
		} else if (numSims == 1) { oCombatLog.innerHTML += '<p class=\'logSeg\'>Defender wins!</p>'; }

		endingRoundSum += roundNum;


		for (const h of attHeroes) {
			if (h._heroName != 'None') {
				h._damageDealt += h._currentStats.damageDealt;
				h._currentStats.damageDealt = 0;
				h._damageHealed += h._currentStats.damageHealed;
				h._currentStats.damageHealed = 0;
			}
		}

		for (const h of defHeroes) {
			if (h._heroName != 'None') {
				h._damageDealt += h._currentStats.damageDealt;
				h._currentStats.damageDealt = 0;
				h._damageHealed += h._currentStats.damageHealed;
				h._currentStats.damageHealed = 0;
			}
		}

		if (numSims == 1) { oCombatLog.innerHTML += '<p class=\'logSeg\'>Simulation #' + formatNum(simIterNum) + ' Ended.</p>'; }

		// @ end of simulation
	}

	oCombatLog.innerHTML += '<p class=\'logSeg\'>Attacker won ' + winCount + ' out of ' + numSims + ' (' + formatNum((winCount / numSims * 100).toFixed(2)) + '%).</p>';
	oCombatLog.innerHTML += '<p class=\'logSeg\'>Average Combat Length: ' + formatNum((endingRoundSum / numSims).toFixed(2)) + ' rounds.</p>';

	// damage summary
	oCombatLog.innerHTML += '<p><div class=\'logSeg\'>Attacker average damage summary.</div>';
	for (var i = 0; i < attHeroes.length; i++) {
		if (attHeroes[i]._heroName != 'None') {
			oCombatLog.innerHTML += '<div><span class=\'att\'>' + attHeroes[i]._heroName + '</span>: ' + formatNum(Math.floor(attHeroes[i]._damageDealt / numSims)) + '</div>';
		}
	}
	if (attMonster._monsterName != 'None') {
		oCombatLog.innerHTML += '<div><span class=\'att\'>' + attMonster._monsterName + '</span>: ' + formatNum(Math.floor(attMonster._currentStats.damageDealt / numSims)) + '</div>';
	}
	oCombatLog.innerHTML += '</p>';

	oCombatLog.innerHTML += '<p><div class=\'logSeg\'>Defender average damage summary.</div>';
	for (var i = 0; i < defHeroes.length; i++) {
		if (defHeroes[i]._heroName != 'None') {
			oCombatLog.innerHTML += '<div><span class=\'def\'>' + defHeroes[i]._heroName + '</span>: ' + formatNum(Math.floor(defHeroes[i]._damageDealt / numSims)) + '</div>';
		}
	}
	if (defMonster._monsterName != 'None') {
		oCombatLog.innerHTML += '<div><span class=\'def\'>' + defMonster._monsterName + '</span>: ' + formatNum(Math.floor(defMonster._currentStats.damageDealt / numSims)) + '</div>';
	}
	oCombatLog.innerHTML += '</p>';

	// healing and damage prevention summary
	oCombatLog.innerHTML += '<p><div class=\'logSeg\'>Attacker average healing and damage prevention summary.</div>';
	for (var i = 0; i < attHeroes.length; i++) {
		if (attHeroes[i]._heroName != 'None') {
			oCombatLog.innerHTML += '<div><span class=\'att\'>' + attHeroes[i]._heroName + '</span>: ' + formatNum(Math.floor(attHeroes[i]._damageHealed / numSims)) + '</div>';
		}
	}
	if (attMonster._monsterName != 'None') {
		oCombatLog.innerHTML += '<div><span class=\'att\'>' + attMonster._monsterName + '</span>: ' + formatNum(Math.floor(attMonster._currentStats.damageHealed / numSims)) + '</div>';
	}
	oCombatLog.innerHTML += '</p>';

	oCombatLog.innerHTML += '<p><div class=\'logSeg\'>Defender average healing and damage prevention summary.</div>';
	for (var i = 0; i < defHeroes.length; i++) {
		if (defHeroes[i]._heroName != 'None') {
			oCombatLog.innerHTML += '<div><span class=\'def\'>' + defHeroes[i]._heroName + '</span>: ' + formatNum(Math.floor(defHeroes[i]._damageHealed / numSims)) + '</div>';
		}
	}
	if (defMonster._monsterName != 'None') {
		oCombatLog.innerHTML += '<div><span class=\'def\'>' + defMonster._monsterName + '</span>: ' + formatNum(Math.floor(defMonster._currentStats.damageHealed / numSims)) + '</div>';
	}
	oCombatLog.innerHTML += '</p>';

	oCombatLog.scrollTop = 0;

	return winCount;
}


// process all triggers and events
function processQueue() {
	let result = '';

	while (triggerQueue.length > 0) {
		const copyQueue = triggerQueue;
		triggerQueue = [];

		copyQueue.sort(function (a, b) {
			if (a[0]._attOrDef == 'att' && b[0]._attOrDef == 'def') {
				return -1;
			} else if (a[0]._attOrDef == 'def' && b[0]._attOrDef == 'att') {
				return 1;
			} else {
				return a[0]._heroPos - b[0]._heroPos;
			}
		});

		for (const i in copyQueue) {
			let temp = copyQueue[i][0].handleTrigger(copyQueue[i]);
			if (temp.length > 0) { result += '<div class=\'log' + logColor + '\'><p></p>' + temp + '</div>'; }


			// enhanced artifact triggers
			if (copyQueue[i][0].isNotSealed() && copyQueue[i][0].alive) {
				if (copyQueue[i][1] == 'eventGotCC' && ['Radiant Lucky Candy Bar', 'Splendid Lucky Candy Bar'].includes(copyQueue[i][0]._artifact)) {
					temp = copyQueue[i][0].getBuff(copyQueue[i][0], 'Hand of Fate', 1, { allDamageReduce: artifacts[copyQueue[i][0]._artifact]['enhance'] }, true);
					result += '<div class=\'log' + logColor + '\'><p></p>' + temp + '</div>';
				}


				if (['eventSelfBasic', 'eventSelfActive'].includes(copyQueue[i][1]) && copyQueue[i][0]._artifact.includes(' The Kiss of Ghost')) {
					let damageDone = 0;
					for (const e in copyQueue[i][2]) {
						damageDone += copyQueue[i][2][e][2];
					}

					const healAmount = copyQueue[i][0].calcHeal(copyQueue[i][0], artifacts[copyQueue[i][0]._artifact]['enhance'] * damageDone);
					temp = '<div><span class=\'skill\'>' + copyQueue[i][0]._artifact + '</span> triggered heal.</div>';
					temp += copyQueue[i][0].getHeal(copyQueue[i][0], healAmount);

					result += '<div class=\'log' + logColor + '\'><p></p>' + temp + '</div>';
				}


				if (copyQueue[i][1] == 'eventSelfActive' && copyQueue[i][0]._artifact.includes(' Demon Bell')) {
					const targets = getAllTargets(copyQueue[i][0], copyQueue[i][0]._allies);
					let energyGain = 10;
					temp = '<div><span class=\'skill\'>' + copyQueue[i][0]._artifact + '</span> triggered energy gain.</div>';

					if (copyQueue[i][0]._artifact == 'Splendid Demon Bell') energyGain += 10;

					if (random() < artifacts[copyQueue[i][0]._artifact]['enhance']) {
						energyGain += 10;
					}

					for (const t in targets) {
						temp += targets[t].getEnergy(copyQueue[t][0], energyGain);
					}

					result += '<div class=\'log' + logColor + '\'><p></p>' + temp + '</div>';
				}


				if (['eventSelfBasic', 'eventSelfActive'].includes(copyQueue[i][1]) && copyQueue[i][0]._artifact.includes(' Staff Punisher of Immortal')) {
					let damageResult = '';
					let didCrit = false;
					let damageAmount = 0;
					temp = '';

					for (const e in copyQueue[i][2]) {
						if (copyQueue[i][2][e][3] == true && copyQueue[i][2][e][1].alive) {
							didCrit = true;

							damageAmount = copyQueue[i][2][e][1]._stats.totalHP * 0.12;
							if (damageAmount > copyQueue[i][0]._currentStats['totalAttack'] * 25) { damageAmount = copyQueue[i][0]._currentStats['totalAttack'] * 25; }

							damageResult = copyQueue[i][0].calcDamage(copyQueue[i][2][e][1], damageAmount, 'passive', 'true');
							temp += copyQueue[i][2][e][1].takeDamage(copyQueue[i][0], copyQueue[i][0]._artifact, damageResult);
						}
					}

					if (didCrit) {
						temp = '<div><span class=\'skill\'>' + copyQueue[i][0]._artifact + '</span> triggered on crit.</div>' + temp;
						result += '<div class=\'log' + logColor + '\'><p></p>' + temp + '</div>';
					}
				}
			}
		}
	}

	return result;
}

{
	const isAlive = h => h.alive || h._currentStats.revive == 1 && h._heroName != 'Carrie';

	function checkForWin(attHeroes, defHeroes) {
		if (!attHeroes.some(isAlive)) return 'def';
		if (!defHeroes.some(isAlive)) return 'att';
		return '';
	}
}
