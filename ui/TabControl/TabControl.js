/*
  =====================
  Работа с вкладками
  =====================

  CCTabCtrls.tabCtrls[]->CCTabCtrl.tabSheets[]->CCTabSheet
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
  Класс TabCtrls.
  Содержит все TabCtrl на странице.
*/
function CCTabCtrls()
{
  this.tabCtrls=[];

}
var
  ccTabCtrls=new CCTabCtrls;

/*
  Создание нового элемента TabControl.
  Вернёт объект управления созданным элементом.
*/
CCTabCtrls.prototype.createTabCtrl=function(containerId,tabCtrlId)
{
  return this.tabCtrls[this.tabCtrls.push(new CCTabCtrl(containerId,tabCtrlId))-1];
}

/*
  Поиск объекта управления CCTabCtrl по Id.
  Если не найден, вернёт undefined.
*/
CCTabCtrls.prototype.tabCtrlById=function(tabCtrlId)
{
  return this.tabCtrls.find(function(tabCtrl,idx,ar) {
    return tabCtrl.tabCtrlId ==tabCtrlId;
  });
}

/*
  Вернёт jQuery-объект, содержащий все компоненты вкладки: radio, label, closebtn и content
  для вкладки по имени sheetName таб-контрола tabCtrlId.
  Если вкладка не найдена, вернёт объект с length==0.
*/
CCTabCtrls.prototype.tabSheetBySheetName=function(tabCtrlId,sheetName)
{
  var
    tabCtrl=this.tabCtrlById(tabCtrlId);

  if (tabCtrl ==undefined)
    return $();
  else
    return tabCtrl.tabSheetBySheetName(sheetName);
}

/*
  Удаляем все TabControl'ы.
*/
CCTabCtrls.prototype.clearTabCtrls=function()
{
  this.tabCtrls.forEach(function(tabCtrl,idx,ar) {
    tabCtrl.clearTabCtrl();
    $('#'+tabCtrl.tabCtrlId).remove();
  });

  this.tabCtrls.splice(0,this.tabCtrls.length);
}

/* --- --------------------------- --- */

/*
  Класс TabCtrl
*/
function CCTabCtrl(containerId,tabCtrlId)
{
  this.containerId=containerId;  // parent id
  this.tabCtrlId=tabCtrlId;      // this id
  this.tabSheets=new Array();    // tab sheets

  this.createTabCtrl();
}

/*
  Создание элемента tabCtrl в DOM.
*/
CCTabCtrl.prototype.createTabCtrl=function()
{
  $('<div>',{id:this.tabCtrlId,class:'tab-ctrl'}).appendTo($('#'+this.containerId));
}

