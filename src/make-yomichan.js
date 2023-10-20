const { readFileSync, writeFileSync, createWriteStream, readdir, existsSync, unlinkSync, readdirSync } = require('fs');
const date = require('date-and-time');
const now = new Date();
const archiver = require('archiver');
const path = require('path');

const currentDate = date.format(now, 'MMM-DD-YYYY');

const lemmaDict = JSON.parse(readFileSync('data/tidy/serbocroatian-lemmas.json'));
const formDict = JSON.parse(readFileSync('data/tidy/serbocroatian-forms.json'));
// const popularDict = JSON.parse(readFileSync('data/freq/nine-five.json'));
// const frequencies = JSON.parse(readFileSync('data/freq/hundred.json'));

const lemmaYomi = [];
const allPOS = [];

Object.entries(lemmaDict).forEach((ent) => {
  const [lemma, allInfo] = ent;

  Object.entries(allInfo).forEach((inf) => {
    const [pos, info] = inf;

    if (!allPOS.includes(pos)) allPOS.push(pos);

    const { glosses } = info;

    let tags = [pos];

    if (info['tags']) tags.push(...info['tags']);

    tags = tags.join(' ');

    let ipa = '';

    if (info['ipa']) ipa = info['ipa'];

    let popular = '';

    // if (popularDict[lemma]) popular = 'P';

    lemmaYomi.push([lemma, ipa, tags, '', 0, glosses, 0, popular]);
  });
});

const formYomi = [];

Object.entries(formDict).forEach((ent) => {
  const [form, allInfo] = ent;

  Object.entries(allInfo).forEach((inf) => {
    const [lemma, info] = inf;

    Object.entries(info).forEach((part) => {
      const [pos, glosses] = part;

      const formInfos = [];

      glosses.forEach((gloss) => {
        if (/-automated-/.test(gloss)) {
          const modifiedGloss = gloss.replace('-automated- ', '');

          formInfos.push(
            `${pos} -automated- {${form} -> ${lemma}} ${modifiedGloss} (->${lemma})`,
          );
        } else {
          formInfos.push(`${pos} {${form} -> ${lemma}} ${gloss} (->${lemma})`);
        }
      });

      formYomi.push([form, '', 'non-lemma', '', 0, formInfos, 0, '']);
    });
  });
});

const tagBank = [];

allPOS.forEach((pos) => {
  tagBank.push([pos, 'partOfSpeech', -3, pos, 0]);
});

tagBank.push(['masculine', 'masculine', -3, 'masculine', 0]);
tagBank.push(['feminine', 'feminine', -3, 'feminine', 0]);
tagBank.push(['neuter', 'neuter', -3, 'neuter', 0]);
tagBank.push(['P', 'popular', -10, 'popular term', 10]);

const allYomi = [...lemmaYomi, ...formYomi];

writeFileSync(
  'data/yomichan/tag_bank_1.json',
  JSON.stringify([...tagBank, ['non-lemma', 'non-lemma', -3, 'non-lemma', 0]]),
);

for (const file of readdirSync('data/yomichan/')) {
  if (file.includes('term_bank_')) unlinkSync(`data/yomichan/${file}`);
}

let bankIndex = 0;
let currBank = [];
for (let index = 0; index < allYomi.length; index++) {
  currBank.push(allYomi[index]);

  if (index === allYomi.length - 1) {
    bankIndex += 1;
    writeFileSync(`data/yomichan/term_bank_${bankIndex}.json`, JSON.stringify(currBank));
  }
  
  else if (currBank.length === 10000) {
    bankIndex += 1;
    writeFileSync(`data/yomichan/term_bank_${bankIndex}.json`, JSON.stringify(currBank));
    currBank = [];
  }
}

// writeFileSync('data/yomichan/term_bank_1.json', JSON.stringify(allYomi));

// const freqYomi = [];

// Object.entries(frequencies).forEach((entry) => {
//   const [word, count] = entry;

//   freqYomi.push([word, 'freq', count]);
// });

// writeFileSync('data/yomichan/term_meta_bank_1.json', JSON.stringify(freqYomi));

writeFileSync(
  'data/yomichan/index.json',
  JSON.stringify({
    title: "Seth's Serbo-Croatian Dictionary",
    format: 3,
    revision: currentDate,
    sequenced: true,
  }),
);

console.log("Creating dictionary zip for importing...");

if (existsSync(__dirname + 'data/yomichan/dictionary.zip')) {
  unlinkSync(__dirname + 'data/yomichan/dictionary.zip');
}

// Directory path
const directoryPath = path.join(__dirname, 'data/yomichan');

// Create a new ZIP archive
const archive = archiver('zip', { zlib: { level: 9 } });

// Output ZIP file path
const outputFilePath = path.join(directoryPath, 'dictionary.zip');

// Create write stream for the output file
const output = createWriteStream(outputFilePath);

// Event listener for when the ZIP archive is finalized
output.on('close', () => {
  console.log('Saved "dictionary.zip". Import it in Yomichan.');
});

// Event listener for error during archiving process
archive.on('error', (err) => {
  throw err;
});

// Add all .json files in the directory to the archive
readdir(directoryPath, (err, files) => {
  if (err) {
    throw err;
  }

  const jsonFiles = files.filter((file) => path.extname(file) === '.json');

  jsonFiles.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    archive.file(filePath, { name: file });
  });

  // Finalize the archive
  archive.finalize();
});

// Pipe the output stream to the archive
archive.pipe(output);
