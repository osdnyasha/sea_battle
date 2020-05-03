define('app/Components/Component.js', function () {

    /**
     * Класс, представляющий компонент
     */
    return class Component {

        /**
         * Создание и инициализация объектов
         */
        constructor() {
            // Метод, который запускается непосредственно перед рендерингом компонента
            this.beforeRender();
        }

        /**
         * Рендеринг компонента
         * @returns {string}
         */
        render() {}

        /**
         * Метод, который запускается непосредственно перед рендерингом компонента
         * @returns {void}
         */
        beforeRender() {}

        /**
         * Метод, который запускается после того, как компонент отрендерился в DOM
         * @returns {void}
         */
        afterRender() {}
    }

});
