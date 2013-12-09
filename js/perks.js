function perksModel(perk){
	this.name = perk.name;
	this.obtained = ko.observable(false);
}