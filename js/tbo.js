"use strict";
var server = null; // Server who's using this tablet
var tables = null; // All tables in this area
var table = null; // Table being served
var areas = null; // Area informaiton cach
var area = null; // Selected area
var menuTree = []; // Used to go back in menu selection page
var menuSet = null; // Menuset being processed right now.
var menuSetCache = []; // Caching menuSets to be used for performance and later use.
var allMenus = []; // Caching all menus
var order = []; // holds the order items
var item = null; // holds the active item
var guest = 0; // Shows the active guest, zero is the table
var showingMsg = false; // Message recursion support
var modifierSet = []; // Cache for modifiers
var modSet = null; // Modifier set for this item
var itemMod = null; // Modifier that is being added/edited to this item
var modTree = []; // Used to go back in modifier selection page
var loadedOrder = null; // Holds the order loaded (if any)

function serverSignIn() {
	var serverId = $("#server").val();
	if (serverId == "") {
		$.alert({
			title : 'Error',
			content : 'Please enter a your password.',
			icon : 'fa fa-hand-paper-o',
			theme : 'material',
			animation : 'scale',
			type : 'red',
		});
		return;
	}
	$("#server").val("");
	$.ajax({
		type : 'GET',
		url : 'PHP/inc/restapi.php/users?transform=1&filter[]=password,eq,' + serverId,
		dataType : 'json',
		data : null,
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result == null) {
				$.alert({
					title : 'Error',
					content : 'System is not available at this time code:tbo-serverSignIn-1',
					icon : 'fa fa-hand-paper-o',
					theme : 'material',
					animation : 'scale',
					type : 'red'
				});
				return;
			}

			server = result.users[0];
			$("#serverInfo").html(server.name);
			table = null;
			showTables();
		},
		error : function(result) {
			$.alert({
				title : 'Error',
				content : 'System is not available at this time code:tbo-serverSignIn-2',
				icon : 'fa fa-hand-paper-o',
				theme : 'material',
				animation : 'scale',
				type : 'red',
			});
		}
	});
}

// Shows the table layout
function showTables() {
	$("#serverSI").hide();
	$("#areaTable").show();
}

function showTablesForArea(aId) {

	var areaId = aId;
	
	if (typeof aId!="undefined"){
		areaId = aId;
		for ( var i in areas) {
			if (areas[i].ID == aId) {
				area = areas[i];
				break;
			}
		}
		if (area == null) {
			$.alert({
				title : 'Error',
				content : 'Area can not be found! code:tbo-showTables-3',
				icon : 'fa fa-hand-paper-o',
				theme : 'material',
				animation : 'scale',
				type : 'red'
			});
			return;
		}
	}else{
		areaId = area.ID;
	}
	$("#areaInfo").html(area.areaName);
	$.ajax({
		type : 'GET',
		url : 'PHP/inc/restapi.php/areatables?transform=1&filter[]=AID,eq,' + areaId,
		dataType : 'json',
		data : null,
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result == null) {
				$.alert({
					title : 'Error',
					content : 'System is not available at this time code:tbo-showTables-1',
					icon : 'fa fa-hand-paper-o',
					theme : 'material',
					animation : 'scale',
					type : 'red'
				});
				return;
			}

			tables = result.areatables;
			let s = "";
			for ( var i in result.areatables) {
				var miz = result.areatables[i];
				s += '<div class="col-sm-6 col-lg-3"><p class="category">' + miz.no;
				if (miz.server != null) {
					s += ": " + miz.server;
				}
				s += '</p><img onclick="selectTable(this,' + miz.ID;
				s += ')" src="./assets/img/table.png" class="tbls rounded-circle img-raised"';
				// s += ' style="position: absolute; left:' + miz.x + ';
				// top: ' + miz.y + '"></div>';
				s += ' style="cursor: pointer;';
				if (table!=null && table.ID == miz.ID){
					s += 'border:6px solid green;';
				}
				s += '"></div>';
			}

			$("#tableSelector").html(s);
		},
		error : function(result) {
			$.alert({
				title : 'Error',
				content : 'System is not available at this time code:tbo-showTables-2',
				icon : 'fa fa-hand-paper-o',
				theme : 'material',
				animation : 'scale',
				type : 'red',
			});
		}
	});
}

