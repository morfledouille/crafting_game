
Game = {};
function l(what) {return document.getElementById(what);}



function AddEvent(html_element, event_name, event_function) 
{       
   if(html_element.attachEvent) //Internet Explorer
      html_element.attachEvent("on" + event_name, function() {event_function.call(html_element);}); 
   else if(html_element.addEventListener) //Firefox & company
      html_element.addEventListener(event_name, event_function, false); //don't need the 'call' trick because in FF everything already works in the right way          
}

//Beautify and number-formatting adapted from the Frozen Cookies add-on (http://cookieclicker.wikia.com/wiki/Frozen_Cookies_%28JavaScript_Add-on%29)

function formatEveryThirdPower(notations)
{
	return function (value)
	{
		var base = 0,
		tofix=0,		//tofix ensures that numbers above a million keep a fixed 4 digits value
		notationValue = '';
		if (value >= 1000000 && isFinite(value))
		{
			value /= 1000;
			tofix=3;
			while(Math.round(value) >= 1000)
			{
				value /= 1000;
				base++;
			}
			if (value>=10) tofix=2;
			if (value>=100) tofix=1;
			if (base>=notations.length) {return 'Infinity';} else {notationValue = notations[base];}
		}
		return ( Math.round(value * 1000) / 1000 ).toFixed(tofix) + notationValue;
	};
}

function rawFormatter(value) {return Math.round(value * 1000) / 1000;}

var numberFormatters =
[
	rawFormatter,
	formatEveryThirdPower([
		'',
		' million',
		' billion',
		' trillion',
		' quadrillion',
		' quintillion',
		' sextillion',
		' septillion',
		' octillion',
		' nonillion',
		' decillion',
		' undecillion',
		' duodecillion',
		' tredecillion',
		' tredecillion',
		' guattuordecillion',
		' quindecillion',
		' sexdecillion',
		' septendecillion',
		' octodecillion',
		' novemdecillion',
		' vigintillion'
	]),
	formatEveryThirdPower([
		'',
		' M',
		' B',
		' T',
		' Qa',
		' Qi',
		' Sx',
		' Sp',
		' Oc',
		' No',
		' Dc',
		' UDc',
		' DDc',
		' TDc',
		' QaDc',
		' QiDc',
		' SxDc',
		' SpDc',
		' OcDc',
		' NoDc',
		' Vg'
	])
];

