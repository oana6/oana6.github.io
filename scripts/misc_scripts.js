$(".scroll").click(function (event) {
    event.preventDefault();
    var full_url = this.href;
    var parts = full_url.split("#");
    var trgt = parts[1];
    var target_offset = $("#" + trgt).offset();
    var target_top = target_offset.top;

    $('html, body').animate({
        scrollTop: target_top
    }, 500);
});



function clearGroup(elem) {

    var y = [1, 100];


    if (elem.id == 'ancient') {
        var y = [-500, 434];
        slider.noUiSlider.set(y);
    } else
    if (elem.id == 'medieval') {
        var y = [435, 1253];
        slider.noUiSlider.set(y);
    } else
    if (elem.id == 'renaissance') {
        var y = [1254, 1450];
        slider.noUiSlider.set(y);
    } else
    if (elem.id == 'romanticism') {
        var y = [1451, 1619];
        slider.noUiSlider.set(y);
    } else
    if (elem.id == 'modern') {
        var y = [1620, 1804];
        slider.noUiSlider.set(y);
    } else {
        var y = [1805, 1914];
        slider.noUiSlider.set(y);
    }

    var group = document.theForm.theGroup;


    for (var i = 0; i < group.length; i++) {
        if (group[i] != elem) {
            group[i].checked = false;
        }
    }
}
