import { describe, expect, it } from 'vitest';
import { EDITABLE_TEMPLATES } from '../data/templates';
import { ProjectMetadata } from '../types/editor';

describe('Project Serialization & Template Integrity', () => {
  it('validates all built-in templates have valid structure and objects', () => {
    expect(EDITABLE_TEMPLATES.length).toBeGreaterThan(0);

    for (const tmpl of EDITABLE_TEMPLATES) {
      expect(tmpl.id).toBeTruthy();
      expect(tmpl.name).toBeTruthy();
      expect(tmpl.width).toBeGreaterThan(0);
      expect(tmpl.height).toBeGreaterThan(0);
      expect(tmpl.background).toBeDefined();
      expect(Array.isArray(tmpl.objects)).toBe(true);

      for (const obj of tmpl.objects) {
        expect(obj.id).toBeTruthy();
        expect(obj.type).toMatch(/^(text|shape|image|sticker)$/);
        expect(typeof obj.x).toBe('number');
        expect(typeof obj.y).toBe('number');
        expect(obj.width).toBeGreaterThan(0);
        expect(obj.height).toBeGreaterThan(0);
      }
    }
  });

  it('serializes and deserializes a project without losing layers or properties', () => {
    const sample = EDITABLE_TEMPLATES[0];
    const json = JSON.stringify(sample);
    const parsed = JSON.parse(json) as ProjectMetadata;

    expect(parsed.id).toBe(sample.id);
    expect(parsed.name).toBe(sample.name);
    expect(parsed.width).toBe(sample.width);
    expect(parsed.height).toBe(sample.height);
    expect(parsed.objects.length).toBe(sample.objects.length);
  });
});