// Server clicks on a table to serve
function selectTable(img, tableID) {
	var clickedOn = null;
	for ( var i in tables) {
		if (tables[i].ID == tableID) {
			clickedOn = tables[i];
			break;
		}
	}
	if (clickedOn == null) {
		$.alert({
			title : 'Error',
			content : 'Can not find this table!',
			icon : 'fa fa-hand-paper-o',
			theme : 'material',
			animation : 'scale',
			type : 'red',
		});
		return;
	}

	if (clickedOn.server == null) {
		$('#menuTabBtn').trigger('click');
		// New table
	} else if (clickedOn.server != server.name) {
		// Clicked on someone else's table!
		$.alert({
			title : 'Error',
			content : 'This table is being served by someone else. You can not open it.',
			icon : 'fa fa-hand-paper-o',
			theme : 'material',
			animation : 'scale',
			type : 'red',
		});
		return;
	} else {
		// Reopening the existing table
		$.ajax({
			type : 'GET',
			url : 'PHP/inc/restapi.php/orderdetail?transform=1&filter=tbl,eq,' + clickedOn.ID,
			dataType : 'json',
			data : null,
			contentType : "application/json; charset=utf-8",
			success : function(result) {
				if (result == null) {
					$.alert({
						title : 'Error',
						content : 'System is not available at this time code:tbo-getAreaInfo-1',
						icon : 'fa fa-hand-paper-o',
						theme : 'material',
						animation : 'scale',
						type : 'red'
					});
					return;
				}
				order = [];
				loadedOrder = null;
				if (result.orderdetail.length!=0){
					var ln = result.orderdetail[0];
					loadedOrder = ln.OID;
					var loadedItems = [];
					for ( var i in result.orderdetail) {
						let lnx = result.orderdetail[i];
						if (loadedItems.find(function(element) {
							if (element == lnx.OIID)
								return true;
							})){
							continue;
						}
						loadedItems.push(lnx.OIID);

						var oi = {
							'deal' 		: null,
							'menu' 		: findMenu(lnx.menu),
							'options' 	: [],
							'guest' 	: lnx.guest,
							'sent'		: true
						};
						order.push(oi);
						for ( var j in result.orderdetail) {
							if (result.orderdetail[j].OIID==lnx.OIID){
								oi.options.push({
									'mod' : result.orderdetail[j].modifier,
									'dbl' : result.orderdetail[j].dbl == 1,
									'easy' : result.orderdetail[j].easy == 1,
									'left' : result.orderdetail[j].onLeft == 1,
									'right' : result.orderdetail[j].onRight == 1
								});
							}
						}
					}
				}
				renderOrderItems();
			},
			error : function(result) {
				$.alert({
					title : 'Error',
					content : 'System is not available at this time code:tbo-getAreaInfo-2',
					icon : 'fa fa-hand-paper-o',
					theme : 'material',
					animation : 'scale',
					type : 'red',
				});
			}
		});
		$('#orderTabBtn').trigger('click');
	}

	$(".tbls").css('border', 'none');
	$(img).css('border', '6px solid green');
	table = clickedOn;
	
	var tblObj = {
		'user' : server.ID
	};
	$.ajax({
		type : 'PUT',
		url : 'PHP/inc/restapi.php/miz/' + clickedOn.ID,
		dataType : 'json',
		data : JSON.stringify(tblObj),
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result==null){
				$.alert({
					title : 'Error',
					content : 'System is not available at this time code:selectTable-001',
					icon: 'fa fa-hand-paper-o',
			        theme: 'material',
			        animation: 'scale',
			        type: 'red'
				});
				return;
			}
		},
		error : function(result) {
			$.alert({
				title : 'Error',
				content : 'System is not available at this time code:selectTable-2',
				icon : 'fa fa-hand-paper-o',
				theme : 'material',
				animation : 'scale',
				type : 'red',
			});
		}
	});

	
	$("#tableInfo").html(table.no);

	$("#orderTabNL").hide();
	$("#menuTabNL").hide();
	$("#specialTabNL").hide();
	$("#orderTabLI").show();
	$("#menuTabLI").show();
	$("#specialTabLI").show();
	showTablesForArea();
}

// Logs out the server
function serverLogout() {
	server = null;
	table = null;
	area = null;
	$("#serverInfo").html("N/A");
	$("#areaInfo").html("N/A");
	$("#tableInfo").html("N/A");
	$("#serverSI").show();
	$("#areaTable").hide();

	$("#orderTabNL").show();
	$("#menuTabNL").show();
	$("#specialTabNL").show();
	$("#orderTabLI").hide();
	$("#menuTabLI").hide();
	$("#specialTabLI").hide();

	order = [];

}

