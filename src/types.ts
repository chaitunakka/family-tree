export type FamilyMember = {
  id: string;
  fullName: string;
  photo?: string;
  birthDate?: string;
  deathDate?: string;
  biography?: string;
  gender?: 'male' | 'female' | 'other';
}

export type Relationship = {
  id: string;
  source: string; // member id
  target: string; // member id
  type: 'parent' | 'partner' | 'sibling' | 'child';
}

export type TreeData = {
  members: FamilyMember[];
  relationships: Relationship[];
}
