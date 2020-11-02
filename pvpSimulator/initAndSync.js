const attTeam = {
	heroes: [],
	monster: null,
	tech: {},
	frame: null,
	statues: {}
}
const attHeroes = attTeam.heroes;

const defTeam = {
	heroes: [],
	monster: null,
	tech: {},
	frame: null,
	statues: {}
}
const defHeroes = defTeam.heroes;

for (let i = 0; i < 6; i++) {
	attHeroes[i] = new hero('None', i, 'att', attTeam, defTeam);
	defHeroes[i] = new hero('None', i, 'def', defTeam, attTeam);
}

const lsPrefix = 'pvp_';


function initialize() {
	// layout stuff
	var acc = document.getElementsByClassName('colorA');
	for (var i = 0; i < acc.length; i++) {
		acc[i].addEventListener('click', function () {
			/* Toggle between adding and removing the "active" class,
	  to highlight the button that controls the panel */
			this.classList.toggle('activeA');

			/* Toggle between hiding and showing the active panel */
			const panel = this.nextElementSibling;
			if (panel.style.maxHeight) {
				panel.style.maxHeight = null;
			} else {
				panel.style.maxHeight = panel.scrollHeight + 'px';
			}
		});
	}

	var acc = document.getElementsByClassName('colorB');
	for (var i = 0; i < acc.length; i++) {
		acc[i].addEventListener('click', function () {
			this.classList.toggle('activeB');

			const panel = this.nextElementSibling;
			if (panel.style.maxHeight) {
				panel.style.maxHeight = null;
			} else {
				panel.style.maxHeight = panel.scrollHeight + 'px';
			}
		});
	}

	var acc = document.getElementsByClassName('colorC');
	for (var i = 0; i < acc.length; i++) {
		acc[i].addEventListener('click', function () {
			this.classList.toggle('activeC');

			const panel = this.nextElementSibling;
			if (panel.style.maxHeight) {
				panel.style.maxHeight = null;
			} else {
				panel.style.maxHeight = panel.scrollHeight + 'px';
			}
		});
	}

	// When the user scrolls down 20px from the top of the document, show the button
	window.onscroll = function () {
		if (document.body.scrollTop > 600 || document.documentElement.scrollTop > 600) {
			document.getElementById('topButton').style.display = 'block';
		} else {
			document.getElementById('topButton').style.display = 'none';
		}
	};


	// populate options
	addOptions(baseHeroStats, 'Name');
	addOptions(weapons, 'Weapon');
	addOptions(accessories, 'Accessory');
	addOptions(armors, 'Armor');
	addOptions(shoes, 'Shoe');
	addOptions(stones, 'Stone');
	addOptions(artifacts, 'Artifact');

	let option;

	for (var x in avatarFrames) {
		option = document.createElement('option');
		option.text = x;
		document.getElementById('attAvatarFrame').add(option);

		option = document.createElement('option');
		option.text = x;
		document.getElementById('defAvatarFrame').add(option);
	}

	for (var x in baseMonsterStats) {
		option = document.createElement('option');
		option.text = x;
		document.getElementById('attMonster').add(option);

		option = document.createElement('option');
		option.text = x;
		document.getElementById('defMonster').add(option);
	}

	// check local storage
	if (typeof (Storage) !== 'undefined') {
		if (localStorage.getItem(lsPrefix + 'numSims') !== null) {
			document.getElementById('numSims').value = localStorage.getItem(lsPrefix + 'numSims');
			document.getElementById('configText').value = localStorage.getItem(lsPrefix + 'configText');
		} else {
			localStorage.setItem(lsPrefix + 'numSims', document.getElementById('numSims').value);
			localStorage.setItem(lsPrefix + 'configText', document.getElementById('configText').value);
		}
	}


	// load default configuration
	loadConfig();
	runSim();
}


function storeLocal(i) {
	if (typeof (Storage) !== 'undefined') {
		localStorage.setItem(lsPrefix + i.id, i.value);
	}
}