// Gets and caches area information
function getAreaInfo() {
	$.ajax({
		type : 'GET',
		url : 'PHP/inc/restapi.php/area?transform=1&',
		dataType : 'json',
		data : null,
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result == null) {
				$.alert({
					title : 'Error',
					content : 'System is not available at this time code:tbo-getAreaInfo-1',
					icon : 'fa fa-hand-paper-o',
					theme : 'material',
					animation : 'scale',
					type : 'red'
				});
				return;
			}

			areas = result.area;
			var firstAreaId = areas[0].ID;
			let s = "";
			for ( var i in areas) {
				s += '<div class="col-sm-6 col-lg-3 form-check form-check-radio"><label class="form-check-label">';
				s += '<input class="form-check-input" type="radio" name="areaRadio" id="area_' + i;
				s += '" value="' + areas[i].ID;
				if (i == 0) {
					s += '" checked';
				} else {
					s += '"';
				}
				s += '><span class="form-check-sign"></span>';
				s += areas[i].areaName;
				s += '</label></div>';
			}

			$("#areaSelector").html(s);
			$('input:radio[name=areaRadio]').change(function() {
				showTablesForArea(this.value);
			});
			showTablesForArea(firstAreaId);
		},
		error : function(result) {
			$.alert({
				title : 'Error',
				content : 'System is not available at this time code:tbo-getAreaInfo-2',
				icon : 'fa fa-hand-paper-o',
				theme : 'material',
				animation : 'scale',
				type : 'red',
			});
		}
	});

}

// Gets and caches menu and Special information
// SELECT menus.* , menumodifiers.* from menus LEFT JOIN menumodifiers ON
// menus.ID = menumodifiers.menu LEFT JOIN modifiers ON menumodifiers.modifier=
// modifiers.ID WHERE menus.owner IS NULL

function getMenuInfo(owner) {
	menuTree.push(owner);

	if (typeof menuSetCache[owner] != "undefined") {
		// Use the cache
		menuSet = menuSetCache[owner];
		buildFromMenuSet(owner);
		console.log("Using cache!");
		return;
	}
	
	menuSet = [];
	for ( var i in allMenus) {
		if ((allMenus[i].menuOwner==null && owner==0) || allMenus[i].menuOwner==owner){
			menuSet.push(allMenus[i]);
		}
	}

//	var filter;
//	if (owner == 0) {
//		filter = "is";
//	} else {
//		filter = "eq," + owner;
//	}
//	$.ajax({
//		type : 'GET',
//		url : 'PHP/inc/restapi.php/menuinfo?transform=1&filter[]=menuOwner,' + filter,
//		dataType : 'json',
//		data : null,
//		contentType : "application/json; charset=utf-8",
//		success : function(result) {
//			if (result == null) {
//				$.alert({
//					title : 'Error',
//					content : 'System is not available at this time code:tbo-getMenuInfo-1',
//					icon : 'fa fa-hand-paper-o',
//					theme : 'material',
//					animation : 'scale',
//					type : 'red'
//				});
//				return;
//			}
//
//			menuSet = result.menuinfo;
//			menuSetCache[owner] = menuSet;
//			buildFromMenuSet(owner);
//		},
//		error : function(result) {
//			$.alert({
//				title : 'Error',
//				content : 'System is not available at this time code:tbo-getMenuInfo-2',
//				icon : 'fa fa-hand-paper-o',
//				theme : 'material',
//				animation : 'scale',
//				type : 'red',
//			});
//		}
//	});
	
//	menuSet = result.menuinfo;
	menuSetCache[owner] = menuSet;
	buildFromMenuSet(owner);

}

// Builds the menu page from the menuSet
function buildFromMenuSet(owner) {
	let s = "";
	var mId = 0;
	for ( var i in menuSet) {
		if (mId == menuSet[i].menuID) {
			continue;
		}
		mId = menuSet[i].menuID;
		s += '<div class="col-3"><button class="btn btn-block btn-';
		if (menuSet[i].complex == 1 || menuSet[i].menuPrice == 0) {
			s += 'success';
		} else {
			s += 'info';
		}
		s += ' btn-round" type="button" onclick="menuIsSelected(' + menuSet[i].menuID + ')"><span class="h3">';
		s += menuSet[i].menuName;
		s += '</span></button></div>';
	}
	if (owner != 0) {
		s += '<div class="col-3"><button class="btn btn-block btn-warning btn-round" type="button" onclick="menuGoBack()"><span class="h3">';
		s += 'Back'
		s += '</span></button></div>';
	}
	$("#menuTabLIContent").html(s);
}

// Called when a menu is selected
function menuIsSelected(mID) {
	var menu = null;
	for ( var i in menuSet) {
		menu = menuSet[i];
		if (menu.menuID == mID) {
			break;
		}
	}
	if (menu == null) {
		// Shouldn't happen!
		return;
	}
	if (menu.complex == 1 || menu.menuPrice == 0) {
		getMenuInfo(mID);
	} else {
		addToOrder(menu);
	}
}

//Gets and caches all Menus
function cacheMenus() {
	$.ajax({
		type : 'GET',
		url : 'PHP/inc/restapi.php/menuinfo?transform=1',
		dataType : 'json',
		data : null,
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result == null) {
				$.alert({
					title : 'Error',
					content : 'System is not available at this time code:tbo-getModifierInfo-1',
					icon : 'fa fa-hand-paper-o',
					theme : 'material',
					animation : 'scale',
					type : 'red'
				});
				return;
			}
			allMenus = result.menuinfo;
			getMenuInfo(0);
		},
		error : function(result) {
			$.alert({
				title : 'Error',
				content : 'System is not available at this time code:tbo-getModifierInfo-2',
				icon : 'fa fa-hand-paper-o',
				theme : 'material',
				animation : 'scale',
				type : 'red',
			});
		}
	});
}


