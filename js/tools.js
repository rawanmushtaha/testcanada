function encryptPassword(pas) {
	AES_Init();
	var block = new Array(16);
	var pStr = pas;
	while (pStr.length != 16)
		pStr += " ";
	for (var i = 0; i < 16; i++) {
		var c = pStr.charCodeAt(i);
		block[i] = c;
	}

	var key = new Array(32);
	for (var i = 0; i < 32; i++)
		key[i] = i * 3;

	AES_ExpandKey(key);
	AES_Encrypt(block, key);

	pStr = "";
	for (var i = 0; i < 16; i++) {
		pStr += String.fromCharCode(block[i]);
	}

	AES_Done();

	return pStr;
}

function decryptPassword(pas) {
	AES_Init();
	var block = new Array(16);
	if (typeof pas == "undefined" || pas == "" || pas == null) {
		return null;
	}
	for (var i = 0; i < 16; i++) {
		var c = pas.charCodeAt(i);
		block[i] = c;
	}

	var key = new Array(32);
	for (var i = 0; i < 32; i++)
		key[i] = i * 3;

	AES_ExpandKey(key);
	AES_Decrypt(block, key);

	var pStr = "";
	for (var i = 0; i < 16; i++) {
		pStr += String.fromCharCode(block[i]);
	}

	AES_Done();
	pStr = pStr.replace(/\s+/g, '');
	return pStr;
}
function lsGet(name, scope) {
	// if (scope == "G"|| businessData==null) {
	return localStorage.getItem(name);
	// }
	// return localStorage.getItem(name + "_" + businessData.ID);
}

function lsSet(name, value, scope) {
	// if (scope == "G"|| businessData==null) {
	localStorage.setItem(name, value);
	// } else {
	// localStorage.setItem(name + "_" + businessData.ID, value);
	// }
}

function lsRemove(name, scope) {
	// if (scope == "G") {
	localStorage.removeItem(name);
	// } else {
	// localStorage.removeItem(name + "_" + businessData.ID);
	// }
}

function formatDig(num, n) {
	num = isNaN(num) || num === '' || num === null ? 0 : num;
	var s = num + "";
	while (s.length < n)
		s = "0" + s;
	return s;
}

function formatCurrency(num) {
	num = Math.round(num * 100) / 100
	num = isNaN(num) || num === '' || num === null ? 0.00 : num;
	return parseFloat(num).toFixed(2);
}

function formatDate(d) {
	var month = [];
	month[0] = "January";
	month[1] = "February";
	month[2] = "March";
	month[3] = "April";
	month[4] = "May";
	month[5] = "June";
	month[6] = "July";
	month[7] = "August";
	month[8] = "September";
	month[9] = "October";
	month[10] = "November";
	month[11] = "December";

	return month[d.getMonth()] + " " + formatDig(d.getDate(), 2) + ","
			+ d.getFullYear();
}

function imgError(image) {
	image.onerror = "";
	image.src = "images/noimage.jpg";
	return true;
}

function validateEmail(email) {
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
		return (true)
	}
	return (false)
}

function validatePhone(phone) {
	if (/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(phone)) {
		return (true)
	}
	return (false)
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16)
				.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4()
			+ s4() + s4();
}