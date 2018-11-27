this.AdminIndustrySubSectorEditController = RouteController.extend({
	template: "Admin",
	

	yieldTemplates: {
		'AdminIndustrySubSectorEdit': { to: 'AdminSubcontent'}
		
	},

	onBeforeAction: function() {
		/*BEFORE_FUNCTION*/
		this.next();
	},

	action: function() {
		if(this.isReady()) { this.render(); } else { this.render("Admin"); this.render("loading", { to: "AdminSubcontent" });}
		/*ACTION_FUNCTION*/
	},

	isReady: function() {
		

		var subs = [
			Meteor.subscribe("edit_industry_sub_sector", this.params.id)
		];
		var ready = true;
		_.each(subs, function(sub) {
			if(!sub.ready())
				ready = false;
		});
		return ready;
	},

	data: function() {
		

		return {
			params: this.params || {},
			edit_industry_sub_sector: IndustrySubSector.findOne({_id:this.params.id}, {})
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
	}
});