// Gets and caches all Modifiers
function cacheModifiers() {
	$.ajax({
		type : 'GET',
		// url : 'PHP/inc/restapi.php/modifiertree?transform=1',
		url : 'PHP/inc/restapi.php/sortedmods?transform=1',
		dataType : 'json',
		data : null,
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result == null) {
				$.alert({
					title : 'Error',
					content : 'System is not available at this time code:tbo-cacheModifiers-1',
					icon : 'fa fa-hand-paper-o',
					theme : 'material',
					animation : 'scale',
					type : 'red'
				});
				return;
			}

			for ( var i in result.sortedmods) {
				var mod = result.sortedmods[i];
				if (mod.owner != null && mod.owner != 0) {
					var parent = findMyDad(mod, modifierSet);
					if (typeof parent == "undefined") {
						continue;
					}
					parent.children.push({
						'mod' : result.sortedmods[i],
						'parent' : parent,
						'children' : []
					});
				} else {
					modifierSet.push({
						'mod' : result.sortedmods[i],
						'parent' : null,
						'children' : []
					});
				}
			}
		},
		error : function(result) {
			$.alert({
				title : 'Error',
				content : 'System is not available at this time code:tbo-cacheModifiers-2',
				icon : 'fa fa-hand-paper-o',
				theme : 'material',
				animation : 'scale',
				type : 'red',
			});
		}
	});
}

// Finds a modifier's owner
function findMyDad(mod, aSet) {
	var parent = aSet.find(function(element) {
		if (element.mod.ID == mod.owner)
			return true;
	});
	if (typeof parent != "undefined") {
		return parent;
	}

	for ( var i in aSet) {
		parent = findMyDad(mod, aSet[i].children);
		if (typeof parent != "undefined") {
			return parent;
		}
	}
	return null;
}

// Gets and caches all Deals
function getDealInfo() {

}

// Called when back button is pushed on menu page
function menuGoBack() {
	var mId = menuTree.pop();
	mId = menuTree.pop();
	getMenuInfo(mId);
}

// Adds a menu item to this order
function addToOrder(menu) {
	order.push({
		'deal' 		: null,
		'menu' 		: menu,
		'options' 	: [],
		'guest' 	: guest,
		'sent'		: false		
	});
	renderOrderItems();
	successResponse(menu.menuName + " is added to order.", 1000);
}

// render Order items
function renderOrderItems() {
	let s = "";
	for ( var i in order) {
		s += '<tr><td scope="row">';
		if (order[i].guest == 0) {
			s += "Table";
		} else {
			s += "G:" + order[i].guest;
		}
		s += '</td><td class="text-left">';
		s += order[i].menu.menuName;
		s += '</th><td class="text-left">';
		s += getItemDetail(i);
		s += '</td><td>';
		if (order[i].sent){
			s += '<a href="javascript:repeatOrderRow(' + i + ');">';
			s += '<i class="fas fa-2x fa-redo-alt"></i></a>';
		}else{
			s += '<a href="javascript:editOrderRow(' + i + ');">';
			s += '<i class="fas fa-2x fa-edit"></i></a>';
		}
		s += '</td><td>';
		if (order[i].sent){
			s += '<i class="fas fa-2x fa-ban" style="color:red;"></i>';
		}else{
			s += '<a href="javascript:deleteOrderRow(';
			s += i + ');"><i class="fas fa-2x fa-trash-alt"></i></a>'
		}
		s += '</td></tr>';
	}
	$("#orderRows").html(s);

	if (order.length!=0){
		$("#orderAction").html('<i class="far fa-2x  fa-share-square"></i>Submit Order');
	}else{
		$("#orderAction").html('<i class="fas fa-2x fa-undo-alt"></i>Close Table');;
	}
}

// Returns details about an order item
function getItemDetail(i) {
	let s = "";

	let opt = order[i].options;
	for ( var i in opt) {
		if (opt[i].mod==null){
			continue;
		}
		if (s != "") {
			s += ", ";
		}
		if (opt[i].dbl) {
			s += "Double ";
		} else if (opt[i].easy) {
			s += "Easy on ";
		}
		var mod = findMod(opt[i].mod, modifierSet);
		s += mod.mod.name;
		if (opt[i].left) {
			s += " on left ";
		} else if (opt[i].right) {
			s += " on right ";
		}
	}
	return s;
}

