/*
  ========================
  Базовый класс тулбаров
  ========================
  Для использования должны быть подключены ls-www-common.js,
  Toolbar.css и ToolbarControl.js.

  Загрузка и инициализация производится в классе ToolbarControl
  методом loadToolbar(id,name,containerId).
*/
class Toolbar {
  constructor(containerId) {
    this.containerId=containerId;
  }

  bindEvents() {
    // abstract
  }

  unbindEvents() {
    $('#'+this.containerId+'>div').unbind();
  }
}
