/* publife v0.3 */
publife.addSizeMapping = function(a, b, d) {
    for (var c = [], g = publife.viewport.width, f = publife.viewport.height, e = 0, h = b.length; e < h; e++)
        if (b[e][0] <= g)(b[e][1] <= f || !0 !== d) && c.push(b[e]);
        else break;
    c.length ? (c.force = function(a) {
        if (this.length) {
            for (var b = !1, c = 0, e = this.length; c < e; c++)
                if (this[c][0] === a[0] && this[c][1] === a[1]) {
                    b = !0;
                    break
                }
            b || this.push(a)
        }
        return this
    }, c.noMobile = function(a) {
        this.length && publife.viewport.width <= (isNaN(a) ? 800 : a) && (this.length = 0);
        return this
    }, c.noDesktop = function(a) {
        this.length && publife.viewport.width >
            (isNaN(a) ? 800 : a) && (this.length = 0);
        return this
    }) : (c.force = function(a) {
        return this
    }, c.noMobile = function(a) {
        return this
    }, c.noDesktop = function(a) {
        return this
    });
    void 0 === this.sizeMapping && (this.sizeMapping = {});
    return this.sizeMapping[a] = c
};
publife.defineViewport = function(a, b) {
    this.viewport = {
        width: Math.max(document.documentElement.clientWidth, window.innerWidth, a, 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight, b, 0)
    };
    this.viewport.type = 800 < this.viewport.width ? "desktop" : "mobile"
	return this;
};

publife.defineSlot = function(a, b, d) {
    void 0 === this.slots && (this.slots = []);
    this.slots.push({
        name: a,
        domWrapperId: d,
        sizeMapping: this.sizeMapping[b] || []
    })
	return this;
};

publife.defineSlots = function(s){
	for(var i = 0, len = s.length; i < len; i++) {
		this.defineSlot.apply(publife, s[i]);
	}
	return this;
};
publife.defineTargeting = function(a, b, c){
	c = {};
	if('undefined' !== typeof a) {
		if(a.hasOwnProperty('authors') && a.authors.length) {
			c.author = a.authors.split(',');
		}
		if(a.hasOwnProperty('sections') && a.sections.length) {
			c.tag = a.sections.split(',');
		}
		if(a.hasOwnProperty('domain') && a.domain.length) {
			c.domain = a.domain;
		}
	}
	if('string' === typeof b){
		c.page = b;
	}
	this.targeting = Object.keys(c).map(function (k) {
			return [k, c[k]]; 
		});
	return this;	
};
publife.defineBidder=function(a, b) {
    void 0===this.bidder&&(this.bidder = {});
    return this.bidder[a] = {
        name : a,
        params : b,
        bids : [],
        addBid : function(a, c, b) {
            this.bids.push({
				name: a, sizes: publife.sizeMapping[c].slice()||[], params: b
			});
            return this;
        },
		addBids:function(s){
			for(var i = 0, len = s.length; i < len; i++) {
				this.addBid.apply(this, s[i]);
			}
			return this;
		}
    }
};

publife.attachBidderToPrebidAdUnit = function(a) {
    void 0 === this.bidder && (this.bidder = {});
    for (var b = [], d = Object.keys(this.bidder), c = 0, g = d.length; c < g; c++)
        for (var f = this.bidder[d[c]], e = 0, h = f.bids.length; e < h; e++) {
            var k = f.bids[e];
            k.name === a && b.push({
                bidder: f.name,
                sizes: k.sizes,
                params: Object.assign({}, f.params, k.params)
            })
        }
    return b
};
publife.addPrebidAdUnit = function(a) {
    void 0 === this.adUnits && (this.adUnits = []);
    a.sizeMapping.length && this.adUnits.push({
        code: a.domWrapperId,
        sizes: a.sizeMapping.slice(),
        bids: this.attachBidderToPrebidAdUnit(a.name)
    })
};
publife.call = function() {
    for (var a = this.slots, b = 0, d = a.length; b < d; b++) a[b].sizeMapping.length && googletag.cmd.push(function(a) {
        return function() {
            googletag.cmd.push(function() {
                googletag.display(a)
            })
        }
    }(a[b].domWrapperId))
};

