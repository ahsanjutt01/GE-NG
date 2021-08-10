$(document).on('click', '#sidebar-cart-open', function () {
  $('#sidebar-cart').addClass('active');
  $('body').addClass('no-scroll');
  $('.overlay').addClass('active');
});

$(document).on('click', '#sidebar-desktop-cart-open', function () {
  $('#sidebar-cart').addClass('active');
  $('body').addClass('no-scroll');
  $('.overlay').addClass('active');
});

$(document).on('click', '#addtocart-bb', function () {
  $('#bottombar').addClass('active');
  $('body').addClass('no-scroll');
  $('.overlay').addClass('active');
});

$(document).on('click', '#category', function () {
  $('#sidbar-2').addClass('active');
  $('body').addClass('no-scroll');
  $('.overlay').addClass('active');
});

$(document).on('click', '#user-nav', function () {
  $('#sidbar-3').addClass('active');
  $('body').addClass('no-scroll');
  $('.overlay').addClass('active');
});

$(document).on('click', '#s2-close, .overlay', function () {
  $('#sidbar-2').removeClass('active');
  $('.overlay').removeClass('active');
  $('body').removeClass('no-scroll');
});

$(document).on('click', '#s3-close, .overlay', function () {
  $('#sidbar-3').removeClass('active');
  $('.overlay').removeClass('active');
  $('body').removeClass('no-scroll');
});

$(document).on('click', '#s4-close, .overlay', function () {
  $('#sidebar-cart').removeClass('active');
  $('.overlay').removeClass('active');
  $('body').removeClass('no-scroll');
});

$(document).on('click', '#bb-close, .overlay', function () {
  $('#bottombar').removeClass('active');
  $('.overlay').removeClass('active');
  $('body').removeClass('no-scroll');
});

$(document).on('click', '#p-filter', () => {
  $('#sidbar-1').addClass('active');
  $('body').addClass('no-scroll');
  $('.overlay').addClass('active');
});

$(document).on('click', '#s1-close, .overlay', () => {
  $('#sidbar-1').removeClass('active');
  $('.overlay').removeClass('active');
  $('body').removeClass('no-scroll');
});

// const $dropdown = $('.dropdown');
// const $dropdownToggle = $('.dropdown-toggle');
// const $dropdownMenu = $('.dropdown-menu');
// const showClass = 'show';

// $(window).on('load resize', function () {
//   if (this.matchMedia('(min-width: 768px)').matches) {
//     $dropdown.hover(
//       function () {
//         const $this = $(this);
//         $this.addClass(showClass);
//         $this.find($dropdownToggle).attr('aria-expanded', 'true');
//         $this.find($dropdownMenu).addClass(showClass);
//       },
//       function () {
//         const $this = $(this);
//         $this.removeClass(showClass);
//         $this.find($dropdownToggle).attr('aria-expanded', 'false');
//         $this.find($dropdownMenu).removeClass(showClass);
//       }
//     );
//   } else {
//     $dropdown.off('mouseenter mouseleave');
//   }
// });