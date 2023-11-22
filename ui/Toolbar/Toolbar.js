/*
  ========================
  Базовый класс тулбаров
  ========================
  Для использования должны быть подключены ls-www-common.js,
  Toolbar.css и ToolbarControl.js.

  Загрузка и инициализация производится в классе ToolbarControl
  методом loadToolbar(id,fHtml,fJs,containerId).

  У каждого наследника обязательно перкрыть метод toolBtnClick,
  в который отсюда возваращается Id. Кнопки должны иметь Id
  вида toolbtn-XXX, гду XXX и есть Id, который вернёт super(ev).
*/
class Toolbar {

  constructor(containerId) {
    this.containerId=containerId;
    this.boundToolbarBtnClick=this.toolbarBtnClick.bind(this);
  }

  bindEvents() {
    var
      btns=document.querySelectorAll('#'+this.containerId+'>.toolbar-btn');

    Array.from(btns).forEach((btn) => {
      btn.addEventListener('click',this.boundToolbarBtnClick);
    });
  }

  unbindEvents() {
    ///$('#'+this.containerId+'>div').unbind();
    var
      btns=document.querySelectorAll('#'+this.containerId+'>.toolbar-btn');

    Array.from(btns).forEach((btn) => {
      btn.removeEventListener('click',this.boundToolbarBtnClick);
    });
  }

  /*
    super(ev) returns bittons Id
  */
  toolbarBtnClick(ev) {
    if (ev.target.id) return ev.target.id.split('-')[1];
    else return ev.target.parentNode.id.split('-')[1];
    /*if (ev.target.id) console.log('clicked ',ev.target.id.split('-')[1]);
    else console.log(ev.target.parentNode.id.split('-')[1]);*/
  }
}
