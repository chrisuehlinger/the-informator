$(() => {
  for(let i=0; i<5; i++){
    setTimeout(() => {
      let amount = 600 + Math.random()*100;
      console.log('HMM', amount);
      $('html').animate({ 'scrollTop': '+=' + amount+'px' }, 500 + Math.random()*500);
    }, i * 3000);
  }
});
