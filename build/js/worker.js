class Timer {
	constructor(id, name, startDiff = 0) {
		this.running = false;
		this.startDiff = startDiff;
		this.times = [0, 0, 0];
		this.startDate = (new Date()).valueOf();
		this.diff;
		this.name = name;
		this.id = id;
		this.calc();
		this.message();
	}

	start() {
		if (!this.running) {
				this.startDate = (new Date()).valueOf();
				this.running = true;
				setTimeout(this.step.bind(this), 1000);
		}
	}

	pause() {
		this.running = false;
		this.startDiff = this.diff;
		this.startDate = null;
	}

	reset() {
		this.running = false;
		this.startDiff = 0;
		this.startDate = null;
		this.diff = 0;
		this.times = [0, 0, 0]
		this.message();
	}

	step() {
		if (!this.running) return;
		this.calc();
		this.message();
		setTimeout(this.step.bind(this), 500);
	}

	calc() {
		this.currentDate = (new Date()).valueOf();
		this.diff = this.currentDate - this.startDate + this.startDiff;
		this.times[2] = Math.floor(this.diff / 1000 % 60);
		this.times[1] = Math.floor(this.diff / 1000 / 60 % 60);
		this.times[0] = Math.floor(this.diff / 1000 / 3600);
	}

	result(times) {
		return `${this.format(times[0], 2)}:${this.format(times[1], 2)}:${this.format(times[2], 2)}`;
	}

	format(value, count) {
		var result = value.toString();
		for (; result.length < count; --count)
			result = '0' + result;
		return result;
	}

	message() {
		let diff = this.diff;
		let times = this.result(this.times);
		let id = this.id;
		let name = this.name;
		postMessage({
			'id': id,
			'time': times,
			'diff': diff,
			'name': name
		});
	}
}

var timers = [];

onmessage = function(e) {
	var item = timers.find(item => item.id == e.data['id']);

	switch(e.data['func']) {
		case 'start':
			item.start();
			break;
		case 'pause':
			item.pause();
			break;
		case 'reset':
			item.reset();
			break;
		case 'create':
			timers.push(new Timer(e.data['id'], e.data['name'], e.data['time']));
			break;
		case 'delete':
			timers.splice(timers.indexOf(item), 1);
			break;
		case 'rename':
			item.name = e.data['name'];
	}
}