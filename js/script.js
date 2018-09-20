var window_width = $(window).width();
var menu_image_width;
var loadingMenuLevel = 0;
var maxLoadingMenuLevel = 0;
var initWidth = 0;

var businessData = null;
var businessid = 1;
var grpIndex = 0;

var products = null;
// var menus = [];
// var deals = [];
var cart = [];

var dealWizard;
var modWizard;
var cartIdAtHand = null;

var priceTableFreeOption = 0;

var userinfo = null;
var autocomplete1 = null;
var autocomplete2 = null;
var autocomplete3 = null;

var oid = 0;

var lat = 0, lon = 0;
var loginToCheckout = false;
var store = null;
var storeDistance = 0;
var paymentMethod = null;
var orderMethod = "D";
var total = 0;
var sTotal = 0;
var taxes = 0;
var gTotoal = 0;
var delivery = 0;
var pointsValue = 0;
var balanceValue = 0;
var stores = [];
var geocoder = null;
var myMap;
var orderHistory = [];
var showingMsg = false;

var thisPage = 'main';

function readDataFile(file, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("application/json");
	rawFile.open("GET", file, true);
	rawFile.onreadystatechange = function() {
		if (rawFile.readyState === 4 && rawFile.status == "200") {
			callback(rawFile.responseText);
		}
	}
	rawFile.send(null);
}

function getInitialData(func, firstCall) {
	if (firstCall) {
		getBusinessData();
		getStores();
	}
	if (products == null) {
		setTimeout(function() {
			getInitialData(func, false);
		}, 250);
	} else {
		func();
	}
}

// function loadMenuChildrenFormServer(parentID, level) {
//
// var bar = $('.pbar');
// if (loadingMenuLevel == 0) {
// initWidth = 500;
// bar.width(0);
// bar.text(0 + "%");
// }
//
// loadingMenuLevel++;
// if (maxLoadingMenuLevel < loadingMenuLevel) {
// maxLoadingMenuLevel = loadingMenuLevel;
// }
//
// // Didn't find the menu in cache so we have to get it from server
//
// apiGetMenus(businessid, parentID, function(data) {
// if (data.code == "OK") {
// for ( var i in data.list) {
// var menu = data.list[i];
// menus.push(menu);
// if (menu.hasChildren === false) {
// loadMenuDetailsFromServer(menu);
// } else {
// loadMenuChildrenFormServer(menu.id, level + 1);
// }
// }
// loadingMenuLevel--;
//
// setTimeout(function() {
// bar.width(Math.round(initWidth * (maxLoadingMenuLevel - loadingMenuLevel) /
// maxLoadingMenuLevel));
// bar.text((100 * (maxLoadingMenuLevel - loadingMenuLevel) /
// maxLoadingMenuLevel).toFixed(0) + "%");
// }, 50);
//
// if (loadingMenuLevel == 0) {
// lsSet("menuList", JSON.stringify(menus));
// setTimeout(function() {
// $("#loadingData").modal("hide");
// }, 500);
// }
// }
// }, function(error) {
// showDebugInfo(error);
// });
// }
//
// function loadMenuDetailsFromServer(menu) {
// apiGetMenuDetail(businessid, menu.id, function(data) {
// if (data.code == "OK") {
// for ( var m in data.list) {
// menu.modifiers = data.list[m].modifiers;
// }
// lsSet("menuList", JSON.stringify(menus));
// }
// }, function(error) {
// showDebugInfo(error);
// })
// }
//
// function getMenus() {
//
// if (menus.length == 0) {
// if (lsGet("menuList")) {
// menus = JSON.parse(lsGet("menuList"));
// }
// }
//
// if (menus.length == 0) {
// $("#loadingData").modal("show");
// loadMenuChildrenFormServer(0, 1);
// }
//
// }

// function getDeals() {
//
// if (deals.length == 0) {
// if (lsGet("dealList")) {
// deals = JSON.parse(lsGet("dealList"));
// }
// }
//
// if (deals.length == 0) {
// apiGetDeals(businessid, function(data) {
// if (data.code == "OK") {
// lsSet("dealList", JSON.stringify(data.list));
// deals = data.list;
// } else {
// failResponse("Data is not loaded correctly!");
// }
// }, function(error) {
// failResponse(error.status);
// })
// }
// }

function readOrLoad() {
	var dataVersion = lsGet("dataVersion");
	if (businessData.version == 0 || dataVersion == null
			|| businessData.version != dataVersion) {
		refreshCacheData();
	} else {
		products = JSON.parse(lsGet("dataList", businessData.ID));
	}

	getPromotionDetails();

	var crt = lsGet("cart");
	if (crt) {
		cart = JSON.parse(crt);
	}

}

function refreshCacheData() {

	lsRemove("dataList");
	lsRemove("cart");

	lsSet("businessData", JSON.stringify(businessData), "G");
	lsSet("dataVersion", businessData.version);

	readDataFile("data/data.json", function(text) {
		products = JSON.parse(text);
		lsSet("dataList", text, businessData.ID);
	});
}

function getPromotionDetails() {

	if (businessData.promotiontype == "Fix") {
		successResponse("If your total before tax and delivery is above $"
				+ businessData.promotionminpurchase
				+ " you will be eligible for $" + businessData.promotion
				+ " discount.", 8000);
	} else if (businessData.promotiontype == "Percentage") {
		successResponse("If your total before tax and delivery is above $"
				+ businessData.promotionminpurchase
				+ " you will be eligible for " + businessData.promotion
				+ " percent discount.", 8000);
	}
}

function apiGetBusinessData(businessid, successFn, failFn) {
	$.ajax({
		type : "GET",
		url : "PHP/inc/api.php/businesses/" + businessid + "/?transform=1",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		async : true,
		success : successFn,
		error : failFn
	});
}


function getBusinessData() {

	var data = lsGet("businessData", "G");
	if (data) {
		businessData = JSON.parse(data);
		readOrLoad();
		return;
	}

	apiGetBusinessData(businessid, function(data) {
		if (data.ID == businessid) {
			businessData = data;
			lsSet("businessData", JSON.stringify(data), "G");
			readOrLoad();
		} else {
			failResponse("Data is not loaded, please refresh the page.");
		}
	}, function(error) {
		failResponse(error.status);
	});
}

function failResponse(message, delay) {

	if (showingMsg) {
		setTimeout(function() {
			failResponse(message, delay);
		}, 500);
		return;
	}
	showingMsg = true;

	var d = 5000;
	if (delay) {
		d = delay;
	}
	$("#responseMessage").html(message).addClass('text-danger');
	$(".responseContent").css('padding-bottom', '10px');
	$("#responseModal").modal('show');
	setTimeout(function() {
		$("#responseModal").modal('hide');
		showingMsg = false;
	}, d);

}

function successResponse(message, time) {

	if (showingMsg) {
		setTimeout(function() {
			successResponse(message, time);
		}, 500);
		return;
	}
	showingMsg = true;

	$("#responseMessage").html(message).addClass('text-success');
	$(".responseContent").css('padding', '15px');
	$("#responseModal").modal('show');
	setTimeout(function() {
		$("#responseModal").modal('hide');
		showingMsg = false;
	}, time);

}

function renderIndexDeals(lookFor) {
	if (products.deals.length == 0) {
		failResponse("There are no specials available!.");
		return;
	}

	var div = $("#main-items");
	if (div == null) {
		failResponse("html element is not available!.");
		return;
	}

	products.deals.sort(function(d1, d2) {
		if (d1.name < d2.name) {
			return -1;
		} else if (d1.name > d2.name) {
			return 1;
		} else {
			return 0;
		}
	});

	var s = "";
	var ids = "";

	for ( var i in products.deals) {
		var deal = products.deals[i];
		if (lookFor != null && deal.name.toLowerCase().indexOf(lookFor) == -1) {
			continue;
		}
		if (s == "") {
			s = '<div data-text="' + deal.name + '" id="dealDiv_' + deal.id
					+ '" class="item active">';
		} else {
			s += '<div data-text="' + deal.name + '" id="dealDiv_' + deal.id
					+ '"class="item">';
		}
		s += '<div class="col-sm-6"><h1><span>';
		s += deal.name;
		s += '</span> $' + formatCurrency(deal.price) + '</h1>';
		s += deal.wname;
		s += '<button type="button" onclick="addDealToCart(' + i
				+ ')" class="btn btn-default get">Add to cart</button>';
		s += '</div><div class="col-sm-6"><img src="images/pics/deal_';
		s += deal.id;
		s += '.png" class="deal img-responsive" alt="" onerror="imgError(this);"/> <img src="images/home/';
		s += deal.price;
		s += '.png" class="pricing" alt="" /></div></div>';
		if (ids.length == 0) {
			ids += '<li data-text="' + deal.name + '" id="dealIdx_' + deal.id
					+ '" data-target="#main-carousel" data-slide-to="' + i
					+ '" class="active"></li>'
		} else {
			ids += '<li data-text="' + deal.name + '" id="dealIdx_' + deal.id
					+ '" data-target="#main-carousel" data-slide-to="' + i
					+ '"></li>'
		}
	}

	div.html(s);
	$("#main-ids").html(ids);
}

function findOption(menu, modId) {
	if (menu == null) {
		return null;
	}
	if (modId == 0) {
		return null;
	}
	if (typeof menu.modifiers != "undefined") {
		for ( var i in menu.modifiers) {
			if (menu.modifiers[i].id == modId) {
				return menu.modifiers[i];
			}
		}
	}
	return null;
}
function findMenu(menuID) {

	if (menuID == 0) {
		return null;
	}

	for ( var i in products.menus) {
		var menu = products.menus[i];
		if (menu.id == menuID) {
			return menu;
		}
	}

	return null;
}