// Submits the current changes to the order tables
function submitOrder() {
	
	if (order.length==0){
		var tblObj = {
				'user' : null
			};
			$.ajax({
				type : 'PUT',
				url : 'PHP/inc/restapi.php/miz/' + table.ID,
				dataType : 'json',
				data : JSON.stringify(tblObj),
				contentType : "application/json; charset=utf-8",
				success : function(result) {
					if (result==null){
						$.alert({
							title : 'Error',
							content : 'System is not available at this time code:selectTable-001',
							icon: 'fa fa-hand-paper-o',
					        theme: 'material',
					        animation: 'scale',
					        type: 'red'
						});
						return;
					}
					table = null;
					showTablesForArea();
					$('#homeTabBtn').trigger('click');
				},
				error : function(result) {
					$.alert({
						title : 'Error',
						content : 'System is not available at this time code:selectTable-2',
						icon : 'fa fa-hand-paper-o',
						theme : 'material',
						animation : 'scale',
						type : 'red',
					});
				}
			});

		return;
	}
	
	var oId = null;
	var submitted = false;
	if (loadedOrder != null) {
		var GUUID = guid();
		for ( var i in order) {
			var oi = order[i];
			if (oi.sent){
				continue;
			}
			submitted = true;
			var oiObj = {
				"ID" : GUUID,
				"order" : loadedOrder,
				"deal" : null,
				"menu" : oi.menu.menuID,
				"cnt" : 1,
				"guest" : oi.guest,
				"paid" : 0,
				"printed" : 0,
				"rprinted" : 0,
				"made" : 0,
				"menudeal" : null,
				"acknowledged" : null,
				"dealcntpos" : 0,
				"guestName" : null,
				"time"		: new Date(),
				"customer" : null
			};
			$.ajax({
				type : 'POST',
				url : 'PHP/inc/restapi.php/orderitems',
				dataType : 'json',
				data : JSON.stringify(oiObj),
				contentType : "application/json; charset=utf-8",
				success : function(result) {
					if (result == null) {
						$.alert({
							title : 'Error',
							content : 'System is not available at this time code: submitOrder-003',
							icon : 'fa fa-hand-paper-o',
							theme : 'material',
							animation : 'scale',
							type : 'red'
						});
						return null;
					}
					oi.sent = true;
					var orderItemID = result;
					for ( var j in oi.options) {
						var oid = oi.options[j];
						var oidObj = {
							"orderitem" : GUUID,
							"modifier" : oid.mod,
							"free" : 0,
							"onLeft" : oid.left,
							"onRight" : oid.right,
							"onSide" : 0,
							"dbl" : oid.dbl,
							"trip" : 0,
							"half" : 0,
							"note" : null,
							"price" : 0.0,
							"memo" : null,
							"easy" : oid.easy,
							"no" : 0
						};
						$.ajax({
							type : 'POST',
							url : 'PHP/inc/restapi.php/orderitemdetails',
							dataType : 'json',
							data : JSON.stringify(oidObj),
							contentType : "application/json; charset=utf-8",
							success : function(result) {
								if (result == null) {
									$.alert({
										title : 'Error',
										content : 'System is not available at this time code: submitOrder-004',
										icon : 'fa fa-hand-paper-o',
										theme : 'material',
										animation : 'scale',
										type : 'red'
									});
									return null;
								}
								renderOrderItems();
							},
							error : function(result) {
								$.alert({
									title : 'Error',
									content : 'System is not available at this time code: submitOrder-005',
									icon : 'fa fa-hand-paper-o',
									theme : 'material',
									animation : 'scale',
									type : 'red',
								});
								return null;
							}
						});
					}
				},
				error : function(result) {
					$.alert({
						title : 'Error',
						content : 'System is not available at this time code: submitOrder-006',
						icon : 'fa fa-hand-paper-o',
						theme : 'material',
						animation : 'scale',
						type : 'red',
					});
					return null;
				}
			});
		}
	} else {
		submitted = true;
		$.ajax({
			type : 'POST',
			url : 'PHP/inc/restapi.php/ordernumberdi',
			dataType : 'json',
			data : JSON.stringify({}),
			contentType : "application/json; charset=utf-8",
			success : function(result) {
				if (result == null) {
					$.alert({
						title : 'Error',
						content : 'System is not available at this time code: submitOrder-001',
						icon : 'fa fa-hand-paper-o',
						theme : 'material',
						animation : 'scale',
						type : 'red'
					});
					return null;
				}
				let OId = result;
				var oObj = {
					"customer" : "DINE-IN",
					"total" : 0.00,
					"note" : "",
					"station" : "001",
					"server" : server.ID,
					"ordernumber" : OId,
					"made" : 0,
					"delivered" : 0,
					"closed" : 0,
					"canceled" : 0,
					"orderType" : "N",
					"driver" : null,
					"WebID" : null,
					"guestCount" : 1,
					"inProgressFor" : table.ID,
					"amount" : 0.00,
					"synched" : 0,
					"tbl" : table.ID,
					"partner" : null,
					"webInfo" : null
				};
				$.ajax({
					type : 'POST',
					url : 'PHP/inc/restapi.php/orders',
					dataType : 'json',
					data : JSON.stringify(oObj),
					contentType : "application/json; charset=utf-8",
					success : function(result) {
						if (result == null) {
							$.alert({
								title : 'Error',
								content : 'System is not available at this time code: submitOrder-002',
								icon : 'fa fa-hand-paper-o',
								theme : 'material',
								animation : 'scale',
								type : 'red'
							});
							return null;
						}
						loadedOrder = result;
						var GUUID = guid();
						for ( var i in order) {
							var oi = order[i];
							var oiObj = {
								"ID" : GUUID,
								"order" : loadedOrder,
								"deal" : null,
								"menu" : oi.menu.menuID,
								"cnt" : 1,
								"guest" : oi.guest,
								"paid" : 0,
								"printed" : 0,
								"rprinted" : 0,
								"made" : 0,
								"menudeal" : null,
								"acknowledged" : null,
								"dealcntpos" : 0,
								"guestName" : null,
								"time"		: new Date(),
								"customer" : null
							};
							$.ajax({
								type : 'POST',
								url : 'PHP/inc/restapi.php/orderitems',
								dataType : 'json',
								data : JSON.stringify(oiObj),
								contentType : "application/json; charset=utf-8",
								success : function(result) {
									if (result == null) {
										$.alert({
											title : 'Error',
											content : 'System is not available at this time code: submitOrder-003',
											icon : 'fa fa-hand-paper-o',
											theme : 'material',
											animation : 'scale',
											type : 'red'
										});
										return null;
									}
									oi.sent = true;
									var orderItemID = result;
									for ( var j in oi.options) {
										var oid = oi.options[j];
										var oidObj = {
											"orderitem" : GUUID,
											"modifier" : oid.mod,
											"free" : 0,
											"onLeft" : oid.left,
											"onRight" : oid.right,
											"onSide" : 0,
											"dbl" : oid.dbl,
											"trip" : 0,
											"half" : 0,
											"note" : null,
											"price" : 0.0,
											"memo" : null,
											"easy" : oid.easy,
											"no" : 0
										};
										$.ajax({
											type : 'POST',
											url : 'PHP/inc/restapi.php/orderitemdetails',
											dataType : 'json',
											data : JSON.stringify(oidObj),
											contentType : "application/json; charset=utf-8",
											success : function(result) {
												if (result == null) {
													$.alert({
														title : 'Error',
														content : 'System is not available at this time code: submitOrder-004',
														icon : 'fa fa-hand-paper-o',
														theme : 'material',
														animation : 'scale',
														type : 'red'
													});
													return null;
												}
												renderOrderItems();
											},
											error : function(result) {
												$.alert({
													title : 'Error',
													content : 'System is not available at this time code: submitOrder-005',
													icon : 'fa fa-hand-paper-o',
													theme : 'material',
													animation : 'scale',
													type : 'red',
												});
												return null;
											}
										});
									}
								},
								error : function(result) {
									$.alert({
										title : 'Error',
										content : 'System is not available at this time code: submitOrder-006',
										icon : 'fa fa-hand-paper-o',
										theme : 'material',
										animation : 'scale',
										type : 'red',
									});
									return null;
								}
							});
						}
					},
					error : function(result) {
						$.alert({
							title : 'Error',
							content : 'System is not available at this time code: submitOrder-007',
							icon : 'fa fa-hand-paper-o',
							theme : 'material',
							animation : 'scale',
							type : 'red',
						});
						return null;
					}
				});
			},
			error : function(result) {
				$.alert({
					title : 'Error',
					content : 'System is not available at this time code: submitOrder-008',
					icon : 'fa fa-hand-paper-o',
					theme : 'material',
					animation : 'scale',
					type : 'red',
				});
				return null;
			}
		});
	}
	if (submitted){
		successResponse("Order is saved successfully!",2000);
	}else{
		failResponse("There is nothing to submit!",2000);
	}
}

