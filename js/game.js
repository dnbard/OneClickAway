function ViewModel() {
	this.click = new clickModel();	
	this.controller = new Controller();
	this.quests = new questController();
	this.perks = new perksController();
	this.creature = new creatureControll({type: 'rat', health: 12});

	this.level = new levelControl('.level',1);
	this.strength = new strengthControl('.strength',1);
	this.energy = new energyControl('.energy',0);

	this.init = function(){
		$(document).on('timetick', $.proxy(function(e, tick){
			this.energy.clickControl.check();
			var median = this.energy.clickControl.median();			

			var current = this.energy.progressCurrent();
			var increment = 1 * this.strength.energyRegenBonus() + 0.15 * (1 - current / 100);
			if (median == 0) increment += 5;
			if (current <= this.energy.progressMax()) 
				this.energy.progressCurrent(current + increment);
		}, this));

		$(document).on('creaturedead', $.proxy(function(){
			this.creature.health(this.creature.maxHealth());
			this.level.addExp(10);
		}, this));
	};

	this.init();
};

function Controller(){	
	this.hero = $('.hero');
	this.clickOnMouse = function(){	
		var clickCost = this.energy.clickCost();
		this.click.count(this.click.count() + clickCost);

		clickCost = Math.round(clickCost * 100) / 100;

		var interval = this.click.ticks - this.click.lastClick;
		this.click.lastClick = this.click.ticks;
		this.controller.animate(interval);

		this.energy.countClick();
		this.strength.countClick(clickCost);
		this.creature.damage(clickCost);

		var flying = $('<div class="flying">+' + clickCost + '</div>');
		$('.hero').append(flying);		
		var offset = $(".clicks .value").offset();		
		flying.offset({ top: offset.top, left: offset.left})
		flying.css('opacity', '0');
		setTimeout(function(){flying.remove()}, 2000);

		setTimeout(function(){
			var hit = $('<div class="hit"></div>');
			var left = parseInt(hit.css('left').replace('px', '')) + Math.random() * 80 - 15;
			var top = parseInt(hit.css('top').replace('px', '')) + Math.random() * 80 - 15;
			hit.css('left', left);
			hit.css('top', top);
			var enemy = $('#enemy'); 
			enemy.append(hit);		
			enemy.fadeTo(100, 0.55).fadeTo(100, 1);
			setTimeout(function(){hit.remove()}, 800);	
		}, 200);

		$(document).trigger('gameclick', clickCost);
	};

	this.animate = function(interval){
		if (interval > 0.6 * 10) interval = 0.6 * 10;
		//else if (interval < 0.05 * 10) interval = 0.05 * 10;
		var animationDuration = parseFloat(interval / 10, 1);

		this.hero.css('-webkit-animation', '');
		this.hero.css('-moz-animation','');
		this.hero.css('-ms-animation','');
		this.hero.css('-o-animation','');
		this.hero.css('animation','');
		
		setTimeout($.proxy(function(){
			var cssRule = 'play ' + animationDuration + 's steps(7)';
			this.hero.css('-webkit-animation', cssRule);
			this.hero.css('-moz-animation', cssRule);
			this.hero.css('-ms-animation', cssRule);
			this.hero.css('-o-animation', cssRule);
			this.hero.css('animation', cssRule);
			this.hero.css('animation-iteration-count','1');
		}, this), 1);		
	};
};

function clickModel(){
	this.count = ko.observable(0);
	this.view = ko.computed(function() {
		return Math.round(this.count());
	}, this);

	this.lastClick = -10000;

	this.ticks = 0;
	this.update = function(){
		this.ticks++;
		$(document).trigger('timetick', this.ticks);
	};

	this.interval = 100;
	setInterval($.proxy(this.update, this), this.interval);	
};

function questController(){
	this.values = ko.observableArray();
	for (var i in Resources.Quests){
		this.values.push(new questModel(Resources.Quests[i]));		
	}	
};

function perksController(){
	this.values = ko.observableArray();
	this.values.push(new perksModel({name:'Perk'}));
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);