;(function($) {

    var tabs = $(".tablist [role='tab']"),
        panels = $(".panel-group [role='tabpanel']");

    // 접근성 선택/해제
    tabs.attr("aria-selected", "false");
    tabs.first().attr("aria-selected", "true");

    // 접근성 보기/감추기
    panels.attr("aria-hidden", "true")
    panels.first().attr("aria-hidden", "false");

    // 마우스 접근
    tabs.click(function(ev) {
        ev.preventDefault();
        tabs.attr("aria-selected", "false");
        $(this).attr("aria-selected", "true");
        var tabpanid = $(this).attr("aria-controls");
        var tabpan = $("#" + tabpanid);
        $(panels).attr("aria-hidden", "true");
        tabpan.attr("aria-hidden", "false");
    });

    // 키보드 접근
    tabs.keydown(function(ev) {
        // Enter 키
        if (ev.which == 13) {
            $(this).click();
        }
    });

    tabs.keydown(function(ev) {
        // ev.preventDefault();
        var _this, selected, index, length, tab, tabpanid, tabpan;
        var key = ev.keyCode;
        var dir = 0;
        var left = key === 37;
        var right = key === 39;
        if (left) { dir = -1; }
        if (right){ dir = 1;  }
        if (left || right) {
            _this = $(this);
            selected = _this.attr("aria-selected");
            if (selected === "true") {
                tabs.filter("[aria-selected='true']").attr("aria-selected","false");
                index = _this.index() + dir;
                length = tabs.length;
                if ( index < 0 ) { index = length - 1; }
                if ( index >= length ) { index = 0; }
                tab = tabs.eq(index).attr("aria-selected", "true").focus();
                tabpanid = tab.attr("aria-controls");
                tabpan = $("#" + tabpanid);
                panels.attr("aria-hidden", "true");
                tabpan.attr("aria-hidden", "false");
            }
        }
    });
    
}(window.jQuery));