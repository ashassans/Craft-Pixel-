import Dexie, { Table } from 'dexie';
import { ProjectMetadata } from '../types/editor';

export interface StoredProject {
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  data: ProjectMetadata;
}

export interface StoredAsset {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
  createdAt: number;
}

export interface StoredCustomFont {
  id: string;
  name: string;
  format: string;
  dataUrl: string;
  createdAt: number;
}

class CraftPixelDatabase extends Dexie {
  projects!: Table<StoredProject, string>;
  assets!: Table<StoredAsset, string>;
  customFonts!: Table<StoredCustomFont, string>;

  constructor() {
    super('CraftPixelDB');
    this.version(1).stores({
      projects: 'id, name, updatedAt, createdAt',
      assets: 'id, name, type, createdAt',
      customFonts: 'id, name, createdAt',
    });
  }
}

export const db = new CraftPixelDatabase();

export async function saveProjectToDB(project: ProjectMetadata): Promise<void> {
  const updatedProject = {
    ...project,
    updatedAt: Date.now(),
  };

  const stored: StoredProject = {
    id: project.id,
    name: project.name,
    width: project.width,
    height: project.height,
    createdAt: project.createdAt || Date.now(),
    updatedAt: updatedProject.updatedAt,
    thumbnail: project.thumbnail,
    data: updatedProject,
  };

  await db.projects.put(stored);
}

export async function getProjectFromDB(id: string): Promise<ProjectMetadata | null> {
  const record = await db.projects.get(id);
  return record ? record.data : null;
}

export async function getAllProjectsFromDB(): Promise<StoredProject[]> {
  return await db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function deleteProjectFromDB(id: string): Promise<void> {
  await db.projects.delete(id);
}

export async function duplicateProjectInDB(id: string): Promise<ProjectMetadata | null> {
  const original = await getProjectFromDB(id);
  if (!original) return null;

  const newId = 'proj_' + Math.random().toString(36).substring(2, 9);
  const duplicated: ProjectMetadata = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveProjectToDB(duplicated);
  return duplicated;
}

export function exportProjectToJSON(project: ProjectMetadata): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_craftpixel.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importProjectFromJSONFile(file: File): Promise<ProjectMetadata> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as ProjectMetadata;
        if (!parsed.width || !parsed.height || !Array.isArray(parsed.objects)) {
          throw new Error('Invalid project file format: missing required dimensions or layers.');
        }
        // Assign new ID to avoid overwriting existing
        const newProject: ProjectMetadata = {
          ...parsed,
          id: 'proj_' + Math.random().toString(36).substring(2, 9),
          name: parsed.name ? `${parsed.name} (Imported)` : 'Imported Project',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await saveProjectToDB(newProject);
        resolve(newProject);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read project file'));
    reader.readAsText(file);
  });
}

export async function saveCustomFont(name: string, format: string, dataUrl: string): Promise<void> {
  await db.customFonts.put({
    id: 'font_' + Math.random().toString(36).substring(2, 9),
    name,
    format,
    dataUrl,
    createdAt: Date.now(),
  });
}

export async function loadAllCustomFonts(): Promise<StoredCustomFont[]> {
  const fonts = await db.customFonts.toArray();
  for (const font of fonts) {
    try {
      const fontFace = new FontFace(font.name, `url(${font.dataUrl})`);
      const loaded = await fontFace.load();
      document.fonts.add(loaded);
    } catch (e) {
      console.warn(`Could not load custom font ${font.name}:`, e);
    }
  }
  return fonts;
}
