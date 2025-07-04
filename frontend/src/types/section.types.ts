// Defines the shape of a Section object
export interface ISection {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Payload for creating/updating a section
export interface ICreateSection {
  name: string;
}
export interface IUpdateSection {
  name: string;
}
