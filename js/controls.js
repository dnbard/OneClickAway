ko.bindingHandlers.tooltip = {
    init: function(element, valueAccessor) {
        var local = ko.utils.unwrapObservable(valueAccessor()),
            options = {};

        ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
        ko.utils.extend(options, local);

        $(element).tooltip(options);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            $(element).tooltip("destroy");
        });
    },
    options: {        
        trigger: "click",
        html: true
    }
};

ko.bindingHandlers.customVisible = {
    init: function(element, valueAccessor) {
        var value = ko.unwrap(valueAccessor()); // Get the current value of the current property we're bound to
        if (value) $(element).css('opacity', '1');
        else $(element).css('opacity', '0');
    },
    update: function(element, valueAccessor, allBindingsAccessor) {
        var value = ko.unwrap(valueAccessor()); // Get the current value of the current property we're bound to
        if (value) {
        	$(element).css('opacity', '1');
        	$(element).css('display', 'inline-block');
        }
        else {
        	//$(element).fadeTo('fast', 0, function(){$(this).hide(100);});
        	$(element).css('opacity', '0');
        	setTimeout(function(){ $(element).css('display', 'none') },1000);
    	}
    }
};

function baseControl(elem, initValue){
	this.elem = $(elem);

	this.value = ko.observable(initValue);
	this.view = ko.computed(function(){
		return Math.round(this.value());
	}, this);

	this.tooltip = ko.observable('');	    
};

function progressControl(elem, initValue, progressValue){
	$.extend(this, new baseControl(elem, initValue));

	this.progressCurrent = ko.observable(0);
	this.progressMax = ko.observable(progressValue);
	this.progressValue = ko.computed(function(){
		return this.progressCurrent() / this.progressMax() * 100 + '%';
	}, this);
	this.progressDescription = ko.observable('');
};

function levelControl(elem, initValue){
	$.extend(this, new progressControl(elem, initValue, 100));
	this.tooltip(Resources.Tooltips.Level);

	this.addExp = function(value){
		this.progressCurrent(this.progressCurrent() + value);

		var flying = $('<div class="flying" style="color: lightskyblue">+' + value + '</div>');
		$('.hero').append(flying);		
		var offset = $(".level .value").offset();		
		flying.offset({ top: offset.top, left: offset.left})		
		flying.css('opacity', '0');
		setTimeout(function(){flying.remove()}, 2000);
	};

	$(document).on('addexp', $.proxy(function(e, view){
		var exp = view.model.Exp;
		this.progressCurrent(this.progressCurrent() + exp);
		var quest = $('[title="'+ view.name +'"]');
		
		var flying = $('<div class="flying" style="color: lightskyblue">+' + exp + '</div>');
		$('.questPanel').append(flying);		
		var offset = $(".level .value").offset();		
		flying.offset({ top: offset.top, left: offset.left})		
		flying.css('opacity', '0');
		setTimeout(function(){flying.remove()}, 2000);
	}, this));

	this.pointsToSpend = ko.observable(0);

	this.progressCurrent.subscribe($.proxy(function(value){
		if (value >= this.progressMax()){			
			this.value(this.value() + 1);
			this.pointsToSpend(this.pointsToSpend() + 1);
			this.progressCurrent(0);
		}
	}), this);
}

function strengthControl(elem, initValue){
	$.extend(this, new progressControl(elem, initValue, 25));

	this.tooltip(Resources.Tooltips.Strength);

	this.countClick = function(clickCost){	
		var cost = clickCost;
		if (cost > 1) cost = 1;

		var current = this.progressCurrent();
		if (current + cost >= this.progressMax()){
			this.progressMax(this.progressMax() * Resources.Model.StrengthProgressionDificulty);
			this.progressCurrent(0);
			this.value(this.value() + 1);
			new shineControl('.strength .value');
			$(document).trigger('strength-increase');
		} else 
			this.progressCurrent(current + cost);
	};

	this.energyRegenBonus = function(){
		return 1 +(this.value() - 1) * Resources.Model.StrengthEnergyRegen;
	};
};

function energyControl(elem, initValue){
	$.extend(this, new progressControl(elem, initValue, 100));
	this.progressCurrent(this.progressMax());	

	this.clickControl = new timeClickController();

	this.progressColor = ko.computed(function(){
		var value = this.progressCurrent() / this.progressMax();
		var result = 'rgb(' + parseInt(255 - 255 * value) + ',' + parseInt(value * 255) +',0)';
		return result;
	}, this);	

	this.progressDescription = ko.computed(function(){
		var value = this.progressCurrent() / this.progressMax() * 100;
		if (value > 65) return Resources.Model.Energy.full.description;
		else if (value > 45) return Resources.Model.Energy.normal.description;
		else if (value > 15) return Resources.Model.Energy.low.description;		
		return Resources.Model.Energy.empty.description;
	}, this);	

	this.clickCost = function(){

		this.clickControl.put();		
		//this.progressCurrent(median / 100);

		var value = this.progressCurrent() / this.progressMax() * 100;
		if (value > 65) return Resources.Model.Energy.full.cost;
		else if (value > 45) return Resources.Model.Energy.normal.cost;
		else if (value > 15) return Resources.Model.Energy.low.cost;		
		return Resources.Model.Energy.empty.cost;
	}

	this.countClick = function(){
		var current = this.progressCurrent();
		var minus = 10;

		if (current - minus > 0) this.progressCurrent(current - minus);
		else this.progressCurrent(0);
	};

	$(document).on('strength-increase', $.proxy(function(){
		this.progressMax(this.progressMax() + Resources.Model.StrengthEnergyBonus);
	}, this))
}

function timeClickController(){
	this.array = [];

	this.put = function(){
		var current = new Date().getTime();
		this.check();
		this.array.push(current);
	};

	this.interval = 1000;

	this.check = function(){		
		var length = this.array.length;

		if (length > 0)
		{
			var last = this.array[length - 1];
			var current = new Date().getTime();
			if (current - last > this.interval) this.array = [];
			else {
				var count = 0;
				for (var i in this.array){
					var value = this.array[i];
					if (current - value > this.interval) count++;
				}
				if (count > 0) this.array.splice(0, count);
			}
		}
	};

	this.median = function(){		
		var length = this.array.length;		
		if (length == 0) return 0;

		var current = new Date().getTime();
		if (length == 1) return (current - this.array[0] )/ this.interval * 100;

		var result = 0;				
		for(var i = 0; i < length - 1; i++){
			result += this.array[i + 1] - this.array[i];
		}

		result = result / (this.array.length - 1) / this.interval * 100;
		return result;
	}
}

function shineControl(elem){
	this.target = $(elem);
	this.elem = $('<div class="shine"></div>');

	var offset = this.target.offset();
	offset.top -= 110 - 32;
	offset.left -= 110 - 58;	
	this.elem.offset(offset);

	$('body').append(this.elem);

	setTimeout($.proxy(function(){this.elem.addClass('animation')}, this), 10);
	setTimeout($.proxy(function(){
		this.elem.removeClass('animate');
		this.elem.addClass('fade');
	}, this), 1010);
	setTimeout($.proxy(function(){this.elem.remove();}, this), 2010);
}

function creatureControll(creature){
	this.id = ko.observable(creature.type);
	this.health = ko.observable(creature.health);
	this.maxHealth = ko.observable(creature.health);

	this.currentHealth = ko.computed(function(){
		return this.health() / this.maxHealth() * 100 + '%';
	}, this);

	this.damage = function(amount){
		if(amount <= 0) return;

		var current = this.health(); 
		this.health(current - amount);
		if (this.health() <= 0) $(document).trigger('creaturedead');
	};
}