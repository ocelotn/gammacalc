
function stats(){
	this.str = 16;
	this.con = 11;
	this.dex = 9;
	this.intelligence = 15;
	this.wis = 12;
	this.cha = 18;
	
	this.setstats= function(){
		$('[name="str"]').val(this.str);
		$('[name="con"]').val(this.con);
		$('[name="dex"]').val(this.dex);
		$('[name="intelligence"]').val(this.intelligence);
		$('[name="wis"]').val(this.wis);
		$('[name="cha"]').val(this.cha);		
	}

	this.getStatsCold= function(){ 		
		this.str = $('[name="str"]').val();
		this.con = $('[name="con"]').val();
		this.dex = $('[name="dex"]').val();
		this.intelligence = $('[name="intelligence"]').val();
		this.wis = $('[name="wis"]');
		this.cha = $('[name="cha"]');
	}
	
 	this.getstats= function(){
		this.str = $('[name="str"]').val()?$('[name="str"]').val():this.str;
		this.con = $('[name="con"]').val()?$('[name="con"]').val():this.con;
		this.dex = $('[name="dex"]').val()?$('[name="dex"]').val():this.dex;
		this.intelligence = $('[name="intelligence"]').val()?$('[name="intelligence"]').val():this.intelligence;
		this.wis = $('[name="wis"]').val()?$('[name="wis"]').val():this.wis;
		this.cha = $('[name="cha"]').val()?$('[name="cha"]').val():this.cha;
	}
	
	this.statmod = function(statname){
		return Math.floor((statname/2)-5);
	}
}

