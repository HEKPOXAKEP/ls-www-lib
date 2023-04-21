/*
  ========================================
  Объект для работы с диалоговыми окнами
  ========================================
*/

const
  // id компонетов диалога
  dlgLayerClass='dlgLayer',   // после '-' добавляется уникальное число
  dlgDialogClass='dialog',
  dlgHeaderClass='dlgHeader',
  dlgBodyClass='dlgBody',
  dlgBtnClass='dlgBtn',
  dlgDefaultBtnClass='btnDefault';

/*
  Конструктор объекта работы с диалогами.
*/
function CCDialogs()
{
  this.cssUrl='';           // !! сюда занести url для загрузки
  this.tplUrl='';           // !! css и шаблонов диалогов
  this.ans='';              // ответ последнего диалога; нужно чистить при открытиии очередного
  this.stack=new Array();   // стэк открытых диалогов; самый верхний имеет индекс 0
}
var
  ccDlgs=new CCDialogs();  // перед использованием необходимо вызвать initCommonDialogs

/*
  Вернёт объект верхнего диалога на стэке.
*/
CCDialogs.prototype.dlg=function()
{
  if (this.count() ==0)
    throw 'Стэк диалогов пуст!';

  return this.stack[0];
}

/*
  Кладём на стэк объект дилога.
*/
CCDialogs.prototype.pushDlg=function(dlgObj)
{
  this.stack.unshift(dlgObj);
}

/*
  Снимаем со стэка объект дилога.
*/
CCDialogs.prototype.popDlg=function()
{
  this.stack.shift();  // убираем со стека
}

/*
  Вернёт к-во диалогов на стэке.
*/
CCDialogs.prototype.count=function()
{
  return this.stack.length;
}

/*
  Есть ли диалоги в стэке?
*/
CCDialogs.prototype.hasDlgs=function()
{
  return this.count() !==0;
}

/*
  Чистим ответ диалога.
  Вызывается при создании нового лиалога.
*/
CCDialogs.prototype.clearAns=function()
{
  this.ans='';
}

/*
  Запоминаем ответ диалога.
*/
CCDialogs.prototype.setAns=function(answer)
{
  this.ans=answer;
}

/*
  Подготовка диалогового окна.

  $dialog  - jQuery-объект диалога
  msg     - что будет отображаться в body
  params  - объект свойств:
    title          - html для заголовка;
    beforeShow     - функция, которая будет вызвана перед отображением диалога;
                     передаётся jQuery-объект дилога;
    beforeDestroy  - функция, которая будет вызвана перед уничтожением диалога;
                     если она вернёт false, диалог не будет закрыт.
*/
CCDialogs.prototype.prepareDlg=function($dialog,msg,params)
{
  this.clearAns();

  if ('beforeDestroy' in params) {
    this.stack[0].beforeDestroy=params.beforeDestroy;
  }

  // заполняем компоненты диалога
  if ('title' in params) {
    $dialog.children('.'+dlgHeaderClass).html(params.title);
  }
  $dialog.children('.'+dlgBodyClass).html(msg);
  $dialog.attr('tabindex','-1');  // чтобы на диалог можно было повесить обработчик keydown

  // если задана callback функция params.beforeShow()
  if ('beforeShow' in params) {
    params.beforeShow($dialog);
  }
}

