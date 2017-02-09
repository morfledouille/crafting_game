
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


Game.Init = function(){

	Game.GlobalMultiplier = 1;

	Game.priceIncrease = 1.1;

	
	Game.WreckingBonus=0;

	
	Game.recalculateGains=1;

	
	Game.SaveTo='testtest';
	
	Game.CraftsInProgress = [];
	Game.AdvInStore = [];
	
	Game.ItemTypes=["sword","dagger","axe"];
	
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
		str+= '<button class="inline" id="menu_stats">stats</button>';

		$('#RightColumn').html(str);
		AddEvent(l('menu_generators'),'click',function(){Game.ShowMenu('generators');});
		AddEvent(l('menu_city'),'click',function(){Game.ShowMenu('city');});
		AddEvent(l('menu_craft'),'click',function(){Game.ShowMenu('craft');});
		AddEvent(l('menu_stats'),'click',function(){Game.ShowMenu('stats');});



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
				str+= '<div class="Building_Case" id="Building_Case_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Building_Case_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.BuildingsById['+me.id+'],\'Building_Case_'+me.id+'\')" onclick="Game.BuildingsById['+me.id+'].Buy()"><img src="img/'+me.name+'.png"><div class="Building_Name">'+me.name+'</div><div class="Building_Amount">'+me.amount+'</div></div>';
			}
		}
		if (Game.onMenu=='craft') 
		{
			str+='<hr><div  class="section">Workshop</div><hr>';
			str+='<div id="Craft_Menu">';
			for (var i in Game.ItemTypes)
			{
				str+='<div onclick="Game.ShowCraftMenu(\''+Game.ItemTypes[i]+'\')" class="Craft_Menu_Tab">';
				str+='<img src="img/'+Game.ItemTypes[i]+'.png">';
				str+='<div>'+Game.ItemTypes[i]+'</div>';
				str+='</div>';
			}
			str+='</div>';
			str+='<hr>';
			str+='<div id="craft_section_1">';
			for (var i in Game.Objects) 
			{
				var me = Game.Objects[i];
				if(Game.onCraftMenu == me.type)
				{
					str+='<div class="Craft_Item" id="Craft_Item_1_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Craft_Item_1_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+me.id+'],\'Craft_Item_1_'+me.id+'\')" onclick="Game.ObjectsById['+me.id+'].Craft()" >';
					str+= '<img src="img/'+me.code+'.png">';
					str+='<div class="">'+me.name+'</div>';
					str+='</div>';
				}								
			}
			str+='</div>';
			str+='<div id="craft_section_2">';
			for (var i in Game.CraftsInProgress) {
				str += Game.GetCraftDOM(i);
			}
			str+='</div>';

		}
		if (Game.onMenu=='stats') 
		{
			str+='<hr><div  class="section">Stats</div><hr>';
			str += '<div id="Stats_Storage">';
			for (var i in Game.Objects) {
				var me = Game.Objects[i];
				if(me.amount > 0) str+= '<img id="Stats_Item_'+me.id+'" onmouseout="Game.RemoveTooltip(\'Stats_Item_'+me.id+'\')" onmouseover="Game.GetTooltip(Game.ObjectsById['+me.id+'],\'Stats_Item_'+me.id+'\')" src="img/'+me.code+'.png">';
			}
			str += '</div>';
		}
		if (Game.onMenu=='options') 
		{
			str += 'options';
		}
		$('#CenterColumn').html(str);
	}			

	Game.Spend=function(What,howmuch)
	{
		var Mat = Game.TypeOfMat(What);
		Mat.amount-=howmuch;
	}
	
	Game.Earn=function(What,howmuch)
	{
		var Mat = Game.TypeOfMat(What);
		Mat.amount +=howmuch;
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
		Game.Resources['wood'].Ps *= (1 + 0.2*Game.Buildings['Mine'].amount );
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
		for (var i in Game.ObjectsById)
		{			
			if (Game.ObjectsById[i].type == type && (value/Game.ObjectsById[i].gold)<min ) break;
		}
		return[i-1,(value/Game.ObjectsById[i-1].gold)];
		
	}
	
	Game.TypeOfMat=function(what)
	{
		if (Game.Resources[what])	return Game.Resources[what];
		else return Game.Objects[what];
	}
	
	Game.GetPrice=function(item,p_index)
	{
		var price = item.basePrice[p_index].val;
		if (item.title == "Building") price *= Math.pow(1.15,item.amount);
		return Math.floor(price);
	}
	
	Game.Enough_Resources=function(item)
	{
		var enough_resources = 1;
		var price ;
		for (var i in item.basePrice)
		{
			price = Game.GetPrice(item,i);
			var Mat = Game.TypeOfMat(item.basePrice[i].name);
			if (price > Mat.amount)  enough_resources=0;
		}
		return enough_resources;
	}
	
	//////////////////////////////////
	//			ITEMS				//
	//////////////////////////////////
	
	
	Game.Objects=[];
	Game.ObjectsById=[];
	Game.ObjectsN=0;
	
	Game.Object=function(name,code,type,desc,gold,price,time)
	{
		this.id=Game.ObjectsN;
		this.name=name;
		//this.common=commonName;
		this.basePrice=price;
		this.time = time;
		this.type = type;
		this.desc = desc;
		this.gold = gold;
		this.amount=0;
		this.locked=1;
		this.title="Item";
		
		this.Craft=function()
		{
			if(Game.Enough_Resources(this))
			{
				var cost;
				for (var i in this.basePrice)
				{
					cost = Game.GetPrice(this,i);
					Game.Spend(this.basePrice[i].name,cost)
				}
				Game.CraftsInProgress.push({id:this.id,time:this.time*Game.fps});
				var str = Game.GetCraftDOM(Game.CraftsInProgress.length-1);
				$('#craft_section_2').append(str);
				
			}
		}
		
		this.ComputeTooltip=function()
		{
			var tooltip = ''
			tooltip += '<div class="title"><strong>'+this.name+'</strong></div><hr>';
			tooltip += '<div>owned : <strong>'+this.amount+'</strong></div><hr>';
			tooltip += '<img class="Craft_Pic" src="img/'+this.code+'.jpg">';
			tooltip += '<div class="Craft_cost">';
			for (var j in this.basePrice) {
				//that part needs work
				price = Beautify(Game.GetPrice(this,j));
				var Mat = Game.TypeOfMat(this.basePrice[j].name);
				if (Mat.amount < this.basePrice[j].val) price = price.fontcolor("red");
				tooltip += '<div class="'+this.basePrice[j].name+'">'+this.basePrice[j].name+' : <strong>'+price+'</strong></div> ';
			}
			tooltip += '</div><hr class="clear">';
			tooltip += '<div>sells for : '+Beautify(this.gold)+' gold</div><hr>';
			tooltip += '<div>'+this.desc+'</div>';
			return tooltip;
		}		
		
		this.Finish = function()
		{
			for (var i in Game.CraftsInProgress)
				{
					me = Game.CraftsInProgress[i];
					if (me.id == this.id && me.time < 1)
					{
						//WIP can be problematic since it makes no difference between several items with the same id, but the chances are they were crafted as the same time are very low
						Game.CraftsInProgress.splice(i,1);
						//this.Remove(i);
						Game.UpdateMenu();
						break;
					}
				}
			this.amount++;
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
		
		Game.Objects[this.name]=this;
		Game.ObjectsById[this.id]=this;
		Game.ObjectsN++;
		return this;
	} 
	
	new Game.Object('sword','sword','sword','',100,[{ name : "iron", val: 10 }],2);
	new Game.Object('sword2','sword2','sword','',100,[{ name : "wood", val: 12 }],4);
	new Game.Object('sword3','sword3','sword','',100,[{ name : "leather", val: 12 },{ name : "leather", val: 12 },{ name : "leather", val: 12 },{ name : "leather", val: 12 },{ name : "leather", val: 12 }],3);
	
	new Game.Object('dagger','dagger','dagger','',100,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],3);
	new Game.Object('dagger2','dagger2','dagger','',100,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],3);
	new Game.Object('dagger3','dagger3','dagger','',100,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],3);
	
	new Game.Object('axe','axe','axe','',100,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],3);
	new Game.Object('axe2','axe2','axe','',100,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],3);
	new Game.Object('axe3','axe3','axe','',100,[{ name : "iron", val: 12 },{ name : "leather", val: 12 }],3);
	
	Game.GetCraftDOM = function(index)
		{
			var me = Game.CraftsInProgress[index];
			var str = '';
			str+= '<div id="Craft_Case_'+index+'" class="Craft_Case">';
				
			str+= '<img src="img/'+Game.ObjectsById[me.id].code+'.png">';
			
			str+='<div class="crafting_bar"><div class="crafting_loading"></div>';
			str+='<p><strong><span class="bar_text">'+Game.GetTime2(Math.ceil(me.time/Game.fps))+'</span></strong></p>';
			str+='</div>';
			
			str+= '<img src="img/cancel.png">';
			
			str+='</div>';
			return str;
		}
	
	Game.UpdateCraftingBars = function() {
		for (var i in Game.CraftsInProgress)
		{
			var me=Game.CraftsInProgress[i];
		
		
			var totaltime = Game.ObjectsById[me.id].time*Game.fps;
			var barfill = ~~((totaltime - me.time) / totaltime * 100);
			$("#Craft_Case_"+i+" .crafting_loading").width(barfill+"%");
		
				
		}
		
	}
	
	//////////////////////////////////
	//			BUILDINGS			//
	//////////////////////////////////
	
	
	Game.Buildings=[];
	Game.BuildingsById=[];
	Game.BuildingsN=0;
	
	Game.Building=function(name,desc,price)
	{
		this.id=Game.BuildingsN;
		this.name=name;
		//this.common=commonName;
		this.basePrice=price;
		this.desc = desc;
		this.amount=0;
		this.locked=1;
		this.title="Building";
		
		this.Buy=function() 
		{		
			//Game.GetTooltip(this);
		
			if(Game.Enough_Resources(this))
			{
				var cost;
				for (var i in this.basePrice)
				{
					cost = Game.GetPrice(this,i);
					Game.Spend(this.basePrice[i].name,cost)
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
				//that part needs work
				price = Beautify(Game.GetPrice(this,j));
				var Mat = Game.TypeOfMat(this.basePrice[j].name);
				if (Mat.amount < this.basePrice[j].val) price = price.fontcolor("red");
				tooltip += '<div class="'+this.basePrice[j].name+'">'+this.basePrice[j].name+' : <strong>'+price+'</strong></div> ';
			}
			tooltip += '<hr><div>'+this.desc+'</div>';
			return tooltip;
		}	
		
		Game.Buildings[this.name]=this;
		Game.BuildingsById[this.id]=this;
		Game.BuildingsN++;
		return this;
	} 
	
	new Game.Building('Mine','improve iron generation from all sources',[{ name : "sword2", val: 1 }]);
	new Game.Building('Fort','improve iron generation from all sources',[{ name : "gold", val: 12 }]);
	new Game.Building('Lumber Mill','improve iron generation from all sources',[{ name : "gold", val: 20 },{ name : "wood", val: 40 }]);
	
	Game.GetTooltip=function(item,dest) {
		var tooltip = item.ComputeTooltip();
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
		this.locked=1;
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
		this.locked=1;
		this.busy=0;
		this.title="Adventurer";
		

		Game.Adventurers[this.name]=this;
		Game.AdventurersById[this.id]=this;
		Game.AdventurersN++;
		return this;
	} 
	
	new Game.Adventurer('Bob','',["sword","dagger"]);
	new Game.Adventurer('Tom','',["sword","axe"]);
	new Game.Adventurer('Nob','',["axe","dagger"]);

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
			for (var i in Game.ObjectsById)
			{			
				if (me.choice.includes(Game.ObjectsById[i].type)) choices.push(i);
			}
			var chosen = ~~(Math.random()*choices.length);
			Game.AdvInStore.push({adv:me.id,chosen:chosen});
			var str = Game.GetStoreDOM(Game.AdvInStore.length-1);
			$('#RightColumn').append(str);
			me.busy = 1;
		}
	}
	
	Game.Adventurer_Satisfy = function(index)
	{
		it = Game.ObjectsById[Game.AdvInStore[index].chosen];
		if (it.amount > 0)
		{
			Game.Spend(it.name,1);
			Game.Earn("gold",it.gold);
			Game.Adventurer_Leaves(index);
		}	
	}
	
	Game.Adventurer_Leaves = function(index)
	{
		Game.AdventurersById[Game.AdvInStore[index].adv].busy = 0;
		Game.AdvInStore.splice(index,1);
		$('#Adv_Store_Case_'+index).remove();
		
		//very messy WIP
		for (var i = Number(index+1); i<=Game.AdvInStore.length ;i++)
			{
				$('#Adv_Store_Case_'+i).attr("id", "Adv_Store_Case_"+(i-1));
				$('#Adv_Store_Case_'+i+' .accept').attr("onclick",'Game.Adventurer_Satisfy('+(i-1)+')');
				$('#Adv_Store_Case_'+i+' .refuse').attr("onclick",'Game.Adventurer_Leaves('+(i-1)+')');
			}
	}	
	
	Game.GetStoreDOM = function(index)
		{
			var me = Game.AdvInStore[index];
			var str = '';
			str+= '<div id="Adv_Store_Case_'+index+'" class="Adv_Store_Case">';
				
			str+= '<img class="float" height="100%" width="70px" src="img/'+Game.AdventurersById[me.adv].code+'.png">';
			str+= '<img class="store_item_img" src="img/'+Game.ObjectsById[me.chosen].code+'.png">';
				str+= '<div class="Adv_Store_SubCase" height="100%" >';
				str+= '<div>'+Game.ObjectsById[me.chosen].name+'</div>';
					str+='<div>';
					str+= '<img onclick="Game.Adventurer_Satisfy('+index+')" class="store_icons accept" src="img/accept.png">';
					str+= '<img onclick="Game.Adventurer_Leaves('+index+')" class="store_icons refuse" src="img/refuse.png">';
					str+= '<img class="store_icons suggest" src="img/suggest.png">';
					str+='</div>';
				str+='</div>';
			str+='</div>';
			return str;
		}
	
	//////////////////////////////////
	//			RESOURCES			//
	//////////////////////////////////
	
	
	Game.Resources=[];
	Game.ResourcesById=[];
	Game.ResourcesN=0;
	
	Game.Resource=function(name,commonName)
	{
		this.id=Game.ResourcesN;
		this.name=name;
		this.common=commonName;
		this.amount=0;
		this.max=100;
		this.Ps=4;
		//this.total=0;
		//this.byhand=0;
		//this.clickpow=0;
		this.locked=1;
		this.title="Resource";
		
		
		Game.Resources[this.name]=this;
		Game.ResourcesById[this.id]=this;
		Game.ResourcesN++;
		return this;
	}
	
	new Game.Resource('gold','Gold');
	new Game.Resource('iron','Iron');
	new Game.Resource('wood','Wood');
	new Game.Resource('leather','Leather');
	
	Game.InitResourceHeader=function(){
		var str='';
		//str += '<table>';
		for (var i in Game.Resources) {
			var me = Game.Resources[i];
		str += '<div id="'+me.name+'_line">'+me.name+' <span id="'+me.name+'_Amount">'+Beautify(me.amount)+'</span> / <span id="'+me.name+'_Max">'+Beautify(me.max)+'</span> (<span id="'+me.name+'_Ps">'+Beautify(me.Ps)+'</span>/s) </div>';
		}
		//str += '</table>';
		$('#Resource_Col').html(str);
		
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
	//Game.BuildStore();
	//Game.BuildMenu();
	Game.Loop();
	}


	
Game.Logic=function() {

	
	if (Game.recalculateGains) Game.CalculateGains();
	//if (Game.upgradesToRebuild) Game.RebuildUpgrades();
	//if (Game.upgradesToAdd) Game.AddUpgrades();
	
	var viewportwidth = window.innerWidth;

	for (var i in Game.Resources) {
		Game.Earn(i,Game.Resources[i].Ps/Game.fps);//add resource each tick
		if ((Game.Resources[i].amount > Game.Resources[i].max) && (Game.Resources[i].max != 0)) Game.Resources[i].amount=Game.Resources[i].max;
		$("#"+i+"_Amount").html(Beautify(Game.Resources[i].amount));
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
			Game.ObjectsById[me.id].Finish();
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
		//Game.Resources['FWM'].amount=5555555555555555555555;
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