function display(name) {
	thisPage = name;
	$('body').children('section').each(function(i) {
		if ($(this).attr('id') == name) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
	setupUI();
}

function renderCart() {
	// console.log("renderCart");
	if (cart.length == 0) {
		failResponse("Your cart is empty!", 1500);
		setTimeout(function() {
			display('main');
		}, 5);
		return;
	}

	redoNumbers();
	displayCart();
}

function showCart() {
	// console.log("showCart");
	renderCart();
	display("cartPage");
}

function addDealToCart(id) {
	var deal = products.deals[id];
	var cart_next_id = cart.length + 1;
	var item = {
		id : cart_next_id,
		qty : 1,
		menu : null,
		deal : deal,
		options : [],
		price : 0,
		freeoptions : 0,
		ready : true
	};
	cart_next_id++;
	cart.push(item);

	var otherGroups = [];

	for ( var md in deal.menus) {
		if (deal.menus[md].gid == 0) {
			if (deal.menus[md].price != 0) {
				if (typeof otherGroups[deal.menus[md].gid] == "undefined") {
					otherGroups[deal.menus[md].gid] = [];
				}
				otherGroups[deal.menus[md].gid].push(deal.menus[md]);
			}
			for (j = 0; j != deal.menus[md].count; j++) {
				addDealItem(cart_next_id, deal, md);
				cart_next_id++;
			}
		} else {
			if (typeof otherGroups[deal.menus[md].gid] == "undefined") {
				otherGroups[deal.menus[md].gid] = [];
			}
			otherGroups[deal.menus[md].gid].push(deal.menus[md]);
		}
	}
	getOptionalMenuItems(otherGroups, deal);
	setupUI();
}

function addDealItem(cart_next_id, deal, md) {
	var menu = findMenu(deal.menus[md].menu);
	var item = {
		id : cart_next_id,
		qty : 1,
		menu : menu,
		deal : deal,
		price : deal.menus[md].price,
		options : [],
		freeoptions : deal.menus[md].freeoptions,
		ready : false
	};

	if (typeof menu.modifiers != "undefined") {
		if (menu.modifiers.length == 0) {
			item.ready = true;
		} else {
			// Add default modifiers
			for ( var i in menu.modifiers) {
				var mod = menu.modifiers[i];
				if (mod.defoption) {
					item.options.push({
						modifier : mod,
						dbl : false,
						tri : false,
						hlf : false,
						onR : false,
						onL : false
					});

				}
			}
		}
	} else {
		item.ready = true;
		if (deal.menus[md].upgrade != "") {
			var mns = deal.menus[md].upgrade.split("->");
			if (mns.length == 2) {
				var i = cart.length;
				for (i = cart.length - 1; i >= 0; i--) {
					var it = cart[i];
					if (it.menu == 0 || it.menu == null) {
						break;
					}
					if (it.menu.id == mns[0]) {
						it.menu = findMenu(mns[1]);
					}
				}
			}
		}
	}
	cart.push(item);
}

function getMenuOptionsOnCart() {
	for ( var i in cart) {
		var cartItem = cart[i];
		if (cartItem.ready === false) {
			if (cartItem.menu != null) {
				if (cartItem.menu.modifiers.length != 0) {
					editCartItem(i, true);
					break;
				}
			}
		}
	}
}

function getWizard() {
	var wizard = null;

	if ($("#wizType").val() == "DEAL") {
		wizard = dealWizard;
		// console.log("D");
	} else {
		wizard = modWizard;
		// console.log("M");
	}

	return wizard;
}

function wizOptionsDone() {

	$('#wizardDialog').modal("hide");
	// console.log("W HIDE");

	// console.log("wizOptionsDone");

	setTimeout(function() {

	}, 250);

	var wizard = getWizard();

	if (wizard.deal != null) {
		var cart_next_id = cart.length + 1;

		for ( var i in wizard.wizPicks) {
			var p = wizard.wizPicks[i];
			if (p.menu != "0") {
				var md = null;
				for ( var d in wizard.deal.menus) {
					md = wizard.deal.menus[d];
					if (md.menu == p.menu && md.gid == p.gid) {
						break;
					}
				}
				addDealItem(cart_next_id, wizard.deal, d);
			}
		}
		setTimeout(function() {
			getMenuOptionsOnCart();
		}, 500);
	} else {

		if ($("#cartPage").is(":visible")) {
			displayCart();
		} else {
			setTimeout(function() {
				getMenuOptionsOnCart();
			}, 500);
		}
	}

}

function wizOptionsNext() {
	var wizard = getWizard();

	wizard.wizPoint++;
	$("#wizOptions").html(wizard.wizItems[wizard.wizPoint].html);
	setupWiz();
}

function wizOptionsBack() {
	var wizard = getWizard();
	wizard.wizPoint--;
	$("#wizOptions").html(wizard.wizItems[wizard.wizPoint].html);
	setupWiz();
}

function selectOption(img) {

	// console.log("selectOption");

	var wizard = getWizard();

	$("#wizOptions img").each(function() {
		if (img != this) {
			this.style.border = "1px solid #000066";
		}
	});
	img.style.border = "5px solid #009933";

	wizard.wizItems[wizard.wizPoint].satisfied = true;
	wizard.wizPicks[wizard.wizPoint] = {
		menu : $(img).attr('data-item'),
		gid : $(img).attr('data-gid')
	};
	setupWiz();
}

function getOptionalMenuItems(gInfo, deal) {

	// console.log("getOptionalMenuItems");

	if (gInfo.length == 0) {
		setTimeout(function() {
			getMenuOptionsOnCart();
		}, 500);
		return;
	}

	dealWizard = {
		wizItems : [],
		wizPoint : 0,
		wizPicks : [],
		deal : deal,
		item : null
	};

	$("#wizType").val("DEAL");
	$("#doQuesion").html("Select options for " + deal.name);

	for ( var x in gInfo) {
		var s1 = "";
		var optional = true;
		var grp = gInfo[x];
		if (grp[0].gid == 0 || grp[0].price == 0) {
			// Individual items
			optional = true;
			s1 += '<div class="row">';
			s1 += '<div class="col-md-10 col-md-offset-1">';
			for ( var i in grp) {
				var dm = grp[i];
				var menu = findMenu(dm.menu);
				var bN = menu.name;
				if (dm.count != 1) {
					bN = dm.count + " " + bN;
				}
				s1 += '<div class="col-md-2 col-sm-6"><div class="checkbox checkbox-info">';
				s1 += '<img data-gid="'
						+ dm.gid
						+ '" data-item="'
						+ menu.id
						+ '" onclick="selectOption(this)" src="images/pics/menu_'
						+ menu.id
						+ '.png" class="img-thumbnail img-responsive" style="width:100%; max-width:100px; border:1px solid #000066;">';
				s1 += "<h6>";
				if (dm.price != 0) {
					s1 += bN + ' ($' + formatCurrency(dm.price) + ')';
				} else {
					optional = false;
					s1 += bN;
				}
				s1 += "</h6>";
				s1 += '</div></div>';
			}
			s1 += '</div>';
			s1 += '</div>';
		} else {
			optional = false;
			// Multiple choices
			s1 += '<div class="row">';
			s1 += '<div class="col-md-10 col-md-offset-1">';
			for ( var i in grp) {
				var dm = grp[i];
				var menu = findMenu(dm.menu);
				var bN = menu.name;

				s1 += '<div class="col-md-2 col-sm-6"><div class="checkbox checkbox-info">';
				s1 += '<img data-gid="'
						+ dm.gid
						+ '" data-item="'
						+ menu.id
						+ '" onclick="selectOption(this)" src="images/pics/menu_'
						+ menu.id
						+ '.png" class="img-thumbnail img-responsive" style="width:100%; max-width:100px; border:1px solid #000066;">';
				s1 += "<h6>";
				if (dm.price != 0) {
					s1 += bN + ' ($' + formatCurrency(dm.price) + ')';
				} else {
					s1 += bN;
				}
				s1 += "</h6>";
				s1 += '</div></div>';
			}
			s1 += '<div class="col-md-2 com-sm-6"><div class="checkbox checkbox-info">';
			s1 += '<img data-gid="0" data-item="0" onclick="selectOption(this)" src="images/pics/menu_pass.png" class="img-thumbnail img-responsive" style="width:100%; max-width:100px; border:1px solid #000066;">';
			s1 += '<h6>I Pass!</h6>';
			s1 += '</div></div>';
			s1 += '</div>';
			s1 += '</div>';
		}

		dealWizard.wizItems.push({
			html : s1,
			optional : optional,
			satisfied : false
		});
		s1 = "";
	}

	$("#wizOptions").html(dealWizard.wizItems[0].html);
	dealWizard.wizPoint = 0;
	setupWiz();
	// console.log("Wz->Deal");
	// console.log("W SHOW");
	$('#wizardDialog').modal("show");

}

function setRLOnTopping(id, onL, onR) {
	for ( var i in modWizard.item.options) {
		if (modWizard.item.options[i].modifier.id == id) {
			if (onL && !onR) {
				modWizard.item.options[i].onL = true;
				modWizard.item.options[i].onR = false;
				$("#opt1l_" + id).css("opacity", "1.0");
				$("#opt1r_" + id).css("opacity", "0.25");
				$("#opt1a_" + id).css("opacity", "0.25");
			} else if (onR && !onL) {
				modWizard.item.options[i].onR = true;
				modWizard.item.options[i].onL = false;
				$("#opt1r_" + id).css("opacity", "1.0");
				$("#opt1l_" + id).css("opacity", "0.25");
				$("#opt1a_" + id).css("opacity", "0.25");
			} else {
				modWizard.item.options[i].onL = true;
				modWizard.item.options[i].onR = true;
				$("#opt1a_" + id).css("opacity", "1.0");
				$("#opt1r_" + id).css("opacity", "0.25");
				$("#opt1l_" + id).css("opacity", "0.25");
			}
			break;
		}
	}
}
function setupWiz() {

	// console.log("setupWiz");

	var wizard = getWizard();

	if (wizard.deal == null) {
		$("#wizOptions img").each(function() {
			var id = $(this).attr('data-item');
			var mod = cartItemHasThis(wizard.item, id);
			if (mod != null) {
				this.style.border = "5px solid #009933";
				if (mod.modifier.hasLR) {
					$("#opt1_" + id).show();
					if (mod.onL) {
						$("#opt1l_" + id).css("opacity", "1.0");
						$("#opt1r_" + id).css("opacity", "0.25");
						$("#opt1a_" + id).css("opacity", "0.25");
					} else if (mod.onR) {
						$("#opt1l_" + id).css("opacity", "0.25");
						$("#opt1r_" + id).css("opacity", "1.0");
						$("#opt1a_" + id).css("opacity", "0.25");
					} else {
						$("#opt1l_" + id).css("opacity", "0.25");
						$("#opt1r_" + id).css("opacity", "0.25");
						$("#opt1a_" + id).css("opacity", "1.0");
					}
				}
				if (mod.modifier.hasDbl) {
					if (mod.dbl) {
						$("#opt2_" + id).show();
					}
				}
			} else {
				if ($(this).width > 50) {
					this.style.border = "1px solid #000066";
				}
			}
		});
	}

	var satisfied = true;

	for ( var i in wizard.wizItems) {
		var w = wizard.wizItems[i];
		if (w.optional == true || w.satisfied == true) {
		} else {
			satisfied = false;
			break;
		}
	}

	if (satisfied) {
		$("#doneBtn").prop('disabled', false);
	} else {
		$("#doneBtn").prop('disabled', true);
	}

	if (wizard.wizPoint == wizard.wizItems.length - 1) {
		$("#nextBtn").hide();
	} else {
		$("#nextBtn").show();
		if (wizard.wizItems[wizard.wizPoint].optional == true
				|| wizard.wizItems[wizard.wizPoint].satisfied == true) {
			$("#nextBtn").prop('disabled', false);
		} else {
			$("#nextBtn").prop('disabled', true);
		}
	}

	if (wizard.wizPoint == 0) {
		$("#backBtn").hide();
	} else {
		$("#backBtn").show();
	}

}

function findDeal(id) {
	for ( var i in products.deals) {
		var deal = products.deals[i];
		if (deal.id == id) {
			return deal;
		}
	}
	return null;
}

function displayCart() {

	// console.log("displayCart");

	$(".item-count").html(
			cart.length == 1 ? cart.length + " item" : cart.length + " items");

	var s = "";
	total = 0;

	for ( var i in cart) {
		var item = cart[i];
		total += getPrice(item);
		s += '<div class="row">';
		if (item.menu == null) {
			// Deal
			var deal = item.deal;
			if (deal == null) {
				alert("Deal null in cart");
				return;
			}

			s += '<div class="col-md-2 hidden-sm hidden-xs">';
			s += '<img src="images/pics/deal_';
			s += deal.id;
			s += '.png" class="img-thumbnail img-responsive" alt="" onerror="imgError(this);" style="max-width:120px;"/>';
			s += '</div>';
			s += '<div class="col-md-7 col-xs-9">';
			s += getItemDescription(item);
			s += '</div>';
			s += '<div class="col-md-1 col-xs-1">&nbsp;</div>';
			s += '<div class="col-md-1 col-xs-1">';
			s += '<ul class="nav navbar-nav"><li><a href="javascript:deleteCartItem(';
			s += i;
			s += ')"><i class="fa fa-remove fa-3x hidden-sm hidden-xs"></i><i class="fa fa-remove hidden-md hidden-lg"></i> </a></li></ul>';
			s += '</div>';
			s += '<div class="col-md-1 col-xs-1">1</div>';

		} else if (item.deal == null) {
			// Menu
			var menu = item.menu;
			if (menu == null) {
				alert("Menu null in cart");
			}

			s += '<div class="col-md-2 hidden-sm hidden-xs">';
			s += '<img src="images/pics/menu_';
			s += menu.id;
			s += '.png" class="img-thumbnail img-responsive" alt="" onerror="imgError(this);" style="max-width:120px;"/>';
			s += '</div>';

			s += '<div class="col-md-7 col-xs-9">';
			s += getItemDescription(item);
			s += '</div>';

			if (typeof menu.modifiers != "undefined"
					&& menu.modifiers.length != 0) {
				s += '<div class="col-md-1 col-xs-1">';
				s += '<ul class="nav navbar-nav"><li><a href="javascript:editCartItem(';
				s += i;
				s += ',false)"><i class="fa fa-edit fa-3x hidden-sm hidden-xs"></i><i class="fa fa-edit hidden-md hidden-lg"></i> </a></li></ul>';
				s += '</div>';
			} else {
				s += '<div class="col-md-1 col-xs-1">&nbsp;</div>';
			}
			s += '<div class="col-md-1 col-xs-1">';
			s += '<ul class="nav navbar-nav"><li><a href="javascript:deleteCartItem(';
			s += i;
			s += ')"><i class="fa fa-remove fa-3x hidden-sm hidden-xs"></i><i class="fa fa-remove hidden-md hidden-lg"></i> </a></li></ul>';
			s += '</div>';
			s += '<div class="col-md-1 col-xs-1">' + item.qty + '</div>';
		} else {
			// Menu in deal
			var menu = item.menu;
			if (menu == null) {
				alert("Menu null in cart");
				return;
			}

			s += '<div class="col-md-2 hidden-sm hidden-xs">';
			s += '<img src="images/pics/menu_';
			s += menu.id;
			s += '.png" class="img-thumbnail img-responsive" alt="" onerror="imgError(this);" style="max-width:120px;"/>';
			s += '</div>';

			s += '<div class="col-md-7 col-xs-9">';
			s += getItemDescription(item);
			s += '</div>';

			if (typeof menu.modifiers != "undefined"
					&& menu.modifiers.length != 0) {
				s += '<div class="col-md-1 col-xs-1">';
				s += '<ul class="nav navbar-nav"><li><a href="javascript:editCartItem(';
				s += i;
				s += ',false)"><i class="fa fa-edit fa-3x hidden-sm hidden-xs"></i><i class="fa fa-edit hidden-md hidden-lg"></i> </a></li></ul>'
				s += '</div>';
			} else {
				s += '<div class="col-md-1 col-xs-1">&nbsp;</div>';
			}
			s += '<div class="col-md-1 col-xs-1">&nbsp;</div>';
			s += '<div class="col-md-1 col-xs-1">' + item.qty + '</div>';
		}
		s += '</div>';
	}

	$("#cartRows").html(s);
	$(".item-total").html("$" + formatCurrency(total));

}

function emptyCart() {
	cart = [];

	lsSet('cart', JSON.stringify(cart));
	display('main');
	paymentMethod = null;

	total = 0;
	sTotal = 0;
	taxes = 0;
	gTotoal = 0;
	delivery = 0;
	if (pointsValue!=0){
		useMyReward(false);
	}
	if (balanceValue!=0){
		useMyBalance(false);
	}

	setupPointCreditButtons();
	setupUI();
}

function renderMenuPage() {
	var s11 = "";
	var s12 = "";
	var s2 = "";
	var ids = "";

	products.menus.sort(function(m1, m2) {
		if (m1.parent < m2.parent) {
			return -1;
		} else if (m1.parenr > m2.parent) {
			return 1;
		} else {
			if (m1.order < m2.order) {
				return -1;
			} else if (m1.order > m2.order) {
				return 1;
			} else {
				if (m1.name < m2.name) {
					return -1;
				} else if (m1.name > m2.name) {
					return 1;
				} else {
					return 0;
				}
			}
		}
	});

	var firstItem = true;
	for ( var i in products.menus) {
		var m = products.menus[i];

		if (!m.excluded) {
			if (m.parent == 0) {
				s11 += '<div class="col-xs-2">';
				s11 += '<img data-item="'
						+ m.id
						+ '" onclick="showMenuSet(this)" onerror="imgError(this);" src="images/pics/menu_'
						+ m.id
						+ '.png" class="img-thumbnail img-responsive" style="width:100%; max-width:200px; cursor: pointer; cursor: hand; ';
				s11 += 'border:1px solid #000066;">';
				s11 += "<h4 class='text-center'>";
				s11 += m.name;
				s11 += "</h4>";
				s11 += '<div id="arrow_'
						+ m.id
						+ '" style="display: none; height: 0px; width: 0; border-top: 50px solid #3da276; border-right: 50px solid transparent; border-left: 50px solid transparent; border-bottom: 0;"></div>';

				s11 += '</div>';

				/*
				if (s11 == "") {
					s11 = '<div data-text="' + m.name + '" id="menuDiv_' + m.id
							+ '" class="item active">';
				} else {
					s11 += '<div data-text="' + m.name + '" id="menuDiv_' + m.id
							+ '"class="item">';
				}
				s11 += '<div class="col-sm-6"><h1><span>';
				s11 += m.name;
				s11 += '</span></h1>';
//				s11 += m.wname;
//				s11 += '<button type="button" onclick="showMenuSet(this)'
//						+ '" class="btn btn-default get">Show Items</button>';
				s11 += '</div><div class="col-sm-6"><img data-item="' + m.id + '" src="images/pics/menu_';
				s11 += m.id;
				s11 += '.png" class="deal img-responsive" alt="" onerror="imgError(this);" onclick="showMenuSet(this);" style="width:100%; max-width:200px; cursor: pointer; cursor: hand; border:1px solid #000066;"/> </div></div>';
				if (firstItem) {
					firstItem = false;
					ids += '<li data-text="' + m.name + '" id="dealIdx_' + m.id
							+ '" data-target="#menu-carousel" data-slide-to="' + i
							+ '" class="active"></li>'
				} else {
					ids += '<li data-text="' + m.name + '" id="dealIdx_' + m.id
							+ '" data-target="#menu-carousel" data-slide-to="' + i
							+ '"></li>'
				}

				*/
			} else {
				if (m.price != 0) {
					s2 += '<div data-item="'
							+ m.id
							+ '" onclick="addMenuToCart(this)" class="col-xs-3 text-center" style="display : none; cursor: pointer; cursor: hand;">';
					s2 += '<img data-item="'
							+ m.id
							+ '" src="images/pics/menu_'
							+ m.id
							+ '.png" class="img-thumbnail img-responsive" style="width:100%; max-width:150px;">';
					s2 += "<h6>";
					s2 += m.name + ' - $' + formatCurrency(m.price);
					s2 += "</h6>";
					s2 += '</div>';
				}
			}
		}
	}
	
//	$("#main-menu-items").html(s11);
//	$("#main-menu-ids").html(ids);
//	$("#menu-carousel").carousel(0);

	$("#topMenus").html(s11);
	$("#childMenus").html(s2);

}

function belongsTo(id, pId) {
	var mn = findMenu(id);
	if (mn.parent == pId) {
		return true;
	}

	var pa = findMenu(mn.parent);
	if (pa != null) {
		return belongsTo(mn.parent, pId);
	}
	return false;
}

function showMenuMatching(lookingFor) {

	$("#topMenus img").each(function() {
		this.style.border = "1px solid #000066";
		var id = $(this).attr('data-item');
		$("#arrow_" + id).hide();
	});

	$("#childMenus div").each(function() {
		var item = $(this).attr('data-item');
		var mn = findMenu(item);
		if (mn == null || mn.name.toLowerCase().indexOf(lookingFor) == -1) {
			this.style.display = "none";
		} else {
			this.style.display = "";
		}
	});

}

function showMenuSet(img) {
	$("#topMenus img").each(function() {
		if (img != this) {
			this.style.border = "1px solid #000066";
			var id = $(this).attr('data-item');
			$("#arrow_" + id).hide();
		}
	});
	img.style.border = "5px solid #009933";

	var pId = $(img).attr('data-item');

	$("#childMenus div").each(function() {
		var item = $(this).attr('data-item');
		if (belongsTo(item, pId)) {
			this.style.display = "";
		} else {
			this.style.display = "none";
		}
	});

	$("#arrow_" + pId).show();

}

function addMenuToCart(item) {

	var id = $(item).attr('data-item');
	var menu = findMenu(id);

	if (menu == null) {
		alert("Bad menu!");
		return;
	}
	var item = {
		id : cart.length + 1,
		qty : 1,
		menu : menu,
		deal : null,
		price : 0.0,
		options : [],
		freeoptions : menu.freeOptions,
		ready : false
	};

	if (typeof menu.modifiers != "undefined") {
		if (menu.modifiers.length == 0) {
			item.ready = true;
		} else {
			// Add default modifiers
			for ( var i in menu.modifiers) {
				var mod = menu.modifiers[i];
				if (mod.defoption) {
					// item.ready = true;
					item.options.push({
						modifier : mod,
						dbl : false,
						tri : false,
						hlf : false,
						onR : false,
						onL : false
					});

				}
			}
		}
	} else {
		item.ready = true;
	}

	cart.push(item);
	editCartItem(cart.length - 1, false);
	setupUI();
}

function getItemDescription(item) {

	if (item == null) {
		return "Invalid row";
	}

	if (item.deal != null && item.menu == null) {
		return '<h3><i class="fa fa-cutlery fa-2x"></i> $' + getPrice(item)
				+ " : " + getDetails(item) + '</h3>';
	}

	var preFix = "";
	if (item.deal == null) {
		preFix = '<h4><i class="fa fa-spoon fa-2x"></i>  $'
				+ formatCurrency(getMenuBasePrice(item)) + " : ";
	} else {
		preFix = '<h5><i class="fa fa-spoon fa-1x"></i> ';
	}

	var retStr = preFix + getDetails(item);

	if (item.deal == null) {
		retStr += '</h4>';
	} else {
		retStr += '</h5>';
	}
	if (item.options.length != 0) {
		var exPrc = getMenuExtraPrice(item);
		if (exPrc != 0) {
			retStr = retStr + "<br><h6>Extras: $" + exPrc + "</h6>";
		}
	}

	return retStr;
}

function getDetails(item) {
	if (item.menu == null) {
		return item.deal.name;
	}

	var t = "";

	for ( var i in item.options) {
		if (t.length != 0) {
			t += ", ";
		}
		mod = item.options[i];
		if (mod.dbl) {
			t += "Double ";
		} else if (mod.hlf) {
			t += "Half ";
		} else if (mod.tri) {
			t += "No ";
		}
		t += mod.modifier.name;
		if (mod.onR) {
			t += " on right";
		} else if (mod.onL) {
			t += " on left";
		}
	}

	if (t.length == 0) {
		return item.menu.name;
	}

	return item.menu.name + " : " + t;
}

function getPrice(item) {
	if (item.deal == null) {
		return getMenuPrice(item);
	} else if (item.menu != null) {
		return getMenuExtraPrice(item) + item.price;
	} else {
		var p = item.deal.price;
		// for (var i = item.id+1 ; i<cart.length ; i++){
		// if (cart[i].deal==null || cart[i].deal.id!=item.deal.id){
		// break;
		// }
		// p += cart[i].menudeal.price + getMenuExtraPrice(cart[i]);
		// }
		return p;
	}
}

function getMenuBasePrice(item) {
	if (item.menu == null) {
		return -1;
	}

	if (item.menu.pricetable == null || item.menu.pricetable == "") {
		return item.menu.price;
	}

	var prices = item.menu.pricetable.split(";");

	var optionCount = 0;
	var dblCnt = 0;
	for ( var i in item.options) {
		var opt = item.options[i];
		if ((opt.modifier.dblPrice != 0 || opt.modifier.price != 0)
				&& (opt.modifier.exlgroupid == null || opt.modifier.exlgroupid == "")) {
			if (opt.dbl) {
				optionCount++;
			} else if (opt.tri) {
				// No selected
			} else {
				optionCount++;
			}
		}
	}

	if (optionCount > prices.length - 1) {
		optionCount -= dblCnt;
		if (optionCount < prices.length - 1) {
			optionCount = prices.length - 1;
		}
	}

	priceTableFreeOption = optionCount;
	if (optionCount >= prices.length) {
		priceTableFreeOption = prices.length - 1;
		return parseFloat(prices[prices.length - 1]);
	}
	return parseFloat(prices[optionCount]);

}

function getMenuExtraPrice(item) {
	var s = 0;
	var ocnt = 0;

	if (item.deal == null) {
		ocnt = getMenuFreeOptions(item);
	} else {
		ocnt = item.freeoptions;
	}

	for ( var i in item.options) {
		var opt = item.options[i];
		if (opt.dbl) {
			s = s + opt.modifier.dblPrice;
		} else if (opt.tri) {
		} else if (opt.hlf) {
			ocnt--;
			if (ocnt < 0) {
				s = s + item.deal == null ? opt.modifier.price
						: item.menu.optionPrice;
			}
		} else {
			if (opt.modifier.exlgroupid == null
					|| opt.modifier.exlgroupid == "") {
				ocnt--;
				if (ocnt < 0) {
					s = s + item.deal == null ? opt.modifier.price
							: item.menu.optionPrice;
				}
			} else {
				s = s + item.deal == null ? opt.modifier.price
						: item.menu.optionPrice;
			}
		}
	}

	return s;
}

function getMenuFreeOptions(item) {
	if (item.menu.pricetable == null || item.menu.pricetable == "") {
		return item.menu.freeOptions;
	}
	var prices = item.menu.pricetable.split(";");

	var optionCount = 0;
	var dblCnt = 0;
	for ( var i in item.options) {
		var opt = item.options[i];
		if ((opt.modifier.dblPrice != 0 || opt.modifier.price != 0)
				&& (opt.modifier.exlgroupid == null || opt.modifier.exlgroupid == "")) {
			if (opt.dbl) {
				optionCount++;
			} else if (opt.tri) {
			} else {
				optionCount++;
			}
		}
	}

	if (optionCount > prices.length - 1) {
		optionCount -= dblCnt;
		if (optionCount < prices.length - 1) {
			optionCount = prices.length - 1;
		}
	}

	priceTableFreeOption = optionCount;
	if (optionCount >= prices.length) {
		priceTableFreeOption = prices.length - 1;
	}
	return priceTableFreeOption;
}

function getMenuPrice(item) {
	return getMenuBasePrice(item) + getMenuExtraPrice(item);
}

function showMenus() {
	if ($("#childMenus").html().length == 0) {
		renderMenuPage();
	}
	display("menuPage");
}

function deleteCartItem(id) {
	cartIdAtHand = id;
	$("#confirmDialog").modal("show");
}

function removeCartItem() {
	$("#confirmDialog").modal("hide");
	if (cartIdAtHand == null) {
		return;
	}

	var item = cart[cartIdAtHand];
	if (item == null) {
		return;
	}

	if (item.deal != null) {
		var i = cart.length - 1;
		var n = 0;
		while (i >= 0) {
			if (cart[i].deal == item.deal) {
				n++;
				i--;
			} else {
				break;
			}
		}
		cart.splice(cartIdAtHand, n);
	} else {
		cart.splice(cartIdAtHand, 1);
	}

	cartIdAtHand = null;
	renderCart();
}

function editCartItem(id, type) {

	// console.log("editCartItem");

	var item = cart[id];
	item.ready = true;
	if (item.menu == null) {
		if (type) {
			setTimeout(function() {
				getMenuOptionsOnCart();
			}, 500);
		}
		return;
	}

	if (item.menu.modifiers && item.menu.modifiers.length != 0) {
		modWizard = {
			wizItems : [],
			wizPoint : 0,
			wizPicks : [],
			item : item,
			deal : null
		};

		$("#wizType").val("MODS");
		$("#doQuesion").html("Select options for " + item.menu.name);

		var parents = [];
		for ( var i in item.menu.modifiers) {
			var mod = item.menu.modifiers[i];
			if (parents[mod.parentName]) {

			} else {
				parents[mod.parentName] = [];
			}
			parents[mod.parentName].push(mod);
		}

		for ( var x in parents) {
			var s1 = "";
			var mods = parents[x];
			if (mods[0].exclusive) {
				s1 += '<div class="row">';
				s1 += '<div class="col-xs-10 col-xs-offset-1">';
				for ( var i in mods) {
					var mod = mods[i];
					s1 += '<div class="col-xs-6 col-md-2"><div class="checkbox checkbox-info">';
					s1 += '<img data-item="'
							+ mod.id
							+ '" data-pId="'
							+ mod.parent
							+ '" onerror="imgError(this)" onclick="selectMod(this,true)" src="images/pics/mod_'
							+ mod.id
							+ '.png" class="img-thumbnail img-responsive" style="width:100%; max-width:100px; border:1px solid; #000066;">';
					s1 += "<h6>";
					s1 += mod.name;
					s1 += "</h6>";
					s1 += '</div></div>';
				}
				if (!mods[0].mandatory) {
					s1 += '<div class="col-xs-6 col-md-2"><div class="checkbox checkbox-info">';
					s1 += '<img data-item="0" onerror="imgError(this)" data-pId="'
							+ mods[0].parent
							+ '" onclick="selectMod(this,true)" src="images/pics/mod_pass.png" class="img-thumbnail img-responsive" style="width:100%; max-width:100px; border:1px solid #000066;">';
					s1 += '<h6>I Pass!</h6>';
					s1 += '</div></div>';
				}
				s1 += '</div>';
				s1 += '</div>';
			} else {
				optional = false;
				// Multiple choices
				s1 += '<div class="row">';
				s1 += '<div class="col-xs-10 col-xs-offset-1">';

				for ( var i in mods) {
					var mod = mods[i];

					s1 += '<div class="col-xs-6 col-md-2"><div class="checkbox checkbox-info" style="position: relative; left: 0; top: 0;">';
					s1 += '<img data-item="'
							+ mod.id
							+ '" data-pId="'
							+ mod.parent
							+ ' onerror="imgError(this)" onclick="selectMod(this,false)" src="images/pics/mod_'
							+ mod.id
							+ '.png" class="img-thumbnail img-responsive" style="position: relative;top:0;left:0;width:100%; max-width:100px; border:1px solid #000066;">';
					s1 += '<div id="opt1_'
							+ mod.id
							+ '" style="display:none;position: absolute; top: 5px; left: 5px; background-color:#ffffff">';
					s1 += '<img onclick="setRLOnTopping('
							+ mod.id
							+ ',true,false)" id="opt1l_'
							+ mod.id
							+ '" src="images/left.png" border="0" style="width:24px;height:24px;;margin-right:3px; margin-top:5px; margin-bottom:5px;"/>'; // background-size:24px
																																							// 24px;
																																							// background-image:
																																							// url(\'images/left.png\');
					s1 += '<img onclick="setRLOnTopping('
							+ mod.id
							+ ',true,true)" id="opt1a_'
							+ mod.id
							+ '" src="images/all.png" border="0" style=";width:24px;height:24px;margin-right:3px;"/>';// background-size:24px
																														// 24px;
																														// background-image:
																														// url(\'images/all.png\');
					s1 += '<img onclick="setRLOnTopping('
							+ mod.id
							+ ',false,true)" id="opt1r_'
							+ mod.id
							+ '" src="images/right.png" border="0" style=" width:24px;height:24px;;margin-right:3px;"/>'; // background-size:24px
																															// 24px;
																															// background-image:
																															// url(\'images/right.png\');
					s1 += '</div>'; // float:left;
					s1 += '<div id="opt2_'
							+ mod.id
							+ '" style="display:none;position: absolute; top: 40px; left: 5px;">';
					s1 += '<img src="images/2x.png" style="width:24px;height:24px;"/>'; // style="background-size:24px
																						// 24px;
																						// background-image:
																						// url(\'images/2x.png\');
																						// "
					s1 += '</div>';
					s1 += "<h6>";
					s1 += mod.name;
					s1 += "</h6>";
					s1 += '</div></div>';
				}
				s1 += '</div>';
				s1 += '</div>';
			}

			modWizard.wizItems.push({
				html : s1,
				optional : !mods[0].mandatory,
				satisfied : false
			});
			s1 = "";
		}
		$("#wizOptions").html(modWizard.wizItems[0].html);
		modWizard.wizPoint = 0;
		setupWiz();
		// console.log("Wz->Mod");
		// console.log("W SHOW");
		$('#wizardDialog').modal("show");

	} else {
		if (!type) {
			successResponse(item.menu.name + " is added to your cart.", 2500);
		}
	}
}

function cartItemHasThis(item, mid) {
	for ( var i in modWizard.item.options) {
		var mod = modWizard.item.options[i];
		if (mod.modifier.id == mid) {
			return mod;
		}
	}
	return null;
}

function selectMod(img, exclusive) {
	if (exclusive) {
		$("#wizOptions img").each(function() {
			if (img != this) {
				this.style.border = "1px solid #000066";
			}
		});
		img.style.border = "5px solid #009933";
		modWizard.wizItems[modWizard.wizPoint].satisfied = true;

		var mId = $(img).attr('data-item');

		if (mId != 0) {
			var newMod = null;
			for ( var i in modWizard.item.menu.modifiers) {
				var mod = modWizard.item.menu.modifiers[i];
				if (mod.id == mId) {
					modWizard.item.options.push({
						modifier : mod,
						dbl : false,
						tri : false,
						hlf : false,
						onR : false,
						onL : false
					});
					newMod = mod;
					break;
				}
			}

			for (var i = modWizard.item.options.length - 1; i >= 0; i--) {
				var mod = modWizard.item.options[i];
				if (mod.modifier.parent == newMod.parent
						&& mod.modifier.id != newMod.id) {
					modWizard.item.options.splice(i, 1);
					break;
				}
			}
		} else {
			var pId = $(img).attr('data-pId');
			for (var i = modWizard.item.options.length - 1; i >= 0; i--) {
				var mod = modWizard.item.options[i];
				if (mod.modifier.parent == pId) {
					modWizard.item.options.splice(i, 1);
					break;
				}
			}
		}
	} else {

		var mId = $(img).attr('data-item');
		var sMod = null;
		var sModPtr = -1;
		for ( var i in modWizard.item.options) {
			if (mId == modWizard.item.options[i].modifier.id) {
				sMod = modWizard.item.options[i];
				sModPtr = i;
				break;
			}
		}

		if (sMod != null) {
			if (sMod.modifier.hasDbl) {
				if (!$("#opt2_" + mId).is(":visible")) {
					$("#opt2_" + mId).show();
					sMod.dbl = true;
				} else {
					img.style.border = "1px solid #000066";
					// $(img).width($(img).width()*2);
					// $(img).width(100);
					// $(img).height($(img).height()*2);
					$("#opt1_" + mId).hide();
					$("#opt2_" + mId).hide();
					modWizard.item.options.splice(sModPtr, 1);
				}
			} else {
				img.style.border = "1px solid #000066";
				// $(img).width(100);
				// $(img).height($(img).height()*2);
				$("#opt1_" + mId).hide();
				$("#opt2_" + mId).hide();
				modWizard.item.options.splice(sModPtr, 1);
			}
		} else {
			// $(img).width(40);
			// $(img).height($(img).height()/2);
			img.style.border = "5px solid #009933";
			modWizard.wizItems[modWizard.wizPoint].satisfied = true;

			for ( var i in modWizard.item.menu.modifiers) {
				var mod = modWizard.item.menu.modifiers[i];
				if (mod.id == mId) {
					modWizard.item.options.push({
						modifier : mod,
						dbl : false,
						tri : false,
						hlf : false,
						onR : false,
						onL : false
					});
					if (mod.hasLR) {
						$("#opt1_" + mId).show();
					}
					break;
				}
			}
		}
	}

	setupWiz();

}

function checkout() {
	if (userinfo == null) {
		login(true);
	} else {
		// $("#payBtn").show();
		$("#pickupOrDelivery").modal("show");
	}
}

function setOrderMethod(method) {
	orderMethod = method;
	if (method == "D") {
		$("#delivery-pickup").html("Delivery");
		$("#delivery-pickup2").html("Delivery");
		$("#ch-address").val(userinfo.address);
	} else {
		$("#delivery-pickup").html("Pickup");
		$("#delivery-pickup2").html("Pickup");
		$("#payBtn").show();
	}
	getStores();
	setPayment("COD");
}

function redoNumbers() {

	if (store == null) {
		failResponse("Please select a store.", 500);
		return;
	}
	var st = stores[store];
	setupPointCreditButtons();

	$("#payBtn").show();
	$("#ch-subtotal").html("$" + formatCurrency(total));
	if (orderMethod == "D") {
		if (total < parseFloat(businessData.mindelivery)) {
			$("#payBtn").hide();
			failResponse("Minimum amount for delivery is $"
					+ businessData.mindelivery + ".", 3000);
			return;
		}

		// No need anymore!
		// if (storeDistance > parseFloat(st.deliveryRadius)) {
		// $("#payBtn").hide();
		// failResponse("Sorry, we don't deliver to your locaion, you can still
		// pickup your order from store.", 3000);
		// return;
		// }

		if (total >= parseFloat(st.freedeliverylimit)) {
			$("#ch-delivery").html("Free Delivery");
			delivery = 0;
		} else {
			delivery = parseFloat(st.deliverycost);
			$("#ch-delivery").html("$" + formatCurrency(delivery));
		}
	} else {
		$("#ch-delivery").html("Free Pickup");
	}

	sTotal = total + delivery;
	$("#ch-total").html("$" + formatCurrency(sTotal));

	taxes = parseFloat(businessData.tax) * sTotal / 100;
	$("#ch-taxes").html("$" + formatCurrency(taxes));

	gTotoal = sTotal + taxes;
	$("#ch-grand").html("$" + formatCurrency(gTotoal));
	$("#ch-points").html("$" + formatCurrency(pointsValue));
	$("#ch-balance").html("$" + formatCurrency(balanceValue));

	$("#ch-due").html(
			"$" + formatCurrency(gTotoal - pointsValue - balanceValue));

}

function setupPointCreditButtons() {
	if (userinfo == null) {
		$("#pointrow").hide();
		$("#balancerow").hide();
		return;
	}

	$("#ch-mypoints").html(
			"- $"
					+ formatCurrency(userinfo.points
							/ businessData.dollarforpoints));
	if (userinfo.points == 0 && pointsValue == 0) {
		$("#pointrow").hide();
	} else {
		$("#pointrow").show();
	}

	$("#ch-mybalance").html("- $" + formatCurrency(userinfo.credit));
	if (userinfo.credit == 0 && balanceValue == 0) {
		$("#balancerow").hide();
	} else {
		$("#balancerow").show();
	}
}

function useMyReward(how) {
	if (how) {
		var due = gTotoal - balanceValue;
		var pValue = userinfo.points / businessData.dollarforpoints;
		if (pValue > due) {
			pValue = due;
			userinfo.points = userinfo.points - pValue
					* businessData.dollarforpoints;
		} else {
			userinfo.points = 0;
		}
		pointsValue = pValue;
		$("#usePointBtn").hide();
		$("#usePointBtnX").show();
	} else {
		userinfo.points = userinfo.points + pointsValue
				* businessData.dollarforpoints;
		pointsValue = 0;
		$("#usePointBtnX").hide();
		$("#usePointBtn").show();
	}
	redoNumbers();
}

function useMyBalance(how) {
	if (how) {
		var due = gTotoal - pointsValue;
		var pValue = userinfo.credit;
		if (pValue > due) {
			pValue = due;
			userinfo.credit = userinfo.credit - due;
		} else {
			userinfo.credit = 0;
		}
		$("#useBalanceBtn").hide();
		$("#useBalanceBtnX").show();
		balanceValue = pValue;
	} else {
		userinfo.credit = userinfo.credit + balanceValue;
		balanceValue = 0;
		$("#useBalanceBtnX").hide();
		$("#useBalanceBtn").show();
	}
	redoNumbers();
}

function checkoutPrc(method) {
	//store = null;
	setOrderMethod(method);
	$("#ch-address").val(userinfo.address);
	$("#ch-address").focus();
	// geocodeAddress(userinfo.clientaddress,map);
	$("#pickupOrDelivery").modal("hide");
	display("checkoutPage");
	$('.form_datetime').datetimepicker({
		weekStart : 1,
		todayBtn : 1,
		autoclose : 1,
		todayHighlight : 1,
		startView : 2,
		forceParse : 0,
		showMeridian : 1
	});
	// paymentMethod = null;

}

function login(ltc) {
	loginToCheckout = ltc;
	$("#loginPop").modal("show");
}

function showDebugInfo(err) {
	console.log(err);
}

function setupUI() {

	$(".cartCnt").html("");

	if (userinfo) {
		$(".online").show();
		$(".offline").hide();
	} else {
		$(".offline").show();
		$(".online").hide();
	}
	if (cart.length == 0) {
		$(".cart-menu").hide();
	} else {
		$(".cart-menu").show();
		$(".cartCnt").html(cart.length);
	}

	if (loginToCheckout && cart.length != 0) {
		loginToCheckout = false;
		setTimeout(function() {
			$("#pickupOrDelivery").modal("show");
		}, 1000);
	}
}

function logout() {
	loginToCheckout = false;
	userinfo = null;
	lsRemove("userinfo", "G")
	display("main");
	setupUI();
}

function updateProfile() {
	var email = $("#pr-email").val();
	var password = $("#pr-password").val();
	var password2 = $("#pr-password2").val();
	var fullname = $("#pr-fullname").val();
	var phone = $("#pr-phone").val();
	var address = $("#pr-address").val();

	c = {
		address : address,
		fullname : fullname
	};

	if (email != userinfo.email && !validateEmail(email)) {
		$.alert({
			title : 'Error',
			content : 'Please enter a valid email address.',
			icon : 'fa fa-hand-paper-o',
			theme : 'material',
			animation : 'scale',
			type : 'red',
		});
		return;
	}

	if (email != userinfo.email) {
		c.email = email;
	}

	if (phone != userinfo.phone && !validatePhone(phone)) {
		$.alert({
			title : 'Error',
			content : 'Please enter a valid phone number.',
			icon : 'fa fa-hand-paper-o',
			theme : 'material',
			animation : 'scale',
			type : 'red',
		});
	}

	if (phone != userinfo.phone) {
		c.phone = phone;
	}

	if (password != password2) {
		$
				.alert({
					title : 'Error',
					content : 'Passwords do not match, please ensure you enter passwords in both boxes correctly.',
					icon : 'fa fa-hand-paper-o',
					theme : 'material',
					animation : 'scale',
					type : 'red',
				});
	}

	if (password != "" && password != userinfo.password) {
		c.password = password;
	}

	$.ajax({
		type : 'PUT',
		url : 'PHP/inc/api.php/profiles/' + userinfo.ID,
		dataType : 'json',
		data : JSON.stringify(c),
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result == null) {
				$.alert({
					title : 'Error',
					content : 'System is not available at this time code:001',
					icon : 'fa fa-hand-paper-o',
					theme : 'material',
					animation : 'scale',
					type : 'red'
				});
				return;
			}

			$.alert({
				title : 'Success',
				content : 'Your password was successfully updated.',
				icon : 'fa fa-thumbs-up',
				theme : 'material',
				animation : 'scale',
				type : 'green',
				onClose : function() {
					display("main");
				}
			});
		},
		error : function(result) {
			$.alert({
				title : 'Error',
				content : 'System is not available at this time code:002',
				icon : 'fa fa-hand-paper-o',
				theme : 'material',
				animation : 'scale',
				type : 'red',
			});
		}
	});

}

