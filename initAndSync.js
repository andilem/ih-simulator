var attHeroes = [new hero("None")];
var defHeroes = [];
  
  
function initialize() {
  addOptions(baseHeroStats, "Name");
  addOptions(weapons, "Weapon");
  addOptions(accessories, "Accessory");
  addOptions(armors, "Armor");
  addOptions(shoes, "Shoe");
  addOptions(stones, "Stone");
  addOptions(artifacts, "Artifact");
  
  loadConfig();
}


function addOptions(dictItems, strPostfix) {
  var option;
  
  for(var x in dictItems) {
    option = document.createElement("option");
    option.text = x;
    
    for(i=0; i<attHeroes.length; i++) {
      document.getElementById("attHero" + i + strPostfix).add(option);
    }
  }
}


function changeHero(heroPos, prefix) {
  var arrToUse = [];
  
  if (prefix == "att") {
    arrToUse = attHeroes;
  } else {
    arrToUse = defHeroes;
  }
  
  var pHeroName = arrToUse[heroPos]._heroName;
  var cHeroName = document.getElementById(prefix + "Hero" + heroPos + "Name").value;
  var cHeroSheet = document.getElementById(prefix + "Hero" + heroPos + "Sheet");
  var cHeroSkins = document.getElementById(prefix + "Hero" + heroPos + "Skin");
  
  console.log("Change Hero " + heroPos + ": " + pHeroName + " to " + cHeroName);
  
  cHeroSkins.value = "None";
  var skinLen = cHeroSkins.options.length - 1;
  for (var i = skinLen; i > 0; i--){
    cHeroSkins.remove(i);
  }
  
  if(cHeroName == "None") {
    arrToUse[heroPos] = new hero("None", heroPos);
    cHeroSheet.innerHTML = "";
  } else {
    arrToUse[heroPos] = new baseHeroStats[cHeroName]["className"](cHeroName, heroPos);
    updateHero(heroPos, prefix);
    
    if ([cHeroName] in skins) {
      var option;
      for(var x in skins[cHeroName]) {
        option = document.createElement("option");
        option.text = x;
        cHeroSkins.add(option);
      }
    }
  }
}


function updateHero(heroPos, prefix) {
  var cHeroName = document.getElementById(prefix + "Hero" + heroPos + "Name").value;
  var cHeroSheet = document.getElementById(prefix + "Hero" + heroPos + "Sheet");
  var arrToUse = [];
  
  console.log("updateHero " + heroPos + ": " + cHeroName);
  
  if (prefix == "att") {
    arrToUse = attHeroes;
  } else {
    arrToUse = defHeroes;
  }
  
  if (cHeroName != "None") {
    arrToUse[heroPos]._weapon = document.getElementById(prefix + "Hero" + heroPos + "Weapon").value;
    arrToUse[heroPos]._accessory = document.getElementById(prefix + "Hero" + heroPos + "Accessory").value;
    arrToUse[heroPos]._armor = document.getElementById(prefix + "Hero" + heroPos + "Armor").value;
    arrToUse[heroPos]._shoe = document.getElementById(prefix + "Hero" + heroPos + "Shoe").value;
    arrToUse[heroPos]._stone = document.getElementById(prefix + "Hero" + heroPos + "Stone").value;
    arrToUse[heroPos]._artifact = document.getElementById(prefix + "Hero" + heroPos + "Artifact").value;
    arrToUse[heroPos]._skin = document.getElementById(prefix + "Hero" + heroPos + "Skin").value;
    
    arrToUse[heroPos]._enable1 = document.getElementById(prefix + "Hero" + heroPos + "Enable1").value;
    arrToUse[heroPos]._enable2 = document.getElementById(prefix + "Hero" + heroPos + "Enable2").value;
    arrToUse[heroPos]._enable3 = document.getElementById(prefix + "Hero" + heroPos + "Enable3").value;
    arrToUse[heroPos]._enable4 = document.getElementById(prefix + "Hero" + heroPos + "Enable4").value;
    arrToUse[heroPos]._enable5 = document.getElementById(prefix + "Hero" + heroPos + "Enable5").value;
    
    arrToUse[heroPos].updateCurrentStats();
    cHeroSheet.innerHTML = arrToUse[heroPos].getHeroSheet();
  }
}


function updateAttackers() {
  for (var i = 0; i < attHeroes.length; i++) {
    updateHero(i, "att");
  }
}


function updateDefenders() {
  for (var i = 0; i < defHeroes.length; i++) {
    updateHero(i, "def");
  }
}


function createConfig() {
  var oConfig = document.getElementById("configText");
  oConfig.value = "{\n";
  
  var arrInputs = document.getElementsByTagName("SELECT");
  for (var e = 0; e < arrInputs.length; e++) {
    elem = arrInputs[e];
    
    if ("id" in elem) {
      if (elem.id.substring(0, 3) == "att" || elem.id.substring(0, 3) == "def") {
        oConfig.value += "\t\"" + elem.id + "\": \"" + elem.value + "\",\n";
      }
    }
  }
  
  var arrInputs = document.getElementsByTagName("INPUT");
  for (var e = 0; e < arrInputs.length; e++) {
    elem = arrInputs[e];
    
    if ("id" in elem) {
      if (elem.id.substring(0, 3) == "att" || elem.id.substring(0, 3) == "def") {
        if (e == arrInputs.length - 1) {
          oConfig.value += "\t\"" + elem.id + "\": \"" + elem.value + "\"\n";
        } else {
          oConfig.value += "\t\"" + elem.id + "\": \"" + elem.value + "\",\n";
        }
      }
    }
  }
  
  oConfig.value += "}\n";
}


function loadConfig() {
  var oConfig = document.getElementById("configText");
  var jsonConfig = JSON.parse(oConfig.value);
  
  for (var x in jsonConfig) {
    document.getElementById(x).value = jsonConfig[x];
  }
  
  for (var i = 0; i < attHeroes.length; i++) {
    changeHero(i, "att");
  }
  
  for (var i = 0; i < defHeroes.length; i++) {
    changeHero(i, "def");
  }
}