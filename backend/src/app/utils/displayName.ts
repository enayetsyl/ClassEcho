export const displayName = (obj: any) =>
  obj?.name
  ?? obj?.fullName
  ?? obj?.title
  ?? (obj?.firstName && obj?.lastName ? `${obj.firstName} ${obj.lastName}` : '');