function signupClient() {
	var email = $("#su-email").val();
	var cardid = $("#su-cardid").val();
	var password = $("#su-password").val();
	var password2 = $("#su-password2").val();
	var firstname = $("#su-firstname").val();
	var lastname = $("#su-lastname").val();
	var phone = $("#su-phone").val();
	var address = $("#su-address").val();

	var err = null;

	if (email.length < 5 || typeof validate.single(email, {
		email : true
	}) != "undefined") {
		err = "Please use a valid email address.";
	} else if (phone.length != 10 || typeof validate.single(phone, {
		format : /^\d{10}$/
	}) != "undefined") {
		err = "Please use a valid phone number.";
	} else if (typeof validate.single(cardid, {
		format : /189317-\d{7}/
	}) != "undefined" && typeof validate.single(un, {
		format : /^\d{7}$/
	}) != "undefined") {
		err = "Please use a valid membership number, if you don't have one leave it empty.";
	} else if (password.length < 5 || password != password2) {
		err = "Please make sure password is five or more characters and both passwords match.";
	} else if (firstname.length < 2) {
		err = "Please enter a valid first name.";
	}

	if (err != null) {
		$(".alert").html(err);
		$(".alert").show();
		setTimeout(function() {
			$(".alert").hide();
		}, 4000);
		return;
	}

	apiSignup(
			cardid,
			firstname,
			lastname,
			email,
			password,
			phone,
			address,
			lat,
			lon,
			"",
			"$100",
			"Consumer",
			"true",
			"true",
			"",
			"",
			"",
			"",
			function(data) {
				if (data.code != "OK") {
					$(".alert").html(data.message);
					$(".alert").show();
					setTimeout(function() {
						$(".alert").hide();
					}, 4000);
					return;
				} else {
					$("#losu-title").html("Login");
					$("#loginPop").modal("hide");
					successResponse(
							"Thank you for signing up, please login to continue.",
							3000);
				}
			},
			function(err) {
				$(".alert")
						.html(
								"System error. Make sure you are connected to internet.");
				$(".alert").show();
				setTimeout(function() {
					$(".alert").hide();
				}, 4000);
			});

}

