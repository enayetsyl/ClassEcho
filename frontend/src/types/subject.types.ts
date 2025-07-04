// Defines the shape of a Subject object
export interface ISubject {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Payload for creating/updating a subject
export interface ICreateSubject {
  name: string;
}
export interface IUpdateSubject {
  name: string;
}
