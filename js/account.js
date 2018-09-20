function loginPrc(action) {
	if (action == "S") {
		$("#loginPop").modal("hide");
		display("signupPage");
		return;
	}
	if (action == "L") {
		alert ("Shoildn't see this");
		return;
	}
	if (action == "R") {
		recoverPassword();
		return;
	}
	if (action == "U") {
		signupClient();
		return;
	}

	var un = $("#loginEmail").val();
	var pw = $("#loginPassword").val();

	localStorage.loginEmail = un;
	localStorage.loginPassword = encryptPassword( pw);

	var email = null;
	var phone = null;
	var memid = null;

	if (!validateEmail(un)){
		$(".alert").html("Please enter a valid email, phone or membership number.");
		$(".alert").show();
		setTimeout(function() {
			$(".alert").hide();
		}, 4000);
		return;
	}

//	if (typeof validate.single(un, {
//		email : true
//	}) == "undefined") {
//		email = un;
//	} else if (typeof validate.single(un, {
//		format : /^\d{10}$/
//	}) == "undefined") {
//		phone = un;
//	} else if (typeof validate.single(un, {
//		format : /189317-\d{7}/
//	}) == "undefined") {
//		memid = un;
//	} else if (typeof validate.single(un, {
//		format : /^\d{7}$/
//	}) == "undefined") {
//		memid = un;
//	} else {
//		$(".alert").html("Please enter a valid email, phone or membership number.");
//		$(".alert").show();
//		setTimeout(function() {
//			$(".alert").hide();
//		}, 4000);
//		return;
//	}
	
	$.ajax({
		type : 'GET',
		url : 'PHP/inc/api.php/profiles?transform=1&filter[]=email,eq,'
				+ un + "&filter[]=password,eq," + pw ,
		dataType : 'json',
		data : null,
		contentType : "application/json; charset=utf-8",
		success : function(data) {
			if (data.profiles.length == 0) {
				$.alert({
					title : 'Error',
					content : 'Invalid username/password combination.',
					icon: 'fa fa-hand-paper-o',
			        theme: 'material',
			        animation: 'scale',
			        type: 'red',
				});

			} else {
				if (data.profiles[0].activated==0){
					$.confirm({
						title : 'Error',
						content : 'Your account is not activated, please check your email and activate your account before trying to login.<br>Do you want us to send the activation email again?',
						icon: 'fa fa-hand-paper-o',
				        theme: 'material',
				        animation: 'scale',
				        type: 'red',
				        buttons: {
				        	yes:{
				                text: 'Send Activation Email Again',
				                btnClass: 'btn-green',
				                action : function () {
				        			$.ajax({
				        				type : 'GET',
				        				url : 'PHP/sendMembershipConfirmationEmail.php?email='+ data.profiles[0].email + '&token=' + data.profiles[0].token+ '&fullname=' + data.profiles[0].fullname,
				        				dataType : 'text',
				        				data : null,
				        				contentType : "text/plain; charset=utf-8",
				        				success : function(data) {
				        					showLoginForm();
				        				},
				        				error : function(data) {
				        					$.alert({
				        						title : 'Error',
				        						content : 'System is not available at this time code:004',
				        						icon: 'fa fa-hand-paper-o',
				        				        theme: 'material',
				        				        animation: 'scale',
				        				        type: 'red',
				        					});
				        				}
				        			});
				                },
				        	},
				            cancel: function () {
				            },
				        }
					});
					return;
				}
				
				userinfo = data.profiles[0];
				$(".clientname").html(userinfo.fullname);
				
				console.log(userinfo);
				
				setupPointCreditButtons();
				
				$("#loginPop").modal("hide");
				setupUI();
				if (loginToCheckout == false) {
					setTimeout(function() {
						successResponse("Welcome back " + userinfo.fullname, 2500);
					}, 500);
				}
			}
		},
		error : function(data) {
			$.alert({
				title : 'Error',
				content : 'System is not available at this time code:006',
				icon: 'fa fa-hand-paper-o',
		        theme: 'material',
		        animation: 'scale',
		        type: 'red',
			});
		}
	});
}