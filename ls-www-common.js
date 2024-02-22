/*
  ===========================
  Функции общего назначения
  ===========================
*/

const
  LS_WWW_COMMON=true;

/*
  Аналог php.isset()
*/
function isset(v) {
  return typeof v !=='undefined';
}

/*
  Выдаёт имя типа
*/
const
  type=(x) => x == null ? `${x}` : x.constructor.name;

/*
  Добавляем в jQuery функцию проверки существования элемента.

  Usage: if ($('selector').exists()) ...
*/
if (window.jQuery) {
  jQuery.fn['exists']=jQuery.fn['exists']
  ||
  function() {
    return (this.length >0);
  }
} else {
  /*
    Проверка наличия в DOM элемента по указанному селектору.
  */
  window.exists=(selector) => {
    return !!document.querySelector(selector);
  }
}

/*
  Меняет в строке параметры в { } на заданные в качестве параметров функции

  "Hello, {name}, are you feeling {adjective}?".formatUnicorn({name:"Gabriel", adjective: "OK"});
  Hello, Gabriel, are you feeling OK?

  "a{0}bcd{1}ef".formatUnicorn("FOO", "BAR");
  "aFOObcdBARef"
*/
String.prototype.formatUnicorn=String.prototype.formatUnicorn
||
function()
{
  'use strict';
  var str=this.toString();

  if (arguments.length) {
    var t=typeof arguments[0];
    var key;
    var args=('string' ===t || 'number' ===t) ?
      Array.prototype.slice.call(arguments)
      :
      arguments[0];

    for (key in args) {
      str=str.replace(new RegExp('\\{'+key+'\\}','gi'),args[key]);
    }
  }
  return str;
}

/*
  Приводит первую букву строки str к верхнему регистру.
*/
function capsFirstLetter(str) {
  return str.charAt(0).toUpperCase()+str.slice(1);
}

