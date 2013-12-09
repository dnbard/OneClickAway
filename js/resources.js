/* STRINGS */

function resources(){
	this.Tooltips={
		Strength:'<div class="big">Strength is measurement of physical power of your character.</div></div>Point of Strength will grant:</div><div class="bonus">+8 energy</div><div class="bonus">+5% energy regeneration</div>', 
		Level: '<div class="big">Level is measurement of coolness of your character.</div></div>Each level you will grant:</div><div class="bonus">New trait!</div><div class="bonus">+10% click multiplier</div>'
	};

	this.Model={
		StrengthEnergyBonus: 8,
		StrengthEnergyRegen: 0.05,
		StrengthProgressionDificulty: 1.75,
		Energy: {
			full: {
				description:'full energy, x1.5 click bonus',
				cost: 1.5
			},
			normal: {
				description: 'normal energy', 
				cost: 1
			},
			low: {
				description: 'low energy, x0.75 click penalty',
				cost: 0.75
			},
			empty: {
				description: 'empty energy, x0.25 click penalty',
				cost: 0.25
			}
		}
	};

	this.Quests = [
		{
			Name: '10 clicks',
			Started: true,
			Init: function(view){
				$(document).on('gameclick', $.proxy(function(e, cost){
					this.progression(this.progression() + 10);
				},view));				
			},
			Tooltip: 'Click 10 times',
			Reward: '+10 experience',
			Exp: 10, 
			Image: 'clicks10',
			OnDispose: function(){
				$(document).trigger('startquest', '100 clicks');
				$(document).trigger('startquest', '25 points');
			}			
		},
		{	
			Name: '100 clicks',
			Init: function(view){				
				$(document).on('gameclick', $.proxy(function(e, cost){
					if (view.started())
						this.progression(this.progression() + 1);
				},view));				
			},
			Tooltip: 'Click 100 times',
			Reward: '+25 experience',
			Exp: 25
		}, 
		{
			Name: '25 points',
			Started: false,
			Init: function(view){
				$(document).on('gameclick', $.proxy(function(e, cost){
					if (view.started())
						this.progression(this.progression() + cost * 4);
				},view));				
			},
			Tooltip: 'Acquire 25 points',
			Reward: '+10 experience',
			Exp: 10, 
			OnDispose: function(){
				
			} 
		}
	];
};

var Resources = new resources();