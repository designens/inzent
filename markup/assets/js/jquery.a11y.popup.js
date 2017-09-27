(function(global, $){
  'use strict';

  $.popupId = function($popups, id) {
    return $popups.filter(function(index, el) {
      return $popups.eq(index).attr('data-id') === id;
    })[0].$popup;
  };

  var init = function(o){
    o.$el.addClass('is-center').attr('role', 'dialog');
    o.$el.find('.popup-close').last().addClass('loop-focus');
    o.$el.wrapAll('<div class="popup-container">');
    o.$el.parent().hide();
    o.$el.after('<div class="popup-dim"></div');
    bind(o);
    return o;
  };
  var bind = function(o){
    var $close_els = o.$el.parent().find('.popup-dim').add(o.$el.find('.popup-close'));
    $close_els.on('click', $.proxy(o.close, o));
    o.$el.find('.loop-focus')
      .on({
        'focus': $.proxy(createLoop, o),
        'blur': $.proxy(focusMoveWrapper, o),
      });
  };
  var createLoop = function(){
    $('<a class="_temp" href>').insertAfter(this.$el.find('.loop-focus'));
  };
  var focusMoveWrapper = function(){
    this.$el.focus();
    this.$el.find('._temp').remove();
  };

  $.fn.a11y_popup = function(){

    var $this = this;

    function A11yPopup($el, time) {
      this.$el = $el;
      this.$pre_focus_el = null;
      this.time = time || 300;
      return init(this);
    }

    A11yPopup.prototype = {
      constructor: A11yPopup,
      open: function(){
        this.$pre_focus_el = global.document.activeElement;
        this.$el.attr('tabindex', -1).parent().animate({opacity: 'show'},this.time).addBack().focus();
      },
      close: function(){
        this.$el.removeAttr('tabindex').parent().animate({opacity: 'hide'},this.time);
        this.$pre_focus_el.focus();
      }
    };

    return $.each($this, function(index, el){
      var $el = $this.eq(index);
      el.$popup = new A11yPopup($el);
      return $el;
    });

  };

})(window, window.jQuery);