function initApp() {
	initGoogleStuff();
	var a = lsGet("loginEmail", "G");
	var p = lsGet("loginPassword", "G");
	if (a) {
		$("#loginEmail").val(a);
	}
	if (p) {
		$("#loginPassword").val(decryptPassword(p));
	}
	$(".youtube").YouTubeModal({
		autoplay : 1,
		width : 640,
		height : 480
	});

	$(document).on(
			'click',
			'.navbar-collapse.in',
			function(e) {
				if ($(e.target).is('a')
						&& $(e.target).attr('class') != 'dropdown-toggle') {
					$(this).collapse('hide');
				}
			});

	$(document).on('keydown', 'input.search-query', function(ev) {
		if (ev.which == 13) {
			performSearch();
			return false;
		}
	});
}

function initGoogleStuff() {
	initAutocomplete();
	initMap(lat, lon);
}

function initMap(alat, alon) {
	if (alat == 0) {
		alat = 43.807518;
		alon = -79.357293;
	}

	var latlng = new google.maps.LatLng(alat, alon);
	var config = {
		zoom : 14,
		center : latlng,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};

	myMap = new google.maps.Map(document.getElementById('myMap'), config);
	myLocation = new google.maps.Marker({
		map : myMap,
		animation : google.maps.Animation.DROP,
		title : "Sotre",
		position : latlng,
		html : "Store"
	});

	// geocoder = new google.maps.Geocoder();
	// $('#ch-address').focusout(function() {
	// geocodeAddress(geocoder, map);
	// });
}

