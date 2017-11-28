const rp = require('../lib/replace.js');

describe('A page', () => {

  const PLUGIN_NM = 'hexo-include-markdown';
  const option = {
    dir: "spec/tpl",
    verbose: false,
  };

  it('with non-nested includes should render', (done) => {
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
Ah [AH AH!!!!!](#)


&&
    `;

    rp({content}, null, option, PLUGIN_NM).then((data) => {
      expect(data.content).toEqual(expected);
      done();
    });

  });

});
