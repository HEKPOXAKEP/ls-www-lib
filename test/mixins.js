/*
  -----------------
  Тестируем смеси
  -----------------

  function extend(object)
  Добавляет в object примеси (mixinX).
  Вызов: extend(obj, mixin1,mixin2,...mixinN);

  Использование
    var man=new Man('Jhon Doe');
    var programmer= new Programmer('theTosh');

    man.whoami(); man.say();
    programmer.whoami(); programmer.say(); programmer.drink(); programmer.coding();
*/

/* 
  Примеси
*/
var Mixin_Worker={
  whoami: function() { console.log(this.name+', '+this.IAM); },
  say: function() { console.log(this.name+' - the best worker in the Universe.'); }
}
var Mixin_Drinker={
  drink: function() { console.log(this.name+' drinking '+this.BEVERAGE); }
}
/*
  Классы для добавления в них смесей:
*/
function Man(name) {
  this.name=name;
}
Man.prototype={
  constructor: Man,
  IAM: 'Im animal.'
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
extend(Programmer, Mixin_Worker,Mixin_Drinker);
