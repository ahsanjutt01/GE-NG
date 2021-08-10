export function dealsCarousel() {
  $('.owl-carousel').owlCarousel({
    loop: true,
    margin: 0,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    responsiveClass: true,
    // animateOut: 'fadeOut',
    responsive: {
      320: {
        items: 1,
        nav: false,
        loop: true,
        margin: 0
      }
    }
  });
}

// ================================================NAVBAR==============================================================================
export function closeProdModal() {
  if ($('.modal.show').length) {
    $(function () {
      $('#bottom_modal').modal('toggle');
    });
  }

}
export function sidebarCheckoutClose() {
  $('#sidebar-cart').removeClass('active');
  $('.overlay').removeClass('active');
  $('body').removeClass('no-scroll');
}
export function sidebarClose() {
  $('#sidbar-2').removeClass('active');
  $('.overlay').removeClass('active');
  $('body').removeClass('no-scroll');
}

export function accountSidebarClose() {
  $('#sidbar-3').removeClass('active');
  $('.overlay').removeClass('active');
  $('body').removeClass('no-scroll');
}

export function filtersSideBarClose() {
  $('#sidbar-1').removeClass('active');
  $('.overlay').removeClass('active');
  $('body').removeClass('no-scroll');
}

export function menu_hover_init() { }
// const $dropdown = $('.dropdown');
// const $dropdownToggle = $('.dropdown-toggle');
// const $dropdownMenu = $('.dropdown-menu');
// const showClass = 'show';

// menu hover script
// $(window).on('load resize', function () {
// $(".dropdown").hover(function () {
//   var dropdownMenu = $(this).children(".dropdown-menu");
//   if (dropdownMenu.is(":visible")) {
//     dropdownMenu.parent().toggleClass("show");
//     $(this).children(".dropdown-menu").toggleClass('show');
//   }
// });
// if (this.matchMedia('(min-width: 768px)').matches) {

// $dropdown.hover(
//   function () {
//     const $this = $(this);
//     $this.addClass(showClass);
//     $this.find($dropdownToggle).attr('aria-expanded', 'true');
//     $this.find($dropdownMenu).addClass(showClass);
//   },
//   function () {
//     const $this = $(this);
//     $this.removeClass(showClass);
//     $this.find($dropdownToggle).attr('aria-expanded', 'false');
//     $this.find($dropdownMenu).removeClass(showClass);
//   }
// );
// } else {
// $dropdown.off('mouseenter mouseleave');
// }
// });
// }

// ================================================END NAVBAR==============================================================================

// ================================================PRODUCT LIST==============================================================================

export function navbarDropdownMenu() {
  setTimeout(function () {
    let x = document.getElementsByClassName("dropdown-menu show");
    if (x.length > 0) {
      x[0].classList.remove("show");
    }

    let y = document.getElementsByClassName("nav-item dropdown position-static");

    if (y.length > 0) {
      y[0].classList.remove("show");
    }
  }, 10);
  // let x = document.getElementsByClassName("dropdown-menu show");
  // if (x.length > 0) { x[0].classList.remove("show"); }
  // $('.in,.open').removeClass('in open');
}
export function owl_Sub_Category() {
  $('.owl-carousel').owlCarousel({
    margin: 10,
    dots: false,
    nav: true,
    autoWidth: true,
    autoplay: false,
    navigationText: [
      '<i class=\'icon-chevron-left icon-white\'><</i>',
      '<i class=\'icon-chevron-right icon-white\'>></i>'],
    responsive: {
      0: {
        items: 2
      },
      375: {
        items: 3
      },
      600: {
        items: 3
      },
      1200: {
        items: 8
      },
      1600: {
        items: 12
      }
    }
  });
}

export function stickySearchExclusiveDeal() {
  let Headerfix = document.getElementById("stickySearchshow");
  var myScrollFunc = function () {
    var y = window.scrollY;
    if (y >= 500) {
      Headerfix.className = "stickySearch-show down"
    } else {
      Headerfix.className = "stickySearch-show up"
    }

  };

  window.addEventListener("scroll", myScrollFunc);

}

export function dropdownSearch() {
  $(function () {
    $('.selectpicker').selectpicker();
  });
}

export function copyToClipBoard(url) {
  copy(url);
}

// export function priceRange_init(rangeMin, rangeMax) {
//   const doubleHandleSlider = document.querySelector('.double-handle-slider');
//   var minValInput = document.querySelector('.min-value');
//   var maxValInput = document.querySelector('.max-value');
//   noUiSlider.create(doubleHandleSlider, {
//     start: [0, 10000],
//     connect: true,
//     tooltips: true,
//     step: 1,
//     range: {
//       min: [rangeMin],
//       max: [rangeMax]
//     },
//     format: {
//       to(value) {
//         return value;
//       },
//       from(value) {
//         return value;
//       }
//     },
//     pips: {
//       mode: 'values',
//       values: [0, 250, 500, 750, 1000,],
//       density: 10
//     }
//   });
//   doubleHandleSlider['noUiSlider'].on('change', (values, handle) => {

//     // This version updates both inputs.
//     var rangeValues = values;
//     minValInput.value = rangeValues[0];
//     maxValInput.value = rangeValues[1];

//     /*
//         // This version updates a single input on change
//         var val = values[handle]; // 0 or 1
//         if(handle) {
//           maxValInput.value = Math.round(val);
//         } else {
//           minValInput.value = Math.round(val);
//         }*/
//   });
// }

// export function priceRange_init_mobile(rangeMin, rangeMax) {
//   // price range noUiSlider 2 for mobile
//   const doubleHandleSlider = document.querySelector('.double-handle-slider-mob');

//   const minValInput1 = document.querySelector('.min-value1');
//   const maxValInput2 = document.querySelector('.max-value2');

//   noUiSlider.create(doubleHandleSlider, {
//     start: [0, 10000],
//     connect: true,
//     tooltips: true,
//     step: 1,
//     range: {
//       min: [rangeMin],
//       max: [rangeMax]
//     },
//     format: {
//       to(value) {
//         return value;
//       },
//       from(value) {
//         return value;
//       }
//     },
//     pips: {
//       mode: 'values',
//       values: [0, 250, 500, 750, 1000,],
//       density: 10
//     }
//   });

//   // can also be on 'update' for instant update
//   doubleHandleSlider['noUiSlider'].on('change', (values, handle) => {

//     // This version updates both inputs.
//     const rangeValues = values;
//     minValInput1.value = rangeValues[0];
//     maxValInput2.value = rangeValues[1];
//   });

//   minValInput1.addEventListener('change', function () {
//     doubleHandleSlider['noUiSlider'].set([this.value, null]);
//   });

//   maxValInput2.addEventListener('change', function () {
//     doubleHandleSlider['noUiSlider'].set([null, this.value]);
//   });

// }

// ================================================END PRODUCT LIST==============================================================================

export function showModal(mdalId) {
  $(`#${mdalId}`).modal('show');
}
