var Zwave = require('./lib/Zwave.js');
function main(){
	var zwave = new Zwave();
	zwave.open("/dev/ttyUSB5",false,function(){
	var encender =false;
	/*setInterval(function(){
		if(encender){
			zwave.swichOn(2);
		} else {
			zwave.swichOff(2);
		}
		encender=!encender;
	},500);*/

		zwave.swichOff(2);
		/*zwave.swichOff(2);
		zwave.swichOn(2);
		zwave.swichOff(2);
		zwave.swichOn(2);
		zwave.swichOff(2);
		zwave.swichOn(2);
		zwave.swichOff(2);
		zwave.swichOn(2);
		zwave.swichOff(2);
		zwave.swichOn(2);
*/
});
}
main();