function geocodeAddress(geocoder, resultsMap) {
	var address = $('#ch-address').val();
	geocoder.geocode({
		'address' : address
	}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			if (resultsMap) {
				resultsMap.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map : resultsMap,
					position : results[0].geometry.location
				});
			}
			lat = results[0].geometry.location.lat();
			lon = results[0].geometry.location.lng();
		} else {
			console.log('Geocode was not successful for the following reason: '
					+ status);
		}
	});
}

function initAutocomplete() {
	// $("#signupBtn").prop('disabled', true);
	autocomplete1 = new google.maps.places.Autocomplete((document
			.getElementById('su-address')), {
		types : [ 'geocode' ]
	});
	autocomplete1.addListener('place_changed', fillInAddress1);
	autocomplete2 = new google.maps.places.Autocomplete((document
			.getElementById('pr-address')), {
		types : [ 'geocode' ]
	});
	autocomplete2.addListener('place_changed', fillInAddress2);
	autocomplete3 = new google.maps.places.Autocomplete((document
			.getElementById('ch-address')), {
		types : [ 'geocode' ]
	});
	autocomplete3.addListener('place_changed', fillInAddress3);
}

function fillInAddress1() {
	// Get the place details from the autocomplete object.
	var place = autocomplete1.getPlace();
	if (place && place.geometry) {
		lat = place.geometry.location.lat();
		lon = place.geometry.location.lng();
		// $("#signupBtn").prop('disabled', false);
	}
}

