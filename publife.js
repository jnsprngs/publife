/* setup namespaces */
var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

var publife = publife || {};
publife.prebid = publife.prebid || {};

publife.addSizeMapping = function(name, sizes, hFlag) {
	var map = [];
	if(hFlag === undefined) {hFlag = false;}
	map.force = function(a){
		var flag = false;
		var len = this.length;
		for(var i = 0; i < len; i++) {
			if(this[i][0] === a[0] && this[o][0] === a[1]) {
				flag = true;
				break;
			}
		}
		if(!flag) {
			this.push(a);
		}
		return this;
	}
	map.noMobile = function(w) {
		if(publife.viewport.width <= (isNaN(w) ? 800 : w)) {
			this.length = 0;
		}
		return this;
	}
	map.noDesktop = function(w) {
		if(publife.viewport.width > (isNaN(w) ? 800 : w)) {
			this.length = 0;
		}
		return this;
	}
	if(this.sizeMapping === undefined) {
		this.sizeMapping = {};
	}
	var w = publife.viewport.width;
	var h = publife.viewport.height;
	var len = sizes.length;
	for(var i = 0; i < len; i++) {
		if(sizes[i][0] <= w) {
			if(sizes[i][1] <= h || hFlag === false) {
				map.push(sizes[i]);
			}
		}
	}
	return this.sizeMapping[name] = map;
};

publife.defineViewport = function(w, h) {
	this.viewport = {
		width : Math.max(document.documentElement.clientWidth, window.innerWidth || w),		//could use some cross-browser support
		height: Math.max(document.documentElement.clientHeight, window.innerHeight || h)
	}
};

publife.defineSlot = function(name, sizeMapping, domWrapperId) {
	if(this.slots === undefined) {
		this.slots = [];
	}
	this.slots.push({
		name : name,
		domWrapperId : domWrapperId,
		sizeMapping : publife.sizeMapping[sizeMapping] || []
	});
};

publife.defineBidder = function(name, params) {
	if(this.bidder === undefined) {
			this.bidder = {};
	}
	return this.bidder[name] = {
		name : name,
		params : params,																	//generic params applied to every ad unit
		bids : [],
		addBid : function(name, sizes, params) {
			this.bids.push({
				name : name,
				sizes : publife.sizeMapping[sizes] || [],								//all the sizes the bidder is interested in
				params : params			
			});
			return this;
		}
	};
};

publife.prebid.attachBidderToAdUnit = function(name) {
	var arr = [];
	var keys = Object.keys(publife.bidder);
	var len = keys.length;
	for(var i = 0; i < len; i++) {															//only attach bidder to adUnit if adUnit exists
		var bidder = publife.bidder[keys[i]];
		var ben = bidder.bids.length;
		for(var k = 0; k < ben; k++) {
			var bid = bidder.bids[k];
			if(bid.name === name) {
				arr.push({
					bidder : bidder.name,
					params : Object.assign({}, bidder.params, bid.params),
				});
			}/*  else {
				console.log('You can\'t bid on', bid.name, 'b/c the dfp ad slot was not defined. FAKE IMPRESSIONS! SADDD! ');
			} */
		}
	}
	return arr;
};

publife.prebid.addAdUnit = function(adUnit) {
	if(this.adUnits === undefined) {
		this.adUnits = [];
	}
	if(adUnit.sizeMapping.length) {															//drop pre-bid requests if adUnit has empty sizeMapping
		this.adUnits.push({
			code : adUnit.domWrapperId,
			sizes: adUnit.sizeMapping.slice(),
			bids : this.attachBidderToAdUnit(adUnit.name)
		});
	}
};

publife.init = function(timeout, granularity) {
    googletag.cmd.push(function() {
        googletag.pubads().disableInitialLoad();
    });
	pbjs.que.push(																			//set price granularities
		(function(granularity) {
			return function() {
				pbjs.setPriceGranularity(granularity)
			}
		})(granularity === undefined ? 'low' : granularity)
	);
	function sendAdserverRequest() {														//send the prebid info to DFP when executed on callback or timeout
		if(!pbjs.adserverRequestSent) {
			googletag.cmd.push(function() {
				pbjs.que.push(function() {
					pbjs.setTargetingForGPTAsync();
					googletag.pubads().refresh();
				});
			});
			pbjs.adserverRequestSent = true;
		}
	}
	var len = this.slots.length;
	for(var i = 0; i < len; i++) {
		var slot = this.slots[i];
		this.prebid.addAdUnit(slot);														//create prebid ad units
		
		if(slot.sizeMapping.length) {														//googletag.defineSlot()
			googletag.cmd.push(
				(function(slot) {
					return function() {
						googletag.defineSlot(slot.name, slot.sizeMapping.slice(), slot.domWrapperId).addService(googletag.pubads());
						googletag.pubads().enableSingleRequest();
						googletag.enableServices();
					};
				})(slot)
			);
		}

	}
	pbjs.que.push(																			//send prebid requests 
		(function(adUnits, sendAdserverRequest) {
			return function() {
				pbjs.addAdUnits(adUnits);
				pbjs.requestBids({
					bidsBackHandler: sendAdserverRequest
				});
			}
		})(this.prebid.adUnits, sendAdserverRequest)
	);
    setTimeout(sendAdserverRequest, (isNaN(timeout) ? 700 : timeout));						//default to 700 mins if not set
};




/* START publife */
publife.defineViewport(320, 480);															//measure viewport + assign default min width && height

publife.addSizeMapping('box_dsktp', [[300,250], [300,600]], false).noMobile(450);			//noMobile() to hide on mobile
publife.addSizeMapping('box_mbl', [[300,250], [300, 50], [300, 100]], false).noDesktop();	//noDesktop() to hide on desktop
publife.addSizeMapping('aol_desktop_0', [[300,250]], false).noMobile();						//false (opitonal) only considers width to fitting
publife.addSizeMapping('aol_desktop_1', [[300,600]], false).noMobile();						//true will consider width and height
publife.addSizeMapping('aol_mobile_0', [[300,600]]).noDesktop().force([1,1]);				//.force([w,h]) will force support for the size

publife.defineSlot('/17107625/test/desktop', 'box_dsktp', 'div-gpt-ad-1496254582314-0');	//dfp ad unit name, id for ad div, sizeMapping this ad unit will use
publife.defineSlot('/17107625/test/mobile_box_0', 'box_mbl', 'div-gpt-ad-1497469095955-0');

publife.defineBidder('aol', {network: '10041.1'})										//bidder name + params that are included in every bids obj
	.addBid('/17107625/test/desktop', 'aol_desktop_0', {placement: '4582695'})			//name of DFP adunit bidding on, sizeMapping, and specific params
	.addBid('/17107625/test/desktop', 'aol_desktop_1', {placement: '4582694'})			//if bidder requires 2 requets for 2 ad sizes within an ad unit, call .addBid() again.
	.addBid('/17107625/test/mobile_box_0', 'aol_mobile_0', {placement: '4582697'});		//bid on different ad unit

publife.defineBidder('publife', {networkId : 'aw8aslk3', catParam : 'lebron james'})	//fake bidder
	.addBid('/17107625/test/desktop', 'box_dsktp', {placementId : 'avnlpidrq128f', })	//pass it a size map with multiple sizes instead of diffrent calls for each size
	.addBid('/17107625/test/mobile_box_0', 'box_mbl', {placementId : 'rj3ldk50fjs', passRndmValToBidder : true});


publife.init(1500, 'low');																//kick things off, define timeout and granularity

/* END publife */