function swapAttDef() {
	createConfig();

	const oConfig = document.getElementById('configText');
	let configString = oConfig.value;

	configString = configString.replace(/\"att/g, '@@@');
	configString = configString.replace(/\"def/g, '"att');
	configString = configString.replace(/@@@/g, '"def');

	oConfig.value = configString;

	if (typeof (Storage) !== 'undefined') {
		localStorage.setItem(lsPrefix + 'configText', document.getElementById('configText').value);
	}

	loadConfig();
	createConfig();
}


function swapHero() {
	const heroA = document.getElementById('heroA').value;
	const heroB = document.getElementById('heroB').value;

	if (heroA != heroB) {
		createConfig();

		const oConfig = document.getElementById('configText');
		let configString = oConfig.value;
		const reA = new RegExp(heroA, 'g');
		const reB = new RegExp(heroB, 'g');

		configString = configString.replace(reA, '@@@');
		configString = configString.replace(reB, heroA);
		configString = configString.replace(/@@@/g, heroB);

		oConfig.value = configString;

		if (typeof (Storage) !== 'undefined') {
			localStorage.setItem(lsPrefix + 'configText', document.getElementById('configText').value);
		}

		loadConfig();
		createConfig();
	}
}


function copyHero() {
	const heroA = document.getElementById('heroA').value;
	const heroB = document.getElementById('heroB').value;

	if (heroA != heroB) {
		createConfig();

		const oConfig = document.getElementById('configText');
		const jsonConfig = JSON.parse(oConfig.value);

		for (x in jsonConfig) {
			if (x.substring(0, 8) == heroA) {
				jsonConfig[heroB + x.substring(8)] = jsonConfig[x];
			}
		}

		oConfig.value = JSON.stringify(jsonConfig);

		if (typeof (Storage) !== 'undefined') {
			localStorage.setItem(lsPrefix + 'configText', document.getElementById('configText').value);
		}

		loadConfig();
		createConfig();
	}
}


// When the user clicks on the button, scroll to the top of the document
function topFunction() {
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}


function addOptions(dictItems, strPostfix) {
	let option;

	for (const x in dictItems) {
		for (i = 0; i < attHeroes.length; i++) {
			option = document.createElement('option');
			option.text = x;
			document.getElementById('attHero' + i + strPostfix).add(option);
		}

		for (i = 0; i < defHeroes.length; i++) {
			option = document.createElement('option');
			option.text = x;
			document.getElementById('defHero' + i + strPostfix).add(option);
		}
	}
}


function changeHero(heroPos, prefix, skipUpdates = false) {
	const myTeam = prefix == 'att' ? attTeam : defTeam;
	const otherTeam = prefix == 'att' ? defTeam : attTeam;
	const arrToUse = myTeam.heroes;

	const pHeroName = arrToUse[heroPos]._heroName;
	const cHeroName = document.getElementById(prefix + 'Hero' + heroPos + 'Name').value;
	const cHeroSheet = document.getElementById(prefix + 'Hero' + heroPos + 'Sheet');
	const cHeroSkins = document.getElementById(prefix + 'Hero' + heroPos + 'Skin');

	if (cHeroName == pHeroName) {
		// no change, do nothing
	} else {
		console.log('Change Hero ' + heroPos + ': ' + pHeroName + ' to ' + cHeroName);

		cHeroSkins.value = 'None';
		const skinLen = cHeroSkins.options.length - 1;
		for (let i = skinLen; i > 0; i--) {
			cHeroSkins.remove(i);
		}

		if (cHeroName == 'None') {
			arrToUse[heroPos] = new hero('None', heroPos, prefix, myTeam, otherTeam);
			cHeroSheet.innerHTML = '';
		} else {
			arrToUse[heroPos] = new baseHeroStats[cHeroName]['className'](cHeroName, heroPos, prefix, myTeam, otherTeam);

			if (cHeroName in skins) {
				for (const x in skins[cHeroName]) {
					const option = document.createElement('option');
					option.text = x;
					cHeroSkins.add(option);
				}
			}
		}

		if (!skipUpdates) {
			updateTeam(prefix);
		}
	}
}


function updateHero(heroPos, prefix) {
	const cHeroName = document.getElementById(prefix + 'Hero' + heroPos + 'Name').value;

	if (cHeroName != 'None') {
		console.log('updateHero ' + heroPos + ': ' + cHeroName);

		const arrToUse = prefix == 'att' ? attHeroes : defHeroes;

		arrToUse[heroPos]._heroLevel = document.getElementById(prefix + 'Hero' + heroPos + 'Level').value;

		arrToUse[heroPos]._weapon = document.getElementById(prefix + 'Hero' + heroPos + 'Weapon').value;
		arrToUse[heroPos]._accessory = document.getElementById(prefix + 'Hero' + heroPos + 'Accessory').value;
		arrToUse[heroPos]._armor = document.getElementById(prefix + 'Hero' + heroPos + 'Armor').value;
		arrToUse[heroPos]._shoe = document.getElementById(prefix + 'Hero' + heroPos + 'Shoe').value;
		arrToUse[heroPos]._stone = document.getElementById(prefix + 'Hero' + heroPos + 'Stone').value;
		arrToUse[heroPos]._artifact = document.getElementById(prefix + 'Hero' + heroPos + 'Artifact').value;
		arrToUse[heroPos]._skin = document.getElementById(prefix + 'Hero' + heroPos + 'Skin').value;

		arrToUse[heroPos]._enable1 = document.getElementById(prefix + 'Hero' + heroPos + 'Enable1').value;
		arrToUse[heroPos]._enable2 = document.getElementById(prefix + 'Hero' + heroPos + 'Enable2').value;
		arrToUse[heroPos]._enable3 = document.getElementById(prefix + 'Hero' + heroPos + 'Enable3').value;
		arrToUse[heroPos]._enable4 = document.getElementById(prefix + 'Hero' + heroPos + 'Enable4').value;
		arrToUse[heroPos]._enable5 = document.getElementById(prefix + 'Hero' + heroPos + 'Enable5').value;

		arrToUse[heroPos].updateCurrentStats();
		const cHeroSheet = document.getElementById(prefix + 'Hero' + heroPos + 'Sheet');
		cHeroSheet.innerHTML = arrToUse[heroPos].getHeroSheet();
	}
}


function updateTeam(prefix) {
	const myTeam = prefix == 'att' ? attTeam : defTeam;
	const otherTeam = prefix == 'att' ? defTeam : attTeam;

	const monsterName = document.getElementById(prefix + 'Monster').value;
	myTeam.monster = new baseMonsterStats[monsterName]['className'](monsterName, prefix, myTeam, otherTeam);

	for (const cls in guildTech) {
		myTeam.tech[cls] = {};
		for (const name in guildTech[cls]) {
			myTeam.tech[cls][name] = document.getElementById(prefix + 'Tech' + cls + name).value;
		}
	}

	myTeam.frame = avatarFrames[document.getElementById(prefix + 'AvatarFrame').value];

	for (const type of ['Holy', 'Evil']) {
		myTeam.statues[type] = {};
		for (const name of ['speed', 'hpPercent', 'attackPercent']) {
			myTeam.statues[type][name] = document.getElementById(prefix + type + name).value;
		}
	}

	for (let i = 0; i < myTeam.heroes.length; i++) {
		updateHero(i, prefix);
	}
}


function updateAttackers() {
	updateTeam('att');
}


function updateDefenders() {
	updateTeam('def');
}


function createConfig() {
	const oConfig = document.getElementById('configText');
	oConfig.value = '{\n';

	var arrInputs = document.getElementsByTagName('INPUT');
	for (var e = 0; e < arrInputs.length; e++) {
		elem = arrInputs[e];

		if ('id' in elem) {
			if (elem.id.substring(0, 3) == 'att' || elem.id.substring(0, 3) == 'def') {
				oConfig.value += '\t"' + elem.id + '": "' + elem.value + '",\n';
			}
		}
	}

	var arrInputs = document.getElementsByTagName('SELECT');
	for (var e = 0; e < arrInputs.length; e++) {
		elem = arrInputs[e];

		if ('id' in elem) {
			if (elem.id.substring(0, 3) == 'att' || elem.id.substring(0, 3) == 'def') {
				if (e == arrInputs.length - 1) {
					oConfig.value += '\t"' + elem.id + '": "' + elem.value + '"\n';
				} else {
					oConfig.value += '\t"' + elem.id + '": "' + elem.value + '",\n';
				}
			}
		}
	}

	oConfig.value += '}';

	if (typeof (Storage) !== 'undefined') {
		localStorage.setItem(lsPrefix + 'configText', document.getElementById('configText').value);
	}

	oConfig.select();
	oConfig.setSelectionRange(0, oConfig.value.length);
	document.execCommand('copy');
}


function loadConfig() {
	const oConfig = document.getElementById('configText');
	const jsonConfig = JSON.parse(oConfig.value);

	for (const x in jsonConfig) {
		if (document.getElementById(x) !== null) {
			document.getElementById(x).value = jsonConfig[x];
		}

		if (x.substring(x.length - 4, x.length) == 'Name') {
			changeHero(x.substring(7, 8), x.substring(0, 3), true);
		}
	}

	updateAttackers();
	updateDefenders();
}


function genSeed() {
	document.getElementById('domSeed').value = new Date().valueOf().toString();
}