function fillInAddress2() {
	// Get the place details from the autocomplete object.
	var place = autocomplete2.getPlace();
	if (place && place.geometry) {
		lat = place.geometry.location.lat();
		lon = place.geometry.location.lng();
		$("#updateProfileBtn").prop('disabled', false);
	}
}

function fillInAddress3() {
	// Get the place details from the autocomplete object.
	var place = autocomplete3.getPlace();
	if (place && place.geometry) {
		lat = place.geometry.location.lat();
		lon = place.geometry.location.lng();
		findMyStore();
	}
}

function editProfile() {

	$("#pr-cardid").val(userinfo.membership);
	$("#pr-cardid").prop('disabled', true);
	$("#pr-email").val(userinfo.email);
	$("#pr-password").val("");
	$("#pr-password2").val("");
	$("#pr-fullname").val(userinfo.fullname);
	$("#pr-phone").val(userinfo.phone);
	$("#pr-address").val(userinfo.address);
	$("#userProfileUpdate").show();
	$("#userProfileActions").hide();
}

function cancelProfileEdit() {
	$("#userProfileUpdate").hide();
	$("#userProfileActions").show();
}

function userHistory() {

	$("#historyTable").html("Getting your orders history...please wait!");
	$("#userHistory").show();
	$("#userProfileActions").hide();
	var htmlString = "";
	
	$.ajax({
		type : 'GET',
		url : 'PHP/inc/api.php/orders?order=ID,desc&page=1,20&transform=1&filter[]=profile,eq,'
				+ userinfo.ID,
		dataType : 'json',
		data : null,
		contentType : "application/json; charset=utf-8",
		success : function(data) {
			orderHistory = data;
			if (data.orders.length > 0) {
				htmlString += "<table class='table table-bordered table-condensed'>";
				htmlString += "<tr class='active'>";
				htmlString += "<th> Order ID </th>";
				htmlString += "<th> Order Time-stamp </th>";
				htmlString += "<th> Order Status </th>";
				htmlString += "<th> Action </th>";
				htmlString += "</tr>";

				for (var k = 0; k < data.orders.length; k++) {
					htmlString += "<tr>";
					htmlString += "<td style='line-height: 2'>"
							+ JSON.stringify(data.orders[k].ID) + " </td>";
					htmlString += "<td style='line-height: 2'>"
							+ ((new Date(data.orders[k].timeplaced)).toLocaleString())
							+ " </td>";
					if (data.orders[k].status == "N") {
						htmlString += "<td style='line-height: 2'> New Order </td>";
						htmlString += "<td style='line-height: 2'> <div class='btn-group' role='group' > <a class='btn btn-danger radius-4' onclick="
								+ "cancelOrderWithId("
								+ data.orders[k].ID
								+ ");>Cancel</a>" 
//								+ "<a  class='btn btn-warning radius-4' onclick="
//								+ "updateOrderWithId("
//								+ data.orders[k].ID
//								+ ");>Update</a>"
								+ "</div></td>";
					} else if (data.orders[k].status == "C") {
						htmlString += "<td style='line-height: 2'> Canceled </td>";
						htmlString += "<td style='line-height: 2'> <div class='btn-group' role='group' > <a class='btn btn-success radius-4' onclick="
								+ "repeatOrderWithId("
								+ data.orders[k].ID
								+ ");>Repeat</a> </div></td>";
					} else if (data.orders[k].status == "P") {
						htmlString += "<td style='line-height: 2'> Received </td>";
						htmlString += "<td style='line-height: 2'> <div class='btn-group' role='group' > <a class='btn btn-danger radius-4' onclick="
							+ "callStore("
							+ data.orders[k].ID
							+ ",true);>Call Store</a>" 
							+ "</div></td>";
					} else if (data.orders[k].status == "D") {
						htmlString += "<td style='line-height: 2'> Cooked </td>";
						htmlString += "<td style='line-height: 2'> <div class='btn-group' role='group' > <a class='btn btn-success radius-4' onclick="
								+ "repeatOrderWithId("
								+ data.orders[k].ID
								+ ");>Repeat</a> </div></td>";
					}

					htmlString += "</tr>";
				}

				htmlString += "</table>";

				$("#historyTable").html(htmlString);
			} else {
				$("#historyTable")
						.html(
								"<strong>There are no previous orders available.</strong>");
			}
		},
		error : function(data) {
			$.alert({
				title : 'Error',
				content : 'There is no location available to serve you!',
				icon : 'fa fa-hand-paper-o',
				theme : 'material',
				animation : 'scale',
				type : 'red',
			});
		}
	});

}

