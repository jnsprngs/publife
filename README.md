# publife
Some sugar that sit on top of prebid.js and DFP to manage responsive ad units and integrating bidders.


# example
```javascript
//measure viewport + assign default min width && height
publife.defineViewport(320, 480);


/*
//noMobile() to hide on mobile
//noDesktop() to hide on desktop
//false (opitonal) only considers width to fitting
//true will consider width and height
//.force([w,h]) will force support for the size
*/
publife.addSizeMapping('box_dsktp', [[300,250], [300,600]], false).noMobile(450);
publife.addSizeMapping('box_mbl', [[300,250], [300, 50], [300, 100]]).noDesktop();
publife.addSizeMapping('aol_desktop_0', [[300,250]], true).noMobile();
publife.addSizeMapping('aol_desktop_1', [[300,600]], false).noMobile();
publife.addSizeMapping('aol_mobile_0', [[300,600]]).noDesktop().force([1,1]);

//define slots very similar to DFP
publife.defineSlot('/17107625/test/desktop', 'box_dsktp', 'div-gpt-ad-1496254582314-0');
publife.defineSlot('/17107625/test/mobile_box_0', 'box_mbl', 'div-gpt-ad-1497469095955-0');

//define bidders + ad units you want to bid on
publife.defineBidder('aol', {network: '10041.1'})										
	.addBid('/17107625/test/desktop', 'aol_desktop_0', {placement: '4582695'})			
	.addBid('/17107625/test/desktop', 'aol_desktop_1', {placement: '4582694'})			
	.addBid('/17107625/test/mobile_box_0', 'aol_mobile_0', {placement: '4582697'});

	
//kick things off, define timeout and granularity
publife.init(1500, 'low');

```