//function getResults(mystats){
//	if (!mystats){mystats = new stats()};
function getResults(){
	mystats = new stats();
	var trouble = 0;
	var errormsg = "Additional Input Required!";
	
	//validate input
		$('.trouble').removeClass('trouble');

 		var missingText = $(':text[value=""]');
 		if ($(missingText).size() > 0){
 			//alert('Additional input required!');
 			$.each($(missingText),function(i,el){
 				$(el).addClass('trouble');
 				$(el).parent().siblings().addClass('trouble');
 			});
			trouble = 1;
			errormsg+="\nPlease enter all size stats.";
 		}
		else
		{
//			mystats.getStatsCold();
			mystats.getstats();
		}
	
	
		
	var intdex = Math.max(mystats.dex, mystats.intelligence);
	var strcon = Math.max(mystats.str, mystats.con);

	var speed = 7;//include +1 simian bonus
	var level = 2;
	var handsfree = 2;

	var ac = 10 + mystats.statmod(intdex);
	var attackbonus=0;
	var damagebonus=0;
	
	//get raw data and clear the decks
   $('#results').empty();
    
    //get level
    level = Number($('input[name="level"]')[0].value);
	ac+= level;
		
	//Get Armor Effects on AC and Movement
	var weight = $('[name="armor"] option:selected').val();
	if (weight == 'heavy'){
		speed--;
		ac+=7;
		ac-= mystats.statmod(intdex);
	} else if (weight == 'light'){
		ac+=3;
	}
/*
	if($(':checkbox:checked').size() < 1){
		trouble =1; 
		$(':checkbox').parent().addClass('trouble');
		errormsg+="\nYou need something to keep the sun off during your siesta.  Take a hat and/or a shield!";
	}
*/
	if($('input[name="shield"]:checked').size() >0){
		ac+=1; 
		handsfree--;
	}
	
	//Checking Hands Free for Armor + Weapon
	handsfree -= Number($('[name="hands"] option:selected').val());
	if (handsfree <0){alert('Not enough hands\n'); return;}
	
	//Checking Weapon Type for attack and damage
	var weapons = [
		{weight:'lightw',wtype:'melee',hands:'1',accuracy:3,damage:'1d8',range:1,keystat : intdex},
		{weight:'lightw',wtype:'melee',hands:'2',accuracy:3,damage:'1d12',range:1,keystat : intdex},
		{weight:'heavyw',wtype:'melee',hands:'1',accuracy:2,damage:'1d10',range:1,keystat : strcon},
		{weight:'heavyw',wtype:'melee',hands:'2',accuracy:2,damage:'2d8',range:1,keystat : strcon},
		{weight:'lightw',wtype:'ranged',hands:'1',accuracy:3,damage:'1d8',range:5,keystat : intdex},
		{weight:'lightw',wtype:'ranged',hands:'2',accuracy:3,damage:'1d12',range:10,keystat : intdex},
		{weight:'heavyw',wtype:'ranged',hands:'1',accuracy:2,damage:'1d10',range:5,keystat : strcon},
		{weight:'heavyw',wtype:'ranged',hands:'2',accuracy:2,damage:'2d8',range:10,keystat : strcon},
		{weight:'lightw',wtype:'gun',hands:'1',accuracy:4,damage:'1d8',range:10,keystat : intdex},
		{weight:'lightw',wtype:'gun',hands:'2',accuracy:4,damage:'1d12',range:20,keystat : intdex},
		{weight:'heavyw',wtype:'gun',hands:'1',accuracy:2,damage:'2d6',range:10,keystat : strcon},
		{weight:'heavyw',wtype:'gun',hands:'2',accuracy:2,damage:'2d10',range:20,keystat : strcon}
	];	

	var weapon;
	if ($('[name="wweight"] option:selected').val()){
	
	jQuery.each(weapons,function(index,el){		
			if (
			$('[name="wweight"] option:selected').val() == el.weight
			&& $('[name="hands"] option:selected').val() == el.hands 
			&& $('[name="wtype"] option:selected').val() == el.wtype
			){
				weapon = el;
				return false;
			}
		});
	if (! weapon) {alert("No matching weapon!");}



//IMPORT

	var comments = '';
	var combatadvantage = false;
	var combatdisadvantage = false;
	
	var flanking = ($('input[name="flanking"]:checked').val())?true:false;
	var adjacent = $('input[name="adjacent"]:checked').val()?true:false;
	var oprone = $('input[name="oprone"]:checked').val()?true:false;
	var uprone = $('input[name="uprone"]:checked').val()?true:false;
	var oblood = $('input[name="oblood"]:checked').val()?true:false;

//Combat advantage => +2 to attacks
//Obtain by:
//2nd attack after ape rage
//flanking (one on opposite sides) each able to see and attack with a melee, ranged or unarmed attack
//blind, dazed, prone (in melee), helpless, restrained, stunned, surprised grant combat advantage

	if (flanking) {combatadvantage = true;}
	if (oprone){
		if (weapon.wtype=="melee"){combatadvantage = true;}
		else if (adjacent !=true){combatdisadvantage = true;}
	}
	if (uprone){combatdisadvantage = true;}
	if ((flanking || adjacent) && (weapon.wtype!='melee' || power == 'psiassault')){comments += 'Ranged attack while adjacent invites attack of opportunity.<br/>';}
	if ($('input[name="advantage"]:checked').val()){combatadvantage = true;}


	var advantage= combatadvantage?2:0;
	var disadvantage= combatdisadvantage?-2:0;
	var bonuscalc = advantage + disadvantage;
	if ($('input[name="run"]:checked').val()){bonuscalc-=5;}
	
	var power = $('input[name="power"]:checked').val();
	if (!power){
		errormsg+='\nPlease select an origin power!'; 
		$('[name="power"]').parent().addClass('trouble');
		trouble=1;
	}
	
	if(power == 'rage'){	
		bonuscalc += level + mystats.statmod(mystats.str) + weapon.accuracy;
		attackbonus= '(1d20) + '+ bonuscalc;
		attackbonus+= " (+2 vs same opp next turn)"
		damagebonus= weapon.damage+" + 1d6 + " + (level + mystats.statmod(mystats.str));
		comments+= 'Attack is standard action. You still have move and swift.'
	} 
	else if (power == 'leap'){
		if (uprone){trouble=1; errormsg += "\nHow could you leap from prone?\n";}
		bonuscalc += (level + mystats.statmod(weapon.keystat) + weapon.accuracy + 5);
		attackbonus= '(1d20) + '+ bonuscalc;
		damagebonus= (5+ level + mystats.statmod(weapon.keystat))+' + '+ weapon.damage;
		comments+= 'Leap requires athletics check. Subtract 5 from damage on fail, standard combat advantage rules.<br/> Leap+attack is move + standard action. You still have swift.'
	}
	else if (power == 'leaprage'){
		if (uprone){trouble=1; errormsg += "\nHow could you leap from prone?\n";}
		bonuscalc += (level + mystats.statmod(mystats.str) + weapon.accuracy + 5);
		attackbonus= '(1d20) + '+ bonuscalc;
		attackbonus+= " (+2 power bonus vs same opp next turn + combat advantage (2 to attack) vs adjacent opponents next turn)"
		damagebonus= weapon.damage+" + 1d6 + " + (5+ level + mystats.statmod(mystats.str));
		comments+= 'Leap requires athletics check. Subtract 5 from damage on fail, standard combat advantage rules.<br/> Leap+attack is move + standard action. You still have swift.'
	}
	else if (power == 'psiassault'){
		bonuscalc += (level + mystats.statmod(mystats.cha));
		attackbonus =  '(1d20) + '+  bonuscalc + ' vs Will';
		damagebonus = '1d10 + ' + (mystats.statmod(mystats.cha) + (2*level)) + ' psi damage';
		comments+= ' Attack is standard action. You still have move and swift.'
	}
	else {
		bonuscalc += (level + mystats.statmod(weapon.keystat) + weapon.accuracy);
		attackbonus= '(1d20) + '+ bonuscalc;
		damagebonus= (level + mystats.statmod(weapon.keystat))+' + '+ weapon.damage;
	}
	
	} else 
	{
		trouble =1;
		errormsg+="\nPlease choose the weapon weight you're using.";
		$('[name="wweight"]').children().addClass('trouble');
	}


	if (oblood) {damagebonus += "+2";}


//And print it out
	
	if(trouble){alert(errormsg); return;}
	//tablegen
	var t = $('#results');
	var tb = elementor('tbody',t);
	var tr = elementor('tr',tb);
	var td = elementor('td',tr,'AC');
		td = elementor('td',tr,ac);
	tr = elementor('tr',tb);
		td = elementor('td',tr,'Speed');
		td = elementor('td',tr,speed);
	tr = elementor('tr',tb);
		td = elementor('td',tr,'Attack');
		td = elementor('td',tr,attackbonus);
	tr = elementor('tr',tb);
		td = elementor('td',tr,'Damage');
		td = elementor('td',tr,damagebonus);
	tr = elementor('tr',tb);
		td = elementor('td',tr,'Range');
		td = elementor('td',tr,weapon.range);
	tr = elementor('tr',tb);
		td = elementor('td',tr,'Comments');
		td = elementor('td',tr,comments);
}

function elementor(eltype, elroot, elval){
	var el = document.createElement(eltype);
	if (elval){$(el).html(elval);}
	$(elroot).append(el);
	return el;
}


function formreset(){
	$('table#results').empty();
	var x = document.getElementById('result');
	if (x != null){document.getElementById('homework').removeChild(x);}
	document.getElementById('inputs').reset();
}

function setup(){

	$('input:text').focus(
		function(){this.select();}
	);

	$('form').submit(
		function(s){
			s.preventDefault();
	});

	$(':submit').click(function(s){	
			getResults(s);
		}
	);
	
	$(':reset').click(function(r){
			r.preventDefault();
			var answer = confirm('Do you actually want to reset this form?');
			if (answer){formreset();}
	});
}

$(
	function(){
		setup();
	}
)

