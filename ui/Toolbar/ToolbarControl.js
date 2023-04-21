/*
  ============================
  Класс управления тулбарами
  ============================

  Каждый загружаемый скрипт тулбара должен иметь функцию initToolbar(id,containerId),
  которая создаст и вернёт экземпляр класс этого тулбара.
*/
class ToolbarCtrl extends Map {
  constructor() {
    super();
    this.currToolbarId=undefined;
  }

  get currToolbar() {
    return this.get(this.currToolbarId);
  }

  registerToolbar() {
    
  }

  /*
    Загрузка и инициализация html и объекта js тулбара.
    Параметры:
      id           - инетификатор тулбара для сохранения в коллекции
      name         - имя файлов html и js тулбара без расширения;
                     файлы html и js должны располагаться в подкаталогах /html и /js соответственно
      containerId  - контейнер тулбара, в который будут добавляться кнопки
  */
  loadToolbar(id,fName,containerId) {
    if (this.currToolbarId !==undefined) {
      this.get(this.currToolbarId).unbindEvents();
    }
    $('#'+containerId).empty();

    this.loadHtml(id,fName,containerId);     // -> loadJS -> initToolbar, bindEvents
  }

  /*
    Загрузка файла html тулбара.
  */
  loadHtml(id,fName,containerId) {
    var
      self=this,
      $toolbar=$('#'+containerId),
      htmlName='./html/'+fName+'.html';

    $toolbar.load(htmlName,function(response,status,xhr) {
      if (status ==='error') {
        errorLoadMod(htmlName,xhr);
      } else {
        self.loadJS(id,fName,containerId);
      }
    });
  }

  /*
    Загрузка класса для обработки тулбара.

    В модуле должны быть две функции: initToolbar(), которая вернёт созданный объект тулбара,
    и bindEvents(), которая привяжет обработчики событий к элементам тулбара.
  */
  loadJS(id,fName,containerId) {
    var
      self=this,
      jsName='./js/'+fName+'.js';

    if (!this.has(id)) {
      // скрипт с таким Id не загружался - грузим
      $.getScript(jsName,function() {
        // загрузили, инициализируем
        self.currToolbarId=id;
        self.set(id,initToolbar(id,containerId));  // создаём объект
        //self.set(id,new className(containerId));  // создаём объект
        self.bindEvents(id);                      // привязываем события
      }).fail(function(xhr,textStatus,errorThrown) {
        errorLoadMod(jsName,xhr);
      });
    } else {
      // скрипт был загружен и инициализирован ранее,
      // только привязываем события.
      this.currToolbarId=id;
      this.bindEvents(id);
    }
  }

  /*
    Инициализация событий тулбара.
    У каждого управляющего класса должен быть метод initEvents().
  */
  bindEvents(id) {
    this.get(id).bindEvents();
  }

  /*
    Уничтожаем объект тулбара по его Id.
  */
  delete(id) {
    this.get(id).unbindEvents();  // отвязываем события
    this.set(id,null);
    super.delete(id);
  }

  /*
    Удаление всех объектов ToolbarCtrl.
  */
  clear() {
    this.forEach((obj,id) => {
      obj.unbindEvents();  // отвязываем события
      this.set(id,null);
    });
    super.clear();
  }
}

var
  toolbarCtrl=new ToolbarCtrl();
