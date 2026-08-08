#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const files = {
  tracker: 'PROJECT_TRACKER.md',
  history: 'PROJECT_HISTORY.md',
  issues: 'docs/project-tracker/ISSUES.md',
  solutions: 'docs/project-tracker/SOLUTIONS.md',
  improvements: 'docs/project-tracker/IMPROVEMENTS.md',
};

const errors = [];

function fail(message) {
  errors.push(message);
}

function read(relativePath) {
  const absolute = resolve(root, relativePath);
  if (!existsSync(absolute)) {
    fail(`Eksik takip dosyası: ${relativePath}`);
    return '';
  }
  return readFileSync(absolute, 'utf8');
}

const texts = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, read(file)]));

function records(text, prefix) {
  const pattern = new RegExp(`^### (${prefix}-\\d{3}) — .+$`, 'gm');
  const matches = [...text.matchAll(pattern)];
  return matches.map((match, index) => ({
    id: match[1],
    body: text.slice(match.index, matches[index + 1]?.index ?? text.length),
  }));
}

function assertUniqueAndContinuous(items, prefix) {
  const ids = items.map((item) => item.id);
  const unique = new Set(ids);
  if (unique.size !== ids.length) fail(`${prefix} kimlikleri benzersiz değil.`);

  const numbers = [...unique]
    .map((id) => Number(id.slice(prefix.length + 1)))
    .sort((a, b) => a - b);
  numbers.forEach((number, index) => {
    if (number !== index + 1) fail(`${prefix} kimliklerinde sıra boşluğu var; ${prefix}-${String(index + 1).padStart(3, '0')} bekleniyor.`);
  });
}

function requireParts(item, parts) {
  for (const part of parts) {
    if (!item.body.includes(part)) fail(`${item.id} zorunlu alanı içermiyor: ${part}`);
  }
}

function idsIn(text, prefix) {
  return new Set(text.match(new RegExp(`${prefix}-\\d{3}`, 'g')) ?? []);
}

function assertKnownReferences(text, prefix, known, context) {
  for (const id of idsIn(text, prefix)) {
    if (!known.has(id)) fail(`${context} bilinmeyen ${prefix} referansı içeriyor: ${id}`);
  }
}

function assertSameSet(actual, expected, context) {
  for (const id of expected) if (!actual.has(id)) fail(`${context} içinde ${id} eksik.`);
  for (const id of actual) if (!expected.has(id)) fail(`${context} içinde beklenmeyen ${id} var.`);
}

function assertLocalLinks(relativePath, text) {
  const base = dirname(resolve(root, relativePath));
  const links = [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
  for (const link of links) {
    if (/^(?:https?:|mailto:)/.test(link) || link.startsWith('#')) continue;
    const target = decodeURIComponent(link.split('#')[0]);
    if (target && !existsSync(resolve(base, target))) fail(`${relativePath} bozuk yerel bağlantı içeriyor: ${link}`);
  }
}

const issues = records(texts.issues, 'ISS');
const solutions = records(texts.solutions, 'SOL');
const improvements = records(texts.improvements, 'IMP');

assertUniqueAndContinuous(issues, 'ISS');
assertUniqueAndContinuous(solutions, 'SOL');
assertUniqueAndContinuous(improvements, 'IMP');

for (const issue of issues) {
  requireParts(issue, [
    '- **Öncelik:**',
    '- **Önem:**',
    '- **Durum:**',
    '- **Sorumlu:**',
    '- **Oluşturma:**',
    '- **Son Güncelleme:**',
    '- **Bağımlılıklar:**',
    '#### Bulgular',
    '#### Kabul Kriterleri',
    '#### Doğrulama',
    '- [ ]',
  ]);
}

for (const solution of solutions) {
  requireParts(solution, [
    '- **Durum:**',
    '- **Sorumlu:**',
    '- **İlgili:**',
    '- **Son Güncelleme:**',
    '[Model:',
  ]);
}

for (const improvement of improvements) {
  requireParts(improvement, [
    '- **Öncelik:**',
    '- **Durum:**',
    '- **Sorumlu:**',
    '- **Son Güncelleme:**',
    '[Model:',
  ]);
}

const issueIds = new Set(issues.map((item) => item.id));
const solutionIds = new Set(solutions.map((item) => item.id));
const improvementIds = new Set(improvements.map((item) => item.id));

assertKnownReferences(texts.tracker, 'ISS', issueIds, files.tracker);
assertKnownReferences(texts.tracker, 'SOL', solutionIds, files.tracker);
assertKnownReferences(texts.solutions, 'ISS', issueIds, files.solutions);

const backlogIds = new Set(
  [...texts.tracker.matchAll(/^- \[ \] \*\*(ISS-\d{3}):?\*\*/gm)].map((match) => match[1]),
);
assertSameSet(backlogIds, issueIds, 'Backlog');

const tableIds = new Set(
  [...texts.tracker.matchAll(/^\| (ISS-\d{3}) \|/gm)].map((match) => match[1]),
);
assertSameSet(tableIds, issueIds, 'Sorun özet tablosu');

const trackerSolutionIds = idsIn(texts.tracker, 'SOL');
assertSameSet(trackerSolutionIds, solutionIds, 'Sorun özet tablosu çözüm referansları');

const issuesWithSolution = new Set();
for (const solution of solutions) {
  for (const id of idsIn(solution.body.match(/- \*\*İlgili:\*\*[^\n]*/)?.[0] ?? '', 'ISS')) {
    issuesWithSolution.add(id);
  }
}
for (const id of issueIds) {
  if (!issuesWithSolution.has(id)) fail(`${id} hiçbir çözüm önerisiyle ilişkilendirilmemiş.`);
}

const priorities = { P0: 0, P1: 0, P2: 0 };
for (const issue of issues) {
  const priority = issue.body.match(/- \*\*Öncelik:\*\* (P\d)/)?.[1];
  if (priority in priorities) priorities[priority] += 1;
}

const dashboardExpectations = [
  `| Açık sorun | ${issues.length} |`,
  `| P0 / P1 / P2 | ${priorities.P0} / ${priorities.P1} / ${priorities.P2} |`,
  `| Önerilen çözüm | ${solutions.length} |`,
  `| Geliştirme fikri | ${improvements.length} |`,
];
for (const expected of dashboardExpectations) {
  if (!texts.tracker.includes(expected)) fail(`Durum paneli güncel değil; beklenen satır: ${expected}`);
}

for (const [key, relativePath] of Object.entries(files)) {
  assertLocalLinks(relativePath, texts[key]);
}

if (errors.length) {
  console.error('Project tracker doğrulaması başarısız:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `Project tracker doğrulandı: ${issues.length} sorun, ${solutions.length} çözüm, ${improvements.length} geliştirme fikri.`,
  );
}