// Finds a menu definiion in menuCash, 
function findMenu(mId){
	let menu = null;
	for ( var i in allMenus) {
		let m = allMenus[i];
		if (m.menuID==mId){
			menu = m;
			break;
		}
	}
	return menu;
}

// Repeat a row of cart
function repeatOrderRow(row) {
	item = order[row];
	order.push({
		'deal' 		: null,
		'menu' 		: item.menu,
		'options' 	: [],
		'guest' 	: item.guest,
		'sent'		: false
	});
	successResponse("Item is added to your cart", 1000);
	renderOrderItems();
}

// Edits options for a row in order
function editOrderRow(row) {
	item = order[row];
	var mSet = [];
	var menu = null;

//	for ( var i in allMenus) {
//		if (allMenus[i].menuID == item.menu.menuID) {
//				menu = allMenus[i];
//				break;
//			}
//		}
//	}

	for ( var i in allMenus) {
		if (allMenus[i].menuID == item.menu.menuID){
			mSet.push(allMenus[i]);
		}
	}

	if (mSet.length == 0) {
		// shouldn't happen!
		failResponse("Menu could not be located!", 500);
		return;
	}
	menu = mSet[0];
	
	getOptionsFor(menu, mSet);
}

// Renders the options for a given menu
function getOptionsFor(menu, mSet) {
	var mSetClone = cloneModSet(modifierSet, null);

	for ( var i in mSet) {
		var mm = mSet[i];
		if (mm.menuID == menu.menuID) {
			var mod = findMod(mm.modID, mSetClone);
			if (mod == null) {
				// this item has no modifiers!
				failResponse("There is no options for this menu item", 1000);
				return;
			}
			mod.used = true;
			while (mod.parent != null) {
				mod = mod.parent;
				mod.used = true;
			}
		}
	}

	renderModifiers(mSetClone);
	$("#optionsModal").modal('show');
}