/*
  Разбирает строку GET-запроса на параметры.
*/
function getUrlParams(url=location.search) {
  var
    regex=/[?&]([^=#]+)=([^&#]*)/g,
    params={ },
    match;

  while (match=regex.exec(url)) {
    params[match[1]]=match[2];
  }

  return params;
}

/*
  Добавляем в конец строки '/', если его там нет.
*/
function trailingSlash(str)
{
  return (str.charAt(str.length-1) ==='/') ? str : str+'/';
}

/*
  Выводит сообщение в console.log и показывает alert().
*/
function emitError(errstr,_log=true,_alert=true)
{
  if (_log)
    console.error(errstr);
  if (_alert)
    alert(errstr);
}

/*
  Возвращает дату в виде 'дн, XX месяц YYYY г.
  ds может быть в формате 'yyyymmdd' или 'yyyy-mm-dd'
*/
function dateStr2longDateStr(ds)
{
  var
    d,
    opts={
      weekday:'short',
      day:'numeric',
      month:'long',
      year:'numeric'
    };

  switch (ds.length) {
    case 8:   // yyyymmdd
      d=new Date(ds.slice(0,4)+'-'+ds.slice(4,6)+'-'+ds.slice(6,8));
      break;
    case 10:  // yyyy-mm-dd
      d=new Date(ds)
      break;
    default:
      emitError('Дата указана неверно: "'+ds+'".');
      return;
  }

  return d.toLocaleDateString('ru-RU',opts);
}

/* --- === Работа с куками === --- */

/*
  Получает значение куки.
*/
function getCookie(name) {
  var
    cs=document.cookie.match('(^|;)?'+name+'=([^;]*)(;|$)');

  return cs ? cs[2] : null;
}

/*
  Устанавливает значение куки.
  expiry - к-во дней.
*/
function setCookie(name,value,expiry=0) {
  var
    cs=encodeURIComponent(name) + '=' + encodeURIComponent(value),
    expires=new Date();

  if (expiry) {
    expires.setTime(expires.getTime() + (expiry*24*60*60*1000));
    sExpires=';expires=' + expires.toUTCString();
  } else {
    sExpires='';
  }

  document.cookie=encodeURIComponent(name)+'='+value+'; SameSite=Lax; '+sExpires;

  /*cs+='; expires='+new Date(2047,10,18, 9,9,9).toGMTString();
  document.cookie=cs;*/
}

/*
  Удаление куки
*/
function delCookie(name) {
  var
    cd=new Date();  // Текущая дата и время

  cd.setTime(cd.getTime()-1);
  document.cookie=encodeURIComponent(name)+'=; SameSite=Lax; expires='+cd.toUTCString();
}

/*
  Добавляет в object примеси (mixinX).
  Вызов: extend(obj, mixin1,mixin2,...mixinN);

  ПРИМЕР
  ~~~~~~
  Примеси:
  var Mixin_Worker={
    whoami: function() { console.log(this.name+', '+IAM); }
    say: function() { console.log(this.name+' - the best worker in the Universe.'); }
  }
  var Mixin_Drinker={
    drink: function() { console.log(this.name+' drinking '+BEVERAGE); }
  }

  Классы для добавления в них смесей:
  function Man(name) {
    this.name=name;
  }
  Man.prototype={
    constructor: Man,
    IAM: 'Im animal.';
  }
  extend(Man, Mixin_Worker);
  function Programmer(name) {
    this.name=name;
  }
  Programmer.prototype={
    constructor: Programmer,
    IAM: 'code creater',
    BEVERAGE: 'Russian Vodka',
    coding: function() { console.log('*writting best code*'); }
  }
  extend(Programmer, Mixin_Worker,Mixin_Drunker);

  Использование:
  var man=new Man('Jhon Doe');
  var programmer= new Programmer('theTosh');
  man.whoami(); man.say();
  programmer.whoami(); programmer.say(); programmer.drink();
*/
function extend(object)
{
  var
    mixins=Array.prototype.slice.call(arguments,1);

  for (var i=0; i <mixins.length; ++i) {
    for (var prop in mixins[i]) {
      if (typeof object.prototype[prop] ==='undefined') {
        bindMethod=function(mixin,prop) {
          return function() { mixin[prop].apply(this,arguments); }
        }
        object.prototype[prop]=bindMethod(mixins[i],prop);
      }
    }
  }
}

/*
  Возвращает выделенный фрагмент элемента el в виде объекта.

  @param object ed  элемент <textarea> или <input type='text'>
  @return object  объект, содержащий информацию о выделенном фрагменте
*/
function getSelection(el)
{
  var
    l=el.selectionEnd-el.selectionStart;

  return {start: el.selectionStart, end: el.selectionEnd, len: l, txt: el.value.substr(el.selectionStart,l) };
}

/*
  Выделет фрагмент текста заданного элемента.

  @param object el  объект элемента, над которым работаем
  @param int start_pos  начальная позиция выделения
  @param int end_pos  конечная позиция выделения
  @return object  объект, содержащий информацию о выделенном фрагменте
*/
function setSelection(el,start_pos,end_pos)
{
  el.focus();
  el.selectionStart=start_pos;
  el.selectionEnd=end_pos;

  return getSelection(el);
}

/*
  Заменяет выделенный текст заданным и выделяет его.

  @param object el  объект, в котором проихводим замену
  @param string replace_str  строка, на которую меняем
  @param bool select_replaced  выделить ли замещённый текст
  @return object  объект, содержащий информацию о выделенном фрагменте
*/
function replaceSelection(el,replace_str,select_replaced=false)
{
  var
    sel=getSelection(el),
    start_pos=sel.start,
    end_pos=start_pos+replace_str.length;

  el.value=el.value.substr(0,start_pos)+replace_str+el.value.substr(sel.end,el.value.length);
  if (select_replaced)
    setSelection(el,start_pos,end_pos);
  return {start: start_pos, end: end_pos, length: replace_str.length, txt: replace_str};
}
