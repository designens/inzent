;(function($) {

    $.Accordion = function(el, active) {
        this.el = el || {};
        active = active || 0;
        var that = this;
        var links = this.el.find('[class*="link"]');
        links.each(function(i){
            var link = links.eq(i);
            if (link.next().length === 0) { link.find('.fa').hide(); }
            link.on('click', { link: link }, that.dropdown);
        });
        if (active > 0) {
           links.eq(active - 1).trigger('click');
        }
    }
    // 아코디언 설정
    $.Accordion.prototype.dropdown = function(e) {
        e.preventDefault();
        var $this = e.data.link;
        $this.parent()
            .siblings('.open').find('[class*="sub"]').slideUp()
        .addBack().removeClass('open');
        $this.parent()
            .toggleClass('open')
            .find('[class*="sub"]').stop().slideToggle();
    };
    
}(window.jQuery));