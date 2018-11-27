var pageSession = new ReactiveDict();
searchVisible = 0;
transparent = true;
numberOfIndustry = 0;
console.log('validator');
Template.UserInsertListing.onDestroyed(function () {
    // deregister from some central store
    if (!pageSession.get("updateListing")) {
        var data = Template.currentData();
        console.log('onDestroy', Template.currentData());
        Listing.remove({
            _id: data.params.id
        }, {
            company_name: {
                $exists: false
            }
        });
    }
});
Template.UserInsertListing.rendered = function () {
    $('[rel="tooltip"]').tooltip();
    $('#type').select2();
    $('#consultant_type').select2();
    $('#contractor_type').select2();
    $('#supplier_type').select2();
    $('#regions').select2({
        placeholder: "Select the regions you service."
    });
    $('#areas_serviced').select2({
        placeholder: "Select a state"
    });
    $('#project_team_location').select2({
        placeholder: "Select a location"
    });
    var $validator = $("#form").validate({
        errorClass: "listing-error-class",
        validClass: "listing-valid-class",
        rules: {
            type: "required",
            company_name: "required",
            areas_serviced: "required",
            acn_abn: "required",
            company_short_description: "required",
            company_long_description: "required",
            website: "required",
            company_email: {
                required: true,
                email: true
            },
            industry: {
                required: true
            },
            industry_sub_sector: {
                required: true
            }
        },
        errorPlacement: function (error, element) {
            var name = $(element).attr("name");
            error.appendTo($("#" + name + "_validate"));
        },
        messages: {
            type: "Please choose one of the above",
            company_name: "Company name is required.",
            areas_serviced: "Please choose atleast one area you service.",
            acn_abn: "Your company ACN / ABN is required.",
            company_short_description: "Please provide a short description about your business.",
            company_long_description: "Please provide a detailed description about your business.",
            website: "Your company website address is required.",
            company_email: {
                required: "Please provide your business contact email address.",
                email: "Please provide a valod email address."
            },
            industry: {
                required: "Please choose atleast one industry sector you service."
            },
            industry_sub_sector: {
                required: "Please choose atleast one industry sector you service."
            }
        }
    });
    $('#wizard').bootstrapWizard({
        'tabClass': 'cd-breadcrumb triangle',
        'nextSelector': '.btn-next',
        'previousSelector': '.btn-previous',
        onInit: function (tab, navigation, index) {},
        onNext: function (tab, navigation, index) {
            console.log(index);
            console.log(index);
            var $valid = true
            $(".tab_" + index).each(function (i, e) {
                var attr = $(e).attr('name');
                if (typeof attr !== typeof undefined && attr !== false) {
                    var val = $validator.element(e);
                    if (!val) $valid = false;
                }
            });
            //var $valid = $("#"+thisTab).valid();
            if (!$valid) {
                $validator.focusInvalid();
                return false;
            }
            var $total = navigation.find('li').length;
            var $current = index + 1;
            var wizard = navigation.closest('.wizard-card');
            //If it's the last tab then hide the last button and show the finish instead
            if (index === 5) {
                //$("#form").submit();
            }
            if ($current >= $total) {
                $(wizard).find('.btn-next').hide();
                $(wizard).find('.btn-finish').show();
            } else {
                $(wizard).find('.btn-next').show();
                $(wizard).find('.btn-finish').hide();
            }
            $(window).scrollTop()
        },
        onTabClick: function (tab, navigation, index) {
            // Disable the posibility to click on tabs
            return false;
        }
    });
};
Template.UserInsertListing.events({
    "submit": function (e, t) {
        e.preventDefault();
        pageSession.set("userListingsInsertInsertFormInfoMessage", "");
        pageSession.set("userListingsInsertInsertFormErrorMessage", "");
        console.log('Submit');
        var self = this;
        var _id = this.params.id;

        function submitAction(msg) {
            var userListingsInsertInsertFormMode = "insert";
            if (!t.find("#form-cancel-button")) {
                switch (userListingsInsertInsertFormMode) {
                case "insert":
                    $(e.target)[0].reset();
                    pageSession.set("updateListing", true);
                    break;
                case "update":
                    var message = msg || "Saved.";
                    pageSession.set("userListingsInsertInsertFormInfoMessage", message);
                    break;
                }
            }
            Router.go("user.listings", {});
        }

        function errorAction(msg) {
            var message = msg || "Error.";
            pageSession.set("userListingsInsertInsertFormErrorMessage", message);
        }
        validateForm(
        $(e.target), function (fieldName, fieldValue) {}, function (msg) {}, function (values) {
            console.log(values);
            var expirationDate = moment().add(1, 'y').toDate();
            console.log(expirationDate);
            values.expirationDate = expirationDate;
            values.status = 'active';
            newId = Listing.update({
                _id: _id
            }, {
                $set: values
            }, function (e) {
                if (e) {
                    errorAction(e.message);
                } else {
                    // send email
                    var user = Meteor.user();
                    var to = user.emails[0].address;
                    var name = user.profile.name;
                    var message = 'Hi ' + name + ",\n\n";
                    message += "Welcome to the PM Data Listers group, you can manage your listing and change the information whenever you wish. All new listings will be reviewed to ensure you are reflecting your own website correctly.\n\nShare this with your peers and colleagues to grow support of the site and make it more useful for project managers, contract administrators and professional companies like you. \n\n";
                    message += "Share this with your peers and colleagues to grow support of the site and make it more useful for project managers, contract administrators and professional companies like you.\n\n";
                    message += "You can view the listing details at the address below.\n\n";
                    message += "http://pmdata.com.au/listing/" + _id + "\n\n";
                    message += "Kind regards,\n\nThe PM Data Team\n";
                    var options = {
                        from: 'noreply@pmdata.com.au',
                        to: to,
                        bcc: 'service@pmdata.com.au',
                        subject: 'PM Data Confirmation',
                        text: message
                    };
                    Meteor.call('sendMail', options);
                    var adminOptions = {
                        from: to,
                        to: 'admin@pmdata.com.au',
                        subject: 'New PM Data listing submission',
                        bcc: 'service@pmdata.com.au',
                        text: "A new listing has been submitted on PM Data. You can view the listing details at the address below.\n\nhttp://bizdev.pmdata.com.au/admin/listings/edit/" + _id + "/" + values.modifiedBy + "\n\n"
                    };
                    Meteor.call('sendMail', adminOptions);
                    submitAction();
                }
                //Meteor.call('listingUpsert', Router.current().params.id, values);
            });
            return false;
        });
    },
    "click #form-cancel-button": function (e, t) {
        e.preventDefault();
        if (this.edit_listing && this.edit_listing.images) {
            _.forEach(this.edit_listing.images, function (obj) {
                Meteor.call('deleteFile', Router.current().params.id, obj.name);
            });
        }
        if (this.edit_listing && this.edit_listing.logo) {
            _.forEach(this.edit_listing.logo, function (obj) {
                Meteor.call('deleteLogo', Router.current().params.id, obj.name);
            });
        }
        Listing.remove({
            _id: this.params.id
        });
        Router.go("user.listings", {});
    },
    "click #form-close-button": function (e, t) {
        e.preventDefault(); /*CLOSE_REDIRECT*/
    },
    "click #form-back-button": function (e, t) {
        e.preventDefault(); /*BACK_REDIRECT*/
    },
    "change #field-images": function (e, t) {
        e.preventDefault();
        var fileInput = $(e.currentTarget);
        var dataField = fileInput.attr("data-field");
        var hiddenInput = fileInput.closest("form").find("input[name='" + dataField + "']");
        FS.Utility.eachFile(event, function (file) {
            Files.insert(file, function (err, fileObj) {
                if (err) {
                    console.log(err);
                } else {
                    hiddenInput.val(fileObj._id);
                }
            });
        });
    },
    "click #form-add-address-button": function (e) {
        e.preventDefault();
        Modal.show('addNewAddress');
    },
    "click #consultant": function (e) {
        Session.set("type", $("#consultant").val());
    },
    "click #contractor": function (e) {
        Session.set("type", $("#contractor").val());
    },
    "click #supplier": function (e) {
        Session.set("type", $("#supplier").val());
    },
    "click #all": function (e) {
        //$(".industry").prop('checked', $(this).prop("checked"));
        var x = $("#all").is(":checked");
        if (x) {
            $('#industry .industry').prop('checked', 'checked');
        } else {
            $('#industry .industry').removeAttr('checked');
        }
    },
    "click #checkbox": function (e) {
        if ($("#checkbox").is(':checked')) {
            $("#regions > optgroup > option").prop("selected", "selected");
            $("#regions").trigger("change");
        } else {
            $("#regions > optgroup > option").removeAttr("selected");
            $("#regions").trigger("change");
        }
    },
    "click #checkboxLoc": function (e) {
        if ($("#checkboxLoc").is(':checked')) {
            $("#project_team_location > option").prop("selected", "selected");
            $("#project_team_location").trigger("change");
        } else {
            $("#project_team_location > option").removeAttr("selected");
            $("#project_team_location").trigger("change");
        }
    },
    "click #terms": function (e) {
        if ($("#terms").is(":checked")) {
            $("#form-button").removeAttr('disabled');
        } else {
            $("#form-button").attr('disabled', 'disabled');
        }
    }
});
Template.UserInsertListing.helpers({
    getContractors: function () {
        var raw = ContractorType.find({}, {
            sort: {
                name: 1
            }
        }).fetch();
        var filtered = [];
        var searchString = 'head';
        var regEx = new RegExp(searchString, "i");
        var searchFields = ["name"];
        filtered = _.filter(raw, function (item) {
            var match = false;
            _.each(searchFields, function (field) {
                var value = (getPropertyValue(field, item) || "") + "";
                match = match || (value && value.match(regEx));
                if (match) {
                    return false;
                }
            })
            return match;
        });
        var arr = _.union(filtered, raw);
        return arr;
    },
    "infoMessage": function () {
        return pageSession.get("adminListingsInsertInsertFormInfoMessage");
    },
    "errorMessage": function () {
        return pageSession.get("adminListingsInsertInsertFormErrorMessage");
    },
    myFormData: function () {
        return {
            directoryName: 'images',
            prefix: this.params.id,
            _id: this.params.id
        }
    },
    myLogoData: function () {
        return {
            directoryName: 'logo',
            prefix: this.params.id,
            _id: this.params.id
        }
    },
    filesToUpload: function () {
        return Uploader.info.get();
    },
    isConsultant: function () {
        return Session.get("type") === 'consultant';
    },
    isContractor: function () {
        return Session.get("type") === 'contractor';
    },
    isSupplier: function () {
        return Session.get("type") === 'supplier';
    },
    amount: function () {
        if (Session.get("type") === "consultant") {
            return this.edit_listing.consultant_type ? this.edit_listing.consultant_type.length * 100 : 0;
        }
        if (Session.get("type") === "contractor") {
            return this.edit_listing.contractor_type ? this.edit_listing.contractor_type.length * 100 : 0;
        }
        if (Session.get("type") === "supplier") {
            return this.edit_listing.supplier_type ? this.edit_listing.supplier_type.length * 100 : 0;
        }
    }
});