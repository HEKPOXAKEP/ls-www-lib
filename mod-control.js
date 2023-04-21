/*
  Объект управления загрузкой модулей.
  Наследуем от javascript Map.
*/
class CCMod extends Map {
  loadMod(id,modfn) {
    var
    _id=id.toLowerCase();

    if (!this.has(_id)) {
      //$('<link />',{id:id,rel:'stylesheet',href:cssfn,class:'dynamic-css'}).appendTo($('head'));
      this.set(_id,{cssfn:modfn});
    }
  }
}

var
 ccMod=new CCMod();
