const rp = require('../lib/replace.js');

describe('A page', () => {

  const PLUGIN_NM = 'hexo-include-markdown';
  const option = {
    dir: 'spec/tpl',
    verbose: false,
  };

  it('with an include should render', (done) => {
    const content = `
$$
<!-- md inc1.md -->
&&
    `;

    const expected = `
$$
The **first** include

&&
    `;

    rp({content}, null, option, PLUGIN_NM).then((data) => {
      expect(data.content).toEqual(expected);
      done();
    });
  });


  it('with multiple includes should render', (done) => {
    const content = `
$$
<!-- md inc1.md -->
--
<!-- md inc3.md -->
&&
    `;

    const expected = `
$$
The **first** include

--
The [third](#) include

&&
    `;

    rp({content}, null, option, PLUGIN_NM).then((data) => {
      expect(data.content).toEqual(expected);
      done();
    });
  });


  it('with a broken include link should throw', (done) => {
    const content = '<!-- md broken.md -->';
    rp({content}, null, option, PLUGIN_NM)
        .then(() => done(new Error('Promise should not be resolved')))
        .catch((err) => {
          expect(!!err.message.match('Could not open file')).toBe(true);
          done()
        });
  });


  it('with infinite circular includes should throw', (done) => {
    const content = '<!-- md inc4.md -->';
    rp({content}, null, option, PLUGIN_NM)
        .then(() => done(new Error('Promise should not be resolved')))
        .catch((err) => {
          expect(!!err.message.match('Too many circular inclusions')).toBe(true);
          done();
        });
  });


  it('with nested includes should render', (done) => {

    const content = `
$$
<!-- md inc1.md -->
<hr>
<!-- md inc2.md -->
&&
    `;

    const expected = `
$$
The **first** include

<hr>
The __second__ include
The [third](#) include


&&
    `;

    rp({content}, null, option, PLUGIN_NM).then((data) => {
      expect(data.content).toEqual(expected);
      done();
    });

  });

});
