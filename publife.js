/* obvi you would async load prebid and dfp before this snipped */
/* setup namespaces */
var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

var publife = publife || {};

publife.addSizeMapping = function(name, sizes, hFlag) {
	var map = [], w = publife.viewport.width, h = publife.viewport.height;
	for(var i = 0, len = sizes.length; i < len; i++) {
		if(sizes[i][0] <= w) {
			if(sizes[i][1] <= h || hFlag !== true) {
				map.push(sizes[i]);
			}
		} else {
			break;
		}
	}
	if(map.length) {
		map.force = function(a){
			if(this.length) {
				var flag = false;
				for(var i = 0, len = this.length; i < len; i++) {
					if(this[i][0] === a[0] && this[i][1] === a[1]) {
						flag = true;
						break;
					}
				}
				if(!flag) {
					this.push(a);
				}
			}
			return this;
		};
		map.noMobile = function(w) {
			if(this.length) {
				if(publife.viewport.width <= (isNaN(w) ? 800 : w)) {
					this.length = 0;
				}
			}
			return this;
		};
		map.noDesktop = function(w) {
			if(this.length) {
				if(publife.viewport.width > (isNaN(w) ? 800 : w)) {
					this.length = 0;
				}
			}
			return this;
		};
	} else {
		map.force = function(a){return this};
		map.noMobile = function(w){return this};
		map.noDesktop = function(w){return this};
	}
	if(this.sizeMapping === undefined) {
		this.sizeMapping = {};
	}
	return this.sizeMapping[name] = map;
};


publife.defineViewport = function(w, h) {
	this.viewport = {
		width : Math.max(document.documentElement.clientWidth, window.innerWidth, w, 0),		//could use some cross-browser support
		height: Math.max(document.documentElement.clientHeight, window.innerHeight, h, 0)
	}
};

publife.defineSlot = function(name, map, domWrapperId) {
	if(this.slots === undefined) {
		this.slots = [];
	}
	this.slots.push({
		name : name,
		domWrapperId : domWrapperId,
		sizeMapping : this.sizeMapping[map] || []
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

publife.attachBidderToPrebidAdUnit = function(name) {
	var arr = [], keys = Object.keys(this.bidder);
	for (var i = 0, len = keys.length; i < len; i++) {											//only attach bidder to adUnit if adUnit exists
		var bidder = this.bidder[keys[i]];
		for(var k = 0, blen = bidder.bids.length; k < blen; k++) {
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

publife.addPrebidAdUnit = function(adUnit) {
	if(this.adUnits === undefined) {
		this.adUnits = [];
	}
	if(adUnit.sizeMapping.length) {															//drop pre-bid requests if adUnit has empty sizeMapping
		this.adUnits.push({
			code : adUnit.domWrapperId,
			sizes: adUnit.sizeMapping.slice(),
			bids : this.attachBidderToPrebidAdUnit(adUnit.name)
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
	for(var i = 0, len = this.slots.length; i < len; i++) {
		var slot = this.slots[i];
		this.addPrebidAdUnit(slot);														//create prebid ad units
		
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
		})(this.adUnits, sendAdserverRequest)
	);
    setTimeout(sendAdserverRequest, (isNaN(timeout) ? 700 : timeout));						//default to 700 mins if not set
};