function Beautify(value,floats)
{
	var negative=(value<0);
	var decimal='';
	if (value<1000 && floats>0) {decimal='.'+(value.toFixed(floats).toString()).split('.')[1]; //1000000 to 1000
	while(decimal.slice(-1) == '0' || decimal.slice(-1) == '.') { //no more pesky .00
		decimal=decimal.slice(0, -1);
	}
	}
	value=Math.floor(Math.abs(value)); //turn floor into round, hope it won't break anything, ovisouly it did since i changed it back, how??
	//else value=Math.round(Math.abs(value)); //round causes problem for value <1, floor causes problems for values like 19.999999998, so this is my fantastic solution
	var formatter=numberFormatters[1];
	var output=formatter(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
	//var output=formatter(value).toString();
	return negative?'-'+output:output+decimal;
}

function Redify(priceobj)
{
	price = Beautify(priceobj.val);
	if ($.isArray(priceobj.item.amount))
	{
		if (priceobj.item.amount[priceobj.qual] < priceobj.val) price = price.fontcolor("red");
	}
	else
	{
		if (priceobj.item.amount < priceobj.val) price = price.fontcolor("red");
	}
	return price;
}

Game.Init = function(){

	Game.GlobalMultiplier = 1;

	Game.priceIncrease = 1.1;

	
	Game.WreckingBonus=0;

	
	Game.recalculateGains=1;

	
	Game.SaveTo='testtest';
	
	Game.CraftsInProgress = [];
	Game.AdvInStore = [];
	
	Game.ItemTypes=["sword","dagger","axe"];
	Game.PriceQArr = [1,1.5,2,4,8]
	
	Game.onCraftMenu = "sword";
	
	//latency stuff
	Game.fps=10;
	Game.T=0;
	Game.accumulatedDelay=0;
	Game.time= Date.now();
	
	Game.lastDate=parseInt(Date.now());			//date at save time, used for offline progression
	Game.startDate=parseInt(Date.now());		//date since the start of the game
	Game.resetDate=parseInt(Date.now());		//date since last reset
	Game.bonusDate=parseInt(Date.now());		//date used for offline bonus card
	
	
	//Game.Canvas = document.getElementById("display"); //create a canvas element

	//Game.Canvas.Context = Game.Canvas.getContext('2d');

	
	
	Game.BuildMenu=function(){
		var str = '';
		str+= '<button class="inline" id="menu_generators">generators</button>';
		str+= '<button class="inline" id="menu_city">city</button>';
		str+= '<button class="inline" id="menu_craft">craft</button>';
		str+= '<button class="inline" id="menu_research">research</button>';
		str+= '<button class="inline" id="menu_stats">stats</button>';
		str+= '<button class="inline" id="menu_adv">adventurers</button>';

		$('#Menu').html(str);
		AddEvent(l('menu_generators'),'click',function(){Game.ShowMenu('generators');});
		AddEvent(l('menu_city'),'click',function(){Game.ShowMenu('city');});
		AddEvent(l('menu_craft'),'click',function(){Game.ShowMenu('craft');});
		AddEvent(l('menu_research'),'click',function(){Game.ShowMenu('research');});
		AddEvent(l('menu_stats'),'click',function(){Game.ShowMenu('stats');});
		AddEvent(l('menu_adv'),'click',function(){Game.ShowMenu('adv');});



	}


	Game.onMenu='city';
	Game.ShowMenu=function(what)
		{
			if (!what || what=='') what=Game.onMenu;
			//if (Game.onMenu=='' && what!='') Game.addClass('onMenu');
			//else if (Game.onMenu!='' && what!=Game.onMenu) Game.addClass('onMenu');
			//else if (what==Game.onMenu) {Game.removeClass('onMenu');what='';}
			//if (what=='log') l('donateBox').className='on'; else l('donateBox').className='';
			Game.onMenu=what;
			Game.UpdateMenu();
		}
		
	Game.ShowCraftMenu=function(what)
		{
			if (!what || what=='') what=Game.onCraftMenu;
			Game.onCraftMenu=what;
			Game.UpdateMenu();
		}	
	
	Game.UpdateMenu=function(){
		var str = '';
		if (Game.onMenu=='generators') 
		{
			
			str+='<hr><div  class="section">Generators</div><hr>';
			str += '<table>';
			for (var i in Game.GeneratorsById) {
				var me = Game.GeneratorsById[i];
				if (i%3 == 0)
				{
					str += '<tr><th colspan="3" class="Generator_Header"> TOTO le CHAMEAU </th></tr>';
					str += '<tr class="Generator_Line">';
				}
				str+= '<td class="Generator_Case" id="Generator_Case_'+me.id+'" onclick="Game.GeneratorsById['+me.id+'].Select()">'+me.name+'</td>';
				if (i%3 == 2)
				{
					str += '</tr>';
				}
			}
			str += '</table>';
		}
		if (Game.onMenu=='city') 
		{
			str+='<hr><div  class="section">City</div><hr>';
			for (var i in Game.Buildings) {
				var me = Game.Buildings[i];
				str+= '<div class="Building_Case" id="Building_Case_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Building_Case_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.BuildingsById['+me.id+'],\'Building_Case_'+me.id+'\')" onclick="Game.BuildingsById['+me.id+'].Buy()"><img class="Pic" src="img/'+me.name+'.png"><div class="Building_Name">'+me.name+'</div><div class="Building_Amount">'+me.amount+'</div></div>';
			}
		}
		if (Game.onMenu=='craft') 
		{
			str+='<hr><div  class="section">Workshop</div><hr>';
			str+='<div id="Craft_Menu">';
			for (var i=1;i<Game.ObjectsN;i++) 
			{
				if (i==1 || Game.ObjectsById[i].type!=Game.ObjectsById[i-1].type)
				{
					if (Game.ObjectsById[i].unlocked)
					{
						str+='<div onclick="Game.ShowCraftMenu(\''+Game.ObjectsById[i].type+'\')" class="Craft_Menu_Tab">';
						str+='<img src="img/'+Game.ObjectsById[i].type+'.png">';
						str+='<div>'+Game.ObjectsById[i].type+'</div>';
						str+='</div>';
					}
				}
			}
			
			/*for (var i in Game.ItemTypes)
			{
				str+='<div onclick="Game.ShowCraftMenu(\''+Game.ItemTypes[i]+'\')" class="Craft_Menu_Tab">';
				str+='<img src="img/'+Game.ItemTypes[i]+'.png">';
				str+='<div>'+Game.ItemTypes[i]+'</div>';
				str+='</div>';
			}*/
			str+='</div>';
			str+='<hr>';
			str+='<div id="craft_section_1">';
			for (var i in Game.ObjectsById) 
			{
				var me = Game.ObjectsById[i];
				if(Game.onCraftMenu == me.type)
				{
					if (me.unlocked && me.researched)
					{
						str+='<div class="Craft_Item" id="Craft_Item_1_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Craft_Item_1_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+me.id+'],\'Craft_Item_1_'+me.id+'\')" onclick="Game.ObjectsById['+me.id+'].Craft()" >';
						str+= '<img class="Pic" src="img/'+me.code+'.png">';
						str+='<div class="Craft_Item_Name">'+me.name+'</div>';
						str+='</div>';
					}
					else if (me.unlocked)
					{
						var res_price = me.CalcResPrice();
						str+='<div class="Craft_Item research_item" id="Craft_Item_1_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Craft_Item_1_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+me.id+'],\'Craft_Item_1_'+me.id+'\')" onclick="Game.ObjectsById['+me.id+'].Research()" >';
						str+= '<img class="Pic" src="img/'+me.code+'.png">';
						str+='<div class="Craft_Item_Res_Price">';
						str+='<div>Gold : '+Beautify(res_price.gold)+'</div>';
						str+='<div>Knowledge : '+Beautify(res_price.knowledge)+'</div>';
						
						str += '</div>';
						str+='</div>';
					}
					else if (Game.ObjectsById[i-1].researched)
					{
						str+='<div class="Craft_Item unbuyable" id="Craft_Item_1_'+me.id+'" >';
						str+= '<img class="Pic" src="img/unknown.png">';
						str+='<div class="Craft_Item_Name">Reach '+Game.ObjectsById[i-1].name+' mastery I</div>';
						str+='</div>';
					}
				}								
			}
			str+='</div>';
			str+='<div id="craft_section_2">';
			for (var i in Game.CraftsInProgress) {
				str += Game.GetCraftDOM(i);
			}
			str+='</div>';

		}
		if (Game.onMenu=='research') 
		{
			str+='<hr><div  class="section">Research</div><hr>';
			str+='<div id="research_section_1">';
			for (var i in Game.Upgrades) 
			{
				var me = Game.Upgrades[i];
				if(me.unlocked && !me.bought)
				{
					str+='<div class="Craft_Item" id="Upgrade_Case_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Upgrade_Case_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.UpgradesById['+me.id+'],\'Upgrade_Case_'+me.id+'\')" onclick="Game.UpgradesById['+me.id+'].Buy()" >';
					str+= '<img class="Pic" src="img/'+me.code+'.png">';
					str+='<div>'+me.name+'</div>';
					str+='</div>';
				}								
			}
			str+='</div>';
			str+='<div id="research_section_2">';
			for (var i in Game.Researches) 
			{
				var me = Game.Researches[i];
				if(me.unlocked && !me.bought)
				{
					str+= '<div class="Building_Case" id="Research_Case_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Research_Case_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.ResearchesById['+me.id+'],\'Research_Case_'+me.id+'\')" onclick="Game.ResearchesById['+me.id+'].Buy()">';
					str+='<img class="Pic" src="img/'+me.name+'.png">';
					str+='<div class="Research_Name">'+me.name+'</div>';
					//str+='<div class="Building_Amount">'+me.amount+'</div>';
					str+='</div>';
				}
												
			}
			str+='</div>';
		}
		/*
		if (Game.onMenu=='adv')
		{
			str+='<hr><div  class="section">Adventurers</div><hr>';
			for (var i in Game.Adventurers) 
			{
				var me = Game.Adventurers[i];
				if (me.unlocked)
				{
					str += '<div class="Adv_Case" id="Adv_Case_'+me.id+'" >';
						str += '<div class="Case_Level">'+me.level+'</div>';
						str += '<div class="Case_Name">'+me.name+'</div>';
						str += '<img class="Adv_Img" height="100px" width="70px" src="img/'+me.code+'.png">';;
					
					//	str += '<div>Busy</div>';
					//	str += '<div>Power</div>';
					
						str +='<table class="equip_table"><tr>';
						for (var j in me.choice)
						{
							str += '<td>';
							for (var k in me.choice[j])
							{
								str += '<img class = "Adv_equipable_img" src="img/'+me.choice[j][k]+'.png"  >';
							
							}
							str += '</td>';
						}
						str += '<tr></tr>';
						for (var j in me.equip)
						{
							str += '<td onclick="Game.Adventurer_Equip_Menu('+me.id+','+j+')">';
							if (me.equip[j].id != -1) str += '<img height="60px" width="60px" class="qual_'+me.equip[j].qual+'" src="img/'+Game.ObjectsById[me.equip[j].id].code+'.png" onmouseout="Game.RemoveTooltip(\'Adv_Case_'+me.id+' .equip_table\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+me.equip[j].id+'],\'Adv_Case_'+me.id+' .equip_table\','+me.equip[j].qual+')">';
							else str += '<img height="60px" width="60px" class="qual_0" src="img/equip.png" >';
							str += '</td>';
						}
						str +='</tr></table>';
					/*
						str+='<div class="xp_bar"><div class="xp_loading"></div>';
						str+='<p><span class="bar_text">gogo</span></p>';
						str+='</div>';
						*/
						/*
					str += '</div>';
				}
			}
			
		}
		*/
		if (Game.onMenu=='adv')
		{
			str+='<hr><div  class="section">Adventurers</div><hr>';
			for (var i in Game.Adventurers) 
			{
				var me = Game.Adventurers[i];
				if (me.unlocked)
				{
					str += '<div class="Adv_Case_Mini" id="Adv_Case_Mini_'+me.id+'" >';
						str += '<div class="Case_Level">'+me.level+'</div>';
						str += '<div class="Case_Name">'+me.name+'</div>';
						str += '<img class="Adv_Img" height="160px" width="120px" src="img/'+me.code+'.png">';;
					
					//	str += '<div>Busy</div>';
					//	str += '<div>Power</div>';
					
					str += '</div>';
				}
			}
			
		}
		if (Game.onMenu=='stats') 
		{
			str+='<hr><div  class="section">Stats</div><hr>';
			str += '<div id="Stats_Storage">';
			for (var i in Game.Objects) {
				var me = Game.Objects[i];
				for (var j in me.amount)
				{
					if(me.amount[j] > 0) str+= '<img class="Pic qual_'+j+'" id="Stats_Item_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Stats_Item_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+me.id+'],\'Stats_Item_'+me.id+'\','+j+')" src="img/'+me.code+'.png">';
				}
			}
			str += '</div>';
		}
		
		$('#CenterColumn').html(str);
		Game.Update_Buyables();
	}			

	Game.UpdateCustomers=function()
	{
		var str = '';
		for (var i in Game.AdvInStore)
		{
			str += Game.GetStoreDOM(i);
		}
		$('#Store').html(str);
	}
	
	Game.dosomething=function()
	{
		var str = "";
		var me = Game.AdventurersById[0];
				if (me.unlocked)
				{
					str += '<div class="Adv_Case" id="Adv_Case_'+me.id+'" >';
						str += '<div class="Case_Level">'+me.level+'</div>';
						str += '<div class="Case_Name">'+me.name+'</div>';
						str += '<img class="Adv_Img" height="100px" width="70px" src="img/'+me.code+'.png">';;
					
					//	str += '<div>Busy</div>';
					//	str += '<div>Power</div>';
					
						str +='<table class="equip_table"><tr>';
						for (var j in me.choice)
						{
							str += '<td>';
							for (var k in me.choice[j])
							{
								str += '<img class = "Adv_equipable_img" src="img/'+me.choice[j][k]+'.png"  >';
							
							}
							str += '</td>';
						}
						str += '<tr></tr>';
						for (var j in me.equip)
						{
							str += '<td onclick="Game.Adventurer_Equip_Menu('+me.id+','+j+')">';
							if (me.equip[j].id != -1) str += '<img height="60px" width="60px" class="qual_'+me.equip[j].qual+'" src="img/'+Game.ObjectsById[me.equip[j].id].code+'.png" onmouseout="Game.RemoveTooltip(\'Adv_Case_'+me.id+' .equip_table\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+me.equip[j].id+'],\'Adv_Case_'+me.id+' .equip_table\','+me.equip[j].qual+')">';
							else str += '<img height="60px" width="60px" class="qual_0" src="img/equip.png" >';
							str += '</td>';
						}
						str +='</tr></table>';
					/*
						str+='<div class="xp_bar"><div class="xp_loading"></div>';
						str+='<p><span class="bar_text">gogo</span></p>';
						str+='</div>';
						*/
					str += '</div>';
				}
		$('body').append(str);		
				
	}
	
	Game.Spend=function(What,howmuch,quality)
	{
		if ($.isArray(What.amount)) What.amount[quality]-=howmuch;
		else What.amount-=howmuch;
	}
	
	Game.Earn=function(What,howmuch,quality)
	{
		if ($.isArray(What.amount)) What.amount[quality] += howmuch;
		else What.amount+=howmuch;		
	}
	
	Game.CalculateGains = function()
	{
		for (var i in Game.Resources) 
		{
			Game.Resources[i].Ps=0;
		}
		
		for (var i in Game.Generators)
		{
			me = Game.Generators[i];
			if(me.active)
			{
				for (var j in me.prod)
				{
					Game.Resources[me.prod[j].name].Ps += me.prod[j].val;
				}
			}
		}
		Game.Resources['iron'].Ps *= (1 + 0.2*Game.Buildings['Mine'].amount );
		Game.recalculateGains=0;
		Game.InitResourceHeader();
	}
	
	
	Game.GetTime2=function(time) {
		var days = Math.floor(time / 86400);
		time -= days * 86400;

		var hours = Math.floor(time / 3600) % 24;
		time -= hours * 3600;


		var minutes = Math.floor(time / 60) % 60;
		time -= minutes * 60;

		var seconds = Math.floor(time % 60);  // in theory the modulus is not required
		var beautiful_time = "";
		if (seconds >0) beautiful_time = seconds + " seconds";
		if (minutes > 0) {
			if (minutes ==1)  	beautiful_time= minutes+" minute, "+beautiful_time;
			else 				beautiful_time= minutes+" minutes, "+beautiful_time;
		}
		if (hours > 0) {
			if (hours ==1)  	beautiful_time= hours+" hour, "+beautiful_time;
			else 				beautiful_time= hours+" hours, "+beautiful_time;
		}
		if (days > 0) {
			if (days ==1) 	 	beautiful_time= days+" day, "+beautiful_time;
			else 				beautiful_time= days+" days, "+beautiful_time;
		}
		if (seconds==0) beautiful_time = beautiful_time.slice(0,-2);
		return beautiful_time;
	}
	
	Game.GetTime=function() {
		var today = new Date();
		var h = today.getHours();
		var m = today.getMinutes();
		var s = today.getSeconds();
		m = Game.checkTime(m);
		s = Game.checkTime(s);
		var clock = h + ":" + m + ":" + s;
		return clock;
	}
	Game.checkTime=function(i) {
		if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
		return i;
	}
	
	Game.CraftPriceValue=function(type,value,min)
	{
		var choices = [];
		for (var i in Game.ObjectsById)
		{
			if (Game.ObjectsById[i].type == type)	 choices.push(i);	
		}
		var index = choices[choices.length-1];
		for (var i in choices)
		{		
			
			if ((value/Game.ObjectsById[choices[i]].gold)<min)
			{
				index = choices[i-1]; 
			}
		}
		return {id:(index),val:Math.ceil(value/Game.ObjectsById[index].gold)};
		
	}
	
	Game.TypeOfMat=function(what)
	{
		if (Game.Resources[what])	return Game.Resources[what];
		else return Game.Objects[what];
	}
	
	Game.GetPrice=function(item,p_index)
	{
		var price = item.basePrice[p_index].val;
		var name = item.basePrice[p_index].name;
		var obj;
		if (Game.Resources[name]) obj = Game.Resources[name];
		else obj = Game.Objects[name];
		var quality = 0;
		if ('qual' in item.basePrice[p_index]) quality = item.basePrice[p_index].qual;
		if (item.title == "Building") 
		{
			price *= Math.pow(item.pricemult,item.amount);
			if (!(Game.Resources[item.basePrice[p_index].name] || Game.Objects[item.basePrice[p_index].name]) )
			//if (item.basePrice[p_index].name == "sword")
			{
				ret = Game.CraftPriceValue(item.basePrice[p_index].name,price,item.basePrice[p_index].min);
				price = ret.val;
				obj = Game.ObjectsById[ret.id];
			}
		}
		return {item:obj,val:Math.floor(price),qual:quality};
	}
	
	Game.Enough_Resources=function(item)
	{
		var enough_resources = 1;
		var price ;
		for (var i in item.basePrice)
		{
			ret = Game.GetPrice(item,i);
			price = ret.val;
			quality = ret.qual;
			var Mat = ret.item;
			if ($.isArray(Mat.amount))
			{
				if (price > Mat.amount[quality])  enough_resources=0;
			}
			else
			{
				if (price > Mat.amount)  enough_resources=0;
			}
		}
		if (Game.Resources['energy'].amount < item.energy) enough_resources=0;
		return enough_resources;
	}
	
	Game.Update_Buyables=function()
	{
		if (Game.onMenu == 'craft')
		{
			$('#craft_section_1').children('div').each(function() { 
				var str = $(this).attr('id');
				var arr = str.split("_");
				var id = arr[arr.length-1];
				//array.push($(this).attr('id'));
				var classes =  $(this).attr("class");
				if (Game.Enough_Resources(Game.ObjectsById[id]) && Game.ObjectsById[id].unlocked) classes += ' buyable';
				else classes += ' unbuyable';
				$(this).attr('class', classes);
			});
		}
		if (Game.onMenu == 'city')
		{
			for (var i in Game.BuildingsById)
			{
				var me = Game.BuildingsById[i];
				if (me.unlocked)
				{
					var classes = 'Building_Case ';
					if (Game.Enough_Resources(me)) classes += 'buyable';
					else classes += 'unbuyable';
					$('#Building_Case_'+i).attr('class', classes);	
				}
				
			}
		}
		if (Game.onMenu == 'research')
		{
			for (var i in Game.ResearchesById) 
			{
				var me = Game.ResearchesById[i];
				if(me.unlocked && !me.bought)
				{
					var classes = 'Building_Case ';
					if (Game.Enough_Resources(me)) classes += 'buyable';
					else classes += 'unbuyable';
					$('#Research_Case_'+i).attr('class', classes);
				}
												
			}
			for (var i in Game.UpgradesById) 
			{
				var me = Game.UpgradesById[i];
				if(me.unlocked && !me.bought)
				{
					var classes = 'Craft_item ';
					if (Game.Enough_Resources(me)) classes += 'buyable';
					else classes += 'unbuyable';
					$('#Upgrade_Case_'+i).attr('class', classes);
				}
												
			}
		}
		
	}
	
	//////////////////////////////////
	//			ITEMS				//
	//////////////////////////////////
	
	
	Game.Objects=[];
	Game.ObjectsById=[];
	Game.ObjectsN=0;
	
	Game.Object=function(name,code,type,level,desc,gold,energy,price,time,unlock_item)
	{
		this.id=Game.ObjectsN;
		this.name=name;
		//this.common=commonName;
		this.basePrice=price;
		this.time = time;
		this.unlock_item = unlock_item;
		this.type = type;
		this.level = level;
		this.desc = desc;
		this.gold = gold;
		this.energy = energy;
		this.amount=[0,0,0,0,0];
		this.total=0;
		this.unlocked=1;
		this.researched=1;
		this.mastery=0;
		this.title="Item";
		
		this.Craft=function()
		{
			if(Game.Enough_Resources(this))
			{
				var cost;
				for (var i in this.basePrice)
				{
					ret = Game.GetPrice(this,i);
					Game.Spend(ret.item,ret.val,ret.qual);
				}
				Game.CraftsInProgress.push({id:this.id,time:this.CalcTime()});
				Game.ComputeEnergy();
				var str = Game.GetCraftDOM(Game.CraftsInProgress.length-1);
				$('#craft_section_2').append(str);
				
				
			}
		}
		
		this.Research=function()
		{
			var res_price = this.CalcResPrice();
			if(Game.Resources['gold'].amount >= res_price.gold && Game.Resources['knowledge'].amount >= res_price.knowledge)
			{
				Game.Spend(Game.Resources['gold'],res_price.gold,0);
				Game.Spend(Game.Resources['knowledge'],res_price.knowledge,0);
				this.researched = 1;
				Game.UpdateMenu();
			}
		}
		/*
		this.ComputeTooltip=function(quality)
		{
			var qual_t = '';
			quality = (typeof quality === 'undefined') ? 0 : quality;
			var gold = this.CalcGold(quality);
			if (quality==1) qual_t = ' (Uncommon)';
			var tooltip = ''
			tooltip += '<div class="title qualt_'+quality+'"><strong>'+this.name+qual_t+'</strong></div><hr>';
			tooltip += '<div>owned : <strong class=qual_'+quality+'">'+this.amount[quality]+'</strong></div><div class="level">level</div><hr>';
			tooltip += '<img class="Craft_Pic qual_'+quality+'" src="img/'+this.code+'.jpg">';
			tooltip += '<div class="Craft_cost">';
			for (var j in this.basePrice) {
				var ret = Game.GetPrice(this,j);
				var price = Redify(ret);
				tooltip += '<div class="'+ret.item.name+'">'+ret.item.name+' : <strong>'+price+'</strong></div> ';
			}
			tooltip += '<hr><div class="energy">Energy : <strong>'+this.energy+'</strong></div> ';
			tooltip += '</div><hr class="clear">';
			tooltip += '<div>sells for : '+Beautify(gold)+' gold</div><hr>';
			tooltip += '<div>'+this.desc+'</div>';
			return tooltip;
		}		
			*/
		this.ComputeTooltip=function(quality)
		{
			var qual_t = '';
			quality = (typeof quality === 'undefined') ? 0 : quality;
			var gold = this.CalcGold(quality);
			var time = this.CalcTime();
			if (quality==1) qual_t = ' (Uncommon)';
			var tooltip = ''
			tooltip += '<div class="title qualt_'+quality+'"><strong>'+this.name+qual_t+'</strong></div><hr>';
			tooltip += '<div>owned : <strong class=qual_'+quality+'">'+this.amount[quality]+'</strong></div><div class="level">level</div><hr>';
			tooltip += '<img class="Craft_Pic qual_'+quality+'" src="img/'+this.code+'.jpg">';
			tooltip += '<div class="Craft_cost">';
			for (var j in this.basePrice) {
				var ret = Game.GetPrice(this,j);
				var price = Redify(ret);
				tooltip += '<div class="'+ret.item.name+'">'+ret.item.name+' : <strong>'+price+'</strong></div> ';
			}
			tooltip += '<hr><div class="energy">Energy : <strong>'+this.energy+'</strong></div> ';
			tooltip += '</div><hr class="clear">';
			tooltip += '<div>sells for : '+Beautify(gold)+' gold</div><hr>';
			tooltip += '<div>'+this.desc+'</div>';
			return tooltip;
		}		
			
		this.Remove = function(index)
		{
			$('#Craft_Case_'+index).remove();
			//very messy WIP HAS TO CHANGE
			for (var i = Number(index+1); i<=Game.CraftsInProgress.length ;i++)
			{
				//alert(i);
				$('#Craft_Case_'+i).attr("id", "Craft_Case_"+(i-1));
			}
		}
		
		this.RollForQuality=function()
		{
			return ~~(Math.random()*2);
		}
		
		this.CalcTime=function()
		{
			return this.time*Game.fps;
		}
		
		this.CalcGold=function(quality)
		{
			return this.gold*Game.PriceQArr[quality];
		}
		
		this.CalcResPrice=function()
		{
			var gold = this.gold /12;
			var knowledge = this.gold /5;
			return {gold:gold,knowledge:knowledge};
		}
		
		this.ComputeMastery=function()
		{
			if (this.total >= 100) this.mastery = 4;
			else if (this.total >= 50) this.mastery = 3;
			else if (this.total >= 25) this.mastery = 2;
			else if (this.total >= 5) this.mastery = 1;
			if (this.mastery > 0 && ('unlock_item' in this)) Game.Objects[this.unlock_item].unlocked = 1;
		}		
		
		Game.Objects[this.name]=this;
		Game.ObjectsById[this.id]=this;
		Game.ObjectsN++;
		return this;
	} 
	
	new Game.Object('sword1','sword1','sword',1,'',100,15,[{ name : "iron", val: 10 }],2);
	new Game.Object('sword2','sword2','sword',1,'',180,15,[{ name : "wood", val: 12 }],3,'sword3');
	new Game.Object('sword3','sword3','sword',2,'',300,15,[{ name : "iron", val: 12 },{ name : "wood", val: 12 },{ name : "leather", val: 12 }],3);
	
	new Game.Object('dagger1','dagger1','dagger',1,'',100,15,[{ name : "sword2", val: 2 }],3);
	new Game.Object('dagger2','dagger2','dagger',1,'',100,15,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],3);
	new Game.Object('dagger3','dagger3','dagger',2,'',100,15,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],3);
	
	new Game.Object('axe1','axe2','axe',1,'',100,15,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],3);
	new Game.Object('axe2','axe2','axe',2,'',100,15,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],3);
	new Game.Object('axe3','axe3','axe',3,'',100,15,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],150);
	
	new Game.Object('spear1','spear1','spear',3,'',100,15,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],150);
	
	Game.GetCraftDOM = function(index)
		{
			var me = Game.CraftsInProgress[index];
			var str = '';
			str+= '<div id="Craft_Case_'+index+'" class="Craft_Case">';
				
				str+= '<img class="Pic" src="img/'+Game.ObjectsById[me.id].code+'.png">';
				
				str+='<div class="float Craft_SubCase">';
				
					str+='<div><strong>'+Game.ObjectsById[me.id].name+'</strong></div>';
					str+='<div class="crafting_bar"><div class="crafting_loading"></div>';
					str+='<p><span class="bar_text">'+Game.GetTime2(Math.ceil(me.time/Game.fps))+'</span></p>';
					str+='</div>';
				
				
				str+='</div>';
				str+= '<img class="Craft_Cancel" onclick="Game.Craft_Cancel('+index+')" src="img/cancel.png">';
				
			str+='</div>';
			return str;
		}
	
	Game.Craft_Cancel=function(index) 
	{
		Game.CraftsInProgress.splice(index,1);
		Game.ComputeEnergy();
		if (Game.onMenu == 'craft') Game.UpdateMenu();
	}
	
	Game.Craft_Finish=function(index) 
	{
		it = Game.ObjectsById[Game.CraftsInProgress[index].id];
		qual = it.RollForQuality();
		Game.Earn(it,1,qual);
		it.total ++;
		Game.CraftsInProgress.splice(index,1);
		Game.ComputeEnergy();
		it .ComputeMastery();
		if (Game.onMenu == 'craft' || Game.onMenu == 'stats') Game.UpdateMenu();
	}
	
	Game.UpdateCraftingBars = function() {
		for (var i in Game.CraftsInProgress)
		{
			var me=Game.CraftsInProgress[i];
		
		
			var totaltime = Game.ObjectsById[me.id].CalcTime();
			var barfill = ((totaltime - me.time) / totaltime * 100);
			$("#Craft_Case_"+i+" .crafting_loading").width(barfill+"%");
		
				
		}
		
	}
	
	Game.Objects['sword3'].researched = 0;
	Game.Objects['sword3'].unlocked = 0;
	
	//////////////////////////////////
	//			BUILDINGS			//
	//////////////////////////////////
	
	
	Game.Buildings=[];
	Game.BuildingsById=[];
	Game.BuildingsN=0;
	
	Game.Building=function(name,desc,price,pricemult)
	{
		this.id=Game.BuildingsN;
		this.name=name;
		//this.common=commonName;
		this.basePrice=price;
		this.pricemult = pricemult;
		this.desc = desc;
		this.amount=0;
		this.unlocked=1;
		this.title="Building";
		
		this.Buy=function() 
		{		
			//Game.GetTooltip(this);
		
			if(Game.Enough_Resources(this))
			{
				var cost;
				for (var i in this.basePrice)
				{
					ret = Game.GetPrice(this,i);
					Game.Spend(ret.item,ret.val,ret.qual);
				}
				this.amount ++;
				$("#Building_Case_"+this.id+" .Building_Amount").html(this.amount);
				Game.recalculateGains = 1;
				Game.RemoveTooltip(this);
				Game.GetTooltip(this);
			}
		}
		
		this.ComputeTooltip=function()
		{
			var tooltip = ''
			tooltip += '<div class="title"><strong>'+this.name+'</strong></div><hr>';
			for (var j in this.basePrice) {
				ret = Game.GetPrice(this,j);
				price = Redify(ret);
				tooltip += '<div class="'+ret.item.name+'">'+ret.item.name+' : <strong>'+price+'</strong></div> ';
			}
			tooltip += '<hr><div>'+this.desc+'</div>';
			return tooltip;
		}	
		
		Game.Buildings[this.name]=this;
		Game.BuildingsById[this.id]=this;
		Game.BuildingsN++;
		return this;
	} 
	
	new Game.Building('Mine','improve iron generation from all sources',[{ name : "axe", val: 8000 ,min:3}],1.15);
	new Game.Building('Fort','improve iron generation from all sources',[{ name : "gold", val: 12 }],1.15);
	new Game.Building('Lumber Mill','improve iron generation from all sources',[{ name : "gold", val: 20 },{ name : "wood", val: 40 }],1.8);
	
	Game.GetTooltip=function(item,dest,qual) {
		var tooltip = item.ComputeTooltip(qual);
		$("#"+dest).tooltipster({
			content: $(tooltip),				//once the tooltips are html, $(tooltip) instead
			theme: 'tooltipster-light',
			minWidth:350,
			position:'left',
			speed: 0
		});
		$("#"+dest).tooltipster('show');
	}
	
	Game.RemoveTooltip=function(dest) {
		$("#"+dest).tooltipster('destroy');

	}
	
	//////////////////////////////////
	//			GENERATORS			//
	//////////////////////////////////
	
	
	Game.Generators=[];
	Game.GeneratorsById=[];
	Game.GeneratorsN=0;
	
	Game.Generator=function(name,desc,prod)
	{
		this.id=Game.GeneratorsN;
		this.name=name;
		//this.common=commonName;
		this.prod=prod;
		this.desc = desc;
		this.unlocked=1;
		this.active=0;
		this.title="Generator";
		
		this.Select = function()
		{
			col = ~~(this.id/3);
			for (var i=3*col ; i< 3*col+3 ; i++)
			{
				Game.GeneratorsById[i].active = 0;
				$('#Generator_Case_'+i).css("background-color","white")
			}
			this.active = 1;
			$('#Generator_Case_'+this.id).css("background-color","grey")
			Game.recalculateGains=1;
		}
		
		Game.Generators[this.name]=this;
		Game.GeneratorsById[this.id]=this;
		Game.GeneratorsN++;
		return this;
	} 
	
	new Game.Generator('Gen1_A','',[{ name : "iron", val: 10 }]);
	new Game.Generator('Gen1_B','',[{ name : "wood", val: 25 }]);
	new Game.Generator('Gen1_C','',[{ name : "leather", val: 12 }]);
	new Game.Generator('Gen2_A','',[{ name : "iron", val: 10 }]);
	new Game.Generator('Gen2_B','',[{ name : "wood", val: 12 }]);
	new Game.Generator('Gen2_C','',[{ name : "leather", val: 12 }]);
	
	Game.GeneratorsById[1].active = 1;
	
	//////////////////////////////////
	//			UPGRADES			//
	//////////////////////////////////
	
	
	Game.Upgrades=[];
	Game.UpgradesById=[];
	Game.UpgradesN=0;
	
	Game.Upgrade=function(name,desc,price,buyFunction)
	{
		this.id=Game.UpgradesN;
		this.name=name;
		this.basePrice=price;
		//this.common=commonName;
		this.desc = desc;
		this.title="Upgrade";
		this.buyFunction=buyFunction;
		this.unlocked=1;
		this.bought=0;
		
		this.Buy=function()
		{
			if(Game.Enough_Resources(this))
			{
				var cost;
				for (var i in this.basePrice)
				{
					ret = Game.GetPrice(this,i);
					Game.Spend(ret.item,ret.val,ret.qual);
				}
				this.bought=1;
				if (this.buyFunction) this.buyFunction();
				Game.recalculateGains=1;
				Game.UpdateMenu();
				
			}
		}	
		
		this.ComputeTooltip=function()
		{
			var tooltip = ''
			tooltip += '<div class="title"><strong>'+this.name+'</strong></div><hr>';
			for (var j in this.basePrice) {
				ret = Game.GetPrice(this,j);
				price = Redify(ret);
				tooltip += '<div class="'+ret.item.name+'">'+ret.item.name+' : <strong>'+price+'</strong></div> ';
			}
			tooltip += '<hr><div>'+this.desc+'</div>';
			return tooltip;
		}	

		Game.Upgrades[this.name]=this;
		Game.UpgradesById[this.id]=this;
		Game.UpgradesN++;
		return this;
	} 
	
	new Game.Upgrade('up1','',[{ name : "iron", val: 10 }]);
	new Game.Upgrade('up2','',[{ name : "wood", val: 10 }]);
	new Game.Upgrade('up3','',[{ name : "iron", val: 10 }]);
	
	Game.Unlock=function(what)
	{
		if (what.unlocked==0)
		{
			what.unlocked=1;
			Game.InitResourceHeader();
			Game.UpdateMenu();
		}
	}

	
	//////////////////////////////////
	//			RESEARCH			//
	//////////////////////////////////
	
	
	Game.Researches=[];
	Game.ResearchesById=[];
	Game.ResearchesN=0;
	
	Game.Research=function(name,desc,price,buyFunction)
	{
		this.id=Game.ResearchesN;
		this.name=name;
		this.basePrice=price;
		//this.common=commonName;
		this.desc = desc;
		this.title="Research";
		this.buyFunction=buyFunction;
		this.unlocked=1;
		this.bought=0;

		this.Buy=function()
		{
			if(Game.Enough_Resources(this))
			{
				var cost;
				for (var i in this.basePrice)
				{
					ret = Game.GetPrice(this,i);
					Game.Spend(ret.item,ret.val,ret.qual);
				}
				this.bought=1;
				if (this.buyFunction) this.buyFunction();
				Game.recalculateGains=1;
				Game.UpdateMenu();
				
			}
		}	
		
		this.ComputeTooltip=function()
		{
			var tooltip = ''
			tooltip += '<div class="title"><strong>'+this.name+'</strong></div><hr>';
			for (var j in this.basePrice) {
				ret = Game.GetPrice(this,j);
				price = Redify(ret);
				tooltip += '<div class="'+ret.item.name+'">'+ret.item.name+' : <strong>'+price+'</strong></div> ';
			}
			tooltip += '<hr><div>'+this.desc+'</div>';
			return tooltip;
		}	
		
		Game.Researches[this.name]=this;
		Game.ResearchesById[this.id]=this;
		Game.ResearchesN++;
		return this;
	} 
	
	new Game.Research('res1','',[{ name : "iron", val: 10 }]);
	new Game.Research('res2','',[{ name : "iron", val: 10 }]);
	new Game.Research('res3','',[{ name : "iron", val: 10 }]);
	
	
	//////////////////////////////////
	//			ADVENTURERS			//
	//////////////////////////////////
	
	
	Game.Adventurers=[];
	Game.AdventurersById=[];
	Game.AdventurersN=0;
	
	Game.Adventurer=function(name,desc,choice)
	{
		this.id=Game.AdventurersN;
		this.name=name;
		//this.common=commonName;
		this.choice=choice;
		this.desc = desc;
		this.unlocked=1;
		this.level=1;
		this.busy=0;
		this.xp=0;
		this.equip = [{id:1,qual:0},{id:1,qual:1},{id:-1,qual:0},{id:-1,qual:0},{id:-1,qual:0},{id:-1,qual:0},{id:-1,qual:0}];
		this.title="Adventurer";
		
		

		Game.Adventurers[this.name]=this;
		Game.AdventurersById[this.id]=this;
		Game.AdventurersN++;
		return this;
	} 
	
	new Game.Adventurer('Fighter','',[["sword","axe","mace"],["Hhead"],["Hbody"],["Hhand"],["Hboot"],["ring"],["potion"]]);
	new Game.Adventurer('Rogue','',[["sword","dagger"],["Mhead"],["Hbody"],["Hhand"],["Hboot"],["ring"],["potion"]]);
	new Game.Adventurer('Druid','',[["staff","dagger"],["Lhead"],["Hbody"],["Hhand"],["Hboot"],["ring"],["potion"]]);

	Game.Adventurer_Arrives = function()
	{
		var choices = [];
		for (var i in Game.AdventurersById)
		{
			if (!Game.AdventurersById[i].busy) choices.push(i)
		}
		if (choices!=[])
		{
			var adv = ~~(Math.random()*choices.length);
			me = Game.AdventurersById[choices[adv]];
			choices = [];
			qual = 0;
			//WIP must add level restriction
			var choicemerge = [].concat.apply([], me.choice);
			for (var i in Game.ObjectsById) //ADV won't ask for item you haven't unlocked yet, good for early game balance
			{			
				if (choicemerge.includes(Game.ObjectsById[i].type) && (Game.ObjectsById[i].unlocked) && (Game.ObjectsById[i].level <= me.level)) choices.push(i);
			}
			var chosen = choices[~~(Math.random()*choices.length)];
			for (var i=4;i>=0;i--)
			{
				if (Game.ObjectsById[chosen].amount[i]>0) 
				{
					qual = i;
					break;
				}
			}
			Game.AdvInStore.push({adv:me.id,chosen:chosen,qual:qual});
			var str = Game.GetStoreDOM(Game.AdvInStore.length-1);
			$('#Store').append(str);
			me.busy = 1;
		}
	}
	
	Game.Adventurer_Satisfy = function(index)
	{
		var quality = Game.AdvInStore[index].qual;
		var it = Game.ObjectsById[Game.AdvInStore[index].chosen];
		if (it.amount[quality] > 0)
		{
			reward = it.CalcGold(quality);
			Game.Spend(it,1,quality);
			Game.Earn(Game.Resources['gold'],reward);
			var rep = Game.CalcRep(it,0);
			Game.Earn(Game.Resources['reputation'],rep);
			Game.Adventurer_Leaves(index,1);
		}	
	}
	
	Game.Adventurer_Suggest_Menu = function(index)
	{
		var exist = 0;
		var empty = 1;
		if ($('#Suggest_'+index).length) exist=1;
		for (var i in Game.AdvInStore)
		{
			$('#Suggest_'+i).slideUp("normal", function() { $(this).remove(); });
		}	
		if (!exist)
		{
			var him = Game.AdventurersById[Game.AdvInStore[index].adv];
			var choicemerge = [].concat.apply([], him.choice);
			var str = '<div hidden class="Suggest_Menu" id="Suggest_'+index+'">';
				for (var i in Game.ObjectsById)
				{			
					var me = Game.ObjectsById[i];
					if (choicemerge.includes(me.type))
					{
						for (var j in me.amount)
						{
							if ((me.level <= him.level) && me.amount[j]>0 && (Game.AdvInStore[index].qual != j || i != Game.AdvInStore[index].chosen))
							{
								var rep = Game.CalcRep(me,1);
								str+='<div class="Craft_Item qual_'+j+'" id="Suggest_Item_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Suggest_Item_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+me.id+'],\'Suggest_Item_'+me.id+'\','+j+')" onclick="Game.Adventurer_Suggest('+index+','+me.id+','+j+')" >';
								str+= '<img class="Pic" src="img/'+me.code+'.png">';
								str+='<div>- '+rep+' reputation</div>';
								str+='</div>';
								empty = 0;
							}
						}
					}
				}
			if (empty) str += '<div>No compatible item</div>';
			str += '</div>';
			$('#Adv_Store_Case_'+index).after(str);
			 $('#Suggest_'+index).slideDown();
		}
	}
	
	//to MAJ
	Game.Adventurer_Suggest = function(index,itemid,qual)
	{
		var it = Game.ObjectsById[itemid];
		var reward = it.CalcGold(qual);
		var rep = Game.CalcRep(it,1);
		//alert(qual);
		if (Game.Resources['reputation'].amount >= rep && it.amount[qual] > 0)
		{
			Game.Spend(it,1,qual);
			Game.Earn(Game.Resources['gold'],reward);
			Game.Spend(Game.Resources['reputation'],rep);
			$('#Suggest_'+index).remove();
			Game.Adventurer_Leaves(index,1);
		}	
	}
	
	Game.Adventurer_Leaves = function(index,satisfied)
	{
		/*
		if (!satisfied) 
		{
			it = Game.ObjectsById[Game.AdvInStore[index].chosen];
			var rep = it.gold/100;
			Game.Spend('reputation',rep);
		}
		*/
		Game.AdventurersById[Game.AdvInStore[index].adv].busy = 0;
		Game.AdvInStore.splice(index,1);
		//very messy WIP
		Game.UpdateCustomers();
		if(Game.onMenu == 'stats') Game.UpdateMenu();
		/*
		$('#Adv_Store_Case_'+index).remove();
		for (var i = Number(index+1); i<=Game.AdvInStore.length ;i++)
			{
				$('#Adv_Store_Case_'+i).attr("id", "Adv_Store_Case_"+(i-1));
				$('#Adv_Store_Case_'+i+' .accept').attr("onclick",'Game.Adventurer_Satisfy('+(i-1)+')');
				$('#Adv_Store_Case_'+i+' .refuse').attr("onclick",'Game.Adventurer_Leaves('+(i-1)+',0)');
			}
			*/
	}	
	
	Game.Adventurer_Equip_Menu = function(advid,slot)
	{
		var exist = 0;
		var empty = 1;
		var classes = "Equip_Menu";
		if ($('#Equip_'+advid).length) exist=1;
		for (var i in Game.AdventurersById)
		{
			$('#Equip_'+i).slideUp("normal", function() { $(this).remove(); });
		}	
		if (!exist || !$('#Equip_'+advid).hasClass('slot_'+slot))
		{
			var him = Game.AdventurersById[advid];
			//var choicemerge = [].concat.apply([], him.choice);
			var str = '<div hidden class="Equip_Menu" id="Equip_'+advid+'">';
				for (var i in Game.ObjectsById)
				{			
					var me = Game.ObjectsById[i];
					if (him.choice[slot].includes(me.type))
					{
						for (var j in me.amount)
						{
							if (me.amount[j]>0 && (him.equip[slot].qual != j || i != him.equip[slot].id))
							{
								//var rep = Game.CalcRep(me,1);
								//str+='<div class="Craft_Item qual_'+j+'" id="Suggest_Item_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Suggest_Item_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+me.id+'],\'Suggest_Item_'+me.id+'\','+j+')" onclick="Game.Adventurer_Suggest('+index+','+me.id+','+j+')" >';
								str+= '<img class="Pic qual_'+j+'" src="img/'+me.code+'.png" onclick="Game.Adventurer_Equip('+advid+','+me.id+','+j+','+slot+')" onmouseout="Game.RemoveTooltip(\'Adv_Case_'+advid+' .equip_table\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+me.id+'],\'Adv_Case_'+advid+' .equip_table\','+j+')">';
								//str+='<div>- '+rep+' reputation</div>';
								//str+='</div>';
								empty = 0;
							}
						}
					}
				}
			if (empty) str += '<div>No compatible item</div>';
			str += '<div class="clear"></div>';
			str += '</div>';
			$('#Adv_Case_'+advid).after(str);
			 $('#Equip_'+advid).slideDown();
			 classes += ' slot_' + slot;
			 $('#Equip_'+advid).attr('class', classes);
		}
	}
	
	Game.Adventurer_Equip = function(advid,itemid,qual,slot)
	{
		var it = Game.ObjectsById[itemid];
		var him = Game.AdventurersById[advid];
		Game.Spend(it,1,qual);
		him.equip[slot].id = itemid;
		him.equip[slot].qual = qual;
		if (him.equip[slot].id != -1) Game.Earn(Game.ObjectsById[him.equip[slot].id],1,him.equip[slot].qual);
		//Game.Spend('reputation',rep);
		$('#Equip_'+advid).slideUp("normal", function() { $(this).remove(); });
		Game.UpdateMenu();
			
	}
	
	Game.GetStoreDOM = function(index)
		{
			var me = Game.AdvInStore[index];
			var it = Game.ObjectsById[me.chosen];
			var str = '';
			str+= '<div id="Adv_Store_Case_'+index+'" class="Adv_Store_Case">';
				
			str+= '<img class="float" height="100%" width="70px" src="img/'+Game.AdventurersById[me.adv].code+'.png">';
			str+= '<img class="margin Pic qual_'+me.qual+'" onmouseout="Game.RemoveTooltip(\'Adv_Store_Case_'+index+'\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+it.id+'],\'Adv_Store_Case_'+index+'\','+me.qual+')" src="img/'+it.code+'.png">';
				str+= '<div class="Adv_Store_SubCase" height="100%" >';
				str+= '<div>'+it.name+'</div>';
					str+='<div>';
					str+= '<img onclick="Game.Adventurer_Satisfy('+index+')" class="store_icons accept" src="img/accept.png">';
					str+= '<img onclick="Game.Adventurer_Leaves('+index+',0)" class="store_icons refuse" src="img/refuse.png">';
					str+= '<img onclick="Game.Adventurer_Suggest_Menu('+index+')"  class="store_icons suggest" src="img/suggest.png">';
					str+='</div>';
				str+='</div>';
			str+='</div>';
			return str;
		}
		
	Game.CalcRep = function(item,action)
	{
		rep = 1;
		if (action) 
		{
			rep *= ~~(Math.pow(item.gold,(1/3)));
		}
		return rep;
	}	
	
	//////////////////////////////////
	//			RESOURCES			//
	//////////////////////////////////
	
	
	Game.Resources=[];
	Game.ResourcesById=[];
	Game.ResourcesN=0;
	
	Game.Resource=function(name,commonName,max)
	{
		this.id=Game.ResourcesN;
		this.name=name;
		this.common=commonName;
		this.amount=80;
		this.max=max;
		this.Ps=0;
		//this.total=0;
		//this.byhand=0;
		//this.clickpow=0;
		this.unlocked=1;
		this.title="Resource";
		
		
		Game.Resources[this.name]=this;
		Game.ResourcesById[this.id]=this;
		Game.ResourcesN++;
		return this;
	}
	
	new Game.Resource('gold','Gold',0);
	new Game.Resource('energy','Energy',100);
	new Game.Resource('reputation','Reputation',100);
	new Game.Resource('knowledge','Knowledge',100);
	new Game.Resource('iron','Iron',100);
	new Game.Resource('wood','Wood',100);
	new Game.Resource('leather','Leather',100);
	
	
	Game.InitResourceHeader=function(){
		var str='';
		str += '<table id="Resources_Table">';
		for (var i in Game.Resources) {
			var me = Game.Resources[i];
			str += '<tr id="'+me.name+'_line"><td>'+me.name+' </td><td><span id="'+me.name+'_Amount">'+Beautify(me.amount)+'</span></td><td>';
			if (me.max != 0) str += ' / <span id="'+me.name+'_Max">'+Beautify(me.max)+'</span>';
			str += '</td><td>'
			if (me.Ps != 0)str += ' (<span id="'+me.name+'_Ps">'+Beautify(me.Ps)+'</span>/s)';
			str += '</td></tr>';
			//if (Game.Resources[i].name == 'reputation') str+= '<tr style="border-bottom: 1px solid black"><td colspan="4"> </td></tr>';
		}
		str += '</table>';
		$('#Resource_Col').html(str);
		
	}
	
	Game.ComputeEnergy=function()
	{
		var val = Game.Resources['energy'].max;
		for (var i in Game.CraftsInProgress)
		{
			val -= Game.ObjectsById[Game.CraftsInProgress[i].id].energy;
		}
		Game.Resources['energy'].amount = val;
		$("#energy_Amount").html(Beautify(val));
	}
	
	/*
	Game.ResourceUnlock=function(what)
		{
			if (typeof what==='string')
			{
				if (Game.Resources[what])
				{
					if (Game.Resources[what].locked==1)
					{
						Game.Resources[what].locked=0;
						Game.InitResourceHeader();

		
					}
				}
			}
			//else {for (var i in what) {Game.Unlock(what[i]);}}
		}
	*/
	
	/*
	Game.Particles=[];
	Game.AddParticles=function(str,value,x,y){
		var x = Math.floor(Math.random() * 60) + window.event.clientX -30; //get a random x
		var y = Math.floor(Math.random() * 20) + window.event.clientY-10; //get a random y
		var content='';
		if (str=='Money') content= '+'+Beautify(value);
		if (str=='Bricks') {
			content= '+'+Beautify(value)+' Bricks !';
			y=900*window.innerHeight/1200;
			x=400;
		}
		
		
		Game.Particles.push({ x:x, y:y, o:10.0 ,content:content});
		// Game.number++;
		// $('#numbero').html(Game.number);
		
	}
	Game.UpdateParticles=function(){
		for (var p = 0; p < Game.Particles.length; p++) { //loop through particles
			Game.Particles[p].y -=2; //move up by 1px
			Game.Particles[p].o -= 0.1; //reduce opacity by 0.1
			if (Game.Particles[p].o <= 0.0) { //if it's invisible
				Game.Particles.splice(p,1); //remove the particle from the array
			}
		}
		Game.Draw(); //call the canvas draw function
	}
	
	Game.GetParticleColor=function(){
		if ((Game.WallsDestroyed>=5 && Game.WallsDestroyed<25) || (Game.WallsDestroyed>=35 && Game.WallsDestroyed<45)) return '#aaaaaa';
		else return 'black';
	}
	
	Game.Draw=function(){
		Game.Canvas.Context.clearRect(0,0,Game.Canvas.width,Game.Canvas.height); //clear the frame
		text_color=Game.GetParticleColor();
		for (var p = 0; p < Game.Particles.length; p++) {
			Game.Text(Game.Particles[p].content, Game.Particles[p].x, Game.Particles[p].y, "Arial black", 25, text_color, Game.Particles[p].o);
		}
		
	}
	Game.Text=function(text,x,y,font,size,col,opac) { //the text, x position, y position, font (arial, verdana etc), font size and colour
		if (col.length > 0) { //if you have included a colour
			Game.Canvas.Context.fillStyle = col; //add the colour!
		}
		if (opac > 0) { //if opacity exists
			Game.Canvas.Context.globalAlpha = opac; //amend it
		}
		Game.Canvas.Context.font = size + "px " + font; //set font style
		Game.Canvas.Context.fillText(text,x,y); //show text
		Game.Canvas.Context.globalAlpha = 1.0; //reset opacity
	}
	*/
	
	//Game.LoadSave(Game.SaveTo);
	Game.CalculateGains();
	Game.InitResourceHeader();
	Game.ShowMenu();
	Game.BuildMenu();
	Game.ComputeEnergy();
	//Game.BuildStore();
	//Game.BuildMenu();
	Game.Loop();
	}


	
