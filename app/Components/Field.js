define('app/Components/Field.js', 
    ['app/Components/Component.js'], function(Component) {

        return class Field extends Component {

            constructor() {
                super();
                this.fieldSize = 10;
                this.field = this.createEmptyField();

                //масив размеров , под индексом если счиать с 1 кол-во кораблей, 
                // 1 корабль с размером 4, 2 с размером 3, 3 -2, 4 - 1.
                this.shipsSize	= [4,3,2,1]; 
                this.ships = []; // Массив кораблей
            }

            

            /**
             * Очистка ячеек от классов
             */
            cleanField() {
                let cells = document.querySelectorAll(".cell");
                cells.forEach((item) => {
                    item.classList.remove("ship","miss","hit","die");
                })
            }

            /**
             * Создание пустого массива
             */

            createEmptyField() {
                const arr = [this.fieldSize];
                for(let i = 0; i < this.fieldSize; i++){
                    arr[i] = [this.fieldSize];
                    for(let j = 0; j < this.fieldSize; j++){
                        arr[i][j] = '';
                    }
                }
                return arr;
            }
            /**
             * Генерация кординат кораблей в массив поля
             */
            generateShipCord() {                
                for(let i = 0; i < this.shipsSize.length; i++) {
                    for(let j = 0; j < i+1; j++) {
                        this.setShipCords(this.shipsSize[i],i);
                    }
                }
            }

            /**
             * Заплнение массива поля кораблями 
             */
            setShipCords(shipSize,shipNumber) {
                let isVertical = this.getRandom(1);
                
                let ship = this.getShip(shipSize,isVertical);
                
                if(isVertical){
                    for(let i = ship.x; i < ship.x + shipSize; i++ ) {
                        this.field[i][ship.y] = shipNumber;
                    }
                }else {
                    for(let i = ship.y; i < ship.y + shipSize; i++ ) {
                        this.field[ship.x][i] = shipNumber;
                    }
                }
                    
            }

            /**
             * 
             * Генерация корабля 
             */

            getShip(shipSize,isVertical) {

                let ship = {};

                ship.x = this.getRandom(this.fieldSize - 1);
                ship.y = this.getRandom(this.fieldSize - shipSize);

                ship.isVertical = isVertical;

                ship.size = shipSize;

                if(isVertical) {
                    [ship.x , ship.y ] = [ship.y, ship.x];
                }
                
                 if(this.checkShipCords(ship.x,ship.y,isVertical,shipSize)) {
                    this.ships.push(ship);
                    return ship;
                } else {
                    return this.getShip(shipSize, isVertical);
                }        
            }

            /**
             * 
             * @param {*} x - кордината по х
             * @param {*} y - кордината по у
             * @param {*} isVertical - ориентация корабля
             * @param {*} shipSize - размер корабля
             * 
             * 
             * ПРоверка на вместимость в поле и на "соседство" кораблей
             */

            checkShipCords(x,y,isVertical,shipSize) {

                let fromY,toY,fromX,toX;

                fromX = x === 0 ? 0 : x - 1;
                fromY = y === 0 ? 0 : y - 1;
                

                if(isVertical) {
                    toX = x + shipSize < 9 ? x + shipSize : 9;
                    toY = y === 9 ? 9 : y + 1; 
                }
                else {
                    toY = y + shipSize < 9 ? y + shipSize : 9;
                    toX = x === 9 ? 9 : x + 1; 
                }


                for(let i = fromX; i <= toX; i++){
                    for(let j = fromY; j <= toY; j++) {
                        if(this.field[i][j] !== ''){
                            return false;
                        }
                    }
                }
                return true;
            }

            
            getRandom(n) {
                return Math.floor(Math.random() * (n + 1) );
            }

            /**
             * Отрисовка поля
             * 
             */  
            drawField() {
                return `<div class="container">
                <div class="sea-battle">
                    <div class="sea-battle__header">
                        <h2 class="title">Sea Battle</h2>
                        <div class="names">
                            <h3 class="name" id="player">Player</h3>
                            <h3 class="name">Computer</h3>
                        </div>
                        <div class="scores">
                            <h3 class="score__player">0</h3>
                            <h3 class="score__ai">0</h3>
                        </div>
                    </div>
                    <div class="sea-battle__content">
                        <div class="fields">
                            <div class="field field-user">
                            ${this.drawGrid()}
                            </div>
                            <div class="field field-ai">
                            ${this.drawGrid()}
                            </div>
                        </div>
                        <div class="field__btns" >
                            <button class="btn hidden" id="resetField">Reset field</button>
                            <button class="btn" id="startGame">Start game</button>
                        </div>
                    </div>
                </div>
            </div>`
            }

            drawGrid() {
                let result = '';
                for(let i = 0; i < this.fieldSize; i++){
                    result += `<div class="row">`;
                    result += this.drawGridCells(i);
                    result += `</div>`;
                }
                return result;
            }

            drawGridCells(x) {
                let result = '';
                for(let i = 0; i < this.fieldSize; i++){
                    result += `<div class="cell" data-x="${x}" data-y="${i}"></div>`;
                }
                return result;
            }


            getCell(x,y) {
                let cells = document.querySelectorAll('.cell');
                let result = null;
                let k = 0;
                cells.forEach((item) => {
                    if(item.getAttribute('data-x') == x && item.getAttribute('data-y') == y){
                        result = k;
                    }
                    k++;
                })
                return result;
            }

            /**
             * 
             * @param {*} field - поле игрока или компьюетра
             * 
             * Обновлляет корабли в поле 
             */
            updateField(field = '') {
                let cells = document.querySelectorAll(field + ' .cell');

                for(let i = 0,count = 0; i < this.fieldSize; i++) {
                    for(let j = 0; j < this.fieldSize; j++, count++) {
                        if(this.field[i][j] !== '') {
                            cells[count].classList.add('ship');
                        }
                    }
                }
            }


            /**
             * Очистка поля
             */  
            clearBoard() {
                document.body.innerHTML = '';
            }
        }
});