/*
  Загружает и отображает диалог.
  mod - название html-модуля диалога
*/
CCDialogs.prototype.loadAndShowDlg=function(mod,msg,params)
{
  var
    _this=this,
    newId=1971;

  if (this.hasDlgs())
    // в стэке уже есть диалоги, генерируем новый Id
    newId=this.dlg().id+1;

  var
    modUrl=this.tplUrl+mod,
    // строковые Id слоя-аодложки и окна диалога
    newLayerIdStr=dlgLayerClass+'-'+newId.toString(),
    newDlgIdStr=dlgDialogClass+'-'+newId.toString(),
    // создаём новый слой для нового диалога и вставляем его в конец документа
    // изначально display:none и он не будет отображаться
    $layer=$('<div>',{id:newLayerIdStr,class:dlgLayerClass}).appendTo('body');

  // грузим mod диалога внутрь слоя-подложки
  $layer.load(modUrl,function(response,status,xhr) {
    if (status =='error') {
      errorLoadMod(modUrl,xhr);
    } else {
      // кладём на стек Id нового диалога
      _this.pushDlg({id:newId});

      // диалог загружен, добавим ему Id
      var
        $dialog=$('#'+newLayerIdStr+'>.dialog').attr('id',newDlgIdStr);

      if ((params ==null) || (params ==undefined)) {
        params={ };
      }

      _this.prepareDlg($dialog,msg,params);

      // вешаем события на кнопки
      $dialog.find('.'+dlgBtnClass).click(function(ev) {
        _this.closeDlg(this.value);
      });

      $dialog.keydown(function(ev) {
        switch(ev.whitch) {
          case 13:
            var d=$('#'+ev.target.id);
            if (d.find('.'+dlgDefaultBtnClass)) {
              // закрываем по [Enter] и ответ - кнопка по умолчанию
              var defBtn=d.find('.'+dlgDefaultBtnClass);
              _this.closeDlg(defBtn[0].value);
            } else {
              console.log('[Enter] pressed, but no default button.');
            }
            break;
          case 27:
            // закрываем по [Esc]
            ev.preventDefault();
            _this.closeDlg('cancel');
            break;
        }
      });

      $layer.addClass('open');        // показывает диалог display:none -> display:block
      $dialog.focus();                // чтобы отрабатывались клавиатурные события
    }
  }); // layer.load() success
}

/*
  Показать диалог сообщения об ошибке.
*/
CCDialogs.prototype.showErrorDlg=function(msg,params)
{
  this.loadAndShowDlg('DlgError.html',msg,params);
}

/*
  Показать информационный диалог.
*/
CCDialogs.prototype.showInfoDlg=function(msg,params)
{
  this.loadAndShowDlg('DlgInfo.html',msg,params);
}

/*
  Показать диалог подтверждения Yes, No, Cancel.
*/
CCDialogs.prototype.showQueryDlg=function(msg,params)
{
  this.loadAndShowDlg('DlgQuery.html',msg,params);
}

/*
  Показать кастомный диалог.
  Параметры задаются в params.
*/
CCDialogs.prototype.showCustomDlg=function(msg,params)
{
  this.loadAndShowDlg('DlgCustom.html',msg,params);
}

/*
  Показать диалог по его типу: error, info, query, custom
*/
CCDialogs.prototype.showDlg=function(dlgType,msg,params)
{
  if (!dlgType) {
    emitError('Пустой dlgType');
  } else {
    dlgType=dlgType.toLowerCase();

    if (!msg) {
      msg='Текст сообщения.';
    }

    switch(dlgType) {
      case 'error':
        this.showErrorDlg(msg,params);
        break;
      case 'info':
        this.showInfoDlg(msg,params);
        break;
      case 'query':
        this.showQueryDlg(msg,params);
        break;
      case 'custom':
        this.showCustomDlg(msg,params);
        break;
      default:
        emitError('Нераспознаный dlgType "'+dlgType+'"');
    }
  }
}

/*
  Закрывает текущий открытый диалог.

  ans  - ответ диалога: 'ok', 'yes', 'no', 'cancel',
  или заполняется функцией beforeDestroy().
*/
CCDialogs.prototype.closeDlg=function(ans)
{
  var
    dlg=this.dlg(),
    id=dlg.id.toString(),
    $layer=$('#'+dlgLayerClass+'-'+id);

  if ('beforeDestroy' in dlg) {
    if (!dlg.beforeDestroy($('#'+dlgDialogClass+'-'+id)))
      return false;
  }

  $layer.removeClass('open');  // прячем диалог dosplay:block -> display:none
  this.setAns(ans);            // сохраняем ответ

  $layer.remove();  // удаляем элемент (подложку и сам диалог) в DOM
  this.popDlg();    // снимаем со стэка верхний элемент
}
