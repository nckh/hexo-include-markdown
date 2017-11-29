'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);
const tagMatchRegExp = /\<\!\-\-\s+?md\s+?.+?\s+?\-\-\>/g;

module.exports = async (data, hexo, option, PLUGIN_NM) => {
  const tags = data.content.match(tagMatchRegExp);
  if (tags) {
    return replace(data, option, PLUGIN_NM);
  } else {
    // clear cache data
    data.hexoIncludeMarkdown = {markdown: []};
    return data;
  }
};

const replace = async (data, option, PLUGIN_NM) => {
  const tags = data.content.match(tagMatchRegExp);
  const tagInfosPromises = [];
  tags.forEach((tag) => {
    const promise = loadIncludeFile([tag, option, data.source, PLUGIN_NM]);
    tagInfosPromises.push(promise);
  });

  const res = await Promise.all(tagInfosPromises);
  if (!res || !res.length) return;
  for (let r of res) {
    data.content = data.content.replace(r[0], r[1]);

    // save cache data
    data.hexoIncludeMarkdown = data.hexoIncludeMarkdown || {markdown: []};
    data.hexoIncludeMarkdown.markdown.push(r[2]);
  }
  return data;
};

const loadIncludeFile = async (res) => {
  const m = res[0];
  const option = res[1];
  const source = res[2];
  const PLUGIN_NM = res[3];

  const tags = m.match(/\<\!\-\-\s+?md\s+?(.+?)\s+?\-\-\>/);

  if (tags && tags.length >= 2) {

    let mdPath = '';

    if (tags[1].match(/^(\"|\')/) && tags[1].match(/(\"|\')$/)) {
      mdPath = tags[1].replace(/^(\"|\')/, '').replace(/(\"|\')$/, '');
    } else {
      const mdPathArr = tags[1].split(' ');
      mdPath = mdPathArr[Math.floor(Math.random() * mdPathArr.length)];
    }

    const filePath =
        path.join(process.env.PWD || process.cwd(), option.dir, mdPath);

    let fileData;
    try {
      fileData = await readFile(filePath);
    } catch (err) {
      throw new Error(`[${PLUGIN_NM}] Could not open file. \n -> (file): ${filePath}\n    (message): ${err}`);
    }

    if (option.verbose) {
      console.log(`[${PLUGIN_NM}] This tag will be converted normally. \n -> (file): ${source}\n    (data): ${m}`);
    }

    try {
      const st = await stat(filePath);
      return [m, fileData, {path: filePath, mtime: String(st.mtime)}];
    } catch (err) {
      throw new Error(err);
    }

  } else {
    throw new Error(`[${PLUGIN_NM}] The format of the tag is incorrect. \n -> (file): ${source}\n    (data): ${m}`);
  }
};