// Renders modifiers for this modifierSet
function renderModifiers(mSet) {
	var aSet = [];
	let s = "";
	for ( var i in mSet) {
		if (mSet[i].used == true) {
			aSet.push(mSet[i]);
		}
	}

	modSet = aSet;
	
	if (aSet.length == 1) {
		renderModifiers(aSet[0].children);
	} else {
		for ( var i in aSet) {
			var mod = aSet[i];
			let mId = mod.mod.ID;
			s += '<div class="col-4"><button class="btn btn-block btn-';
			if (mod.children.length == 0) {
				s += 'success';
			} else {
				s += 'info';
			}
			s += ' btn-round" type="button" onclick="';
			if (mod.children.length == 0) {
				s += 'modifierIsSelected(' + mId + ')';
			} else {
				s += 'renderChildModifiers(' + mId + ')';
			}
			s += '"><span id="optSel-' + mId + '">';
			var opt = findOption(mId);
			if (opt != null) {
				s += '<i class="far fa-2x fa-check-circle"></i>';
			}
			s += '</span>';
			s += '<span class="h5">';
			s += mod.mod.name;
			s += '</span> <span id="optBtn-' + mId + '">';

			if (opt != null) {
				if (opt.dbl) {
					s += '<i class="fas fa-2x fa-angle-double-up"></i>';
				} else if (opt.easy) {
					s += '<i class="fas fa-2x fa-angle-double-down"></i>';
				}
				s += " ";
				if (opt.left) {
					s += '<i class="fas fa-2x fa-angle-double-left"></i>';
				} else if (opt.right) {
					s += '<i class="fas fa-2x fa-angle-double-right"></i>';
				}
			}

			s += '<span></button></div>';
		}
//		if (level != 0) {
			s += '<div class="col-3"><button class="btn btn-block btn-warning btn-round" type="button" onclick="modifierGoBack()"><span class="h5">';
			s += 'Back'
			s += '</apan></button></div>';
//		} else {
//			s += '<div class="col-3"><button class="btn btn-block btn-warning btn-round" type="button" onclick="optionDone()"><span class="h5">';
//			s += 'Done'
//			s += '</span></button></div>';
//		}
		$("#optionsContent").html(s);
	}
}

// Called when a modifier is selected
function modifierIsSelected(mID) {
	itemMod = findMod(mID, modSet);
	var opt = findOption(mID);
	if (itemMod.mod.hasDbl == 0) {
		$("#amountRdo2X").prop('disabled', true);
	} else {
		$("#amountRdo2X").prop('disabled', false);
	}
	if (itemMod.mod.hasHalf == 0) {
		$("#amountRdo0X").prop('disabled', true);
	} else {
		$("#amountRdo0X").prop('disabled', false);
	}
	if (itemMod.mod.hasLeftRight == 0) {
		$("#sideRdoL").prop('disabled', true);
		$("#sideRdoA").prop('disabled', true);
		$("#sideRdoR").prop('disabled', true);
	} else {
		$("#sideRdoL").prop('disabled', false);
		$("#sideRdoA").prop('disabled', false);
		$("#sideRdoR").prop('disabled', false);
	}
	if (opt != null) {
		if (opt.dbl) {
			$("#amountRdo2X").prop('checked', true);
		} else if (opt.easy) {
			$("#amountRdo0X").prop('checked', true);
		} else {
			$("#amountRdoX").prop('checked', true);
		}
		if (opt.left) {
			$("#sideRdoL").prop('checked', true);
		} else if (opt.right) {
			$("#sideRdoR").prop('checked', true);
		} else {
			$("#sideRdoA").prop('checked', true);
		}
	} else {
		$("#amountRdoX").prop('checked', true);
		$("#sideRdoA").prop('checked', true);
	}

	if (itemMod.mod.hasDbl == 0 && itemMod.mod.hasHalf == 0 && itemMod.mod.hasLeftRight == 0) {
		addOption();
	} else {
		$("#itemModal").modal('show');
	}
}

