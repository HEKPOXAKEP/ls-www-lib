/*
  Объект управления загрузкой css.
  Наследуем от javascript Map.
*/
class CSSControl extends Map {
  loadCss(id,href) {
    if (!this.has(id)) {
      $('<link>',{
        id: id,
        rel: 'stylesheet',
        href: href,
        class: 'dynamic-css'
      }).appendTo('head');

      this.set(id,{href:href});
    }
  }

  delete(id) {
    $('#'+id).remove();
    super.delete(id);
  }

  clear() {
    $('.dynamic-css').remove();
    super.clear();
  }
}

var
  cssCtrl=new CSSControl();
