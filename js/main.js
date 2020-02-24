function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function blobToFile(blob, fileName){
    blob.lastModifiedDate = new Date();
    blob.name = fileName;
    return blob;
}


const getFiles = function (fileNames) {

    $('.image-cell').css('background-image', '');
    $('#sampleContainer .image-cell').html("<i class=\"fa fa-spinner fa-spin fa-lg\"></i>");


    $('#resultContainer').html('');
    $('#resultContainer').append("<div class=\"guide\" id=\"guide\">Click on an image</div>");

    let proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    const names = getRandom(fileNames, 10);

    const promises = [];
    names.forEach((name) => {
      promises.push(fetch(proxyUrl + `https://imagesearchdelvify.s3.amazonaws.com/${name}`)
          .then(res=>{
              return res.blob()
          })
          .then(blob => {
              return Promise.resolve({
                  id: name.split('.')[0],
                  url: `https://imagesearchdelvify.s3.amazonaws.com/${name}`,
                  file: new File([blob], name),
              });
          }));
  });
  Promise.all(promises)
      .then((images) => {
          $('#sampleContainer').html('');
          images.forEach((image) => {
              $('#sampleContainer').append("" +
                  "<div class=\"image-cell-container\" id='" + image.id + "'>\n" +
                  "    <div class=\"image-cell\" style=\"background-image: url('" + image.url + "')\"></div>\n" +
                  "</div>"
              );

              $(`#${image.id}`).on('click', function () {
                  $('#sampleContainer .image-cell-container').removeClass('active');
                  $(this).addClass('active');

                  $('#resultContainer').html('');
                  for (let i = 0; i < 5; i++) {
                      $('#resultContainer').append("" +
                          "<div class=\"image-cell-container\">\n" +
                          "    <div class=\"image-cell\" style=\"background-image: url('');\"><i class=\"fa fa-spinner fa-spin fa-lg\"></i></div>\n" +
                          "</div>")
                  }

                  if ($('#resultContainer').hasClass('slick-initialized')) {
                      $('.result-container').slick('unslick');
                  }
                  initSlick();

                  var formData = new FormData();
                  formData.append('file', image.file);


                  let req = new XMLHttpRequest();

                  req.onreadystatechange = function(e) {
                      if (req.status == 200) {
                          const result = JSON.parse(req.responseText);
                          $('#resultContainer').html('');
                              const skus = result.skus;
                              for (let i = 0; i < 10; i++) {
                                  const imageUrl = "https://imagesearchdelvify.s3.amazonaws.com/" + skus[i];
                                  $('#resultContainer').append("" +
                                      "<div class=\"image-cell-container\">\n" +
                                      "    <div class=\"image-cell\" style=\"background-image: url('" + imageUrl + "');\"></div>\n" +
                                      "</div>")
                              }

                              if ($('#resultContainer').hasClass('slick-initialized')) {
                                  $('.result-container').slick('unslick');
                              }
                              initSlick();
                      }
                  };

                  req.open("POST", 'http://ubuntu@ec2-18-162-113-148.ap-east-1.compute.amazonaws.com:5000/get_imageskus/');
                  req.send(formData);
              });
          });
      });
};

function initSlick() {
    $('.result-container').slick({
        infinite: true,
        speed: 300,
        slidesToShow: 5,
        slidesToScroll: 5,
        arrows: true,
        appendArrows: $('.wrap-result-container'),
        prevArrow:'<button class="arrow-slick2 prev-slick2"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
        nextArrow:'<button class="arrow-slick2 next-slick2"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
    });
}

$(document).ready(function(){
    let fileNames = [];

    fetch('./assets/data/skuslist.txt')
        .then(response => {
            return response.text();
        })
        .then(text => {
            fileNames = text.split(',');
            return getFiles(fileNames);
        });


    for (let i = 0; i < 10; i++) {
        $('#sampleContainer').append("" +
            "<div class=\"image-cell-container\">\n" +
            "    <div class=\"image-cell\"><i class=\"fa fa-spinner fa-spin fa-lg\"></i></div>\n" +
            "</div>"
        );
    }

    $('#refreshBtn').on('click', function () {
        if (fileNames.length > 0) {
            getFiles(fileNames);
        }
    });
});