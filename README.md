# publife
Some sugar that sit on top of prebid.js and DFP to manage responsive ad units and integrating bidders.


# Example
```javascript
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

```
