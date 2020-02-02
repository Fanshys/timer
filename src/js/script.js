let timerCount = 0;
let timersArray = [];

const createStopwatch = (name, time = 0, id = timerCount) => {
    document.querySelector('.timer-items').insertAdjacentHTML('beforeend',
        `<li class="timer-item" data-id="${id}">
            <label class="timer-item__name">
                <input class="timer-item__title" value="${name}" readonly="readonly">
                <button class="timer-item__rename"></button>
            </label>
            <div class="timer-item__right">
                <span class="timer-item__counter" data-id="${id}">00:00:00</span>
                <div class="timer-item__buttons">
                    <button class="button timer-item__button start-button">Start</button>
                    <button class="button timer-item__button pause-button">Pause</button>
                    <button class="button timer-item__button reset-button">Reset</button>
                </div>
            </div>
            <div class="timer-item__options">
                <button class="timer-item__open"></button>
                <ul class="timer-item__list">
                    <li class="timer-item__option timer-item__option_delete" title="Удалить"></li>
                    <li class="timer-item__option timer-item__option_rename" title="Переименовать"></li>
                </ul>
            </div>
        </li>`
    )
    worker.postMessage({
        'func': 'create',
        'time': time,
        'name': name,
        'id': id
    });
    timersArray.push({
        'name': name,
        'time': time,
        'id': id
    })
    timerCount++;
}

const worker = new Worker("./build/js/worker.js");

worker.onmessage = function (e) {
    let id = e.data['id'];
    let item = timersArray.find(item => item.id === id);

    document.querySelector(`.timer-item__counter[data-id='${id}']`).innerHTML = e.data["time"];
    document.title = e.data["name"] + ' - ' + e.data["time"];

    item.time = e.data["diff"];
    item.name = e.data["name"];
    sendData();
};

const sendData = () => {
    localStorage.setItem("timersArray", JSON.stringify(timersArray));
}

const startTimer = (id) => {
    worker.postMessage({
        'func': 'start',
        'id': id
    });
}

const pauseTimer = (id) => {
    worker.postMessage({
        'func': 'pause',
        'id': id
    });
}

const resetTimer = (id) => {
    worker.postMessage({
        'func': 'reset',
        'id': id
    });
}

const toggleOptions = (id) => {
    let item = document.querySelector(`.timer-item[data-id='${id}']`);
    let menu = document.querySelector(`.timer-item[data-id='${id}'] .timer-item__options`);
    if (menu.classList.contains('timer-item__options_open')) {
        menu.classList.remove('timer-item__options_open');
        menu.classList.add('timer-item__options_close');
        setTimeout(() => {
            item.classList.remove('timer-item_open');
        }, 200);
        setTimeout(() => {
            menu.classList.remove('timer-item__options_close');
        }, 500);
    } else {
        menu.classList.add('timer-item__options_open');
        setTimeout(() => {
            item.classList.add('timer-item_open');
        }, 250);
    }
}

const renameTimer = (id) => {
    let title = document.querySelector(`.timer-item[data-id='${id}'] .timer-item__title`);
    let button = document.querySelector(`.timer-item[data-id='${id}'] .timer-item__rename`);
    if (title.getAttribute("readonly") == 'readonly') {
        title.removeAttribute("readonly");
        title.classList.add('timer-item__title_change');
        title.select();
        title.focus();
        button.classList.add('timer-item__rename_visible');
    } else {
        title.setAttribute("readonly", "readonly");
        title.classList.remove('timer-item__title_change');
        button.classList.remove('timer-item__rename_visible');
        let name = title.value;
        let item = timersArray.find(item => item.id == id);
        item.name = name;
        worker.postMessage({
            'func': 'rename',
            'id': id,
            'name': name
        });
        sendData();
        toggleOptions(id);
    }
}

const deleteTimer = (id) => {
    worker.postMessage({
        'func': 'delete',
        'id': id
    });
    let item = timersArray.find(item => item.id == id);
    timersArray.splice(timersArray.indexOf(item), 1);
    document.querySelector(`.timer-item[data-id='${id}']`).classList.add('timer-item_delete');
    setTimeout(() => {
        document.querySelector(`.timer-item[data-id='${id}']`).remove();
    }, 500);
    localStorage.setItem("timersArray", JSON.stringify(timersArray));
}

const timersCreate = (array, x = 0) => {
    if (x < array.length) {
        let element = array[x];
        timerCount = timerCount < element["id"] ? element["id"] : timerCount;
        createStopwatch(element["name"], element["time"], element["id"]);
        x++;
        setTimeout(() => {
            timersCreate(array, x);
        }, 150);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Создание секундомеров из localStorage при загрузке страницы
    if (localStorage.getItem("timersArray") && JSON.parse(localStorage.getItem("timersArray")).length) {
        const items = JSON.parse(localStorage.getItem("timersArray"));
        timersCreate(items);
    } else {
        createStopwatch("Секундомер");
    }
})

document.querySelector('.timer-create__button').addEventListener('click', function () {
    let name = document.querySelector('.timer-create__input').value;
    document.querySelector('.timer-create__input').value = '';
    createStopwatch(name);
});

document.querySelector(".timer-create__input").addEventListener('keyup', function (event) {
    if (event.keyCode == 13) {
        let name = this.value;
        createStopwatch(name);
        this.value = '';
    }
});

document.querySelector('.timer-items').addEventListener('click', (e) => {
    let item = e.target;
    let id = item.closest('.timer-item').dataset.id;

    switch (true) {
        case item.classList.contains('start-button'):
            startTimer(id);
            break;
        case item.classList.contains('pause-button'):
            pauseTimer(id);
            break;
        case item.classList.contains('reset-button'):
            resetTimer(id);
            break;
        case item.classList.contains('timer-item__open'):
            toggleOptions(id);
            break;
        case item.classList.contains('timer-item__option_delete'):
            deleteTimer(id);
            break;
        case item.classList.contains('timer-item__option_rename'):
            renameTimer(id);
            break;
        case item.classList.contains('timer-item__rename'):
            renameTimer(id);
            break;
    }
})

document.querySelector('.timer-items').addEventListener('keyup', (e) => {
    if (e.keyCode == 13) {
        let item = e.target;
        let id = item.closest('.timer-item').dataset.id;
        switch (true) {
            case item.classList.contains('timer-item__title'):
                renameTimer(id);
        }
    }
})