Game.Logic=function() {

	
	if (Game.recalculateGains) Game.CalculateGains();
	//if (Game.upgradesToRebuild) Game.RebuildUpgrades();
	//if (Game.upgradesToAdd) Game.AddUpgrades();
	
	var viewportwidth = window.innerWidth;
	
	//if (Game.Resources['reputation'].amount < 0) Game.Resources['reputation'].amount = 0;
	for (var i in Game.Resources) {
		var it = Game.Resources[i];
		Game.Earn(it,it.Ps/Game.fps);//add resource each tick
		if ((it.amount > it.max) && (it.max != 0)) it.amount=it.max;
		$("#"+i+"_Amount").html(Beautify(it.amount));
	}
	
	
	
	
	//Game.UpdateParticles();
	
	for (var i in Game.CraftsInProgress)
	{
		me = Game.CraftsInProgress[i];
		me.time --;
		if (!(me.time%Game.fps))
		{
			var displayed_time = Game.GetTime2(me.time/Game.fps);
			$("#Craft_Case_"+i+" .bar_text").html(displayed_time);
		}
		if (!me.time)
		{
			//Game.ObjectsById[me.id].Finish();
			Game.Craft_Finish(i);
		}
	}
	
	if (Game.onMenu=='craft') 
	{
		Game.UpdateCraftingBars();
	}

	
	Game.T++;
}



Game.Loop=function()
	{
		//Game.catchupLogic=1;
		Game.Logic();
		//Game.catchupLogic=0;
		//makes the game run at target fps regardless of tab focus
		
		Game.accumulatedDelay+=((Date.now()-Game.time)-1000/Game.fps);
		Game.accumulatedDelay=Math.min(Game.accumulatedDelay,1000*5);//don't compensate over 5 seconds; if you do, something's probably very wrong
		Game.time=Date.now();
		while (Game.accumulatedDelay>0)
		{
			Game.Logic();
			Game.accumulatedDelay-=1000/Game.fps;//as long as we're detecting latency (slower than target fps), execute logic
		}
		
		//Game.catchupLogic=0;
		
		
		setTimeout(Game.Loop,1000/Game.fps);
	}

	
window.onload=function()
	{
			
			Game.Init();		
			
		
	};
/*	
window.setInterval(function(){
	Logic();
	money = money + total_dps/10;
	$("#money").html(money.toFixed(1));
}, 100);
*/