// Called when Back is clicked on options page
function modifierGoBack() {
	if (modTree.length == 0) {
		$("#optionsModal").modal('hide');
		renderOrderItems();
	} else {
		var par = modTree.pop();
//		if (modTree.length == 0) {
//			renderModifiers(modSet, 0);
//		} else {
			renderModifiers(par.parent.children);
//		}
	}
}

// Called when all options for a menu is selected
function optionDone() {
	$("#optionsModal").modal('hide');
	renderOrderItems();
}

// Called when a modifier who has children
// is selected in option selection pop up page
function renderChildModifiers(mId) {
	var mod = findMod(mId, modSet);
//	var level = 0;

	var x = mod;
	while (x.parent != null) {
//		level++;
		x = x.parent;
//		if (x.children.length == 1) {
//			level--;
//		}
	}

	modTree.push(mod);
	renderModifiers(mod.children);
}

// Finds the option in item's options set
function findOption(mID) {
	var found = false;
	var opt = null;
	for ( var i in item.options) {
		var opt = item.options[i];
		if (opt.mod == mID) {
			found = true;
			break;
		}
	}
	if (found) {
		return opt;
	} else {
		return null;
	}
}

// Adds the option to this item
function addOption() {
	var opt = findOption(itemMod.mod.ID);

	var amount = $("input[name=amountRdo]:checked").val();
	var side = $("input[name=sideRdo]:checked").val();
	if (opt != null) {
		opt.dbl = amount == "2x";
		opt.easy = amount == "0x";
		opt.left = side == "L";
		opt.right = side == "R";
	} else {
		opt = {
				'mod' : itemMod.mod.ID,
				'dbl' : amount == "2x",
				'easy' : amount == "0x",
				'left' : side == "L",
				'right' : side == "R"
			};
		item.options.push(opt);
	}

	let s = "";
	if (amount == "2x") {
		s += '<i class="fas fa-2x fa-angle-double-up"></i>';
	} else if (amount == "0x") {
		s += '<i class="fas fa-2x fa-angle-double-down"></i>';
	}
	s += " ";
	if (side == "L") {
		s += '<i class="fas fa-2x fa-angle-double-left"></i>';
	} else if (side == "R") {
		s += '<i class="fas fa-2x fa-angle-double-right"></i>';
	}

	$("#optSel-" + itemMod.mod.ID).html('<i class="far fa-2x fa-check-circle"></i>');
	$("#optBtn-" + itemMod.mod.ID).html(s);

	$("#itemModal").modal('hide');
	if (itemMod.mod.exclusive == 1) {
//		if (opt != null) {
			var ms = findMod(opt.mod, modifierSet);
			for ( var i in item.options) {
				var o = item.options[i];
				var m = findMod(o.mod, modifierSet);
				if (m.parent.mod.ID == ms.parent.mod.ID && m.mod.ID != ms.mod.ID) {
					item.options.splice(i, 1);
					break;
				}
			}
//			optionDone();
//		}
		if (modTree.length == 0) {
			optionDone();
		} else {
			modifierGoBack();
		}
	}

}

// Removed the option from this item
function removeOption() {
	var opt = null;
	for ( var i in item.options) {
		var opt = item.options[i];
		if (opt.mod == itemMod.mod.ID) {
			item.options.splice(i, 1);
			$("#optBtn-" + itemMod.mod.ID).html("");
			$("#optSel-" + itemMod.mod.ID).html("");
			break;
		}
	}
	$("#itemModal").modal('hide');
}

// Clones the modifierSet and adds the tag for being used
function cloneModSet(aSet, parent) {
	var mSet = [];
	for ( var i in aSet) {
		var modItem = {
			'mod' : aSet[i].mod,
			'parent' : parent,
			'children' : [],
			'used' : false
		};
		modItem.children = cloneModSet(aSet[i].children, modItem);
		mSet.push(modItem);
	}
	return mSet;
}

// Finds a modifier in modifierSet
function findMod(id, mSet) {
	for ( var i in mSet) {
		var mod = mSet[i];
		if (mod.mod.ID == id) {
			return mod;
		}
		mod = findMod(id, mod.children);
		if (mod != null) {
			return mod;
		}
	}
	return null;
}

// Deletes a row from order
function deleteOrderRow(row) {
	if (order[row].deal != null) {

	} else {
		order.splice(row, 1);
	}
	renderOrderItems();
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
