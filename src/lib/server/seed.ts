import { bookmark } from './sqlite.util';

(async () => {
  bookmark.create({
    title: 'Is .css a bad idea? Is inlining the way forward? | HTTP 203',
    url: 'https://www.youtube.com/watch?v=3sMflOp5kiQ',
    desc: 'Ada (from Samsung Internet) and Jake (not from Samsung Internet) chat about issues with managing CSS, and whether external resources make it harder to build ...',
  });

  // await sleep(1);
})();
