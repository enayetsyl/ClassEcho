// Defines the shape of a Class object
export interface IClass {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Payload for creating/updating a class
export interface ICreateClass {
  name: string;
}
export interface IUpdateClass {
  name: string;
}
