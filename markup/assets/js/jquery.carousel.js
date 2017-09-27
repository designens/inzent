(function(global, $) {
    'use strict';

    // 기본 값 설정
    var defaults = {
        // 초기 활성화 인덱스 (1부터 시작)
        active: 1,
        // 인디케이터 표시 여부
        indicator: false,
        // 내비게이션 버튼 표시 여부
        nav_btn: true,
        // 토글 애니메이션 버튼 표시 여부
        toggle_btn: true,
        // 애니메이션 활성화 여부
        animate: false,
        // 애니메이션 지속 시간 설정
        duration: 3000,
        // 애니메이션 이징 설정
        easing: 'swing'
    };

    var template_indicators = [
        '<li role="presentation">',
        '<a href="#" role="tab">',
        '<span class="readable-hidden"></span>',
        '</a>',
        '</li>'
    ].join('');

    function readingZeroNum(idx) {
        var num = idx + 1;
        return 10 > num ? '0' + num : num;
    }

    function Carousel(el, options){
        this.$widget = el;
        this.options = options;
        this.init();
    }

    Carousel.prototype.init = function(){
        var _ = this;
        _.$tabpanel = _.$widget.children();
        _.$tablist_wrapper = $('<div class="ui-carousel__tablist--wrapper" role="group">');
        _.$tablist = $('<ol role="tablist">');
        $.each(_.$tabpanel, function(idx) {
            var $panel = _.$tabpanel.eq(idx);
            var $tab = $(template_indicators);
            var label = $panel.attr('data-label');
            $tab.find('span').text(label || $panel.find(':header:eq(0)').text() || '슬라이드 ' + (idx + 1));
            $tab.attr('title', label || $panel.find(':header:eq(0)').text() || '슬라이드 ' + (idx + 1));
            $tab.appendTo(_.$tablist);
        });
        _.$widget.prepend(_.$tablist_wrapper);
        _.$tablist_wrapper.prepend(_.$tablist);
        if (_.options.animate) {
            // _.is_stop = false;
            // _.timeoutId = null;
            _.intervalId = null;
            _.$tablist_wrapper.prepend('<button type="button" class="ui-carousel__toggle--animate is-play" aria-label="일시정지" title="일시정지"></button>');
            _.$toggle_animate_btn = _.$tablist_wrapper.find('.ui-carousel__toggle--animate');
        }
        $.each(['prev', 'next'], function(idx, feature) {
            $('<button type="button" class="ui-carousel__button ui-carousel__button--' + feature + '">')
                .html('<span class="readable-hidden"></span>').appendTo(_.$widget);
        });
        _.$buttons = this.$widget.find('.ui-carousel__button');
        _.$widget.addClass('ui-carousel').attr({
            'role': 'region',
            'aria-label': _.$widget.attr('data-label') || _.$widget.children(':header:eq(0)').text() || '캐로셀 UI: 슬라이드 메뉴'
        });
        _.$tablist.addClass('ui-carousel__indicators');
        _.$tabs = _.$tablist.find('[role="tab"]');
        $.each(_.$tabs, function(idx) {
            var $tab = _.$tabs.eq(idx);
            var num = readingZeroNum(idx);
            var slide_id = 'ui-carousel__slide--' + num;
            $tab.attr({
                'id': 'ui-carousel__tab--' + num,
                'class': 'ui-carousel__tab',
                'aria-controls': slide_id,
                'aria-selected': false,
                'tabindex': -1
            });
            var $panel = _.$tabpanel.eq(idx);
            $panel.attr({
                'class': 'ui-carousel__tabpanel',
                'id': slide_id,
                'role': 'tabpanel',
                'aria-labelledby': 'ui-carousel__tab--'+num,
                'aria-hidden': true
            });
        });
        _.$tabpanel.wrapAll('<div class="ui-carousel__tabpanel-wrapper">');
        _.$tabpanel_wrapper = _.$tabpanel.parent();
        var len = _.$tabpanel_wrapper.children().length;
        var tabpanel_w = _.$tabpanel.width();
        _.$tabpanel_wrapper.width(tabpanel_w * len);

        if ( _.options.indicator === false ) {
            _.$widget.find('.ui-carousel__indicators').hide();
        }
        if ( _.options.nav_btn === false ) {
            _.$widget.find('.ui-carousel__button').hide();
        }
        if ( _.options.toggle_btn === false ) {
            _.$widget.find('.ui-carousel__toggle--animate').hide();
        }

        _.bind();
        _.activeTab( _.options.active );
        _.options.animate && _.play();
    };

    Carousel.prototype.bind = function(){
        var _ = this;
        $.each(_.$tabs, function(idx) {
            var $tab = _.$tabs.eq(idx);
            $tab.on('click', $.proxy(_.activeSlide, $tab, _));
            if ( _.options.animate ) {
                $tab.on('focus', function(){ 
                    _.assignToogleButtonStateStop();
                    _.stop(); 
                });
            }
        });
        $.each(_.$buttons, function(index){
           var $button = _.$buttons.eq(index);
           $button.on('click', $.proxy(_.activeTabWithButton, $button, _)); 
           if ( _.options.animate ) {
                $button.on('focus', function(){ 
                    _.assignToogleButtonStateStop();
                    _.stop(); 
                });
            }
        });
        $.each(_.$tabs, function(index){
           var $tab = _.$tabs.eq(index);
           $tab.on('keydown', $.proxy(_.activeKeyboardNavigation, $tab, _)); 
        });
        var $btn_animate = _.$widget.find('.ui-carousel__toggle--animate');
        if($btn_animate.length > 0) {
            $btn_animate.on('click', function(){
                _.toggle();
            });
        }
    };

    Carousel.prototype.activeSlide = function(_, e){
        e.preventDefault();
        var index = _.getIndex.call(this);
        _.changeStateSelect.call(this);
        _.changeStateHidden.call(this, _);
        _.$tabpanel.parent().stop().animate({
            'left': _.$tabpanel.outerWidth() * index * -1
        }, {
            easing: _.options.easing
        });
        _.updateButtonText(index);
    };

    Carousel.prototype.changeStateSelect = function() {
        this.parent().siblings().find('[role="tab"]').attr({
            'aria-selected': false,
            'tabindex': -1
        }).removeClass('active');
        this.attr({
            'aria-selected': true,
            'tabindex': 0
        }).addClass('active');
    };

    Carousel.prototype.changeStateHidden = function(_) {
        var $panel = _.$tabpanel.filter('#' + this.attr('aria-controls'));
        $panel.siblings(['aria-selected']).attr({
            'aria-hidden': true
        }).find('a').attr('tabindex', -1);
        $panel.attr({
            'aria-hidden': false
        }).find('a').removeAttr('tabindex');
    };

    Carousel.prototype.getIndex = function() {
        return Number(this.attr('aria-controls').split('--')[1]) - 1;
    };

    Carousel.prototype.activeTab = function(id) {
        var _ = this, $filter, type = $.type(id);
        if (type === 'number') {
            $filter = _.$tabs.eq(id - 1);
        } else if (type === 'string') {
            $filter = _.$tabs.filter(id);
        } else {
            return console.error('숫자 또는 선택자(문자)를 입력해주세요.');
        }
        $filter.trigger('click');
    };

    Carousel.prototype.activeTabWithButton = function(_, e) {
        var $tab = _.$tabs.filter('.active');
        var index = _.getIndex.call($tab) + 1;
        var isClickPrevBtn = this.hasClass('ui-carousel__button--prev');
        var length = _.$tabs.length;
        if (isClickPrevBtn) {
            index = --index > 0 ? index : length;
        } else {
            index = ++index <= length ? index : 1;
        }
        _.activeTab(index);
    };

    Carousel.prototype.updateButtonText = function(idx) {
        var _ = this;
        var $tab = _.$tabs.eq(idx - 1);
        var index = _.getIndex.call($tab);
        var $prevBtn = _.$buttons.filter('.ui-carousel__button--prev');
        var $nextBtn = _.$buttons.filter('.ui-carousel__button--next');
        var prevText = _.$tabs.eq(index - 1).find('span').text();
        var nextText = _.$tabs.eq(index + 1 === 3 ? 0 : index + 1).find('span').text();
        $prevBtn.find('span').text(prevText);
        $prevBtn.attr('title', prevText);
        $nextBtn.find('span').text(nextText);
        $nextBtn.attr('title', nextText);
    };

    Carousel.prototype.activeKeyboardNavigation = function(_, e) {
        var key = e.keyCode;
        var $tab = _.$tabs.filter('.active');
        var index = _.getIndex.call($tab) + 1;
        var length = _.$tabs.length;
        if (key === 37 || key === 38) {
            index = --index > 0 ? index : length;
        } else if (key === 39 || key === 40) {
            index = ++index <= length ? index : 1;
        } else {
            return;
        }
        _.activeTab(index);
        _.$tabs.filter('.active').focus();
    };

    Carousel.prototype.play = function(){
        var _ = this;
        _.intervalId = global.setInterval(function(){
            _.$buttons.filter('.ui-carousel__button--next').trigger('click');
        }, _.options.duration);
    };

    Carousel.prototype.stop = function(){
        global.clearInterval(this.intervalId);
    };

    Carousel.prototype.toggle = function(){
        if ( this.$toggle_animate_btn.hasClass('is-play') ) {
            this.assignToogleButtonStateStop();
            this.stop();  
        } else {
            this.assignToogleButtonStatePlay();
            this.play();  
        }
    };

    Carousel.prototype.assignToogleButtonStateStop = function(){
        this.$toggle_animate_btn.attr({
            'title': '재생',
            'aria-label': '재생'
        })
        .removeClass('is-play');
    };

    Carousel.prototype.assignToogleButtonStatePlay = function(){
        this.$toggle_animate_btn.attr({
            'title': '일시정지',
            'aria-label': '일시정지'
        })
        .addClass('is-play');
    };


    // ------------------------------------------------------------------------------------


    $.fn.carousel = function(options) {
        var settings = $.extend({}, defaults, options);
        var _ = this;
        return $.each(_, function(index, el) {
            var widget = _.eq(index);
            var carousel = new Carousel(widget, settings);
            widget.data('carousel', carousel);
            return widget;
        });
    };

})(this, this.jQuery);