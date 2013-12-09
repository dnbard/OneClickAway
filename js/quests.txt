function questModel(model){
	this.model = model;
	
	this.started = ko.observable(false);
	this.finished = ko.observable(false);
	if (model.hasOwnProperty('Started')) 
		this.started(model.Started);
	
	this.model.view = this;
	this.name = model.Name;
	this.type = 'Quest!';
	this.progression = ko.observable(0);
	this.progressValue = ko.computed(function(){
		return this.progression() + '%';
	}, this);

	this.haveImage = model.hasOwnProperty('Image');
	if (this.haveImage)
		this.image = 'sprite sprite-' + model.Image;
	else this.image = 'sprite sprite-quest';

	if (typeof(this.model.Init) === 'function') this.model.Init(this);
	this.tooltip = ko.computed(function(){
		return '<div class="big">'+ this.name +'</div><div>'+ this.model.Tooltip +'</div><div class="rewardCaption">Reward:</div><div class="reward">'+ this.model.Reward +'</div>';
	},this);

	this.progression.subscribe($.proxy(function(value){
		if (this.started() && !this.finished())
			if (value >= 100) this.dispose();
	}), this);

	this.dispose = function(){
		$(document).trigger('addexp', this);		
		
		if (typeof(this.model.OnDispose) === 'function') this.model.OnDispose();		
		this.finished(true);
	};
}

$(document).on('startquest', function(e, questName) {
	for(var i in Resources.Quests){
		var quest = Resources.Quests[i];
		if (quest.Name == questName){
			quest.view.started(true);			
			break;
		}
	}	
});