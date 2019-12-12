var local = function () {
	postMessage('true');
}
let interval;
onmessage = function(e) {
	if (e.data.work == 'true') {
		clearInterval(interval);
		interval = setInterval(local, 1000);
	} else {
		clearInterval(interval);
	}
}