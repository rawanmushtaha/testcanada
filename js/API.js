//server path
var server = "https://localhost/rewards/PHP/";
//			  https://localhost/rewards/PHP/inc/api.php/businesses/1?transform=1
// server = "http://cbr-portal.appspot.com";
function apiCancelOrder(cancelOrderObj , businessid , sessionid , oid ,  successFn, failFn) {
	var oid = JSON.stringify(cancelOrderObj.oid);

	$.ajax({
		type : "POST",
		url : server + "/api/pizza/" + businessid + "/" + sessionid + "/" + oid + "/cancelOrder",
		dataType : 'json',
		data : JSON.stringify(cancelOrderObj),
		contentType : "application/json; charset=utf-8",
		success : successFn,
		error : failFn
	});

}

function apiGetOrderHistory(businessid, sessionid, email, successFn, failFn) {
	$.ajax({
		type : "GET",
		url : server + "/api/pizza/" + businessid + "/" + sessionid + "/getOrders?username=" + email,
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		success : successFn,
		error : failFn
	});
}
function apiSendOrderObjectToServer(orderObj, businessid, sessionid, successFn, failFn) {
	$.ajax({
		type : "POST",
		url : server + "/api/pizza/" + businessid + "/" + sessionid + "/addOrder",
		dataType : 'json',
		data : JSON.stringify(orderObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

function apiGetBusinessData(businessid, successFn, failFn) {
	$.ajax({
		type : "GET",
		url : server + "inc/api.php/businesses/" + businessid + "/?transform=1",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

function apiGetDeals(businessid, successFn, failFn) {
	$.ajax({
		type : "GET",
		url : server + "/api/pizza/" + businessid + "/getDeals",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

function apiGetMenuDetail(businessid, id, successFn, failFn) {
	$.ajax({
		type : "GET",
		url : server + "/api/pizza/" + businessid + "/" + id + "/getMenuDetail",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

function apiGetMenus(businessid, parentID, successFn, failFn) {
	$.ajax({
		type : "GET",
		url : server + "/api/pizza/" + businessid + "/" + parentID + "/getMenus",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* find customer */
function apiFindCustomers(radius, businessId, sessionId, successFn, failFn) {

	var obj = {
		radius : radius,
		businessid : businessId,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + sessionId + "/findCustomers",
		dataType : "json",
		data : JSON.stringify(obj),
		contentType : "application/json; charset=utf-8",
		async : false,
		success : successFn,
		error : failFn
	});

}

/* send mass sms */
function apiSendMessage(method, message, addToBoard, type, mtype, sessionId, businessId, successFn, failFn) {

	var obj = {
		method : method,
		message : message,
		addToBoard : addToBoard,
		type : type,
		mtype : mtype,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + sessionId + "/" + businessId + "/sendMessage",
		dataType : "json",
		data : JSON.stringify(obj),
		contentType : "application/json; charset=utf-8",
		async : false,
		success : successFn,
		error : failFn
	});
}

/* payment api */
function apiStripeCallBack(payType, balance, tokenId, sessionId, successFn, failFn) {

	var obj = {
		type : payType,
		total : balance,
		token : tokenId
	};

	$.ajax({
		type : "POST",
		url : server + '/api/cbr/' + sessionId + '/processStripePayment',
		dataType : 'json',
		data : JSON.stringify(obj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* orderEquipment api */
function apiOrderEquipment(qObj, sessionId, successFn, failFn) {

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + sessionId + "/orderEquipment",
		dataType : "json",
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* refillAccount api */
function apiRefillAccount(amount, businessId, sessionId, successFn, failFn) {

	var qObj;
	qObj = {
		amount : amount,
		businessid : businessId,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + sessionId + "/refillAccount",
		dataType : "json",
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* update consumer profile api */
function apiUpdateConsumerProfile(userid, firstname, lastname, email, password, phone, address, postalcode, ctype, latitude, longitude, smsconcent, emailconcent, sessionId, successFn, failFn) {

	var qObj = {
		id : userid,
		firstname : firstname,
		lastname : lastname,
		email : email,
		password : password,
		phone : phone,
		address : address,
		postalcode : postalcode,
		ctype : ctype,
		lat : latitude,
		lon : longitude,
		smsconcent : smsconcent,
		emailconcent : emailconcent,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + sessionId + "/updateProfile",
		dataType : 'json',
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* member feedback api */
function apiRecordMemeberFeedback(businessId, firstname, lastname, email, phone, message, sessionId, successFn, failFn) {

	var qObj;
	var serviceURL;

	qObj = {
		businessid : businessId,
		firstname : firstname,
		lastname : lastname,
		email : email,
		phone : phone,
		message : message,
	};

	if (localStorage.getItem('userStatus') == 'Active') {
		serviceURL = server + "/api/cbr/" + sessionId + "/memeberFeedback";
	} else {
		serviceURL = server + "/api/cbr/visitorFeedback";
	}

	$.ajax({
		type : "POST",
		url : serviceURL,
		dataType : 'json',
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* recovery password api */
function apiRecoverPassword(username, successFn, failFn) {

	var forgotPasswordObj;

	forgotPasswordObj = {
		username : username,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/recoverPassword",
		dataType : 'json',
		data : JSON.stringify(forgotPasswordObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* signup api */
function apiSignup(cardid, firstname, lastname, email, password, phone, address, lat, lon, postalcode, cashback, ctype, smsconcent, emailconcent, promocode, business, businesstype, model, successFn, failFn) {

	var signupObj;

	if (ctype == 'Consumer') {

		signupObj = {
			cardid : cardid,
			firstname : firstname,
			lastname : lastname,
			email : email,
			password : password,
			phone : phone,
			address : address,
			lat : lat,
			lon : lon,
			postalcode : postalcode,
			cashback : cashback,
			ctype : "Consumer",
			smsconcent : smsconcent,
			emailconcent : emailconcent,
		};

	} else if (ctype == 'Business') {

		signupObj = {
			promocode : promocode,
			firstname : firstname,
			lastname : lastname,
			email : email,
			password : password,
			phone : phone,
			address : address,
			postalcode : postalcode,
			ctype : "Business",
			business : business,
			businesstype : businesstype,
			lat : lat,
			lon : lon,
			model : model,
		};

	}

	$.ajax({

		type : "POST",
		url : server + "/api/cbr/signup",
		dataType : 'json',
		data : JSON.stringify(signupObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* login api */
function apiLogin(username, membershipid, phone, password, successFn, failFn) {

	var loginObj;

	if (membershipid != null) {
		loginObj = {
			membershipid : membershipid,
			password : password
		};
	} else if (phone != null) {
		loginObj = {
			phone : phone,
			password : password
		};
	} else {
		loginObj = {
			username : username,
			password : password
		};
	}

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/login",
		dataType : 'json',
		data : JSON.stringify(loginObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* auto login api */
function apiAutoLogin(SECRET, bid, successFn, failFn) {

	var qObj = {
		SECRET : SECRET,
	};

	also(JSON.stringify(qObj));

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + bid + "/autoLogin",
		dataType : 'json',
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* transaction history api */
function apiTransactionHistory(sessionId, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/cbr/" + sessionId + "/getTransactionHistory?from=0&size=25",
		dataType : "json",
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* api BusinessTransactions */
function apiBusinessTransactions(activeUserType, sessionId, businessId, yymm, successFn, failFn) {

	var serviceURL = null;

	if (activeUserType == "Consumer") {
		serviceURL = server + "/api/reports/" + sessionId + "/consumerTransactions?ym=" + yymm;

	} else {
		serviceURL = server + "/api/reports/" + sessionId + "/" + businessId + "/businessTransactions?ym=" + yymm;
	}

	$.ajax({
		type : "GET",
		url : serviceURL,
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* message board */
function apiMessageBoard(latitude, longitude, userId, successFn, failFn) {

	var serviceURL = server + "/api/EMessageBoard/" + userId + "/getMessages?lat=" + latitude + "&lon=" + longitude;

	$.ajax({
		type : "GET",
		url : serviceURL,
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* business finder with radius */
function apiGetNeerBusinessesWithRadius(sessionId, latitude, longitude, limit, type, successFn, failFn) {

	if (typeof latitude == "undefined") {
		console.debug("Hey!");
	}
	var serviceURL = server + "/api/cbr/" + sessionId + "/getNeerBusinesses?lat=" + latitude + "&lon=" + longitude + "&limit=" + limit + "&catid=" + type;
	$.ajax({
		type : "GET",
		url : serviceURL,
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* apiAddReceipts */
function apiAddReceipts(imagedata, sessionId, successFn, failFn) {

	var obj = {
		imagedata : imagedata,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + sessionId + "/addReceipt",
		dataType : 'json',
		data : JSON.stringify(obj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* apiGetReceipts */
function apiGetReceipts(sessionId, successFn, failFn) {

	var serviceURL = server + "/api/cbr/" + sessionId + "/getReceipts";

	$.ajax({
		type : "GET",
		url : serviceURL,
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* apiConvertPoint */

function apiConvertPoint(businessId, storeid, points, amount, fee, visa, sessionId, successFn, failFn) {

	var obj = {
		businessid : businessId,
		storeid : storeid,
		points : points,
		amount : amount,
		fee : fee,
		visa : visa,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + sessionId + "/convert",
		dataType : 'json',
		data : JSON.stringify(obj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* api business profile (business landing) */
function apiGetBusinessProfile(sessionId, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/cbr/" + sessionId + "/getBusinessProfile",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* api consumer profile (consumer landing) */
function apiGetConsumerProfile(sessionId, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/cbr/" + sessionId + "/getConsumerProfile",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

function servicePostAPI(obj, serviceURL, successFn, failFn) {

	$.ajax({
		type : "POST",
		url : serviceURL,
		dataType : 'json',
		data : JSON.stringify(obj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

function serviceGetAPI(serviceURL, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : serviceURL,
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/** *************** ADMIN SUB PAGES **************** */

/* apiUpdateBusinessProfile */
function apiUpdateBusinessProfile(id, firstname, lastname, email, password, phone, address, postalcode, ctype, business, businesstype, latitude, longitude, sessionId, successFn, failFn) {

	var qObj = {
		id : id,
		firstname : firstname,
		lastname : lastname,
		email : email,
		password : password,
		phone : phone,
		address : address,
		postalcode : postalcode,
		ctype : ctype,
		business : business,
		businesstype : businesstype,
		lat : latitude,
		lon : longitude,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + sessionId + "/updateProfile",
		dataType : 'json',
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* apiGetProducts */
function apiGetProducts(sessionId, businessId, pageNum, successFn, failFn) {
	$.ajax({
		type : "GET",
		url : server + "/api/EProduct/" + sessionId + "/" + businessId + "/getProducts?page=" + pageNum,
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* get machine departement */
function apiGetMatchingDepartment(from, size, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/Department/getMatchingDepartment?filter=&from=" + from + "&size=" + size,
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* api find product */
function apiFindProduct(pid, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/Product/" + pid + "/getProduct",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* api add new product */
function apiAddNewProduct(business, name, description, threshold, qty, price, points, onspecial, specialprice, options, department, tax, barcode, fname, fdescription, foptions, sessionId, successFn, failFn) {

	var ProdJsonObj;

	ProdJsonObj = {
		business : business,
		name : name,
		description : description,
		threshold : threshold,
		qty : qty,
		price : price,
		points : points,
		onspecial : onspecial,
		specialprice : specialprice,
		options : options,
		department : department,
		tax : tax,
		barcode : barcode,
		fname : fname,
		fdescription : fdescription,
		foptions : foptions,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EProduct/" + sessionId + "/addProduct",
		data : JSON.stringify(ProdJsonObj),
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* update product */

function apiUpdateProduc(businessId, name, description, threshold, qty, price, points, onspecial, specialprice, options, department, tax, barcode, fname, fdescription, foptions, sessionId, pid, successFn, failFn) {

	var ProdJsonUpdateObj = {
		business : businessId,
		name : name,
		description : description,
		threshold : threshold,
		qty : qty,
		price : price,
		points : points,
		onspecial : onspecial,
		specialprice : specialprice,
		options : options,
		department : department,
		tax : tax,
		barcode : barcode,
		fname : fname,
		fdescription : fdescription,
		foptions : foptions,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EProduct/" + sessionId + "/" + pid + "/updateProduct",
		data : JSON.stringify(ProdJsonUpdateObj),
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* delete product */
function apiDeleteProduct(sessionId, pid, successFn, failFn) {

	$.ajax({
		type : "DELETE",
		url : server + "/api/EProduct/" + sessionId + "/" + pid + "/deleteProduct",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* add coupon */
function apiAddCoupon(amount, count, ctype, description, effectivedate, entityid, expirydate, fdescription, fname, minimumPurchase, name, ownertype, used, id, sessionId, successFn, failFn) {

	var CoupJsonObj;

	CoupJsonObj = {
		amount : amount,
		count : count,
		ctype : ctype,
		description : description,
		effectivedate : effectivedate,
		entityid : entityid, // businessId
		expirydate : expirydate,
		fdescription : fdescription,
		fname : fname,
		minimumPurchase : minimumPurchase,
		name : name,
		ownertype : ownertype,
		used : used,
		id : id,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/ECoupon/" + sessionId + "/addCoupon",
		data : JSON.stringify(CoupJsonObj),
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* update coupon */
function apiUpdateCoupon(amount, count, ctype, description, effectivedate, entityid, expirydate, fdescription, fname, minimumPurchase, name, ownertype, used, id, recordNumber, sessionId, CouponId, successFn, failFn) {

	var CoupJsonObj;

	CoupJsonObj = {
		amount : amount,
		count : count,
		ctype : ctype,
		description : description,
		effectivedate : effectivedate,
		entityid : entityid, // businessId
		expirydate : expirydate,
		fdescription : fdescription,
		fname : fname,
		minimumPurchase : minimumPurchase,
		name : name,
		ownertype : ownertype,
		used : used,
		id : id, // $("#CouponId").val()
		recordNumber : recordNumber, // "1000010"
	};

	$.ajax({
		type : "POST",
		url : server + "/api/ECoupon/" + sessionId + "/" + CouponId + "/updateCoupon",
		data : JSON.stringify(CoupJsonObj),
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* get coupon (display coupon) */
function apiGetCoupon(sessionId, businessId, pageNum, admin, successFn, failFn) {

	var serviceURL = '';

	if (admin == "true") {
		serviceURL = server + "/api/ECoupon/" + sessionId + "/" + businessId + "/getCoupons?page=" + pageNum + "&admin=" + admin;
	} else {
		serviceURL = server + "/api/ECoupon/" + sessionId + "/" + businessId + "/getCoupons?admin=" + admin;
	}

	$.ajax({
		type : "GET",
		url : serviceURL,
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* find coupon */
function apiFindCoupon(sessionId, couponid, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/ECoupon/" + sessionId + "/" + couponid + "/getCoupon",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* delete cupon */
function apiDeleteCoupon(sessionId, cid, successFn, failFn) {

	$.ajax({
		type : "DELETE",
		url : server + "/api/ECoupon/" + sessionId + "/" + cid + "/deleteCoupon",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* business apiss */

/* display business */
function apiDisplayBusiness(sessionId, businessId, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/EFranchise/" + sessionId + "/" + businessId + "/getBusiness",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* update business */
function apiUpdateBusiness(fulldescription, fax, website, promotionminpurchase, linkedin, debitcost, promotion, mindelivery, promotiontype, phone2, paymentmethod, twitter, tax, description, facebook, youtube, paymentkey2, paymentkey1, sessionId, businessId, successFn, failFn) {

	var businessObj;

	businessObj = {
		fulldescription : fulldescription,
		fax : fax,
		website : website,
		promotionminpurchase : promotionminpurchase,
		linkedin : linkedin,
		debitcost : debitcost,
		promotion : promotion,
		mindelivery : mindelivery,
		promotiontype : promotiontype,
		phone2 : phone2,
		paymentmethod : paymentmethod,
		twitter : twitter,
		tax : tax,
		description : description,
		facebook : facebook,
		youtube : youtube,
		paymentkey2 : paymentkey2,
		paymentkey1 : paymentkey1,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EFranchise/" + sessionId + "/" + businessId + "/updateBusiness",
		data : JSON.stringify(businessObj),
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* display store */
function apiDisplayStore(sessionId, businessId, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/EFranchise/" + sessionId + "/" + businessId + "/getStores",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* add new store */
function apiAddStore(id, franchise, available, address, latitude, longitude, storeID, title, html, tele, smsn, email, lastSeenOnline, onlyRadius, deliveryRadius, deliverylimit, freedeliverylimit, deliverycost, extradeliverycost, demoMode, start0, end0, start1, end1, start2, end2, start3, end3, start4, end4, start5, end5, start6, end6, password, financial, deleted, sessionId, businessId,
		successFn, failFn) {

	var storeObj = {
		id : id,
		franchise : franchise,
		available : available,
		address : address,
		x : latitude,
		y : longitude,
		storeID : storeID,
		title : title,
		html : html,
		tele : tele,
		smsn : smsn,
		email : email,
		lastSeenOnline : lastSeenOnline,
		onlyRadius : onlyRadius,
		deliveryRadius : deliveryRadius,
		deliverylimit : deliverylimit,
		freedeliverylimit : freedeliverylimit,
		deliverycost : deliverycost,
		extradeliverycost : extradeliverycost,
		demoMode : demoMode,
		start0 : start0,
		end0 : end0,
		start1 : start1,
		end1 : end1,
		start2 : start2,
		end2 : end2,
		start3 : start3,
		end3 : end3,
		start4 : start4,
		end4 : end4,
		start5 : start5,
		end5 : end5,
		start6 : start6,
		end6 : end6,
		password : password,
		financial : financial,
		deleted : deleted,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EFranchise/" + sessionId + "/" + businessId + "/addStore",
		data : JSON.stringify(storeObj),
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* update store */
function apiUpdateStore(id, lid, franchise, available, address, latitude, longitude, storeID, title, html, tele, smsn, email, lastSeenOnline, onlyRadius, deliveryRadius, deliverylimit, freedeliverylimit, deliverycost, extradeliverycost, demoMode, start0, end0, start1, end1, start2, end2, start3, end3, start4, end4, start5, end5, start6, end6, password, financial, deleted, sessionId, businessId,
		successFn, failFn) {

	var storeObj = {
		id : id,
		lid : lid, // stored id
		franchise : franchise,
		available : available,
		address : address,
		x : latitude,
		y : longitude,
		storeID : storeID,
		title : title,
		html : html,
		tele : tele,
		smsn : smsn,
		email : email,
		lastSeenOnline : lastSeenOnline,
		onlyRadius : onlyRadius,
		deliveryRadius : deliveryRadius,
		deliverylimit : deliverylimit,
		freedeliverylimit : freedeliverylimit,
		deliverycost : deliverycost,
		extradeliverycost : extradeliverycost,
		demoMode : demoMode,
		start0 : start0,
		end0 : end0,
		start1 : start1,
		end1 : end1,
		start2 : start2,
		end2 : end2,
		start3 : start3,
		end3 : end3,
		start4 : start4,
		end4 : end4,
		start5 : start5,
		end5 : end5,
		start6 : start6,
		end6 : end6,
		password : password,
		financial : financial,
		deleted : deleted,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EFranchise/" + sessionId + "/" + businessId + "/" + lid + "/updateStore",
		data : JSON.stringify(storeObj),
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* full business profile */
function apiAddRating(clientid, clientAnonymus, when, subject, fbid, subjectid, memo, businessRating, sessionId, successFn, failFn) {

	var ratingObj = {
		clientid : clientid,
		client : clientAnonymus,
		when : when,
		subject : subject,
		fbid : fbid,
		subjectid : subjectid,
		memo : memo,
		level : businessRating,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + sessionId + "/addRating",
		data : JSON.stringify(ratingObj),
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/** *************** PROCESS PAGE **************** */

/* apiGetClient */
function apiFindConsumerByClientId(CunsumerId, businessId, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/EClient/" + CunsumerId + "/" + businessId + "/getClient",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* apiGetClient */
function apiFindConsumerByClientPhone(consumerPhoneNumber, businessId, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/EClient/" + consumerPhoneNumber + "/" + businessId + "/getClientsByPhone",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* apiSignupTempUser */
function apiSignupTempUser(businessId, storeId, phone, cardid, amount, address, firstname, lastname, email, latitude, longitude, sessionId, successFn, failFn) {

	var obj = {
		businessid : businessId,
		storeId : storeId,
		phone : phone,
		cardid : cardid,
		amount : amount,
		address : address,
		firstname : firstname,
		lastname : lastname,
		email : email,
		lat : latitude,
		lon : longitude,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/cbr/" + sessionId + "/signupTempUser",
		dataType : 'json',
		data : JSON.stringify(obj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* api load coupon */
function apiLoadCoupon(sessionId, cid, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/ECoupon/" + sessionId + "/" + cid + "/loadCoupon",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* purchase api */
function apiPurchase(points, amount, agent, coupon, discount, product, client, special, qty, fee, franchise, store, extrapoints, pointused, balanceused, sessionId, successFn, failFn) {

	var qObj = {
		operation : "A",
		points : points,
		amount : amount,
		agent : agent,
		coupon : coupon,
		discount : discount,
		product : product,
		client : client,
		special : special,
		qty : qty,
		fee : fee,
		franchise : franchise, // businessid,
		store : store,
		extrapoints : extrapoints,
		pointused : pointused,
		balanceused : balanceused,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EClient/" + sessionId + "/addTransaction",
		dataType : 'json',
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* api reload card */
function apiReloadCard(points, amount, agent, coupon, product, client, special, qty, franchise, store, sessionId, successFn, failFn) {

	var qObj = {
		operation : "L",
		points : points,
		amount : amount,
		agent : agent,
		coupon : coupon,
		product : product,
		client : client, // clientid
		special : special,
		qty : qty,
		franchise : franchise, // businessid
		store : store,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EClient/" + sessionId + "/addTransaction",
		dataType : 'json',
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

function apiChangeClientId(originalid, newid, successFn, failFn) {

	var obj = {
		"originalid" : originalid,
		"newid" : newid,
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EClient/" + sessionId + "/changeClientID",
		dataType : 'json',
		data : JSON.stringify(obj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* api use reward */
function apiUseReward(points, amount, agent, coupon, product, client, special, qty, franchise, store, sessionId, successFn, failFn) {

	var qObj = {
		operation : "R",
		points : points,
		amount : amount,
		agent : agent,
		coupon : coupon,
		product : product,
		client : client, // cliente id
		special : special,
		qty : qty,
		franchise : franchise, // business id
		store : store,// store id
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EClient/" + sessionId + "/addTransaction",
		dataType : 'json',
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* api new gift card */
function apiNewGiftCard(points, amount, agent, coupon, product, client, special, qty, franchise, store, sessionId, successFn, failFn) {

	var qObj = {
		operation : "G",
		points : points,
		amount : amount,
		agent : agent,
		coupon : coupon,
		product : product, // newGiftCardNo
		client : client, // clientId
		special : special,
		qty : qty,
		franchise : franchise, // businessId
		store : store, // storeId
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EClient/" + sessionId + "/addTransaction",
		dataType : 'json',
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* load gift card */
function apiLoadGiftCard(sessionId, businessId, giftcard, successFn, failFn) {
	$.ajax({
		type : "GET",
		url : server + "/api/cbr/" + sessionId + "/" + businessId + "/" + giftcard + "/readCard",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

/* api apiUseBalance */
function apiUseBalance(points, amount, agent, coupon, product, client, special, qty, franchise, store, sessionId, successFn, failFn) {

	var qObj = {
		operation : "S",
		points : points,
		amount : amount,
		agent : agent,
		coupon : coupon,
		product : product,
		client : client, // client id
		special : special,
		qty : qty,
		franchise : franchise, // businessId,
		store : store, // storeId
	};

	$.ajax({
		type : "POST",
		url : server + "/api/EClient/" + sessionId + "/addTransaction",
		dataType : 'json',
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* api apiFastPurchase */
function apiFastPurchase(points, amount, agent, coupon, product, client, special, qty, fee, franchise, store, extrapoints, pointused, balanceused, sessionId, successFn, failFn) {

	var qObj = {
		operation : "A",
		points : points,
		amount : amount,
		agent : agent,
		coupon : coupon,
		product : product,
		client : client,
		special : special,
		qty : qty,
		fee : fee,
		franchise : franchise, // businessId
		store : store, // storeId
		extrapoints : extrapoints,
		pointused : pointused,
		balanceused : balanceused,

	};

	$.ajax({
		type : "POST",
		url : server + "/api/EClient/" + sessionId + "/addTransaction",
		dataType : 'json',
		data : JSON.stringify(qObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* api apiAddOrder */
function apiAddOrder(address, addressType, deliveryCharge, discount, dtime, finaltotal, total, note, oid, ordertype, pType, promotion, store, taxes, pointused, balanceused, totalbeforetax, username, cart, skipprocess, businessId, sessionId, successFn, failFn) {

	var orderObj = {
		action : "A",
		address : address,
		addressType : addressType,
		deliveryCharge : deliveryCharge,
		discount : discount,
		dtime : dtime,
		finaltotal : finaltotal,
		total : total,
		note : note,
		oid : oid,
		ordertype : ordertype,
		pType : pType,
		promotion : promotion,
		store : store, // storeId,
		taxes : taxes,
		pointused : pointused,
		balanceused : balanceused,
		totalbeforetax : totalbeforetax,
		username : username,
		cart : cart,
		skipprocess : skipprocess
	};

	$.ajax({
		type : "POST",
		url : server + "/api/pizza/" + businessId + "/" + sessionId + "/addOrder",
		dataType : 'json',
		data : JSON.stringify(orderObj),
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

/* check session api */
function apiCheckSession(sessionId, successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/cbr/" + sessionId + "/refreshSession",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});

}

function apiGetBusinessTypes(successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/cbr/getBusinessTypes",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}

function getBusinessCats(successFn, failFn) {

	$.ajax({
		type : "GET",
		url : server + "/api/cbr/getBusinessCats",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}
