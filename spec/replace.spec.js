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
        .catch(() => done());
  });


  xit('with nested includes should render', (done) => {

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
Ah [AH AH!!!!!](#)


&&
    `;

    rp({content}, null, option, PLUGIN_NM).then((data) => {
      expect(data.content).toEqual(expected);
      done();
    });

  });

});
