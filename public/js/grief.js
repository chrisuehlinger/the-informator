$(() => {
  let $bubbles = $('.bubble');
  $('.bubble').hide();
  for(let i = 0; i < $bubbles.length; i++) {
    let $bubble = $($bubbles[i]);
    setTimeout(() => {
      $bubble.fadeIn(1000);
    }, i * 3000);
  }
});
