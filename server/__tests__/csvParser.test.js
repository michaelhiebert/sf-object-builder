import fs from 'fs';
import os from 'os';
import path from 'path';
import defaultParser, { csvParser } from '../utils/csvParser.js';

describe('csvParser', () => {
  let filePath;

  beforeEach(() => {
    // create a unique temp file for each test
    filePath = path.join(os.tmpdir(), `test_csv_${Date.now()}.csv`);
  });

  afterEach(() => {
    // clean up temp file
    try { fs.unlinkSync(filePath) } catch {}
  });

  it('parses a valid CSV and returns records', () => {
    const csv = [
      'Field API Name,Field Label,Data Type,Help Text,Required,Unique,Case Sensitive,External ID,Picklist Options',
      'Foo__c,Foo Label,text,Some help,true,false,false,false,',
    ].join('\n');
    fs.writeFileSync(filePath, csv, 'utf8');

    const records = csvParser(filePath);
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      'Field API Name': 'Foo__c',
      'Field Label': 'Foo Label',
      'Data Type': 'text',
      'Help Text': 'Some help',
      'Required': 'true',
      'Unique': 'false',
      'Case Sensitive': 'false',
      'External ID': 'false',
      'Picklist Options': ''
    });

    // default export alias
    const aliasRecords = defaultParser.parseFile(filePath);
    expect(aliasRecords).toEqual(records);
  });

  it('throws when Field API Name does not end with __c', () => {
    const csv = [
      'Field API Name,Field Label,Data Type,Help Text,Required,Unique,Case Sensitive,External ID,Picklist Options',
      'BadName,Bad Label,text,Help,true,false,false,false,',
    ].join('\n');
    fs.writeFileSync(filePath, csv, 'utf8');

    expect(() => csvParser(filePath))
      .toThrow(/Field API Name.*must end with '__c'/);
  });

  it('throws when picklist type is missing options', () => {
    const csv = [
      'Field API Name,Field Label,Data Type,Help Text,Required,Unique,Case Sensitive,External ID,Picklist Options',
      'Pick__c,Pick Label,picklist,Help,true,false,false,false,',
    ].join('\n');
    fs.writeFileSync(filePath, csv, 'utf8');

    expect(() => csvParser(filePath))
      .toThrow(/Picklist Options.*must be provided/);
  });

  it('throws when boolean fields are invalid', () => {
    const csv = [
      'Field API Name,Field Label,Data Type,Help Text,Required,Unique,Case Sensitive,External ID,Picklist Options',
      'Foo__c,Foo,text,Help,yes,false,false,false,',
    ].join('\n');
    fs.writeFileSync(filePath, csv, 'utf8');

    expect(() => csvParser(filePath))
      .toThrow(/'Required' must be 'true' or 'false'/);
  });
});
