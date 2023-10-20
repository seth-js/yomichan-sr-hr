const { writeFileSync } = require('fs');

const LineByLineReader = require('line-by-line'),
  lr = new LineByLineReader('data/kaikki/kaikki.org-dictionary-SerboCroatian.json');

const lemmaDict = {};
const formDict = {};

const formStuff = [];
const automatedForms = {};

const blacklistedTags = [
  'table-tags',
  'canonical',
  'auxiliary',
  'class',
  'error-unknown-tag',
  'inflection-template'
];

const tagOrder = {
  cases: ['nominative', 'genitive', 'dative', 'accusative', 'vocative', 'locative', 'instrumental'],
  persons: ['first-person', 'second-person', 'third-person'],
  numbers: ['singular', 'plural', 'plural-only'],
  definitiveness: ['definite', 'indefinite'],
  genders: ['masculine', 'feminine', 'neuter', 'common-gender'],
  animacy: ['inanimate', 'animate'],
  comparativeForms: ['comparative', 'positive', 'superlative'],
  modifiers: ['adjective', 'noun-from-verb', 'infinitive', 'adverbial', 'emphatic', 'imperfective',
    'perfective', 'imperative', 'participle', 'relational', 'lowercase', 'diminutive', 'poetic', 'regional',
    'rare', 'uppercase', 'augmentative', 'archaic', 'with-genitive'],
  tenses: ['present', 'past', 'future', 'future-i', 'future-ii', 'perfect', 'pluperfect', 'aorist', 'imperfect',
    'conditional', 'conditional-i', 'conditional-ii'],
  verbForms: ['active', 'passive'],
  misc: ['Cyrillic', 'Montenegro', 'collective', 'alternative', 'romanization'],
};

const tagOrderAll = [];

for (const tags of Object.values(tagOrder)) {
  tagOrderAll.push(...tags);
}

// const uniqueTags = [];

lr.on('line', (line) => {
  if (line) {
    const data = JSON.parse(line);

    const { word, pos, senses, sounds, forms, head_templates } = data;
    
    const extraInfo = [];
    
    if (head_templates && head_templates.length > 0) {
      const { expansion } = head_templates[0];
      
      // add diacritic form for certain words that have the difference
      if (head_templates[0]['args']['head'] && word !== head_templates[0]['args']['head']) {
        const diacriticWord = head_templates[0]['args']['head'];
        formDict[diacriticWord] = {};
        formDict[diacriticWord][word] = {};
        formDict[diacriticWord][word][pos] = ['diacritic form'];
      }

      if (expansion) {
        if (/ m /.test(expansion)) extraInfo.push('masculine');
        if (/ f /.test(expansion)) extraInfo.push('feminine');
        if (/ n /.test(expansion)) extraInfo.push('neuter');
        if (/ impf /.test(expansion)) extraInfo.push('imperfective');
        if (/ pf /.test(expansion)) extraInfo.push('perfective');
      }
    }

    if (forms) {
      forms.forEach((ent) => {
        const { form, tags } = ent;

        if (form && tags) {
          let isBlaclisted = false;

          tags.forEach((tag) => {
            if (blacklistedTags.includes(tag)) isBlaclisted = true;
          });


          if (!isBlaclisted) {
            // for (const tag of tags) {
            //   if (!uniqueTags.includes(tag)) uniqueTags.push(tag);
            // }

            tags.sort((a, b) => {
              const indexA = tagOrderAll.indexOf(a);
              const indexB = tagOrderAll.indexOf(b);
              return indexA - indexB;
            });

            if (!automatedForms[form]) automatedForms[form] = {};
            if (!automatedForms[form][word]) automatedForms[form][word] = {};
            if (!automatedForms[form][word][pos])
              automatedForms[form][word][pos] = [];

            automatedForms[form][word][pos].push(tags.join(' '));
          }
        }
      });
    }

    let ipa = '';

    if (sounds) {
      sounds.forEach((sound) => {
        const soundIPA = sound['ipa'];

        if (soundIPA && !ipa) {
          ipa = soundIPA;
        }
      });
    }

    senses.forEach((sense) => {
      const { glosses, form_of } = sense;

      let { raw_glosses } = sense;

      if (glosses && !raw_glosses) raw_glosses = [...glosses];

      const tags = [];

      // serbo-croatian is missing gender in tags

      // if (sense['tags']) {
      //   sense['tags'].forEach((tag) => {
      //     if (tag === 'masculine') tags.push(tag);
      //     if (tag === 'feminine') tags.push(tag);
      //     if (tag === 'neuter') tags.push(tag);
      //   });
      // }

      if (extraInfo.length > 0) tags.push(...extraInfo);

      if (raw_glosses) {
        if (form_of) {
          formStuff.push([word, sense, pos]);
        } else {
          if (!lemmaDict[word]) lemmaDict[word] = {};

          if (!lemmaDict[word][pos]) lemmaDict[word][pos] = {};

          if (ipa && !lemmaDict[word][pos]['ipa'])
            lemmaDict[word][pos]['ipa'] = ipa;

          if (!lemmaDict[word][pos]['glosses'])
            lemmaDict[word][pos]['glosses'] = [];

          lemmaDict[word][pos]['glosses'].push(...raw_glosses);

          if (tags) {
            if (!lemmaDict[word][pos]['tags'])
              lemmaDict[word][pos]['tags'] = [];

            tags.forEach((tag) => {
              if (!lemmaDict[word][pos]['tags'].includes(tag))
                lemmaDict[word][pos]['tags'].push(tag);
            });
          }
        }
      }
    });
  }
});

