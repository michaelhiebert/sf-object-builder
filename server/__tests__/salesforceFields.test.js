import {
    mapToSalesforceFieldType,
    buildFieldMetadata,
    buildFieldPermissions
  } from '../utils/salesforceFields.js';
  
  describe('mapToSalesforceFieldType', () => {
    it('correctly maps known types', () => {
      expect(mapToSalesforceFieldType('text')).toBe('Text');
      expect(mapToSalesforceFieldType('number')).toBe('Number');
      expect(mapToSalesforceFieldType('date')).toBe('Date');
      expect(mapToSalesforceFieldType('picklist')).toBe('Picklist');
    });
  
    it('defaults to Text for unknown or missing types', () => {
      expect(mapToSalesforceFieldType('foo')).toBe('Text');
      expect(mapToSalesforceFieldType()).toBe('Text');
    });
  });
  
  describe('buildFieldMetadata', () => {
    const objectName = 'MyObj__c';
    const base = {
      'Field API Name': 'Field__c',
      'Field Label'   : 'Field Label',
      'Data Type'     : 'text',
      'Help Text'     : 'Helps you',
      'Required'      : 'true',
      'Unique'        : 'false',
      'Case Sensitive': 'false',
      'External ID'   : 'true',
      'Picklist Options': ['A', 'B']
    };
  
    it('includes length for Text fields', () => {
      const [md] = buildFieldMetadata(objectName, [base]);
      expect(md).toMatchObject({
        fullName   : 'MyObj__c.Field__c',
        label      : 'Field Label',
        type       : 'Text',
        description: 'Helps you',
        required   : true,
        unique     : false,
        externalId : true,
        caseSensitive: false,
        length     : 255
      });
      expect(md).not.toHaveProperty('precision');
    });
  
    it('adds precision & scale for Number fields', () => {
      const numField = {...base, 'Data Type': 'number', 'Field API Name': 'Num__c'};
      const [md] = buildFieldMetadata(objectName, [numField]);
      expect(md).toMatchObject({
        type     : 'Number',
        precision: 18,
        scale    : 2
      });
    });
  
    it('adds valueSet for Picklist fields', () => {
      const pick = {...base, 'Data Type': 'picklist', 'Field API Name': 'Pick__c'};
      const [md] = buildFieldMetadata(objectName, [pick]);
      expect(md.valueSet).toBeDefined();
      expect(md.valueSet.valueSetDefinition.value).toEqual([
        { fullName: 'A', default: false, label: 'A' },
        { fullName: 'B', default: false, label: 'B' }
      ]);
    });
  });
  
  describe('buildFieldPermissions', () => {
    const objectName = 'MyObj__c';
  
    it('skips required fields and returns correct permissions', () => {
      const fields = [
        {'Field API Name': 'A__c', 'Required': 'true'},
        {'Field API Name': 'B__c', 'Required': 'false'},
        {'Field API Name': 'C__c', 'Required': false},
      ];
      const { permissions, skipped } = buildFieldPermissions(objectName, fields);
  
      expect(permissions).toEqual([
        { field: 'MyObj__c.B__c', readable: true, editable: true },
        { field: 'MyObj__c.C__c', readable: true, editable: true },
      ]);
      expect(skipped).toEqual(['A__c']);
    });
  });
  