/**
* takes object
* translates it into object with different prop names; skips oop ad unit
* returns object
*/
publife.defineApstagSlots = function(s) {
	return this.apstagSlots = s.filter(function(i) {
			return i.sizeMapping.length && ['/17107625/tp/all_all_oop_1'].indexOf(i.name)
		}).map(function(i) {
			return {
				slotID : i.domWrapperId,
				slotName : i.name,
				sizes : i.sizeMapping.slice()
			}
		});
};
/**
* confirm apstag (amazon) has loaded
* else set placeholder methods
*/
publife.verifyApstagLibLoaded = function(w, a9, a) {
	if(!w[a9]) {
		w[a9] = {};
		a = w[a9];
		a._Q = [];
		a.setDisplayBids = function(){};
		a.targetingKeys = function(){return[]};
		a.init = function() {a._Q.push(['i', arguments]);};
		a.fetchBids = function() {a._Q.push(['f', arguments]);}
	}
	w[a9].init({
		pubID : '8943f279-c9bc-4cc9-8248-159491cad3f1',
		adServer : 'googletag'
	});
	return this;
};
publife.registerWrapper = function(n) {
	//keeps track of wrappers
	if(!this.hasOwnProperty('wrapper')) {
		this.wrapper = {};
	}
	this.wrapper[n] = false;
	return this;
};
publife.allWrappersBack = function() {
	//returns true if all wrappers returned w/ bid response(s)
	return Object.keys(this.wrapper).map(function(i){
		return this.wrapper[i];
	}, this).filter(function(i){
		return i === false;
	}).length === 0;
};
publife.wrapperReturned = function(n) {
	//change wrapper from false to true
	//console.log('wrapper returned: ', n);
	if(this.wrapper.hasOwnProperty(n)) {
		this.wrapper[n] = true;
	}
	return this;
};
publife.sendAdserverRequest = function(timeout) {
	//call dfp if it has NOT been called before &&  every wrapper has responded || timeout is reached
	if(!pbjs.adserverRequestSent && (this.allWrappersBack() || timeout)) {
		//publife.logStatusCheck('sendAdserverRequest success!', timeout);
		pbjs.que.push(function() {
			apstag.setDisplayBids();			//set targeting for amazon
			pbjs.setTargetingForGPTAsync();		//set targeting for prebid
			googletag.cmd.push(function() {
				//renders ads
				//publife.call();			//this is a delayed method of calling publife.call
				googletag.pubads().refresh();
			});
			pbjs.adserverRequestSent = true;
		});	
	}  
/* 	else {
		publife.logStatusCheck('sendAdserverRequest rejected :(', timeout);
	}  */
};

/* TEMP DO NOT NEED */
/* 
publife.wrapperStatus = function(str, keys) {
	//returns string of the current wrapper statuses
	str = '\n';
	keys = Object.keys(this.wrapper);
	for(var i = 0, len = keys.length; i < len; i++) {
		str +=  keys[i] + ': ' + publife.wrapper[keys[i]] + '\n';
	}
	return str;
};
publife.logStatusCheck = function(str, timeout) {
	console.log(str, '\n',
		'DFP not called:', !pbjs.adserverRequestSent, '\n', 
		'allWrappersBack()', this.allWrappersBack(), '\n', 
		'timeout', timeout, publife.wrapperStatus()
	);
};
*/
/* END TEMP DO NOT NEED */

