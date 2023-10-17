/*
  ==================
  Wide Tab Control
  ==================
  Управление вкладками
  Заголовки вкладок располагаются слева (или справа), а не сверху.

  WDTabCtrls.tabCtrls[]->WDTabCtrl.tabSheets[]->WDTabSheet
*/

/*
  Инициализация модуля.
*/
(function() {
  "use strict";
  // нужно проверить, есть ли функция сообщения об ошибках загрузки,
  // котрая находится в ls-www-common.js
  if (!('errorLoadMod' in window)) {
    window.errorLoadMod = function (mod, xhr) {
      let errstr = 'Ошибка при загрузке "' + mod + '".\rjqXHR.status: ' + xhr.status + '.\rjqXHR.statusText: ' + xhr.statusText + '.';
      console.log(errstr);
      alert(errstr);
    }
  }
}());

/*
  Класс WDTabCtrls.
  Содержит все WDTabCtrl на странице.
*/
function WDTabCtrls()  // constructor
{
  this.tabCtrls=new Array();
}
var
  wdTabCtrls=new WDTabCtrls;

/*
  Создание нового элемента TabControl.
  Вернёт объект управления созданным элементом.
*/
WDTabCtrls.prototype.createTabCtrl=function(containerId,tabCtrlId)
{
  return this.tabCtrls[this.tabCtrls.push(new WDTabCtrl(containerId,tabCtrlId))-1];
}

/*
  Поиск объекта управления WDTabCtrl по Id.
  Если не найден, вернёт undefined.
*/
WDTabCtrls.prototype.tabCtrlById=function(tabCtrlId)
{
  return this.tabCtrls.find(function(tabCtrl,idx,ar) {
    return tabCtrl.tabCtrlId ==tabCtrlId;
  });
}

/*
  Удаляем все TabControl'ы.
*/
WDTabCtrls.prototype.clearTabCtrls=function()
{
  this.tabCtrls.forEach(function(tabCtrl,idx,ar) {
    tabCtrl.clearTabCtrl();
    $('#'+tabCtrl.tabCtrlId).remove();
  });

  this.tabCtrls.splice(0,this.tabCtrls.length);
}

/* --- =========================== --- */

/*
  Класс WDTabCtrl.
  Содержит листы вкладок WDTabSheet.
*/
function WDTabCtrl(containerId,tabCtrlId)  // constructor
{
  this.containerId=containerId;  // parent id
  this.tabCtrlId=tabCtrlId;      // this id
  this.tabSheets=new Array();    // tab sheets

  this.createTabCtrl();  // вставляем элемент в DOM
}

/*
  Создание элемента tabCtrl в DOM.
*/
WDTabCtrl.prototype.createTabCtrl=function()
{
  // DIV всей вкладки
  const
    $tabCtrl=$('<div>',{id:this.tabCtrlId,class:'wd-tab-ctrl'});

  $('<div>',{class:'wd-tab-ctrl-captions'}).appendTo($tabCtrl);  // DIV заголовков вкладок
  $('<div>',{class:'wd-tab-ctrl-sheets'}).appendTo($tabCtrl);    // DIV для отображения содержимого активной вкладки

  $tabCtrl.appendTo($('#'+this.containerId));
}

/*
  Генерирует номер для новой вкладки.
  Если вкладок нет, вернёт 1.
*/
WDTabCtrl.prototype.genTabNum=function()
{
  if (!this.tabSheets.length)
    // если пока вкладок нет
    return 1;

  // ищем максимальное число и увеличиваем его на 1
  return this.tabSheets.reduce(
    function(maximum,current,idx,ar) {
      return Math.max(maximum,ar[idx].tabNum);
    },0
  )+1;
}