/*
  Создание элемента tabSheet в DOM И его управляющего объекта tabSheet в CCTabCtrl.tabSheets.
  Вернёт объект CCTabSheet.

  tabSheetTitle  - заголовок вкладки;
  sheetName      - имя для связываения всех компонетов вкладки: radio, label, closebtn и content;

  params         - объект, состоящий из:
    mod
      htmlUrl       - url html контента;
      objUrl        - url файла, содержащего объект управления создаваемой вкладкой;
    css
      id            - id файла стилей создаваемой вкладки;
      href          - url файла стилей;
    htmlText       - код html, который буде вставлен в контент вкладки;
    onLoadError    - функция, которая будет вызвана в случае ошибки загрузки mod;
                     в неё передаются params.mod, response, status и xhr
    afterLoad      - функция, которая будет вызвана в случае успешной загрузки mod.objUrl;
                     в неё передаются Id контента созданой вкладки.
    beforeDestroy  - функция, которая будет вызвана перед удалением вкладки;
                     в неё передаются объект управления CCTabCtrl и CCTabSheet.
                     Если функция вернёт false, вкладка не будет удалена.
*/
CCTabCtrl.prototype.createTabSheet=function(tabSheetTitle,sheetName,params)
{
  var
    _this=this,
    num=this.genTabNum(),

    $radio=$('<input>',{
      type: 'radio',
      id: this.tabCtrlId+'-tab-radio-'+num,
      class: 'tab-radio',
      name: this.tabCtrlId+'-tab-radio',
      sheetname: sheetName,
      value: num
    }),

    $label=$('<label>',{
      id: this.tabCtrlId+'-tab-label-'+num,
      class: 'tab-title',
      for: this.tabCtrlId+'-tab-radio-'+num,
      sheetname: sheetName
    }).text(tabSheetTitle),

    $closebtn=$('<span>',{
      id: this.tabCtrlId+'-tab-closebtn-'+num,
      class:'tab-close-btn',
      sheetname: sheetName,
      value: num
    }).html('&#10006;').appendTo($label),

    contentId=this.tabCtrlId+'-tab-content-'+num;

    $content=$('<div>',{
      id: contentId,
      class: 'tab-content',
      sheetname: sheetName
    });

  if (this.tabSheets.length ==0) {
    // вкладок пока нет
    $('#'+this.tabCtrlId).append($radio);
    $('#'+this.tabCtrlId).append($label);
    $('#'+this.tabCtrlId).append($content);
  } else {
    // вкладки есть
    // ! важно помнить, что заголовки (radio и label) и контейнер
    // ! для контента (content) следует вставлять в разные места
    // ! элемента tab-contrl: заголовки - отдельно, контенты - отдельно.
    this.lastTabSheetTitle().after($label).after($radio);
    this.lastTabSheetContent().after($content);
  }

  if (params ==undefined)
    params={};

  // заносим объект управления вкладкой в список вкладок
  const ccIdx=this.tabSheets.push(new CCTabSheet(this,num,{
    sheetName:sheetName,
    beforeDestroy:params.beforeDestroy
  }))-1;

  if ('css' in params)
    // грузим стили вкладки
    cssCtrl.loadCss(params.css.id,params.css.href);

  // инициализируем контент вкладки
  if ('mod' in params) {
    $content.load(params.mod.htmlUrl,function(response,status,xhr) {
      if (status =='error') {
        // ошибка при загрузке mod.htmlUrl
        if ('onLoadError' in params) {
          params.onLoadError(params.mod.htmlUrl,respose,status,xhr);
        } else {
          errorLoadMod(params.mod.htmlUrl,xhr);
        }
      } else {
        // mod.htmlUrl загружен, грузим его объект, если задан его url
        if ('objUrl' in params.mod)
          $.getScript(params.mod.objUrl,function() {
            // модуль объекта загружен, инициализируем
            _this.tabSheets[ccIdx].modObj=initMod(_this.tabSheets[ccIdx]);
          }).fail(function(xhr,textStatus,errorThrown){
            // ошибка загрузки модуля объекта
            errorLoadMod(params.mod.objUrl,xhr);
          });

        if ('afterLoad' in params)
          params.afterLoad(contentId);
      }
    });
  } else if ('htmlText' in params) {
    // если указан html, просто вставляем его в div контента
    $content.html(params.htmlText);
    if ('afterLoad' in params) {
      params.afterLoad(contentId);
    }
  }

  // Вешаем обработчики на семну вкладки и на клик по кнопке закрытия вкладки.
  // В EventObject.data будет передваться CCTabCtrl этой вкладки:
  $radio.change(this,this.onChangeTabSheet);
  $closebtn.click(this,this.onClickCloseBtn);

  // переключиться на эту вкладку?
  if ('activate' in params)
    this.doChangeTabSheet({sheetName:sheetName});

  return this.lastTabSheet();
}

/*
  Генерирует номер для новой вкладки.
  Если вкладок нет, вернёт 1.
*/
CCTabCtrl.prototype.genTabNum=function()
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

