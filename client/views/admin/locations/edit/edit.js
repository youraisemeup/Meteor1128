var pageSession = new ReactiveDict();

Template.AdminLocationsEdit.rendered = function() {
};

Template.AdminLocationsEdit.events({

});

Template.AdminLocationsEdit.helpers({

});

Template.AdminLocationsEditEditForm.rendered = function() {

	pageSession.set("adminLocationsEditEditFormInfoMessage", "");
	pageSession.set("adminLocationsEditEditFormErrorMessage", "");

	$(".input-group.date").each(function() {
		var format = $(this).find("input[type='text']").attr("data-format");

		if(format) {
			format = format.toLowerCase();
		}
		else {
			format = "mm/dd/yyyy";
		}

		$(this).datepicker({
			autoclose: true,
			todayHighlight: true,
			todayBtn: true,
			forceParse: false,
			keyboardNavigation: false,
			format: format
		});
	});

	$("input[type='file']").fileinput();
	$("input[autofocus]").focus();
};

Template.AdminLocationsEditEditForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("adminLocationsEditEditFormInfoMessage", "");
		pageSession.set("adminLocationsEditEditFormErrorMessage", "");

		var self = this;

		function submitAction(msg) {
			var adminLocationsEditEditFormMode = "update";
			if(!t.find("#form-cancel-button")) {
				switch(adminLocationsEditEditFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("adminLocationsEditEditFormInfoMessage", message);
					}; break;
				}
			}

			Router.go("admin.locations", {});
		}

		function errorAction(msg) {
			var message = msg || "Error.";
			pageSession.set("adminLocationsEditEditFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				var tmp = values.regions.split('\n');
				values.regions = tmp;

				Locations.update({ _id: t.data.edit_location._id }, { $set: values }, function(e) { if(e) errorAction(e.message); else submitAction(); });
			}
		);

		return false;
	},
	"click #form-cancel-button": function(e, t) {
		e.preventDefault();



		Router.go("admin.locations", {});
	},
	"click #form-close-button": function(e, t) {
		e.preventDefault();

		/*CLOSE_REDIRECT*/
	},
	"click #form-back-button": function(e, t) {
		e.preventDefault();

		/*BACK_REDIRECT*/
	}


});

Template.AdminLocationsEditEditForm.helpers({
	"infoMessage": function() {
		return pageSession.get("adminLocationsEditEditFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("adminLocationsEditEditFormErrorMessage");
	},
	"getRegions": function(regions) {
		return regions.join().replace(/,/g, '\n');
	}
});