function handleForm(stuff, form, glosses, pos, lemma) {
  let { raw_glosses } = stuff;

  if (glosses && !raw_glosses) raw_glosses = [...glosses];

  const newGlosses = [];

  // fixes inflection kaikki dump problem for serbo-croatian
  if (JSON.stringify(raw_glosses).includes("##")) {
    const [gloss] = raw_glosses;

    newGlosses.push(...gloss.replace(/.+:\n/, '').replace(/##\s/g, '').split('\n'));
    if (newGlosses.length > 0) raw_glosses = [...newGlosses];
  }

  if (!formDict[form]) formDict[form] = {};
  if (!formDict[form][lemma]) formDict[form][lemma] = {};
  if (!formDict[form][lemma][pos]) formDict[form][lemma][pos] = [];

  if (newGlosses.length > 0) {
    for (const gloss of newGlosses) {
      if (!formDict[form][lemma][pos].includes(gloss)) {
        formDict[form][lemma][pos].push(gloss);
        break;
      }
    }
  } else {
    const [formInfo] = raw_glosses;
    formDict[form][lemma][pos].push(formInfo);
  }
}

lr.on('end', () => {
  formStuff.forEach((stuff) => {

    const [form, info, pos] = stuff;

    const { glosses, form_of, links } = info;

    // solve form accent problem (žèljeti vs željeti, raznéžiti vs raznežiti)
    if (links) {
      const noAccentWord = links[0][1].replace(/#.+/, '');

      if (noAccentWord !== form_of[0]['word']) {
        handleForm(stuff, form, glosses, pos, noAccentWord);
      }
    }

    const lemma = form_of[0]['word'];

    handleForm(stuff, form, glosses, pos, lemma);
  });

  let missingForms = 0;

  Object.entries(automatedForms).forEach((ent) => {
    const [form, info] = ent;

    if (!formDict[form]) {
      missingForms += 1;

      // avoid forms that incorrectly point to a shit ton of lemmas
      if (Object.entries(info).length < 5) {
        Object.entries(info).forEach((inf) => {
          const [lemma, parts] = inf;

          Object.entries(parts).forEach((part) => {
            const [pos, glosses] = part;

            if (!formDict[form]) formDict[form] = {};
            if (!formDict[form][lemma]) formDict[form][lemma] = {};
            if (!formDict[form][lemma][pos]) formDict[form][lemma][pos] = [];

            let modifiedGlosses = [];

            glosses.forEach((gloss) => {
              modifiedGlosses.push(`-automated- ${gloss}`);
            });

            formDict[form][lemma][pos].push(...modifiedGlosses);
          });
        });
      }
    }
  });

  console.log(
    `There were ${missingForms} missing forms that have now been automatically populated.`,
  );

  // console.log(lemmaDict['ljudski']);
  // console.log(lemmaDict['biće']);
  // console.log(formDict['ljudskomu']);
  // console.log(formDict['najljudskijim']);
  // console.log(formDict['najljudskijima']);
  // console.log(formDict['bića']);
  // console.log(formDict['volim']);
  // console.log(formDict['nove']);
  // console.log(lemmaDict['ablender']);
  // console.log(lemmaDict['ljekarna']);
  // console.log(lemmaDict['kino']);
  // console.log(formDict['firme']);
  // console.log(formDict['nov']);
  // console.log(formDict['želim']);
  // console.log(lemmaDict['žèljeti']);
  // console.log(lemmaDict['željeti']);
  // console.log(lemmaDict['žèleti']);
  // console.log(lemmaDict['želeti']);
  // console.log(formDict['dȅvet']);

  writeFileSync('data/tidy/serbocroatian-lemmas.json', JSON.stringify(lemmaDict));
  writeFileSync('data/tidy/serbocroatian-forms.json', JSON.stringify(formDict));

  console.log('Done.');
});