CCTabCtrl.prototype.checkTabSheets=function()
{
  // спрячем контент всех вкладок
  $('#'+this.tabCtrlId+'>.tab-content').each(function(idx,el) {
    $(this).toggle(false);
  });

  var
    // список чекнуых табов, if any
    $tab=$('#'+this.tabCtrlId+'>.tab-radio:checked');

  if ($tab.length) {
    // есть чекнутый таб - покажем его контент
    $('#'+this.tabCtrlId+'-tab-content-'+$tab[0].value).toggle(true);
  } else {
    // чекнутых табов нет, а вообще табы есть?
    $tab=$('#'+this.tabCtrlId+'>.tab-radio');
    if ($tab.length) {
      // - чекним первый [0]
      $($tab[0]).prop('checked',true);
      $('#'+this.tabCtrlId+'-tab-content-'+$tab[0].value).css('display','block');
    }
  }
}

/*
  Вернёт индекс чекнутой вкладки или -1.
*/
CCTabCtrl.prototype.checkedTabSheetIdx=function()
{
  var
    $checked=$('#'+this.tabCtrlId+'>.tab-radio:checked');

  if ($checked.length =0)
    return -1;
  else
    return this.tabSheetIdxByNum($checked[0].value);
}

/*
  Переключение на указанную вкладку.
*/
CCTabCtrl.prototype.doChangeTabSheet=function(thatSheet)
{
  if ('sheetName' in thatSheet) {
    this.ccTabSheetBySheetName(thatSheet.sheetName).tabSheetRadio().trigger('click');
  } else if ('tabNum' in thatSheet) {
    this.ccTabSheetByNum(thatSheet.tabNum).tabSheetRadio().trigger('click');
  } else if ('tabIdx' in thatSheet) {
    this.tabSheets[thatSheet.tabIdx].tabSheetRadio().trigger('click');
  } else {
    throw `doChangeTabSheet: неопределённый thatSheet "${thatSheet}".`;
  }
}

/*
  Вернёт объект jQuery для последней radio в этом TabCtrl
*/
CCTabCtrl.prototype.lastTabSheetRadio=function()
{
  if (this.tabSheets.length)
    return this.tabSheets[this.tabSheets.length-1].tabSheetRadio();
  else
    return null;
}

/*
  Вернёт объект jQuery для последней label в этом TabCtrl
*/
CCTabCtrl.prototype.lastTabSheetTitle=function()
{
  if (this.tabSheets.length)
    return this.tabSheets[this.tabSheets.length-1].tabSheetTitle();
  else
    return null;
}

/*
  Вернёт объект jQuery для последнего контейнера TabSheet в этом TabCtrl
*/
CCTabCtrl.prototype.lastTabSheetContent=function()
{
  if (this.tabSheets.length)
    return this.tabSheets[this.tabSheets.length-1].tabSheetContent();
  else
    return null;
}

/*
  Вернёт последний объект CCTabSheet в этом TabCtrl или null.
*/
CCTabCtrl.prototype.lastTabSheet=function()
{
  if (this.tabSheets.length)
    return this.tabSheets[this.tabSheets.length-1];
  else
    return null;
}

/*
  Обработчик смены вкладки.
  В eventObject.data объект управления TabCtrl.
*/
CCTabCtrl.prototype.onChangeTabSheet=function(ev)
{
  ev.data.checkTabSheets();
}

/*
  Обработчик клика на кнопке закрытия вкладки.
  В eventObject.data объект управления этого CCTabCtrl.
*/
CCTabCtrl.prototype.onClickCloseBtn=function(ev)
{
  ev.preventDefault();

  var
    _this=ev.data;

  _this.destroyTabSheet($(this).attr('sheetname'));
}

/*
  Вернёт индекс управляющего объекта в tabSheets по его номеру (value),
  или -1, если не найден.
*/
CCTabCtrl.prototype.tabSheetIdxByNum=function(num)
{
  return this.tabSheets.findIndex(function(el,idx) {
    return el.tabNum ==num;
  });
}

CCTabCtrl.prototype.ccTabSheetByNum=function(num)
{
  return this.tabSheets.find(function(tabSheet,idx,ar) {
    return tabSheet.tabNum ==num;
  });
}

