import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isBinaryByExtension, isBinaryByContent, isTextFile } from '../../src/filters/binary.js';

describe('isBinaryByExtension', () => {
  it('should detect image extensions as binary', () => {
    assert.equal(isBinaryByExtension('photo.png'), true);
    assert.equal(isBinaryByExtension('logo.jpg'), true);
    assert.equal(isBinaryByExtension('icon.gif'), true);
  });

  it('should detect archive extensions as binary', () => {
    assert.equal(isBinaryByExtension('archive.zip'), true);
    assert.equal(isBinaryByExtension('backup.tar.gz'), true);
  });

  it('should detect executable extensions as binary', () => {
    assert.equal(isBinaryByExtension('app.exe'), true);
    assert.equal(isBinaryByExtension('lib.so'), true);
  });

  it('should return false for code/config extensions', () => {
    assert.equal(isBinaryByExtension('app.js'), false);
    assert.equal(isBinaryByExtension('config.yaml'), false);
    assert.equal(isBinaryByExtension('.env'), false);
    assert.equal(isBinaryByExtension('secret.conf'), false);
  });
});

describe('isBinaryByContent', () => {
  it('should return false for empty buffer', () => {
    assert.equal(isBinaryByContent(Buffer.alloc(0)), false);
  });

  it('should return false for pure text', () => {
    const text = Buffer.from('Hello World\nThis is a text file.\n');
    assert.equal(isBinaryByContent(text), false);
  });

  it('should return true for pure binary (random bytes)', () => {
    const binary = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
    assert.equal(isBinaryByContent(binary), true);
  });

  it('should return true when >30% non-text bytes', () => {
    // 4 text bytes + 4 binary bytes = 50% binary
    const mixed = Buffer.from([
      0x48, 0x65, 0x00, 0x01, 0x6C, 0x6C, 0x02, 0x03,
    ]);
    assert.equal(isBinaryByContent(mixed), true);
  });

  it('should return false when <30% non-text bytes', () => {
    // Lots of text + few binary bytes
    const mostlyText = Buffer.from([...Array(100).fill(0x41), 0x00, 0x01, 0x02]);
    assert.equal(isBinaryByContent(mostlyText), false);
  });
});

describe('isTextFile', () => {
  it('should reject binary extensions regardless of content', () => {
    const pngContent = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
    assert.equal(isTextFile('image.png', pngContent), false);
  });

  it('should accept text files', () => {
    const textContent = Buffer.from('SECRET_KEY=abc123\n');
    assert.equal(isTextFile('config.env', textContent), true);
  });
});