publife.init = function(timeout, granularity) {
	//initial dfp config
	googletag.cmd.push(
		(function(t) {
			return function() {
				googletag.pubads().disableInitialLoad();
				googletag.pubads().enableSingleRequest();
				for(var i = 0, len = t.length; i < len; i++) {
					if(t[i].length === 2) {
						googletag.pubads().setTargeting(t[i][0], t[i][1]);		
					}
				}
				googletag.enableServices();			
			};
		})(window.publife.targeting)
	);

	//define slots in prebid and googletag
    for(var i = 0, len = this.slots.length; i < len; i++) {
        var slot = this.slots[i];
        this.addPrebidAdUnit(slot);
		if(slot.sizeMapping.length) {
			googletag.cmd.push(
				(function(slot) {
					return function() {
						googletag.defineSlot(slot.name, slot.sizeMapping.slice(), slot.domWrapperId).addService(googletag.pubads());
					};
				})(slot)
			);
		}
    }
	
	//prebid config
	pbjs.que.push(
		(function(granularity) {
			return function() {
				pbjs.setConfig({
					debug : false, 
					cookieSyncDelay : 1000, 
					enableSendAllBids : true, 
					priceGranularity : granularity
				});
			}
		})(granularity === undefined ? 'medium' : granularity)
	);
	
	/* NEW added */
	
	googletag.cmd.push(function(){
		/*
		googletag.pubads().addEventListener('slotRenderEnded', function(event) {
			document.getElementById(event.slot.getSlotElementId()).setAttribute('style', 'border: 1px solid red; box-sizing: border-box;');
		});
		*/
		googletag.pubads().addEventListener('slotOnload', function(event) {
			document.getElementById(event.slot.getSlotElementId()).parentNode.classList.add('ad-wrapper--rendered');
		});				
		googletag.pubads().addEventListener('impressionViewable', function(event) {
			var el = document.getElementById(event.slot.getSlotElementId());
			var p = el.parentNode;
			if(!p.classList.contains('ad-wrapper--rendered')) {
				p.classList.add('ad-wrapper--rendered');
			}
/* 			el.setAttribute('style', 'border: 1px solid green; box-sizing: border-box;'); */
		});	
	});

    googletag.cmd.push(function() {
		//executes googletag.display() for all ad placements
        publife.call();
    });
	
	//apstag is called before pbjs but may not execute first b/c both libs are loaded async
	apstag.fetchBids({
			slots: this.apstagSlots,
			timeout: timeout
		}, function(bids) {
			//AMAZON -- signal that bid response has returned && attempt to trigger dfp
			//console.log('apstag.fetchBids() callback fired');
			publife.wrapperReturned('a9').sendAdserverRequest(false);
		}
	);
	
	pbjs.que.push(
		(function(adUnits) {
			return function() {
				pbjs.addAdUnits(adUnits);
				//console.log('pbjs.requestBids()');
				pbjs.requestBids({
					bidsBackHandler: function() {
						publife.wrapperReturned('prebid').sendAdserverRequest(false);
					}
				});
			}
		})(this.adUnits)
	);
    setTimeout(function(){
			//true signals timeout, causes an override
			publife.sendAdserverRequest(true);
		}, (isNaN(timeout) ? 700 : timeout)
	);
	return;
};
//window.apstagDEBUG = { testBidTimeout: 2500 };
publife.setup = function(s, t, x, w) {
	if(typeof s !== 'undefined' && typeof t !== 'undefined') {
		this.defineViewport(320, 480);
		x = this.viewport.type, w = window;
		if(x === 'mobile') {
			this.addSizeMapping('mbl', [[300, 250], [320, 50]], false).noDesktop();
			this.addSizeMapping('mbl_leaderboard', [[300, 50], [320, 50]], false).noDesktop();			//added
		} else if(x === 'desktop') {
			this.addSizeMapping('dsktp_home', [[728, 90], [970, 90], [970, 250], [300, 250]], false).noMobile();
			this.addSizeMapping('dsktp_post', [[300, 250], [728, 90], [970, 90]], false).noMobile();
			this.addSizeMapping('dsktp_post_test', [[300, 250], [300, 600], [728, 90], [970, 90], [970,250]], false).noMobile();
			this.addSizeMapping('dsktp_leaderboard', [[728, 90], [970, 90], [970, 250]], false).noMobile();			//added	
		} else {
			console.error('viewport undefined:', x);
		}
		this.addSizeMapping('pixel', [[1, 1]], false);		//for oop ad unit

		this.defineSlots(s);
		this.defineTargeting(w._sf_async_config, t);
		
		this.registerWrapper('prebid');
		/* START AMAZON */
		this.verifyApstagLibLoaded(w, 'apstag');
		this.registerWrapper('a9');

		this.defineApstagSlots(this.slots);
		//w.apstag.init({pubID : '8943f279-c9bc-4cc9-8248-159491cad3f1', adServer : 'googletag'});
		/* END AMAZON */
		if(x === 'mobile' && t === 'post') {
			/* criteo */
			this.defineBidder('criteo', {})
				/* mobile post */
				.addBid('/17107625/tp/mbl_post_main_1', 'mbl', {zoneId : '815403'})
				.addBid('/17107625/tp/mbl_post_main_2', 'mbl', {zoneId : '815404'})
				.addBid('/17107625/tp/mbl_post_main_3', 'mbl', {zoneId : '815405'})
				.addBid('/17107625/tp/mbl_post_main_4', 'mbl', {zoneId : '874768'});
			/* index */
			this.defineBidder('indexExchange', {})
				/* mobile post */
				.addBid('/17107625/tp/mbl_post_main_1', 'mbl', { siteID : '209718', id : '13'})
				.addBid('/17107625/tp/mbl_post_main_2', 'mbl', { siteID : '209720', id : '14'})
				.addBid('/17107625/tp/mbl_post_main_3', 'mbl', { siteID : '209721', id : '15'})
				.addBid('/17107625/tp/mbl_post_main_4', 'mbl', { siteID : '209722', id : '16'});
			/* appnexusAst */
			this.defineBidder('appnexusAst', {})
				/* mobile post */
				.addBid('/17107625/tp/mbl_post_main_1', 'mbl', {placementId : '11716642'})
				.addBid('/17107625/tp/mbl_post_main_2', 'mbl', {placementId : '11716643'})
				.addBid('/17107625/tp/mbl_post_main_3', 'mbl', {placementId : '11716644'})
				.addBid('/17107625/tp/mbl_post_main_4', 'mbl', {placementId : '11716645'});
		} else if(x === 'mobile' && (t === 'home' || t === 'landing-page')) {
			/* criteo */
			this.defineBidder('criteo', {})
				/* mobile home */
				.addBid('/17107625/tp/mbl_home_main_1', 'mbl', {zoneId : '815400'})
				.addBid('/17107625/tp/mbl_home_main_2', 'mbl', {zoneId : '815401'})
				.addBid('/17107625/tp/mbl_home_main_3', 'mbl', {zoneId : '815402'})
				.addBid('/17107625/tp/mbl_home_main_4', 'mbl', {zoneId : '874767'});
			/* index */
			this.defineBidder('indexExchange', {})
				/* mobile home */
				.addBid('/17107625/tp/mbl_home_main_1', 'mbl', { siteID : '209714', id : '09'})
				.addBid('/17107625/tp/mbl_home_main_2', 'mbl', { siteID : '209715', id : '10'})
				.addBid('/17107625/tp/mbl_home_main_3', 'mbl', { siteID : '209716', id : '11'})
				.addBid('/17107625/tp/mbl_home_main_4', 'mbl', { siteID : '209717', id : '12'});
			/* appnexusAst */
			this.defineBidder('appnexusAst', {})
				/* desktop home */
				.addBid('/17107625/tp/mbl_home_main_1', 'mbl', {placementId : '11716646'})
				.addBid('/17107625/tp/mbl_home_main_2', 'mbl', {placementId : '11716647'})
				.addBid('/17107625/tp/mbl_home_main_3', 'mbl', {placementId : '11716648'})
				.addBid('/17107625/tp/mbl_home_main_4', 'mbl', {placementId : '11716649'});
		} else if(x === 'desktop' && t === 'post') {
			/* criteo */
			this.defineBidder('criteo', {})
				/* desktop post */
				.addBid('/17107625/tp/dsktp_post_main_1', 'dsktp_post', {zoneId : '815396'})
				.addBid('/17107625/tp/dsktp_post_main_2', 'dsktp_post', {zoneId : '815397'})
				.addBid('/17107625/tp/dsktp_post_main_3', 'dsktp_post', {zoneId : '815398'})
				.addBid('/17107625/tp/dsktp_post_main_4', 'dsktp_post', {zoneId : '815399'});
			/* index */
			this.defineBidder('indexExchange', {})
				/* desktop post */
				.addBid('/17107625/tp/dsktp_post_main_1', 'dsktp_post', { siteID : '209710', id : '05'})
				.addBid('/17107625/tp/dsktp_post_main_2', 'dsktp_post', { siteID : '209711', id : '06'})
				.addBid('/17107625/tp/dsktp_post_main_3', 'dsktp_post', { siteID : '209712', id : '07'})
				.addBid('/17107625/tp/dsktp_post_main_4', 'dsktp_post', { siteID : '209713', id : '08'});
			/* appnexusAst */
			this.defineBidder('appnexusAst', {})
				 /* desktop post  */
				.addBid('/17107625/tp/dsktp_post_main_1', 'dsktp_post', {placementId : '11716635'})
				.addBid('/17107625/tp/dsktp_post_main_2', 'dsktp_post', {placementId : '11716636'})
				.addBid('/17107625/tp/dsktp_post_main_3', 'dsktp_post', {placementId : '11716637'})
				.addBid('/17107625/tp/dsktp_post_main_4', 'dsktp_post', {placementId : '11716638'});

		} else if(x === 'desktop' && (t === 'home' || t === 'landing-page')) {
			/* criteo */
			this.defineBidder('criteo', {})
				/* desktop home */
				.addBid('/17107625/tp/dsktp_home_main_1', 'dsktp_home', {zoneId : '815392'})
				.addBid('/17107625/tp/dsktp_home_main_2', 'dsktp_home', {zoneId : '815393'})
				.addBid('/17107625/tp/dsktp_home_main_3', 'dsktp_home', {zoneId : '815395'})
				.addBid('/17107625/tp/dsktp_home_main_4', 'dsktp_home', {zoneId : '815394'});
			/* index */
			this.defineBidder('indexExchange', {})
				/* desktop home */
				.addBid('/17107625/tp/dsktp_home_main_1', 'dsktp_home', { siteID : '209705', id : '01'})
				.addBid('/17107625/tp/dsktp_home_main_2', 'dsktp_home', { siteID : '209706', id : '02'})
				.addBid('/17107625/tp/dsktp_home_main_3', 'dsktp_home', { siteID : '209708', id : '03'})
				.addBid('/17107625/tp/dsktp_home_main_4', 'dsktp_home', { siteID : '209709', id : '04'});
			/* appnexusAst */
			this.defineBidder('appnexusAst', {})
				/* desktop home */
				.addBid('/17107625/tp/dsktp_home_main_1', 'dsktp_home', {placementId : '11716631'})
				.addBid('/17107625/tp/dsktp_home_main_2', 'dsktp_home', {placementId : '11716632'})
				.addBid('/17107625/tp/dsktp_home_main_3', 'dsktp_home', {placementId : '11716633'})
				.addBid('/17107625/tp/dsktp_home_main_4', 'dsktp_home', {placementId : '11716634'});	
		} else {
			console.error('viewport size and page or content type did not match a set of ad units', s, t, x);
		}
		this.init(
			900, 
			{ buckets: 
				[
					{ min: 0, max: 2, increment: 0.01},
					{ min: 2, max: 6, increment: 0.05},
					{ min: 6, max: 10, increment: 0.10},
					{ min: 10, max: 40, increment: 1.00}
				]
			}
		);
	}
	return;	
};
publife.test = function(){
	if ('undefined' !== typeof publife && publife.hasOwnProperty('setup')) {
		publife.setup(slotsFromServer, typeOfContent);
	}
	return;
}
publife.test();