/*
  Вернёт jQuery-объект, содержащий все компоненты вкладки: radio, label, closebtn и content.
  Если вкладки с таким именем нет, вернёт пустой объект (length==0).
*/
CCTabCtrl.prototype.tabSheetBySheetName=function(sheetName)
{
  return $('#'+this.tabCtrlId+' [sheetname="'+sheetName+'"]');
}

/*
  Вернёт объект CCTabSheet по имени его sheetName.
  Если такого нет, вернёт undefined.
*/
CCTabCtrl.prototype.ccTabSheetBySheetName=function(sheetName)
{
  return this.tabSheets.find(function(tabSheet,idx,ar) {
    return tabSheet.sheetName ==sheetName;
  });
}

/*
  Удаяляет указанную вкладку из DOM и её объект из tabSheets.
*/
CCTabCtrl.prototype.destroyTabSheet=function(sheetName)
{
  const
    ccts=this.ccTabSheetBySheetName(sheetName);

  if (ccts ==undefined) {
    console.log(`destroyTabSheet(): вкладка с именем "${sheetName}" не найдена!`);
    return false;
  }

  // beforeDestroy может быть в самом ccTabSheet.beforeDestroy
  // и в объекте ccTabSheet.modObj
  if (ccts.beforeDestroy !==undefined)
    if (!ccts.beforeDestroy(this,ccts))
      return false;
  if (('modObj' in ccts) && ('beforeDestroy' in ccts.modObj))
    if (!ccts.modObj.beforeDestroy(this,ccts))
      return false;

  var
    maxIdx=this.tabSheets.length-1,
    checkedIdx=this.checkedTabSheetIdx(),
    idx=ccts.selfIdx();

  if (idx ==checkedIdx) {
    if (idx ==maxIdx)
      idx--;
    if (idx <0)
      idx=0;
  }

  $(ccts.tabSheetContent()).remove();
  $(ccts.tabSheetTitle()).remove();
  $(ccts.tabSheetRadio()).remove();
  this.tabSheets.splice(ccts.selfIdx(),1);

  this.doChangeTabSheet({sheetName:this.tabSheets[idx].sheetName});
  //this.checkTabSheets();
}

/*
  Удаляет все вкладки и их объекты из tabSheets
*/
CCTabCtrl.prototype.clearTabCtrl=function()
{
  $('#'+this.tabCtrlId).empty();
  this.tabSheets.splice(0,this.tabSheets.length);
}

/* --- --------------------------- --- */

/*
  Класс TabSheetю

  В options:
    sheetName       - атрибут sheetname;
    beforeDestroy   - функция, которая будет вызвана перед удалением вкладки;
*/
function CCTabSheet(ccTabCtrl,tabNum,options)
{
  this.ccTabCtrl=ccTabCtrl;
  this.tabCtrlId=ccTabCtrl.tabCtrlId;
  this.tabNum=tabNum;

  if (options ==undefined)  // такого быть не должно, но всё же...
    throw 'CCTabSheet.constructor options==undefined.';

  this.sheetName=options.sheetName;
  this.beforeDestroy=options.beforeDestroy;
}

/*
  Вернёт объект jQuery для radio.
*/
CCTabSheet.prototype.tabSheetRadio=function()
{
  return $('#'+this.tabCtrlId+' #'+this.tabCtrlId+'-tab-radio-'+this.tabNum);
}

/*
  Веернёт объект jQuery для label.
*/
CCTabSheet.prototype.tabSheetTitle=function()
{
  return $('#'+this.tabCtrlId+' #'+this.tabCtrlId+'-tab-label-'+this.tabNum);
}

/*
  Вернёт объект jQuery для контейнера контента.
*/
CCTabSheet.prototype.tabSheetContent=function()
{
  return $('#'+this.tabCtrlId+' #'+this.tabCtrlId+'-tab-content-'+this.tabNum);
}

/*
  Вернёт свой индекс в tabSheets родительского CCTabCtrl.
*/
CCTabSheet.prototype.selfIdx=function()
{
  return this.ccTabCtrl.tabSheets.findIndex(function(el,idx) {
    return el.tabNum ==this.tabNum;
  },this);
}