function setStore(s) {
	store = s;
	var thisStore = stores[store];
	$("#selectedStore").html(thisStore.title);
	initMap(thisStore.lat, thisStore.lon);
	google.maps.event.trigger(myMap, 'resize');
	myMap.setZoom(myMap.getZoom());
	redoNumbers();
}

function setPayment(p) {
	paymentMethod = p;
	if (p == "COD") {
		$("#selectedPayment").html("Payment: Cash On Delivery");
	} else if (p == "DEB") {
		$("#selectedPayment").html("Payment: Debit Card");
	} else if (p == "MC") {
		$("#selectedPayment").html("Payment: Master Card");
	} else if (p == "VS") {
		$("#selectedPayment").html("Payment: Visa");
	} else if (p == "AM") {
		$("#selectedPayment").html("Payment: Amex");
	} else if (p == "DS") {
		$("#selectedPayment").html("Payment: Discover");
	} else {
		$("#selectedPayment").html("Payment: Unknown");
	}
}

function findMyStore() {

	var myStoreIdx = null;
	var myStore = null;
	var geocoder = new google.maps.Geocoder();
	var address = $("#ch-address").val();
	geocoder
			.geocode(
					{
						'address' : address
					},
					function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							myLatlon = new google.maps.LatLng(
									results[0].geometry.location.lat(),
									results[0].geometry.location.lng());

							for ( var i in stores) {
								var paths = [];
								var store = stores[i];

								for ( var j in store.serving) {
									paths.push(new google.maps.LatLng(
											store.serving[j].lat,
											store.serving[j].lon));
								}
								paths.push(new google.maps.LatLng(
										store.serving[0].lat,
										store.serving[0].lon));

								var servingArea = new google.maps.Polygon({
									paths : paths
								});
								if (google.maps.geometry.poly.containsLocation(
										myLatlon, servingArea)) {
									myStore = store;
									myStoreIdx = i;
									break;
								}
							}
							if (myStore != null) {
								setStore(myStoreIdx);
							} else {
								$
										.alert({
											title : 'Error',
											content : 'There is no location available to serve you, only pick up is available.',
											icon : 'fa fa-hand-paper-o',
											theme : 'material',
											animation : 'scale',
											type : 'red',
										});
								setOrderMethod("P");
							}
						}
					});

}

function findCloseStore() {
	// setStore(0);
	var service = new google.maps.DistanceMatrixService();
	var all_locations = [];
	for ( var i in stores) {
		var sll = new google.maps.LatLng(stores[i].lat, stores[i].lon);
		all_locations.push(sll);
	}
	var destObj = [];
	destObj.push($("#ch-address").val());
	service.getDistanceMatrix({
		origins : all_locations,
		destinations : destObj,
		travelMode : google.maps.TravelMode.DRIVING,
		avoidHighways : false,
		avoidTolls : false
	}, findStoreCallback);

}

function findStoreCallback(response, status) {
	if (status != google.maps.DistanceMatrixStatus.OK) {
		failResponse("Can't find your location!.", 2000);
	} else {
		var origins = response.originAddresses;
		var destinations = response.destinationAddresses;
		var s = -1;
		var distance = 100000000;
		for (var i = 0; i < origins.length; i++) {
			var results = response.rows[i].elements;
			for (var j = 0; j < results.length; j++) {
				if (typeof results[j].distance == "undefined") {
				} else {
					var dis = results[j].distance.value;
					if (distance > dis) {
						distance = dis;
						s = i;
					}
				}
			}
		}
		storeDistance = distance;
		setStore(s);
	}
}

function getStores() {
	if (stores.length != 0 && orderMethod == "D") {
		if (stores.length > 1) {
			findMyStore();
			$("#store-list-dd").prop("disabled", false);
		} else {
			$("#store-list-dd").prop("disabled", true);
		}
		$("#ch-address").prop("disabled", false);
		return;
	}

	if (stores.length != 0) {
		$("#store-list-dd").prop("disabled", false);
		$("#ch-address").prop("disabled", true);
		store = 0;
		$("#selectedStore").html(stores[store].title);
		redoNumbers();
		return;
	}

	$
			.ajax({
				type : 'GET',
				url : 'PHP/inc/api.php/servinglocation?transform=1&filter[]=bID,eq,'
						+ businessid,
				dataType : 'json',
				data : null,
				contentType : "application/json; charset=utf-8",
				success : function(data) {
					if (data.servinglocation.length == 0) {
						$
								.alert({
									title : 'Error',
									content : 'There is no location available to serve you!',
									icon : 'fa fa-hand-paper-o',
									theme : 'material',
									animation : 'scale',
									type : 'red',
								});
						return;
					}
					var lst = $("#store-list-dd");
					var s = "";
					for ( var i in data.servinglocation) {
						var st = {
							ID : data.servinglocation[i].lID,
							business : data.servinglocation[i].bID,
							address : data.servinglocation[i].address,
							phone : data.servinglocation[i].phone,
							lat : data.servinglocation[i].bLat,
							lon : data.servinglocation[i].bLon,
							title : data.servinglocation[i].title,
							deliverycost : data.servinglocation[i].deliverycost,
							freedeliverylimit : data.servinglocation[i].freedeliverylimit,
							online : data.servinglocation[i].online,
							serving : []
						};

						var store = null;

						for (j in stores) {
							if (stores[j].ID == st.ID) {
								store = stores[j];
								break;
							}
						}

						if (store == null) {
							store = st;
							stores.push(store);
							s += '<li><a href="javascript:setStore('
									+ (stores.length - 1) + ');">'
									+ store.title + '</a></li>';
						}
						store.serving.push({
							lat : data.servinglocation[i].sLat,
							lon : data.servinglocation[i].sLon
						});
					}
					lst.html(s);
					$(".dropdown-toggle").dropdown();

					if (orderMethod == "D") {
						if (stores.length > 1) {
							findMyStore();
							$("#store-list-dd").prop("disabled", false);
						} else {
							$("#store-list-dd").val(0);
							$("#store-list-dd").prop("disabled", true);
						}
						$("#ch-address").prop("disabled", false);
					} else {
						// findCloseStore();
						$("#store-list-dd").prop("disabled", true);
						$("#ch-address").prop("disabled", true);
					}

				},
				error : function(data) {
					$
							.alert({
								title : 'Error',
								content : 'There is no location available to serve you!',
								icon : 'fa fa-hand-paper-o',
								theme : 'material',
								animation : 'scale',
								type : 'red',
							});
				}
			});
}

function payAndPlaceOrder() {
	if (store == null) {
		failResponse("Please select the store you want to pick up from.", 3000);
		return;
	}
	if (paymentMethod == null) {
		failResponse("Please select your payment method.", 3000);
		return;
	}

	if (paymentMethod == "CCXX") { // / Change to CC for Credit Card Payment
									// processing!
		paymentProcess();
	} else {
		addOrder();
	}
}

function aboutUs() {
	display("aboutusPage");
}

