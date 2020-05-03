define('app/Controllers/Game.js', [
    'app/Components/Component.js',
    'app/Components/Field.js'
], function (Component,Field) {

    return class Game extends Component {
        /**
         * Инициализация компонента
         */
        constructor() {
            super();

            this.fieldSize = 10;
            this.playerName = prompt("Your name?");
            this.aiField = new Field; // создание поля компьюетра 
            this.aiFieldClass = '.field-ai';
            this.aiClicked = this.fillEmptyArray(); //массив "кликнутых" ячеек
            this.aiKills = 0;
            this.lastShoots = []; // Массив последних выстрелов
            this.aiWins = 0;

            this.playerField = new Field;  // создание поля игрока 
            this.playerFieldClass = '.field-user';
            this.playerClicked = this.fillEmptyArray(); 
            this.playerKills = 0;
            this.playerWins = 0;

            this.gameEnd = true;

            this.clickCell = this.clickCell.bind(this);
            
            this.aiMove = this.aiMove.bind(this);
            this.newGame = this.newGame.bind(this);
            this.resetGame = this.resetGame.bind(this);
            

            this.playerTurn = true;


        }

        init() {
            this.drawPlayerField(); // Отрисовка поля
            this.addEventStartBtn();
            this.addEventResetBtn();
            this.showName(); // отрисовать имя игрока
        }

        newGame() {
            this.gameEnd = false;
            this.drawPlayerField(); 
            this.addEventStartBtn();
            this.addEventResetBtn();
            this.showName();

            this.playerField = new Field;
            this.playerField.generateShipCord(); // Генерация кораблей
            this.playerField.updateField(this.playerFieldClass); // Отрисовка кораблей

            this.aiField = new Field;
            this.aiField.generateShipCord();

            this.addEventResetBtn();
            this.addEventsField();
            this.showResetBtn();
            this.hideStartBtn();
            this.showWins();
            this.declareWhoNext();
        }

        resetGame() {
            this.playerField.clearBoard(); // Очистка поля
            this.playerKills = 0;
            this.aiKills = 0;
            this.lastShoots = [];
            this.aiClicked = this.fillEmptyArray();
            this.playerClicked = this.fillEmptyArray();


            this.newGame();
        }

        drawPlayerField() {
            document.body.innerHTML = this.playerField.drawField();
        }
        drawAiField() {
            document.body.innerHTML = this.playerField.drawField();
        }

        addEventsField() {
            const cells = document.querySelectorAll(this.aiFieldClass + ' .cell');
            
            cells.forEach((item) => {
                item.addEventListener('click', this.clickCell);
            })
        }

        removeEventsField() {
            const cells = document.querySelectorAll('.cell');
            
            cells.forEach((item) => {
                item.removeEventListener('click', this.clickCell);
            })
        }

        addEventStartBtn() {
            document.querySelector("#startGame").addEventListener("click", this.newGame);
        }

        addEventResetBtn() {
            document.querySelector('#resetField').addEventListener('click',this.resetGame);
        }

        showResetBtn() {
            document.querySelector('#resetField').classList.remove('hidden');
        }

        hideStartBtn() {
            document.querySelector("#startGame").classList.add('hidden');
        }
    
        showName() {
            document.querySelector("#player").innerHTML = this.playerName;
        }

        /** 
        * Обработка клика по ячейке, ход игрока
        *
        */
        clickCell() {

            this.checkWin();

            if(this.gameEnd) {
                return;
            }

            if(!this.playerTurn) {
                setTimeout(this.aiMove,1000);
                return;
            }

            this.declareWhoNext();

            let cellCords = {
                x : event.target.getAttribute("data-x"),
                y : event.target.getAttribute("data-y")
            }

            if(this.playerClicked[cellCords.x][cellCords.y]){
                return;
            } else {
                this.playerClicked[cellCords.x][cellCords.y] = true;
            }

            // Возвращает кордианты корабля если клик был попал по палубе

            const hittedShip = this.foundShip(this.aiField,cellCords);


            /* Массив содержит : 3 - однопалубник,2 - двух,
            *   1 - три палубы и 0 - четыре палубы.
            *   Если клик был по четрыехпалубной, то увеличиваю число в массиве
            *  И при достижении 3ех , корабль уничтожен
            */ 

            if(this.aiField.field[cellCords.x][cellCords.y] === ''){
                event.target.classList.add('miss');
                this.playerTurn = false;
                this.declareWhoNext();
            } else {
                if(this.aiField.field[cellCords.x][cellCords.y] == '3'){
                    this.dieShip(hittedShip,this.aiFieldClass);
                    this.dieClosestCells(hittedShip,this.aiFieldClass,this.aiField.field);
                    this.playerKills++;
                } else {
                    event.target.classList.add('hit');

                    this.hitShip(hittedShip,this.aiField.field);
                }
                
            }
            setTimeout(this.aiMove,1000);
        }

        /**  Нахождение корабля по кординатм,
            *   На вход поступает поле (игрока, комп)
            *  
            *  @return object обьект корабля
            */ 

        foundShip(field,cords) {
            let result = null;
            field.ships.forEach((ship) => {
                if(!ship.isVertical) {
                    for(let i = ship.y; i < ship.y + ship.size; i++) {
                        if(cords.x == ship.x && cords.y == i){
                            result =  ship;
                        }
                    }
                } else {
                    for(let i = ship.x; i < ship.x + ship.size; i++) {
                        if(cords.y == ship.y && cords.x == i){
                            result = ship;
                        }
                    }
                }
            })
            return result;
        }

        /**
         * Увеличивает значение в массиве поля
         * 
         */

        hitShip(ship,field) {
            if(!ship.isVertical) {
                for(let i = ship.y; i < ship.y + ship.size; i++) {
                    field[ship.x][i]++;
                }
            } else {
                for(let i = ship.x; i < ship.x + ship.size; i++) {
                    field[i][ship.y]++;
                }
            }
        }

         /**
         * Добавляение класса умершим кораблям
         */
        dieShip(ship,fieldClass) {
            if(!ship.isVertical) {
                for(let i = ship.y; i < ship.y + ship.size; i++) {
                    document.querySelector(fieldClass + ` .cell[data-x="${ship.x}"][data-y="${i}"] `).classList.add('die');
                }
            } else {
                for(let i = ship.x; i < ship.x + ship.size; i++) {
                    document.querySelector(fieldClass + ` .cell[data-x="${i}"][data-y="${ship.y}"] `).classList.add('die');
                }
            }
        }

         /**
         * Отмечаем соседние ячейки от умерших кораблей
         */

        dieClosestCells(ship,fieldClass,field) {
            let fromY,toY,fromX,toX;

            fromX = ship.x === 0 ? 0 : ship.x - 1;
            fromY = ship.y === 0 ? 0 : ship.y - 1;
            

            if(ship.isVertical) {
                toX = ship.x + ship.size < 9 ? ship.x + ship.size : 9;
                toY = ship.y === 9 ? 9 : ship.y + 1; 
            }
            else {
                toY = ship.y + ship.size < 9 ? ship.y + ship.size : 9;
                toX = ship.x === 9 ? 9 : ship.x + 1; 
            }


            for(let i = fromX; i <= toX; i++){
                for(let j = fromY; j <= toY; j++) {
                    if(field[i][j] !== 3){
                        document.querySelector(fieldClass + ` .cell[data-x="${i}"][data-y="${j}"] `).classList.add('miss');
                    }
                    if(fieldClass === '.field-user'){
                        this.aiClicked[i][j] = true; // выставояем ячейки в массив нажатых ячеек
                    } else {
                        this.playerClicked[i][j] = true;    
                    }
                }
            }
        }

         /**
         * Заполнение пустого массива
         */

        fillEmptyArray() {
            const arr = [this.fieldSize];
                for(let i = 0; i < this.fieldSize; i++){
                    arr[i] = [this.fieldSize];
                    for(let j = 0; j < this.fieldSize; j++){
                        arr[i][j] = false;
                    }
                }
            return arr; 
        }

         /**
         * Смена хода
         */
        changeTurn() {
            this.turn = this.turn === 'player' ? 'ai' : 'player'; 
        }

         /**
         * Хода компьюетра
         */
        aiMove() {
            // проверка нет ли победителя
            

            if(this.playerTurn || this.gameEnd) {
                return ;
            }
            this.checkWin();
            
            this.declareWhoNext(); // Обьявление кто следующий


            let x = Math.floor(Math.random() * 10);
            let y = Math.floor(Math.random() * 10);

            let hittedShip = null;

            // lastShoots хранит значения координат которые в которых корабли были ранены, но не убиты
            if(this.lastShoots.length > 1) {
                const lastX = this.lastShoots[0].x;
                const lastY = this.lastShoots[0].y;
                const cords = {
                    'x' : lastX,
                    'y' : lastY
                }
                hittedShip = this.foundShip(this.playerField,cords);
                this.aiKills++;
                this.dieShip(hittedShip,this.playerFieldClass);
                this.dieClosestCells(hittedShip,this.playerFieldClass,this.playerField.field);
                this.lastShoots = [];
            }
            
            if(this.lastShoots.length === 1) {
               let newCords = this.chooseLastShoot(); 
               if(newCords) {
                x = newCords.x;
                y = newCords.y;
               }
               
            }

            // Если кординаты  уже есть в массиве, вызываем еще раз

            if(this.aiClicked[x][y]){
              return this.aiMove();
            } else {
                this.aiClicked[x][y] = true;
            }

            hittedShip = this.foundShip(this.playerField,{x,y});

          /**
         * Если в массиве поля пустое значение, то там нет корабля
         * Если 0-1-2-3, то корабль, с количеством поддибытых палуб. 
         */
            if(this.playerField.field[x][y] === ''){
                document.querySelector(this.playerFieldClass + ` .cell[data-x="${x}"][data-y="${y}"] `).classList.add('miss');
                this.playerTurn = true;
                this.declareWhoNext();
            } else {
                this.playerTurn = false;
                this.declareWhoNext();
                if(this.playerField.field[x][y] == '3'){
                    this.aiKills++;
                    this.dieShip(hittedShip,this.playerFieldClass);
                    this.dieClosestCells(hittedShip,this.playerFieldClass,this.playerField.field);
                    this.lastShoots = [];
                } else {
                    document.querySelector(this.playerFieldClass + ` .cell[data-x="${x}"][data-y="${y}"] `).classList.add('hit');
                    this.hitShip(hittedShip,this.playerField.field);
                    this.lastShoots.push({x,y});
                }
                
            }

            if(!this.playerTurn) {
                setTimeout(this.aiMove,1000);
            }

        }

         /**
         * Вовзращает координаты соседней ячейки, если предыдущий удар был успешным.
         */

        chooseLastShoot() {

            let x = this.lastShoots[this.lastShoots.length - 1].x;
            let y = this.lastShoots[this.lastShoots.length - 1].y;

            let xMin,xPlus,yMin,yPlus;

            xPlus = this.lastShoots[this.lastShoots.length - 1].x + 1  > 9 ? 9 : this.lastShoots[this.lastShoots.length - 1].x + 1;
            xMin = this.lastShoots[this.lastShoots.length - 1].x - 1 < 0 ? 0 : this.lastShoots[this.lastShoots.length - 1].x - 1;
            yPlus = this.lastShoots[this.lastShoots.length - 1].y + 1 > 9 ? 9 : this.lastShoots[this.lastShoots.length - 1].y + 1;
            yMin = this.lastShoots[this.lastShoots.length - 1].y - 1 < 0 ? 0 : this.lastShoots[this.lastShoots.length - 1].y - 1;

            if(!this.aiClicked[xPlus][y] && x < 9) {
                x = xPlus;
                return {x,y};
            }
            if(!this.aiClicked[xMin][y]  && x > 0) {
                x = xMin;
                return {x,y};
            }
            if(!this.aiClicked[x][yPlus] && y < 9) {
                y = yPlus;
                return {x,y};
            }
            if(!this.aiClicked[x][yMin] && y > 0) {
                y = yMin;
                return {x,y};
            }

        }

        checkWin() {
            if(this.aiKills > 9) {
                this.gameOver('AI');
            }
            if(this.playerKills > 9){
                this.gameOver("Player");
            }
        }

        gameOver(winner){
            this.gameEnd = true;
            this.removeEventsField();

            
            if(winner === 'AI') {
                this.aiWins++; 
            }else {
                this.playerWins++;
            }

            document.querySelector('.title').innerHTML = "winner is " + winner;

            document.querySelector('.fields').classList.add('gameOver');

            this.aiField.updateField(this.aiFieldClass);
        }


        setTitle() {
            document.querySelector('.title').innerHTML = "Sea Battle";
        }

        showWins() {
            document.querySelector(".score__player").innerHTML = this.playerWins;
            document.querySelector(".score__ai").innerHTML = this.aiWins;
        }

        declareWhoNext() {

            let whoNextItem = document.querySelector('.whoNext');

            if(whoNextItem) {
                whoNextItem.classList.remove('whoNext');
            }

            if(!this.playerTurn) {
                document.querySelector(this.playerFieldClass).classList.add('whoNext');
            } else {
                document.querySelector(this.aiFieldClass).classList.add('whoNext');
            }

        }

    }

});