function showDeals() {
	if ($("#dealsList").html().length == 0) {
		renderDealPage(null);
	}
	display("dealPage");
}

function renderDealPage(lookFor) {
	var s = "";

	for ( var i in products.deals) {
		var deal = products.deals[i];
		if (lookFor != null && deal.name.toLowerCase().indexOf(lookFor) == -1) {
			continue;
		}
		if (i % 2 == 0) {
			if (s.length != 0) {
				s += '</div>';
				s += '<div class="row">';
				s += '<div class="col-sm-12">';
				s += '<hr width="75%"></div>';
				s += '</div>';
			}
			s += '<div class="row">';
		}
		s += '<div class="col-sm-6">';
		s += '<div class="sitem row"><div class="col-xs-6">';
		s += '<h3><span>';
		s += deal.name;
		s += '</span> $' + formatCurrency(deal.price) + '</h3>';
		s += deal.wname;
		s += '<button type="button" onclick="addDealToCart(' + i
				+ ')" class="btn btn-default get">Add to cart</button>';
		s += '</div><div class="col-xs-6" ><img src="images/pics/deal_';
		s += deal.id;
		s += '.png" class="smalldeal img-responsive" alt="" onerror="imgError(this);"/></div></div></div>';
	}
	s += '</div>';

	$("#dealsList").html(s);

}

function paymentProcess() {

	var due = gTotoal - pointsValue - balanceValue;

	stripeHandler = StripeCheckout.configure({
		key : businessData.paymentkey1,
		image : 'Icons/firstlastname.svg',
		token : stripeCallBack
	});

	stripeHandler.open({
		name : 'BSmarter.CA on behalf of ' + businessData.businessname,
		description : 'Your purchase of $' + formatCurrency(due),
		amount : ((parseFloat(due)) * 100),
		email : userinfo.clientemail

	});

}

function stripeCallBack(token) {

	var payType = 'Order Goods';
	var due = gTotoal - pointsValue - balanceValue;

	var inputObjectToStripe = {
		type : payType,
		total : due,
		token : token.id
	};

	apiStripeCallBack(payType, due, token.id, userinfo.sessionid,
			function(data) {
				if (data.code == "OK") {
					addOrder();
				} else {
					failResponse("Error in payment processing.");
				}
			}, function(data) {
				failResponse("this error := " + error.status);
			});
}

function addOrder() {
	var action = "A"; // A for Adding a new Order
	var addr = ''; // Delivery address
	var addrType = ''; // Profile if it is client's address, else Custom if
						// user
	// enters address on checkout page
	var dcharge = ''; // Delivery Charges
	var dtime = ''; // delivery Time
	var oid = 0; // this changes only when order is for updating order, null
					// for
	// new orders
	var otype = ''; // P for Pickup and D for Delivery
	var ptype = ''; // Payment type, Cash or Paid when user pays with a credit
					// card
	var tax = 0; // taxes applicable on order
	var discount = 0; // discount if available
	var promotion = ''; // promotion string
	var cartArray = []; // Cart
	var paymentArray = []; // Payment Info
	var points = 0; // Points used
	var balance = 0; // Balance used

	if (stores[store].online == 0) {
		$
				.alert({
					title : 'Store is offline',
					content : 'Store is offline at this time, your order will be processed when store is online and you get a notification email at that time. Before getting the notification email you can cancel your order without any penalty.',
					icon : 'fa fa-thumbs-up',
					theme : 'material',
					animation : 'scale',
					type : 'green',
				});
	}

	otype = orderMethod;
	addr = $("#ch-address").val();
	addrType = "";
	dtime = $("#ch-time").val();
	dcharge = delivery;
	var due = gTotoal - pointsValue - balanceValue;
	ptype = paymentMethod;
	tax = taxes;
	points = pointsValue;
	balance = balanceValue;

	var dealPos = 0;
	for (var i = 0; i < cart.length; i++) {
		if (cart[i].deal != null) {
			if (cart[i].menu == null) {
				dealPos = 0;
			} else {
				dealPos++;
			}
		} else {

		}
		var opArray = [];
		if (cart[i].menu != null) {
			for ( var j in cart[i].options) {
				opArray.push({
					dbl : cart[i].options[j].dbl,
					hlf : cart[i].options[j].hlf,
					onL : cart[i].options[j].onL,
					onR : cart[i].options[j].onR,
					tri : cart[i].options[j].tri,
					modifier : cart[i].options[j].modifier.id
				})
			}
		}

		cartArray.push({
			deal : cart[i].deal == null ? 0 : cart[i].deal.id,
			id : cart[i].id,
			menu : cart[i].menu == null ? 0 : cart[i].menu.id,
			price : getPrice(cart[i]),
			qty : cart[i].qty,
			pos : dealPos,
			options : opArray
		});
	}
	

	paymentArray.push({
		amount : taxes,
		pType  : "TAX"
	});
	if (points!=0){
		paymentArray.push({
			amount : points,
			pType  : "POINTS"
		});
	}
	if (balance!=0){
		paymentArray.push({
			amount : balance,
			pType  : "BALANCE"
		});
	}
	if (dcharge!=0){
		paymentArray.push({
			amount : dcharge,
			pType  : "DELIVERY"
		});
	}
	paymentArray.push({
		amount : sTotal,
		pType  : "PURCHASE"
	});
	
	paymentArray.push({
		amount : due,
		pType  : ptype
	});
	

	var orderObj = {
		action 			: action,
		customer 		: userinfo.phone,
		customerID 		: userinfo.ID,
		address 		: addr,
		addressType 	: addrType,
		deliveryCharge 	: dcharge,
		discount 		: discount,
		dtime 			: dtime,
		due 			: due,
		total 			: total,
		note 			: $("#ch-instruction").val(),
		oid 			: oid,
		ordertype 		: otype,
		pType 			: ptype,
		promotion 		: promotion,
		store 			: stores[store].ID,
		business 		: businessid,
		taxes 			: tax,
		pointused 		: points,
		balanceused 	: balance,
		totalbeforetax 	: sTotal,
		username 		: userinfo.email,
		membership 		: userinfo.membership,
		name 			: userinfo.fullname,
		cart 			: cartArray,
		payment			: paymentArray
	};

	$
			.ajax({
				type : 'POST',
				url : 'PHP/api/service.php/AddOrUpdateOrder',
				dataType : 'json',
				data : JSON.stringify(orderObj),
				contentType : "application/json; charset=utf-8",
				success : function(data) {
					if (data.result == 1) {
						successResponse("Added order successfully!", 1500);
						emptyCart();
						display("main");
					} else {
						failResponse("Something went wrong " + data.message);
					}
				},
				error : function(data) {
					$
							.alert({
								title : 'Error',
								content : 'Due to technicl difficulties we could not submit your order, please call us to order by phone.',
								icon : 'fa fa-hand-paper-o',
								theme : 'material',
								animation : 'scale',
								type : 'red',
							});
				}
			});
}

function repeatOrderWithId(orderId) {
	if (cart.length!=0){
		$.alert({
			title : 'Error',
			content : 'Your cart is not empty, please check out or empty the cart before loading an order from history.' ,
			icon : 'fa fa-hand-paper-o',
			theme : 'material',
			animation : 'scale',
			type : 'red',
		});
		return;
	}
	for (var n = 0; n < orderHistory.orders.length; n++) {
		if (orderHistory.orders[n].ID == orderId) {
			cartData = JSON.parse(orderHistory.orders[n].orderdata).cart;
			cart = [];
			var cart_next_id = 0;
			for ( var i in cartData) {
				var l = cartData[i];
				var menu = findMenu(l.menu);
				var deal = findDeal(l.deal);
				var dealmenu = null;
				if (deal != null && menu != null) {
					for ( var j in deal.menus) {
						if (deal.menus[j].menu == menu.id) {
							dealmenu = deal.menus[j];
							break;
						}
					}
				}
				var item = {
					id : cart_next_id,
					qty : 1,
					menu : menu,
					deal : deal,
					options : [],
					price : 0.0,
					freeoptions : dealmenu == null ? 0 : dealmenu.freeoptions,
					ready : false
				};

				for ( var j in l.options) {
					var option = {
						dbl : l.options[j].dbl,
						hlf : l.options[j].hlf,
						onL : l.options[j].onL,
						onR : l.options[j].onR,
						tri : l.options[j].tri,
						modifier : findOption(menu, l.options[j].modifier)
					};
					item.options.push(option);
				}
				cart_next_id++;
				cart.push(item);
			}
			showCart();
			break;
		}
	}
}

function callStore(orderId){
	for (var n = 0; n < orderHistory.orders.length; n++) {
		if (orderHistory.orders[n].ID == orderId) {
			var tel = stores[orderHistory.orders[n].store].phone;
			 window.open("tel:" + tel);
			break;
		}
	}
}

function cancelOrderWithId(orderId) {
	for (var n = 0; n < orderHistory.orders.length; n++) {
		if (orderHistory.orders[n].ID == orderId) {
			var updateOrderObject = {
				oid : orderHistory.orders[n].ID
			};

			$
			.ajax({
				type : 'POST',
				url : 'PHP/api/service.php/CancelOrder',
				dataType : 'json',
				data : JSON.stringify(updateOrderObject),
				contentType : "application/json; charset=utf-8",
				success : function(data) {
					if (data.result == 1) {
						successResponse("Order is cancelled successfully!", 1500);
						emptyCart();
						display("main");
					} else {
						failResponse("Something went wrong " + data.message);
					}
				},
				error : function(data) {
					$
							.alert({
								title : 'Error',
								content : 'Due to technicl difficulties we could not cancel your order, please call us to cancel by phone.',
								icon : 'fa fa-hand-paper-o',
								theme : 'material',
								animation : 'scale',
								type : 'red',
							});
				}
			});
			break;
		}
	}
}

function performSearch() {
	var s = "";

	$(".search-query").each(function() {
		if ($(this).is(':visible')) {
			s = $(this).val();
		}
	});

	if (s.length == 0) {
		s = null;
	}

	if (thisPage == "main") {
		$("#main-carousel").carousel("pause").removeData();
		renderIndexDeals(s);
		$("#main-carousel").carousel(0);
	} else if (thisPage == "dealPage") {
		$("#dealsList").html("");
		renderDealPage(s);
	} else if (thisPage == "menuPage") {
		showMenuMatching(s);
	}

}